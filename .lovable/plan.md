# Plan

## 1. Replace the panorama image

The current scene `chamber-main` points at `/panorama/chamber-main.jpg` (served from `apps/web/public/panorama/`). The uploaded `Panaroma.jpeg` is a properly stitched 2:1 equirectangular of the ECOWAS chamber and should replace it.

- Copy `user-uploads://Panaroma.jpeg` → `apps/web/public/panorama/chamber-main.jpg` (overwrite). Keep the same filename so the existing DB row, preload `<link>`, and mobile-fallback rewrite all keep working with no migration.
- Regenerate the lightweight blur preview `chamber-main-preview.jpg` (downscaled ~64px wide, blurred) from the new image.
- Regenerate `chamber-main-mobile.jpg` (downscaled ~2048px wide, ~80% quality) so phones don't pull the full file.
- No DB change required. No code change required.

## 2. Why "no admin changes visible" — most likely causes

The Phase 1 code is in place (`TourPageCopyCard` at line 226 of `PanoramaModule.tsx`, scene module registered, `useSiteContent("parliament_tour")` wired on the web page), so the code shipped. The two realistic reasons super-admin doesn't see anything new:

1. **Preview is showing `apps/web`, not `apps/admin`.** Current route is `/` on the web app preview. The admin CRM lives in the separate `apps/admin` Vite app at `/crm/parliament-tour`. The two apps are deployed independently — opening the web preview will never show CRM modules.
2. **Stale dev bundle / browser cache** on the admin app after the Phase 1 edits — a hard reload (or admin dev-server restart) is needed.

Plan: confirm which app the user is opening, then if it's already the admin app, force a dev-server restart on `apps/admin` and instruct a hard reload. No code edits needed for this step unless we find an actual bug after confirming.

## 3. Proceed with Phase 2 (web-wide CMS gap fill)

Per the prior approved scope (full parity). Phase 2 adds `site_content` keys + admin editors for every still-hardcoded public page. I'll ship it in **page-group batches** so you can review between each:

   1. **Home sections** — hero, mission strip, parliament-tour spotlight extras, partners CTA → `home_hero`, `home_mission`, `home_partners_cta`.
   2. **Layout chrome** — `site_nav` (CTA label/href), `site_footer` (columns, social, legal copy).
   3. **Programmes** — one `programme_<slug>` key per pillar page (`/programmes/*`).
   4. **Events / News / Timeline / Volunteer / Media Kit / Media Portal / Documents / Contact / About / Stakeholders / Team** — one `<page>_page` key each with hero + intro copy.
   5. **Marketplace** — `marketplace_landing`, `marketplace_sell_intro`, `marketplace_buyer_intro`.

For each batch:
- Add a single `site_content` row template + `useSiteContent(key)` on the web page with fallbacks to current hardcoded strings (no visual regression).
- Add an editor card in the matching admin module (or under `SiteContentModule` grouped by template).
- Add a "Preview on site" deep link button on the admin card.

## 4. Phase 3 (per-module CRUD parity polish)

After Phase 2 batches land:
- Add "Open on site" preview links to `NewsEditorModule`, `EventsManagerModule`, `SponsorsManagerModule`, `StakeholdersModule`, `TeamModule`, `MarketplaceModule`, `ProgrammePillarsModule`.
- Audit every CMS module's `allowedRoles` to ensure `super_admin`, `admin`, `website_editor` are included.
- Confirm no module is still `isStub: true`.

## Technical notes

- No DB migration in step 1; the panorama swap is a pure asset replacement.
- Image processing in step 1 uses ImageMagick (`nix run nixpkgs#imagemagick`) — no new project deps.
- All Phase 2 keys use the existing `site_content` table and `useSiteContent` hook (already present in both apps).
- Fallback pattern stays `cms?.field ?? "current hardcoded string"` so nothing breaks if a row is missing.
- No new npm packages.

## Open question

Before I start: when you say "unable to see changes in the admin dashboard," are you opening the **admin app preview** (the CRM at `/crm/parliament-tour`) or the **web app preview** (currently showing `/`)? If it's the web app, the CRM modules will never appear there — they live in `apps/admin`. Confirming this decides whether step 2 is just "open the right preview + hard reload" or a real bug hunt.
