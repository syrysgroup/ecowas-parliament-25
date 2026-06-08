
# Full Admin Control of the Public Website

Goal: the public site (`apps/web`) reads 100% of its content (copy, hero images, photos, lists, links, SEO, forms) from Supabase. The admin (`apps/admin`) provides CRUD for every page, section, image, and form — with bulk actions, multi-select, drafts, and publish workflow.

This plan also: kills every `—` / `–` in user-visible copy, justifies body text, and wires every public form into the admin inbox + form builder.

---

## 1. Content audit — what becomes editable

Every public route gets a page record + section records. Audited from `apps/web/src/pages` and `components/home`:

- Home (`Hero`, `Speaker`, `Marquee`, `Countdown`, `Countries`, `Anniversary`, `PeopleMandate`, `ParliamentTourSpotlight`, `PillarsGrid`, `MarketplaceSpotlight`, `ImplementingPartners`, `InstitutionalPartners`, `SponsorPlaceholder`, `Events`, `Stats`, `DidYouKnow`, `LatestNews`, `Newsletter`, `SponsorCTA`)
- About, Timeline, News (+ detail), Documents, Stakeholders (+ detail), Team, Contact, Media Kit, Sponsors (+ detail), Events (+ detail), Volunteer, ECOWAS Parliament, Parliament Tour, Marketplace (all sub-routes), Programmes (youth + innovators + smart + trade + women + civic + culture + awards + parliament + dynamic `:slug`), Media Portal, Sponsor Dashboard, Auth pages, Footer, Navbar, Cookie Consent, Legal pages.

Anything not already DB-backed gets migrated (most home sections currently use `t()` fallbacks only).

---

## 2. Data model (new + extended tables)

New unified content model layered on top of existing `site_content` / `cms_pages`:

- `pages` — slug, route, title, status (draft/published), seo, og_image, published_at, updated_by
- `page_sections` — page_id, key, kind (`hero|text|stat|cta|gallery|list|html|form_ref|partners|sponsors|cards|marquee|countdown|tour|events|news|newsletter`), position, props (JSONB), visible
- `page_section_items` — section_id, position, data (JSONB), image_id (for repeatable items: stats, tags, cards, partners, etc.)
- `media_assets` — already covered by storage buckets; add `media_library` table for searchable picker (bucket, path, alt, credit, tags, width, height, uploaded_by)
- `form_definitions` — slug, title, description, success_message, email_to, status
- `form_fields` — form_id, position, key, label, type (text/email/textarea/select/checkbox/radio/file/date/phone/country), required, options (JSONB), validation
- `form_submissions` — form_id, payload (JSONB), files (JSONB), ip, ua, status (new/read/archived/spam), assigned_to, notes
- `seo_pages` — extend existing with og_image, twitter_card, schema_json
- `revisions` — generic table for `pages`, `page_sections`, `form_definitions` (revision history + rollback)

All tables get GRANTs + RLS via `is_crm_staff()` for writes, `anon`+`authenticated` select for published rows only.

---

## 3. Public site changes (`apps/web`)

- New hook `usePage(slug)` → fetches page + sections + items in one query, cached via TanStack Query.
- Each home/page component refactored from hard-coded copy to a `<SectionRenderer section={…}/>` that maps `kind` to a component (`HeroSection`, `StatsSection`, etc.). Components keep their visuals; props come from DB.
- Translation files become fallback only (kept for keys not yet in DB).
- Global typography rule: body copy uses `text-justify hyphens-auto`; headings stay left-aligned.
- Text normalizer (`lib/text.ts`): strips `—`, `–`, and converts to `, ` or `:` per context; applied at render time so existing DB content also gets sanitized.
- Forms: `<DynamicForm slug="volunteer"/>` renders from `form_definitions`, posts to a single `submit-form` edge function.
- `<EditableImage>` reads from `media_library` so the admin can swap any image without code.

---

## 4. Admin changes (`apps/admin`)

