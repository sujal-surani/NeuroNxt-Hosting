-- Sync Profiles with Auth Metadata and Fix Triggers

-- 1. Force Sync: Update profiles to match auth.users metadata
-- This fixes existing users like Student3 who might be desynced
update public.profiles p
set 
  account_status = coalesce(u.raw_user_meta_data->>'status', 'pending'),
  institute_code = u.raw_user_meta_data->>'institute_code',
  role = coalesce(u.raw_user_meta_data->>'role', 'student'),
  full_name = u.raw_user_meta_data->>'full_name'
from auth.users u
where p.id = u.id;

-- 2. Redefine the trigger function to ensure it's correct for future users
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
    coalesce(new.raw_user_meta_data->>'status', 'pending') -- Ensure we capture status
  );
  return new;
end;
$$;

-- 3. Redefine update trigger to ensure status changes invoke profile updates
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
    institute_code = coalesce(new.raw_user_meta_data->>'institute_code', institute_code)
  where id = new.id;
  return new;
end;
$$;

-- Ensure triggers are bound (idempotent)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_user_update();
