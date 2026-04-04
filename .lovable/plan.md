

# Plan: Youth Sub-Pages for Innovators Challenge and Smart Challenge

## Summary

Create two new sub-pages (`/programmes/youth/innovators` and `/programmes/youth/smart`), update the Youth landing page to remove the footer and link buttons to the new pages, generate hero background images for each, and build rich animated pages with mock sponsor logos.

## Changes

### 1. Update Youth Landing Page (`src/pages/programmes/Youth.tsx`)
- Replace `<Layout>` with just `<Navbar />` (no Footer)
- Change both buttons from `scrollToDetails` to `<Link>` navigating to `/programmes/youth/innovators` and `/programmes/youth/smart`
- Add mock sponsor logos below each half using `SponsorLogo` component:
  - Innovators: NASENI, SMEDAN, Canada
  - Smart Challenge: AfDB, SYRYS, Resident Technology

### 2. Create Innovators Challenge Page (`src/pages/programmes/InnovatorsChallenge.tsx`)
- Full-featured modern page with Layout (navbar + footer)
- AI-generated hero background image (gradient fallback + abstract tech/innovation pattern)
- Animated sections using `AnimatedSection` and CSS keyframe animations
- Content sections: Hero, About/Mission, Innovation Tracks (AgriTech, HealthTech, FinTech, Clean Energy, EdTech), Phases/Timeline, Prizes, Countries, CTA
- Sponsor strip at bottom showing NASENI, SMEDAN, Canada using `SponsorLogo`
- Modern design: parallax-like scroll effects, staggered card animations, glassmorphism cards, gradient accents

### 3. Create Smart Challenge Page (`src/pages/programmes/SmartChallenge.tsx`)
- Full-featured modern page with Layout
- AI-generated hero background image (academic/quiz competition theme)
- Content driven by concept note: 7-round competition structure, 4 subjects, dual-track scoring, 12 ECOWAS nations, live broadcast finale
- Sections: Hero, Executive Summary, How It Works (7 rounds visualized), Subjects & Major Declaration, Scoring System, Live Show format, Technology/Platform, CTA
- Animated interactive elements: round progression timeline, score track visualization, animated stat counters
- Sponsor strip: AfDB, SYRYS, Resident Technology using `SponsorLogo`

### 4. Generate Hero Background Images
- Use AI image generation (Nano banana) to create two unique hero backgrounds:
  - Innovators: abstract tech/startup themed with green/gold tones
  - Smart Challenge: academic competition themed with gold/blue tones
- Save to `src/assets/` and import in respective pages

### 5. Add Routes (`src/App.tsx`)
- Add imports for `InnovatorsChallenge` and `SmartChallenge`
- Add routes: `/programmes/youth/innovators` and `/programmes/youth/smart`

### 6. Add Translation Keys (`src/lib/translations/en.ts`, `fr.ts`, `pt.ts`)
- Add keys for both new pages (headings, descriptions, section content)

## Technical Details

- Both pages use existing `AnimatedSection`, `SponsorLogo`, `Layout`, `FlagImg` components
- CSS animations: staggered fade-ins, scale-on-scroll, floating elements, gradient shifts
- Responsive design with mobile-first approach
- The Smart Challenge page content is derived from the uploaded concept note (7 rounds, 4 subjects, 12 nations, dual scoring, live broadcast)

