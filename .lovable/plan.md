

## CRM Gap Analysis — Updated Assessment

Your analysis was thorough, but many items have already been implemented at both the database and CRM module level. Here is the revised status and remaining work.

### Already Implemented (No Action Needed)

| Gap | Status |
|-----|--------|
| Team member profile editing (photo, title, bio, org) | Done — PeopleModule has avatar upload to `team-avatars`, title, org, bio, show_on_website fields |
| Events Manager module | Done — Full CRUD with cover image upload, registration_type (none/external/form), tag/tag_color, publish toggle |
| Sponsors & Partners Manager | Done — Tabbed UI for sponsors + partners, logo upload, tier, programmes, publish toggle |
| News Editor module | Done — CRUD with cover image upload, slug, status (draft/published), publish workflow |
| Site Content Manager | Done — Editable sections for hero, stats, quote, about via `site_content` table |
| Contact Submissions viewer | Done — Read-only list of submissions |
| Newsletter Subscribers viewer | Done — Shows active/unsubscribed counts and list |
| Storage buckets | Done — team-avatars, event-images, sponsor-logos, news-images, cms-media, partner-assets all exist |
| Database tables | Done — sponsors, partners, news_articles, site_content, newsletter_subscribers, events (with cover_image_url, registration_type, etc.) all exist |

### Remaining Gaps (Actual Work Needed)

#### 1. Public pages still hardcoded — not reading from database

These pages have CRM modules to manage the data, but the public-facing components still use hardcoded arrays:

- **Homepage LatestNews** (`LatestNews.tsx`) — hardcoded `placeholderNews` array with imported images, does NOT query `news_articles` table
- **News page** (`News.tsx`) — hardcoded `allNews` array, does NOT query `news_articles`
- **Homepage EventsSection** (`EventsSection.tsx`) — has DB query but falls back to hardcoded events; already partially wired
- **Homepage SponsorsSection** (`SponsorsSection.tsx`) — entirely hardcoded programme/sponsor arrays
- **Stakeholders page** (`Stakeholders.tsx`) — hardcoded stakeholders, partners, and sponsors arrays
- **Homepage StatsSection** (`StatsSection.tsx`) — hardcoded stat values (not reading from `site_content`)
- **Homepage HeroSection** (`HeroSection.tsx`) — hardcoded text (not reading from `site_content`)
- **PartnersStrip** (`PartnersStrip.tsx`) — hardcoded AWALCO text

#### 2. Programme pages sponsor sections
Programme pages (Trade, Youth, Women, etc.) have hardcoded sponsor data in their footers/marquees.

---

### Implementation Plan

**Phase 1 — Wire public pages to existing database tables**

1. **News pages → `news_articles` table**
   - Replace hardcoded arrays in `LatestNews.tsx` and `News.tsx` with `useQuery` calls to `news_articles` where `status = 'published'`
   - Use `cover_image_url` from DB, fall back to placeholder if null

2. **Sponsors/Partners on public pages → `sponsors` + `partners` tables**
   - Replace hardcoded data in `SponsorsSection.tsx`, `Stakeholders.tsx`, and programme page footers with DB queries where `is_published = true`

3. **Homepage sections → `site_content` table**
   - Wire `HeroSection.tsx` and `StatsSection.tsx` to read from `site_content` (keys: `hero`, `stats`) with current hardcoded values as fallbacks

4. **EventsSection cleanup**
   - Remove hardcoded fallback events (DB query already exists)

**Phase 2 — Enhance existing modules**

5. **News page detail view** — Add `/news/:slug` route to display individual articles from DB
6. **Event registration** — Wire the `event_registrations` table to a registration form on event detail pages
7. **Newsletter signup** — Wire the homepage `NewsletterSection` form to insert into `newsletter_subscribers`

### Technical Approach
- Each public component gets a `useQuery` hook querying the relevant Supabase table
- Hardcoded data becomes the fallback (shown only when DB returns empty)
- No database migrations needed — all tables and columns already exist
- No new CRM modules needed — all management UIs already exist
- Estimated: ~8 files modified, 0 new files

