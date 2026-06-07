CREATE TABLE public.youth_sub_pillars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug IN ('innovators','smart')),
  title text NOT NULL,
  tagline text,
  hero_image_url text,
  intro_html text,
  cta_label text,
  cta_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.youth_sub_pillars TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.youth_sub_pillars TO authenticated;
GRANT ALL ON public.youth_sub_pillars TO service_role;

ALTER TABLE public.youth_sub_pillars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sub-pillars"
  ON public.youth_sub_pillars FOR SELECT USING (true);

CREATE POLICY "Staff can write sub-pillars"
  ON public.youth_sub_pillars FOR ALL TO authenticated
  USING (public.is_crm_staff(auth.uid()))
  WITH CHECK (public.is_crm_staff(auth.uid()));

CREATE TRIGGER trg_youth_sub_pillars_updated
  BEFORE UPDATE ON public.youth_sub_pillars
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.youth_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_pillar_id uuid NOT NULL REFERENCES public.youth_sub_pillars(id) ON DELETE CASCADE,
  title text NOT NULL,
  date date,
  description text,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.youth_milestones TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.youth_milestones TO authenticated;
GRANT ALL ON public.youth_milestones TO service_role;

ALTER TABLE public.youth_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read milestones"
  ON public.youth_milestones FOR SELECT USING (true);

CREATE POLICY "Staff can write milestones"
  ON public.youth_milestones FOR ALL TO authenticated
  USING (public.is_crm_staff(auth.uid()))
  WITH CHECK (public.is_crm_staff(auth.uid()));

CREATE INDEX youth_milestones_sub_pillar_position_idx
  ON public.youth_milestones (sub_pillar_id, position);

CREATE TRIGGER trg_youth_milestones_updated
  BEFORE UPDATE ON public.youth_milestones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.youth_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_pillar_id uuid NOT NULL REFERENCES public.youth_sub_pillars(id) ON DELETE CASCADE,
  applicant_name text NOT NULL,
  email text NOT NULL,
  country text,
  project_title text NOT NULL,
  project_summary text,
  link_url text,
  attachment_url text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','shortlisted','rejected','winner')),
  score int,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.youth_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.youth_submissions TO authenticated;
GRANT ALL ON public.youth_submissions TO service_role;

ALTER TABLE public.youth_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit"
  ON public.youth_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can read submissions"
  ON public.youth_submissions FOR SELECT TO authenticated
  USING (public.is_crm_staff(auth.uid()));

CREATE POLICY "Staff can update submissions"
  ON public.youth_submissions FOR UPDATE TO authenticated
  USING (public.is_crm_staff(auth.uid()))
  WITH CHECK (public.is_crm_staff(auth.uid()));

CREATE POLICY "Staff can delete submissions"
  ON public.youth_submissions FOR DELETE TO authenticated
  USING (public.is_crm_staff(auth.uid()));

CREATE INDEX youth_submissions_sub_pillar_status_idx
  ON public.youth_submissions (sub_pillar_id, status, created_at DESC);

CREATE TRIGGER trg_youth_submissions_updated
  BEFORE UPDATE ON public.youth_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.youth_sub_pillars (slug, title, tagline, intro_html, cta_label, cta_url) VALUES
  ('innovators','ECOWAS Youth Innovators Challenge','Locating regional talent across 12 member states','<p>The Innovators Challenge identifies young West African innovators driving solutions aligned with ECOWAS Vision 2050.</p>','Submit your project','/programmes/youth/innovators#submit'),
  ('smart','ECOWAS Smart Challenge','A region-wide quiz fostering healthy competition and collaboration','<p>The Smart Challenge is a flagship event of the Youth Innovation & Entrepreneurship pillar, marking ECOWAS''s shift towards Vision 2050.</p>','Register your team','/programmes/youth/smart#register');