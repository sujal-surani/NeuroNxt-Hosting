-- Create conversations table
create table if not exists conversations (
  id bigint primary key generated always as identity,
  participant1_id uuid references profiles(id) on delete cascade not null,
  participant2_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(participant1_id, participant2_id)
);

-- Create messages table
create table if not exists messages (
  id bigint primary key generated always as identity,
  conversation_id bigint references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_read boolean default false,
  type text default 'text', -- text, image, file, voice
  file_url text,
  file_name text,
  file_size text
);

-- Add last_message_id to conversations (circular reference, so add after messages table)
alter table conversations add column if not exists last_message_id bigint references messages(id) on delete set null;

-- Enable RLS
alter table conversations enable row level security;
alter table messages enable row level security;

-- Conversations policies
drop policy if exists "Users can view their own conversations" on conversations;
create policy "Users can view their own conversations"
  on conversations for select
  using ( auth.uid() = participant1_id or auth.uid() = participant2_id );

drop policy if exists "Users can create conversations" on conversations;
create policy "Users can create conversations"
  on conversations for insert
  with check ( auth.uid() = participant1_id or auth.uid() = participant2_id );

-- Messages policies
drop policy if exists "Users can view messages in their conversations" on messages;
create policy "Users can view messages in their conversations"
  on messages for select
  using (
    exists (
      select 1 from conversations
      where id = messages.conversation_id
      and (participant1_id = auth.uid() or participant2_id = auth.uid())
    )
  );

drop policy if exists "Users can insert messages in their conversations" on messages;
create policy "Users can insert messages in their conversations"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations
      where id = conversation_id
      and (participant1_id = auth.uid() or participant2_id = auth.uid())
    )
  );

-- Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table connections;
