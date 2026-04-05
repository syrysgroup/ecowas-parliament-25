

# Plan: Sponsor Logos, Event Fliers, and Team Restructure

## Summary
Five interconnected changes: (1) Replace all SVG-generated sponsor placeholders with the Parliament @25 logo across the site, (2) add sponsor marquee + footer to all programme pages, (3) redesign Events page with Instagram-sized fliers, (4) restructure Team page groups, (5) update Youth page with logo placeholders and generated column backgrounds.

---

## 1. Create a Shared Sponsor Placeholder Component

**New file: `src/components/shared/SponsorPlaceholderLogo.tsx`**

A reusable component that renders the Parliament @25 logo (`parliament-25-logo.png`) at a given size with the sponsor name underneath. This replaces all uses of the SVG `SponsorLogo` component for placeholder purposes.

---

## 2. Create a Reusable Sponsor Marquee + Footer

**New file: `src/components/shared/ProgrammeSponsorMarquee.tsx`**

A generic top-of-page marquee slider (continuous, uninterrupted scroll) showing Parliament @25 placeholder logos with sponsor names. Accepts a sponsor list as props so each programme page can pass its own sponsors.

**New file: `src/components/shared/ProgrammeSponsorsFooter.tsx`**

A generic bottom-of-page sponsor section with placeholder logos and names, similar to `TradeSponsorsFooter` but using the new placeholder logo. Replaces `TradeSponsorsFooter` and `SponsorPlaceholderSection` with a single shared component.

---

## 3. Add Marquee + Footer to All Programme Pages

Update these pages to include the marquee at top and sponsor footer at bottom:
- `Women.tsx` - add marquee + footer
- `Civic.tsx` - add marquee + footer
- `Culture.tsx` - add marquee + footer
- `Awards.tsx` - add marquee + footer
- `Parliament.tsx` - add marquee + footer
- `InnovatorsChallenge.tsx` - add marquee + footer, replace `SponsorLogo` with placeholder logo
- `SmartChallenge.tsx` - add marquee + footer, replace `SponsorLogo` with placeholder logo

Update `Trade.tsx` to use the new shared components instead of `SponsorLogoMarquee` and `TradeSponsorsFooter`.

---

## 4. Update Home Page Sponsors Section

In `SponsorsSection.tsx`, replace the initials-circle sponsor cards with the Parliament @25 placeholder logo while keeping sponsor names and descriptions visible.

In `SponsorPlaceholderSection.tsx`, replace `SponsorLogo` SVG with the Parliament @25 placeholder logo.

---

## 5. Events Page: Instagram-Sized Fliers

**Update `src/pages/Events.tsx`:**
- Generate 6 Instagram-sized (1080x1080 ratio) flier images for each static event using AI image generation, saved to `src/assets/events/`
- Each event card redesigned: left side shows the square flier image, right side shows event details
- Replace the "Register" button with a "View More" link that opens the registration dialog
- Card layout: image takes ~40% width on desktop, full width on mobile above text

---

## 6. Youth Page: Placeholder Logos + Column Backgrounds

**Update `src/pages/programmes/Youth.tsx`:**
- Replace `SponsorLogo` SVG components with Parliament @25 placeholder logos with sponsor names visible underneath
- Generate two background images (one for each column: Innovators green-themed, Smart Challenge gold-themed) using AI image generation
- Apply generated backgrounds behind each split-screen column with overlay for text readability

---

## 7. Team Page: Restructure Groups

**Update `src/pages/Team.tsx`:**
- Change the three department groups from:
  - Executive Leadership, Programme Delivery, Communications & Media
- To:
  - **Executive Leadership** (keep existing members)
  - **Implementation Team** (rename from Programme Delivery, keep members)
  - **Consultants** (rename from Communications & Media, keep members)
- Update translation keys accordingly (`team.implementationTeam`, `team.consultants`)

---

## Technical Details

- Parliament @25 logo already exists at `src/assets/parliament-25-logo.png`
- AI image generation will produce: 6 event fliers + 2 youth column backgrounds = 8 images
- The marquee uses CSS `animate-marquee` animation already defined in tailwind config (used by `SponsorLogoMarquee`)
- Translation keys will be added/updated in `en.ts` for new team group names

