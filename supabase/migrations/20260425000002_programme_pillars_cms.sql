-- ============================================================
-- Migration: Programme Pillars CMS
-- Adds:
--   • title + description columns to programme_pillars
--   • RLS fix: website_editor + programme_lead can write
--   • pillar_page_content table (hero block per pillar)
--   • pillar_sections table (flexible ordered content sections)
--   • role_permissions seed for programme-pillars module
-- ============================================================

-- ─── 1. Add title + description to programme_pillars ─────────────────────────
ALTER TABLE public.programme_pillars
  ADD COLUMN IF NOT EXISTS title       text,
  ADD COLUMN IF NOT EXISTS description text;

-- ─── 2. Fix RLS on programme_pillars ────────────────────────────────────────
DROP POLICY IF EXISTS "Admins manage programme pillars" ON public.programme_pillars;
DROP POLICY IF EXISTS "crm_manage_programme_pillars"    ON public.programme_pillars;

CREATE POLICY "pillar_cms_write"
  ON public.programme_pillars FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'website_editor'::app_role) OR
    has_role(auth.uid(), 'programme_lead'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'website_editor'::app_role) OR
    has_role(auth.uid(), 'programme_lead'::app_role)
  );

-- ─── 3. pillar_page_content ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pillar_page_content (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar_slug    text        NOT NULL UNIQUE
                               REFERENCES public.programme_pillars(slug)
                               ON UPDATE CASCADE ON DELETE CASCADE,
  page_title     text,
  tagline        text,
  description    text,
  hero_image_url text,
  cta_label      text,
  cta_url        text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pillar_page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_pillar_page_content"
  ON public.pillar_page_content FOR SELECT
  USING (true);

CREATE POLICY "pillar_page_content_write"
  ON public.pillar_page_content FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'website_editor'::app_role) OR
    has_role(auth.uid(), 'programme_lead'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'website_editor'::app_role) OR
    has_role(auth.uid(), 'programme_lead'::app_role)
  );

-- ─── 4. pillar_sections ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pillar_sections (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar_slug   text        NOT NULL
                              REFERENCES public.programme_pillars(slug)
                              ON UPDATE CASCADE ON DELETE CASCADE,
  title         text        NOT NULL,
  content       text,
  image_url     text,
  display_order integer     NOT NULL DEFAULT 0,
  is_visible    boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pillar_sections_slug_order_idx
  ON public.pillar_sections (pillar_slug, display_order);

ALTER TABLE public.pillar_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_pillar_sections"
  ON public.pillar_sections FOR SELECT
  USING (is_visible = true);

CREATE POLICY "pillar_sections_write"
  ON public.pillar_sections FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'website_editor'::app_role) OR
    has_role(auth.uid(), 'programme_lead'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'website_editor'::app_role) OR
    has_role(auth.uid(), 'programme_lead'::app_role)
  );

-- ─── 5. Seed role_permissions for programme-pillars ──────────────────────────
INSERT INTO public.role_permissions (role, module, can_view, can_create, can_edit, can_delete)
VALUES
  ('super_admin',            'programme-pillars', true,  true,  true,  true),
  ('admin',                  'programme-pillars', true,  true,  true,  true),
  ('website_editor',         'programme-pillars', true,  true,  true,  false),
  ('programme_lead',         'programme-pillars', true,  false, true,  false),
  ('moderator',              'programme-pillars', true,  false, false, false),
  ('project_director',       'programme-pillars', true,  false, false, false),
  ('marketing_manager',      'programme-pillars', true,  false, false, false),
  ('communications_officer', 'programme-pillars', true,  false, false, false)
ON CONFLICT (role, module) DO UPDATE
  SET can_view   = EXCLUDED.can_view,
      can_create = EXCLUDED.can_create,
      can_edit   = EXCLUDED.can_edit,
      can_delete = EXCLUDED.can_delete;
