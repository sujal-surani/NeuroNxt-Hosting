-- DEEP DEBUG: Find ALL references to auth.users in the ENTIRE database
-- This looks at all schemas, including storage, public, etc.

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
WHERE confrelid = 'auth.users'::regclass;
