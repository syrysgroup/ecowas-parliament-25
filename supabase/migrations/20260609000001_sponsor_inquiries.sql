CREATE TYPE public.sponsor_inquiry_status AS ENUM (
  'new',
  'contacted',
  'qualified',
  'converted',
  'declined'
);

CREATE TABLE public.sponsor_inquiries (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name       text NOT NULL,
  contact_name   text NOT NULL,
  email          text NOT NULL,
  phone          text,
  website        text,
  programmes     text[] NOT NULL DEFAULT '{}',
  preferred_tier text CHECK (preferred_tier IN ('presenting','platinum','gold','silver','bronze','standard')),
  message        text,
  status         sponsor_inquiry_status NOT NULL DEFAULT 'new',
  notes          text,
  assigned_to    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsor_inquiries ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.sponsor_inquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.sponsor_inquiries TO authenticated;
GRANT ALL ON public.sponsor_inquiries TO service_role;

CREATE POLICY "Public can submit sponsor inquiries"
  ON public.sponsor_inquiries FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can manage sponsor inquiries"
  ON public.sponsor_inquiries FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'sponsor_manager'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'sponsor_manager'::app_role)
  );

CREATE INDEX sponsor_inquiries_status_created_idx
  ON public.sponsor_inquiries (status, created_at DESC);
