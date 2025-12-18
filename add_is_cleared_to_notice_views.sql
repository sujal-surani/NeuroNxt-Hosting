-- Add is_cleared column to notice_views table
ALTER TABLE public.notice_views 
ADD COLUMN IF NOT EXISTS is_cleared boolean DEFAULT false;

-- Create Update Policy: Users can update their own views (to mark as cleared)
DROP POLICY IF EXISTS "Users can update own views" ON public.notice_views;
CREATE POLICY "Users can update own views"
ON public.notice_views FOR UPDATE
USING (
    auth.uid() = user_id
)
WITH CHECK (
    auth.uid() = user_id
);
