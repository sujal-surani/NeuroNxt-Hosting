-- Create a table to store daily questions
CREATE TABLE IF NOT EXISTS public.daily_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings ["Option A", "Option B", ...]
    correct_index INTEGER NOT NULL, -- 0-3
    fact TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.daily_questions ENABLE ROW LEVEL SECURITY;

-- Allow public read access (authenticated users)
CREATE POLICY "Allow authenticated read"
ON public.daily_questions
FOR SELECT
TO authenticated
USING (true);

-- Allow service role (server-side) full access
-- (Implicitly allowed for service role, but good documentation)

-- Add an index on date for fast lookups
CREATE INDEX IF NOT EXISTS daily_questions_date_idx ON public.daily_questions (date);
