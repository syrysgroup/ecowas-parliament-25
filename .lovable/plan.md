## 1. Fix the build error

`apps/web/src/components/SEOHead.tsx` only exports **named** `SEOHead` and `GoogleAnalyticsHead` — there is no default export. `apps/web/src/pages/ParliamentTour.tsx` imports it as default, which Rollup rejects.

Also: line 8 of `ParliamentTour.tsx` re-imports `Badge` (already imported on line 4), which will fail the next build.

Edit `apps/web/src/pages/ParliamentTour.tsx`:
- Change `import SEOHead from "@/components/SEOHead";` → `import { SEOHead } from "@/components/SEOHead";`
- Delete the duplicate `import { Badge } from "@/components/ui/badge";` line.

Grep the rest of `apps/web/src` for any other `import SEOHead from` occurrences and convert them to the named import in the same pass.

## 2. Full admin control of the panorama tour

The admin already has `PanoramaModule.tsx` (scenes + hotspots CRUD, upload to `parliament-panorama` bucket, visual `HotspotPicker`). Gaps to close so an admin can manage the `/parliament-tour` page end-to-end without code changes:

### 2a. Scene controls the page actually reads
`apps/web/src/pages/ParliamentTour.tsx` and `ParliamentTourSpotlight.tsx` use scene fields plus a few hard-coded strings (page title, intro paragraph, badge text, "Points of Interest" heading, spotlight CTA). Make these editable:

- Reuse the existing `site_content` / `useSiteContent` pattern (already used elsewhere in `apps/web`) and add a small **"Tour Page Copy"** card at the top of `PanoramaModule.tsx` with fields: `hero_badge`, `hero_title`, `hero_subtitle`, `poi_heading`, `spotlight_title`, `spotlight_body`, `spotlight_cta_label`. Persist under a single `site_content` key like `parliament_tour`.
- Update `ParliamentTour.tsx` and `ParliamentTourSpotlight.tsx` to read those values (with the current strings as fallbacks) so nothing breaks if the row is empty.

### 2b. Accurate positions (yaw/pitch/zoom)
The viewer already honours `default_yaw` / `default_pitch` from the scene row, and `HotspotPicker` writes click-captured yaw/pitch into the hotspot dialog. Tighten this so positions are reliable:

- In `PanoramaModule.tsx` scene dialog, add a **"Set default view"** button that opens the same picker against the current scene and writes the captured yaw/pitch (and the viewer's current `zoom`) back into `default_yaw` / `default_pitch` / (new) `default_zoom`.
- Migration: add `default_zoom numeric not null default 50` to `parliament_panorama_scenes` (only column added; nullable-safe default).
- Update `apps/web/src/components/parliament/PanoramaViewer.tsx` to apply `scene.default_zoom` on load when present.
- In the hotspot list, add inline yaw/pitch numeric editors plus a "Re-pick" button that reopens `HotspotPicker` pre-seeded with the existing position so an admin can nudge a marker without retyping numbers.
- Add a "Preview on site" link in the module header that opens `/parliament-tour?scene=<slug>` in a new tab; update `ParliamentTour.tsx` to honour that query param when selecting the initial scene.

### 2c. Ordering + active toggles in one place
Add up/down arrows (or a numeric `display_order` input) and an `is_active` switch directly on each scene/hotspot row so admins don't have to open the dialog just to reorder or hide an item. Both columns already exist in the schema.

### 2d. CRM nav surfacing
The `parliament-tour` section is already registered in `crmModules.ts`. Verify `getModulesForRoles` exposes it to `super_admin`, `admin`, and `website_editor`; widen `allowedRoles` if any of those are missing.

## Technical notes

- No new packages. `@photo-sphere-viewer/core` is already in admin (used by `HotspotPicker`).
- One migration: `alter table parliament_panorama_scenes add column default_zoom numeric not null default 50;` — no RLS changes (existing scene policies cover the new column).
- No edits to `src/integrations/supabase/types.ts` (auto-generated).
- Storage bucket `parliament-panorama` already exists and is public — no changes.

## Out of scope

- Re-rolling / re-stitching the source panorama JPGs (already handled in the previous turn).
- Translating the new editable copy fields into FR/PT — admin can paste localised strings, but a multi-locale editor for these specific keys can come later if requested.
