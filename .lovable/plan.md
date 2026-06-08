
# Make Admin Fully Control the Website

Earlier turns claimed to ship `PagesModule`, `FormsModule`, `usePage`, `SectionRenderer`, `DynamicForm`, `submit-form` edge function, `cleanText`, and `cms-body` CSS. None of these actually exist in the repo. The DB tables (`pages`, `page_sections`, `page_section_items`, `form_definitions`, `form_fields`, `form_submissions`, `media_library`, `content_revisions`, `seo_pages`) do exist and the user's seed SQL has populated them.

This plan finishes the job for real.

## 1. Dash + justification (visible immediately on current site)

- New `apps/web/src/lib/text.ts`:
  - `cleanText(s)` — replaces `—` and `–` with `, ` (collapses double spaces, trims around punctuation).
  - `<Justified>` wrapper component applying `text-justify hyphens-auto` to body copy.
- Global CSS in `apps/web/src/index.css`: `.cms-body p, .prose p { text-align: justify; hyphens: auto; }`.
- Sweep every component under `apps/web/src/components/home`, `pages/About.tsx`, `pages/Timeline.tsx`, `News*`, `Programmes`, `Parliament*`, `Footer`, `Navbar`: wrap paragraph copy with `cleanText()` and add `cms-body` class to body containers (headings, badges, nav untouched).
- Apply `cleanText` inside `useSiteContent`, `usePage`, `DynamicForm`, news/event renderers so DB content is sanitized at read time too.
- One-off cleanup migration via the insert tool: `UPDATE` text columns in `site_content`, `news_articles`, `events`, `parliament_content`, `team_members`, `partners`, `sponsors`, `page_section_items` to strip `—`/`–`.

## 2. Public renderer (apps/web)

- `src/hooks/usePage.ts` — single TanStack query joining `pages` + `page_sections` + `page_section_items` by slug, filters `status='published'` for anon.
- `src/components/cms/SectionRenderer.tsx` — switch on `section.kind`:
  - `hero` → `HeroBlock` (eyebrow, title, subtitle, CTA, background image).
  - `text` → sanitized HTML in `.cms-body`.
  - `stats` → grid of `page_section_items` (value/label).
  - `cta`, `gallery`, `cards`, `list`, `partners`, `sponsors`, `marquee`, `html`, `form_ref` → matching small components, all reusing existing visuals.
- Refactor `src/pages/Index.tsx` (Home) to render `usePage("home")` through `SectionRenderer`. Existing hard-coded sections stay as fallback when DB has no section for that key.
- Generic routes (add to `App.tsx`):
  - `/p/:slug` → renders any published `pages` row.
  - `/forms/:slug` → renders `<DynamicForm slug=...>`.
- `src/components/cms/DynamicForm.tsx` — reads `form_definitions` + `form_fields`, renders inputs (text/email/textarea/select/checkbox/multicheck/phone/date/file), client-side validation with Zod built from field metadata, posts to `submit-form` edge function, shows `success_message`.
- `src/components/cms/EditableImage.tsx` — `<img>` resolving `media_library` id or direct URL.

## 3. Edge function `submit-form`

- POST `{ slug, payload, files? }`.
- Loads form + fields, validates required + types, inserts into `form_submissions` with IP/UA, optional file upload to a new private `form-uploads` bucket.
- Sends notify email via existing Zoho sender to `form_definitions.notify_email`, plus autoresponder if requester email present.

## 4. Admin modules (apps/admin)

New v2-style modules registered in `crmModules.ts` and `CRMDashboard.tsx`:

### PagesModule
- List of all `pages` (multi-select checkboxes, search, status chip, route, updated_at).
- Bulk actions: publish / unpublish / duplicate / delete.
- "New page" drawer (slug, route, title, SEO).
- Row → Page Editor (side panel):
  - Section list with drag-reorder (`@dnd-kit`), add/remove sections by kind.
  - Per-section editor: RichText for prose, key/value editor for `props`, repeater for `page_section_items` (drag-reorder, image picker, value/label fields).
  - Image picker bound to `media_library` (with direct upload to `cms-media`).
  - Draft / Publish toggle, snapshot to `content_revisions` on save, rollback list.
  - Live preview iframe pointed at `/p/:slug?preview=token`.

### FormsModule
- Tab 1 **Builder**: list of forms, drawer to create/edit (slug, title, description, success message, notify email), drag-reorder fields, per-field options editor, type chooser.
- Tab 2 **Submissions inbox**: per-form table with multi-select, bulk mark-read/archive/spam/export-CSV, detail drawer with payload, file downloads, notes, assign-to.
- "Embed" button shows public URL `/forms/<slug>`.

### MediaLibraryModule (extend existing)
- Grid + multi-select, bulk tag/delete/move, replace-in-place, alt-text editor, "used on" counter (joins `page_section_items.image_id`).

### SEOModule (extend existing)
- Per-page meta + OG image picker + schema.org JSON, bound to `seo_pages`.

Shared:
- `useBulkSelection` hook reused.
- All save handlers run `cleanText` on user-entered prose before write.

## 5. Routing + access

- Admin roles already gate via `is_crm_staff()`; new modules added to `CRM_MODULES` with `allowedRoles: ["super_admin","admin","content_manager","website_editor"]`.
- Public read policies on `pages`, `page_sections`, `page_section_items`, `form_definitions`, `form_fields` already allow `anon SELECT` of published rows (verify, add if missing via migration).
- New private `form-uploads` bucket created via storage tool; staff-only read policy.

## 6. Delivery order

```text
1. text.ts + index.css + sweep home/page components for dash + justify
2. usePage + SectionRenderer + DynamicForm + generic /p/:slug, /forms/:slug
3. submit-form edge function + form-uploads bucket
4. PagesModule (list + editor + revisions)
5. FormsModule (builder + submissions inbox)
6. MediaLibrary + SEO extensions
7. Data cleanup UPDATEs to strip dashes from existing DB rows
8. QA each public route; verify Home now reads from DB, Contact form lands in inbox
```

## Out of scope
- No public visual redesign beyond justify + dash removal.
- English only (i18n structure preserved for later).
- No scheduled publishing / A-B testing in v1.

## Technical notes
- All new tables already exist; no schema migrations required except possibly an `anon SELECT` policy audit and the new `form-uploads` bucket.
- Existing `RichTextEditor` reused; save hook strips dashes.
- TanStack Query keys: `["page", slug]`, `["form", slug]`, `["form-submissions", formId]`.
- File deletes/renames go through `mv`/`rm`; section editor uses optimistic updates with rollback on error.
