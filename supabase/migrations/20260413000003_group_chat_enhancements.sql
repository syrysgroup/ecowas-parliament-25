-- ── Group chat enhancements ───────────────────────────────────────────────────
-- Adds group avatar, member role (admin/member), and links tasks to groups.

-- Add avatar_url to channels (groups)
ALTER TABLE public.channels
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS emoji      text NOT NULL DEFAULT '💬';

-- Add role to channel_members (admin vs member)
ALTER TABLE public.channel_members
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member';
-- 'admin' | 'member'

-- Backfill: mark each channel's created_by user as admin
UPDATE public.channel_members cm
  SET role = 'admin'
  FROM public.channels c
  WHERE cm.channel_id = c.id
    AND cm.user_id = c.created_by;

-- Ensure creator is in their own channel
INSERT INTO public.channel_members (channel_id, user_id, role)
  SELECT id, created_by, 'admin'
  FROM public.channels
ON CONFLICT (channel_id, user_id) DO UPDATE SET role = 'admin';

-- Link tasks to a group/channel (nullable)
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS channel_id uuid REFERENCES public.channels(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_channel_id ON public.tasks(channel_id);

-- ── unread counts per channel ─────────────────────────────────────────────────
-- Track last-read timestamp per user per channel so we can compute unread count
CREATE TABLE IF NOT EXISTS public.channel_read_receipts (
  channel_id   uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);
ALTER TABLE public.channel_read_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own receipts"
  ON public.channel_read_receipts FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
