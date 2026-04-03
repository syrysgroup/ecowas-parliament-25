

# Redesign Plan: Navigation, Logo, Stakeholders & Homepage Sponsors

## Summary

Four changes: (1) redesign the main navigation menu with better organisation, (2) enlarge the Parliament 25 logo with a silver/green circular background, (3) merge partners into the Stakeholders page and remove the separate partners route, (4) replace the homepage sponsors section with a simple "ECOWAS Parliament Initiative Sponsors" placeholder while keeping implementing and institutional partners.

---

## 1. Redesign Main Navigation Menu

**Current structure:**
- Home | About | Programmes ▾ | Events & Media ▾ | People ▾ | Volunteer | Contact

**Proposed structure:**
- Home | About | Programmes ▾ | Events & Media ▾ | Stakeholders & Partners | Team | Volunteer | Contact

Changes:
- Remove the "People" dropdown — flatten it into direct links
- "Stakeholders & Partners" becomes a single top-level link to `/stakeholders`
- "Team" becomes a top-level link
- Remove the "Partners" sub-link (no more separate partners page)

**Files:** `src/components/layout/Navbar.tsx`, `src/lib/i18n.tsx` (update nav translation keys)

## 2. Enlarge Parliament 25 Logo — Silver Circle with Green Border

**Current:** Small white circle with `p-1.5`, logo at `h-9 w-9`

**Proposed:** Larger silver (`bg-gray-200`) circle with green (`border-ecowas-green`) border, logo at `h-12 w-12`, padding `p-2`

**File:** `src/components/layout/Navbar.tsx` (lines 71-74)

## 3. Merge Partners into Stakeholders Page & Remove Partners Route

- **Stakeholders page** (`src/pages/Stakeholders.tsx`): Add the Institutional Partners section (from `InstitutionalPartnersSection.tsx` data) below the Implementing Partners section. Use the same card style already on the page.
- **Remove route** `/partners/:slug` from `App.tsx` — keep the `PartnerPage.tsx` file but make it accessible from stakeholders page links instead. Actually, we'll keep the `/partners/:slug` route since individual partner detail pages are still useful — just remove the "Partners" nav entry.
- **Remove** the separate "Partners" dropdown link from navigation.

**Files:** `src/pages/Stakeholders.tsx`, `src/App.tsx` (remove partners nav references), `src/components/layout/Navbar.tsx`

## 4. Homepage Sponsors Section → Placeholder Only

**Current:** `SponsorsSection` shows tabbed programme-specific sponsors on the homepage.

**Proposed:**
- Remove `<SponsorsSection />` from the homepage
- Keep `<ImplementingPartnersSection />` and `<InstitutionalPartnersSection />` on the homepage
- Replace sponsors section with a simple CTA placeholder card: "ECOWAS Parliament Initiative Sponsors" with a "Become a Sponsor" link — clean, no individual logos
- The existing `SponsorCTA` at the bottom can remain as-is
- Programme-specific sponsors remain in their individual programme pages (already there via the `SponsorsSection` data — this will be moved/kept in programme pages only)

**Files:** `src/pages/Index.tsx`, potentially create a new `SponsorPlaceholderSection.tsx` or inline it

---

## Technical Details

| File | Change |
|------|--------|
| `src/components/layout/Navbar.tsx` | Restructure `navLinks`, enlarge logo circle (silver bg, green border, bigger image) |
| `src/lib/i18n.tsx` | Add/update nav keys for "Stakeholders & Partners" across EN/FR/PT |
| `src/pages/Stakeholders.tsx` | Add institutional partners section below implementing partners |
| `src/pages/Index.tsx` | Remove `SponsorsSection`, add sponsor placeholder CTA |
| `src/App.tsx` | No route changes needed (keep `/partners/:slug` for detail pages) |
| `src/components/layout/Footer.tsx` | Update footer link from "Stakeholders" label if needed |

