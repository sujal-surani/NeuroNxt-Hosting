-- Create a new storage bucket for chat attachments
insert into storage.buckets (id, name, public)
values ('chat-attachments', 'chat-attachments', true)
on conflict (id) do nothing;

-- Policy to allow public access to chat images (so they can be viewed)
create policy "Chat images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'chat-attachments' );

-- Policy to allow authenticated users to upload images
create policy "Authenticated users can upload chat images"
  on storage.objects for insert
  with check ( bucket_id = 'chat-attachments' AND auth.role() = 'authenticated' );

-- Policy to allow users to update their own uploads (optional, but good practice)
create policy "Users can update their own chat images"
  on storage.objects for update
  using ( bucket_id = 'chat-attachments' AND auth.uid() = owner )
  with check ( bucket_id = 'chat-attachments' AND auth.uid() = owner );

-- Policy to allow users to delete their own uploads
create policy "Users can delete their own chat images"
  on storage.objects for delete
  using ( bucket_id = 'chat-attachments' AND auth.uid() = owner );
