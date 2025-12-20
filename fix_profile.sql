
-- Fix missing profiles by backfilling from auth.users
-- This ensures that every authenticated user has a corresponding row in the public.profiles table
-- It handles the new columns added recently (location, stats, etc.)

insert into public.profiles (
  id,
  email,
  full_name,
  role,
  branch,
  semester,
  institute_code,
  avatar_url,
  account_status,
  is_onboarded,
  location,
  study_streak,
  quizzes_completed,
  interests
)
select 
  id,
  email,
  coalesce(raw_user_meta_data->>'full_name', 'Student'),
  coalesce(raw_user_meta_data->>'role', 'student'),
  coalesce(raw_user_meta_data->>'branch', 'Computer Technology'), -- Default or null? Let's provide a safe fallback or leave null? 
  -- Actually, if we default to something valid, it might hide the issue. But 'Computer Technology' is the user's likely branch.
  -- Let's use metadata or null.
  raw_user_meta_data->>'branch',
  
  -- Handle semester as text (if metadata has it)
  raw_user_meta_data->>'semester',
  
  raw_user_meta_data->>'institute_code',
  raw_user_meta_data->>'avatar_url',
  coalesce(raw_user_meta_data->>'status', 'active'),
  
  -- If branch/sem exist in metadata, mark as onboarded, else false
  case 
    when raw_user_meta_data->>'branch' is not null and raw_user_meta_data->>'semester' is not null then true 
    else false 
  end,
  
  '', -- location
  0, -- study_streak
  0, -- quizzes_completed
  '{}'::text[] -- interests
from auth.users
where id not in (select id from public.profiles);
