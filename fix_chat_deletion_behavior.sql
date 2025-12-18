-- FIX CHAT HISTORY DELETION
-- Changing from ON DELETE CASCADE to ON DELETE SET NULL for conversations and messages.

-- 1. CONVERSATIONS
-- Allow participants to be NULL (if they don't already allow it, we might need to alter column, but usually FK doesn't force NOT NULL unless specified)
-- First check if we need to remove NOT NULL constraints if they exist (assuming they might). 
-- Safest is to just try altering the constraint, but if columns are NOT NULL, we'd need to drop that.
-- Let's assume columns are nullable or make them nullable just in case.
ALTER TABLE conversations ALTER COLUMN participant1_id DROP NOT NULL;
ALTER TABLE conversations ALTER COLUMN participant2_id DROP NOT NULL;

ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_participant1_id_fkey;
ALTER TABLE conversations ADD CONSTRAINT conversations_participant1_id_fkey
    FOREIGN KEY (participant1_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_participant2_id_fkey;
ALTER TABLE conversations ADD CONSTRAINT conversations_participant2_id_fkey
    FOREIGN KEY (participant2_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. MESSAGES
-- Allow sender to be NULL (Deleted User)
ALTER TABLE messages ALTER COLUMN sender_id DROP NOT NULL;

ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Note: We still want messages to be deleted if the *conversation* is deleted.
-- So we keep messages_conversation_id_fkey as ON DELETE CASCADE (which came from previous script).

-- 3. CONNECTIONS
-- Connections should actually be deleted if a user is deleted, because you can't be connected to a ghost.
-- So we KEEP connections as ON DELETE CASCADE.
