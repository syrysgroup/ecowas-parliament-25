
# Full Admin Control Rebuild

Goal: every word, image, link, and document visible on the public website (`apps/web`) is editable from the admin CRM (`apps/admin`). No hardcoded strings, no hardcoded images, no static documents.

## Approach

Work in 4 phases. Each phase ships an end-to-end vertical slice (DB → admin module → public page wired). After each phase, the targeted public surface is 100% admin-controlled.

---

## Phase 1 — Close the 5 known gaps (new admin modules)

From `docs/admin-coverage.md`.

### 1a. Volunteer module
- **DB**: `volunteer_applications` + `volunteer_form_fields` tables already exist. Add `volunteer_settings` row in `site_content` for page hero/copy.
- **Admin**: New `VolunteerModule.tsx` with 3 tabs:
  - Applications inbox (list, status workflow: new → reviewing → accepted/rejected, notes, email trigger)
  - Form schema editor (drag-reorder fields, type, required, options) reading/writing `volunteer_form_fields`
  - Page content editor (hero title/subtitle/image, intro copy, success message)
- **Public**: `/volunteer` reads fields + copy from DB; submission writes to `volunteer_applications` and invokes existing `send-transactional-email`.

### 1b. Media accreditation module
- **DB**: `media_accreditations` table exists with `next_badge_number()`.
- **Admin**: New `MediaAccreditationModule.tsx`:
  - Request queue (approve/reject, issue/revoke badge, export contact list CSV)
  - Page content editor for `/media-portal` copy + requirements
- **Public**: `/media-portal` reads gated content from DB; application form submits to `media_accreditations`.

### 1c. Legal pages module
- **DB**: `legal_page_versions` table exists. Add `slug` enum: `privacy | terms | cookies`.
- **Admin**: New `LegalPagesModule.tsx` — TipTap rich-text editor per slug, version history, publish toggle, last-updated date auto-set.
- **Public**: 3 new routes `/privacy`, `/terms`, `/cookies` rendering latest published version. Footer links wired.

### 1d. Youth sub-pillar editor (extend Programme Pillars)
- **DB**: `youth_sub_pillars`, `youth_milestones`, `youth_submissions` tables exist.
- **Admin**: Add "Sub-Pillars" tab inside existing `ProgrammePillarsModule.tsx` — CRUD for sub-pillars (Innovators, Smart, future ones), milestone timeline editor, submissions review queue.
- **Public**: `/programmes/youth/innovators` and `/programmes/youth/smart` (and any dynamic `/programmes/youth/:slug`) read from `youth_sub_pillars` instead of hardcoded content.

### 1e. Sponsor portal config
- **DB**: `sponsor_portal_settings`, `sponsor_portal_widgets`, `sponsor_portal_downloads` tables exist.
- **Admin**: Extend `SponsorMetricsModule.tsx` with admin-only "Portal Config" tab — toggle widgets, manage downloadable files (uploads to `cms-media`), reorder layout, custom welcome message.
- **Public**: `/sponsor-dashboard` renders widgets/downloads driven by config rows.

---

## Phase 2 — Home + About + Timeline sweep

For each page: grep for hardcoded strings/images, migrate to `site_content` (templated sections) or `site_settings` (singletons), expose in `SiteContentModule` + `CMSModule`.

- **Home (`Index.tsx`)**: Audit every section component under `components/home/`. Ensure each section has a corresponding `site_content` row with template (`hero`, `quote`, `about`, `countdown`, `pillars`, `cta`, etc.). Add missing sections to the CMS template registry. Images flow through `ImageUploadOrUrl` → `cms-media` bucket.
- **About (`About.tsx`)**: Mission, vision, values, history blocks → `site_content` rows with `about_*` keys. Team callout pulls from existing `team_members`.
- **Timeline (`Timeline.tsx`)**: Already partially driven by `programme-pillars`. Convert remaining hardcoded milestones to a dedicated `timeline_events` table OR reuse `youth_milestones` pattern. Admin gets a Timeline tab in Programme Pillars module.

Deliverable: 0 hardcoded user-facing strings/images on these 3 pages.

---

## Phase 3 — Programme pillars deep sweep

