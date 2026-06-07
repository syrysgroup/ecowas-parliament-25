
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_label   text NOT NULL,
  sort_order    integer NOT NULL DEFAULT 0,
  country       text NOT NULL DEFAULT '',
  city          text NOT NULL DEFAULT '',
  title         text NOT NULL,
  description   text NOT NULL DEFAULT '',
  programme     text NOT NULL DEFAULT 'general',
  deliverables  text[] NOT NULL DEFAULT '{}',
  highlight     boolean NOT NULL DEFAULT false,
  is_published  boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.timeline_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timeline_events TO authenticated;
GRANT ALL ON public.timeline_events TO service_role;

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published timeline events"
  ON public.timeline_events FOR SELECT
  USING (is_published = true);

CREATE POLICY "Staff can read all timeline events"
  ON public.timeline_events FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'website_editor'::app_role)
  );

CREATE POLICY "Staff can insert timeline events"
  ON public.timeline_events FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'website_editor'::app_role)
  );

CREATE POLICY "Staff can update timeline events"
  ON public.timeline_events FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'website_editor'::app_role)
  );

CREATE POLICY "Staff can delete timeline events"
  ON public.timeline_events FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP TRIGGER IF EXISTS trg_timeline_events_updated_at ON public.timeline_events;
CREATE TRIGGER trg_timeline_events_updated_at
  BEFORE UPDATE ON public.timeline_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_timeline_events_sort ON public.timeline_events(sort_order);
CREATE INDEX IF NOT EXISTS idx_timeline_events_published ON public.timeline_events(is_published) WHERE is_published = true;

INSERT INTO public.timeline_events (sort_order, month_label, country, city, title, description, programme, deliverables, highlight) VALUES
(10, 'January 2026', '🇳🇬 Nigeria', 'Abuja', 'Programme Kick-off & Strategic Planning',
  'High-level coordination sessions bring together programme directors, national focal points, and ECOWAS officials to finalise the year-long implementation roadmap. Partnership agreements are signed and the programme secretariat is established in Abuja.',
  'general', ARRAY['Implementation roadmap finalised','Secretariat established','Partnership MOUs signed'], false),
(20, 'February 2026', '🇳🇬 Nigeria', 'Abuja', 'Media Partnerships & Brand Launch',
  'Engagement with continental and regional media houses to build the communications infrastructure. Brand identity, social media channels, and a digital toolkit are unveiled. Journalist training workshops prepare a cohort of reporters to cover the anniversary programme.',
  'general', ARRAY['Brand identity unveiled','Media partnership agreements','Digital toolkit launched'], false),
(30, 'March 2026', '🇳🇬 Nigeria', 'Abuja', 'Official Launch & Awards Nominations Open',
  'The 25th Anniversary programme is officially launched at a press conference at Onomo Allure Abuja AATC Hotel on 5th March, with key stakeholders, diplomats, and programme champions in attendance. Simultaneously, nominations for the inaugural AWALCO Parliamentary Awards open across all 12 Member States.',
  'awards', ARRAY['Public launch event','Awards nominations portal opens','Stakeholder reception'], true),
(40, 'April 2026', '🇬🇭 Ghana / 🇸🇳 Senegal', 'Accra & Dakar', 'ECOWAS Smart Challenge & Media Training Forum',
  'National youth innovation competitions begin in Ghana and Senegal, with hundreds of young entrepreneurs pitching solutions to regional challenges. In Dakar, a regional media training forum gathers journalists from 12 countries to deepen coverage of parliamentary governance.',
  'youth', ARRAY['National competitions launched','Media training for 50+ journalists','Innovation track registrations'], true),
(50, 'May 2026', '🇨🇮 Côte d''Ivoire', 'Abidjan', 'Simulated Youth Parliament',
  'Over 150 young people from across West Africa take their seats in a simulated ECOWAS Parliament Initiatives session in Abidjan. Delegates debate real policy issues — trade integration, climate action, digital rights — and produce resolutions presented to the Rt. Hon. Speaker. This event launches the vision of a permanent ECOWAS Youth Parliament.',
  'parliament', ARRAY['150+ youth delegates','Policy resolutions adopted','Youth Parliament roadmap'], true),
(60, 'June 2026', 'Multiple States', 'Regional', 'ECOWAS Caravan Phase 1 — Community Outreach',
  'The ECOWAS Civic Education Caravan launches its first phase, travelling through communities in Nigeria, Ghana, and Senegal. Mobile exhibition units visit airports, universities, markets, and transit hubs, engaging citizens on the role and impact of the ECOWAS Parliament Initiatives through interactive displays and town halls.',
  'civic', ARRAY['3 countries covered','Community town halls','Interactive exhibitions'], false),
(70, 'July 2026', '🇹🇬 Togo / 🇸🇱 Sierra Leone', 'Lomé & Freetown', 'Caravan Phase 2 & Women''s Economic Workshops',
  'The Caravan continues through Togo and Sierra Leone while women-focused trade and entrepreneurship workshops launch in parallel. Women entrepreneurs gain access to cross-border trade facilitation tools, mentorship circles, and micro-financing information sessions.',
  'women', ARRAY['Women''s trade workshops','Caravan extends to 5 countries','Mentorship circles launched'], false),
