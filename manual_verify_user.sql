-- Manually verify a user by email
-- Replace 'your_email@example.com' with the actual email you used to sign up

UPDATE auth.users
SET email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'YOUR_EMAIL_HERE'; -- <--- CHANGE THIS

-- Also ensure the profile status is active
UPDATE public.profiles
SET account_status = 'active'
WHERE email = 'YOUR_EMAIL_HERE'; -- <--- CHANGE THIS
