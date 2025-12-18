-- UPDATE RPC TO RETURN PINNED_BY
-- The previous get_user_conversations RPC did not return the pinned_by array.
-- This caused the frontend to lose pin status on refresh.

-- DROP FUNCTION FIRST because we are changing the return type (adding pinned_by column)
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
  pinned_by uuid[], -- Added pinned_by
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
    c.pinned_by, -- Select pinned_by
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
        
        -- For Groups: get ALL participants (including self, or just others? let's get others + self is fine, UI handles it)
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
      select count(*) 
      from messages m 
      where m.conversation_id = c.id 
      and m.sender_id != p_user_id 
      and m.is_read = false
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
