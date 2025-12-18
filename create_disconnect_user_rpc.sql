-- Function to disconnect a user: deletes connection and conversation
create or replace function disconnect_user(target_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  current_user_id uuid := auth.uid();
begin
  -- Delete connection
  delete from connections
  where (requester_id = current_user_id and recipient_id = target_user_id)
     or (requester_id = target_user_id and recipient_id = current_user_id);

  -- Delete conversation
  delete from conversations
  where (participant1_id = current_user_id and participant2_id = target_user_id)
     or (participant1_id = target_user_id and participant2_id = current_user_id);
end;
$$;
