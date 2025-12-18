-- Fix RLS recursion by using a security definer function
CREATE OR REPLACE FUNCTION public.get_my_institute_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT institute_code FROM profiles WHERE id = auth.uid());
END;
$$;

-- Update profiles policy
DROP POLICY IF EXISTS "Profiles are viewable by institute members" ON profiles;

CREATE POLICY "Profiles are viewable by institute members"
ON profiles FOR SELECT
USING (
  institute_code = get_my_institute_code()
);

-- Update notes policy (optional, but good for consistency/performance)
DROP POLICY IF EXISTS "Notes are viewable by institute members" ON notes;

CREATE POLICY "Notes are viewable by institute members"
ON notes FOR SELECT
USING (
  institute_code = get_my_institute_code()
);
