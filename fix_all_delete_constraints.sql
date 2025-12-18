-- COMPREHENSIVE FIX FOR USER DELETION
-- This script drops and re-creates foreign keys for ALL tables referencing auth.users
-- to ensure ON DELETE CASCADE is properly applied.

-- 1. NOTES TABLE
-- Try to drop common constraint names
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_author_id_fkey;
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_user_id_fkey; -- Just in case

-- Add correct constraint
ALTER TABLE notes
ADD CONSTRAINT notes_author_id_fkey
FOREIGN KEY (author_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;


-- 2. NOTE_LIKES TABLE
ALTER TABLE note_likes DROP CONSTRAINT IF EXISTS note_likes_user_id_fkey;
ALTER TABLE note_likes DROP CONSTRAINT IF EXISTS note_likes_user_id_fkey_1; -- Potential duplicate

ALTER TABLE note_likes
ADD CONSTRAINT note_likes_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;


-- 3. NOTE_VIEWS TABLE
ALTER TABLE note_views DROP CONSTRAINT IF EXISTS note_views_user_id_fkey;

ALTER TABLE note_views
ADD CONSTRAINT note_views_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;


-- 4. NOTE_SAVES TABLE
ALTER TABLE note_saves DROP CONSTRAINT IF EXISTS note_saves_user_id_fkey;

ALTER TABLE note_saves
ADD CONSTRAINT note_saves_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;


-- 5. NOTE_COMPLETIONS TABLE
ALTER TABLE note_completions DROP CONSTRAINT IF EXISTS note_completions_user_id_fkey;

ALTER TABLE note_completions
ADD CONSTRAINT note_completions_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;


-- 6. PROFILES TABLE (Should already be correct, but reinforcing)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 7. CONNECTIONS TABLE (References profiles, not auth.users directly, but good to check)
-- These should cascade delete when profile is deleted
ALTER TABLE connections DROP CONSTRAINT IF EXISTS connections_requester_id_fkey;
ALTER TABLE connections DROP CONSTRAINT IF EXISTS connections_recipient_id_fkey;

ALTER TABLE connections
ADD CONSTRAINT connections_requester_id_fkey
FOREIGN KEY (requester_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

ALTER TABLE connections
ADD CONSTRAINT connections_recipient_id_fkey
FOREIGN KEY (recipient_id)
REFERENCES profiles(id)
ON DELETE CASCADE;
