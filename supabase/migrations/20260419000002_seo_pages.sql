CREATE TABLE IF NOT EXISTS seo_pages (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path        text        NOT NULL UNIQUE,
  title            text,
  meta_description text,
  og_title         text,
  og_description   text,
  focus_keyword    text,
  canonical_url    text,
  noindex          boolean     NOT NULL DEFAULT false,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  updated_by       uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;

-- Super admins, admins, website editors and marketing managers can manage SEO pages
CREATE POLICY "seo_pages_staff_all"
  ON seo_pages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('super_admin', 'admin', 'website_editor', 'marketing_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('super_admin', 'admin', 'website_editor', 'marketing_manager')
    )
  );

-- Seed with common pages so the module shows useful data immediately
INSERT INTO seo_pages (page_path, title, meta_description, focus_keyword) VALUES
  ('/', 'ECOWAS Parliament Initiatives', 'Empowering West African integration through democratic governance and parliamentary excellence.', 'ECOWAS Parliament'),
  ('/about', 'About Us | ECOWAS Parliament Initiatives', 'Learn about the mission and vision of the ECOWAS Parliament Initiatives.', 'ECOWAS mission'),
  ('/events', 'Events | ECOWAS Parliament Initiatives', 'Upcoming events, conferences, and summits organised by ECOWAS Parliament Initiatives.', 'ECOWAS events'),
  ('/documents', 'Documents | ECOWAS Parliament Initiatives', 'Official documents, reports and publications from ECOWAS Parliament Initiatives.', 'ECOWAS documents'),
  ('/contact', 'Contact | ECOWAS Parliament Initiatives', 'Get in touch with the ECOWAS Parliament Initiatives team.', 'contact ECOWAS')
ON CONFLICT (page_path) DO NOTHING;
