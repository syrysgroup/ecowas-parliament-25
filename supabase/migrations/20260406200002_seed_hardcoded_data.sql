-- ============================================================
-- Seed: All previously hardcoded front-end data
-- Created: 2026-04-06
-- ============================================================

-- ─── Programme Pillars ───────────────────────────────────────────────────────
INSERT INTO programme_pillars (slug, emoji, color, icon_bg, route, progress_percent, lead_name, sponsors, display_order, is_active)
VALUES
  ('youth',       '🚀', 'hsl(190 35% 53%)', 'bg-ecowas-blue/10', '/programmes/youth',       52, 'K. Asante',   ARRAY['AfDB', 'UNDP'],                          1, true),
  ('trade',       '🤝', 'hsl(152 100% 26%)','bg-primary/10',      '/programmes/trade',       41, 'C. Nwosu',    ARRAY['AfDB', 'Duchess', 'WATH'],               2, true),
  ('women',       '⚡', 'hsl(340 66% 34%)', 'bg-secondary/10',   '/programmes/women',       35, 'F. Diallo',   ARRAY['UNDP'],                                  3, true),
  ('civic',       '🏛️','hsl(210 50% 30%)', 'bg-ecowas-blue/10', '/programmes/civic',       28, 'TBD',         ARRAY['EU Delegation'],                         4, true),
  ('culture',     '🎨', 'hsl(25 85% 55%)',  'bg-accent/10',      '/programmes/culture',     22, 'TBD',         ARRAY[]::text[],                                5, true),
  ('awards',      '🏆', 'hsl(50 87% 45%)',  'bg-accent/10',      '/programmes/awards',      60, 'S. Adesanya', ARRAY['AfDB'],                                  6, true),
  ('parliament',  '🌍', 'hsl(73 53% 49%)',  'bg-ecowas-lime/10', '/programmes/parliament',  45, 'K. Asante',   ARRAY['EU Delegation'],                         7, true)
ON CONFLICT (slug) DO UPDATE SET
  emoji            = EXCLUDED.emoji,
  color            = EXCLUDED.color,
  icon_bg          = EXCLUDED.icon_bg,
  route            = EXCLUDED.route,
  progress_percent = EXCLUDED.progress_percent,
  lead_name        = EXCLUDED.lead_name,
  sponsors         = EXCLUDED.sponsors,
  display_order    = EXCLUDED.display_order,
  updated_at       = now();

-- ─── Stakeholder Profiles ─────────────────────────────────────────────────────
-- image_url values reference Supabase Storage paths.
-- Upload the corresponding files from /src/assets/ to the 'avatars' bucket
-- and update these URLs accordingly.
INSERT INTO stakeholder_profiles (name, title, image_url, category, display_order, is_active)
VALUES
  ('Rt. Hon. Hadja Mémounatou Ibrahima', 'Speaker of the ECOWAS Parliament',          null, 'leadership', 1, true),
  ('Hon. Alhaji Bah',                    'Secretary General, ECOWAS Parliament',        null, 'leadership', 2, true),
  ('',                                   'Director',                                    null, 'leadership', 3, true),
  ('Mrs. Uche Duru',                     'Chief Communication Officer',                 null, 'leadership', 4, true)
ON CONFLICT DO NOTHING;

-- ─── Media Kit Items ──────────────────────────────────────────────────────────

-- Press Releases
INSERT INTO media_kit_items (type, title, subtitle, description, metadata, display_order, is_active)
VALUES
  ('press_release',
   'ECOWAS Parliament Launches 25th Anniversary Year — March 2026',
   '2 March 2026',
   'Official Launch Ceremony press release. Bilingual (English and French).',
   '{"language": "EN · FR", "release_type": "Official Launch", "highlight": true}'::jsonb,
   1, true),
  ('press_release',
   'Youth Innovation Challenge — Call for Applications Open',
   '20 March 2026',
   'Youth Innovation Challenge announcement press release.',
   '{"language": "EN", "release_type": "Programme Announcement", "highlight": false}'::jsonb,
   2, true),
  ('press_release',
   'Inaugural Session — Youth Parliament Simulation',
   '5 March 2026',
   'Inaugural session of the Youth Parliament Simulation programme.',
   '{"language": "EN · FR", "release_type": "Event Summary", "highlight": false}'::jsonb,
   3, true)
ON CONFLICT DO NOTHING;

-- Spokespeople
INSERT INTO media_kit_items (type, title, subtitle, description, metadata, display_order, is_active)
VALUES
  ('spokesperson',
   'Rt. Hon. Hadja Mémounatou Ibrahima',
   'Speaker of the ECOWAS Parliament',
   'Available for statement requests on the 25th Anniversary Programme and ECOWAS parliamentary affairs. All requests must be submitted in writing.',
   '{"initials": "SP", "colour": "bg-primary/10 text-primary"}'::jsonb,
   1, true),
  ('spokesperson',
   'Emmanuel Asante Oduro',
   'Programme Director, ECOWAS Parliament 25th Anniversary Initiatives',
   'Available for programme-specific interviews and background briefings for accredited media.',
   '{"initials": "AO", "colour": "bg-primary/10 text-primary"}'::jsonb,
   2, true),
  ('spokesperson',
   'Irene Tetteh',
   'Communications & Media Relations Officer',
   'Point of contact for all media coordination, interview scheduling, and press accreditation.',
   '{"initials": "IT", "colour": "bg-violet-100 text-violet-700"}'::jsonb,
   3, true)
