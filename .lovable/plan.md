

# Plan: Redesign Timeline Page + Add Parliamentary Awards Programme

## Summary

Completely rebuild the Timeline page to be a rich, interactive, programme-integrated experience. Add a new Parliamentary Awards programme. Upgrade Culture.tsx (currently using the basic template) to match the quality of other programme pages.

---

## 1. Timeline Page Redesign (`src/pages/Timeline.tsx`)

Replace the plain vertical timeline with a modern, visually distinct layout:

**Hero**: Full-width gradient hero with animated stat counters (11 months, 7+ countries, 6 programme pillars, 1 grand finale).

**Interactive Timeline**: Horizontal month-by-month layout on desktop (scrollable), vertical on mobile. Each event card includes:
- Month/date header with country flags
- Programme pillar badge linking to the relevant programme page (e.g., "Youth Innovation" links to `/programmes/youth`)
- Event description with richer content
- Color-coded left border matching the programme pillar's accent color
- Announcement photos where relevant (e.g., March event uses `/announcement/` photos if available; since directory is empty, use placeholder gradients with programme icons)

**Programme Integration**: Each timeline event gets a `programme` field linking to the pillar it belongs to, with a clickable badge. Events data expanded to include:
- Programme pillar association (youth/trade/women/civic/culture/parliament/awards)
- Key deliverables for each month
- Venue/city details
- A "highlight" flag for major milestones

**Filter Bar**: Horizontal filter chips to show All / by programme pillar, allowing users to see only events for a specific programme.

**Photo Gallery Section**: "Announcement Highlights" section at the bottom showing categorized announcement event photos with captions (labeled as "Official Launch — March 2026").

---

## 2. Parliamentary Awards Programme

### New Page: `src/pages/programmes/Awards.tsx`

A rich, custom-built page (not using ProgrammePageTemplate) following the same design pattern as Youth.tsx, Trade.tsx, etc:

**Hero**: Gradient hero with Trophy icon, stats (7 award categories, 15 countries, November 2026 ceremony).

**Overview**: The ECOWAS Parliamentary Awards honour serving and former members of the ECOWAS Parliament who have demonstrated exceptional leadership, legislative impact, and service to regional integration.

**Award Categories** (card grid):
1. **Legislative Excellence Award** — For outstanding contributions to lawmaking and regional policy development
2. **Champion of Integration Award** — For advancing ECOWAS regional integration goals
3. **Youth Advocacy Award** — For parliamentarians championing youth participation and empowerment
4. **Women's Empowerment Award** — For advancing gender equality and women's economic participation
5. **Peace & Security Award** — For contributions to conflict prevention and regional stability
6. **Community Service Award** — For exceptional constituency engagement and civic outreach
7. **Lifetime Achievement Award** — Honouring distinguished parliamentary service over a career

**Nomination Process**: Step-by-step cards (Nomination opens, Review committee, Shortlisting, Public recognition, Ceremony at Grand Finale).

**Past Honourees Section**: Placeholder grid with generated content — 4-6 sample honourees with names, countries, award category, and year.

**Ceremony Details**: November 2026, Abuja, Nigeria — part of the Grand Finale celebrations. Card with venue, date, dress code, and programme highlights.

**Objectives**: Recognise parliamentary excellence, inspire current and future legislators, celebrate 25 years of democratic governance.

### Integration Points:
- Add "Parliamentary Awards" to `src/components/home/PillarsGrid.tsx` as a 7th pillar (Trophy icon, `bg-ecowas-yellow/10 text-ecowas-yellow`)
- Add route `/programmes/awards` to `src/App.tsx`
- Add to navbar dropdown in `src/components/layout/Navbar.tsx`
- Add Awards events to Timeline data

---

## 3. Culture Page Upgrade (`src/pages/programmes/Culture.tsx`)

Currently uses basic `ProgrammePageTemplate`. Rebuild as a full custom page matching the quality of Youth/Trade/Women/Civic:

**Hero**: Custom hero with HeroIllustration theme (add "culture" theme to HeroIllustration), Palette icon, stats (5 countries, 8 art forms, September 2026).

**Content Sections**:
- **Art Forms Grid**: Cards for Fashion, Film, Food, Literature, Music, Visual Art, Sport, Performance — each with icon and description
- **Festival Programme**: Cabo Verde September 2026 schedule with day-by-day events
- **Featured Artists/Curators**: 3-4 placeholder profiles with names, countries, disciplines
- **Cultural Exchange Map**: Country badges showing what each country contributes (e.g., Nigeria: Nollywood + Afrobeats, Ghana: Kente + Highlife)
- **Objectives & CTA**

### HeroIllustration Update (`src/components/shared/HeroIllustration.tsx`):
Add "culture" theme with art-related SVG decorations (music notes, paint palette shapes, film reel outlines).

---

## 4. Timeline Event Data Expansion

Expand from 10 events to ~14, including Awards-related milestones and richer descriptions:

- January: Programme Kick-off (no specific pillar)
- February: Media Partnerships (no specific pillar)  
- March: Official Launch + Awards Nominations Open (ceremony, awards)
- April: Smart Challenge + Media Training (youth, civic)
- May: Simulated Youth Parliament (parliament)
- June: ECOWAS Caravan Phase 1 (civic)
- July: ECOWAS Caravan Phase 2 + Women's Workshops (civic, women)
- August: Trade & SME Forums (trade)
- September: Cultural Festival — Cabo Verde (culture)
- October: TV Game Show + Awards Shortlist Announced (civic, awards)
- November: Grand Finale + Awards Ceremony (all pillars)

---

## Files to Create
1. `src/pages/programmes/Awards.tsx` — Full awards programme page

## Files to Modify
1. `src/pages/Timeline.tsx` — Complete redesign with programme integration + filters
2. `src/pages/programmes/Culture.tsx` — Upgrade from template to full custom page
3. `src/components/shared/HeroIllustration.tsx` — Add "culture" theme
4. `src/components/home/PillarsGrid.tsx` — Add Awards as 7th pillar
5. `src/App.tsx` — Add `/programmes/awards` route
6. `src/components/layout/Navbar.tsx` — Add Awards to programmes dropdown

