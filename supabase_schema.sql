<<<<<<< HEAD
-- Create the notes table
create table if not exists notes (
  id bigint primary key generated always as identity,
  title text not null,
  description text,
  subject text,
  branch text,
  semester integer,
  difficulty text,
  type text,
  content text,
  file_url text,
  file_name text,
  file_size text,
  author_id uuid references auth.users(id),
  author_name text,
  author_avatar text,
  tags text[],
  views integer default 0,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table notes enable row level security;

-- Create policies
create policy "Public notes are viewable by everyone"
  on notes for select
  using ( true );

create policy "Authenticated users can insert notes"
  on notes for insert
  with check ( auth.role() = 'authenticated' );

-- Optional: Policy for updating/deleting own notes
create policy "Users can update own notes"
  on notes for update
  using ( auth.uid() = author_id );

create policy "Users can delete own notes"
  on notes for delete
  using ( auth.uid() = author_id );
=======
-- Create the notes table
create table if not exists notes (
  id bigint primary key generated always as identity,
  title text not null,
  description text,
  subject text,
  branch text,
  semester integer,
  difficulty text,
  type text,
  content text,
  file_url text,
  file_name text,
  file_size text,
  author_id uuid references auth.users(id),
  author_name text,
  author_avatar text,
  tags text[],
  views integer default 0,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table notes enable row level security;

-- Create policies
create policy "Public notes are viewable by everyone"
  on notes for select
  using ( true );

create policy "Authenticated users can insert notes"
  on notes for insert
  with check ( auth.role() = 'authenticated' );

-- Optional: Policy for updating/deleting own notes
create policy "Users can update own notes"
  on notes for update
  using ( auth.uid() = author_id );

create policy "Users can delete own notes"
  on notes for delete
  using ( auth.uid() = author_id );
>>>>>>> 8c01869 (Chat Page 99% Completed)
