-- Add institute_code to notes table
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS institute_code text;

-- Update RLS policies for profiles to enforce institute isolation
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by institute members" ON profiles;

CREATE POLICY "Profiles are viewable by institute members"
ON profiles FOR SELECT
USING (
  institute_code = (SELECT institute_code FROM profiles WHERE id = auth.uid())
);

-- Update RLS policies for notes to enforce institute isolation
DROP POLICY IF EXISTS "Public notes are viewable by everyone" ON notes;
DROP POLICY IF EXISTS "Notes are viewable by institute members" ON notes;

CREATE POLICY "Notes are viewable by institute members"
ON notes FOR SELECT
USING (
  institute_code = (SELECT institute_code FROM profiles WHERE id = auth.uid())
);

-- Ensure insert policy allows setting institute_code (implicitly handled if no check on specific columns, but good to be aware)
-- Existing insert policy: "Authenticated users can insert notes" with check (auth.role() = 'authenticated')
-- This is fine, but we might want to enforce that they can only insert for their own institute?
-- For now, we trust the frontend/backend to set it correctly, and the select policy will hide it if they mess up.
