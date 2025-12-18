-- Create institutes table
create table if not exists public.institutes (
  code text primary key,
  name text,
  admin_id uuid references auth.users(id),
  status text default 'active' check (status in ('active', 'paused')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.institutes enable row level security;

-- Policies
create policy "Allow public read access" on public.institutes
  for select using (true);

create policy "Allow super admin full access" on public.institutes
  for all using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- Sync existing institutes from auth.users
insert into public.institutes (code, name, admin_id, status)
select 
  raw_user_meta_data->>'institute_code', 
  raw_user_meta_data->>'institute_name', 
  id, 
  'active'
from auth.users 
where raw_user_meta_data->>'role' = 'institute_admin'
and raw_user_meta_data->>'institute_code' is not null
on conflict (code) do nothing;
