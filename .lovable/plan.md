# Full Admin Control — Implementation Plan

Schema audit: `pages`, `page_sections`, `page_section_items`, `form_definitions`, `form_fields`, `form_submissions`, `media_library`, `content_revisions`, `seo_pages` **already exist**. So this phase is about (a) seeding, (b) building the missing admin UIs, (c) rewiring the public site to read from them, and (d) text hygiene.

## Decisions (defaults — say so if you want different)
1. Page editor = **side-panel + iframe preview** (faster, safer than click-to-edit overlay).
2. Revisions: **cap last 20 per entity**, trim via trigger.
3. Form file uploads: **new private `form-uploads` bucket**.
4. Dash replacement: **context-aware** (`:` if followed by a clause/list, `,` otherwise). Applied on save and at render time.

---

## 1. Seed migration (uses the SQL you pasted, plus seeds for every public route)

One migration that:
- Inserts `pages` rows for every public route in `apps/web/src/App.tsx` (home, about, timeline, news, documents, stakeholders, team, contact, media-kit, sponsors, events, volunteer, ecowas-parliament, parliament-tour, marketplace, programmes/*, media-portal, sponsor-dashboard, legal pages).
- Inserts `page_sections` rows mirroring current component composition (hero, stats, about, marquee, countdown, partners, etc.) with `props` JSONB lifted from current `t()` strings.
- Inserts `page_section_items` for repeatable bits (stat tiles, country list, pillar cards, partner logos, marquee items).
- Inserts `form_definitions` + `form_fields` for: Contact, Volunteer, Newsletter, Media Accreditation, Sponsor Inquiry, Marketplace Inquiry, Nominations (your pasted Contact + Volunteer seed included verbatim).
- Adds revision-trim trigger (`keep_last_20_revisions`).
- Creates private `form-uploads` storage bucket + RLS (staff read, anon insert via edge function only).

## 2. Edge functions
- `submit-form` — validates payload against `form_fields`, stores in `form_submissions`, uploads files to `form-uploads`, sends notify email (Zoho) + autoresponder.
- `publish-page` — flips `status='published'`, snapshots into `content_revisions`.
- `import-current-content` — one-shot backfill (idempotent; safe to re-run).

## 3. Public site rewire (`apps/web`)

New shared:
- `src/hooks/usePage.ts` → one query returning `{ page, sections: [{...section, items}] }`, cached.
- `src/components/page/SectionRenderer.tsx` → switch on `kind` → renders existing component (`HeroSection`, `StatsSection`, `AnniversarySection`, …) with props from DB.
- `src/components/page/DynamicForm.tsx` → renders any `form_definitions` slug, POSTs to `submit-form`.
- `src/components/page/EditableImage.tsx` → resolves `media_library` id → URL with alt.
- `src/lib/text.ts` → `stripDashes(input)` context-aware; applied in `SectionRenderer` and `RichText` renderer.
- Tailwind: add `prose-justify` utility; body `<p>` in `.prose` and section bodies get `text-justify hyphens-auto`. Headings, badges, nav, buttons untouched.

Refactor: each page (`Index.tsx`, `About.tsx`, `Timeline.tsx`, programme pages, etc.) becomes `<Layout><PageView slug="home"/></Layout>` where `PageView` runs `usePage` + maps sections. Existing visual components are reused; only their data source changes. Translation files remain as last-resort fallback.

## 4. Admin modules (`apps/admin`)

New / upgraded modules registered in `crmModules.ts`:

- **PagesModule.tsx** — list of all `pages`; columns: route, status, updated; multi-select with bulk publish/unpublish/duplicate/delete; row click → opens Page Editor.
- **PageEditorDrawer.tsx** — left: ordered section list (drag-reorder via `position`), add-section menu by `kind`. Right: per-section form (RHF + Zod) — props editor + items repeater + image picker (bound to `media_library`). Top bar: Save draft / Publish / Revisions / Preview (iframe to `/?preview=<id>`).
- **MediaLibraryModule.tsx** — already exists; extend with multi-select bulk tag/move/delete, "used on" counter via reverse lookup in `page_section_items` and `pages.og_image`.
- **FormBuilderModule.tsx** — CRUD `form_definitions` + drag-reorder `form_fields`; field-type palette (text/email/textarea/select/radio/checkbox/multicheck/file/date/phone/country); options editor for select-type fields; notify_email + autoresponder editor; copy-embed-slug button.
- **FormSubmissionsModule.tsx** — per-form inbox; table with multi-select, bulk mark-read/archive/spam/export-CSV; detail drawer with payload, files, assign-to, internal notes.
- **SEOModule.tsx** — already exists; extend with OG image picker (media_library) and schema.org JSON editor; per-page link to underlying `pages` row.
- **GlobalSettingsModule** (Settings) — add tabs for Navbar links, Footer columns, social handles, cookie banner copy (driven by `site_settings`).

Shared helpers added under `apps/admin/src/components/crm/shared/`:
- `BulkActionBar.tsx` (uses existing `useBulkSelection`).
- `MediaPicker.tsx` (modal grid over `media_library` + upload to selected bucket).
- `SectionPropsForm.tsx` (renders the right form per `kind`).
- `RevisionsDrawer.tsx` (lists `content_revisions` for an entity_id + rollback button).

RichText editor (`RichTextEditor`) gets a `sanitize` hook that runs `stripDashes` on save.

## 5. Text hygiene
- One-shot SQL (in seed migration) `UPDATE site_content / news_articles / parliament_content / events / pillar_* / programme_pillars / team_members / partners / sponsors` to replace `—`/`–` per context-aware rule.
- Public render applies `stripDashes` defensively so any future imported content stays clean.
- Global CSS rule for `.prose p`, `[data-body] p` → `text-align: justify; hyphens: auto;`.

## 6. Delivery order (one PR per step, each independently shippable)
1. Migration: seeds + form-uploads bucket + revision trim trigger + dash sweep.
2. `submit-form` + `publish-page` edge functions.
3. Public: `usePage` + `SectionRenderer` + `DynamicForm` + `EditableImage` + dash/justify pass; refactor Home first.
4. Refactor remaining public pages onto `PageView`.
5. Admin: PagesModule + PageEditorDrawer + MediaPicker + RevisionsDrawer.
6. Admin: FormBuilderModule + FormSubmissionsModule + SEO extensions + Settings tabs.
7. QA pass: every route loads from DB, every form lands in inbox, every image swappable, bulk actions on every list.

## Out of scope
- Visual redesign (typography justify + dash removal only).
- Multi-language editor (structure ready, UI later).
- Scheduled publishing / A/B (revisions + manual publish only).

Reply **"approve"** to switch to build mode and I'll start with step 1 (migration + seeds).