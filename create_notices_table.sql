-- Create notices table
CREATE TABLE IF NOT EXISTS public.notices (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    type text CHECK (type IN ('exam', 'holiday', 'urgent', 'general')) DEFAULT 'general',
    priority text CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name text,
    institute_code text NOT NULL,
    target_type text CHECK (target_type IN ('all', 'branch')) DEFAULT 'all',
    target_branch text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Select Policy: Users can see notices from their institute AND (target is all OR target matches their branch)
DROP POLICY IF EXISTS "Notices are viewable by target audience" ON public.notices;
CREATE POLICY "Notices are viewable by target audience"
ON public.notices FOR SELECT
USING (
    institute_code = public.get_my_institute_code()
    AND (
        target_type = 'all'
        OR
        target_branch = (SELECT branch FROM public.profiles WHERE id = auth.uid())
    )
);

-- Insert Policy: Teachers and Admins can insert notices for their institute
DROP POLICY IF EXISTS "Teachers and Admins can insert notices" ON public.notices;
CREATE POLICY "Teachers and Admins can insert notices"
ON public.notices FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated'
    AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND (role = 'teacher' OR role = 'admin' OR role = 'institute_admin')
        AND institute_code = public.notices.institute_code
    )
);

-- Delete Policy: Authors can delete their own notices
DROP POLICY IF EXISTS "Authors can delete own notices" ON public.notices;
CREATE POLICY "Authors can delete own notices"
ON public.notices FOR DELETE
USING (
    auth.uid() = author_id
);
