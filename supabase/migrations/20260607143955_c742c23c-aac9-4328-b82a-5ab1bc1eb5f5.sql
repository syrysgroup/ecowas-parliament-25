CREATE TABLE public.legal_page_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL CHECK (page_key IN ('legal.privacy','legal.terms','legal.cookies')),
  html text NOT NULL,
  version int NOT NULL DEFAULT 1,
  edited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.legal_page_versions TO authenticated;
GRANT ALL ON public.legal_page_versions TO service_role;

ALTER TABLE public.legal_page_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read legal versions"
  ON public.legal_page_versions FOR SELECT TO authenticated
  USING (public.is_crm_staff(auth.uid()));

CREATE POLICY "Staff can insert legal versions"
  ON public.legal_page_versions FOR INSERT TO authenticated
  WITH CHECK (public.is_crm_staff(auth.uid()));

CREATE INDEX legal_page_versions_page_key_created_idx
  ON public.legal_page_versions (page_key, created_at DESC);

INSERT INTO public.site_content (section_key, content)
SELECT 'legal.privacy', jsonb_build_object('html','<h1>Privacy Policy</h1><p>Coming soon.</p>','version',1,'last_published_at',null)
WHERE NOT EXISTS (SELECT 1 FROM public.site_content WHERE section_key = 'legal.privacy');

INSERT INTO public.site_content (section_key, content)
SELECT 'legal.terms', jsonb_build_object('html','<h1>Terms of Service</h1><p>Coming soon.</p>','version',1,'last_published_at',null)
WHERE NOT EXISTS (SELECT 1 FROM public.site_content WHERE section_key = 'legal.terms');

INSERT INTO public.site_content (section_key, content)
SELECT 'legal.cookies', jsonb_build_object('html','<h1>Cookie Policy</h1><p>Coming soon.</p>','version',1,'last_published_at',null)
WHERE NOT EXISTS (SELECT 1 FROM public.site_content WHERE section_key = 'legal.cookies');