-- Add email column to profiles
alter table profiles add column if not exists email text;

-- Update handle_new_user function to include email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, branch, semester, institute_code, avatar_url, account_status, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'branch',
    new.raw_user_meta_data->>'semester',
    new.raw_user_meta_data->>'institute_code',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'status', 'pending'),
    new.email
  );
  return new;
end;
$$;

-- Update handle_user_update function to sync email changes
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
    role = coalesce(new.raw_user_meta_data->>'role', role),
    email = new.email
  where id = new.id;
  return new;
end;
$$;

-- Backfill email for existing profiles (requires permissions to read auth.users)
-- Note: This might fail if run from a context without access to auth.users, but usually works in Supabase SQL Editor
do $$
begin
  update profiles
  set email = users.email
  from auth.users
  where profiles.id = users.id
  and profiles.email is null;
end $$;
