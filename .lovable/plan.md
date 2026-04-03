

## Plan: Hero Logo Enhancement + CRM Theme Redesign

### Part 1 — Make Parliament 25 Logo the Hero Focal Point

The `parliament-25-logo.png` asset exists but isn't used on the homepage. We'll add it prominently below the ECOWAS flag in the hero section.

**File: `src/components/home/HeroSection.tsx`**
- Import `parliament-25-logo.png` from assets
- After the ECOWAS logo/flag block, add a large Parliament 25 logo (roughly 200-280px on desktop, 140px on mobile) with a subtle glow/shadow effect
- Give it a fade-in animation consistent with the existing staggered delays

### Part 2 — CRM Dark/Light Theme Support

The entire CRM (layout, sidebar, dashboard module, and all other modules) uses hardcoded hex colors like `bg-[#0a0f0d]`, `text-[#c8e0cc]`, `border-[#1e2d22]` — these ignore the theme completely. The `CRMThemeToggle` component exists but toggling it does nothing visible.

**Strategy:** Replace all hardcoded CRM colors with Tailwind CSS variables (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, etc.) that respond to the `.dark` class. Add CRM-specific CSS variables for the green-tinted accent palette.

**Files to update:**

1. **`src/index.css`** — Add CRM-specific CSS variables for both light and dark themes (e.g., `--crm-surface`, `--crm-sidebar`, `--crm-accent`) to preserve the distinctive green-tinted aesthetic while supporting both modes

2. **`src/components/crm/CRMLayout.tsx`** — Replace all hardcoded colors:
   - `bg-[#0a0f0d]` → `bg-background`
   - `text-[#e8f5e9]` → `text-foreground`
   - `border-[#1e2d22]` → `border-border`
   - `bg-[#080d0a]` → `bg-card`
   - Notification dropdown: swap hardcoded dark hex to theme-aware classes
   - `CRMThemeToggle`: use theme-aware styling instead of hardcoded green hex

3. **`src/components/crm/CRMSidebar.tsx`** — Same treatment:
   - `bg-[#080d0a]` → `bg-card`
   - Active states, hover states, text colors all converted to semantic Tailwind tokens
   - Badge colors remain fixed (red/blue indicators) but backgrounds adapt

4. **`src/components/crm/modules/DashboardModule.tsx`** — Convert `StatCard` and all hardcoded module colors to theme tokens. Status/priority badge colors stay vibrant but container backgrounds adapt.

5. **All other CRM modules** (`TaskBoardModule`, `InboxModule`, `CalendarModule`, etc.) — Audit and replace hardcoded dark hex values with theme-aware equivalents. Most follow the same pattern as the dashboard.

### Technical Details

- The project uses `next-themes` with `darkMode: ["class"]` in Tailwind — the `.dark` class on `<html>` drives everything
- Light mode CRM will use warm neutral greens (e.g., `--crm-surface: 150 20% 97%`) while dark mode keeps the current deep green tones
- The `ThemeToggle` component already works correctly; only the CRM's hardcoded colors prevent it from having any visual effect
- Status/priority accent colors (red, amber, blue, emerald badges) will remain consistent across themes for quick visual scanning