- Audit `Youth.tsx`, `Trade.tsx`, `Women.tsx`, `Civic.tsx`, `Culture.tsx`, `Awards.tsx`, `Parliament.tsx`, `InnovatorsChallenge.tsx`, `SmartChallenge.tsx`, `PillarPage.tsx`.
- All pages must read from `programme_pillars` + `pillar_sections` + `pillar_page_content` (tables exist).
- Extend `ProgrammePillarsModule.tsx` so admins can:
  - Edit hero, intro, sections, gallery, CTAs, sponsor logos per pillar
  - Upload/replace all images (background, icons, gallery)
  - Manage sponsor-logo strips per pillar
  - Add/remove dynamic pillars (already supported via `/programmes/:slug`)
- Wire sub-pillars from Phase 1d.

---

## Phase 4 — Parliament + 360° tour + remaining

- **`EcowasParliament.tsx`**: Audit country delegations, committees, hemicycle. Ensure `parliament_content`, `representatives`, `countries` tables back every block. Extend `ParliamentContentModule` for any missing fields (committee descriptions, delegation bios, photos).
- **`ParliamentTour.tsx`**: Already driven by `parliament_panorama_scenes` + `_hotspots`. Audit hotspot copy/links for hardcoded fallbacks; remove.
- **`ParliamentCountry.tsx`**: Drive from `countries` + `representatives` joined view; no hardcoded country data.
- **Navbar/Footer**: Logo, social handles, contact info — verify all from `site_settings`. Footer link list editable via new `footer_links` JSON field on `site_settings`.
- **Cookie consent text**: Migrate to `site_settings`.
- **SEO meta**: Confirm `seo_pages` covers every public route; add missing routes.

---

## Technical details

### Migrations (one per phase, follows GRANT pattern)

```sql
-- Phase 1c example
ALTER TABLE public.legal_page_versions
  ADD COLUMN IF NOT EXISTS slug TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
-- GRANT block already present
-- Add policy: anon SELECT where is_published = true
```

New tables (only if needed):
- `timeline_events` (Phase 2) — if reuse of existing tables insufficient.
- `footer_links` could live as a JSONB column on `site_settings` instead of a new table.

### Admin module pattern (matches `crmModules.ts`)
For each new module:
1. Add entry to `CRM_MODULES[]` with `id`, `section`, `allowedRoles`, `group: "CONTENT"` or `"ADMINISTRATION"`
2. Create `src/components/crm/modules/{Name}Module.tsx` using the standardized CRUD pattern (Drawer + RHF + Zod, table with bulk actions, ImageUploadOrUrl, optimistic delete)
3. Lazy-import in `CRMDashboard.tsx`

### Public page wiring pattern
- Replace hardcoded strings with `useSiteContent(key, fallback)` or `useSiteSettings().get(key, fallback)`
- Replace hardcoded `<img src="/...">` with admin-uploaded URLs from `cms-media` bucket
- Documents: `/documents` already DB-driven; ensure all PDFs linked from other pages route through `documents` table
- Add loading skeletons where DB fetches replace static content

### Edge functions
- Reuse `send-transactional-email` for volunteer/media/contact confirmations
- New: `process-volunteer-application`, `issue-media-badge` (only if email triggers need server-side logic)

### Validation checklist (run per phase)
1. `rg -n '"[A-Z][a-z]+ [a-z]+' apps/web/src/pages/{page}.tsx` — find leftover hardcoded copy
2. `rg -n 'src=".*\.(jpg|png|webp)"' apps/web/src/pages/{page}.tsx` — find leftover hardcoded images
3. Browser-test: change a value in admin → confirm change appears on public preview without redeploy

---

## Scope guardrails

- No design changes to the public site — pure plumbing.
- No new admin permissions beyond what existing role gates already cover.
- Reuse existing buckets (`cms-media`, `news-images`, `event-images`, `team-avatars`, etc.) — no new buckets.
- Each phase ships independently; you can stop after any phase and the site still works.

---

## Estimated size

Large. ~5 new admin modules, ~3 module extensions, ~12 public pages re-wired, ~4 migrations. Suggest implementing one phase per turn so you can review and course-correct.
