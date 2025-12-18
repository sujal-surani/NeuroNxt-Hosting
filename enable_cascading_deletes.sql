-- Enable Cascading Deletes for Chat and Connections

-- 1. CONVERSATIONS
-- Ensure participants reference auth.users with cascade
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_participant1_id_fkey;
ALTER TABLE conversations ADD CONSTRAINT conversations_participant1_id_fkey
    FOREIGN KEY (participant1_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_participant2_id_fkey;
ALTER TABLE conversations ADD CONSTRAINT conversations_participant2_id_fkey
    FOREIGN KEY (participant2_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. MESSAGES
-- Ensure sender references auth.users (or profiles) with cascade
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure messages belong to conversations with cascade
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_conversation_id_fkey
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

-- 3. CONNECTIONS (Redundant if covered by previous files but safe to repeat)
ALTER TABLE connections DROP CONSTRAINT IF EXISTS connections_requester_id_fkey;
ALTER TABLE connections ADD CONSTRAINT connections_requester_id_fkey
    FOREIGN KEY (requester_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE connections DROP CONSTRAINT IF EXISTS connections_recipient_id_fkey;
ALTER TABLE connections ADD CONSTRAINT connections_recipient_id_fkey
    FOREIGN KEY (recipient_id) REFERENCES profiles(id) ON DELETE CASCADE;
