
# Admin → Web parity & full panorama control

Goal: every public route under `apps/web` is admin-editable from `apps/admin`, and the panorama tour is fully controllable end-to-end. Delivered in 3 phases so we can ship usable value after each.

---

## Phase 1 — Panorama tour: full admin control (ships first)

Closes every gap from `.lovable/plan.md` plus the build error.

### Fixes
- `apps/web/src/pages/ParliamentTour.tsx`
  - Convert `import SEOHead from …` → `import { SEOHead } from …` (named export).
  - Remove the duplicate `Badge` import.
  - Grep `apps/web/src` for any other default `SEOHead` imports and convert.
- Honour `?scene=<slug>` query param when selecting the initial scene.

### Editable Tour Page Copy
- New `site_content` row keyed `parliament_tour` with fields: `hero_badge`, `hero_title`, `hero_subtitle`, `poi_heading`, `spotlight_title`, `spotlight_body`, `spotlight_cta_label`.
- Add a "Tour Page Copy" card at the top of `PanoramaModule.tsx` editing those fields.
- `ParliamentTour.tsx` and `ParliamentTourSpotlight.tsx` read via `useSiteContent("parliament_tour")` with current hard-coded strings as fallbacks.

### Live default view + zoom capture
- Migration: `alter table parliament_panorama_scenes add column default_zoom numeric not null default 50;`
- In the scene dialog add **"Set default view"** — opens `HotspotPicker` against the current scene; on save writes captured yaw/pitch and the viewer's current zoom into `default_yaw`/`default_pitch`/`default_zoom`.
- `PanoramaViewer.tsx` applies `scene.default_zoom` on load.

### Inline scene/hotspot management
- On each scene row: up/down arrows (or `display_order` numeric input) and `is_active` switch — no dialog needed.
- On each hotspot row: same controls + inline yaw/pitch editors + **"Re-pick"** that reopens `HotspotPicker` pre-seeded with current position.

### Deep-link preview
- Module header gets a "Preview on site" button → `/parliament-tour?scene=<slug>` in a new tab.

### CRM nav check
- Verify `parliament-tour` module's `allowedRoles` includes `super_admin`, `admin`, `website_editor`; widen if missing.

---

## Phase 2 — Web content audit & gap fill

Walk every route in `apps/web/src/App.tsx` and make all currently-hardcoded copy editable through `site_content`. No visual redesigns — just swap hardcoded strings for `useSiteContent(...)` with the existing string as fallback so nothing breaks if a row is empty.

### Pages already CMS-backed (verify only)
`/` (hero, about, quote, stats, anniversary, did_you_know, pillars, speaker, newsletter, sponsor_cta, implementing_partners) · `/about` · `/media-kit` · `/programmes/parliament` · `/ecowas-parliament` · sponsor_portal_stats.

### Pages to make editable (add `site_content` keys + templates in `SiteContentModule.tsx`)
- `/timeline` → `timeline_page` (hero copy, intro)
- `/news` → `news_page` (hero, intro, empty-state)
- `/documents` → `documents_page` (hero, categories intro)
- `/stakeholders` → `stakeholders_page` (hero, intro)
- `/team` → `team_page` (hero, intro)
- `/contact` → `contact_page` (hero, channels intro, office address block)
- `/events` → `events_page` (hero, filters intro)
- `/volunteer` → `volunteer_page` (hero, eligibility, CTA)
- `/sponsors` (portal) → `sponsor_portal_hero`, `sponsor_portal_tiers_intro`
- `/parliament-tour` → handled in Phase 1
- Programme pillar pages (`/programmes/youth|trade|women|civic|culture|awards`, plus `/programmes/youth/innovators`, `/programmes/youth/smart`) → one `programme_<slug>` key each (hero, intro, CTA copy). Already-dynamic `PillarPage.tsx` extended to read shared overrides.
- `/marketplace` and `/marketplace/sell` → `marketplace_landing`, `marketplace_sell_intro`.

### Home section additions
- `MarketplaceSpotlight`, `ParliamentTourSpotlight`, `EventsSection`, `LatestNews`, `CountriesSection`, `StatsSection`, `PartnersStrip`, `Parliament25Section`, `PeopleMandateSection`, `MarqueeStrip`, `SponsorPlaceholderSection` — add `useSiteContent` for their headings/subheadings/CTAs.

### Layout chrome
- `Navbar` + `Footer` already use `useSiteSettings`. Add a `site_footer` key (tagline, contact line, copyright, social link overrides) and a `site_nav_cta` key (primary nav button label/URL).

### SiteContentModule UX
- Group templates under collapsible sections matching the route map (Home / Programmes / Marketplace / Tour / Other), each row showing a "Preview" link that opens the corresponding public URL.
- Add a small global search field across template labels.

### Migration
- One `site_content` insert per new key with sensible defaults (current hardcoded strings) so live site never goes blank.

---

## Phase 3 — Per-module CRUD parity & preview deep links

Many web pages are already powered by dedicated tables/modules. This phase tightens the loop so admins can manage them without leaving the CRM and jump to the rendered page.

- Add "Preview on site" deep links on these modules: `NewsEditorModule` → `/news/:slug`, `EventsManagerModule` → `/events/:id`, `SponsorsManagerModule` → `/sponsors/:slug` and `/partners/:slug`, `StakeholdersModule` → `/stakeholders`, `TeamModule` → `/team`, `MarketplaceModule` → `/marketplace/listings/:slug`, `ProgrammePillarsModule` → matching `/programmes/...`, `PanoramaModule` → `/parliament-tour?scene=…`.
- Confirm `allowedRoles` for every CMS-related module exposes `super_admin`, `admin`, and `website_editor`. Widen where missing.
- Add `display_order` + `is_active` inline controls (arrows + switch) on list rows that don't already have them: `SponsorsManagerModule`, `StakeholdersModule`, `TeamModule`, `ProgrammePillarsModule`, `NewsEditorModule`.
- Verify no module is still flagged `isStub: true` in `crmModules.ts` for live-site content (`news-editor`, `events-manager`, `sponsors-partners`, `marketplace`, `parliament-tour`, `site-content`, `programme-pillars`, `stakeholders-mgmt`, `media-kit-mgmt`).

---

## Technical notes

- One DB migration in Phase 1 (`default_zoom` column). Phase 2 only seeds `site_content` rows (insert tool, not a migration). No migration in Phase 3.
- No new packages. `@photo-sphere-viewer/core`, shadcn `Switch`, `lucide` icons already present.
- `src/integrations/supabase/types.ts` is auto-generated — not edited manually.
- Fallback pattern everywhere: `cms?.field ?? "current hard-coded string"` so empty rows never break the site.
- No locale editor for the new keys yet; admins paste localised strings if needed.

## Out of scope

- Visual redesigns of the public pages.
- Multi-locale editor surface for the new `site_content` keys.
- Re-stitching panorama JPGs.
- Restructuring `crmModules.ts` groups/ordering beyond role/preview fixes.

## Rollout order

1. Phase 1 PR — panorama complete + build fix. Verifiable on `/parliament-tour` immediately.
2. Phase 2 PR — `site_content` expansion + page wiring. Verifiable by editing copy in `SiteContentModule` and reloading each route.
3. Phase 3 PR — preview links + inline reorder/active toggles across modules.
