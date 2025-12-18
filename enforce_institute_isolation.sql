-- Enforce strict institute isolation and hide unverified users

-- 1. Drop ALL existing select policies to ensure clean slate
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Profiles are viewable by active users" on profiles;

-- 2. Create strict policy
-- Users can see profiles IF:
--   a) It is their own profile (always visible to self)
--   OR
--   b) The target profile is 'active' AND is in the same institute
create policy "Profiles visible to institute members"
  on profiles for select
  using (
    (auth.uid() = id) 
    OR
    (
      account_status = 'active' 
      AND
      institute_code = (auth.jwt() -> 'user_metadata' ->> 'institute_code')
    )
  );

-- Note: Admin dashboards use the service role or admin client which bypasses RLS,
-- so this only affects client-side queries (Social page, Search, etc).
