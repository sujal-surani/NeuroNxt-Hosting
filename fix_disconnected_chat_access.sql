-- 1. Update Message Insert Policy to enforce active status
drop policy if exists "Users can insert messages in their conversations" on messages;
create policy "Users can insert messages in their conversations"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations c
      left join conversation_participants cp on c.id = cp.conversation_id
      where c.id = conversation_id
      and (
        c.participant1_id = auth.uid() 
        or c.participant2_id = auth.uid()
        or cp.user_id = auth.uid()
      )
      and (c.status = 'active' OR c.status IS NULL) -- Enforce active status (allow null for legacy/groups if needed, usually default is active)
    )
  );

-- 2. Update get_user_conversations to return status, disconnected_by, and pinned_by
-- This merges logic from fix_rpc_return_pinned.sql and fix_chat_features.sql
drop function if exists get_user_conversations(uuid);

create or replace function get_user_conversations(p_user_id uuid)
returns table (
  id bigint,
  is_group boolean,
  name text,
  description text,
  group_avatar text,
  created_by uuid,
  updated_at timestamp with time zone,
  last_message_id bigint,
  participant1_id uuid,
  participant2_id uuid,
  pinned_by uuid[],    -- From fix_rpc_return_pinned.sql
  status text,         -- NEW
  disconnected_by uuid,-- NEW
  participants jsonb,
  last_message jsonb,
  unread_count bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    c.id,
    c.is_group,
    c.name,
    c.description,
    c.group_avatar,
    c.created_by,
    c.updated_at,
    c.last_message_id,
    c.participant1_id,
    c.participant2_id,
    c.pinned_by,
    c.status,           -- Select new col
    c.disconnected_by,  -- Select new col
    (
      -- Get participant details
      select jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'full_name', p.full_name,
          'avatar_url', p.avatar_url,
          'role', p.role
        )
      )
      from (
        -- For 1-on-1: get the OTHER participant
        select p.* 
        from profiles p 
        where (not c.is_group and (p.id = c.participant1_id or p.id = c.participant2_id) and p.id != p_user_id)
        
        union all
        
        -- For Groups: get ALL participants
        select p.*
        from conversation_participants cp 
        join profiles p on p.id = cp.user_id
        where c.is_group and cp.conversation_id = c.id
      ) p
    ) as participants,
    (
      select to_jsonb(m.*) 
      from messages m 
      where m.id = c.last_message_id
    ) as last_message,
    (
      case 
        when c.is_group then
          (
            select count(*)
            from messages m
            where m.conversation_id = c.id
            and m.created_at > coalesce(
              (select cp.last_read_at 
               from conversation_participants cp 
               where cp.conversation_id = c.id 
               and cp.user_id = p_user_id),
              '1970-01-01'::timestamp
            )
          )
        else
          (
            select count(*) 
            from messages m 
            where m.conversation_id = c.id 
            and m.sender_id != p_user_id 
            and m.is_read = false
          )
      end
    ) as unread_count
  from conversations c
  where 
    -- 1-on-1 condition (Show even if disconnected, UI will handle readiness)
    (not c.is_group and (c.participant1_id = p_user_id or c.participant2_id = p_user_id))
    or
    -- Group condition
    (c.is_group and exists (
      select 1 from conversation_participants cp 
      where cp.conversation_id = c.id 
      and cp.user_id = p_user_id
    ))
  order by c.updated_at desc;
end;
$$;
