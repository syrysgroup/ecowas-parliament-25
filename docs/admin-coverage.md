# Admin ↔ Public Web Coverage Audit

Last generated: Phase 1 of the admin rebuild. Source files cross-referenced:
`apps/web/src/App.tsx` and `apps/admin/src/components/crm/crmModules.ts`.

## Coverage matrix

| Public surface | Admin module | Status |
| --- | --- | --- |
| `/` (Home) | `site-content`, `cms` | OK |
| `/about` | `site-content` | OK |
| `/timeline` | `programme-pillars` (Timeline tab) | OK |
| `/news`, `/news/:slug` | `news-editor` | OK |
| `/documents` | `documents` | OK |
| `/stakeholders`, `/partners/:slug` | `stakeholders-mgmt`, `sponsors-partners` | OK |
| `/team` | `team` | OK |
| `/contact` | `contact-submissions` | OK |
| `/media-kit` | `media-kit-mgmt` | OK |
| `/sponsors`, `/sponsors/:slug` | `sponsors-partners` | OK |
| `/events`, `/events/:id` | `events-manager` | OK |
| `/volunteer` | — | **GAP** — no applications inbox or form editor |
| `/ecowas-parliament` | `parliament-content`, `parliament-ops` | OK |
| `/parliament-tour` | `parliament-tour` (Panorama) | OK |
| `/marketplace/*` | `marketplace` | OK |
| `/programmes/youth` + `innovators`, `smart` | `programme-pillars` (no sub-pillar editor) | **PARTIAL** |
| `/programmes/{trade,women,civic,culture,awards,parliament}` | `programme-pillars` | OK |
| `/programmes/:slug` (dynamic) | `programme-pillars` | OK |
| `/media-portal` | — | **GAP** — no media accreditation queue |
| `/sponsor-dashboard` | `sponsor-metrics` (read-only) | **PARTIAL** — no portal-config controls |
| `/auth`, `/set-password`, `/complete-profile` | `people`, `roles` | OK |
| Footer, SEO meta, social handles | `site-content`, `seo` | OK |
| Cookie consent + legal pages | — | **GAP** — no Privacy/Terms/Cookies editor |
| Newsletter signups | `newsletter` | OK |

## Gaps to fill in Phase 3

1. **Volunteer applications module** — inbox, status workflow, form-schema editor, email triggers.
2. **Media accreditation module** — review press-pass requests, issue/revoke badges, contact list.
3. **Legal pages module** — rich-text editor for Privacy, Terms, Cookie policy stored in `site_content`.
4. **Youth sub-pillar editor** — Innovators Challenge + Smart Challenge content, milestones, submissions, inside Programme Pillars.
5. **Sponsor portal config** — choose widgets, downloads, and reports surfaced to sponsors on `/sponsor-dashboard`.

Each new module will land in `crmModules.ts` (group `CONTENT` or `ADMINISTRATION`) with its own migration (table + GRANTs + RLS via `is_crm_staff()`) and edge function where needed.