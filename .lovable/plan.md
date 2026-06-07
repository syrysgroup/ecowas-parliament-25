
# Admin CRM — Full Rebuild Plan

The admin app already has ~24,000 lines across 37 modules. A literal "rebuild from scratch" would throw away working features (Email, Messaging, Marketplace, SuperAdmin, etc.) and break the live site. Instead, this plan does a **structural rebuild of the shell + design system**, a **feature-coverage audit**, and a **module-by-module migration** so nothing regresses.

Three sequential phases. Each phase is independently shippable.

---

## Phase 1 — Audit & New Design System (foundation)

**1.1 Web-vs-Admin coverage audit (deliverable: `docs/admin-coverage.md`)**

Map every public-web route to the admin module(s) that control it, then list gaps. Initial scan against `apps/web/src/App.tsx` + `apps/admin/crmModules.ts`:

```text
Public route                  → Admin module (status)
/                             → SiteContent + CMS                  ok
/about                        → SiteContent                         ok
/timeline                     → ProgrammeTimeline                   ok
/news, /news/:slug            → NewsEditor                          ok
/documents                    → Documents                           ok
/stakeholders, /partners/:slug→ Stakeholders + Sponsors             ok
/team                         → Team                                ok
/contact                      → ContactSubmissions                  ok
/media-kit                    → MediaKit                            ok
/sponsors, /sponsors/:slug    → SponsorsManager                     ok
/events, /events/:id          → EventsManager                       ok
/volunteer                    → ? (NO admin form-config module)     GAP
/ecowas-parliament            → ParliamentContent + ParliamentOps   ok
/parliament-tour              → Panorama                            ok
/marketplace/*                → Marketplace                         ok
/programmes/youth (+innov.+smart) → ProgrammePillars (sub-pillars?)  PARTIAL
/programmes/trade|women|civic|culture|awards|parliament → Pillars   ok
/programmes/:slug (dynamic)   → ProgrammePillars                    ok
/media-portal                 → ? (no media-accred. module)         GAP
/sponsor-dashboard            → SponsorMetrics (read-only)          PARTIAL
Auth / SetPassword / CompleteProfile → People + Roles               ok
Footer links, SEO meta, social handles → SiteContent + SEO          ok
Cookie consent + legal pages  → ? (no legal-pages module)           GAP
Newsletter subscribers list   → Newsletter                          ok
```

Identified gaps to fill in Phase 3:
- Volunteer applications inbox + form-field editor
- Media accreditation queue (review / approve / revoke press passes)
- Legal pages editor (Privacy, Terms, Cookie policy)
- Youth sub-pillar editor (Innovators / Smart) inside Programme Pillars
- Sponsor self-service surface parity with `SponsorDashboard`

**1.2 New design tokens (ECOWAS brand, modernized)**

Update `apps/admin/src/index.css` + `tailwind.config.ts`:
- Keep ECOWAS Green / Yellow / Deep Red as `--brand-*`; introduce neutral surface scale (`--surface-1..4`) for elevation instead of flat cards.
- Replace ad-hoc `bg-crm` / hardcoded greys with semantic tokens (`--bg`, `--bg-elevated`, `--border-subtle`, `--text-1/2/3`).
- Add gradient + shadow tokens (`--gradient-brand`, `--shadow-elev-1..3`).
- Typography scale on Source Sans Pro: display / h1 / h2 / body / mono.
- Motion tokens: `--ease-out-soft`, `--dur-fast/med/slow`.
- Full dark-mode parity (current admin is mostly light-only).

**1.3 New app shell (`CRMShellV2`)**

