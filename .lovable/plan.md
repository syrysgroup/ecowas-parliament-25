# Homepage Redesign — Speaker Section, Logo Fixes, Nav/Footer Updates, Implementing Partners, Did You Know, Mandate Letters

## Summary

Multiple changes across navbar, footer, homepage sections, and programme pages to match the user's requirements.

---

## 1. Navbar Redesign

**File:** `src/components/layout/Navbar.tsx`

- Remove the EP25 anniversary logo from the header — only show the ECOWAS Parliament logo (in a white circular background for contrast)
- Remove social media icons from the header entirely
- Keep "Partner With Us" button prominently on the header
- Improve the navigation menu structure — cleaner spacing, better dropdown styling
- Logo display: wrap the ECOWAS Parliament logo in a white circular container (`bg-white rounded-full p-1.5`)

## 3. Speaker Section (New Component)

**New file:** `src/components/home/SpeakerSection.tsx`

- Place directly after the HeroSection in `Index.tsx`
- Copy the speaker portrait image (`speaker-memounatou-6th-legislature.jpeg`) to `src/assets/`
- Layout: two-column — left: speaker portrait in a styled frame, right: text content
- Content:
  - Name in 3 languages (EN/FR/PT) with proper titles
  - Quote/description about launching initiatives to foster Parliament's mandate of representation in line with ECOWAS 2050 Vision — shift from "ECOWAS of States" to "ECOWAS of the People"
  - Styled with an accent border and subtle background

## 4. Logo Display Fix — White Circular Backgrounds

**Files:** `HeroSection.tsx`, `AboutSection.tsx`, `Footer.tsx`, and anywhere logos appear

- Wrap both the ECOWAS Parliament logo and the 25th Anniversary logo in white circular containers (`bg-white rounded-full p-2 shadow`) so they display cleanly against dark backgrounds
- Copy the new uploaded logos (`ECOWAS_Parliament_Logo_with_white_inner-2.png`, `parliament_25_logo_with_white_inner-2.png`) to `src/assets/` to replace the existing ones

## 5. Implementing Partners Section (New Component)

**New file:** `src/components/home/ImplementingPartnersSection.tsx`

- Display key implementing partner figures/organizations on the index page
- Based on the prompt spec: ECOWAS Commission (presenting), West Africa Trade Hub, AWALCO, and others
- Card-based layout showing partner name, role, and programme association
- Place after SponsorsSection in `Index.tsx`

## 6. Did You Know Section — Add to Index

**File:** `src/pages/Index.tsx`

- Import and add the existing `DidYouKnow` component (already built at `src/components/home/DidYouKnow.tsx`) into the Index page
- Place it after the StatsSection

## 7. Mandate Letter Display in Programme Pages

**File:** `src/components/shared/ProgrammePageTemplate.tsx` + individual programme pages

- Add a new "Programme Mandate" section to the `ProgrammePageTemplate`
- Display a styled card showing the mandate letter as an embedded image/document viewer
- Include a "Download Mandate Letter" button
- Use a placeholder mandate letter image for now (can be replaced with actual documents later)
- Each programme page will show its specific mandate letter signed by the Speaker
- The mandate letter is displayed visually on the page (not just as a file link) — rendered as an image in a document-style frame with download option

## 8. Update Index.tsx Page Composition

**File:** `src/pages/Index.tsx`

New section order:

```
Hero → Speaker → Marquee → Countdown → Countries → About → Programmes → 
Sponsors → Implementing Partners → Events → Stats → Did You Know → 
Latest News → Newsletter → SponsorCTA
```

---

## Technical Details

- **New files:** `SpeakerSection.tsx`, `ImplementingPartnersSection.tsx`
- **Modified files:** `Navbar.tsx`, `Footer.tsx`, `HeroSection.tsx`, `AboutSection.tsx`, `ProgrammePageTemplate.tsx`, `Index.tsx`
- **New assets:** Copy speaker portrait + updated logos to `src/assets/`
- **Existing component reused:** `DidYouKnow.tsx` (already built, just needs importing into Index)
- All logos wrapped in white circular backgrounds for proper display on dark surfaces