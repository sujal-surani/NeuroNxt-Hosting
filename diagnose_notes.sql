
-- DIAGNOSE NOTES VISIBILITY
-- Run this to see exactly what the database sees for your user

do $$
declare
  u_id uuid := auth.uid();
  p_branch text;
  p_sem text;
  n_count int;
  
  -- Debug variables
  n_sample_branch text;
  n_sample_sem int;
begin
  -- 1. Get Profile Info
  select branch, semester into p_branch, p_sem from profiles where id = u_id;
  
  raise notice 'USER DEBUG INFO:';
  raise notice '  - User ID: %', u_id;
  raise notice '  - Profile Branch: "%"', p_branch;
  raise notice '  - Profile Semester: "%"', p_sem;
  
  -- 2. Check strict match count
  -- Tries to convert p_sem to int, handles errors
  begin
    select count(*) into n_count 
    from notes 
    where branch = p_branch 
    and semester = (regexp_replace(p_sem, '[^0-9]', '', 'g')::int);
    
    raise notice '  - Strict Match Count (Branch=% AND Sem=%): %', p_branch, (regexp_replace(p_sem, '[^0-9]', '', 'g')::int), n_count;
  exception when others then
    raise notice '  - Strict Match Error: Could not convert semester "%" to int', p_sem;
  end;

  -- 3. Check loose match (Case insensitive Branch)
  select count(*) into n_count 
  from notes 
  where lower(branch) = lower(p_branch);
  raise notice '  - Loose Branch Match (lower(branch)=%): %', lower(p_branch), n_count;

  -- 4. Sample a few notes to see what they look like
  raise notice 'SAMPLE NOTE DATA (Limit 3):';
  for n_sample_branch, n_sample_sem in select branch, semester from notes limit 3 loop
    raise notice '  - Note: Branch="%", Sem=%', n_sample_branch, n_sample_sem;
  end loop;

end $$;
