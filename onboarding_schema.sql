-- Add new columns for onboarding
alter table profiles add column if not exists location text;
alter table profiles add column if not exists visibility text check (visibility in ('institute', 'classmates')) default 'institute';
alter table profiles add column if not exists is_onboarded boolean default false;

-- Update handle_new_user to include defaults
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, branch, semester, institute_code, avatar_url, account_status, email, location, visibility, is_onboarded)
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
    '', -- location
    'institute', -- visibility
    false -- is_onboarded
  );
  return new;
end;
$$;

-- Allow users to update their own onboarding fields
create policy "Users can update their own onboarding info"
  on profiles for update
  using ( auth.uid() = id )
  with check ( auth.uid() = id );
