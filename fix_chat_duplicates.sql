-- Function to merge duplicate conversations
create or replace function merge_duplicate_conversations()
returns void
language plpgsql
as $$
declare
  r record;
  keep_id bigint;
  dup_id bigint;
begin
  -- Loop through all pairs of users that have more than 1 conversation
  for r in (
    select 
      least(participant1_id, participant2_id) as p1,
      greatest(participant1_id, participant2_id) as p2,
      array_agg(id order by updated_at desc) as ids,
      count(*)
    from conversations
    group by least(participant1_id, participant2_id), greatest(participant1_id, participant2_id)
    having count(*) > 1
  ) loop
    
    -- Keep the most recently updated one
    keep_id := r.ids[1];
    
    -- Process all other duplicates
    for i in 2..array_length(r.ids, 1) loop
      dup_id := r.ids[i];
      
      -- Move messages from duplicate to kept conversation
      update messages
      set conversation_id = keep_id
      where conversation_id = dup_id;
      
      -- Delete the duplicate conversation
      delete from conversations
      where id = dup_id;
      
      raise notice 'Merged conversation % into %', dup_id, keep_id;
    end loop;
    
  end loop;
end;
$$;

-- Run the merge function
select merge_duplicate_conversations();

-- Drop the function after use (optional, but keeps schema clean)
drop function merge_duplicate_conversations();

-- Add a unique constraint to prevent future duplicates (if possible)
-- We need a way to enforce order. A generated column or check constraint is best.
-- For now, let's just rely on the application logic and this cleanup.
