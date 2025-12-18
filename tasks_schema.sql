-- Create the tasks table
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text check (category in ('assignment', 'study', 'project', 'exam')),
  priority text check (priority in ('low', 'medium', 'high')),
  due_date timestamp with time zone,
  completed boolean default false,
  subject text,
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table tasks enable row level security;

-- Create policies
create policy "Users can view their own tasks"
  on tasks for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own tasks"
  on tasks for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own tasks"
  on tasks for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own tasks"
  on tasks for delete
  using ( auth.uid() = user_id );
