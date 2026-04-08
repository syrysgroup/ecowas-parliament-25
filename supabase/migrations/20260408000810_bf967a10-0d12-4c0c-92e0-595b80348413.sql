
-- 1. Create zero-arg overload for is_crm_staff()
CREATE OR REPLACE FUNCTION public.is_crm_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_crm_staff(auth.uid())
$$;

-- 2. Create direct_messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_dm_sender ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_recipient ON public.direct_messages(recipient_id);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own DMs"
  ON public.direct_messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "CRM staff can send DMs"
  ON public.direct_messages FOR INSERT TO authenticated
  WITH CHECK (is_crm_staff(auth.uid()) AND sender_id = auth.uid());

CREATE POLICY "Sender can soft-delete own DMs"
  ON public.direct_messages FOR UPDATE TO authenticated
  USING (sender_id = auth.uid());

-- 3. Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- 4. Create branding storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage policies for branding bucket
CREATE POLICY "Anyone can view branding assets"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'branding');

CREATE POLICY "Admins can upload branding assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'branding' AND (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Admins can update branding assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'branding' AND (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Admins can delete branding assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'branding' AND (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin')));
