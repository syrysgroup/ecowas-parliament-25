-- Fix and complete role_permissions.
--
-- Problem: the initial seed (20260406121051) used stale module names that no
-- longer match the section keys in crmModules.ts, so canView() checks in
-- CRMDashboard.tsx always returned false for those modules.
-- Additionally many staff roles had no entries at all.
--
-- Approach: delete the stale-named rows, then upsert the full correct matrix
-- for every non-super_admin role.  super_admin bypasses the check in code so
-- it only needs UI rows — left as-is from the initial seed (correct names).

-- ── Step 1: remove stale entries with old module names ────────────────────────
DELETE FROM public.role_permissions
WHERE module IN ('events', 'news', 'sponsors', 'site_content', 'media_library', 'contacts');

-- ── Step 2: upsert the full correct permission matrix ────────────────────────
-- Using ON CONFLICT DO UPDATE so this migration is idempotent and also repairs
-- any previously incorrect values (e.g. from partial earlier seeds).

INSERT INTO public.role_permissions (role, module, can_view, can_create, can_edit, can_delete) VALUES

  -- ── admin ──────────────────────────────────────────────────────────────────
  ('admin', 'dashboard',          true,  true,  true,  true),
  ('admin', 'tasks',              true,  true,  true,  true),
  ('admin', 'calendar',           true,  true,  true,  true),
  ('admin', 'documents',          true,  true,  true,  true),
  ('admin', 'email-inbox',        true,  true,  true,  true),
  ('admin', 'comms',              true,  true,  true,  true),
  ('admin', 'team',               true,  true,  true,  false),
  ('admin', 'people',             true,  true,  true,  true),
  ('admin', 'news-editor',        true,  true,  true,  true),
  ('admin', 'events-manager',     true,  true,  true,  true),
  ('admin', 'programme-pillars',  true,  true,  true,  true),
  ('admin', 'stakeholders-mgmt',  true,  true,  true,  true),
  ('admin', 'media-kit-mgmt',     true,  true,  true,  true),
  ('admin', 'sponsors-partners',  true,  true,  true,  true),
  ('admin', 'site-content',       true,  true,  true,  false),
  ('admin', 'cms',                true,  true,  true,  true),
  ('admin', 'media-library',      true,  true,  true,  true),
  ('admin', 'analytics',          true,  false, false, false),
  ('admin', 'geo-analytics',      true,  false, false, false),
  ('admin', 'sponsor-metrics',    true,  false, false, false),
  ('admin', 'invoices',           true,  true,  true,  false),
  ('admin', 'seo',                true,  true,  true,  true),
  ('admin', 'newsletter',         true,  true,  true,  false),
  ('admin', 'contact-submissions',true,  false, false, false),
  ('admin', 'roles',              true,  true,  true,  true),
  ('admin', 'parliament-ops',     true,  true,  true,  false),
  ('admin', 'parliament-content', true,  true,  true,  false),
  ('admin', 'settings',           true,  false, true,  false),
  ('admin', 'profile',            true,  true,  true,  false),

  -- ── moderator ──────────────────────────────────────────────────────────────
  ('moderator', 'dashboard',          true,  false, false, false),
  ('moderator', 'tasks',              true,  true,  true,  false),
  ('moderator', 'calendar',           true,  true,  true,  false),
  ('moderator', 'documents',          true,  true,  true,  false),
  ('moderator', 'email-inbox',        true,  true,  false, false),
  ('moderator', 'comms',              true,  true,  false, false),
  ('moderator', 'team',               true,  false, false, false),
  ('moderator', 'news-editor',        true,  true,  true,  false),
  ('moderator', 'parliament-ops',     true,  false, false, false),
  ('moderator', 'contact-submissions',true,  false, false, false),
  ('moderator', 'settings',           true,  false, true,  false),
  ('moderator', 'profile',            true,  true,  true,  false),

  -- ── project_director ───────────────────────────────────────────────────────
  ('project_director', 'dashboard',          true,  false, false, false),
  ('project_director', 'tasks',              true,  true,  true,  false),
  ('project_director', 'calendar',           true,  true,  true,  false),
  ('project_director', 'documents',          true,  true,  true,  false),
  ('project_director', 'email-inbox',        true,  true,  false, false),
  ('project_director', 'comms',              true,  true,  false, false),
  ('project_director', 'team',               true,  false, false, false),
  ('project_director', 'cms',                true,  true,  true,  false),
  ('project_director', 'analytics',          true,  false, false, false),
  ('project_director', 'contact-submissions',true,  false, false, false),
  ('project_director', 'settings',           true,  false, true,  false),
  ('project_director', 'profile',            true,  true,  true,  false),

  -- ── programme_lead ─────────────────────────────────────────────────────────
  -- programme-pillars already seeded in 20260425000002; DO UPDATE to confirm values.
  ('programme_lead', 'dashboard',          true,  false, false, false),
  ('programme_lead', 'tasks',              true,  true,  true,  false),
  ('programme_lead', 'calendar',           true,  true,  false, false),
  ('programme_lead', 'documents',          true,  true,  true,  false),
  ('programme_lead', 'email-inbox',        true,  true,  false, false),
  ('programme_lead', 'comms',              true,  true,  false, false),
  ('programme_lead', 'team',               true,  false, false, false),
  ('programme_lead', 'programme-pillars',  true,  false, true,  false),
  ('programme_lead', 'cms',                true,  true,  true,  false),
  ('programme_lead', 'contact-submissions',true,  false, false, false),
  ('programme_lead', 'settings',           true,  false, true,  false),
  ('programme_lead', 'profile',            true,  true,  true,  false),

  -- ── website_editor ─────────────────────────────────────────────────────────
  -- programme-pillars and media-kit-mgmt already seeded; DO UPDATE to confirm.
  ('website_editor', 'dashboard',          true,  false, false, false),
  ('website_editor', 'tasks',              true,  true,  false, false),
  ('website_editor', 'calendar',           true,  true,  false, false),
  ('website_editor', 'documents',          true,  true,  true,  false),
  ('website_editor', 'email-inbox',        true,  true,  false, false),
  ('website_editor', 'comms',              true,  true,  false, false),
  ('website_editor', 'team',               true,  false, false, false),
  ('website_editor', 'programme-pillars',  true,  true,  true,  false),
  ('website_editor', 'stakeholders-mgmt',  true,  true,  true,  false),
  ('website_editor', 'media-kit-mgmt',     true,  true,  true,  false),
  ('website_editor', 'cms',                true,  true,  true,  false),
  ('website_editor', 'seo',                true,  true,  true,  false),
  ('website_editor', 'contact-submissions',true,  false, false, false),
  ('website_editor', 'settings',           true,  false, true,  false),
  ('website_editor', 'profile',            true,  true,  true,  false),

  -- ── marketing_manager ──────────────────────────────────────────────────────
  -- media-kit-mgmt already seeded; DO UPDATE to confirm.
  ('marketing_manager', 'dashboard',          true,  false, false, false),
  ('marketing_manager', 'tasks',              true,  true,  false, false),
  ('marketing_manager', 'calendar',           true,  true,  false, false),
  ('marketing_manager', 'email-inbox',        true,  true,  false, false),
  ('marketing_manager', 'comms',              true,  true,  false, false),
  ('marketing_manager', 'team',               true,  false, false, false),
  ('marketing_manager', 'media-kit-mgmt',     true,  true,  true,  false),
  ('marketing_manager', 'cms',                true,  true,  true,  false),
  ('marketing_manager', 'analytics',          true,  false, false, false),
  ('marketing_manager', 'seo',                true,  true,  true,  false),
  ('marketing_manager', 'marketing',          true,  true,  true,  false),
  ('marketing_manager', 'newsletter',         true,  true,  true,  false),
  ('marketing_manager', 'contact-submissions',true,  false, false, false),
  ('marketing_manager', 'settings',           true,  false, true,  false),
  ('marketing_manager', 'profile',            true,  true,  true,  false),

  -- ── communications_officer ─────────────────────────────────────────────────
  -- media-kit-mgmt already seeded; DO UPDATE to confirm.
  ('communications_officer', 'dashboard',          true,  false, false, false),
  ('communications_officer', 'tasks',              true,  true,  false, false),
  ('communications_officer', 'calendar',           true,  true,  false, false),
  ('communications_officer', 'documents',          true,  true,  true,  false),
  ('communications_officer', 'email-inbox',        true,  true,  false, false),
  ('communications_officer', 'comms',              true,  true,  false, false),
  ('communications_officer', 'team',               true,  false, false, false),
  ('communications_officer', 'news-editor',        true,  true,  true,  false),
  ('communications_officer', 'stakeholders-mgmt',  true,  true,  true,  false),
  ('communications_officer', 'media-kit-mgmt',     true,  true,  true,  false),
  ('communications_officer', 'cms',                true,  true,  true,  false),
  ('communications_officer', 'parliament-content', true,  true,  true,  false),
  ('communications_officer', 'contact-submissions',true,  false, false, false),
  ('communications_officer', 'settings',           true,  false, true,  false),
  ('communications_officer', 'profile',            true,  true,  true,  false),

  -- ── finance_coordinator ────────────────────────────────────────────────────
  ('finance_coordinator', 'dashboard',          true,  false, false, false),
  ('finance_coordinator', 'tasks',              true,  true,  false, false),
  ('finance_coordinator', 'calendar',           true,  true,  false, false),
  ('finance_coordinator', 'documents',          true,  true,  true,  false),
  ('finance_coordinator', 'email-inbox',        true,  true,  false, false),
  ('finance_coordinator', 'comms',              true,  true,  false, false),
  ('finance_coordinator', 'team',               true,  false, false, false),
  ('finance_coordinator', 'finance',            true,  true,  true,  true),
  ('finance_coordinator', 'invoices',           true,  true,  true,  true),
  ('finance_coordinator', 'contact-submissions',true,  false, false, false),
  ('finance_coordinator', 'settings',           true,  false, true,  false),
  ('finance_coordinator', 'profile',            true,  true,  true,  false),

  -- ── logistics_coordinator ──────────────────────────────────────────────────
  ('logistics_coordinator', 'dashboard',          true,  false, false, false),
  ('logistics_coordinator', 'tasks',              true,  true,  true,  false),
  ('logistics_coordinator', 'calendar',           true,  true,  true,  false),
  ('logistics_coordinator', 'documents',          true,  true,  true,  false),
  ('logistics_coordinator', 'email-inbox',        true,  true,  false, false),
  ('logistics_coordinator', 'comms',              true,  true,  false, false),
  ('logistics_coordinator', 'team',               true,  false, false, false),
  ('logistics_coordinator', 'contact-submissions',true,  false, false, false),
  ('logistics_coordinator', 'settings',           true,  false, true,  false),
  ('logistics_coordinator', 'profile',            true,  true,  true,  false),

  -- ── sponsor_manager ────────────────────────────────────────────────────────
  ('sponsor_manager', 'dashboard',          true,  false, false, false),
  ('sponsor_manager', 'tasks',              true,  true,  false, false),
  ('sponsor_manager', 'calendar',           true,  true,  false, false),
  ('sponsor_manager', 'documents',          true,  true,  true,  false),
  ('sponsor_manager', 'email-inbox',        true,  true,  false, false),
  ('sponsor_manager', 'comms',              true,  true,  false, false),
  ('sponsor_manager', 'team',               true,  false, false, false),
  ('sponsor_manager', 'sponsors-partners',  true,  true,  true,  false),
  ('sponsor_manager', 'sponsor-metrics',    true,  false, false, false),
  ('sponsor_manager', 'contact-submissions',true,  false, false, false),
  ('sponsor_manager', 'settings',           true,  false, true,  false),
  ('sponsor_manager', 'profile',            true,  true,  true,  false),

  -- ── consultant ─────────────────────────────────────────────────────────────
  -- Note: consultant is NOT in calendar or team allowedRoles (crmModules.ts)
  ('consultant', 'dashboard',          true,  false, false, false),
  ('consultant', 'tasks',              true,  true,  false, false),
  ('consultant', 'documents',          true,  false, false, false),
  ('consultant', 'email-inbox',        true,  true,  false, false),
  ('consultant', 'comms',              true,  true,  false, false),
  ('consultant', 'contact-submissions',true,  false, false, false),
  ('consultant', 'settings',           true,  false, false, false),
  ('consultant', 'profile',            true,  true,  true,  false),

  -- ── sponsor ────────────────────────────────────────────────────────────────
  -- Old seed had 'events' and 'news' which were wrong; replaced with correct modules.
  ('sponsor', 'dashboard',       true,  false, false, false),
  ('sponsor', 'email-inbox',     true,  false, false, false),
  ('sponsor', 'sponsor-metrics', true,  false, false, false),
  ('sponsor', 'settings',        true,  false, false, false),
  ('sponsor', 'profile',         true,  true,  true,  false),

  -- ── staff (supplement existing seed) ──────────────────────────────────────
  ('staff', 'team',               true,  false, false, false),
  ('staff', 'contact-submissions',true,  false, false, false),
  ('staff', 'settings',           true,  false, false, false),

  -- ── budget_officer (supplement existing seed) ─────────────────────────────
  ('budget_officer', 'team',               true,  false, false, false),
  ('budget_officer', 'contact-submissions',true,  false, false, false),
  ('budget_officer', 'settings',           true,  false, false, false),
  ('budget_officer', 'profile',            true,  true,  true,  false)

ON CONFLICT (role, module) DO UPDATE SET
  can_view   = EXCLUDED.can_view,
  can_create = EXCLUDED.can_create,
  can_edit   = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete;
