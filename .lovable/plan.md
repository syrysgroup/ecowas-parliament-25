

# Trade & SME Programme — Complete Rebuild

## Summary
Completely rebuild the `/programmes/trade` page with the comprehensive WATMAP (West Africa SME Trade Facilitation & Market Access Programme) content provided, featuring modern animations, a sponsor logo marquee at the top, sponsor logos at the bottom, and a link to the external T2T Programme application site.

## Technical Approach

### 1. Rebuild `src/pages/programmes/Trade.tsx`
Replace the current page with a rich, multi-section layout covering all the provided content:

**Hero Section** — Bold gradient hero with animated SVG illustrations, programme title "Trade & Commerce Platform", key stats (7 countries, 200+ SMEs, 3 market tiers), and a non-intrusive sponsor logo slider/marquee at the very top of the hero.

**Sections (in order):**
- **Sponsor Marquee Strip** — Continuous auto-scrolling sponsor logos at the top (reusing the existing `MarqueeStrip` pattern but with logos/brand names)
- **Programme Overview** — "A Strategic Milestone for Regional Trade" with Mission and Scope cards
- **T2T Programme** — Training-to-Transaction model with 3-step visual pipeline (Diagnose → Train → Transact) using animated step cards
- **Core Components** — Regional Trade & Commerce Forums with 4 feature cards (Multi-Country Platforms, Women-Led B2B, Corridor Development, Policy Dialogue)
- **Geographic Reach** — 7 Member States grid (Nigeria, Ghana, Côte d'Ivoire, Senegal, Togo & Cabo Verde, Sierra Leone) with flag emojis and role descriptions
- **Development Challenge** — "Why SMEs Are Still Left Behind" with 4 challenge cards (Weak Compliance, Limited Access, Fragmented Chains, Finance Gap)
- **WATMAP Solution** — Three-pillar solution: T2T Programme details (4 steps), Structured Market Access (3 tiers: ECOWAS/African/International), and infrastructure cards (Aggregated Platforms, Trade Hubs, Buyer Networks)
- **Strategic Value to AfCFTA** — 4 value proposition cards
- **Expected Impact** — Stats/outcomes section with animated counters
- **T2T Programme Details** — Programme structure (5-day training + 3-6 month transaction phase), 3 stages with locations, "Who It Is For" personas
- **Value Proposition** — Final selling points
- **CTA Section** — "Apply for the T2T Programme" button linking externally to `https://www.t2tprogramme.com/`
- **Sponsor Logos Grid** — Bottom section with sponsor logos displayed in a grid

### 2. Create `src/components/trade/SponsorLogoMarquee.tsx`
A new component for the continuously scrolling sponsor logo strip at the top of the page. Uses CSS animation (similar to existing `MarqueeStrip`) but displays sponsor brand names/placeholder logos in a non-interrupted loop.

### 3. Create `src/components/trade/TradeSponsorsFooter.tsx`
Bottom sponsor logos section displayed as a grid with tier labels.

### 4. Update `src/lib/translations/en.ts`
Replace all `trade.*` translation keys with the new comprehensive content (~80-100 new keys covering all sections).

### 5. Update `src/lib/translations/fr.ts` and `src/lib/translations/pt.ts`
Add matching keys (English fallback values initially).

### 6. Update `src/components/shared/HeroIllustration.tsx`
Enhance the "trade" theme illustration with more dynamic SVG elements representing trade corridors, commerce, and connectivity.

## Design Details
- Follow existing page patterns (Youth.tsx, Women.tsx) for consistency
- Use `AnimatedSection` for scroll-triggered animations throughout
- Use existing UI components (Card, Badge, Button, Progress)
- Use the project's ECOWAS color palette (green, yellow, red)
- External application link opens `https://www.t2tprogramme.com/` in a new tab
- Sponsor marquee uses `animate-marquee` keyframe already in the project
- Responsive grid layouts for all card sections

