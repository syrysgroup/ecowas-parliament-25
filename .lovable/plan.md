

# Plan: Custom Programme Pages + Hero Banner Images

## Issue: Missing Hero Banner Image

The current `ProgrammePageTemplate` and all programme pages have **no hero image** — they only render text over a gradient background. The Parliament page (custom-built) also lacks a hero image. The fix is to add a generated/decorative SVG illustration or pattern to each programme page's hero section, unique to each pillar.

Since we don't have real photography assets, each page will get a **custom SVG illustration** embedded directly in the hero — abstract, thematic shapes (e.g. lightbulb/circuits for Youth, handshake/arrows for Trade, etc.) rendered as decorative floating elements with animations.

---

## Architecture

All 4 pages (Youth, Trade, Women, Civic) will be converted from simple `ProgrammePageTemplate` wrappers into **fully custom pages** like Parliament, each with unique sections, generated content, and animations. The `ProgrammePageTemplate` will remain available for other uses but these 4 will no longer use it.

---

## Page Designs

### 1. Youth Innovation & Smart Challenge (`/programmes/youth`)

**Hero**: Gradient background with animated SVG lightbulb, circuit-board pattern, floating geometric shapes. Stats bar (7 countries, 3 phases, 1 regional finale).

**Sections**:
- **Overview & Vision** — expanded description
- **How It Works** — 3-phase visual flow: National Competitions → Country Finals → Regional Finale in Accra
- **Innovation Tracks** — Card grid showing challenge categories (AgriTech, HealthTech, FinTech, CleanEnergy, EdTech) with icons and descriptions
- **Country Competitions** — Cards for each participating country with status badges (Registering/Upcoming/Completed)
- **Prizes & Recognition** — Tiered prize cards (Gold/Silver/Bronze) with benefits listed
- **Objectives** — Card grid with icons
- **CTA** — "Register for the Smart Challenge" button

### 2. Trade & SME Forums (`/programmes/trade`)

**Hero**: Gradient with animated trade arrows, map dots, connection lines SVG. Stats bar (5 cities, 200+ SMEs target, 3 pilot corridors).

**Sections**:
- **Overview & Vision**
- **Forum Cities** — Interactive city cards for Abidjan, Accra, Lomé, Freetown, Lagos with venue/date info and animated connector lines between them
- **B2B Matchmaking** — How the matching process works (visual flow diagram)
- **Pilot Trade Corridors** — 3 corridor cards showing paired countries and trade focus areas
- **Key Sectors** — Grid of sector badges (Agriculture, Textiles, Digital Services, Manufacturing, Creative Industries)
- **Who Should Attend** — Persona cards (SME Owners, Trade Facilitators, Policymakers, Women Entrepreneurs)
- **Objectives** — Card grid
- **CTA** — "Register for a Trade Forum"

### 3. Women's Economic Empowerment (`/programmes/women`)

**Hero**: Gradient with decorative SVG (abstract female silhouette pattern, rising bar chart motif). Stats bar (6 countries, 500+ women target, 12 workshops).

**Sections**:
- **Overview & Vision**
- **Programme Streams** — 3 pillar cards: Trade Platforms, Entrepreneurship Workshops, Networking & Mentorship
- **Impact Stories** — Generated testimonial/quote cards from fictional women entrepreneurs across ECOWAS states
- **Workshop Calendar** — Timeline of capacity-building sessions with country and topic
- **Success Metrics** — Animated counter cards (Women reached, Businesses supported, Cross-border connections)
- **Participating Countries** — Country cards with flags
- **Objectives** — Card grid
- **CTA** — "Join the Women's Empowerment Programme"

### 4. Civic Education & Awareness (`/programmes/civic`)

**Hero**: Gradient with SVG megaphone waves, caravan route dotted line pattern. Stats bar (7 countries, 2 initiatives, 50+ communities target).

**Sections**:
- **Overview & Vision**
- **The ECOWAS Caravan** — Visual route map showing the caravan's journey through communities, with stop types (Airports, Schools, Markets, Digital Platforms) as icon cards
- **TV Game Show** — Feature card with show format, episode themes, how to participate
- **Touchpoints** — Grid showing where citizens encounter the programme (airports, schools, buses, social media, radio) with icons
- **Community Impact** — Generated stats/impact visualization
- **Participating Countries** — Country cards
- **Objectives** — Card grid
- **CTA** — "Get Involved in Civic Education"

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/shared/HeroIllustration.tsx` | Reusable animated SVG hero illustrations per pillar theme |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/programmes/Youth.tsx` | Full rewrite — custom page with all sections above |
| `src/pages/programmes/Trade.tsx` | Full rewrite — custom page with all sections above |
| `src/pages/programmes/Women.tsx` | Full rewrite — custom page with all sections above |
| `src/pages/programmes/Civic.tsx` | Full rewrite — custom page with all sections above |

## Design Principles

- Each page follows the same structural rhythm as the Parliament page (hero → overview → unique sections → objectives → CTA) but with unique content and visual identity
- Per-pillar accent colors already defined: Youth (ecowas-yellow), Trade (primary/green), Women (secondary/red), Civic (ecowas-blue)
- All sections wrapped in `AnimatedSection` with staggered delays
- Scroll-triggered animations, floating SVG decorations, animated counters
- Cards use existing `Card` component and design tokens
- Responsive grid layouts (1 col mobile, 2-3 col desktop)

