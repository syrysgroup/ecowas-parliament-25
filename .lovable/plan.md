

# Index Page Redesign & Fixes

## Changes Overview

### 1. Fix AWALCO Label — Partner, Not Implementing Partner
- **SponsorsSection.tsx**: Change "Implementing Partners" heading to just "Partners". Update AWALCO description to "strategic partner" instead of "co-organising partner for governance programmes"
- **PartnersStrip.tsx**: Change "Implementing Partner" to "Partner"

### 2. Countries Section — Remove Programme Names
- **CountriesSection.tsx**: Remove the `role` field and the `<p>` element showing programme names under each flag. Keep only the flag image and country name.

### 3. Scroll to Top on Navigation
- **App.tsx**: Add a `ScrollToTop` component inside `<BrowserRouter>` that calls `window.scrollTo(0, 0)` on every `location.pathname` change using `useLocation` and `useEffect`.

### 4. Footer — Add Sign In Button
- **Footer.tsx**: Add a "Sign In" link/button (linking to `/auth`) in the footer bottom bar alongside the existing links.

### 5. Sponsor Logos — Increase Size & Visibility
- **SponsorsSection.tsx**: Increase `SponsorLogo` size from `40` to `64`. Make the sponsor cards larger with more padding, bigger text, and a more prominent visual treatment (colored left border, larger card layout).

### 6. Full Index Page Redesign — Modern, Interactive, Animated

The redesign will make the page feel premium, dynamic, and visually rich:

**A. HeroSection.tsx — Cinematic Hero**
- Full-viewport-height hero with animated gradient background using CSS keyframes
- Animated floating geometric shapes (circles, hexagons) in the background using CSS animations
- Large bold typography with staggered slide-up animations
- Animated stat counters (12 Member States, 7 Programmes, 115 Parliament Seats) with count-up effect
- Social media bar with glassmorphism styling

**B. CountdownTimer.tsx — Glassmorphic Cards**
- Glassmorphism-styled countdown blocks with backdrop-blur
- Subtle pulse animation on the seconds counter
- Gradient background strip

**C. PillarsGrid.tsx — Interactive Hover Cards**
- Cards with gradient border on hover (animated border effect)
- Icon scales up on hover with color transition
- Staggered entrance animations with increased delays
- Add a subtle gradient overlay on hover

**D. CountriesSection.tsx — Flag Grid with Hover Effects**
- Larger flag images (from w-12 h-8 to w-16 h-12)
- On hover: flag scales up slightly, card lifts with shadow, country name gets primary color
- Clean layout: just flag + name, no programme descriptions

**E. DidYouKnow.tsx — Animated Fact Cards**
- Add smooth CSS transitions between facts (fade + slide)
- Gradient accent bar on the left of the card
- Auto-play with a visible progress bar

**F. QuoteStrip.tsx — Keep as-is** (already well-designed)

**G. SponsorsSection.tsx — Prominent Partner & Sponsor Display**
- AWALCO partner card: larger, with gradient border and badge
- Sponsor cards: larger logos (size 64), horizontal layout with colored accent stripe
- Add subtle hover animations

**H. LatestNews.tsx — News Cards with Generated Gradient Images**
- Replace the plain Calendar icon placeholder with unique gradient backgrounds per category (green for Press Release, yellow for Event, blue for Announcement)
- Add hover lift and shadow transitions

**I. SponsorCTA.tsx — Keep existing** (already good)

**J. New Section: Animated Stats Bar**
- A new component between Hero and Countdown showing key numbers
- 12 Member States | 7 Programmes | 115 Parliament Seats | 25 Years
- Numbers animate (count up) when scrolled into view

**K. index.css — New Animations**
- Add `@keyframes gradient-shift` for animated hero background
- Add `@keyframes shimmer` for sponsor logo hover
- Add count-up animation utility

### New Index Page Order
1. HeroSection (with animated background + stats)
2. CountdownTimer (glassmorphic)
3. PillarsGrid (interactive cards)
4. CountriesSection (flags only, no programme text)
5. DidYouKnow (animated carousel with progress bar)
6. QuoteStrip
7. SponsorsSection (partners + larger sponsor logos)
8. LatestNews (gradient image placeholders)
9. SponsorCTA

### Technical Details

**Files modified:**
- `src/App.tsx` — add ScrollToTop component
- `src/pages/Index.tsx` — reorder sections
- `src/components/home/HeroSection.tsx` — full redesign with animated background, stat counters
- `src/components/home/CountdownTimer.tsx` — glassmorphism styling
- `src/components/home/PillarsGrid.tsx` — enhanced hover effects
- `src/components/home/CountriesSection.tsx` — remove role text, larger flags
- `src/components/home/DidYouKnow.tsx` — animated transitions, progress bar
- `src/components/home/SponsorsSection.tsx` — fix AWALCO label, larger logos
- `src/components/home/PartnersStrip.tsx` — fix label
- `src/components/home/LatestNews.tsx` — gradient image placeholders
- `src/components/layout/Footer.tsx` — add Sign In button
- `src/index.css` — new keyframe animations

**No new dependencies required** — all animations use CSS keyframes and Tailwind utilities.

