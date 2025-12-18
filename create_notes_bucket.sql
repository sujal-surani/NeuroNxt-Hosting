-- Create a new storage bucket for notes
insert into storage.buckets (id, name, public)
values ('notes', 'notes', true)
on conflict (id) do nothing;

-- Policy to allow public access to reading notes (downloading)
create policy "Notes are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'notes' );

-- Policy to allow authenticated users to upload notes
create policy "Authenticated users can upload notes"
  on storage.objects for insert
  with check ( bucket_id = 'notes' AND auth.role() = 'authenticated' );

-- Policy to allow users to delete their own notes
create policy "Users can delete their own notes"
  on storage.objects for delete
  using ( bucket_id = 'notes' AND auth.uid() = owner );