ON CONFLICT DO NOTHING;

-- Event Calendar
INSERT INTO media_kit_items (type, title, subtitle, description, metadata, display_order, is_active)
VALUES
  ('event_calendar', 'Official Launch Ceremony',          'March 2026',    'Abuja, Nigeria',       '{}'::jsonb, 1, true),
  ('event_calendar', 'Youth Innovation Summit',           'May 2026',      'Accra, Ghana',         '{}'::jsonb, 2, true),
  ('event_calendar', 'Trade & SME Forums',                'June 2026',     'Lagos + Dakar',        '{}'::jsonb, 3, true),
  ('event_calendar', 'Women''s Empowerment Forum',        'July 2026',     'Freetown, Sierra Leone','{}'::jsonb, 4, true),
  ('event_calendar', 'Cultural & Civic Programmes',       'Aug–Sep 2026',  'Multiple capitals',    '{}'::jsonb, 5, true),
  ('event_calendar', 'Parliamentary Awards Ceremony',     'October 2026',  'Abuja, Nigeria',       '{}'::jsonb, 6, true),
  ('event_calendar', 'Youth Parliament Simulation Final', 'November 2026', 'Abuja, Nigeria',       '{}'::jsonb, 7, true),
  ('event_calendar', 'Anniversary Gala & Closing',        'December 2026', 'Abuja, Nigeria',       '{}'::jsonb, 8, true)
ON CONFLICT DO NOTHING;

-- Asset Packs
INSERT INTO media_kit_items (type, title, subtitle, description, metadata, display_order, is_active)
VALUES
  ('asset_pack', 'Logo Package', 'Official Logos',
   'ECOWAS Parliament and 25th Anniversary logos in SVG, PNG, and EPS formats. Light and dark variants.',
   '{"size": "4.2 MB", "icon": "image"}'::jsonb, 1, true),
  ('asset_pack', 'Photography Archive', 'Event Photography',
   'High-resolution photography from all 2026 programme events. Updated after each milestone.',
   '{"size": "128 MB", "icon": "image"}'::jsonb, 2, true),
  ('asset_pack', 'Programme Overview', 'Fact Sheet',
   'Two-page programme overview suitable for editorial and broadcast use.',
   '{"size": "320 KB", "icon": "file"}'::jsonb, 3, true),
  ('asset_pack', 'Speaker Biography', 'Official Bio',
   'Official biography and headshot of the Speaker of the ECOWAS Parliament.',
   '{"size": "85 KB", "icon": "file"}'::jsonb, 4, true),
  ('asset_pack', 'Media Accreditation Form', 'Accreditation',
   'Application form for media accreditation at flagship events.',
   '{"size": "210 KB", "icon": "file"}'::jsonb, 5, true),
  ('asset_pack', 'B-Roll Package', 'Broadcast Video',
   'HD B-roll footage from the official launch ceremony and programme installations.',
   '{"size": "18 MB", "icon": "image"}'::jsonb, 6, true)
ON CONFLICT DO NOTHING;

-- ─── Site Content: Countdown Event ───────────────────────────────────────────
INSERT INTO site_content (section_key, content)
VALUES (
  'countdown',
  '{
    "target_date": "2026-04-15T09:00:00+01:00",
    "label": "ECOWAS Parliament 25th Anniversary Ceremony — Abuja, Nigeria",
    "subtitle": "The landmark ceremony marking 25 years of the ECOWAS Parliament"
  }'::jsonb
)
ON CONFLICT (section_key) DO UPDATE
  SET content = EXCLUDED.content,
      updated_at = now();

-- ─── Site Content: Anniversary Stats ─────────────────────────────────────────
INSERT INTO site_content (section_key, content)
VALUES (
  'anniversary_stats',
  '{
    "stat1_value": "25",
    "stat1_label": "Years of ECOWAS Parliament",
    "stat2_value": "12",
    "stat2_label": "Member States",
    "stat3_value": "7",
    "stat3_label": "Programme Pillars",
    "stat4_value": "1,200+",
    "stat4_label": "Expected Delegates"
  }'::jsonb
)
ON CONFLICT (section_key) DO UPDATE
  SET content = EXCLUDED.content,
      updated_at = now();

