# Plan

## 1. Marketplace homepage section — light editorial redesign

File: `apps/web/src/components/home/MarketplaceSpotlight.tsx`

Replace the current dark green gradient + yellow/red collage with a calm, coordinated editorial layout:

- White/cream background (`bg-background` with a faint `bg-muted/40` band), no clashing gradients.
- Single accent: ECOWAS green for headings/CTAs, gold reserved for one small "Verified" chip — no red.
- Layout: left column = small green "ECOWAS Trade Network" eyebrow, large serif-style bold headline, short paragraph, primary green "Browse Marketplace" CTA + ghost secondary CTAs ("List your product", "Register as buyer"), and 3 minimal stat chips (12 nations, N listings, ECOWAS-brokered).
- Right column = clean 2×2 product grid (equal aspect, rounded-xl, subtle border, white card, image, title, country with flag, category pill). No overlapping dark gradient on imagery. Hover = subtle lift only.
- Keep existing data query (`marketplace_listings` approved, limit 4) and the "See all listings" link.
- Use only semantic tokens (`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-primary`); no hardcoded white/black.

No data, route, or business-logic changes.

## 2. Programmes on homepage — show hidden ones as "Coming Soon"

File: `apps/web/src/components/home/PillarsGrid.tsx`

- Drop the `.eq("is_active", true)` filter so the query returns all programmes ordered by `display_order`.
- For each pillar, branch on `is_active`:
  - **Active** → current `<Link>` card, unchanged.
  - **Inactive** → render as a non-clickable `<div>` with:
    - `opacity-60 grayscale` and `cursor-not-allowed`
    - Muted icon background, no hover lift
    - A small "Coming soon" badge in the top-right corner (neutral muted style)
    - Progress bar hidden (or shown muted)
- Add `is_active: boolean` to the `PillarRow` type.
- No schema or admin changes — toggling `is_active` in the admin already controls the state.

## 3. Panorama HotspotPicker — blank/black box fix

File: `apps/admin/src/components/crm/modules/panorama/HotspotPicker.tsx`

Likely cause: the viewer is constructed before the container has measurable size (it lives inside a dialog/tab that mounts hidden, so width/height = 0 → black canvas). Confirmed by the fixed `h-[320px]` not being enough if the parent has `display:none` on initial render.

Fix:

- Defer Viewer creation until the container actually has a non-zero size, using a `ResizeObserver`:
  - On mount, observe `containerRef.current`. When `contentRect.width > 0 && height > 0` and no viewer yet, construct the Viewer.
- Add a `viewer.resize()` call whenever the observed size changes after creation (handles dialog open/tab switch).
- Add a graceful `panorama: { source: panoramaUrl }` with an `onerror`-style fallback: catch load failure and display a small "Failed to load panorama" message instead of a silent black box.
- Keep existing click → onPick logic and marker rendering.

No DB / no other file changes required.

## Technical notes

- All changes are presentation/frontend only. No migrations, no edge functions, no new dependencies.
- Marketplace + PillarsGrid edits stay inside their respective component files.
- Panorama fix is isolated to `HotspotPicker.tsx`.

## Out of scope

- No redesign of other homepage sections.
- No changes to admin programme management UI (the `is_active` toggle already exists).
- No new "All programmes" page.
