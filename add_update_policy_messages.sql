-- Allow users to update messages (e.g., mark as read) in their conversations
drop policy if exists "Users can update messages in their conversations" on messages;
create policy "Users can update messages in their conversations"
  on messages for update
  using (
    exists (
      select 1 from conversations
      where id = messages.conversation_id
      and (participant1_id = auth.uid() or participant2_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from conversations
      where id = conversation_id
      and (participant1_id = auth.uid() or participant2_id = auth.uid())
    )
  );
