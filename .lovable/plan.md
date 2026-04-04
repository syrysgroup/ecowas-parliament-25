

## Plan: Multiple UI Enhancements Across Index, Trade, Youth, and Country Flags

### Summary of Changes

Six distinct changes across the project:

---

### 1. Trade Page — CTA Button After Hero

Add an "Apply Now" call-to-action button strip immediately after the hero section (before Programme Overview). This will be a prominent banner with the same apply link (`https://www.t2tprogramme.com/`) that currently exists only at the bottom of the page.

**File:** `src/pages/programmes/Trade.tsx`
- Insert a CTA banner section between the hero (line 125) and Programme Overview (line 127)
- Include the "Apply Now" button linking to t2tprogramme.com and a "Partner With Us" button linking to /contact

---

### 2. Index Hero — Large Logo + Two-Column Layout

Redesign the hero section in `src/components/home/HeroSection.tsx` to use a two-column layout:
- **Left column:** Text content (eyebrow badge, title, description, CTA buttons)
- **Right column:** Large ECOWAS Parliament logo (significantly bigger than current, ~200-250px) centered with decorative glow effects

The stats bar remains full-width below both columns. Particles and gradient background stay unchanged.

**File:** `src/components/home/HeroSection.tsx`

---

### 3. Replace Emoji Flags with Real Flag Images Everywhere

Multiple files currently use emoji flags (e.g., `🇳🇬`). Replace them with the actual PNG flag images from `src/assets/flags/`. The affected files:

- `src/pages/programmes/Trade.tsx` — 7 countries
- `src/pages/programmes/Youth.tsx` — 7 countries
- `src/pages/programmes/Women.tsx` — 6 countries
- `src/pages/programmes/Culture.tsx` — 5 countries
- `src/pages/programmes/Parliament.tsx` — 12 countries
- `src/pages/Contact.tsx` — 2 offices (Nigeria flag)
- `src/components/parliament/HemicycleChart.tsx` — 12 countries
- `src/pages/programmes/Civic.tsx` and `src/pages/programmes/Awards.tsx` — check for flags

Each emoji will be replaced with an `<img>` tag using the corresponding PNG from `src/assets/flags/`. Missing flags (Mali, Niger, Burkina Faso) would need fallback handling if referenced.

---

### 4. New "People-Oriented Mandate" Section on Index

Create a new section component `src/components/home/PeopleMandateSection.tsx` that speaks to Parliament as an institution demonstrating its people-oriented mandate over the past 25 years.

Content will emphasize:
- Parliament's role as the voice of ECOWAS peoples
- Legislative oversight achievements
- Community engagement and democratic representation
- The "ECOWAS of the Peoples" slogan

Design: Full-width section with a prominent heading, descriptive text, and 3-4 highlight cards showcasing mandate pillars (Legislative Oversight, Democratic Representation, Peace & Security, Regional Integration).

**File:** New `src/components/home/PeopleMandateSection.tsx`
**File:** `src/pages/Index.tsx` — add the section after AnniversarySection

---

### 5. Parliament @25 Section — Balanced Achievements Layout

Modify `src/components/home/AnniversarySection.tsx` to redistribute the stats/achievements:
- Move the 4 achievement stat cards beneath the logo column OR distribute them evenly in a 4-column grid spanning the full width below both columns
- This prevents the left column (logo) from looking empty while the right column has all the content
- The ECOWAS address card moves to full-width below the stats

**File:** `src/components/home/AnniversarySection.tsx`

---

### 6. Youth Page — Bold Split Landing Design

Completely redesign `src/pages/programmes/Youth.tsx` as a bold split-screen landing:

```text
┌─────────────────┬─────────────────┐
│                  │                  │
│   INNOVATORS    │  SMART CHALLENGE │
│   CHALLENGE     │      QUIZ       │
│                  │                  │
│   [Learn More]  │   [Learn More]  │
│                  │                  │
└────────┬────────┴────────┬────────┘
         │   ┌──────────┐  │
         │   │  25th     │  │
         │   │  Logo on  │  │
         │   │  Silver   │  │
         │   │  Circle   │  │
         │   └──────────┘  │
         └─────────────────┘
```

- Two vertical halves: left for Innovators Challenge (green-tinted), right for Smart Challenge Quiz (gold-tinted)
- The Parliament @25 logo sits in a circular pure silver/light-gray background, overlapping the vertical dividing line between both sections (using absolute positioning and z-index)
- Each half has a brief description and a "Learn More" CTA button
- Scrolling below reveals the detailed content (phases, tracks, prizes, etc.) that currently exists
- The existing detailed sections remain intact below the split hero

**Files:** `src/pages/programmes/Youth.tsx`

---

### Translation Keys

New translation keys will be needed for:
- People-oriented mandate section headings and descriptions
- Youth page split-screen labels ("Innovators Challenge", "Smart Challenge Quiz")

Added to `src/lib/translations/en.ts`, `fr.ts`, and `pt.ts`.

