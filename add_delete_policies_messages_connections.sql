-- Policy to allow users to delete messages in conversations they are part of
-- This is needed for "Clear Chat History"
drop policy if exists "Users can delete messages in their conversations" on messages;
create policy "Users can delete messages in their conversations"
  on messages for delete
  using (
    exists (
      select 1 from conversations
      where id = messages.conversation_id
      and (participant1_id = auth.uid() or participant2_id = auth.uid())
    )
  );

-- Policy to allow users to delete connections they are part of
-- This is needed for "Disconnect"
drop policy if exists "Users can delete their own connections" on connections;
create policy "Users can delete their own connections"
  on connections for delete
  using ( requester_id = auth.uid() or recipient_id = auth.uid() );