(80, 'August 2026', '🇨🇮 🇬🇭 🇹🇬 🇸🇱 🇳🇬', 'Abidjan, Accra, Lomé, Freetown, Lagos', 'Trade & SME Forums Across West Africa',
  'Business-to-business (B2B) forums bring together SME owners, investors, and policymakers in five cities. Pilot trade corridors are demonstrated — showing how simplified customs procedures and digital platforms can accelerate intra-regional commerce. Key sectors: agribusiness, textiles, fintech, and logistics.',
  'trade', ARRAY['B2B matchmaking forums','Pilot trade corridor demos','Policy dialogues with regulators'], true),
(90, 'September 2026', '🇨🇻 Cabo Verde', 'Praia', 'West African Cultural & Creative Festival',
  'Cabo Verde hosts a week-long celebration of West African cultural diversity — fashion shows, film screenings, literary readings, culinary showcases, music concerts, visual art exhibitions, and sporting events. The festival serves as a creative bridge, highlighting the shared cultural heritage that unites the region.',
  'culture', ARRAY['Cultural festival programme','Artist residency exchanges','Documentary filming'], true),
(100, 'October 2026', 'Multiple States', 'Regional Broadcast', 'ECOWAS TV Game Show & Awards Shortlist',
  'Civic education takes to the airwaves with the ECOWAS TV Game Show — a regional broadcast blending learning with entertainment. Contestants from different Member States answer questions about ECOWAS history, governance, and regional integration. The Parliamentary Awards shortlist is publicly announced, building anticipation for the Grand Finale.',
  'civic', ARRAY['TV Game Show broadcast','Awards shortlist announced','Regional viewership campaign'], false),
(110, 'November 2026', '🇳🇬 Nigeria', 'Abuja', 'Grand Finale & Awards Ceremony',
  'Leaders, partners, youth champions, entrepreneurs, cultural ambassadors, and citizens gather in Abuja for the closing ceremony of the 25th Anniversary programme. The evening features the inaugural AWALCO Parliamentary Awards gala, documentary storytelling, reflections on 25 years of democratic governance, and a vision statement for the next quarter-century of the ECOWAS Parliament Initiatives.',
  'awards', ARRAY['Awards gala ceremony','Anniversary documentary premiere','Vision 2050 statement'], true)
ON CONFLICT DO NOTHING;

INSERT INTO public.site_content (section_key, content) VALUES
  ('home_marquee',              '{"items":[]}'::jsonb),
  ('home_parliament25',         '{"badge":"","title":"","title_accent":"","description":"","cta_label":"","cta_href":"","image_url":""}'::jsonb),
  ('home_marketplace',          '{"badge":"","title":"","title_accent":"","subtitle":"","cta_label":"","cta_href":"","feature1_label":"","feature1_sub":"","feature2_label":"","feature2_sub":"","feature3_label":"","feature3_sub":""}'::jsonb),
  ('home_sponsor_placeholder',  '{"badge":"","title":"","description":"","cta_label":"","cta_href":"","image_url":""}'::jsonb),
  ('home_events',               '{"badge":"","title":"","subtitle":"","cta_label":"","cta_href":""}'::jsonb),
  ('home_latest_news',          '{"badge":"","title":"","subtitle":"","empty_state":"","cta_label":"","cta_href":""}'::jsonb),
  ('home_partners_strip',       '{"title":""}'::jsonb),
  ('timeline_hero',             '{"badge":"","title":"","title_accent":"","description":"","stat1_value":"","stat1_label":"","stat2_value":"","stat2_label":"","stat3_value":"","stat3_label":"","stat4_value":"","stat4_label":""}'::jsonb),
  ('timeline_launch_highlights','{"badge":"","title":"","subtitle":"","items":[]}'::jsonb),
  ('timeline_cta',              '{"title":"","description":"","buttons":[]}'::jsonb)
ON CONFLICT (section_key) DO NOTHING;

UPDATE public.site_content
SET content = content
  || jsonb_build_object('cta_label', COALESCE(content->>'cta_label',''),
                        'cta_href',  COALESCE(content->>'cta_href',''),
                        'image_url', COALESCE(content->>'image_url',''))
WHERE section_key = 'anniversary';

UPDATE public.site_content
SET content = content
  || jsonb_build_object('image_url', COALESCE(content->>'image_url',''),
                        'cta_label', COALESCE(content->>'cta_label',''),
                        'cta_href',  COALESCE(content->>'cta_href',''))
WHERE section_key = 'parliament_tour';

UPDATE public.site_content
SET content = content
  || jsonb_build_object('hero_image_url', COALESCE(content->>'hero_image_url',''),
                        'intro_eyebrow',  COALESCE(content->>'intro_eyebrow',''))
WHERE section_key = 'parliament_initiative';
