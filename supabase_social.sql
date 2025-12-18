<<<<<<< HEAD
-- Create profiles table to mirror auth.users for public access
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  role text check (role in ('student', 'teacher', 'admin', 'super_admin', 'institute_admin')),
  branch text,
  semester text,
  institute_code text,
  status text default 'offline', -- online/offline status
  account_status text default 'pending', -- active/pending status from admin approval
  last_active timestamp with time zone default timezone('utc'::text, now()),
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table profiles enable row level security;

-- Profiles policies
drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Create connections table for friend requests
create table if not exists connections (
  id bigint primary key generated always as identity,
  requester_id uuid references profiles(id) on delete cascade not null,
  recipient_id uuid references profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(requester_id, recipient_id)
);

-- Enable RLS for connections
alter table connections enable row level security;

-- Connections policies
drop policy if exists "Users can view their own connections" on connections;
create policy "Users can view their own connections"
  on connections for select
  using ( auth.uid() = requester_id or auth.uid() = recipient_id );

drop policy if exists "Users can send connection requests" on connections;
create policy "Users can send connection requests"
  on connections for insert
  with check ( auth.uid() = requester_id AND status = 'pending' );

drop policy if exists "Users can update their own received requests" on connections;
create policy "Users can update their own received requests"
  on connections for update
  using ( auth.uid() = recipient_id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, branch, semester, institute_code, avatar_url, account_status)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'branch',
    new.raw_user_meta_data->>'semester',
    new.raw_user_meta_data->>'institute_code',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'status', 'pending')
  );
  return new;
end;
$$;

-- Trigger to automatically create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to sync profile status when auth.users metadata changes (e.g. admin approves user)
create or replace function public.handle_user_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
  set 
    account_status = coalesce(new.raw_user_meta_data->>'status', account_status),
    full_name = coalesce(new.raw_user_meta_data->>'full_name', full_name),
    role = coalesce(new.raw_user_meta_data->>'role', role)
  where id = new.id;
  return new;
end;
$$;

-- Trigger to sync updates
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_user_update();

-- Enable Realtime for these tables
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table connections;
=======
-- Create profiles table to mirror auth.users for public access
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  role text check (role in ('student', 'teacher', 'admin', 'super_admin', 'institute_admin')),
  branch text,
  semester text,
  institute_code text,
  status text default 'offline', -- online/offline status
  account_status text default 'pending', -- active/pending status from admin approval
  last_active timestamp with time zone default timezone('utc'::text, now()),
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table profiles enable row level security;

-- Profiles policies
drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Create connections table for friend requests
create table if not exists connections (
  id bigint primary key generated always as identity,
  requester_id uuid references profiles(id) on delete cascade not null,
  recipient_id uuid references profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(requester_id, recipient_id)
);

-- Enable RLS for connections
alter table connections enable row level security;

-- Connections policies
drop policy if exists "Users can view their own connections" on connections;
create policy "Users can view their own connections"
  on connections for select
  using ( auth.uid() = requester_id or auth.uid() = recipient_id );

drop policy if exists "Users can send connection requests" on connections;
create policy "Users can send connection requests"
  on connections for insert
  with check ( auth.uid() = requester_id AND status = 'pending' );

drop policy if exists "Users can update their own received requests" on connections;
create policy "Users can update their own received requests"
  on connections for update
  using ( auth.uid() = recipient_id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, branch, semester, institute_code, avatar_url, account_status)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'branch',
    new.raw_user_meta_data->>'semester',
    new.raw_user_meta_data->>'institute_code',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'status', 'pending')
  );
  return new;
end;
$$;

-- Trigger to automatically create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to sync profile status when auth.users metadata changes (e.g. admin approves user)
create or replace function public.handle_user_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
  set 
    account_status = coalesce(new.raw_user_meta_data->>'status', account_status),
    full_name = coalesce(new.raw_user_meta_data->>'full_name', full_name),
    role = coalesce(new.raw_user_meta_data->>'role', role)
  where id = new.id;
  return new;
end;
$$;

-- Trigger to sync updates
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_user_update();

-- Enable Realtime for these tables
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table connections;
>>>>>>> 8c01869 (Chat Page 99% Completed)
