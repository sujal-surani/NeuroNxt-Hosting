
-- Create Notifications Table
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text check (type in ('info', 'success', 'warning', 'error')) default 'info',
  category text check (category in ('social', 'academic', 'system', 'study')) default 'system',
  title text not null,
  message text not null,
  link text,
  is_read boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table notifications enable row level security;

-- Policies
-- 1. Users can view their own notifications
drop policy if exists "Users can view own notifications" on notifications;
create policy "Users can view own notifications"
  on notifications for select
  using ( auth.uid() = user_id );

-- 2. Users can update their own notifications (mark as read)
drop policy if exists "Users can update own notifications" on notifications;
create policy "Users can update own notifications"
  on notifications for update
  using ( auth.uid() = user_id );

-- 3. System (triggers) can insert notifications (handled by security definer functions)
-- But for client-side testing or specific logic, we might need insert policy.
-- Usually triggers run as postgres or superuser/definer, so RLS doesn't block them if function is security definer.
