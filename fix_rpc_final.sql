-- FIX RPC: Combine PINNED_BY and GROUP UNREAD LOGIC
-- Previous scripts either had pinned_by OR the correct group unread logic. This script combines them.

-- 1. Ensure last_read_at column exists ( idempotent)
alter table conversation_participants 
add column if not exists last_read_at timestamp with time zone default now();

-- 2. Ensure mark_conversation_as_read uses last_read_at for groups
create or replace function mark_conversation_as_read(p_conversation_id bigint)
returns void
language plpgsql
security definer
as $$
declare
  is_group_chat boolean;
begin
  -- Check if group
  select is_group into is_group_chat from conversations where id = p_conversation_id;

  if is_group_chat then
    -- For Groups: Update timestamp in participants table
    update conversation_participants
    set last_read_at = now()
    where conversation_id = p_conversation_id
    and user_id = auth.uid();
  else
    -- For 1-on-1: Update messages table (legacy support)
    update messages
    set is_read = true
    where conversation_id = p_conversation_id
    and sender_id != auth.uid()
    and is_read = false;
  end if;
end;
$$;

-- 3. Update get_user_conversations to return pinned_by AND use last_read_at for counts
DROP FUNCTION IF EXISTS get_user_conversations(uuid);

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
  pinned_by uuid[], -- Include pinned_by
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
            -- Group Unread Logic: Count messages created after last_read_at
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
            -- 1-on-1 Unread Logic: Count unread messages not from self
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
    -- 1-on-1 condition
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
