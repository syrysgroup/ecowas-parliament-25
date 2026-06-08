-- The documents table only had a policy for authenticated users to SELECT.
-- The public /documents page is unauthenticated, so anon visitors got no rows.
-- This migration adds public (anon) read access for non-restricted documents
-- and seeds the five entries that were previously hardcoded in Documents.tsx.

GRANT SELECT ON public.documents TO anon;

CREATE POLICY "Public can read non-restricted documents"
  ON public.documents FOR SELECT TO anon
  USING (restricted = false);

-- Seed the five documents that were hardcoded in apps/web/src/pages/Documents.tsx
INSERT INTO public.documents (title, category, file_type, file_url, language, restricted)
VALUES
  ('Press Release, 25th Anniversary Programme Launch', 'Press Release', 'PDF', '/docs/press-release-launch-en.pdf', 'en', false),
  ('Press Release, 25th Anniversary Programme Launch', 'Press Release', 'PDF', '/docs/press-release-launch-fr.pdf', 'fr', false),
  ('Press Release, 25th Anniversary Programme Launch', 'Press Release', 'PDF', '/docs/press-release-launch-pt.pdf', 'pt', false),
  ('ECOWAS Vision 2050 Document',                      'Policy Document', 'PDF', '/docs/vision-2050-en.pdf',           'en', false),
  ('ECOWAS Vision 2050 Document',                      'Policy Document', 'PDF', '/docs/vision-2050-fr.pdf',           'fr', false),
  ('Programme of Events, Media Announcement',          'Programme',       'PDF', '/docs/programme-events-en.pdf',      'en', false),
  ('Programme of Events, Media Announcement',          'Programme',       'PDF', '/docs/programme-events-fr.pdf',      'fr', false),
  ('Programme of Events, Media Announcement',          'Programme',       'PDF', '/docs/programme-events-pt.pdf',      'pt', false),
  ('Year-Long Commemorative Programme Overview',       'Overview',        'PDF', '/docs/programme-overview-en.pdf',    'en', false),
  ('Year-Long Commemorative Programme Overview',       'Overview',        'PDF', '/docs/programme-overview-fr.pdf',    'fr', false),
  ('Strategic Partnerships Framework',                 'Framework',       'PDF', '/docs/partnerships-framework-en.pdf','en', false)
ON CONFLICT DO NOTHING;
