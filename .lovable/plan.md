

# Redesign Index Page to Match Reference HTML

The uploaded HTML represents a significantly different homepage design — centered hero with dual logos, marquee strip, compact countdown, about section, richer programme cards, tabbed sponsor ecosystem, events list, stats section, and newsletter signup. Here is the plan to bring the current React homepage in line with this reference.

## Summary of Changes

1. **Redesign HeroSection** — Switch from two-column left-aligned to centered layout with dual logos (ECOWAS Parliament + 25th Anniversary) side by side, centered headline "Celebrating 25 Years", updated stats (add "1,200+ Delegates"), and a scroll-down hint at bottom.

2. **Add MarqueeStrip component** — New green banner scrolling programme names continuously, placed right after the hero.

3. **Restyle CountdownTimer** — Compact horizontal bar with brown/dark gradient background, "Next Major Event" label on left, countdown units on right, matching the reference's inline layout.

4. **Restyle CountriesSection** — Update styling of flag cards to match the reference's darker surface cards with rounded corners and smaller sizing.

5. **Add AboutSection component** — New two-column section: left side with descriptive text and tags (Abuja, 12 Member States, 7 Programmes, Free Entry, EN/FR/PT), right side with a 2x2 stats grid + logo row.

6. **Enhance PillarsGrid** — Add progress bars, programme lead names, and hover-reveal sponsor tags to each programme card matching the reference's richer cards with colored top borders.

7. **Replace SponsorsSection with tabbed ecosystem** — Programme-specific tab filtering (Overview, Youth Innovation, Trade, Women's, etc.) with tiered sponsor display (Presenting, Gold, Silver, Bronze, Implementation) and per-programme CTA panels.

8. **Add EventsSection component** — Vertical event list with date blocks, category tags, locations, and action CTAs matching the reference's event cards.

9. **Add StatsSection component** — Full-width dark green gradient section with large count-up numbers: 12 Member States, 25 Years, 7 Programmes, 1,200+ Delegates, 3 Award Categories.

10. **Add NewsletterSection component** — Email signup section with "Follow the Anniversary" heading, description, input + subscribe button.

11. **Update Index.tsx page composition** — Reorder sections: Hero → Marquee → Countdown → Flags → About → Programmes → Sponsors → Events → Stats → News → Newsletter → SponsorCTA.

12. **Copy uploaded logos** — Copy `ECOWAS_Parliament_Logo_with_white_inner.png` and `parliament_25_logo_with_white_inner.png` to `src/assets/` for use in the hero dual-logo display and about section.

## Technical Details

- **New components**: `MarqueeStrip.tsx`, `AboutSection.tsx`, `EventsSection.tsx`, `StatsSection.tsx`, `NewsletterSection.tsx` in `src/components/home/`
- **Modified components**: `HeroSection.tsx`, `CountdownTimer.tsx`, `CountriesSection.tsx`, `PillarsGrid.tsx`, `SponsorsSection.tsx`
- **Modified pages**: `Index.tsx` (updated imports and section ordering)
- **Assets**: Two logo PNGs copied to `src/assets/`
- **CSS**: Add marquee animation keyframe and any needed utility classes to `index.css`
- All components will use existing Tailwind classes and the project's CSS variable system (dark theme tokens already align well with the reference's color scheme)

