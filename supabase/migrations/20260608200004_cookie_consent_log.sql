CREATE TABLE public.cookie_consent_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  choice text NOT NULL CHECK (choice IN ('accepted', 'declined')),
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cookie_consent_log ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can insert a consent event
GRANT INSERT ON public.cookie_consent_log TO anon, authenticated;
GRANT SELECT ON public.cookie_consent_log TO authenticated;
GRANT ALL ON public.cookie_consent_log TO service_role;

CREATE POLICY "Public can log consent"
  ON public.cookie_consent_log FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can read consent log"
  ON public.cookie_consent_log FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'website_editor'::app_role)
  );

CREATE INDEX cookie_consent_log_choice_created_idx ON public.cookie_consent_log (choice, created_at DESC);
