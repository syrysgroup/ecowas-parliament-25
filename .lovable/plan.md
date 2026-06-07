# Phase 2 — Full Admin Control of Home, About & Timeline + i18n Fix

Three deliverables in one turn:
1. **Translation buttons** — audit and fix language switcher on `/web` (and admin if broken).
2. **Admin coverage sweep** — every string, image, CTA on `/`, `/about`, `/timeline` becomes editable from `/crm`.
3. **Timeline → DB** — replace the hardcoded 11-event array with a managed `timeline_events` table + admin module.

---

## 1. Translation buttons audit

Investigate `LanguageSwitcher`/locale toggle in `apps/web` (and `apps/admin` if present):
- Confirm `I18nProvider` is mounted above the switcher in `App.tsx`.
- Confirm the click handler calls `setLocale("en"|"fr"|"pt")` and that the value is persisted (localStorage) and re-renders consumers.
- Verify all three translation files (`en.ts`, `fr.ts`, `pt.ts`) export the same key set — log missing keys.
- Fix any broken wiring (common cause: button updates state but `useTranslation` reads from a stale module-level variable instead of context).
- Smoke test: click EN → FR → PT, observe Navbar/Footer/Home hero strings change.

No DB work for this part.

---

## 2. Database migration — `phase2_timeline_and_content_seeds`

Use exactly the SQL the user supplied:

- `CREATE TABLE public.timeline_events` (month_label, sort_order, country, city, title, description, programme, deliverables[], highlight, is_published, timestamps).
- GRANTs: `anon SELECT`, `authenticated` full, `service_role` ALL.
- RLS enabled.
- Policies:
  - Public read where `is_published = true`.
  - Staff (super_admin, admin, content_manager, website_editor) read-all / insert / update.
  - Delete restricted to super_admin, admin, content_manager.
- `set_updated_at` trigger + sort/published indexes.
- Seed the 11 existing 2026 events verbatim.
- Seed empty `site_content` rows for: `home_marquee`, `home_parliament25`, `home_marketplace`, `home_sponsor_placeholder`, `home_events`, `home_latest_news`, `home_partners_strip`, `timeline_hero`, `timeline_launch_highlights`, `timeline_cta`.
- Extend existing `anniversary`, `parliament_tour`, `parliament_initiative` rows with new optional keys (`cta_label`, `cta_href`, `image_url`, `hero_image_url`, `intro_eyebrow`) without overwriting existing values.

---

## 3. Admin (`apps/admin`)

### 3a. Extend `SiteContentModule.tsx`
Add to `SECTION_TEMPLATES` the field definitions for all 10 new keys + the extended fields on the 3 existing keys. Image fields use the existing `ImageUploadOrUrl` widget (uploads to `cms-media`). `home_marquee.items` and `timeline_launch_highlights.items` use a repeater field.

### 3b. New module `TimelineModule.tsx`
- Group: `CONTENT`. Roles: `super_admin`, `admin`, `content_manager`, `website_editor`.
- **Tab "Events"** — TanStack table of `timeline_events`, drawer CRUD (RHF + Zod), drag-reorder via `sort_order`, programme dropdown (reuses programme key set), deliverables as chip list, `is_published` + `highlight` toggles, delete confirm.
- **Tab "Page content"** — three cards bound to `timeline_hero`, `timeline_launch_highlights`, `timeline_cta` (inline editors, reuses `SiteContentModule` field renderer).
- Register in `crmModules.ts` (`section: "timeline"`, `group: "CONTENT"`) and lazy-load in `CRMDashboard.tsx`.

---

## 4. Public web (`apps/web`)

Each component gets `useSiteContent("<key>")` with `cms?.field ?? t("fallback.key")` fallbacks — zero visual change before an editor fills values.

Components to rewire:
- `MarqueeStrip` → `home_marquee.items`
- `Parliament25Section` → `home_parliament25`
- `ParliamentTourSpotlight` → `parliament_tour` (image_url, CTA)
- `MarketplaceSpotlight` → `home_marketplace` (incl. 3 feature pairs)
- `SponsorPlaceholderSection` → `home_sponsor_placeholder`
- `EventsSection` header → `home_events`
- `LatestNews` header → `home_latest_news`
- `PartnersStrip` → `home_partners_strip`
- `AnniversarySection` → extended `anniversary` keys
- `About.tsx` hero → `parliament_initiative.hero_image_url` + `intro_eyebrow`
- `Timeline.tsx` → `useQuery` against `timeline_events`, hero/stats/gallery/CTA from the three `timeline_*` site_content rows. Filters built from distinct `programme` values returned.

---

## Validation
1. `rg -n 'src="/.*\.(jpg|png|webp|svg)"' apps/web/src/components/home apps/web/src/pages/Timeline.tsx apps/web/src/pages/About.tsx` returns nothing user-facing.
2. Toggle language buttons → strings change across Navbar, Home, Footer.
3. Edit a timeline event or any new site_content key in `/crm`, reload public page, change appears without redeploy.
4. Unpublish an event → disappears from public timeline, still visible in admin.

## Out of scope (Phase 3+)
Programme-pillar pages, Parliament/360°/country pages, nav/footer link list editor, cookie-consent text, any visual redesign.
