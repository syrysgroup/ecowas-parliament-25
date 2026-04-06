CREATE TABLE public.stakeholder_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text,
  image_url text,
  category text NOT NULL DEFAULT 'leadership',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stakeholder_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage stakeholders" ON public.stakeholder_profiles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read active stakeholders" ON public.stakeholder_profiles
  FOR SELECT TO anon
  USING (is_active = true);