-- ─── Site Content: Sponsor Portal — Why Sponsor ──────────────────────────────
INSERT INTO site_content (section_key, content)
VALUES (
  'sponsor_portal_why',
  '{
    "points": [
      {
        "title": "Reach 12 nations",
        "desc": "The programme operates across all ECOWAS Parliament member states, giving sponsors unparalleled visibility in a bloc of 400 million people."
      },
      {
        "title": "Align with democracy & development",
        "desc": "Associate your brand with ECOWAS Vision 2050 — youth empowerment, trade, gender equality, and civic engagement."
      },
      {
        "title": "Real ROI, fully measured",
        "desc": "Every sponsor receives a dedicated impact dashboard with logo impressions, event placements, press mentions, and audience reach updated monthly."
      },
      {
        "title": "Direct access to decision-makers",
        "desc": "Flagship events bring together heads of delegation, parliamentarians, ministers, and senior UN officials from across West Africa."
      },
      {
        "title": "Co-branding across a full calendar year",
        "desc": "40+ events, 12 months, 7 programme pillars. Your brand stays visible from the March launch to the December Gala."
      },
      {
        "title": "Media coverage and press amplification",
        "desc": "All flagship events receive press coverage. Gold and Silver sponsors are cited in official press releases and media statements."
      }
    ]
  }'::jsonb
)
ON CONFLICT (section_key) DO UPDATE
  SET content = EXCLUDED.content,
      updated_at = now();

-- ─── Site Content: Sponsor Portal — Tiers ────────────────────────────────────
INSERT INTO site_content (section_key, content)
VALUES (
  'sponsor_portal_tiers',
  '{
    "tiers": [
      {
        "name": "Gold",
        "tagline": "Lead partner visibility across the full programme",
        "class": "border-amber-300 bg-amber-50/50",
        "badgeClass": "bg-amber-100 text-amber-800",
        "featured": true,
        "benefits": [
          "Primary logo — website homepage & all 7 programme pages",
          "Speaking slot at minimum 3 flagship events",
          "Co-branded press releases for sponsored events",
          "Dedicated sponsor spotlight section on website",
          "Monthly impact report with full metrics",
          "VIP invitation — December Anniversary Gala",
          "Side event hosting opportunity (Trade Forum week)",
          "Quarterly Google Meet touchpoint with programme team",
          "Access to delegate lists (consented)",
          "Co-branded materials: banners, stage backdrop, lanyards"
        ]
      },
      {
        "name": "Silver",
        "tagline": "Programme-level partnership and event visibility",
        "class": "border-slate-300",
        "badgeClass": "bg-slate-100 text-slate-700",
        "featured": false,
        "benefits": [
          "Logo placement — 2 programme pages of your choice",
          "Speaking slot at 1 flagship event",
          "Named in programme materials and event collateral",
          "Quarterly impact report",
          "Invitation to December Anniversary Gala",
          "Bi-annual Google Meet touchpoint with programme team",
          "Co-branded materials for sponsored event"
        ]
      },
      {
        "name": "Bronze",
        "tagline": "Event presence and regional brand recognition",
        "class": "border-orange-300 bg-orange-50/30",
        "badgeClass": "bg-orange-100 text-orange-700",
        "featured": false,
        "benefits": [
          "Logo on 1 programme page (of your choice)",
          "Named in event collateral for 1 sponsored event",
          "Annual impact summary report",
          "Invitation to December Anniversary Gala"
        ]
      }
    ]
  }'::jsonb
)
ON CONFLICT (section_key) DO UPDATE
  SET content = EXCLUDED.content,
      updated_at = now();

-- ─── Site Content: Contact Info ───────────────────────────────────────────────
INSERT INTO site_content (section_key, content)
VALUES (
  'contact_info',
  '{
    "cards": [
      {
        "type": "email",
        "label": "Press & Media",
        "value": "media@ecowasparliamentinitiatives.org",
        "desc": "For press accreditation and media enquiries"
      },
      {
        "type": "email",
        "label": "Sponsor Enquiries",
        "value": "sponsors@ecowasparliamentinitiatives.org",
        "desc": "For sponsorship partnerships and tier information"
      },
      {
        "type": "email",
        "label": "General Programme",
        "value": "info@ecowasparliamentinitiatives.org",
        "desc": "For general programme and delegation enquiries"
      },
      {
        "type": "phone",
        "label": "Direct Line",
        "value": "+234 (0) 9 — 770 0000",
        "desc": "Mon–Fri 09:00–17:00 WAT"
      }
    ],
    "offices": [
      {
        "city": "Abuja",
        "country": "Nigeria",
        "role": "Programme Headquarters",
        "address": "ECOWAS Parliament Complex, Abuja, Nigeria"
      }
    ]
  }'::jsonb
)
ON CONFLICT (section_key) DO UPDATE
  SET content = EXCLUDED.content,
      updated_at = now();

-- ─── Site Content: Sponsor Portal Stats (ensure seeded) ──────────────────────
INSERT INTO site_content (section_key, content)
VALUES (
  'sponsor_portal_stats',
  '{
    "stat1_value": "400M+",
    "stat1_label": "People in the ECOWAS bloc",
    "stat2_value": "12",
    "stat2_label": "Member states reached",
    "stat3_value": "40+",
    "stat3_label": "Events across 2026",
    "stat4_value": "2.4M",
    "stat4_label": "Combined programme audience (est.)"
  }'::jsonb
)
ON CONFLICT (section_key) DO NOTHING;
