<<<<<<< HEAD
-- Enable CASCADE DELETE for note interactions
-- This allows deleting a note to automatically delete all its views, likes, saves, and completions

-- 1. Update note_views
ALTER TABLE note_views
DROP CONSTRAINT IF EXISTS note_views_note_id_fkey;

ALTER TABLE note_views
ADD CONSTRAINT note_views_note_id_fkey
FOREIGN KEY (note_id)
REFERENCES notes(id)
ON DELETE CASCADE;

-- 2. Update note_likes
ALTER TABLE note_likes
DROP CONSTRAINT IF EXISTS note_likes_note_id_fkey;

ALTER TABLE note_likes
ADD CONSTRAINT note_likes_note_id_fkey
FOREIGN KEY (note_id)
REFERENCES notes(id)
ON DELETE CASCADE;

-- 3. Update note_saves
ALTER TABLE note_saves
DROP CONSTRAINT IF EXISTS note_saves_note_id_fkey;

ALTER TABLE note_saves
ADD CONSTRAINT note_saves_note_id_fkey
FOREIGN KEY (note_id)
REFERENCES notes(id)
ON DELETE CASCADE;

-- 4. Update note_completions
ALTER TABLE note_completions
DROP CONSTRAINT IF EXISTS note_completions_note_id_fkey;

ALTER TABLE note_completions
ADD CONSTRAINT note_completions_note_id_fkey
FOREIGN KEY (note_id)
REFERENCES notes(id)
ON DELETE CASCADE;
=======
-- Enable CASCADE DELETE for note interactions
-- This allows deleting a note to automatically delete all its views, likes, saves, and completions

-- 1. Update note_views
ALTER TABLE note_views
DROP CONSTRAINT IF EXISTS note_views_note_id_fkey;

ALTER TABLE note_views
ADD CONSTRAINT note_views_note_id_fkey
FOREIGN KEY (note_id)
REFERENCES notes(id)
ON DELETE CASCADE;

-- 2. Update note_likes
ALTER TABLE note_likes
DROP CONSTRAINT IF EXISTS note_likes_note_id_fkey;

ALTER TABLE note_likes
ADD CONSTRAINT note_likes_note_id_fkey
FOREIGN KEY (note_id)
REFERENCES notes(id)
ON DELETE CASCADE;

-- 3. Update note_saves
ALTER TABLE note_saves
DROP CONSTRAINT IF EXISTS note_saves_note_id_fkey;

ALTER TABLE note_saves
ADD CONSTRAINT note_saves_note_id_fkey
FOREIGN KEY (note_id)
REFERENCES notes(id)
ON DELETE CASCADE;

-- 4. Update note_completions
ALTER TABLE note_completions
DROP CONSTRAINT IF EXISTS note_completions_note_id_fkey;

ALTER TABLE note_completions
ADD CONSTRAINT note_completions_note_id_fkey
FOREIGN KEY (note_id)
REFERENCES notes(id)
ON DELETE CASCADE;
>>>>>>> 8c01869 (Chat Page 99% Completed)
