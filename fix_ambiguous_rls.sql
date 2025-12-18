-- Fix ambiguous column reference in messages RLS policy

-- Drop the problematic policy
drop policy if exists "Users can insert messages in their conversations" on messages;

-- Recreate it with explicit table references
create policy "Users can insert messages in their conversations"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations c
      left join conversation_participants cp on c.id = cp.conversation_id
      where c.id = messages.conversation_id  -- Explicitly reference messages table
      and (
        c.participant1_id = auth.uid() 
        or c.participant2_id = auth.uid()
        or cp.user_id = auth.uid()
      )
    )
  );
