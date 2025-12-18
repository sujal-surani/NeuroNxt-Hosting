-- FIX SCHEMA AND ENABLE FEATURES
-- Run this script in your Supabase SQL Editor to resolve the 400 errors.

-- 1. ADD MISSING COLUMN FOR NOTICE VIEWS
ALTER TABLE public.notice_views 
ADD COLUMN IF NOT EXISTS is_cleared boolean DEFAULT false;

-- 2. FIX CONVERSATIONS FOREIGN KEYS (Restore link to profiles for frontend joins, enable cascade)
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_participant1_id_fkey;
ALTER TABLE conversations ADD CONSTRAINT conversations_participant1_id_fkey
    FOREIGN KEY (participant1_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_participant2_id_fkey;
ALTER TABLE conversations ADD CONSTRAINT conversations_participant2_id_fkey
    FOREIGN KEY (participant2_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. FIX MESSAGES FOREIGN KEYS
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Ensure messages are deleted when conversation is deleted
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_conversation_id_fkey
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

-- 4. FIX CONNECTIONS FOREIGN KEYS
ALTER TABLE connections DROP CONSTRAINT IF EXISTS connections_requester_id_fkey;
ALTER TABLE connections ADD CONSTRAINT connections_requester_id_fkey
    FOREIGN KEY (requester_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE connections DROP CONSTRAINT IF EXISTS connections_recipient_id_fkey;
ALTER TABLE connections ADD CONSTRAINT connections_recipient_id_fkey
    FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 5. CREATE DELETE ACCOUNT FUNCTION
CREATE OR REPLACE FUNCTION delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete from auth.users, which triggers cascade to profiles -> conversations/messages etc.
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION delete_own_account() TO authenticated;

-- 6. REFRESH SCHEMA CACHE (By notifying PostgREST - implicitly handled by schema changes usually)
NOTIFY pgrst, 'reload config';
