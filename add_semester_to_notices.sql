-- Add target_semester column
ALTER TABLE public.notices 
ADD COLUMN IF NOT EXISTS target_semester text CHECK (target_semester IN ('all', '1', '2', '3', '4', '5', '6'));

-- Update Select Policy to include semester filtering
DROP POLICY IF EXISTS "Notices are viewable by target audience" ON public.notices;
CREATE POLICY "Notices are viewable by target audience"
ON public.notices FOR SELECT
USING (
    institute_code = public.get_my_institute_code()
    AND (
        -- Author can always see their own notices
        author_id = auth.uid()
        OR
        -- Admins and Teachers can see all notices
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND (role = 'admin' OR role = 'institute_admin' OR role = 'teacher')
        )
        OR
        (
            (
                target_type = 'all'
                OR
                target_branch = (SELECT branch FROM public.profiles WHERE id = auth.uid())
            )
            AND (
                target_semester IS NULL 
                OR target_semester = 'all'
                OR target_semester = (SELECT semester::text FROM public.profiles WHERE id = auth.uid())
            )
        )
    )
);
