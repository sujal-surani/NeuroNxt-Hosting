-- Enable Groups in Conversations
-- 1. Loosen constraints on conversations table
alter table conversations 
  add column if not exists is_group boolean default false,
  add column if not exists name text,
  add column if not exists description text,
  add column if not exists group_avatar text,
  add column if not exists created_by uuid references profiles(id),
  alter column participant1_id drop not null,
  alter column participant2_id drop not null;

-- 2. Create participants table for N-to-N relationships
create table if not exists conversation_participants (
  conversation_id bigint references conversations(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default now(),
  role text default 'member', -- 'admin', 'member'
  primary key (conversation_id, user_id)
);

-- 3. Enable RLS on participants
alter table conversation_participants enable row level security;

-- Helper to check membership without recursion (Security Definer)
create or replace function is_conversation_member(_conversation_id bigint, _user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 
    from conversation_participants 
    where conversation_id = _conversation_id 
    and user_id = _user_id
  );
$$;

-- 4. Policies for participants
drop policy if exists "Users can view open conversation participants" on conversation_participants;
create policy "Users can view open conversation participants"
  on conversation_participants for select
  using (
    is_conversation_member(conversation_id, auth.uid())
  );
  
-- 5. Update Conversation Visibility Policy to include Groups
-- Drop old policy
drop policy if exists "Users can view their own conversations" on conversations;
-- New policy: Either p1/p2 is user (Legacy) OR user is in participants table
create policy "Users can view their own conversations"
  on conversations for select
  using (
    auth.uid() = participant1_id 
    or auth.uid() = participant2_id
    or exists (
      select 1 from conversation_participants cp
      where cp.conversation_id = id
      and cp.user_id = auth.uid()
    )
  );

-- 6. Update Message Visibility
drop policy if exists "Users can view messages in their conversations" on messages;
create policy "Users can view messages in their conversations"
  on messages for select
  using (
    exists (
      select 1 from conversations c
      left join conversation_participants cp on c.id = cp.conversation_id
      where c.id = messages.conversation_id
      and (
        c.participant1_id = auth.uid() 
        or c.participant2_id = auth.uid()
        or cp.user_id = auth.uid()
      )
    )
  );

-- 7. Update Message Insert Policy
drop policy if exists "Users can insert messages in their conversations" on messages;
create policy "Users can insert messages in their conversations"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations c
      left join conversation_participants cp on c.id = cp.conversation_id
      where c.id = conversation_id
      and (
        c.participant1_id = auth.uid() 
        or c.participant2_id = auth.uid()
        or cp.user_id = auth.uid()
      )
    )
  );

-- 8. RPC to create group conversation atomically
create or replace function create_group_conversation(
  p_creator_id uuid,
  p_name text,
  p_description text,
  p_participant_ids uuid[]
)
returns bigint
language plpgsql
security definer
as $$
declare
  v_conversation_id bigint;
begin
  -- 1. Create Conversation
  insert into conversations (
    is_group,
    name,
    description,
    created_by,
    updated_at
  ) values (
    true,
    p_name,
    p_description,
    p_creator_id,
    now()
  ) returning id into v_conversation_id;

  -- 2. Add Creator as Admin
  insert into conversation_participants (conversation_id, user_id, role)
  values (v_conversation_id, p_creator_id, 'admin');

  -- 3. Add other participants
  if array_length(p_participant_ids, 1) > 0 then
    insert into conversation_participants (conversation_id, user_id, role)
    select v_conversation_id, unnest(p_participant_ids), 'member';
  end if;

  return v_conversation_id;
end;
$$;

-- 9. RPC to get user conversations (handles both 1-on-1 and groups)
create or replace function get_user_conversations(p_user_id uuid)
returns table (
  id bigint,
  is_group boolean,
  name text,
  description text,
  group_avatar text,
  created_by uuid,
  updated_at timestamp with time zone,
  last_message_id bigint,
  participant1_id uuid,
  participant2_id uuid,
  participants jsonb,
  last_message jsonb,
  unread_count bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    c.id,
    c.is_group,
    c.name,
    c.description,
    c.group_avatar,
    c.created_by,
    c.updated_at,
    c.last_message_id,
    c.participant1_id,
    c.participant2_id,
    (
      -- Get participant details
      select jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'full_name', p.full_name,
          'avatar_url', p.avatar_url,
          'role', p.role -- include role here
        )
      )
      from (
        -- For 1-on-1: get the OTHER participant
        select p.* 
        from profiles p 
        where (not c.is_group and (p.id = c.participant1_id or p.id = c.participant2_id) and p.id != p_user_id)
        
        union all
        
        -- For Groups: get ALL participants (including self, or just others? let's get others + self is fine, UI handles it)
        select p.*
        from conversation_participants cp 
        join profiles p on p.id = cp.user_id
        where c.is_group and cp.conversation_id = c.id
      ) p
    ) as participants,
    (
      select to_jsonb(m.*) 
      from messages m 
      where m.id = c.last_message_id
    ) as last_message,
    (
      select count(*) 
      from messages m 
      where m.conversation_id = c.id 
      and m.sender_id != p_user_id 
      and m.is_read = false
    ) as unread_count
  from conversations c
  where 
    -- 1-on-1 condition
    (not c.is_group and (c.participant1_id = p_user_id or c.participant2_id = p_user_id))
    or
    -- Group condition
    (c.is_group and exists (
      select 1 from conversation_participants cp 
      where cp.conversation_id = c.id 
      and cp.user_id = p_user_id
    ))
  order by c.updated_at desc;
end;
$$;
