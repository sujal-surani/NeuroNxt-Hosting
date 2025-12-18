-- Filter unverified students from public visibility

-- 1. Drop existing permissive policy
drop policy if exists "Public profiles are viewable by everyone" on profiles;

-- 2. Create restricted policy
-- Users can see profiles if:
-- a) The profile belongs to them (always see self)
-- b) The profile has account_status = 'active'
create policy "Profiles are viewable by active users"
  on profiles for select
  using (
    account_status = 'active' OR auth.uid() = id
  );
