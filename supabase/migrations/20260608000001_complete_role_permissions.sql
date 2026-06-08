-- Seed permissions for modules added after the initial permission matrix
-- (20260425000004) was written.  These 10 content modules and the media role
-- had zero rows in role_permissions, causing the canView() guard in
-- CRMDashboard.tsx to redirect non-super_admin users back to the dashboard
-- even when those roles are listed in allowedRoles in crmModules.ts.
--
-- Permission tier rationale (consistent with existing seeds):
--   admin              → full access (view/create/edit/delete) on every module
--                        it is listed in allowedRoles for.
--   staff roles        → view + create + edit (no delete) — matches established
--                        pattern from 20260425000004.
--   media              → minimal CRM footprint (web-app role); profile view/edit
--                        and settings view so they can manage their own account.
--
-- All rows use ON CONFLICT DO UPDATE so this migration is idempotent and
-- repairs any accidental partial seeds from earlier runs.

INSERT INTO public.role_permissions
  (role, module, can_view, can_create, can_edit, can_delete)
VALUES

  -- ── volunteer ──────────────────────────────────────────────────────────────
  -- allowedRoles: super_admin, admin, communications_officer, programme_lead, moderator
  ('admin',                  'volunteer', true, true,  true,  true),
  ('communications_officer', 'volunteer', true, true,  true,  false),
  ('programme_lead',         'volunteer', true, true,  true,  false),
  ('moderator',              'volunteer', true, true,  true,  false),

  -- ── media-accreditation ────────────────────────────────────────────────────
  -- allowedRoles: super_admin, admin, communications_officer, marketing_manager
  ('admin',                  'media-accreditation', true, true,  true,  true),
  ('communications_officer', 'media-accreditation', true, true,  true,  false),
  ('marketing_manager',      'media-accreditation', true, true,  true,  false),

  -- ── legal-pages ────────────────────────────────────────────────────────────
  -- allowedRoles: super_admin, admin, website_editor
  ('admin',          'legal-pages', true, true,  true,  true),
  ('website_editor', 'legal-pages', true, true,  true,  false),

  -- ── youth-sub-pillars ──────────────────────────────────────────────────────
  -- allowedRoles: super_admin, admin, website_editor, programme_lead
  ('admin',           'youth-sub-pillars', true, true,  true,  true),
  ('website_editor',  'youth-sub-pillars', true, true,  true,  false),
  ('programme_lead',  'youth-sub-pillars', true, true,  true,  false),

  -- ── sponsor-portal-config ──────────────────────────────────────────────────
  -- allowedRoles: super_admin, admin, sponsor_manager
  ('admin',            'sponsor-portal-config', true, true,  true,  true),
  ('sponsor_manager',  'sponsor-portal-config', true, true,  true,  false),

  -- ── timeline ───────────────────────────────────────────────────────────────
  -- allowedRoles: super_admin, admin, website_editor, programme_lead, communications_officer
  ('admin',                  'timeline', true, true,  true,  true),
  ('website_editor',         'timeline', true, true,  true,  false),
  ('programme_lead',         'timeline', true, true,  true,  false),
  ('communications_officer', 'timeline', true, true,  true,  false),

  -- ── pages ──────────────────────────────────────────────────────────────────
  -- allowedRoles: super_admin, admin, website_editor, communications_officer
  ('admin',                  'pages', true, true,  true,  true),
  ('website_editor',         'pages', true, true,  true,  false),
  ('communications_officer', 'pages', true, true,  true,  false),

  -- ── forms ──────────────────────────────────────────────────────────────────
  -- allowedRoles: super_admin, admin, website_editor, communications_officer
  ('admin',                  'forms', true, true,  true,  true),
  ('website_editor',         'forms', true, true,  true,  false),
  ('communications_officer', 'forms', true, true,  true,  false),

  -- ── marketplace ────────────────────────────────────────────────────────────
  -- allowedRoles: super_admin, admin, project_director, programme_lead, sponsor_manager
  ('admin',             'marketplace', true, true,  true,  true),
  ('project_director',  'marketplace', true, true,  true,  false),
  ('programme_lead',    'marketplace', true, true,  true,  false),
  ('sponsor_manager',   'marketplace', true, true,  true,  false),

  -- ── parliament-tour ────────────────────────────────────────────────────────
  -- allowedRoles: super_admin, admin, website_editor, communications_officer
  ('admin',                  'parliament-tour', true, true,  true,  true),
  ('website_editor',         'parliament-tour', true, true,  true,  false),
  ('communications_officer', 'parliament-tour', true, true,  true,  false),

  -- ── media role — minimal CRM account access ────────────────────────────────
  -- media users operate through the web-app /media-portal route, not the CRM.
  -- They need settings (view only) and profile (view + edit) so they can
  -- manage their own account without being redirected on every page load.
  ('media', 'settings', true, false, false, false),
  ('media', 'profile',  true, false, true,  false)

ON CONFLICT (role, module) DO UPDATE SET
  can_view   = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit   = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;
