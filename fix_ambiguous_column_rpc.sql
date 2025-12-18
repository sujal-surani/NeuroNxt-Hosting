-- Fix ambiguous column reference by renaming parameter to p_conversation_id
-- We must DROP the functions first because changing parameter names changes the signature in a way that CREATE OR REPLACE doesn't handle if the type is the same but name is different (or Postgres is strict about it).

-- Drop existing functions
drop function if exists delete_conversation_for_user(bigint);
drop function if exists clear_chat_for_user(bigint);
drop function if exists undelete_conversation(bigint);

-- RPC to delete conversation for a user
create or replace function delete_conversation_for_user(p_conversation_id bigint)
returns void
language plpgsql
security definer
as $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();
  
  -- Mark conversation as deleted for user
  update conversations
  set deleted_by = array_append(deleted_by, current_user_id)
  where id = p_conversation_id
  and not (deleted_by @> array[current_user_id]);

  -- Mark all current messages as deleted for user
  update messages
  set deleted_by = array_append(deleted_by, current_user_id)
  where conversation_id = p_conversation_id
  and not (deleted_by @> array[current_user_id]);
end;
$$;

-- RPC to clear chat history for a user
create or replace function clear_chat_for_user(p_conversation_id bigint)
returns void
language plpgsql
security definer
as $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  -- Mark all current messages as deleted for user
  update messages
  set deleted_by = array_append(deleted_by, current_user_id)
  where conversation_id = p_conversation_id
  and not (deleted_by @> array[current_user_id]);
end;
$$;

-- RPC to undelete conversation (when sending message)
create or replace function undelete_conversation(p_conversation_id bigint)
returns void
language plpgsql
security definer
as $$
begin
  -- Reset deleted_by to empty array
  update conversations
  set deleted_by = '{}'
  where id = p_conversation_id;
end;
$$;
