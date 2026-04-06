-- ─── Channels (org-wide group chat) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.channels (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  type        text NOT NULL DEFAULT 'public', -- 'public' | 'private'
  created_by  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_archived boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Channel members ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.channel_members (
  channel_id  uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

-- ─── Channel messages ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.channel_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id  uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  sender_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body        text NOT NULL,
  sent_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  task_id     uuid REFERENCES public.tasks(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS channel_messages_channel_idx ON public.channel_messages (channel_id, sent_at DESC);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.channels        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;

-- channels: CRM staff read public; private only members
CREATE POLICY "read_public_channels" ON public.channels
  FOR SELECT USING (type = 'public' AND is_crm_staff());

CREATE POLICY "read_member_channels" ON public.channels
  FOR SELECT USING (
    is_crm_staff()
    AND type = 'private'
    AND EXISTS (
      SELECT 1 FROM public.channel_members
      WHERE channel_id = public.channels.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "crm_write_channels" ON public.channels
  FOR ALL USING (is_crm_staff()) WITH CHECK (is_crm_staff());

-- channel_members: staff can see all memberships; manage their own + admins manage all
CREATE POLICY "read_members" ON public.channel_members
  FOR SELECT USING (is_crm_staff());

CREATE POLICY "manage_members" ON public.channel_members
  FOR ALL USING (is_crm_staff()) WITH CHECK (is_crm_staff());

-- channel_messages: staff can read channels they have access to; insert own messages
CREATE POLICY "read_channel_messages" ON public.channel_messages
  FOR SELECT USING (
    is_crm_staff()
    AND (
      EXISTS (
        SELECT 1 FROM public.channels c
        WHERE c.id = channel_id AND c.type = 'public'
      )
      OR EXISTS (
        SELECT 1 FROM public.channel_members cm
        WHERE cm.channel_id = channel_messages.channel_id AND cm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "send_channel_messages" ON public.channel_messages
  FOR INSERT WITH CHECK (is_crm_staff() AND sender_id = auth.uid());

CREATE POLICY "soft_delete_own_messages" ON public.channel_messages
  FOR UPDATE USING (sender_id = auth.uid() OR is_crm_staff());

-- ─── Realtime ─────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;

-- ─── Seed: #general channel ───────────────────────────────────────────────────
DO $$
DECLARE
  first_user_id uuid;
  channel_id    uuid;
BEGIN
  SELECT id INTO first_user_id FROM auth.users ORDER BY created_at LIMIT 1;
  IF first_user_id IS NOT NULL THEN
    INSERT INTO public.channels (name, description, type, created_by)
    VALUES ('general', 'Organisation-wide announcements and discussion', 'public', first_user_id)
    ON CONFLICT DO NOTHING
    RETURNING id INTO channel_id;
  END IF;
END $$;
