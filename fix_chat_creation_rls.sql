-- RPC to get or create a conversation securely (bypassing RLS for the check)
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

  -- Check for existing conversation (in either direction)
  select id into conv_id
  from conversations
  where (participant1_id = current_user_id and participant2_id = target_user_id)
     or (participant1_id = target_user_id and participant2_id = current_user_id)
  limit 1;

  if conv_id is not null then
    -- Conversation exists. 
    -- 1. Undelete for current user if needed.
    -- 2. Reset status to active if it was disconnected.
    -- 3. Clear disconnected_by.
    update conversations
    set deleted_by = array_remove(deleted_by, current_user_id),
        status = 'active',
        disconnected_by = null
    where id = conv_id;
    
    return conv_id;
  else
    -- Create new conversation
    insert into conversations (participant1_id, participant2_id, status)
    values (current_user_id, target_user_id, 'active')
    returning id into conv_id;
    
    return conv_id;
  end if;
end;
$$;
