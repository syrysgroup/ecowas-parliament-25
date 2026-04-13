
-- ── email_contacts ────────────────────────────────────────────────────────────
-- Auto-populated whenever the user sends an email.
-- Powers the To/Cc/Bcc autocomplete dropdown.
CREATE TABLE IF NOT EXISTS public.email_contacts (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_address     text        NOT NULL,
  display_name      text,
  last_contacted_at timestamptz NOT NULL DEFAULT now(),
  contact_count     integer     NOT NULL DEFAULT 1,
  is_starred        boolean     NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, email_address)
);
ALTER TABLE public.email_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own contacts"
  ON public.email_contacts FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── email_labels ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_labels (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  color      text        NOT NULL DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);
ALTER TABLE public.email_labels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own labels"
  ON public.email_labels FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── email_label_assignments ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_label_assignments (
  email_id  uuid NOT NULL REFERENCES public.emails(id) ON DELETE CASCADE,
  label_id  uuid NOT NULL REFERENCES public.email_labels(id) ON DELETE CASCADE,
  PRIMARY KEY (email_id, label_id)
);
ALTER TABLE public.email_label_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own label assignments"
  ON public.email_label_assignments FOR ALL TO authenticated
  USING (
    label_id IN (
      SELECT id FROM public.email_labels WHERE user_id = auth.uid()
    )
  );

-- ── email_templates ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_templates (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  subject    text        NOT NULL DEFAULT '',
  body_html  text        NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own templates"
  ON public.email_templates FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── emails table additions ────────────────────────────────────────────────────
ALTER TABLE public.emails
  ADD COLUMN IF NOT EXISTS thread_id    text,
  ADD COLUMN IF NOT EXISTS is_archived  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS snooze_until timestamptz,
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

-- Backfill thread_id from subject (strip Re:/Fwd: prefix, lowercase, trim)
UPDATE public.emails
  SET thread_id = trim(regexp_replace(lower(subject), '^(re:|fwd?:)\s*', '', 'gi'))
  WHERE thread_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_emails_thread_id       ON public.emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_email_contacts_user_id ON public.email_contacts(user_id);

-- ── Helper: upsert a contact and bump contact_count ───────────────────────────
CREATE OR REPLACE FUNCTION public.upsert_email_contact(
  p_user_id uuid,
  p_email   text,
  p_name    text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.email_contacts (user_id, email_address, display_name, last_contacted_at, contact_count)
  VALUES (p_user_id, lower(p_email), p_name, now(), 1)
  ON CONFLICT (user_id, email_address) DO UPDATE
    SET contact_count     = email_contacts.contact_count + 1,
        last_contacted_at = now(),
        display_name      = COALESCE(EXCLUDED.display_name, email_contacts.display_name);
END;
$$;
