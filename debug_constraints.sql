<<<<<<< HEAD
-- DEBUG SCRIPT: List all Foreign Keys and their Delete Actions
-- Run this to see which constraint is NOT 'CASCADE'

SELECT 
    tc.table_schema, 
    tc.table_name, 
    kcu.column_name, 
    tc.constraint_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
  AND tc.constraint_schema = rc.constraint_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE 
    (ccu.table_name = 'users' AND ccu.table_schema = 'auth')
    OR (ccu.table_name = 'notes' AND ccu.table_schema = 'public')
    OR (ccu.table_name = 'profiles' AND ccu.table_schema = 'public')
ORDER BY tc.table_name;
=======
-- DEBUG SCRIPT: List all Foreign Keys and their Delete Actions
-- Run this to see which constraint is NOT 'CASCADE'

SELECT 
    tc.table_schema, 
    tc.table_name, 
    kcu.column_name, 
    tc.constraint_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
  AND tc.constraint_schema = rc.constraint_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE 
    (ccu.table_name = 'users' AND ccu.table_schema = 'auth')
    OR (ccu.table_name = 'notes' AND ccu.table_schema = 'public')
    OR (ccu.table_name = 'profiles' AND ccu.table_schema = 'public')
ORDER BY tc.table_name;
>>>>>>> 8c01869 (Chat Page 99% Completed)
