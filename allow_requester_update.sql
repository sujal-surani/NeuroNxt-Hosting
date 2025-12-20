-- Policy to allow the requester to update their own connection request
-- This is necessary so that if a request is rejected, the requester can "resend" it
-- which effectively updates the status from 'rejected' back to 'pending'.

drop policy if exists "Users can update their sent requests" on connections;
create policy "Users can update their sent requests"
  on connections for update
  using ( auth.uid() = requester_id )
  with check ( 
    auth.uid() = requester_id 
    and status = 'pending'  -- Security: Only allow resetting to pending, not forcing accepted
  );
