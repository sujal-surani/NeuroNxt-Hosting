-- Allow users to delete their own avatars
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using ( bucket_id = 'avatars' AND auth.uid() = owner );
