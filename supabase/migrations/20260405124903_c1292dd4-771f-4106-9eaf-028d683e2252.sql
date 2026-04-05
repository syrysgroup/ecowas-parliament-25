
-- 1. Add show_on_website and notification_email to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_on_website boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_email text;

-- 2. Create site_visitors table
CREATE TABLE site_visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text,
  country text,
  city text,
  device text,
  browser text,
  current_page text,
  referrer text,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_visitors ENABLE ROW LEVEL SECURITY;

-- Admins/super_admins can read visitors
CREATE POLICY "Admins can read site visitors" ON site_visitors
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Anonymous can insert (for tracking)
CREATE POLICY "Anyone can insert site visitors" ON site_visitors
  FOR INSERT TO anon
  WITH CHECK (true);

-- Authenticated can also insert
CREATE POLICY "Authenticated can insert site visitors" ON site_visitors
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 3. Create contact_submissions table
CREATE TABLE contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id uuid REFERENCES site_visitors(id),
  name text,
  email text,
  phone text,
  message text,
  source_page text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Admins/super_admins can read
CREATE POLICY "Admins can read contact submissions" ON contact_submissions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Anyone can insert (contact forms)
CREATE POLICY "Anyone can insert contact submissions" ON contact_submissions
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can insert contact submissions" ON contact_submissions
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 4. Add RLS policy for public to read profiles where show_on_website = true
CREATE POLICY "Public can read team profiles" ON profiles
  FOR SELECT TO anon
  USING (show_on_website = true);

-- 5. Allow super_admins to update any profile (for show_on_website toggle)
CREATE POLICY "Super admins can update all profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
