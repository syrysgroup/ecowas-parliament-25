-- ============================================================
-- CRM Gaps: Schema additions for full site-backend connection
-- ============================================================

-- 1. SPONSORS: add acronym + about (for individual sponsor detail pages)
ALTER TABLE public.sponsors
  ADD COLUMN IF NOT EXISTS acronym text,
  ADD COLUMN IF NOT EXISTS about   text;

-- 2. PARTNERS: add long_description[] and social_links jsonb
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS long_description text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS social_links     jsonb   DEFAULT '{}';

-- 3. SITE CONTENT: seed sponsor portal stats section
INSERT INTO public.site_content (section_key, content)
VALUES (
  'sponsor_portal_stats',
  '{"stat1_value":"400M+","stat1_label":"People in the ECOWAS bloc","stat2_value":"12","stat2_label":"Member states reached","stat3_value":"40+","stat3_label":"Events across 2026","stat4_value":"2.4M","stat4_label":"Combined programme audience (est.)"}'::jsonb
)
ON CONFLICT (section_key) DO NOTHING;

-- 4. SITE CONTENT: seed speaker section
INSERT INTO public.site_content (section_key, content)
VALUES (
  'speaker',
  '{"name":"Rt. Hon. Memounatou Ibrahima","title":"Speaker of the ECOWAS Parliament","quote":"The ECOWAS Parliament belongs to the people of West Africa.","image_url":""}'::jsonb
)
ON CONFLICT (section_key) DO NOTHING;
