-- Create a new storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Policy to allow public access to avatars
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Policy to allow authenticated users to upload avatars
create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- Policy to allow users to update their own avatar
create policy "Users can update their own avatar"
  on storage.objects for update
  using ( bucket_id = 'avatars' AND auth.uid() = owner )
  with check ( bucket_id = 'avatars' AND auth.uid() = owner );

-- Policy to allow users to delete their own avatar
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using ( bucket_id = 'avatars' AND auth.uid() = owner );
