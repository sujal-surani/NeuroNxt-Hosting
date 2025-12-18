-- Create message_reactions table
create table if not exists message_reactions (
  id bigint primary key generated always as identity,
  message_id bigint references messages(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  reaction text not null, -- Stores the emoji char
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(message_id, user_id, reaction)
);

-- Enable RLS
alter table message_reactions enable row level security;

-- Policies for message_reactions

-- View reactions: Users can view reactions for messages in conversations they are part of
drop policy if exists "Users can view reactions in their conversations" on message_reactions;
create policy "Users can view reactions in their conversations"
  on message_reactions for select
  using (
    exists (
      select 1 from messages m
      join conversations c on m.conversation_id = c.id
      where m.id = message_reactions.message_id
      and (
        -- 1-on-1 check
        (c.participant1_id = auth.uid() or c.participant2_id = auth.uid())
        or
        -- Group check
        exists (
          select 1 from conversation_participants cp
          where cp.conversation_id = c.id
          and cp.user_id = auth.uid()
        )
      )
    )
  );

-- Insert reactions: Users can react to messages in conversations they are part of
drop policy if exists "Users can add reactions in their conversations" on message_reactions;
create policy "Users can add reactions in their conversations"
  on message_reactions for insert
  with check (
    auth.uid() = user_id -- Must be their own reaction
    and exists (
      select 1 from messages m
      join conversations c on m.conversation_id = c.id
      where m.id = message_reactions.message_id
      and (
        -- 1-on-1 check
        (c.participant1_id = auth.uid() or c.participant2_id = auth.uid())
        or
        -- Group check
        exists (
          select 1 from conversation_participants cp
          where cp.conversation_id = c.id
          and cp.user_id = auth.uid()
        )
      )
    )
  );

-- Delete reactions: Users can remove their own reactions
drop policy if exists "Users can remove their own reactions" on message_reactions;
create policy "Users can remove their own reactions"
  on message_reactions for delete
  using ( auth.uid() = user_id );

-- Realtime
alter publication supabase_realtime add table message_reactions;
