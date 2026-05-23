# Plan: Working Panorama + Dynamic Programmes

## 1. Replace panorama with the uploaded photo

The DB scene `chamber-main` points to `/panorama/chamber-main.jpg`. We'll use the equirectangular photo you uploaded as the new source of truth.

- Copy `user-uploads://Panaroma.jpeg` into the `parliament-panorama` storage bucket as `chamber-main.jpg` (public URL).
- Update the existing `parliament_panorama_scenes` row (slug `chamber-main`) so `panorama_url` points to that public Supabase URL, and clear stale mobile/preview URLs so the viewer falls back cleanly.
- Also drop the file into `apps/web/public/panorama/chamber-main.jpg` as a local fallback so existing relative links keep working.
- Verify the `/parliament-tour` page renders the new image (Photo Sphere Viewer expects 2:1 equirectangular — the upload is 1920x960, perfect).

## 2. Make programmes fully admin-driven (create / hide / delete)

The `programme_pillars` table already has `is_active`, `display_order`, `slug`, `title`, `route`, and the admin `ProgrammePillarsModule` already supports create / edit / hide / delete. The remaining gap is that the website's **navbar and programmes pages are hardcoded**, so admin changes don't show up.

### a. Dynamic navbar Programmes menu

- New hook `apps/web/src/hooks/useProgrammePillars.ts` — TanStack Query fetch of active pillars ordered by `display_order`.
- `apps/web/src/components/layout/Navbar.tsx`: replace the hardcoded 7-item programmes submenu with a mapped list from the hook. Falls back to the current static list while loading or if the query fails (so the menu is never empty). Mobile menu uses the same source.

### b. Dynamic programmes index + routes

- `apps/web/src/App.tsx`: keep the existing static routes (`/programmes/youth`, `/programmes/trade`, etc.) for backward compatibility, and add a catch-all `/programmes/:slug` that renders the existing generic `PillarPage` for any new pillar created in the admin.
- Add a `/programmes` index route that lists all active pillars as cards (reuses `PillarsGrid` data).

### c. Reflect "hidden" state everywhere

- `PillarsGrid` on the home page already reads from the DB — confirm it filters `is_active = true` (add the filter if missing).
- Direct visits to a hidden pillar's slug return a friendly "Not available" state in `PillarPage` instead of an empty page.

### d. Admin UX polish (small)

In `ProgrammePillarsModule`:
- Surface an explicit "Visible on website" toggle in the list row (today it's only inside the edit dialog).
- Show a clear "Hidden" badge already present; add a tooltip explaining it hides the pillar from the public site + navbar.
- Confirm dialog on delete already exists.

## Technical notes

- No schema changes required — `programme_pillars.is_active` and `display_order` already exist.
- Navbar query uses `staleTime: 60_000` and `placeholderData` = current static list, so SSR/first paint never shows an empty menu.
- The new `/programmes/:slug` route is added after the specific routes so React Router matches the explicit ones first.
- Storage upload uses the existing public `parliament-panorama` bucket; no new bucket or RLS work needed.

## Files touched

- `apps/web/public/panorama/chamber-main.jpg` (new — uploaded photo)
- `parliament-panorama` storage bucket — upload `chamber-main.jpg`
- DB: one `UPDATE` on `parliament_panorama_scenes` row
- `apps/web/src/hooks/useProgrammePillars.ts` (new)
- `apps/web/src/components/layout/Navbar.tsx` (dynamic submenu)
- `apps/web/src/App.tsx` (catch-all `/programmes/:slug` + `/programmes` index)
- `apps/web/src/pages/programmes/PillarPage.tsx` (hidden-state guard)
- `apps/web/src/components/home/PillarsGrid.tsx` (ensure `is_active` filter)
- `apps/admin/src/components/crm/modules/ProgrammePillarsModule.tsx` (row-level visibility toggle)
