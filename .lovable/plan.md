

# Fix Build Errors + Vuexy-Inspired CRM Visual Upgrade

## Priority 1: Fix Current Errors

### Build Error — `PillarsGrid.tsx`
The `programme_pillars` table doesn't exist in the Supabase types. The query uses `as any` but TypeScript still can't infer the return type. Fix: cast `data` explicitly to `PillarRow[]` in the queryFn return.

### Runtime Error — `next-themes` useContext null
The `ThemeProvider` from `next-themes` is likely losing its React context due to a version mismatch or duplicate React instances. Fix: ensure `next-themes` is compatible and the provider wraps the entire tree correctly in `App.tsx`.

## Priority 2: Vuexy Design Adoption (Same Stack)

As explained in the previous plan (which was approved), your project runs on **React + Vite + Tailwind + shadcn/ui**. The Vuexy template uses **Next.js + MUI + Emotion** — a fundamentally different stack. Directly copying the files will not work. The approved approach is to **recreate the Vuexy visual design** using your existing technology.

### What will be built

**Phase 1 — CRM Dashboard Visual Overhaul**
- Install `apexcharts` and `react-apexcharts` for premium chart widgets
- Recreate all 10 Vuexy CRM dashboard widgets (revenue growth bar chart, radar sales chart, earning reports with tabs, activity timeline, active projects, project status, sales by countries, last transactions, distributed bar chart, line area yearly sales) using ApexCharts + shadcn Cards
- Match Vuexy's card styling: subtle shadows, rounded corners, header with icon + title + subtitle pattern
- Apply Vuexy's color palette to the Tailwind config (primary indigo-violet, success green, warning amber, info cyan)

**Phase 2 — Layout and Navigation Enhancement**
- Upgrade CRM sidebar to match Vuexy's vertical nav: collapsible sections, menu section headers, active state highlighting with left border accent
- Upgrade top bar: search input, notification dropdown, user avatar with role badge, language switcher
- Add a theme customizer drawer (accessible via floating button): primary color picker, sidebar style (light/dark), content width (full/boxed), dark/light mode toggle

**Phase 3 — Data Tables and Forms**
- Add `@tanstack/react-table` for advanced sortable/filterable/paginated tables
- Build a reusable `DataTable` component styled to match Vuexy's table design
- Create drawer-based add/edit forms using shadcn `Sheet` (matching Vuexy's `AddCustomerDrawer` pattern)

**Phase 4 — Assets**
- Extract avatar images and CRM-related assets from the ZIP into `public/images/`

### Technical approach
- **No MUI, no Emotion, no Next.js APIs** — everything stays in the current Vite + Tailwind + shadcn stack
- ApexCharts is the only significant new dependency
- All existing Supabase integrations and CRM modules remain untouched
- Chart widgets will use static demo data initially (like Vuexy does), with hooks ready to connect to Supabase queries

### Files to create/modify
- `src/components/crm/modules/DashboardModule.tsx` — complete redesign with Vuexy-style widget grid
- `src/components/crm/dashboard/` — new folder with 10 chart/widget components
- `src/components/crm/CRMLayout.tsx` — sidebar and topbar visual upgrade
- `src/components/crm/ThemeCustomizer.tsx` — new customizer drawer
- `tailwind.config.ts` — updated color palette
- `src/components/home/PillarsGrid.tsx` — fix TS error
- `src/App.tsx` — fix next-themes provider issue

