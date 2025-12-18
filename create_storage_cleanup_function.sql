-- WORKAROUND: Create a function to delete user files manually
-- Since we cannot change the table definition, we will use this function 
-- to clean up files BEFORE deleting the user.

create or replace function delete_user_files(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, storage
as $$
begin
  -- Delete all objects owned by the user
  delete from storage.objects where owner = target_user_id;
end;
$$;
