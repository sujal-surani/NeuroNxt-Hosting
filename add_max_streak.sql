-- Add max_streak column to profiles table to track personal best streak
alter table profiles
add column if not exists max_streak integer default 0;

-- Backfill max_streak with current study_streak for existing users
update profiles
set max_streak = study_streak
where max_streak < study_streak;
