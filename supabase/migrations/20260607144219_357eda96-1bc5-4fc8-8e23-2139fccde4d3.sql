CREATE TABLE public.media_accreditations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  outlet text NOT NULL,
  outlet_type text NOT NULL CHECK (outlet_type IN ('tv','radio','print','online','freelance')),
  country text,
  email text NOT NULL,
  phone text,
  coverage_event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  id_document_url text,
  bio text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','revoked','rejected')),
  badge_number text UNIQUE,
  badge_issued_at timestamptz,
  expires_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.media_accreditations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_accreditations TO authenticated;
GRANT ALL ON public.media_accreditations TO service_role;

ALTER TABLE public.media_accreditations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit accreditation"
  ON public.media_accreditations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can read accreditations"
  ON public.media_accreditations FOR SELECT TO authenticated
  USING (public.is_crm_staff(auth.uid()));

CREATE POLICY "Comms+ can update accreditations"
  ON public.media_accreditations FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'communications_officer')
    OR public.has_role(auth.uid(),'marketing_manager')
  )
  WITH CHECK (
    public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'communications_officer')
    OR public.has_role(auth.uid(),'marketing_manager')
  );

CREATE POLICY "Admins can delete accreditations"
  ON public.media_accreditations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));

CREATE INDEX media_accreditations_status_created_idx
  ON public.media_accreditations (status, created_at DESC);

CREATE TRIGGER trg_media_accreditations_updated
  BEFORE UPDATE ON public.media_accreditations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.next_badge_number()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'BADGE-' || LPAD((COALESCE(MAX(CAST(NULLIF(REPLACE(badge_number, 'BADGE-', ''), '') AS INTEGER)), 0) + 1)::TEXT, 5, '0')
  FROM public.media_accreditations
  WHERE badge_number LIKE 'BADGE-%'
$$;