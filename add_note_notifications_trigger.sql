-- Add trigger to notify students about new notes
-- Similar to notices, but for 'study' category.

create or replace function public.notify_new_note()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Notify students in the matching branch and semester
  insert into public.notifications (user_id, type, category, title, message, link, metadata)
  select 
    p.id,
    'info',
    'study',
    'New Note: ' || new.title,
    coalesce(new.description, 'Check out this new note'),
    '/notes?id=' || new.id,
    jsonb_build_object('note_id', new.id)
  from public.profiles p
  where 
    -- Match Institute
    p.institute_code = (select institute_code from profiles where id = new.author_id) -- Assuming uploader belongs to same institute
    
    -- Match Branch (if specific)
    -- Normalize: replace hyphens with spaces and lowercase
    and (
      new.branch = 'all' 
      or lower(replace(p.branch, '-', ' ')) = lower(replace(new.branch, '-', ' '))
    )
    
    -- Match Semester
    -- Handles "1" vs "Semester 1" formats
    and (
      p.semester = new.semester::text 
      or p.semester ILIKE '%Semester ' || new.semester
    )
    
    -- Exclude Uploader
    and p.id != new.author_id;

  return new;
end;
$$;

drop trigger if exists on_note_uploaded_notify on public.notes;
create trigger on_note_uploaded_notify
  after insert on public.notes
  for each row execute procedure public.notify_new_note();
