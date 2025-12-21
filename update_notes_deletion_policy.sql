-- Change foreign key constraint on notes table to prevent cascade deletion
-- This ensures notes remain even if the author is deleted (author_id becomes NULL)

-- 1. Check and drop existing constraint
ALTER TABLE notes
DROP CONSTRAINT IF EXISTS notes_author_id_fkey;

-- 2. Add new constraint with SET NULL
ALTER TABLE notes
ADD CONSTRAINT notes_author_id_fkey
FOREIGN KEY (author_id)
REFERENCES auth.users(id)
ON DELETE SET NULL;

-- 3. Verify other tables (likes, views, etc.) still cascade delete when the NOTE is deleted
-- (This was set up in fix_all_delete_constraints.sql and should remain as is)
-- We only want to stop the USER -> NOTES cascade.
