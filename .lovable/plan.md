# Plan — Fix quoted name, Culture.tsx error, and finish admin CRUD coverage

## 1. Root cause of the `"ECOWAS Parliament Initiatives"` quotes

The DB row `site_settings.site_name` is a JSONB **string** whose actual content is `"ECOWAS Parliament Initiatives"` — the quote characters are part of the string. This happened because `BrandingSettings.tsx` calls `JSON.stringify(name)` and stores the result into a JSONB column, double-encoding it. Every consumer (Navbar, SEOHead, `useSiteSettings.get`) then renders the value with literal quotes.

**Fix (3 layers):**
1. **Data migration** — strip surrounding quotes from any double-encoded string settings:
   ```sql
   UPDATE site_settings
   SET value = to_jsonb(btrim(value #>> '{}', '"'))
   WHERE jsonb_typeof(value) = 'string'
     AND value #>> '{}' LIKE '"%"';
   ```
2. **`BrandingSettings.tsx`** — stop calling `JSON.stringify(...)` when writing strings to JSONB. Pass the raw string; Supabase encodes it correctly.
3. **`useSiteSettings.ts` (web + admin)** — defensive: if a returned string still starts and ends with `"`, strip them once. Prevents recurrence if any other writer double-encodes.

After this the Navbar, footer, `<title>`, SEO meta, and every page that reads `site_name` will show `ECOWAS Parliament Initiatives` cleanly.

## 2. Culture.tsx TS17008 error

The current `apps/web/src/pages/programmes/Culture.tsx` is only 57 lines and is syntactically valid — there is no unclosed `<Layout>` or `<section>`. The errors at lines 93/196 are from a stale editor/IDE buffer (likely an unsaved revision). I will:
- Re-read and re-save the file as-is to flush the linter cache.
- Verify build passes (`tsc` runs automatically on save).
- If the user actually wants a richer Culture page, propose a separate enhancement — this plan only ensures no compile errors.

## 3. Programmes menu — dynamic, alpha-sorted, respect hide

Today `Navbar.tsx` already queries `programme_pillars`, but it does not enforce alphabetical order and the hide toggle is not consistently respected for menu/footer/home grid.

**Changes:**
- Single source of truth: `programme_pillars` table (already exists, with `is_active`, `title`, `route`, `slug`, `display_order`).
- Navbar dropdown query: `select … where is_active = true order by title asc` (override `display_order` for the menu, per the user's explicit "alphabetical" request). Same change in mobile sheet.
- Footer programmes list, homepage `ProgrammePillarsSection`, and any `programmes/` route guard (`useProgrammeVisibility`) all read from the same filtered, alpha-sorted list.
- `App.tsx` keeps the static `/programmes/:slug` route, but `PillarPage` already 404s when `is_active=false`. Confirm `Culture.tsx`, `Civic.tsx`, etc. all go through `useProgrammeVisibility` (most do; audit and fix any that don't).
- Admin `ProgrammePillarsModule` already supports create/edit/hide; verify the **Eye/EyeOff** toggle flips `is_active` and invalidates the `["programmes-nav"]` query so the web menu updates within ~30 s (or immediately via realtime subscription — add a lightweight `supabase.channel` listener in Navbar).

Result: adding a new pillar in admin instantly shows it in the menu (sorted A→Z); hiding it removes it from the menu, footer, homepage grid, and 404s the route.

## 4. Audit: every page / every word editable from admin

Goal: no hard-coded copy on `apps/web`. Pass over each public page and ensure it reads from a CMS row (`site_content`, `programme_pillars`, `news_articles`, `events`, `team_members`, `partners`, `sponsors`, `timeline_events`, `parliament_content`, `media_kits`, `documents`, etc.). For anything still hard-coded, add a `site_content` key + admin editor template.

Targeted sweep (in priority order):
1. **Home** — `MarqueeStrip`, `MarketplaceSpotlight`, `EventsSection`, `SponsorPlaceholderSection`, `AnniversarySection`, `CountdownTimer` fallback name. Wire each to `useSiteContent(...)` with English fallback (rows already seeded in phase 2).
2. **Programme pages** — `PillarPage` uses `programme_pillars` + `programme_page_content` + `programme_page_sections`. Audit `Awards`, `Women`, `Youth`, `Trade`, `Culture`, `Civic`, `InnovatorsChallenge`, `SmartChallenge` to ensure they pull from those tables and not from `data/*.ts`. Migrate any leftover hardcoded arrays into seeded DB rows.
3. **About / EcowasParliament / ParliamentCountry / Timeline / Contact / Stakeholders / Media** — each already partially CMS-driven; finish the last hard-coded blocks (hero copy, stats, CTA strips, contact addresses, social links).
4. **Navbar / Footer** — link list editor (`site_content` key `nav_links` and `footer_links`) so admin can rename/reorder/add nav items without code.
5. **Documents / images** — every `<img>` reading from `/src/assets` becomes overridable via a `site_content.*_image_url` row backed by the existing `cms-media` bucket. Re-use the `ImageUploadOrUrl` widget already in `SiteContentModule`.

For each new `site_content` key:
- Add a row in a small `phase3_content_seeds` migration with `key`, `locale='en'`, sensible defaults.
- Add a template entry in `SiteContentModule.tsx` so it appears in the admin editor.
- Update the web component to consume it with a fallback.

## 5. Multi-select / bulk operations everywhere in admin

Add a reusable `useBulkSelection<T>()` hook + a `BulkActionBar` component (checkbox column, header "select-all" checkbox, sticky action bar with Delete / Publish / Unpublish / Export CSV). Roll it into every list module:

- `NewsEditorModule` (articles)
- `EventsModule` (events + registrations)
- `TeamModule` (team members)
- `PartnersModule` (partners + sponsors)
- `ProgrammePillarsModule` (pillars + sections)
- `TimelineModule` (events tab)
- `DocumentsModule`, `MediaKitModule`
- `InvitationsModule`, `UsersModule` (super admin)
- `MarketplaceModule`, `StakeholdersModule`, `NominationsModule`
- `EmailInboxModule` (already partially bulk; harmonize)

Bulk actions are role-gated through existing `usePermissions` checks; destructive actions require an `AlertDialog` confirmation and write to `admin_activity_logs`.

## 6. Out of scope for this plan

- Visual redesign of any page.
- New authentication flows.
- Country-page rebuild and 360° tour (handled separately).

## Technical breakdown

- **1 SQL migration** (`phase3_quotes_fix_and_content_seeds`):
  - `UPDATE site_settings` to strip double-encoded quotes.
  - Insert any new `site_content` keys discovered during audit.
- **Code edits:**
  - `apps/admin/src/views/admin/settings/BrandingSettings.tsx` — drop `JSON.stringify` for string values.
  - `apps/web/src/hooks/useSiteSettings.ts` + admin twin — defensive quote-strip.
  - `apps/web/src/components/layout/Navbar.tsx` + `Footer.tsx` — alpha-sort programmes, realtime subscription.
  - Audit + rewire programme pages and homepage components that still hardcode copy.
  - New `apps/admin/src/hooks/useBulkSelection.ts` and `apps/admin/src/components/crm/shared/BulkActionBar.tsx`; integrate into the ~12 list modules listed above.
- **Verification:** re-save `Culture.tsx`, confirm build is green, hit the preview to confirm the Navbar/footer no longer show quotes and that toggling a pillar in admin updates the menu live.

## Estimated size

~1 migration, 2 hook tweaks, 1 admin settings fix, 1 new hook + 1 new shared component, ~12 admin module edits, ~6 web component rewires. Shippable in one turn; you can review on preview before approving any follow-up phases.
