-- Super Admin settings system

-- 1. Ensure super_admin role can be stored in user_role
-- The existing user_role enum is already: super_admin | admin | website_editor | communications_officer | marketing_manager | programme_lead | project_director | sponsor | public
-- 'super_admin' already exists, no migration needed for enum

-- 2. Create global_settings table
CREATE TABLE IF NOT EXISTS global_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz DEFAULT now()
);

-- 3. RLS for global_settings
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "global_settings_read" ON global_settings;
DROP POLICY IF EXISTS "global_settings_write" ON global_settings;

-- All authenticated users can read
CREATE POLICY "global_settings_read" ON global_settings
  FOR SELECT TO authenticated USING (true);

-- Only super_admin can write
CREATE POLICY "global_settings_write" ON global_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 4. Seed default settings
INSERT INTO global_settings (key, value) VALUES
  ('app_name', '"ECOWAS Parliament CRM"'),
  ('default_theme', '"light"'),
  ('default_sidebar', '"expanded"'),
  ('default_layout', '"vertical"'),
  ('notifications', '{"new_user": true, "deal_closed": true, "invoice_sent": true, "payment_received": false, "system_error": true}'),
  ('permissions', '{"admin": {"delete_contacts": true, "export_data": true, "view_reports": true, "manage_deals": true, "send_invoices": true}, "user": {"delete_contacts": false, "export_data": false, "view_reports": true, "manage_deals": false, "send_invoices": false}}'),
  ('branding', '{"primary_color": "#008000", "logo_url": "/images/logo/logo.png"}'),
  ('smtp', '{"host": "", "port": 587, "username": "", "from_name": "ECOWAS Parliament CRM", "from_email": "noreply@ecowas.int"}')
ON CONFLICT (key) DO NOTHING;

-- 5. Create admin_audit_log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_super_admin" ON admin_audit_log;

-- Only super_admin can read audit logs
CREATE POLICY "audit_log_super_admin" ON admin_audit_log
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 6. Trigger to auto-set updated_at on global_settings
CREATE OR REPLACE FUNCTION update_global_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS global_settings_updated_at ON global_settings;

CREATE TRIGGER global_settings_updated_at
  BEFORE UPDATE ON global_settings
  FOR EACH ROW EXECUTE FUNCTION update_global_settings_updated_at();
