
-- 1. site_settings table
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings publicly readable"
  ON public.site_settings FOR SELECT TO public USING (true);

CREATE POLICY "Admins manage site settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Seed default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('site_name', '"ECOWAS Parliament 25th Anniversary"'::jsonb),
  ('site_logo_url', '""'::jsonb),
  ('contact_email', '"info@ecowasparliamentinitiatives.org"'::jsonb),
  ('social_facebook', '"https://www.facebook.com/ECOWASParliament"'::jsonb),
  ('social_twitter', '"https://x.com/ecaborgers"'::jsonb),
  ('social_instagram', '"https://www.instagram.com/ecowas_parliament25"'::jsonb),
  ('social_linkedin', '""'::jsonb),
  ('social_youtube', '""'::jsonb),
  ('footer_text', '"© 2025 ECOWAS Parliament 25th Anniversary Initiative"'::jsonb);

-- 2. role_permissions table
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  module text NOT NULL,
  can_view boolean NOT NULL DEFAULT true,
  can_create boolean NOT NULL DEFAULT false,
  can_edit boolean NOT NULL DEFAULT false,
  can_delete boolean NOT NULL DEFAULT false,
  UNIQUE (role, module)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read permissions"
  ON public.role_permissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admins manage permissions"
  ON public.role_permissions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Seed default permissions for existing roles
INSERT INTO public.role_permissions (role, module, can_view, can_create, can_edit, can_delete) VALUES
  -- super_admin gets everything (bypassed in code, but seeded for UI)
  ('super_admin', 'dashboard', true, true, true, true),
  ('super_admin', 'people', true, true, true, true),
  ('super_admin', 'events', true, true, true, true),
  ('super_admin', 'news', true, true, true, true),
  ('super_admin', 'sponsors', true, true, true, true),
  ('super_admin', 'site_content', true, true, true, true),
  ('super_admin', 'media_library', true, true, true, true),
  ('super_admin', 'settings', true, true, true, true),
  ('super_admin', 'analytics', true, true, true, true),
  ('super_admin', 'contacts', true, true, true, true),
  ('super_admin', 'newsletter', true, true, true, true),
  -- admin
  ('admin', 'dashboard', true, true, true, true),
  ('admin', 'people', true, true, true, true),
  ('admin', 'events', true, true, true, true),
  ('admin', 'news', true, true, true, true),
  ('admin', 'sponsors', true, true, true, true),
  ('admin', 'site_content', true, true, true, false),
  ('admin', 'media_library', true, true, true, true),
  ('admin', 'settings', true, false, true, false),
  ('admin', 'analytics', true, false, false, false),
  ('admin', 'contacts', true, false, false, false),
  ('admin', 'newsletter', true, false, false, false),
  -- moderator
  ('moderator', 'dashboard', true, false, false, false),
  ('moderator', 'people', true, false, true, false),
  ('moderator', 'events', true, true, true, false),
  ('moderator', 'news', true, true, true, false),
  ('moderator', 'sponsors', true, false, false, false),
  ('moderator', 'site_content', true, false, false, false),
  ('moderator', 'media_library', true, true, false, false),
  ('moderator', 'analytics', true, false, false, false),
  ('moderator', 'contacts', true, false, false, false),
  ('moderator', 'newsletter', true, false, false, false),
  -- sponsor role
  ('sponsor', 'dashboard', true, false, false, false),
  ('sponsor', 'events', true, false, false, false),
  ('sponsor', 'news', true, false, false, false);

-- 3. Add external_links to news_articles
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS external_links jsonb DEFAULT '[]'::jsonb;

-- 4. Add related_event_ids to events  
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS related_event_ids uuid[] DEFAULT '{}'::uuid[];
