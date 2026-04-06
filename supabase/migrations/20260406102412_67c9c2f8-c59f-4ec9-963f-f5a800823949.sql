-- Seed site_content (upsert via ON CONFLICT)
-- First ensure unique constraint exists on section_key
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_content_section_key_key') THEN
    ALTER TABLE public.site_content ADD CONSTRAINT site_content_section_key_key UNIQUE (section_key);
  END IF;
END $$;

INSERT INTO public.site_content (section_key, content) VALUES
('stats', '{"memberStates": 12, "yearsRepresentation": 25, "programmes": 7, "expectedDelegates": 1200, "awardCategories": 3}'::jsonb),
('speaker', '{"name": "Hon. Memounatou Ibrahima", "title": "Speaker of the ECOWAS Parliament", "quote": "The ECOWAS Parliament remains committed to fostering regional integration, democratic governance, and the empowerment of all citizens across West Africa.", "image_url": ""}'::jsonb),
('quote', '{"text": "Together, we are building a West Africa where every citizen has a voice, every community has opportunity, and every nation contributes to our shared prosperity.", "author": "ECOWAS Parliament", "role": "Vision Statement"}'::jsonb),
('countdown', '{"target_date": "2026-07-15", "label": "25th Anniversary Summit", "subtitle": "Celebrating 25 years of parliamentary democracy in West Africa"}'::jsonb),
('pillars', '{"title": "Our Programmes", "subtitle": "Seven flagship initiatives driving regional integration, youth empowerment, and democratic governance across West Africa."}'::jsonb),
('did_you_know', '{"fact1": "The ECOWAS Parliament was established in 2000 and held its first session in 2002 in Abuja, Nigeria.", "fact2": "ECOWAS represents over 400 million citizens across 12 member states in West Africa.", "fact3": "The Parliament comprises 115 seats distributed among member states based on population and equality principles.", "fact4": "ECOWAS promotes free movement of goods and people across borders in the region."}'::jsonb),
('anniversary', '{"badge": "Parliament@25", "heading_prefix": "Celebrating", "p1": "For 25 years, the ECOWAS Parliament has been the voice of the people of West Africa — championing democracy, regional integration, and good governance.", "p2": "From legislative oversight to citizen engagement, the Parliament has evolved into a vital institution bridging the gap between governments and the 400 million citizens of the ECOWAS region.", "p3": "Join us as we celebrate this milestone and chart the course for the next 25 years of parliamentary democracy in West Africa."}'::jsonb),
('newsletter', '{"title": "Stay Connected", "subtitle": "Get the latest updates on ECOWAS Parliament activities, events, and programmes delivered to your inbox.", "button_text": "Subscribe Now"}'::jsonb),
('sponsor_cta', '{"title": "Become a Partner", "description": "Join leading organisations supporting democratic governance and regional integration in West Africa.", "button_text": "Explore Opportunities", "button_url": "/contact"}'::jsonb),
('implementing_partners', '{"title": "Implementing Partners", "description": "Strategic partners delivering programme activities across the ECOWAS region."}'::jsonb),
('sponsor_portal_stats', '{"stat1_value": "400M+", "stat1_label": "Citizens Reached", "stat2_value": "12", "stat2_label": "Member States", "stat3_value": "40+", "stat3_label": "Partner Organisations", "stat4_value": "2.4M", "stat4_label": "Digital Engagement"}'::jsonb)
ON CONFLICT (section_key) DO UPDATE SET content = EXCLUDED.content;

-- Seed events
INSERT INTO public.events (title, date, location, tag, tag_color, description, is_published, registration_type, programme) VALUES
('25th Anniversary Summit', '2026-07-15T09:00:00Z', 'Abuja, Nigeria', 'Flagship', 'primary', 'Celebrating 25 years of the ECOWAS Parliament with heads of state, parliamentary delegations, and civil society leaders from across West Africa.', true, 'form', 'parliament'),
('ECOWAS Trade & SME Summit 2026', '2026-08-20T09:00:00Z', 'Accra, Ghana', 'Trade', 'blue', 'Connecting SMEs across West Africa with market access, financing, and cross-border trade opportunities.', true, 'form', 'trade'),
('Smart Challenge National Finals', '2026-09-10T08:00:00Z', 'Lagos, Nigeria', 'Youth', 'amber', 'The national finals of the ECOWAS Parliament Smart Challenge — 12 nations compete in the premier academic competition.', true, 'external', 'youth'),
('Innovators Challenge Pitch Day', '2026-10-05T10:00:00Z', 'Dakar, Senegal', 'Innovation', 'violet', 'Top young innovators from across ECOWAS present solutions to regional challenges before a panel of investors and leaders.', true, 'form', 'youth'),
('Women Leadership Forum', '2026-11-18T09:00:00Z', 'Lomé, Togo', 'Women', 'red', 'Advancing gender equality and women''s economic empowerment through policy dialogue, mentorship, and networking.', true, 'form', 'women');

