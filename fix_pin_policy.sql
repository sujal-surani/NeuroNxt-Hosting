-- FIX PIN POLICY (and general conversation updates)
-- The previous update policy was restricted to participant1_id/participant2_id.
-- This prevented group members (in conversation_participants) from pinning chats (updating pinned_by).

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;

-- Create a new inclusive policy
CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (
    auth.uid() = participant1_id 
    OR auth.uid() = participant2_id
    OR EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = id
      AND cp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = participant1_id 
    OR auth.uid() = participant2_id
    OR EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = id
      AND cp.user_id = auth.uid()
    )
  );
