

## Implementation Plan

### Part A: Restructure Implementing Partners vs Sponsors

The key distinction: **Implementing Partners are co-owners**, not sponsors. They need a completely different visual treatment.

**SponsorsSection.tsx** — Split into two distinct sections:
1. **"Implementing Partners"** section with a premium, co-branding look: larger cards with descriptions, gold/green accent border, "Co-Organizer" badge rather than "Sponsor" treatment
2. **"Sponsors"** section below with three tiers (Platinum, Gold, Sponsors) keeping the current tiered card layout

**Footer.tsx** — Rename "Implementing Partners" label to something like "Programme Co-Organisers" to reinforce distinction

**Stakeholders.tsx** — Same distinction: Implementing Partners get a dedicated hero-adjacent section, sponsors grouped below

### Part B: Generate Better SVG Logos for All Sponsors

Replace the placeholder PNG logos with inline **SVG-based logo components** rendered directly in React. Each sponsor gets a unique, colorful, professional-looking generated logo with initials/icon and brand color. This avoids broken image issues and looks polished.

Create: `src/components/shared/SponsorLogo.tsx` — a component that renders unique SVG logos based on sponsor name and a color prop.

### Part C: Rebuild Parliament Page — Full Custom Page

Replace the simple `ProgrammePageTemplate` usage with a **fully custom, robust page** at `/programmes/parliament`. This is the centerpiece.

**New file: `src/pages/programmes/Parliament.tsx`** — Complete rewrite with these sections:

1. **Hero Section** — Dramatic hero with parliament chamber imagery, ECOWAS Youth Parliament branding, animated stats (115 total seats, 15 countries)

2. **Overview & Vision** — Speaker's vision statement, programme description, key dates

3. **Interactive Hemicycle Seating Chart** — The visual centerpiece:
   - SVG-based semicircular parliament seating arrangement
   - Color-coded by country with the exact seat allocation:
     - Benin: 5, Cape Verde: 5, Gambia: 5, Ghana: 8, Guinea: 6, Guinea-Bissau: 5, Ivory Coast: 7, Liberia: 5, Nigeria: 35, Senegal: 6, Sierra Leone: 5, Togo: 5
   - Total: 115 seats
   - Hover to see country name, click to see country delegation details
   - Legend showing each country's color and seat count
   - Built as a new component: `src/components/parliament/HemicycleChart.tsx`

4. **Country Delegations Grid** — Cards for each of the 15 member states showing:
   - Country flag emoji, name, number of seats
   - "Nomination Status" badge (demo: mix of Open/Closed/Coming Soon)
   - Representative slots (filled/vacant indicator)

5. **Nomination & Voting Process** — Step-by-step timeline showing:
   - Step 1: Country nominations open
   - Step 2: Youth apply/get nominated
   - Step 3: Voting/selection process
   - Step 4: Delegates announced
   - Step 5: Simulated Parliament session
   - CTA button: "Apply as Youth Representative"

6. **Programme Agenda** — Key sessions/debates planned for the simulated parliament

7. **Objectives Section** — Reuse existing objectives in a modern card grid

### Files to Create
- `src/components/parliament/HemicycleChart.tsx` — SVG hemicycle seating chart component
- `src/components/parliament/CountryDelegationCard.tsx` — Country delegation card component
- `src/components/parliament/NominationTimeline.tsx` — Step-by-step nomination process
- `src/components/shared/SponsorLogo.tsx` — Generated SVG logos for sponsors

### Files to Modify
- `src/pages/programmes/Parliament.tsx` — Complete rewrite to custom page
- `src/components/home/SponsorsSection.tsx` — Separate implementing partners from sponsors, use SVG logos
- `src/components/layout/Footer.tsx` — Update partner/sponsor labeling
- `src/pages/Stakeholders.tsx` — Update partner/sponsor distinction, use SVG logos

