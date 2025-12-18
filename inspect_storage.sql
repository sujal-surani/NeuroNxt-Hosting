<<<<<<< HEAD
-- INSPECT STORAGE SCHEMA
-- 1. List columns in storage.objects to confirm 'owner' exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'storage' AND table_name = 'objects';

-- 2. Check if the failing user has files
-- Replace with the ID that failed in the logs: b61210d0-2eac-44d2-98a5-a2cf60c519ed
SELECT count(*) as file_count 
FROM storage.objects 
WHERE owner = 'b61210d0-2eac-44d2-98a5-a2cf60c519ed';
=======
-- INSPECT STORAGE SCHEMA
-- 1. List columns in storage.objects to confirm 'owner' exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'storage' AND table_name = 'objects';

-- 2. Check if the failing user has files
-- Replace with the ID that failed in the logs: b61210d0-2eac-44d2-98a5-a2cf60c519ed
SELECT count(*) as file_count 
FROM storage.objects 
WHERE owner = 'b61210d0-2eac-44d2-98a5-a2cf60c519ed';
>>>>>>> 8c01869 (Chat Page 99% Completed)
