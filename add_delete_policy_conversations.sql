-- Allow users to delete their own conversations
drop policy if exists "Users can delete their own conversations" on conversations;
create policy "Users can delete their own conversations"
  on conversations for delete
  using ( auth.uid() = participant1_id or auth.uid() = participant2_id );
