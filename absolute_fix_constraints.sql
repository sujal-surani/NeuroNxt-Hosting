<<<<<<< HEAD
-- ABSOLUTE FIX FOR DELETE CONSTRAINTS
-- This script uses the system catalog pg_constraint to find and replace constraints.
-- It is the most reliable way to ensure ON DELETE CASCADE is applied.

DO $$
DECLARE
    constraint_name text;
BEGIN
    -- 1. NOTES (author_id -> auth.users)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.notes'::regclass AND confrelid = 'auth.users'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.notes DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    ALTER TABLE public.notes ADD CONSTRAINT notes_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- 2. NOTE_LIKES (user_id -> auth.users)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.note_likes'::regclass AND confrelid = 'auth.users'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.note_likes DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    ALTER TABLE public.note_likes ADD CONSTRAINT note_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- 3. NOTE_VIEWS (user_id -> auth.users)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.note_views'::regclass AND confrelid = 'auth.users'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.note_views DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    ALTER TABLE public.note_views ADD CONSTRAINT note_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- 4. NOTE_SAVES (user_id -> auth.users)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.note_saves'::regclass AND confrelid = 'auth.users'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.note_saves DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    ALTER TABLE public.note_saves ADD CONSTRAINT note_saves_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- 5. NOTE_COMPLETIONS (user_id -> auth.users)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.note_completions'::regclass AND confrelid = 'auth.users'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.note_completions DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    ALTER TABLE public.note_completions ADD CONSTRAINT note_completions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- 6. PROFILES (id -> auth.users)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.profiles'::regclass AND confrelid = 'auth.users'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

END $$;
=======
-- ABSOLUTE FIX FOR DELETE CONSTRAINTS
-- This script uses the system catalog pg_constraint to find and replace constraints.
-- It is the most reliable way to ensure ON DELETE CASCADE is applied.

DO $$
DECLARE
    constraint_name text;
BEGIN
    -- 1. NOTES (author_id -> auth.users)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.notes'::regclass AND confrelid = 'auth.users'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.notes DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    ALTER TABLE public.notes ADD CONSTRAINT notes_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- 2. NOTE_LIKES (user_id -> auth.users)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.note_likes'::regclass AND confrelid = 'auth.users'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.note_likes DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    ALTER TABLE public.note_likes ADD CONSTRAINT note_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- 3. NOTE_VIEWS (user_id -> auth.users)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.note_views'::regclass AND confrelid = 'auth.users'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.note_views DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    ALTER TABLE public.note_views ADD CONSTRAINT note_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- 4. NOTE_SAVES (user_id -> auth.users)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.note_saves'::regclass AND confrelid = 'auth.users'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.note_saves DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    ALTER TABLE public.note_saves ADD CONSTRAINT note_saves_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- 5. NOTE_COMPLETIONS (user_id -> auth.users)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.note_completions'::regclass AND confrelid = 'auth.users'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.note_completions DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    ALTER TABLE public.note_completions ADD CONSTRAINT note_completions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- 6. PROFILES (id -> auth.users)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.profiles'::regclass AND confrelid = 'auth.users'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

END $$;
>>>>>>> 8c01869 (Chat Page 99% Completed)
