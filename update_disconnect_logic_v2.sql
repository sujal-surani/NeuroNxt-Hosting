-- Improved disconnect_user function to handle duplicate conversations
-- and ensure thorough cleanup.

create or replace function disconnect_user(target_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  current_user_id uuid := auth.uid();
begin
  -- 1. Delete connection (Hard delete so they can connect again later if they want)
  delete from connections
  where (requester_id = current_user_id and recipient_id = target_user_id)
     or (requester_id = target_user_id and recipient_id = current_user_id);

  -- 2. Handle Conversations
  -- Instead of finding just one, we loop through all matching 1-on-1 conversations
  -- This fixes the issue where duplicate conversations might exist and only one gets disconnected.
  
  -- Update status to 'disconnected' and set disconnected_by
  update conversations
  set status = 'disconnected',
      disconnected_by = current_user_id,
      updated_at = now()
  where 
    (not is_group) -- Only 1-on-1
    AND
    (
      (participant1_id = current_user_id and participant2_id = target_user_id)
      or 
      (participant1_id = target_user_id and participant2_id = current_user_id)
    );

  -- 3. Delete messages for these conversations
  delete from messages
  where conversation_id in (
    select id from conversations
    where 
      (not is_group)
      AND
      (
        (participant1_id = current_user_id and participant2_id = target_user_id)
        or 
        (participant1_id = target_user_id and participant2_id = current_user_id)
      )
  );

end;
$$;
