-- Fixes the get_or_create_conversation RPC to handle race conditions (Duplicate Key errors) gracefully.
-- Run this in your Supabase SQL Editor.

create or replace function get_or_create_conversation(target_user_id uuid)
returns bigint
language plpgsql
security definer
as $$
declare
  current_user_id uuid;
  conv_id bigint;
begin
  current_user_id := auth.uid();

  -- 1. Check for existing conversation (in either direction)
  select id into conv_id
  from conversations
  where (participant1_id = current_user_id and participant2_id = target_user_id)
     or (participant1_id = target_user_id and participant2_id = current_user_id)
  limit 1;

  if conv_id is not null then
    -- Conversation exists.
    -- Undelete/Reset status if needed
    update conversations
    set deleted_by = array_remove(deleted_by, current_user_id),
        status = 'active',
        disconnected_by = null
    where id = conv_id;
    
    return conv_id;
  end if;

  -- 2. If not found, try to insert
  begin
    insert into conversations (participant1_id, participant2_id, status)
    values (current_user_id, target_user_id, 'active')
    returning id into conv_id;
    
    return conv_id;
  exception when unique_violation then
    -- Race condition caught: conversation was created by someone else in the meantime
    select id into conv_id
    from conversations
    where (participant1_id = current_user_id and participant2_id = target_user_id)
       or (participant1_id = target_user_id and participant2_id = current_user_id)
    limit 1;
    
    -- Ensure it's active
    if conv_id is not null then
      update conversations
      set deleted_by = array_remove(deleted_by, current_user_id),
          status = 'active',
          disconnected_by = null
      where id = conv_id;
    end if;

    return conv_id;
  end;
end;
$$;
