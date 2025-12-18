-- Add pinned_by column to conversations table
alter table conversations add column if not exists pinned_by uuid[] default '{}';

-- Update RLS policies to allow updating pinned_by (if not already covered)
-- The existing policy "Users can view their own conversations" covers SELECT.
-- We might need an UPDATE policy if one doesn't exist for general updates, 
-- but usually, we want to be specific.
-- Let's check if there's a general update policy. If not, we should add one 
-- that allows updating if the user is a participant.

drop policy if exists "Users can update their own conversations" on conversations;

create policy "Users can update their own conversations"
  on conversations for update
  using ( auth.uid() = participant1_id or auth.uid() = participant2_id )
  with check ( auth.uid() = participant1_id or auth.uid() = participant2_id );
