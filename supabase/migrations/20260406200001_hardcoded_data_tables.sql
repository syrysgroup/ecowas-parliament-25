-- ============================================================
-- Migration: Tables for previously hardcoded front-end data
-- Created: 2026-04-06
-- ============================================================

-- ─── Programme Pillars ───────────────────────────────────────────────────────
-- Powers the PillarsGrid homepage section (was hardcoded in PillarsGrid.tsx)
CREATE TABLE IF NOT EXISTS programme_pillars (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text        UNIQUE NOT NULL,
  emoji           text,
  color           text,       -- CSS HSL string for the accent bar
  icon_bg         text,       -- Tailwind class for the icon background
  route           text,       -- React Router path e.g. /programmes/youth
  progress_percent integer    DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  lead_name       text,
  sponsors        text[]      DEFAULT '{}',
  display_order   integer     DEFAULT 0,
  is_active       boolean     DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE programme_pillars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_programme_pillars"
  ON programme_pillars FOR SELECT USING (true);

CREATE POLICY "crm_manage_programme_pillars"
  ON programme_pillars FOR ALL
  USING (is_crm_staff()) WITH CHECK (is_crm_staff());

-- ─── Stakeholder Profiles ─────────────────────────────────────────────────────
-- Powers the ECOWAS Leadership section on Stakeholders.tsx
-- (was the hardcoded ecowasStakeholders[] array)
CREATE TABLE IF NOT EXISTS stakeholder_profiles (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  title         text,
  image_url     text,
  category      text        DEFAULT 'leadership',  -- leadership | team | advisory
  display_order integer     DEFAULT 0,
  is_active     boolean     DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE stakeholder_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_stakeholder_profiles"
  ON stakeholder_profiles FOR SELECT USING (true);

CREATE POLICY "crm_manage_stakeholder_profiles"
  ON stakeholder_profiles FOR ALL
  USING (is_crm_staff()) WITH CHECK (is_crm_staff());

-- ─── Media Kit Items ──────────────────────────────────────────────────────────
-- Powers MediaKit.tsx — was several hardcoded arrays (releases, spokespeople, etc.)
-- type values: press_release | spokesperson | asset_pack | event_calendar | key_fact
CREATE TABLE IF NOT EXISTS media_kit_items (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  type          text        NOT NULL,
  title         text,
  subtitle      text,
  description   text,
  url           text,
  metadata      jsonb       DEFAULT '{}',
  display_order integer     DEFAULT 0,
  is_active     boolean     DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE media_kit_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_media_kit_items"
  ON media_kit_items FOR SELECT USING (true);

CREATE POLICY "crm_manage_media_kit_items"
  ON media_kit_items FOR ALL
  USING (is_crm_staff()) WITH CHECK (is_crm_staff());
