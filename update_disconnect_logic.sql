-- Add status and disconnected_by columns to conversations table
alter table conversations add column if not exists status text default 'active';
alter table conversations add column if not exists disconnected_by uuid references profiles(id);

-- Update disconnect_user function to soft delete conversation
create or replace function disconnect_user(target_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  current_user_id uuid := auth.uid();
  conv_id bigint;
begin
  -- Delete connection (Hard delete so they can connect again later if they want)
  delete from connections
  where (requester_id = current_user_id and recipient_id = target_user_id)
     or (requester_id = target_user_id and recipient_id = current_user_id);

  -- Find conversation
  select id into conv_id from conversations
  where (participant1_id = current_user_id and participant2_id = target_user_id)
     or (participant1_id = target_user_id and participant2_id = current_user_id);

  if conv_id is not null then
    -- Delete messages
    delete from messages where conversation_id = conv_id;

    -- Update conversation status
    update conversations
    set status = 'disconnected',
        disconnected_by = current_user_id,
        updated_at = now() -- Update timestamp so it moves to top? Or maybe not.
    where id = conv_id;
  end if;
end;
$$;
