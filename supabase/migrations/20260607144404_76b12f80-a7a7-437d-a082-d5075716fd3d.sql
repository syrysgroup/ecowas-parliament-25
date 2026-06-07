-- Link sponsor account to user
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS sponsors_owner_user_id_idx ON public.sponsors(owner_user_id);

-- Widget registry
CREATE TABLE public.sponsor_portal_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE CHECK (key IN ('metrics','downloads','invoices','events','messages','reports')),
  label text NOT NULL,
  description text,
  default_enabled boolean NOT NULL DEFAULT true,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sponsor_portal_widgets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.sponsor_portal_widgets TO authenticated;
GRANT ALL ON public.sponsor_portal_widgets TO service_role;

ALTER TABLE public.sponsor_portal_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read widgets"
  ON public.sponsor_portal_widgets FOR SELECT USING (true);

CREATE POLICY "Staff can write widgets"
  ON public.sponsor_portal_widgets FOR ALL TO authenticated
  USING (public.is_crm_staff(auth.uid()))
  WITH CHECK (public.is_crm_staff(auth.uid()));

CREATE TRIGGER trg_sponsor_portal_widgets_updated
  BEFORE UPDATE ON public.sponsor_portal_widgets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Per-sponsor settings
CREATE TABLE public.sponsor_portal_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL UNIQUE REFERENCES public.sponsors(id) ON DELETE CASCADE,
  enabled_widgets text[] NOT NULL DEFAULT '{}',
  custom_message_html text,
  branding_logo_url text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsor_portal_settings TO authenticated;
GRANT ALL ON public.sponsor_portal_settings TO service_role;

ALTER TABLE public.sponsor_portal_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sponsor can read own settings"
  ON public.sponsor_portal_settings FOR SELECT TO authenticated
  USING (
    public.is_crm_staff(auth.uid())
    OR EXISTS (SELECT 1 FROM public.sponsors s WHERE s.id = sponsor_id AND s.owner_user_id = auth.uid())
  );

CREATE POLICY "Staff can write settings"
  ON public.sponsor_portal_settings FOR ALL TO authenticated
  USING (public.is_crm_staff(auth.uid()))
  WITH CHECK (public.is_crm_staff(auth.uid()));

CREATE TRIGGER trg_sponsor_portal_settings_updated
  BEFORE UPDATE ON public.sponsor_portal_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Per-sponsor downloads
CREATE TABLE public.sponsor_portal_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  category text,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsor_portal_downloads TO authenticated;
GRANT ALL ON public.sponsor_portal_downloads TO service_role;

ALTER TABLE public.sponsor_portal_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sponsor can read own visible downloads"
  ON public.sponsor_portal_downloads FOR SELECT TO authenticated
  USING (
    public.is_crm_staff(auth.uid())
    OR (visible = true AND EXISTS (SELECT 1 FROM public.sponsors s WHERE s.id = sponsor_id AND s.owner_user_id = auth.uid()))
  );

CREATE POLICY "Staff can write downloads"
  ON public.sponsor_portal_downloads FOR ALL TO authenticated
  USING (public.is_crm_staff(auth.uid()))
  WITH CHECK (public.is_crm_staff(auth.uid()));

CREATE INDEX sponsor_portal_downloads_sponsor_idx
  ON public.sponsor_portal_downloads (sponsor_id, visible);

CREATE TRIGGER trg_sponsor_portal_downloads_updated
  BEFORE UPDATE ON public.sponsor_portal_downloads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed widget registry
INSERT INTO public.sponsor_portal_widgets (key, label, description, default_enabled, position) VALUES
  ('metrics','Engagement Metrics','Reach, impressions and engagement across sponsored programmes',true,10),
  ('downloads','Downloads','Reports, branding assets and contracts shared with this sponsor',true,20),
  ('invoices','Invoices','Outstanding and paid invoices',true,30),
  ('events','Upcoming Events','Events tied to this sponsor''s programmes',true,40),
  ('messages','Messages','Direct messages from the secretariat',true,50),
  ('reports','Impact Reports','Periodic impact reports and case studies',false,60);