New components under `apps/admin/src/components/shell/`:
- `AppShell.tsx` — three-zone layout (rail + sidebar + main) using shadcn `SidebarProvider`.
- `BrandRail.tsx` — narrow 56px rail with ECOWAS logo, group icons, presence dot, theme toggle.
- `ModuleSidebar.tsx` — collapsible groups from `MODULE_GROUPS`, with pinned-favorites and recent-modules.
- `TopBar.tsx` — global search (`Cmd+K`), breadcrumbs, notifications bell (reuses `useNotifications`), avatar menu.
- `CommandPalette.tsx` — Cmd+K palette: jump to any module, search records (people/events/news/sponsors), run admin actions (invite user, publish news, send newsletter).
- `MobileShell.tsx` — keeps current mobile bottom-nav but re-themed.
- `PageHeader.tsx`, `EmptyState.tsx`, `DataTable.tsx`, `SidePanel.tsx` — shared module primitives so every migrated module has consistent affordances.

**1.4 New Dashboard (`DashboardModuleV2`)**

Role-aware home with: KPI strip, recent activity feed, pending approvals (volunteer, media, sponsor invoices), upcoming events, traffic snapshot, and quick-actions tied to Command Palette.

Phase 1 ships behind a `?shellV2=1` flag plus a Settings toggle so we can demo it without disrupting users.

---

## Phase 2 — Module Migration (parity pass)

Migrate each existing module onto the new shell primitives **without changing its data layer**. For every module: swap layout to `PageHeader` + `DataTable` + `SidePanel`, replace hardcoded colors with new tokens, add empty/loading/error states, add keyboard shortcuts, ensure mobile responsiveness.

Order (highest-traffic first):
1. Dashboard, Tasks, Calendar, Documents
2. Email Inbox, Chat (Messaging)
3. People & Access, Roles, Team
4. News Editor, Events Manager, CMS, Site Content, Media Library
5. Sponsors & Partners, Marketplace, Stakeholders, Media Kit
6. Programme Pillars, Parliament Content, Parliament Ops, Panorama
7. Analytics, Geo Analytics, Sponsor Metrics, Finance, Invoices, SEO
8. Marketing, Newsletter, Contact Submissions
9. Super Admin Hub, Settings, Profile

After each module is migrated and verified, remove its legacy styling. The shell flag flips to default-on after step 5.

---

## Phase 3 — Fill Web-Control Gaps

New modules added to `crmModules.ts` (group: CONTENT or ADMINISTRATION):

1. **VolunteerModule** — applications inbox (filter / approve / reject / export), editable form schema, email triggers.
2. **MediaAccreditationModule** — review press-pass requests, issue/revoke badges, contact list.
3. **LegalPagesModule** — rich-text editor for Privacy / Terms / Cookie policy stored in `site_content`.
4. **YouthSubPillarsModule** — manage Innovators Challenge + Smart Challenge content blocks, milestones, submissions.
5. **SponsorPortalConfigModule** — control what sponsors see in `SponsorDashboard` (widgets, downloads, reports).

Each new module gets its own Supabase migration (table + GRANTs + RLS via `is_crm_staff()`), edge function where needed, and seed defaults. Migrations are surfaced via the migration tool for approval before any code change in build mode.

---

## Phase 4 — Verification

- Visual QA: screenshot every section at desktop + mobile after migration.
- Functional QA: smoke-test every module's primary CRUD path.
- Accessibility pass (keyboard nav, ARIA, contrast in both themes).
- Performance: lazy-load modules > 500 LOC, prefetch on hover in sidebar.
- Update `mem://style/visual-identity` with the new token map.

---

## Technical notes

- Routing stays `/:section?` — no URL changes, so deep links keep working.
- `crmModules.ts` remains the single source of truth; the new sidebar consumes it directly.
- `usePermissions` and `is_crm_staff()` stay unchanged; only presentation is rebuilt.
- No database schema changes in Phases 1–2. Phase 3 migrations are listed but not written until that phase is approved.
- Module files are migrated in-place (not duplicated) once the shell flag is default-on, to avoid a long-lived fork.

## Out of scope

- Replacing Supabase / TanStack Query / Radix.
- Rewriting Email Inbox or Messaging business logic (only their chrome is restyled).
- Multi-language admin UI (project is English-only for this phase per memory).
- Changing the public website's visual design.

## Open question before build

Do you want Phase 3 (the 5 new modules) scoped now, or should I deliver Phases 1–2 first and re-scope Phase 3 once the new shell is live?
