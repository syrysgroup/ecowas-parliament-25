-- ─── Manual team members (non-auth users shown on public Team page) ────────────
-- This allows adding external delegates, advisors, or any person to the public
-- Team page without requiring them to have a CRM login.
CREATE TABLE IF NOT EXISTS public.team_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     text NOT NULL,
  title         text,
  organisation  text,
  avatar_url    text,
  bio           text,
  display_order integer NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Public can read active members
CREATE POLICY "public_read_team_members" ON public.team_members
  FOR SELECT USING (is_active = true);

-- CRM staff can manage
CREATE POLICY "crm_manage_team_members" ON public.team_members
  FOR ALL USING (is_crm_staff()) WITH CHECK (is_crm_staff());
