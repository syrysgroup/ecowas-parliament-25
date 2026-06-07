
-- Legal pages
ALTER TABLE public.legal_page_versions
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS title TEXT;

GRANT SELECT ON public.legal_page_versions TO anon;

DROP POLICY IF EXISTS "Public can read published legal pages" ON public.legal_page_versions;
CREATE POLICY "Public can read published legal pages"
  ON public.legal_page_versions
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Volunteer form seed
INSERT INTO public.volunteer_form_fields (key, label, field_type, options, required, position, active)
SELECT * FROM (VALUES
  ('full_name', 'Full Name',  'text',     '[]'::jsonb, true,  10, true),
  ('email',     'Email',      'email',    '[]'::jsonb, true,  20, true),
  ('phone',     'Phone',      'tel',      '[]'::jsonb, false, 30, true),
  ('country',   'Country',    'select',   '["Benin","Cabo Verde","Côte d''Ivoire","The Gambia","Ghana","Guinea","Guinea-Bissau","Liberia","Nigeria","Senegal","Sierra Leone","Togo","Other"]'::jsonb, true, 40, true),
  ('availability','Availability','text',  '[]'::jsonb, false, 50, true),
  ('motivation','Why do you want to volunteer?','textarea','[]'::jsonb, true, 60, true)
) AS v(key, label, field_type, options, required, position, active)
WHERE NOT EXISTS (SELECT 1 FROM public.volunteer_form_fields);

-- Widen sponsor portal widget keys then seed
ALTER TABLE public.sponsor_portal_widgets DROP CONSTRAINT IF EXISTS sponsor_portal_widgets_key_check;

INSERT INTO public.sponsor_portal_widgets (key, label, description, default_enabled, position)
SELECT * FROM (VALUES
  ('metrics',     'Impact Metrics',      'Logo impressions, audience reach, press mentions', true, 10),
  ('events',      'Event Schedule',      'Upcoming events your brand is featured at',        true, 20),
  ('programmes',  'Sponsored Programmes','Programmes you are sponsoring',                    true, 30),
  ('progress',    'Quarterly Progress',  'Programme delivery progress',                      true, 40),
  ('downloads',   'Brand Assets',        'Logos, guidelines and reports you can download',  true, 50),
  ('manager',     'Account Manager',     'Your dedicated programme contact',                 true, 60)
) AS v(key, label, description, default_enabled, position)
ON CONFLICT (key) DO NOTHING;
