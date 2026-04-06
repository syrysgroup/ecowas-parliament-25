

# Comprehensive Plan: Image Sizing, Parliament Layout, CRM Completeness

This plan addresses all five requests in your message.

---

## 1. Change all placeholder/cover images to 4:5 (Instagram) aspect ratio

**What changes**: Every place that displays a news article image, event cover image, or parliament placeholder image will use `aspect-[4/5]` instead of `aspect-square` or other ratios.

**Files to modify**:
- `src/components/home/LatestNews.tsx` — change `aspect-square` to `aspect-[4/5]`
- `src/pages/News.tsx` — change `aspect-square` to `aspect-[4/5]`
- `src/pages/Events.tsx` — change `aspect-square` to `aspect-[4/5]`
- `src/components/home/EventsSection.tsx` — no image aspect to change (list layout), skip
- `src/pages/programmes/Parliament.tsx` — change placeholder images to use `aspect-[4/5]` containers for principal officers and delegate slots (both in the Principal Officers section and the Delegates tab)
- `src/pages/events/EventDetail.tsx` — adjust cover image if using aspect ratio
- `src/pages/news/NewsDetail.tsx` — adjust cover image if using aspect ratio

---

## 2. Speaker elevated above other Principal Officers

**What changes**: In `src/pages/programmes/Parliament.tsx`, the Speaker card will be displayed prominently above the other 4 officers in both the Principal Officers section and the Delegates tab.

**Layout**:
- Speaker card rendered alone, full-width or centered, with a larger image (4:5 ratio) and distinct styling (gold/primary border, larger text)
- Below: the 4 Deputy Speakers in a `grid-cols-4` row
- This applies to both the standalone Principal Officers section (line ~160) and the Delegates tab (line ~213)

---

## 3. CRM fully functional — uploads, buckets, multilingual documents

**Current gaps identified**:

### Documents Module
- Currently only records metadata (title, category, file_type) — **no actual file upload/download**
- Needs: file upload to Supabase storage, download via public URL, language tagging

### What to build:
- **Create a `documents` storage bucket** (if not existing) via migration
- **Add `file_url` and `language` columns** to the `documents` table
- **Update DocumentsModule** to support actual file upload (to `documents` bucket), download (via public URL), and a language selector (EN/FR/PT) per document
- **Allow multiple language versions** per document title (either separate rows per language or a `language` column filter)

### Other CRM modules — functional check:
- **News Editor**: functional (has image upload to `news-images` bucket, CRUD)
- **Events Manager**: functional (has image upload to `event-images` bucket, CRUD)
- **Media Library**: functional (uploads to `cms-media` bucket)
- **Sponsors/Partners Manager**: functional (uploads to `sponsor-logos`/`partner-assets`)
- **Finance Module**: queries `budget_items` table — may need migration if table doesn't exist
- **Invoice Module**: queries `invoices`/`invoice_items` tables — may need migration if tables don't exist

### Database migrations needed:
1. Create `documents` storage bucket (public) if missing
2. Alter `documents` table: add `file_url TEXT`, `language TEXT DEFAULT 'en'`
3. Verify/create `budget_items` table for Finance module
4. Verify/create `invoices` and `invoice_items` tables for Invoice module

---

## 4. Super Admin — what's missing?

**Currently implemented** (6 tabs): Overview, Users, Invitations, Activity Log, Site Routes, Settings

**Missing for a fully functional super admin**:
- **Bulk user delete/deactivate** — cannot remove users currently
- **Storage bucket management** — no visibility into storage usage or bucket contents
- **Database health/table overview** — no way to see table row counts
- **Role permissions editor** — the `role_permissions` table exists but no UI to manage it from Super Admin (only from a separate module)
- **Site settings management** — the Settings tab only shows system info, not editable site settings (those are in Site Content module)
- **Export data** — no CSV/data export for users, activity logs
- **Audit trail for role changes** — role add/remove doesn't log to `admin_activity_logs`

### What to add:
- Add activity logging when roles are changed (insert into `admin_activity_logs`)
- Add a "Storage" tab showing bucket names and file counts
- Add user delete capability (with confirmation)
- Add CSV export button for users list

---

## 5. Translation awareness

All new UI strings (document language labels, new button text) will use the existing `useTranslation` hook and add keys to `en.ts`, `fr.ts`, `pt.ts`.

---

## Technical Summary

| Task | Files | Migration |
|------|-------|-----------|
| 4:5 image ratio | LatestNews, News, Events, Parliament, EventDetail, NewsDetail | None |
| Speaker elevation | Parliament.tsx | None |
| Documents upload | DocumentsModule.tsx | Add `file_url`, `language` columns; create bucket |
| Finance/Invoice tables | — | Create tables if missing |
| Super Admin enhancements | SuperAdminModule.tsx | None |
| Translations | en.ts, fr.ts, pt.ts | None |

**Estimated scope**: ~10 file changes, 2-3 database migrations.

