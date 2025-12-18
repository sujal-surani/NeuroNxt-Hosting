-- Add missing columns to profiles table for Social and Profile features

alter table profiles 
add column if not exists location text,
add column if not exists enrollment_number text,
add column if not exists study_streak integer default 0,
add column if not exists quizzes_completed integer default 0,
add column if not exists interests text[] default '{}';

-- Update handle_new_user to include these if passed in metadata (optional)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id, 
    full_name, 
    role, 
    branch, 
    semester, 
    institute_code, 
    avatar_url, 
    account_status, 
    email,
    location,
    enrollment_number
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'branch',
    new.raw_user_meta_data->>'semester',
    new.raw_user_meta_data->>'institute_code',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'status', 'pending'),
    new.email,
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'enrollment_number'
  );
  return new;
end;
$$;
