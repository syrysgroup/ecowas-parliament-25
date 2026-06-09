# Phase 2 Kickoff — Shared `_kit/` + Batch B1 (Workspace)

Build the shared module primitives once, then migrate the three Workspace modules (Tasks, Documents, Calendar) to use them. Other batches (B2–B6) follow in later turns, one batch per turn.

## Part 1 — `_kit/` primitives

New folder: `apps/admin/src/components/crm/_kit/`

Components, all dark-ops styled with the existing `--surface-*`, `--text-*`, `--border-subtle`, `--brand-green` tokens already added in Phase 0. No new tokens, no new deps.

1. **`PageHeaderV2.tsx`** — thin wrapper over the `ModulePage` primitive already in `shell/primitives.tsx`. Adds optional `meta` slot (count badge, last-updated timestamp) and a `quickActions` slot rendered top-right.
2. **`FilterBar.tsx`** — horizontal toolbar: search input (left), filter chips (middle), sort + view-mode toggle (right). Controlled props: `search`, `onSearchChange`, `filters[]` (label + active + onClear), `right` slot. Sticky with `top-0 z-10` and a subtle bottom border.
3. **`DataTable.tsx`** — generic `<T>` table built on shadcn `Table`. Props: `columns` (`{ key, header, render?, width?, sortable? }`), `rows`, `rowKey`, `onRowClick`, `selectable?`, `selected?`, `onSelectionChange?`, `sort?`, `onSortChange?`, `loading?`, `empty?` (renders `EmptyStateV2`), `density?: 'comfortable'|'compact'`. Hover row highlight, keyboard arrow-up/down nav, optional row-trailing actions slot.
4. **`DetailDrawer.tsx`** — right-side drawer using shadcn `Sheet`. Props: `open`, `onOpenChange`, `title`, `subtitle?`, `tabs?`, `footer?`, width `420|520|640`. Closes on Esc, traps focus, scroll body internally.
5. **`EmptyStateV2.tsx`** — refined empty state: icon, title, description, primary + secondary action, optional small illustration slot. Uses dashed border on `surface-2`.
6. **`QuickActions.tsx`** — keyboard-discoverable action cluster (icon buttons with tooltips). Renders inline in `PageHeaderV2.quickActions`. Each item: `{ icon, label, onClick, shortcut? }`. Shortcut shown in tooltip; registration of actual hotkeys is opt-in (Phase 4).
7. **`index.ts`** — barrel export.

No changes to existing `shell/primitives.tsx`; `PageHeaderV2` composes `ModulePage` so both APIs coexist during migration.

## Part 2 — Batch B1 module migrations

For each module: keep the existing data hooks and Supabase queries untouched. Only swap the presentation layer: header → `PageHeaderV2`, filter row → `FilterBar`, list/table → `DataTable`, detail panel → `DetailDrawer`, empties → `EmptyStateV2`.

Safety net: each migrated module is reachable at its current section route. The old file is renamed to `<Name>Module.legacy.tsx` and kept importable via `?legacy=1` query param checked at the top of the new file (`if (params.get('legacy')==='1') return <LegacyModule/>`). Lets you A/B compare and roll back any single module without a revert.

### `TaskBoardModule.tsx`
- Header: `PageHeaderV2` with task count + "New task" primary action in `quickActions`.
- Filter row: search by title, status chips (Open / In progress / Done), assignee filter, priority filter.
- Body: `DataTable` with columns Title, Assignee, Due, Priority, Status. Row click → `DetailDrawer` (Overview / Activity tabs).
- Kanban view kept behind a view-mode toggle in `FilterBar.right` (table is default).
- Empty: `EmptyStateV2` "No tasks yet" with "Create your first task" CTA.

### `DocumentsModule.tsx`
- Header: `PageHeaderV2` with folder breadcrumb + "Upload" quick action.
- Filter row: search by name, type chips (PDF / Image / Doc / Other), owner filter.
- Body: `DataTable` columns Name, Type, Size, Owner, Modified. Row click → `DetailDrawer` (Preview / Metadata / Versions).
- Bulk select → toolbar in FilterBar.right (Download, Move, Delete).
- Empty: "No documents in this folder" + Upload CTA.

### `CalendarModule.tsx`
- Header: `PageHeaderV2` with month nav + "New event" quick action.
- Filter row: search, calendar-source chips, view toggle (Month / Week / Agenda).
- Body unchanged for Month/Week (existing calendar grid stays — too much to redo in one batch). Agenda view switches to `DataTable` (Date, Title, Location, Owner).
- Event click → `DetailDrawer` instead of the current dialog.
- Empty in Agenda: "Nothing scheduled" + Create CTA.

## Out of scope this turn

- Batches B2–B6 (Content, Comms, People, Analytics, Admin) — one batch per turn after this.
- Phase 3 audit and Phase 4 polish.
- Public web Marketplace/Pillars/Panorama fixes and Timeline DB work.
- Removing legacy `DashboardModule.tsx` / `CRMLayout.tsx` (deferred to Phase 4 after V2 is proven).

## Technical notes

- All `_kit/` files use named exports, TypeScript strict, no `any`.
- `DataTable` is generic; rows typed by caller. Sorting is controlled (parent owns sort state) — no internal sort to keep server-side queries authoritative.
- `DetailDrawer` uses shadcn `Sheet` with `side="right"`; width via Tailwind `sm:max-w-[520px]` etc.
- No new dependencies. `cmdk` already installed if QuickActions later needs a palette.
- No DB migrations.
- No translation key additions in this turn — kit primitives accept text via props; module migrations reuse existing `t()` keys.
- Files touched: 7 new in `_kit/`, 3 modules edited, 3 `.legacy.tsx` renames. ~10 files total.
