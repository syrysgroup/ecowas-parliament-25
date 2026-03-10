

# ECOWAS Parliament @25 -- Year-Long Commemorative Programme Website

## Overview

A public-facing, modern website for the ECOWAS Parliament 25th Anniversary year-long commemorative programme (Jan--Nov 2026) across seven West African Member States. The site will serve as the central information hub for all programme activities, news, documents, stakeholders, and individual programme pillars.

## Brand System

- **Primary Green**: `#008244` | **Yellow**: `#e4ca00` | **Deep Red**: `#8e1d36` | **Sky Blue**: `#5ea3b3` | **Light Green**: `#aebd39`
- **Font**: Source Sans Pro (Google Fonts)
- **Logos**: ECOWAS Parliament logo, 25th anniversary logo, three implementing partner logos (Duchess NL, CMD Tourism & Trade, Borderless Trade)

## Site Architecture

```text
/                     Home (hero, highlights, countdown, pillars overview)
/about                About the Programme (vision, 2050 context, why year-long)
/timeline             Interactive Timeline (Jan-Nov 2026 across 7 countries)
/news                 News & Updates (cards grid, filterable)
/documents            Documents & Reports (downloadable library)
/stakeholders         Stakeholders & Partners (leadership + implementing partners)
/team                 Implementation Team (placeholder for photos)
/programmes/youth     Youth Innovation & Smart Challenge
/programmes/trade     Trade & SME Forums
/programmes/women     Women's Economic Empowerment
/programmes/civic     Civic Education & Awareness (Caravan, TV Game Show)
/programmes/culture   Cultural & Creative Celebrations
/programmes/parliament  Simulated Youth Parliament
```

## Pages & Components (Phase 1 -- to build now)

### 1. Shared Layout
- **Navbar**: ECOWAS Parliament logo + 25th anniversary logo, nav links, mobile hamburger menu with animated slide-in. Green gradient top bar.
- **Footer**: Partner logos row, quick links, contact info, ECOWAS Parliament copyright. Green/dark background.

### 2. Home Page
- **Hero Section**: Full-width gradient (green to dark) with animated text reveal. Headline: "ECOWAS Parliament @25 -- A Year-Long Movement". Subtitle from programme description. CTA buttons: "Explore the Programme" and "View Timeline". 25th anniversary logo featured prominently.
- **Countdown Timer**: Animated countdown to next major event with pulsing dots.
- **Programme Pillars Grid**: 6 cards (Youth, Trade, Women, Civic, Culture, Parliament) with icons from Lucide, hover animations (scale + shadow), each linking to its programme page.
- **Countries Map Section**: Visual representation of the 7 participating countries (Nigeria, Ghana, Cote d'Ivoire, Senegal, Cabo Verde, Togo, Sierra Leone) with animated connection lines.
- **Quote/Vision Strip**: Speaker Hadja Memounatou Ibrahima quote with parallax-style background.
- **Latest News Preview**: 3 most recent news cards.
- **Partners Strip**: Scrolling logo bar of implementing partners.

### 3. About Page
- ECOWAS 2050 Vision context, why a year-long programme, priority focus areas, strategic partnerships text (sourced from documents).

### 4. Timeline Page
- Vertical animated timeline (Jan--Nov 2026) with country flags, event descriptions, and animated entry on scroll.

### 5. News & Updates Page
- Card grid with placeholder articles. Filter by category. Each card: image placeholder, date, title, excerpt.

### 6. Documents & Reports Page
- Table/card list with document title, type badge, date, download button. Placeholder entries from the official press release and vision document.

### 7. Stakeholders & Partners Page
- Leadership section: Speaker photo placeholder, Chief Comms Officer placeholder.
- Implementing Partners: 3 cards with actual logos (Duchess NL, CMD, Borderless Trade) and descriptions.

### 8. Programme Pages (6 pages, shared template)
- Each with hero banner (unique color accent per pillar), description, objectives list, participating countries, and placeholder for event details.

### 9. Implementation Team Page
- Grid of team member cards with photo placeholders, names, titles from Important_info.txt.

## Technical Approach

- **Routing**: React Router with all routes above.
- **Animations**: CSS keyframes + Tailwind animate for scroll-triggered reveals (intersection observer hook), hero text animation, card hover effects, timeline entry animations.
- **Icons**: Lucide React throughout.
- **Images**: Copy all uploaded logos to `src/assets/`. Use placeholder gradients where photos are pending.
- **CSS Variables**: Extend Tailwind config with ECOWAS brand colors. Add Source Sans Pro via Google Fonts link in index.html.
- **Components**: Reusable `ProgrammePageTemplate`, `NewsCard`, `DocumentCard`, `TeamMemberCard`, `PartnerLogo`, `AnimatedSection` (intersection observer wrapper), `CountdownTimer`.
- **Responsive**: Mobile-first, all pages fully responsive.

## File Structure (new files)

```text
src/
  assets/           (logos copied here)
  components/
    layout/
      Navbar.tsx
      Footer.tsx
    home/
      HeroSection.tsx
      CountdownTimer.tsx
      PillarsGrid.tsx
      CountriesSection.tsx
      QuoteStrip.tsx
      LatestNews.tsx
      PartnersStrip.tsx
    shared/
      AnimatedSection.tsx
      NewsCard.tsx
      DocumentCard.tsx
      TeamMemberCard.tsx
      ProgrammePageTemplate.tsx
  pages/
    Index.tsx         (rewritten as Home)
    About.tsx
    Timeline.tsx
    News.tsx
    Documents.tsx
    Stakeholders.tsx
    Team.tsx
    programmes/
      Youth.tsx
      Trade.tsx
      Women.tsx
      Civic.tsx
      Culture.tsx
      Parliament.tsx
  hooks/
    useScrollAnimation.ts
```

## Implementation Order

1. Update global styles (colors, fonts, CSS variables) and Tailwind config
2. Copy logos to assets, build Navbar + Footer layout
3. Build Home page with all sections and animations
4. Build About, Timeline, Stakeholders pages
5. Build Programme page template + all 6 programme pages
6. Build News, Documents, Team pages
7. Wire all routes in App.tsx

