

## Plan: Multiple Updates Across Homepage, Navigation, Stakeholders, and Content

### Summary of Changes

This plan covers 7 distinct tasks the user requested:

1. **Combine "Parliament at 25" and "About the 25th Anniversary" into one section** with the P@25 logo prominent in front of a circular white shape
2. **Generate placeholder images for Partners & Sponsors section** per programme tab
3. **News cards redesign** — add 1:1 square Instagram-style placeholder images to news cards (both homepage LatestNews and /news page)
4. **Stakeholders page fixes** — reduce Speaker photo size, add Secretary General card before Mrs Uche Duru
5. **Rename "Parliamentary Awards" → "AWALCO Parliamentary Awards"** everywhere
6. **Add Volunteer to main menu**
7. **Redesign and reorganize the main navigation**

---

### 1. Combine Parliament25Section + AboutSection into One Section

- Delete `Parliament25Section.tsx` and `AboutSection.tsx` as separate components
- Create a new `AnniversarySection.tsx` that merges both:
  - Left side: Parliament@25 logo placed prominently over a large circular white shape (a CSS circle with white bg + shadow behind the logo image)
  - Right side: Combined text — the anniversary identity writeup + about content (trimmed to avoid redundancy), stats grid below
  - Tags row at the bottom
- Update `Index.tsx` to import the new combined section instead of the two old ones

### 2. Add Generated Placeholder Images to Partners & Sponsors Section

- Use the AI image generation API (Nano banana) to generate 7 programme-specific placeholder images (youth, trade, women, civic, culture, awards, yparl)
- Save them as assets and reference them in `SponsorsSection.tsx` as a visual header/illustration for each programme tab content area, replacing the inline SVG `ProgrammeIllustration`

### 3. News Cards with 1:1 Instagram-Style Photos

- Generate 3 placeholder news images (1:1 square) using AI image generation
- Update `LatestNews.tsx` homepage component: replace the gradient placeholder div with the square image
- Update `News.tsx` page: same treatment — replace gradient header with 1:1 image
- Add 6 placeholder images for the news page articles

### 4. Stakeholders Page Adjustments

- **Speaker photo**: Change from `w-1/2` to a smaller width like `w-80 max-w-sm` and reduce the aspect ratio so it's prominent but not overwhelming
- **Add Secretary General card**: Insert a new card before Mrs. Uche Duru for the Secretary General of ECOWAS Parliament. Generate a placeholder portrait image for this card
- Reorder the `ecowasStakeholders` array: Speaker → Secretary General → Mrs. Uche Duru → Dr. Kabeer Garba

### 5. Rename Parliamentary Awards → AWALCO Parliamentary Awards

Files to update:
- `src/lib/i18n.tsx` — all 3 locale entries for `prog.awards`
- `src/pages/programmes/Awards.tsx` — title, descriptions
- `src/pages/Timeline.tsx` — pillar label and event descriptions
- `src/components/home/PillarsGrid.tsx` — title
- `src/components/home/MarqueeStrip.tsx` — marquee text
- `src/components/home/SponsorsSection.tsx` — awards programme label
- `src/pages/Events.tsx` — event title referencing awards

### 6. Add Volunteer to Main Menu

- Add "Volunteer" as a top-level nav item in the `navLinks` array in `Navbar.tsx`
- Add translation key `nav.volunteer` to i18n (all 3 locales)

### 7. Redesign & Reorganize Main Navigation

Proposed new structure:
- **Home** (top-level link)
- **About** (top-level link)
- **Programmes** (dropdown): Youth Innovation, Trade & SME Forums, Women's Empowerment, Civic Education, Culture & Creativity, AWALCO Parliamentary Awards, Youth Parliament
- **Events & Media** (dropdown): Events, Timeline, News, Documents, Press & Media Kit
- **People** (dropdown): Stakeholders, Team, Partners
- **Volunteer** (top-level link)
- **Contact** (top-level link)

CTA button remains "Partner with us".

This reorganization:
- Elevates Volunteer to top-level visibility
- Groups media/events content together under one dropdown
- Renames "Stakeholders" dropdown to "People" for clarity
- Adds Partners link under People
- Contact becomes a visible top-level link

### Technical Details

- **Image generation**: Will use `google/gemini-2.5-flash-image` via the Lovable AI gateway to generate placeholder images. Images will be saved as assets in `src/assets/` or `public/` and imported where needed.
- **Combined section**: Uses Tailwind for the circular white shape behind the logo (`rounded-full bg-white shadow-xl w-64 h-64 flex items-center justify-center`).
- **News card images**: Will use `aspect-square object-cover` for the 1:1 ratio.
- **No backend changes** — all updates are frontend/visual only.

