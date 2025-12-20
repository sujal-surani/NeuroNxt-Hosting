
-- NOTIFICATION TRIGGERS

-- 1. SYSTEM: Welcome Notification
create or replace function public.notify_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.notifications (user_id, type, category, title, message)
  values (
    new.id,
    'success',
    'system',
    'Welcome to NeuroNxt!',
    'We are glad to have you here. Explore your dashboard to get started.'
  );
  return new;
end;
$$;

drop trigger if exists on_profile_created_notify on public.profiles;
create trigger on_profile_created_notify
  after insert on public.profiles
  for each row execute procedure public.notify_new_user();


-- 2. SOCIAL: Friend Requests
create or replace function public.notify_connection_change()
returns trigger
language plpgsql
security definer
as $$
declare
  sender_name text;
  receiver_name text;
begin
  -- Case A: New Request Pending
  if (TG_OP = 'INSERT' and new.status = 'pending') then
    select full_name into sender_name from profiles where id = new.requester_id;
    
    insert into public.notifications (user_id, type, category, title, message, link, metadata)
    values (
      new.recipient_id,
      'info',
      'social',
      'New Connection Request',
      sender_name || ' sent you a connection request.',
      '/social',
      jsonb_build_object('requester_id', new.requester_id)
    );
  end if;

  -- Case B: Request Accepted
  if (TG_OP = 'UPDATE' and old.status = 'pending' and new.status = 'accepted') then
    select full_name into receiver_name from profiles where id = new.recipient_id;
    
    insert into public.notifications (user_id, type, category, title, message, link, metadata)
    values (
      new.requester_id,
      'success',
      'social',
      'Request Accepted',
      receiver_name || ' accepted your connection request.',
      '/social',
      jsonb_build_object('recipient_id', new.recipient_id)
    );
  end if;
  
  return new;
end;
$$;

drop trigger if exists on_connection_notify on public.connections;
create trigger on_connection_notify
  after insert or update on public.connections
  for each row execute procedure public.notify_connection_change();


-- 3. ACADEMIC: New Notices
create or replace function public.notify_new_notice()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Fan out notification to all matching students
  -- usage of 'insert into ... select ...' is efficient
  
  insert into public.notifications (user_id, type, category, title, message, link, metadata)
  select 
    p.id,
    'info',
    'academic',
    'New Notice: ' || new.title,
    substring(new.description from 1 for 50) || '...', -- Truncate description
    '/dashboard?tab=notices', -- Assuming there's a view for this
    jsonb_build_object('notice_id', new.id)
  from public.profiles p
  where 
    p.institute_code = new.institute_code
    and (new.target_type = 'all' or p.branch = new.target_branch)
    and (new.target_semester is null or new.target_semester = 'all' or p.semester = new.target_semester)
    and p.id != new.author_id; -- Don't notify the author
    
  return new;
end;
$$;

drop trigger if exists on_notice_created_notify on public.notices;
create trigger on_notice_created_notify
  after insert on public.notices
  for each row execute procedure public.notify_new_notice();
