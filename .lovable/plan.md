

# CRM Gap Analysis and Enhancement Plan

## Current State Summary

The CRM has 18 modules: Dashboard, Tasks, Inbox, Email, Calendar, Messaging, Documents, Team Directory, People & Access, Parliament Ops, Sponsor Metrics, Analytics, Finance, Marketing, CMS Editor, Super Admin Hub, Geo Analytics, and Settings.

---

## Identified Gaps

### 1. Team Member Management (Photos, Bios, Website Visibility)

**Current state:** The Super Admin can toggle `show_on_website` and edit name/country, but there is NO way to upload profile photos (avatar_url), edit title, bio, or organisation from the CRM. The Team page on the website reads `avatar_url`, `title`, `organisation` from profiles but these fields can only be set... nowhere in the CRM UI.

**Fix:** Enhance the People Module or Super Admin user edit dialog to include:
- Photo upload (to Supabase Storage)
- Title, organisation, bio fields
- Preview of how the member appears on the public Team page

### 2. Sponsors / Partners / Consultants Management

**Current state:** Sponsor data on the public website (`Stakeholders.tsx`, `SponsorPage.tsx`) is **hardcoded** — not driven from the database. The CRM Sponsor Metrics module only tracks users with the `sponsor` role but has no fields for logo, description, website URL, tier (persisted), or programme association. There is no Partners or Consultants management module at all.

**Fix:** Create a `sponsors` database table (name, logo_url, description, tier, website, programmes, is_published) and a CRM module to manage them. Similarly for `partners` and `consultants` tables. Public pages should read from the database instead of hardcoded arrays.

### 3. Events Management (Design Images, Registration URLs/Forms)

**Current state:** The Calendar module creates internal CRM events. The public `events` table exists with basic fields (title, date, location, description, capacity, is_published) but is missing: **cover image/design image**, **registration URL** (external link), and **registration form toggle** (collect info via built-in form vs external link). The `EventsSection.tsx` on the homepage is also fully hardcoded.

**Fix:**
- Add columns to `events` table: `cover_image_url`, `registration_url`, `registration_type` (none/external/internal_form), `registration_fields` (JSON for custom form fields)
- Create a dedicated **Events Manager** CRM module (separate from Calendar) for managing public-facing events with image upload, registration config, and publish workflow
- Make homepage EventsSection pull from the database

### 4. CMS Editor Limitations

**Current state:** The CMS module manages a `cms_pages` table with slug/title/content/status. However, it only supports plain text/markdown content with no image uploads, no layout builder, and no way to manage the actual homepage sections (hero text, stats, quotes, news) which are all hardcoded.

**Fix:**
- Add image upload support to CMS pages
- Create a **Site Content Manager** for editing homepage sections (hero copy, stats numbers, quote text, news items) stored in a `site_content` key-value table
- Add a media library for uploading and managing images used across the site

### 5. News Management

**Current state:** The News/LatestNews section on the homepage is hardcoded. There is no `news` or `articles` table and no CRM module for publishing news.

**Fix:** Create a `news_articles` table and a News Editor within CMS or as a sub-module. Homepage LatestNews should query the database.

### 6. Newsletter / Contact Submissions Management

**Current state:** `contact_submissions` table exists but there's no CRM module to view/manage submissions. Newsletter signups have no table or management.

**Fix:** Add a Contact Submissions viewer in the CRM and a `newsletter_subscribers` table with management UI.

### 7. Media / Asset Library

**Current state:** Only one storage bucket (`partner-assets`). No centralized media library in the CRM for uploading event banners, sponsor logos, team photos, news images, etc.

**Fix:** Create storage buckets (`team-avatars`, `event-images`, `sponsor-logos`, `news-images`, `cms-media`) and a Media Library module or integrated upload component.

### 8. Public Website Content Still Hardcoded

**Current state:** Multiple public pages have hardcoded data that should be admin-editable:
- Homepage hero text, stats, pillars
- EventsSection (5 hardcoded events)
- SponsorsSection, PartnersStrip
- Stakeholders page (hardcoded people and sponsors)
- SponsorPage (hardcoded sponsor details)
- Programme pages sponsor sections

**Fix:** Migrate all hardcoded content to database tables with CRM editing interfaces.

---

## Recommended Implementation Priority

### Phase 1 — Core Content Management (highest impact)
1. **Team Member full profile editing** — add photo upload, title, bio, organisation to CRM user management
2. **Events Manager module** — cover images, registration URL/form config, publish to website
3. **Sponsors/Partners DB + CRM module** — replace hardcoded sponsor/partner data

### Phase 2 — Website Content Control
4. **News/Articles module** — create, edit, publish news from CRM
5. **Site Content Manager** — editable homepage sections (hero, stats, quotes)
6. **Media Library** — centralized image/asset management with storage buckets

### Phase 3 — Operational Completeness
7. **Contact Submissions viewer** — view and manage form submissions in CRM
8. **Newsletter Subscribers management**
9. **Public pages migration** — replace all hardcoded content with DB-driven content

---

## Technical Details

### New Database Tables Needed
- `sponsors` — id, name, slug, logo_url, description, tier, website, email, programmes (text[]), is_published, sort_order, created_at
- `partners` — id, name, slug, logo_url, description, type (implementing/institutional), website, is_published, sort_order
- `news_articles` — id, title, slug, excerpt, content, cover_image_url, author_id, status (draft/published), published_at, created_at
- `site_content` — id, section_key, content (jsonb), updated_at, updated_by
- `newsletter_subscribers` — id, email, subscribed_at, unsubscribed_at

### Events Table Additions
- `cover_image_url` (text)
- `registration_url` (text) 
- `registration_type` (text: none/external/form)

### Storage Buckets Needed
- `team-avatars` (public)
- `event-images` (public)
- `sponsor-logos` (public)
- `news-images` (public)

### New/Enhanced CRM Modules
- Enhanced People Module (photo + full profile editing)
- Events Manager (new, separate from Calendar)
- Sponsors & Partners Manager (new)
- News Editor (new or CMS sub-tab)
- Site Content Manager (new or CMS sub-tab)
- Contact Submissions Viewer (new)
- Media Library (new)

