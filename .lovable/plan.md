# Phase 2 — Home + About + Timeline sweep

Pure plumbing: no visual redesign. Every user-facing string and image on `/`, `/about`, and `/timeline` becomes editable from the admin CRM, with admin-uploaded images flowing through the existing `cms-media` bucket.

## Scope by page

### 1. About (`/about`) — small clean-up
Already reads `parliament_initiative` from `site_content`. Remaining gaps:
- Add `hero_image_url` field so the hero gradient can be replaced/overlaid with an admin-uploaded image.
- Add `intro_eyebrow` (badge above hero title) — currently absent.
- No new tables.

### 2. Home (`/`) — finish the CMS sweep
Already wired: hero, speaker, quote, about, countdown, pillars, did_you_know, anniversary, anniversary_stats, mandate, implementing_partners, institutional_partners, newsletter, sponsor_cta, stats. Sections that still contain hardcoded copy/images:

| Component | New `site_content` key | Fields |
|---|---|---|
| `MarqueeStrip` | `home_marquee` | `items` (JSON array of strings) |
| `Parliament25Section` | `home_parliament25` | `badge`, `title`, `title_accent`, `description`, `cta_label`, `cta_href`, `image_url` |
| `ParliamentTourSpotlight` | `parliament_tour` *(exists, add)* | `image_url`, `cta_label`, `cta_href` |
| `MarketplaceSpotlight` | `home_marketplace` | `badge`, `title`, `title_accent`, `subtitle`, `cta_label`, `cta_href`, `feature1_label`, `feature1_sub` … `feature3_*` |
| `SponsorPlaceholderSection` | `home_sponsor_placeholder` | `badge`, `title`, `description`, `cta_label`, `cta_href`, `image_url` |
| `EventsSection` (header copy only) | `home_events` | `badge`, `title`, `subtitle`, `cta_label`, `cta_href` |
| `LatestNews` (header copy only) | `home_latest_news` | `badge`, `title`, `subtitle`, `empty_state`, `cta_label`, `cta_href` |
| `PartnersStrip` | `home_partners_strip` | `title` |
| `AnniversarySection` body copy | extend existing `anniversary` | add `cta_label`, `cta_href`, `image_url` |

All new keys added to `SECTION_TEMPLATES` in `SiteContentModule.tsx`. Image fields rendered with the existing `ImageUploadOrUrl` widget (already used elsewhere in that module).

### 3. Timeline (`/timeline`) — convert to DB
Currently a hardcoded `events` array of 11 entries + a hardcoded "Official Launch Highlights" gallery + page hero/stats.

**New table** `timeline_events`:
```
id uuid pk, month_label text, sort_order int,
country text, city text, title text, description text,
programme text,              -- maps to programmeMap key
deliverables text[],          -- array of bullets
highlight boolean default false,
is_published boolean default true,
created_at, updated_at
```
- RLS: `anon SELECT WHERE is_published`, `authenticated` full via `has_role(... 'admin'|'super_admin')`.
- GRANTs follow the standard public-table block.
- Seed migration inserts the 11 existing events verbatim so the page renders identically on day 1.

**Page hero + announcement gallery** go to `site_content`:
- `timeline_hero`: `badge`, `title`, `title_accent`, `description`, `stat1_value`/`label` … `stat4_*`.
- `timeline_launch_highlights`: `badge`, `title`, `subtitle`, `items` (JSON array of `{title, caption, image_url}`).
- `timeline_cta`: `title`, `description`, `primary_label`/`href`, plus N secondary buttons as JSON.

**New admin module** `TimelineModule.tsx` (group: `CONTENT`, roles: admin/super_admin/content_manager):
- Tab 1 *Events* — table + drawer CRUD (RHF + Zod), drag-to-reorder via `sort_order`, programme dropdown reuses the existing programme key set, deliverables editable as a chip list, publish toggle, highlight toggle.
- Tab 2 *Page Content* — three sub-cards bound to the three `site_content` keys above (reuses `SiteContentModule`'s field renderer or inlines a small editor with `ImageUploadOrUrl` for the highlight images).

Registered in `crmModules.ts` (`section: "timeline"`, `group: "CONTENT"`) and lazy-loaded in `CRMDashboard.tsx`.

Public `Timeline.tsx` rewired to:
- `useQuery` against `timeline_events` ordered by `sort_order`.
- Filters stay client-side but are built from the distinct `programme` values returned.
- Hero, stats, gallery, CTA all read from `site_content` with safe fallbacks.

## Migration

One migration (`phase2_timeline_and_content_seeds`):
1. `CREATE TABLE public.timeline_events …`
2. `GRANT SELECT ON public.timeline_events TO anon;`
   `GRANT SELECT, INSERT, UPDATE, DELETE ON public.timeline_events TO authenticated;`
   `GRANT ALL ON public.timeline_events TO service_role;`
3. `ENABLE ROW LEVEL SECURITY`
4. Policies: anon read-published, authenticated admin/super_admin/content_manager full access via `has_role`.
5. `updated_at` trigger.
6. Seed: 11 existing timeline events.
7. Seed `site_content` rows for every new key listed above (empty defaults; the page falls back to the legacy string when a value is missing so nothing breaks before an editor fills them in).

No new buckets, no schema changes to existing tables (besides additive `site_content` rows). No new auth roles.

## Validation checklist (run at the end)

1. `rg -n '"[A-Z][a-z]+ [a-z]+' apps/web/src/components/home apps/web/src/pages/Timeline.tsx apps/web/src/pages/About.tsx` returns only design-system labels and dev-only strings.
2. `rg -n 'src="/.*\.(jpg|png|webp|svg)"' apps/web/src/components/home apps/web/src/pages/Timeline.tsx apps/web/src/pages/About.tsx` returns nothing user-facing.
3. Edit any new field in `/crm/site-content` or `/crm/timeline`, reload the public page, see the change without a redeploy.

## Out of scope (deferred to later phases)

- Programme-pillar pages (Phase 3).
- Parliament, 360° tour, country pages (Phase 4).
- Navbar/footer link list editor, cookie-consent text (Phase 4).
- Any visual redesign of the three target pages.

## Estimated size

~1 migration, 1 new admin module, 1 module extension (`SiteContentModule` templates), 3 public pages re-wired (Home aggregate ≈ 9 components touched, About 1 field added, Timeline rewritten to DB). Ships in a single turn; you can verify on preview before approving Phase 3.
