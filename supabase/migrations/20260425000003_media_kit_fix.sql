-- ============================================================
-- Migration: Media Kit — Schema reconciliation + permissions
-- Ensures media_kit_items has Migration A's schema (the one
-- the code actually uses), drops Migration B's conflicting
-- columns, fixes RLS, and seeds role_permissions.
-- ============================================================

-- ─── 1. Ensure correct columns exist ─────────────────────────────────────────
ALTER TABLE public.media_kit_items
  ADD COLUMN IF NOT EXISTS type         text        NOT NULL DEFAULT 'press_release',
  ADD COLUMN IF NOT EXISTS subtitle     text,
  ADD COLUMN IF NOT EXISTS url          text,
  ADD COLUMN IF NOT EXISTS metadata     jsonb       NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_active    boolean     NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at   timestamptz NOT NULL DEFAULT now();

-- ─── 2. Drop Migration B's conflicting columns (if they exist) ───────────────
ALTER TABLE public.media_kit_items
  DROP COLUMN IF EXISTS file_url,
  DROP COLUMN IF EXISTS file_type,
  DROP COLUMN IF EXISTS category,
  DROP COLUMN IF EXISTS is_published;

-- ─── 3. Add index for type lookups ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS media_kit_items_type_idx
  ON public.media_kit_items (type, is_active, display_order);

-- ─── 4. Fix RLS ──────────────────────────────────────────────────────────────
ALTER TABLE public.media_kit_items ENABLE ROW LEVEL SECURITY;

-- Public can read active items
DROP POLICY IF EXISTS "Public read media kit items" ON public.media_kit_items;
DROP POLICY IF EXISTS "media_kit_public_read"       ON public.media_kit_items;

CREATE POLICY "media_kit_public_read"
  ON public.media_kit_items FOR SELECT
  USING (is_active = true);

-- CRM staff can manage all items
DROP POLICY IF EXISTS "CRM staff manage media kit"  ON public.media_kit_items;
DROP POLICY IF EXISTS "media_kit_staff_write"        ON public.media_kit_items;

CREATE POLICY "media_kit_staff_write"
  ON public.media_kit_items FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)          OR
    has_role(auth.uid(), 'admin'::app_role)                OR
    has_role(auth.uid(), 'communications_officer'::app_role) OR
    has_role(auth.uid(), 'marketing_manager'::app_role)    OR
    has_role(auth.uid(), 'website_editor'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role)          OR
    has_role(auth.uid(), 'admin'::app_role)                OR
    has_role(auth.uid(), 'communications_officer'::app_role) OR
    has_role(auth.uid(), 'marketing_manager'::app_role)    OR
    has_role(auth.uid(), 'website_editor'::app_role)
  );

-- ─── 5. Seed role_permissions for media-kit-mgmt ─────────────────────────────
INSERT INTO public.role_permissions (role, module, can_view, can_create, can_edit, can_delete)
VALUES
  ('super_admin',            'media-kit-mgmt', true, true,  true,  true),
  ('admin',                  'media-kit-mgmt', true, true,  true,  true),
  ('communications_officer', 'media-kit-mgmt', true, true,  true,  false),
  ('marketing_manager',      'media-kit-mgmt', true, true,  true,  false),
  ('website_editor',         'media-kit-mgmt', true, true,  true,  false),
  ('moderator',              'media-kit-mgmt', true, false, false, false),
  ('project_director',       'media-kit-mgmt', true, false, false, false)
ON CONFLICT (role, module) DO UPDATE
  SET can_view   = EXCLUDED.can_view,
      can_create = EXCLUDED.can_create,
      can_edit   = EXCLUDED.can_edit,
      can_delete = EXCLUDED.can_delete;
