-- Allow users to update conversations they are part of (e.g. updating last_message_id)
create policy "Users can update their own conversations"
  on conversations for update
  using ( auth.uid() = participant1_id or auth.uid() = participant2_id )
  with check ( auth.uid() = participant1_id or auth.uid() = participant2_id );