New modules under the new shell (Phase 1 already shipped):

1. **Pages** — list of all public routes, status chips, search, bulk publish/unpublish/duplicate/delete (multi-select checklist).
2. **Page Editor** — side panel with section list (drag-reorder), per-section inline editor (RichText for prose, repeater for stat/tag/card items, image picker bound to `media_library`), live preview iframe, draft/publish, revision history + rollback.
3. **Media Library** — grid with multi-select, bulk move/tag/delete, replace-in-place, alt-text editor, used-on counter.
4. **Form Builder** — create/edit forms, drag-reorder fields, field options editor, email-to + autoresponder, embed-slug generator.
5. **Form Submissions Inbox** — per form: table with multi-select, bulk mark-read/archive/spam/export-CSV, detail drawer, assign-to, notes, file downloads.
6. **SEO Manager** — per-page meta, OG image picker, schema.org JSON, sitemap regen trigger.
7. **Global Settings expansion** — Navbar links, Footer columns, social handles, cookie banner copy, legal pages — all editable.

Shared additions:
- `useBulkSelection` already exists → reuse for every list (checkbox column + bulk action bar).
- Rich text editor (`RichTextEditor` already in repo) reused everywhere; sanitizes dashes on save.
- Image picker component bound to `media_library` + direct upload to the right Storage bucket.

---

## 5. Backend (Supabase)

Migrations:
- Create `pages`, `page_sections`, `page_section_items`, `media_library`, `form_definitions`, `form_fields`, `form_submissions`, `revisions` with GRANTs + RLS.
- Seed: one `pages` row per public route, one `page_sections` row per current section, items populated from current translation files + `site_content`.
- Seed `form_definitions` for: Contact, Volunteer, Newsletter, Media Accreditation, Sponsor Inquiry, Marketplace Inquiry, Nominations.

Edge functions:
- `submit-form` — validates against `form_fields`, stores submission, sends notification email via existing Zoho integration, autoresponder to submitter.
- `publish-page` — flips status, snapshots a revision, invalidates CDN cache.
- `import-current-content` — one-shot to backfill DB from current translations/components.

---

## 6. Text hygiene + justification

- One-time script (run via edge function) rewrites every text column in `site_content`, `news_articles`, `parliament_content`, `events`, `pillar_*`, `programme_pillars`, `team_members`, `partners`, `sponsors`, replacing `—`/`–` with appropriate punctuation.
- `RichTextEditor` save hook strips dashes on write.
- Public site applies `text-justify hyphens-auto` to `.prose` and body paragraphs site-wide (not headings, badges, nav).

---

## 7. Delivery order

1. Migrations + seed (pages/sections/forms/media_library/revisions).
2. Public site refactor to `usePage` + `SectionRenderer` (home first, then About, Programmes, Parliament, then long tail).
3. Dash-strip + justification pass.
4. Admin: Pages list → Page editor → Media Library → Form Builder → Submissions Inbox → SEO Manager → Global Settings.
5. Edge functions (`submit-form`, `publish-page`).
6. QA: every public route loads from DB, every form submits to inbox, every image swappable, bulk actions work.

---

## 8. Out of scope (call out)

- No visual redesign of the public site (only typography justify + dash removal).
- No multi-language editor yet (English only per project memory); structure supports it later.
- No A/B testing or scheduled publishing in v1 (revisions + manual publish only).

---

## Open questions

1. **Page editor surface**: inline on the live page (click-to-edit overlay) or side-panel editor with iframe preview? Side-panel is faster to build and safer; inline is flashier.
2. **Revision retention**: keep all revisions forever, or cap at last 20 per page?
3. **Form submission storage of files**: store in a new private `form-uploads` bucket (recommended) or attach to existing buckets?
4. **Dash replacement rule**: replace `—` with `,` everywhere, or context-aware (`:` when followed by a clause, `,` otherwise)? Context-aware is better but slower to ship.
