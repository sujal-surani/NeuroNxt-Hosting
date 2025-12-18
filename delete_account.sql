-- Function to allow users to delete their own account
CREATE OR REPLACE FUNCTION delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the user is logged in
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the user from auth.users
  -- This will trigger cascading deletes for all tables referencing auth.users(id) with ON DELETE CASCADE
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_own_account() TO authenticated;
