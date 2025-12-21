-- 1. Ensure the email column exists in profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Update the handle_new_user trigger to CORRECTLY include email
-- (This fixes the regression where a previous script removed email from the insert)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    role, 
    branch, 
    semester, 
    institute_code, 
    avatar_url, 
    account_status, 
    email -- <--- Added back
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'branch',
    new.raw_user_meta_data->>'semester',
    new.raw_user_meta_data->>'institute_code',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'status', 'pending'),
    new.email -- <--- Added back
  );
  RETURN new;
END;
$$;

-- 3. Update handle_user_update to sync email changes too
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    account_status = COALESCE(new.raw_user_meta_data->>'status', account_status),
    full_name = COALESCE(new.raw_user_meta_data->>'full_name', full_name),
    role = COALESCE(new.raw_user_meta_data->>'role', role),
    email = new.email -- <--- Sync email on update
  WHERE id = new.id;
  RETURN new;
END;
$$;

-- 4. Backfill missing emails for existing profiles
DO $$
BEGIN
  UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id AND p.email IS NULL;
END $$;
