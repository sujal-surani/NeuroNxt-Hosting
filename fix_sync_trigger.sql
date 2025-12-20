
-- FIX SYNC TRIGGER
-- The previous trigger didn't update Branch and Semester when they changed in Auth Metadata.
-- This script fixes the trigger AND forces a sync for all users right now.

-- 1. Update the Trigger Function to include branch and semester
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
    institute_code = coalesce(new.raw_user_meta_data->>'institute_code', institute_code),
    -- MISSING FIELDS ADDED HERE:
    branch = coalesce(new.raw_user_meta_data->>'branch', branch),
    semester = coalesce(new.raw_user_meta_data->>'semester', semester)
  where id = new.id;
  return new;
end;
$$;

-- 2. Force Sync: Update ALL profiles to match their Auth Metadata right now
-- This fixes the user's current "sem6" issue immediately
update public.profiles p
set 
  branch = u.raw_user_meta_data->>'branch',
  semester = u.raw_user_meta_data->>'semester'
from auth.users u
where p.id = u.id
  and (p.branch is distinct from u.raw_user_meta_data->>'branch' 
       or p.semester is distinct from u.raw_user_meta_data->>'semester');
