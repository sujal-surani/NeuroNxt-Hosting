-- ABSOLUTE FIX FOR NOTE REFERENCES
-- The previous scripts fixed User -> Note.
-- This script fixes Note -> Like/View/Save.
-- If a User is deleted -> Note is deleted -> Like MUST be deleted (Cascade).

DO $$
DECLARE
    constraint_name text;
BEGIN
    -- 1. NOTE_LIKES (note_id -> notes)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.note_likes'::regclass AND confrelid = 'public.notes'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.note_likes DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    ALTER TABLE public.note_likes ADD CONSTRAINT note_likes_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE;

    -- 2. NOTE_VIEWS (note_id -> notes)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.note_views'::regclass AND confrelid = 'public.notes'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.note_views DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    ALTER TABLE public.note_views ADD CONSTRAINT note_views_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE;

    -- 3. NOTE_SAVES (note_id -> notes)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.note_saves'::regclass AND confrelid = 'public.notes'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.note_saves DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    ALTER TABLE public.note_saves ADD CONSTRAINT note_saves_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE;

    -- 4. NOTE_COMPLETIONS (note_id -> notes)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.note_completions'::regclass AND confrelid = 'public.notes'::regclass;
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.note_completions DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
    ALTER TABLE public.note_completions ADD CONSTRAINT note_completions_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE;

END $$;
