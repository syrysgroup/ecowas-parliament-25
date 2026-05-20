-- 1) Remove privilege-escalation policy on user_roles
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;

-- 2) Realtime authorization: restrict who can subscribe to realtime topics
-- Enable RLS on realtime.messages (idempotent)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop any prior policies we may have added
DROP POLICY IF EXISTS "Authenticated users can read realtime broadcasts" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated users can send realtime broadcasts" ON realtime.messages;

-- Only authenticated users may receive/send realtime messages; presence/broadcast
-- consumers in this app are authenticated staff. Postgres changes are still gated
-- by per-table RLS on the underlying public tables.
CREATE POLICY "Authenticated users can read realtime broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can send realtime broadcasts"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (true);