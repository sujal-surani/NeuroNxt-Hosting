-- Add deleted_by column to conversations
alter table conversations add column if not exists deleted_by uuid[] default '{}';

-- Add deleted_by column to messages
alter table messages add column if not exists deleted_by uuid[] default '{}';

-- Update RLS policies for conversations
drop policy if exists "Users can view their own conversations" on conversations;
create policy "Users can view their own conversations"
  on conversations for select
  using (
    (auth.uid() = participant1_id or auth.uid() = participant2_id)
    and not (deleted_by @> array[auth.uid()])
  );

-- Update RLS policies for messages
drop policy if exists "Users can view messages in their conversations" on messages;
create policy "Users can view messages in their conversations"
  on messages for select
  using (
    exists (
      select 1 from conversations
      where id = messages.conversation_id
      and (participant1_id = auth.uid() or participant2_id = auth.uid())
    )
    and not (deleted_by @> array[auth.uid()])
  );

-- RPC to delete conversation for a user
create or replace function delete_conversation_for_user(conversation_id bigint)
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
  where id = conversation_id
  and not (deleted_by @> array[current_user_id]);

  -- Mark all current messages as deleted for user
  update messages
  set deleted_by = array_append(deleted_by, current_user_id)
  where conversation_id = delete_conversation_for_user.conversation_id
  and not (deleted_by @> array[current_user_id]);
end;
$$;

-- RPC to clear chat history for a user
create or replace function clear_chat_for_user(conversation_id bigint)
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
  where conversation_id = clear_chat_for_user.conversation_id
  and not (deleted_by @> array[current_user_id]);
end;
$$;

-- RPC to undelete conversation (when sending message)
create or replace function undelete_conversation(conversation_id bigint)
returns void
language plpgsql
security definer
as $$
begin
  -- Reset deleted_by to empty array (or remove specific users if we want to be granular, but resetting is safer for 1-on-1 to ensure visibility)
  -- Actually, let's just reset it. If I send a message, I want everyone to see the conversation exists.
  update conversations
  set deleted_by = '{}'
  where id = conversation_id;
end;
$$;
