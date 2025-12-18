-- Update foreign keys to cascade delete when a user is deleted

-- 1. Update notes table (author_id)
ALTER TABLE notes
DROP CONSTRAINT IF EXISTS notes_author_id_fkey;

ALTER TABLE notes
ADD CONSTRAINT notes_author_id_fkey
FOREIGN KEY (author_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 2. Update note_likes table (user_id)
ALTER TABLE note_likes
DROP CONSTRAINT IF EXISTS note_likes_user_id_fkey;

ALTER TABLE note_likes
ADD CONSTRAINT note_likes_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 3. Update note_views table (user_id)
ALTER TABLE note_views
DROP CONSTRAINT IF EXISTS note_views_user_id_fkey;

ALTER TABLE note_views
ADD CONSTRAINT note_views_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 4. Update note_saves table (user_id)
ALTER TABLE note_saves
DROP CONSTRAINT IF EXISTS note_saves_user_id_fkey;

ALTER TABLE note_saves
ADD CONSTRAINT note_saves_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 5. Update note_completions table (user_id)
ALTER TABLE note_completions
DROP CONSTRAINT IF EXISTS note_completions_user_id_fkey;

ALTER TABLE note_completions
ADD CONSTRAINT note_completions_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
