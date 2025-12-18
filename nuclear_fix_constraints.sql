-- NUCLEAR FIX FOR DELETE CONSTRAINTS
-- This script dynamically finds and drops constraints to ensure they are replaced with CASCADE versions.

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Fix references to auth.users (User deletion cascades to their data)
    FOR r IN 
        SELECT tc.table_schema, tc.table_name, kcu.column_name, tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE ccu.table_name = 'users' 
          AND ccu.table_schema = 'auth'
          AND tc.constraint_type = 'FOREIGN KEY' -- CRITICAL FIX: Only touch Foreign Keys
    LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || 
                ' DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || 
                ' ADD CONSTRAINT ' || quote_ident(r.constraint_name) || 
                ' FOREIGN KEY (' || quote_ident(r.column_name) || ') REFERENCES auth.users(id) ON DELETE CASCADE';
    END LOOP;

    -- 2. Fix references to public.notes (Note deletion cascades to likes/views/etc)
    FOR r IN 
        SELECT tc.table_schema, tc.table_name, kcu.column_name, tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE ccu.table_name = 'notes' 
          AND ccu.table_schema = 'public'
          AND tc.constraint_type = 'FOREIGN KEY' -- CRITICAL FIX: Only touch Foreign Keys
    LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || 
                ' DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || 
                ' ADD CONSTRAINT ' || quote_ident(r.constraint_name) || 
                ' FOREIGN KEY (' || quote_ident(r.column_name) || ') REFERENCES public.notes(id) ON DELETE CASCADE';
    END LOOP;

    -- 3. Fix references to public.profiles (Profile deletion cascades to connections)
    FOR r IN 
        SELECT tc.table_schema, tc.table_name, kcu.column_name, tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE ccu.table_name = 'profiles' 
          AND ccu.table_schema = 'public'
          AND tc.constraint_type = 'FOREIGN KEY' -- CRITICAL FIX: Only touch Foreign Keys
    LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || 
                ' DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || 
                ' ADD CONSTRAINT ' || quote_ident(r.constraint_name) || 
                ' FOREIGN KEY (' || quote_ident(r.column_name) || ') REFERENCES public.profiles(id) ON DELETE CASCADE';
    END LOOP;

END $$;
