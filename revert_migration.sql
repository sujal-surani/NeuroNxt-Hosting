-- Drop the activity_logs table
DROP TABLE IF EXISTS public.activity_logs;

-- Note: We are NOT removing the records added to 'public.institutes'
-- because those fixes are useful for the main "Pause/Resume" feature.
