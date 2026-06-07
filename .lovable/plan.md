# Phase 2 — Module Migration (parity pass)

Goal: re-skin every existing CRM module onto the Phase 1 shell primitives (`PageHeader`, `Surface`, `StatCard`, `EmptyState`, new tokens) without touching data, queries, mutations, or business logic. Each batch ends in a shippable state.

## Ground rules (apply to every module)

- Wrap the module in `PageHeader` (icon + title + description + actions). Remove module-local title bars.
- Replace `bg-crm*`, `text-crm*`, raw greys, and ad-hoc hex with the new semantic tokens (`--surface-1..4`, `--text-1/2/3`, `--border-subtle`, `--brand-*`).
- Use `Surface` for cards/panels; `StatCard` for KPI tiles; `EmptyState` for zero-data; shadcn `Skeleton` for loading; toast on error.
- Keyboard: ensure primary action has a shortcut (documented in the header tooltip). Cmd+K already global.
- Mobile: verify at 375px — stack columns, hide non-essential toolbar bits.
- Data layer (`useQuery`, mutations, Supabase calls, edge function calls) is untouched.
- After each batch: visual diff at desktop + mobile, smoke-test primary CRUD path, then move on.

## Migration batches (sequential, each independently shippable)

**Batch 1 — Core workspace**
Dashboard, Tasks, Calendar, Documents.
Dashboard becomes `DashboardModuleV2`: KPI strip (StatCard), pending approvals, upcoming events, recent activity, quick actions wired to Command Palette.

**Batch 2 — Communications**
Email Inbox, Chat (Messaging). Chrome-only restyle — Zoho integration, threads, drafts, presence all untouched. Per memory, business logic stays.

**Batch 3 — People & Access**
People & Access, Roles, Team. Standard list+detail pattern via `Surface` + side panel.

**Batch 4 — Content cluster** (after this batch, `shellV2` flag flips to default-on)
News Editor, Events Manager, CMS, Site Content, Media Library.

**Batch 5 — Partners & Marketplace**
Sponsors & Partners (incl. Partners tab per memory), Marketplace, Stakeholders, Media Kit.

**Batch 6 — Programmes & Parliament**
Programme Pillars, Parliament Content, Parliament Ops, Panorama.

**Batch 7 — Analytics & Finance**
Analytics, Geo Analytics, Sponsor Metrics, Finance, Invoices, SEO.

**Batch 8 — Outreach**
Marketing, Newsletter, Contact Submissions.

**Batch 9 — Admin surfaces**
Super Admin Hub (preserve `Tab` union + `NAV` array pattern, restyle sub-tabs in `superadmin/`), Settings, Profile.

## Flag lifecycle

- Batches 1–4: behind `?shellV2=1` + Settings toggle (current behavior).
- After Batch 4 verified: `shellV2` defaults to ON; old `CRMLayout` kept as `?shellV2=0` escape hatch.
- After Batch 9 verified: remove legacy `CRMLayout` + `bg-crm*` token aliases in a final cleanup commit.

## Technical notes

- No DB migrations in this phase.
- `crmModules.ts` registry untouched (no new entries, no removals).
- `usePermissions`, `is_crm_staff()`, `getModulesForRoles()` untouched.
- Lazy-loaded modules stay lazy; eagerly-imported stay eager.
- Each batch lands as its own coherent change so you can review/revert per batch.

## Out of scope (unchanged from master plan)

- Email/Messaging logic rewrites.
- New modules (those are Phase 3).
- Public website changes.
- DB schema changes.

## Open question

Start Batch 1 now? Or want me to land the `DashboardModuleV2` first as a standalone preview before touching Tasks/Calendar/Documents?
