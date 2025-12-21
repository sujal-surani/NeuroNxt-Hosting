-- Safely add user_id column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_questions' AND column_name = 'user_id') THEN
        ALTER TABLE public.daily_questions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Drop constraints if they exist to prevent "already exists" errors
ALTER TABLE public.daily_questions DROP CONSTRAINT IF EXISTS daily_questions_date_key;
ALTER TABLE public.daily_questions DROP CONSTRAINT IF EXISTS daily_questions_user_date_key;

-- Now add the correct constraint
ALTER TABLE public.daily_questions
ADD CONSTRAINT daily_questions_user_date_key UNIQUE (user_id, date);

-- Cleanup old policies
DROP POLICY IF EXISTS "Allow authenticated read" ON public.daily_questions;
DROP POLICY IF EXISTS "Allow users to read own questions" ON public.daily_questions;

-- Create new user-specific policy
CREATE POLICY "Allow users to read own questions"
ON public.daily_questions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
