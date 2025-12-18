-- Create note_likes table
create table if not exists note_likes (
  user_id uuid references auth.users(id) not null,
  note_id bigint references notes(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, note_id)
);

-- Enable RLS
alter table note_likes enable row level security;

-- Policies (Drop first to avoid conflicts)
drop policy if exists "Users can view their own likes" on note_likes;
create policy "Users can view their own likes"
  on note_likes for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own likes" on note_likes;
create policy "Users can insert their own likes"
  on note_likes for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can delete their own likes" on note_likes;
create policy "Users can delete their own likes"
  on note_likes for delete
  using ( auth.uid() = user_id );

-- Create note_views table to track unique views
create table if not exists note_views (
  user_id uuid references auth.users(id) not null,
  note_id bigint references notes(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, note_id)
);

-- Enable RLS for note_views
alter table note_views enable row level security;

drop policy if exists "Users can insert their own views" on note_views;
create policy "Users can insert their own views"
  on note_views for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can view their own view records" on note_views;
create policy "Users can view their own view records"
  on note_views for select
  using ( auth.uid() = user_id );

-- Function to increment view count (only if unique)
-- Drop existing functions to avoid parameter name conflicts
drop function if exists increment_view_count(bigint);
drop function if exists increment_view_count(bigint, uuid);

-- Correct implementation of increment_view_count with unique check
create or replace function increment_view_count(note_id bigint, p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Attempt to insert. If it fails (already exists), do nothing.
  begin
    insert into note_views (user_id, note_id) values (p_user_id, note_id);
    -- If successful, increment view count
    update notes set views = views + 1 where id = note_id;
  exception when unique_violation then
    -- Do nothing if view already exists
    return;
  end;
end;
$$;

-- Create note_saves table
create table if not exists note_saves (
  user_id uuid references auth.users(id) not null,
  note_id bigint references notes(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, note_id)
);

-- Enable RLS for note_saves
alter table note_saves enable row level security;

drop policy if exists "Users can view their own saved notes" on note_saves;
create policy "Users can view their own saved notes"
  on note_saves for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own saved notes" on note_saves;
create policy "Users can insert their own saved notes"
  on note_saves for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can delete their own saved notes" on note_saves;
create policy "Users can delete their own saved notes"
  on note_saves for delete
  using ( auth.uid() = user_id );

-- Function to handle like count updates via trigger
create or replace function handle_new_like()
returns trigger
language plpgsql
security definer
as $$
begin
  update notes
  set likes = likes + 1
  where id = new.note_id;
  return new;
end;
$$;

create or replace function handle_unlike()
returns trigger
language plpgsql
security definer
as $$
begin
  update notes
  set likes = likes - 1
  where id = old.note_id;
  return old;
end;
$$;

-- Triggers
drop trigger if exists on_like_created on note_likes;
create trigger on_like_created
  after insert on note_likes
  for each row execute procedure handle_new_like();

drop trigger if exists on_like_deleted on note_likes;
create trigger on_like_deleted
  after delete on note_likes
  for each row execute procedure handle_unlike();

-- Create note_completions table
create table if not exists note_completions (
  user_id uuid references auth.users(id) not null,
  note_id bigint references notes(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, note_id)
);

-- Enable RLS for note_completions
alter table note_completions enable row level security;

drop policy if exists "Users can view their own completed notes" on note_completions;
create policy "Users can view their own completed notes"
  on note_completions for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own completed notes" on note_completions;
create policy "Users can insert their own completed notes"
  on note_completions for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can delete their own completed notes" on note_completions;
create policy "Users can delete their own completed notes"
  on note_completions for delete
  using ( auth.uid() = user_id );
