
-- MASTER FIX SCRIPT
-- 1. Adds missing columns (safe if they already exist)
-- 2. Backfills missing profile for the current user
-- 3. Updates the streak function

-- STEP 1: Add Columns if they don't exist
alter table profiles add column if not exists location text default '';
alter table profiles add column if not exists enrollment_number text;
alter table profiles add column if not exists study_streak integer default 0;
alter table profiles add column if not exists quizzes_completed integer default 0;
alter table profiles add column if not exists interests text[] default '{}';

-- STEP 2: Create Streak Function
create or replace function update_study_streak()
returns void
language plpgsql
security definer
as $$
declare
  user_last_active timestamptz;
  current_streak int;
begin
  select last_active, study_streak
  into user_last_active, current_streak
  from profiles
  where id = auth.uid();

  if not found then return; end if;

  if user_last_active is null then
    update profiles set last_active = now(), study_streak = 1 where id = auth.uid();
    return;
  end if;

  if date(user_last_active) = date(now()) then
    update profiles set last_active = now() where id = auth.uid();
  elsif date(user_last_active) = date(now() - interval '1 day') then
    update profiles set last_active = now(), study_streak = coalesce(current_streak, 0) + 1 where id = auth.uid();
  else
    update profiles set last_active = now(), study_streak = 1 where id = auth.uid();
  end if;
end;
$$;

-- STEP 3: Backfill Missing Profile (Safe Insert)
insert into public.profiles (
  id, email, full_name, role, branch, semester, institute_code, avatar_url, account_status, is_onboarded, location, study_streak, quizzes_completed, interests
)
select 
  id,
  email,
  coalesce(raw_user_meta_data->>'full_name', 'Student'),
  coalesce(raw_user_meta_data->>'role', 'student'),
  raw_user_meta_data->>'branch',
  raw_user_meta_data->>'semester',
  raw_user_meta_data->>'institute_code',
  raw_user_meta_data->>'avatar_url',
  coalesce(raw_user_meta_data->>'status', 'active'),
  (case when raw_user_meta_data->>'branch' is not null then true else false end),
  '', 0, 0, '{}'::text[]
from auth.users
where id not in (select id from public.profiles);
