-- DIAGNOSE DATABASE STATE
-- 1. Check for Triggers on auth.users
SELECT 
    event_object_schema as table_schema,
    event_object_table as table_name,
    trigger_name,
    event_manipulation as event,
    action_statement as definition
FROM information_schema.triggers
WHERE event_object_table = 'users' 
  AND event_object_schema = 'auth';

-- 2. Check constraints specifically on storage.objects
SELECT 
    conname AS constraint_name, 
    conrelid::regclass AS table_name, 
    confrelid::regclass AS referenced_table,
    CASE confdeltype 
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
    END AS delete_action
FROM pg_constraint 
WHERE conrelid = 'storage.objects'::regclass;
