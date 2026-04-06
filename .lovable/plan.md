

# Revised Plan: Parliament Tab Redesign + CRM Verification

After inspecting the codebase, most items from the previous plan are already implemented:
- All image containers (News, Events, Parliament, LatestNews) already use `aspect-[4/5]`
- Speaker is already elevated above deputy speakers
- DocumentsModule already supports file upload to `documents` bucket with language selector (EN/FR/PT)
- SuperAdminModule already has CSV export, activity logging for role changes, and invitation management
- All database tables (`documents`, `budget_items`, `invoices`, `invoice_items`) already exist with proper columns

The remaining work is the **Parliament page tab redesign**.

---

## Parliament Page Tab Restructure

**Current state**: The page has a linear layout with separate sections for Principal Officers, a 2-tab area (Country Delegations / Delegates), Hemicycle chart, Selection Process, and Objectives -- all stacked vertically making the page very long.

**New tab layout** (after the hero section and emulation notice):

```text
[ Overview ] [ Delegates ] [ Nominations & Voting ] [ Agenda & Theme ]
```

### Tab 1: Overview (default)
- Interactive hemicycle seating chart (moved from bottom)
- Principal Officers cards (Speaker elevated, 4 deputies below)
- Objectives grid (moved from bottom)

### Tab 2: Delegates
- Principal Officers at top (Speaker elevated + 4 deputies) -- same as current "Delegates" tab content
- All country delegate slots grouped by country (existing code)

### Tab 3: Nominations & Voting
- Country Delegations grid (existing "Country Delegations" tab -- click to view nominations/voting per country)
- Selection process timeline (NominationTimeline component, moved from bottom)
- "Apply, nominate, or vote" CTA button

### Tab 4: Agenda & Theme
- Placeholder section for parliament theme/agenda content
- Will query `site_content` table for a `parliament_agenda` section key
- Display theme description, agenda items, and any related documents

**File to modify**: `src/pages/programmes/Parliament.tsx`

---

## Technical Details

- Restructure the JSX in Parliament.tsx to wrap all content below the hero in a single `<Tabs>` component with 4 tab triggers
- Move the hemicycle section into the Overview tab
- Move NominationTimeline + objectives into the Nominations & Voting tab
- Create a new Agenda & Theme tab with placeholder content that reads from `site_content` where `section_key = 'parliament_agenda'`
- No database migrations needed
- No new dependencies

**Estimated scope**: 1 file change (~150 lines restructured), no migrations.

