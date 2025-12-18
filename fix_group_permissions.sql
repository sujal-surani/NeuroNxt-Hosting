-- FIX GROUP PERMISSIONS
-- This script adds missing policies for 'conversation_participants' to allow:
-- 1. Users to leave groups (DELETE their own row).
-- 2. Members to add other users (INSERT rows).

-- Enable RLS (Should be already enabled, but safe to repeat)
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- 1. DELETE POLICY (Leave Group)
DROP POLICY IF EXISTS "Users can leave groups" ON conversation_participants;
CREATE POLICY "Users can leave groups"
  ON conversation_participants FOR DELETE
  USING (
    auth.uid() = user_id
  );

-- 2. INSERT POLICY (Add Members)
-- Allow any authenticated user to add members to a conversation if they are already a member of it.
-- Or more minimally: anyone can add (security risk if they add to random groups, but we need conversation_id).
-- Better: Check if authed user is a member of the conversation.
DROP POLICY IF EXISTS "Members can add participants" ON conversation_participants;
CREATE POLICY "Members can add participants"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_id
      AND cp.user_id = auth.uid()
    )
    -- Also allow if it's a new conversation? (Usually handled by RPC, so this is for existing)
    -- The RPC handles creation, so this is purely for "Add Member" to existing groups.
  );
