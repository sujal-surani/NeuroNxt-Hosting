
-- Function to update study streak
-- Logic:
-- 1. If last_active was today, do nothing (streak already maintained)
-- 2. If last_active was yesterday, increment streak
-- 3. If last_active was older than yesterday, reset streak to 1
-- 4. Always update last_active to now()

create or replace function update_study_streak()
returns void
language plpgsql
security definer
as $$
declare
  user_last_active timestamptz;
  current_streak int;
begin
  -- Get current last_active and streak
  select last_active, study_streak
  into user_last_active, current_streak
  from profiles
  where id = auth.uid();

  -- If no profile found, exit
  if not found then
    return;
  end if;

  -- If last_active is null, set to now and streak to 1
  if user_last_active is null then
    update profiles
    set 
      last_active = now(),
      study_streak = 1
    where id = auth.uid();
    return;
  end if;

  -- Check if last active was today (in UTC)
  if date(user_last_active) = date(now()) then
    -- Already active today, just update timestamp
    update profiles
    set last_active = now()
    where id = auth.uid();
  
  -- Check if last active was yesterday
  elsif date(user_last_active) = date(now() - interval '1 day') then
    -- Streak continues!
    update profiles
    set 
      last_active = now(),
      study_streak = coalesce(current_streak, 0) + 1
    where id = auth.uid();
  
  -- Otherwise, streak broken
  else
    update profiles
    set 
      last_active = now(),
      study_streak = 1
    where id = auth.uid();
  end if;
end;
$$;
