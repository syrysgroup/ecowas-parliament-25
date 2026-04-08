
-- 1. Add missing columns to sponsors
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS acronym text;
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS about text;
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS is_ecowas_sponsor boolean DEFAULT false;

-- 2. Add missing columns to partners
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS long_description text[];
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}';

-- 3. Create channels table
CREATE TABLE IF NOT EXISTS public.channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'public',
  created_by uuid NOT NULL,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CRM staff can view channels" ON public.channels
  FOR SELECT TO authenticated USING (is_crm_staff(auth.uid()));
CREATE POLICY "CRM staff can create channels" ON public.channels
  FOR INSERT TO authenticated WITH CHECK (is_crm_staff(auth.uid()) AND created_by = auth.uid());
CREATE POLICY "Creators and admins can update channels" ON public.channels
  FOR UPDATE TO authenticated USING (created_by = auth.uid() OR has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete channels" ON public.channels
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

-- 4. Create channel_members table
CREATE TABLE IF NOT EXISTS public.channel_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(channel_id, user_id)
);
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CRM staff can view channel members" ON public.channel_members
  FOR SELECT TO authenticated USING (is_crm_staff(auth.uid()));
CREATE POLICY "CRM staff can join channels" ON public.channel_members
  FOR INSERT TO authenticated WITH CHECK (is_crm_staff(auth.uid()) AND user_id = auth.uid());
CREATE POLICY "Users can leave channels" ON public.channel_members
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 5. Create channel_messages table
CREATE TABLE IF NOT EXISTS public.channel_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id),
  body text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view channel messages" ON public.channel_messages
  FOR SELECT TO authenticated USING (is_crm_staff(auth.uid()));
CREATE POLICY "Members can send channel messages" ON public.channel_messages
  FOR INSERT TO authenticated WITH CHECK (is_crm_staff(auth.uid()) AND sender_id = auth.uid());
CREATE POLICY "Sender can soft-delete channel messages" ON public.channel_messages
  FOR UPDATE TO authenticated USING (sender_id = auth.uid());
