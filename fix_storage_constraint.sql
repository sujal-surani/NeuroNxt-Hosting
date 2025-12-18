<<<<<<< HEAD
-- FIX STORAGE CONSTRAINTS
-- The storage.objects table often blocks user deletion because it doesn't cascade by default.

ALTER TABLE storage.objects
DROP CONSTRAINT IF EXISTS objects_owner_fkey;

ALTER TABLE storage.objects
ADD CONSTRAINT objects_owner_fkey
FOREIGN KEY (owner)
REFERENCES auth.users(id)
ON DELETE CASCADE;
=======
-- FIX STORAGE CONSTRAINTS
-- The storage.objects table often blocks user deletion because it doesn't cascade by default.

ALTER TABLE storage.objects
DROP CONSTRAINT IF EXISTS objects_owner_fkey;

ALTER TABLE storage.objects
ADD CONSTRAINT objects_owner_fkey
FOREIGN KEY (owner)
REFERENCES auth.users(id)
ON DELETE CASCADE;
>>>>>>> 8c01869 (Chat Page 99% Completed)
