-- Backfill profiles for existing users
insert into public.profiles (id, full_name, role, branch, semester, institute_code, avatar_url, account_status)
select 
  id,
  raw_user_meta_data->>'full_name',
  coalesce(raw_user_meta_data->>'role', 'student'),
  raw_user_meta_data->>'branch',
  raw_user_meta_data->>'semester',
  raw_user_meta_data->>'institute_code',
  raw_user_meta_data->>'avatar_url',
  coalesce(raw_user_meta_data->>'status', 'pending')
from auth.users
where id not in (select id from public.profiles);
