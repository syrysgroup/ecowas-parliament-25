-- ============================================================
-- CRM Gaps: Seed demo data for sponsors and partners
-- All using ON CONFLICT (slug) DO NOTHING — safe to re-run
-- ============================================================

-- SPONSORS (4 records from previously hardcoded SponsorPage.tsx)
INSERT INTO public.sponsors
  (name, slug, acronym, about, description, tier, website, email,
   programmes, is_published, sort_order)
VALUES
  (
    'National Agency for Science and Engineering Infrastructure',
    'naseni',
    'NASENI',
    'NASENI is Nigeria''s foremost agency for science and engineering infrastructure development. As a Gold sponsor of the ECOWAS Parliament 25th Anniversary Programme, NASENI is empowering the next generation of West African innovators through technology bootcamps, startup incubation, and the ECOWAS Smart Challenge.',
    'Supporting youth innovation and technology development across West Africa through the ECOWAS Parliament 25th Anniversary Programme.',
    'gold',
    'https://naseni.gov.ng',
    null,
    ARRAY['Youth Innovation', 'ECOWAS Smart Challenge'],
    true,
    1
  ),
  (
    'Small and Medium Enterprises Development Agency of Nigeria',
    'smedan',
    'SMEDAN',
    'SMEDAN drives SME development policy and programme implementation in Nigeria. Through the 25th Anniversary Programme, SMEDAN supports trade facilitation forums, export readiness programmes, and women-led enterprise development across ECOWAS member states.',
    'Facilitating SME growth and cross-border trade linkages across the ECOWAS region.',
    'silver',
    'https://smedan.gov.ng',
    null,
    ARRAY['Trade & SME Forums', 'Women''s Entrepreneurship'],
    true,
    2
  ),
  (
    'Providus Bank',
    'providus-bank',
    'Providus',
    'Providus Bank is a leading Nigerian commercial bank providing innovative financial solutions. As a programme sponsor, Providus Bank supports cross-border trade finance initiatives, the AWALCO Parliamentary Awards, and financial literacy programmes for young West Africans.',
    'Banking partner for the 25th Anniversary Programme, supporting financial inclusion and trade finance across West Africa.',
    'gold',
    'https://providusbank.com',
    null,
    ARRAY['Trade & SME Forums', 'Awards Ceremony'],
    true,
    3
  ),
  (
    'Alliance Economic Research and Ethics',
    'alliance-economic-research',
    'AERE',
    'Alliance Economic Research and Ethics (AERE) is a policy research organisation focused on democratic governance, economic ethics, and regional integration in Africa. AERE provides analytical support for the programme''s civic education campaigns, parliamentary simulations, and governance strengthening initiatives.',
    'Providing research and policy analysis for democratic governance and economic integration programmes.',
    'silver',
    'https://allianceresearch.org',
    'info@allianceresearch.org',
    ARRAY['Civic Education', 'Youth Parliament'],
    true,
    4
  )
ON CONFLICT (slug) DO NOTHING;


-- PARTNERS (5 records from previously hardcoded PartnerPage.tsx)
INSERT INTO public.partners
  (name, slug, description, long_description, partner_type, website,
   lead_name, lead_role, is_published, sort_order)
VALUES
  (
    'Duchess NL',
    'duchess-nl',
    'Leading implementing partner coordinating the programme direction and executive partnerships.',
    ARRAY[
      'Duchess NL serves as the lead implementing partner for the ECOWAS Parliament 25th Anniversary programme, coordinating the overall programme direction, executive partnerships, and stakeholder engagement strategy.',
      'Under the leadership of Dr. Victoria Akai IIPM, Duchess NL brings extensive experience in international programme management, diplomatic engagement, and institutional partnership development across West Africa and beyond.',
      'The organisation is responsible for aligning the strategic vision of the anniversary programme with the broader goals of the ECOWAS Parliament, ensuring that each pillar delivers meaningful impact for the region''s citizens.'
    ],
    'implementing',
    '',
    'Dr. Victoria Akai IIPM',
    'CEO',
    true,
    1
  ),
  (
    'Borderless Trade & Investment',
    'borderless-trade',
    'Driving trade diplomacy, regional engagement, and private-sector mobilisation.',
    ARRAY[
      'Borderless Trade & Investment is a strategic implementing partner driving trade diplomacy, regional engagement, and private-sector mobilisation for the 25th Anniversary programme.',
      'Led by Dr. Olori Boye-Ajayi, the organisation specialises in cross-border trade facilitation, economic integration advocacy, and connecting West African enterprises with continental and global markets.',
      'Their work on the anniversary programme focuses on the Trade & SME pillar, facilitating policy dialogue, market access forums, and entrepreneurship support that align with the African Continental Free Trade Area (AfCFTA) implementation goals.'
    ],
    'implementing',
    '',
    'Dr. Olori Boye-Ajayi',
    'Managing Partner',
    true,
    2
  ),
  (
    'CMD Tourism & Trade Enterprises',
    'cmd-tourism',
    'Supporting programming, event experience, and community-facing delivery.',
    ARRAY[
      'CMD Tourism & Trade Enterprises supports the programming, event experience, and community-facing delivery of the ECOWAS Parliament 25th Anniversary celebration.',
      'Under the leadership of Madam Cecile Mambo Doumbe, CMD brings deep expertise in tourism development, trade enterprise management, media production, and large-scale event management across the West African region.',
      'The organisation plays a pivotal role in ensuring that anniversary events are accessible, well-produced, and reflective of the cultural diversity and shared heritage of ECOWAS member states.'
    ],
    'implementing',
    '',
    'Madam Cecile Mambo Doumbe',
    'CEO',
    true,
    3
  ),
  (
    'AWALCO',
    'awalco',
    'A professional body uniting legislative journalists across West Africa.',
    ARRAY[
      'The Association of West African Legislative Correspondents (AWALCO) is a professional body that brings together legislative journalists and media practitioners across the West African sub-region.',
      'AWALCO plays a critical role in strengthening parliamentary reporting, promoting media freedom, and enhancing public accountability in governance across ECOWAS member states.',
      'As an institutional partner of the 25th Anniversary programme, AWALCO provides media engagement support, ensuring comprehensive coverage of anniversary events and amplifying the Parliament''s message to citizens across the region.'
    ],
    'institutional',
    '',
    '',
    'Institutional Partner',
    true,
    4
  ),
  (
    'Alliance for Economic Research and Ethics LTD/GTE',
    'alliance-economic-research-partner',
    'An organisation dedicated to evidence-based economic research and ethical governance.',
    ARRAY[
      'The Alliance for Economic Research and Ethics LTD/GTE is dedicated to advancing evidence-based economic research, ethical governance practices, and institutional strengthening across Africa.',
      'The organisation supports policy development through rigorous research, capacity building, and advocacy for transparent and accountable governance structures.',
      'As an institutional partner of the 25th Anniversary programme, the Alliance contributes research expertise and policy analysis to support the Parliament''s programmatic goals, particularly in areas of economic integration and governance reform.'
    ],
    'institutional',
    '',
    '',
    'Institutional Partner',
    true,
    5
  )
ON CONFLICT (slug) DO NOTHING;
