

# Implementation Plan — 7 Changes

## 1. Redesign People-Oriented Mandate Section (Homepage)
Copy the uploaded parliament chamber photo (`IMG_9724.png`) to `src/assets/parliament-chamber.jpg`. Redesign `PeopleMandateSection.tsx` to feature this image prominently — large hero-style photo with overlay text about the people's mandate, caption "ECOWAS Parliament during the 25th Anniversary ordinary session in Abuja". Keep the four pillar cards below but add the founding date: "Founded 16 November 2000". Add a visual note about the 25th anniversary milestone.

**Files:** `src/components/home/PeopleMandateSection.tsx`, asset copy

## 2. Increase Sponsor Logo Sizes (2x)
Double the logo/icon sizes in `SponsorPlaceholderSection.tsx` (size 40→80), `SponsorsSection.tsx` (w-12 h-12 → w-24 h-24, img w-10 h-10 → w-20 h-20), and `SponsorPlaceholderLogo.tsx` default size. Also increase logos in programme sponsor marquees and footer sponsor strips.

**Files:** `SponsorPlaceholderSection.tsx`, `SponsorsSection.tsx`, `ProgrammeSponsorMarquee.tsx`, `SponsorLogoMarquee.tsx`

## 3. Fix Transparent Buttons/Text Across the Project
Audit all `variant="ghost"` and `variant="outline"` buttons, especially those on hero gradients. Replace ghost back-buttons with solid/semi-opaque backgrounds (`bg-white/10` or `bg-primary-foreground/15`). Fix the MediaKit outline button that uses `bg-transparent`. Ensure all buttons have visible backgrounds in both light and dark themes.

**Files:** `ProgrammePageTemplate.tsx`, `Parliament.tsx`, `MediaKit.tsx`, `SponsorCTA.tsx`, `Youth.tsx`, `Trade.tsx`, `Women.tsx`, `Civic.tsx`, `Culture.tsx`, `Awards.tsx`, `InnovatorsChallenge.tsx`, `SmartChallenge.tsx`

## 4. Update Social Media Handle & Add Natural Colors
Change `@ecoparl_hub` to `@ecoparl_initiatives` across all URLs and display text in `SocialMediaBar.tsx`. Give each social icon its brand color (X/Twitter: black/white, Instagram: gradient pink, Facebook: #1877F2, LinkedIn: #0A66C2, YouTube: #FF0000) instead of the current monochrome `text-muted-foreground`.

**Files:** `src/components/shared/SocialMediaBar.tsx`

## 5. Create Sponsors Page with Individual Sponsor Sub-Pages
Create a dedicated `/sponsors` page (replace or enhance existing `SponsorPortal.tsx`) that lists all programme sponsors with cards. Each sponsor gets an individual page at `/sponsors/:slug` showing: ECOWAS Parliament logo + sponsor logo only in the header, detailed sponsorship info, programme(s) they support, and a link to the sponsor's external site. Add route in `App.tsx`.

**Sponsors:** NASENI, SMEDAN, Providus Bank, Alliance Economic Research and Ethics (from memory).

**Files:** New `src/pages/sponsors/SponsorPage.tsx`, update `SponsorPortal.tsx`, update `App.tsx` route

## 6. Redesign Events Page — 3-Column Grid + Individual Event Pages
Change the events layout from stacked cards to a 3-column grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`). "View More" links to `/events/:id` — a new individual event page with full details, a registration form, "Add to Calendar" (.ics download), and social share buttons (Twitter, Facebook, WhatsApp, copy link). Add route in `App.tsx`.

**Files:** Update `src/pages/Events.tsx`, new `src/pages/events/EventDetail.tsx`, update `App.tsx`

## 7. Redesign Documents Page — In-Browser Viewing + Multi-Language Upload
Redesign `/documents` to show document cards with an inline PDF/document viewer (using `<iframe>` or `<object>` for PDFs) instead of download-only. Each document entry supports multiple language versions (EN/FR/PT tabs). Remove the download-only pattern; add a viewer modal or inline expand. Include language tabs per document so admins can upload one file per language.

**Files:** Update `src/pages/Documents.tsx`

---

## Technical Notes
- The uploaded image will be copied to `src/assets/` and imported as an ES module
- Individual sponsor/event pages use React Router dynamic segments (`:slug`, `:id`)
- Calendar export generates `.ics` files client-side
- Document viewer uses native browser PDF rendering via iframe
- Social icon brand colors use inline style or Tailwind arbitrary values
- All button fixes ensure minimum contrast in both `dark` and `light` class themes

