-- Create notice_views table
CREATE TABLE IF NOT EXISTS public.notice_views (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    notice_id bigint REFERENCES public.notices(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(notice_id, user_id)
);

-- Enable RLS
ALTER TABLE public.notice_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Select Policy: Users can see their own views
DROP POLICY IF EXISTS "Users can see own views" ON public.notice_views;
CREATE POLICY "Users can see own views"
ON public.notice_views FOR SELECT
USING (
    auth.uid() = user_id
);

-- Insert Policy: Users can insert their own views
DROP POLICY IF EXISTS "Users can insert own views" ON public.notice_views;
CREATE POLICY "Users can insert own views"
ON public.notice_views FOR INSERT
WITH CHECK (
    auth.uid() = user_id
);