-- Seed news_articles
INSERT INTO public.news_articles (title, slug, excerpt, content, status, published_at) VALUES
('ECOWAS Parliament Celebrates 25 Years of Democratic Governance', 'ecowas-parliament-25-years', 'The ECOWAS Parliament marks a quarter century of fostering democratic governance and regional integration across West Africa.', '<p>The ECOWAS Parliament is celebrating its 25th anniversary, marking a significant milestone in the pursuit of democratic governance and regional integration in West Africa.</p><p>Established in 2000 and inaugurated in 2002, the Parliament has played a pivotal role in promoting peace, stability, and good governance across the 12 member states of the Economic Community of West African States.</p>', 'published', '2026-03-15T10:00:00Z'),
('Smart Challenge 2026: Registration Opens for Schools Across West Africa', 'smart-challenge-2026-registration', 'The ECOWAS Parliament Smart Challenge opens registration for secondary schools across all 12 member states.', '<p>Registration is now open for the 2026 ECOWAS Parliament Smart Challenge, the premier academic competition for secondary school students across West Africa.</p><p>Schools from all 12 ECOWAS member states are invited to register their students for this exciting competition that tests knowledge in ECOWAS & History, Mathematics, Science, and Economics.</p>', 'published', '2026-03-20T14:00:00Z'),
('Trade Summit to Connect 500+ SMEs Across ECOWAS Region', 'trade-summit-500-smes', 'The upcoming ECOWAS Trade & SME Summit aims to connect over 500 small and medium enterprises across the region.', '<p>The ECOWAS Parliament Trade & SME Summit, scheduled for August 2026 in Accra, Ghana, is set to bring together over 500 small and medium enterprises from across the ECOWAS region.</p><p>The summit will focus on cross-border trade facilitation, access to finance, and digital trade platforms.</p>', 'published', '2026-04-01T09:00:00Z'),
('Youth Parliament Programme Expands to All 12 Member States', 'youth-parliament-expansion', 'The ECOWAS Youth Parliament programme announces expansion to include representation from all member states.', '<p>The ECOWAS Youth Parliament programme has announced its expansion to include young parliamentary representatives from all 12 member states.</p><p>This expansion ensures that every ECOWAS nation has a voice in the youth parliamentary process, strengthening democratic engagement among young West Africans.</p>', 'published', '2026-04-05T11:00:00Z');

-- Seed sponsors
INSERT INTO public.sponsors (name, slug, tier, programmes, description, is_published, sort_order) VALUES
('African Development Bank', 'afdb', 'presenting', ARRAY['trade','youth'], 'Pan-African development finance institution fostering economic growth across the continent.', true, 1),
('UNDP West Africa', 'undp', 'gold', ARRAY['parliament','civic','women'], 'United Nations Development Programme supporting sustainable development in West Africa.', true, 2),
('NASENI', 'naseni', 'gold', ARRAY['youth'], 'National Agency for Science and Engineering Infrastructure, promoting technology and innovation.', true, 3),
('SMEDAN', 'smedan', 'silver', ARRAY['trade'], 'Small and Medium Enterprises Development Agency, empowering SMEs across Nigeria.', true, 4),
('Government of Canada', 'canada', 'gold', ARRAY['women','civic'], 'Supporting gender equality and democratic governance initiatives in West Africa.', true, 5),
('SYRYS Technologies', 'syrys', 'silver', ARRAY['youth'], 'Technology partner powering the Smart Challenge digital platform.', true, 6),
('Resident Technology', 'resident-technology', 'silver', ARRAY['youth'], 'Digital innovation partner for youth empowerment programmes.', true, 7),
('Duchess International Hospital', 'duchess', 'bronze', ARRAY['women'], 'Healthcare partner supporting women''s health and wellness initiatives.', true, 8),
('WATH', 'wath', 'silver', ARRAY['trade'], 'West Africa Trade Hub facilitating cross-border trade and investment.', true, 9),
('EU Delegation to Nigeria', 'eu-delegation', 'gold', ARRAY['parliament','civic'], 'European Union supporting democratic governance and institutional capacity building.', true, 10);

-- Seed partners
INSERT INTO public.partners (name, slug, partner_type, description, is_published, sort_order, lead_name, lead_role) VALUES
('ECOWAS Commission', 'ecowas-commission', 'institutional', 'The executive body of the Economic Community of West African States, coordinating regional integration efforts.', true, 1, NULL, NULL),
('AWALCO', 'awalco', 'institutional', 'Association of West African Living Conditions Observatory — institutional research partner for policy development.', true, 2, NULL, NULL),
('CMD Consulting', 'cmd-consulting', 'implementing', 'Strategic consulting and programme management partner delivering activities across ECOWAS member states.', true, 1, 'Dr. Akin Ogunlade', 'Programme Director'),
('VALCERTRA', 'valcertra', 'implementing', 'Value certification and trade facilitation partner supporting cross-border commerce.', true, 2, 'Marie Diallo', 'Operations Lead'),
('Global African Business Association', 'gaba', 'implementing', 'Business networking and trade promotion partner connecting enterprises across the African diaspora.', true, 3, 'Kofi Mensah', 'Partnership Lead');