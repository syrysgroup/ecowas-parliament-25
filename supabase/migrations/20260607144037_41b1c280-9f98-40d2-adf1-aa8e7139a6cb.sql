-- Form schema
CREATE TABLE public.volunteer_form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('text','textarea','select','multiselect','email','phone','date','checkbox')),
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  required boolean NOT NULL DEFAULT false,
  position int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.volunteer_form_fields TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_form_fields TO authenticated;
GRANT ALL ON public.volunteer_form_fields TO service_role;

ALTER TABLE public.volunteer_form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active fields"
  ON public.volunteer_form_fields FOR SELECT
  USING (active = true OR public.is_crm_staff(auth.uid()));

CREATE POLICY "Staff can write fields"
  ON public.volunteer_form_fields FOR ALL TO authenticated
  USING (public.is_crm_staff(auth.uid()))
  WITH CHECK (public.is_crm_staff(auth.uid()));

CREATE TRIGGER trg_volunteer_form_fields_updated
  BEFORE UPDATE ON public.volunteer_form_fields
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Applications
CREATE TABLE public.volunteer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  country text,
  interests text[] NOT NULL DEFAULT '{}',
  availability text,
  motivation text,
  extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','archived')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.volunteer_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_applications TO authenticated;
GRANT ALL ON public.volunteer_applications TO service_role;

ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit applications"
  ON public.volunteer_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can read applications"
  ON public.volunteer_applications FOR SELECT TO authenticated
  USING (public.is_crm_staff(auth.uid()));

CREATE POLICY "Staff can update applications"
  ON public.volunteer_applications FOR UPDATE TO authenticated
  USING (public.is_crm_staff(auth.uid()))
  WITH CHECK (public.is_crm_staff(auth.uid()));

CREATE POLICY "Staff can delete applications"
  ON public.volunteer_applications FOR DELETE TO authenticated
  USING (public.is_crm_staff(auth.uid()));

CREATE INDEX volunteer_applications_status_created_idx
  ON public.volunteer_applications (status, created_at DESC);

CREATE TRIGGER trg_volunteer_applications_updated
  BEFORE UPDATE ON public.volunteer_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed default form fields
INSERT INTO public.volunteer_form_fields (key, label, field_type, options, required, position) VALUES
  ('full_name','Full Name','text','[]',true,10),
  ('email','Email','email','[]',true,20),
  ('phone','Phone','phone','[]',false,30),
  ('country','Country','select','["Benin","Burkina Faso","Cabo Verde","Côte d''Ivoire","The Gambia","Ghana","Guinea","Guinea-Bissau","Liberia","Mali","Niger","Nigeria","Senegal","Sierra Leone","Togo"]',true,40),
  ('interests','Areas of Interest','multiselect','["Communications","Events","Research","Translation","Logistics","IT/Web","Outreach"]',true,50),
  ('availability','Availability','select','["Weekdays","Weekends","Evenings","Full-time","Project-based"]',true,60),
  ('motivation','Why do you want to volunteer?','textarea','[]',true,70);