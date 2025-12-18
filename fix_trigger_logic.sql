-- FIX TRIGGER LOGIC
-- The 'handle_unlike' trigger tries to update the 'notes' table when a like is deleted.
-- But during a CASCADE DELETE, the note might already be gone!
-- This causes the "Database error" because the trigger fails.

CREATE OR REPLACE FUNCTION handle_unlike()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only update the note if it still exists!
  IF EXISTS (SELECT 1 FROM notes WHERE id = old.note_id) THEN
    UPDATE notes
    SET likes = likes - 1
    WHERE id = old.note_id;
  END IF;
  
  RETURN old;
END;
$$;
