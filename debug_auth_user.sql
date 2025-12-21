-- Show the 5 most recently created users
SELECT id, email, created_at, email_confirmed_at, raw_user_meta_data 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Instructions:
-- 1. Identify your new user in the list above.
-- 2. If 'email_confirmed_at' is NULL, run the command below with their Email:

/*
UPDATE auth.users
SET email_confirmed_at = now(), updated_at = now()
WHERE email = 'PASTE_EMAIL_HERE';
*/
