

## Plan: CRM Redesign — Modern, Animated, ECOWAS-Branded

This is a comprehensive visual overhaul of the `/crm` interface covering the sidebar, layout, dashboard, color system, animations, and responsive behavior.

---

### 1. ECOWAS Color System Update

Update CSS variables in `src/index.css` to align with the ECOWAS Corporate Design Manual colors:

| Token | Current | New (from manual) |
|---|---|---|
| Primary Green | `152 100% 26%` | `145 63% 32%` (ECOWAS Green #1D6D37) |
| Accent Yellow | `50 87% 45%` | `46 100% 50%` (ECOWAS Yellow #FFC800) |
| Secondary Red | `340 66% 34%` | `0 72% 51%` (ECOWAS Red #D4252B) |

Update CRM-specific tokens (`--crm-bg`, `--crm-card`, etc.) to use warmer, richer tones derived from the ECOWAS green palette. Both light and dark modes updated.

### 2. Sidebar Redesign (`CRMSidebar.tsx`)

**Logo area:**
- Replace the "EP" square with the actual ECOWAS Parliament Initiatives logo image (`/images/logo/logo.png`)
- When collapsed, show just the badge/icon version
- Add a subtle glow/pulse animation on the logo

**Navigation improvements:**
- Reorder groups for workflow efficiency: WORKSPACE > COMMUNICATION > CONTENT > PEOPLE > ANALYTICS & FINANCE > MARKETING > ADMINISTRATION
- Add smooth expand/collapse animation (CSS transition on width + opacity on labels)
- Active item: ECOWAS green left border accent bar (3px) instead of full background highlight
- Hover: subtle slide-in background with 150ms ease transition
- Group headers: thin ECOWAS yellow accent line instead of plain text dividers
- Unread badge: use ECOWAS red instead of blue

**User section (bottom):**
- Avatar with online presence dot (green pulse animation)
- Role badge styled with ECOWAS colors

**Responsive:**
- Mobile: sidebar becomes a slide-out drawer (Sheet component) triggered by hamburger in top bar
- Tablet: auto-collapse to icon-only mode
- Desktop: full sidebar with collapse toggle

### 3. Top Bar / Header Redesign (`CRMLayout.tsx`)

- Clean header with frosted glass effect (`backdrop-blur-xl bg-crm-card/80`)
- Breadcrumb showing current module name with fade-in animation
- Search bar with expand animation on focus
- Notification bell with bounce animation on new items
- Theme toggle with smooth rotation animation
- Profile dropdown with scale-in animation

### 4. Dashboard Module Redesign (`DashboardModule.tsx`)

**Stat cards:**
- Glassmorphism cards with subtle border glow
- Counter animation (count-up effect) on numbers
- Hover: lift + shadow expansion animation
- Icons use ECOWAS color palette (green, yellow, red accents)

**Charts section:**
- Staggered fade-in animation as cards enter viewport
- Cards have subtle hover scale (1.02) effect

**Welcome banner (new):**
- Greeting with user's name and time-of-day context
- ECOWAS-branded gradient background (green to dark green)
- Today's date and quick action buttons

### 5. Animation System

Add to `tailwind.config.ts` and `index.css`:
- `animate-slide-in-left`: sidebar items stagger in on load
- `animate-count-up`: number counters
- `animate-glow-pulse`: subtle glow on active elements
- `animate-bounce-in`: notification badge
- CSS transitions on all interactive elements (150-200ms)

### 6. Responsive Breakpoints

- **Mobile (<768px):** Sidebar hidden, hamburger menu, single-column dashboard, stacked cards
- **Tablet (768-1024px):** Collapsed icon sidebar, 2-column dashboard grid
- **Desktop (>1024px):** Full sidebar, 4-column stat cards, multi-column chart layout

### 7. Content Group Reorder (`crmModules.ts`)

Reorder `MODULE_GROUPS` for better workflow:
```
WORKSPACE → COMMUNICATION → CONTENT → PEOPLE → ANALYTICS & FINANCE → MARKETING → ADMINISTRATION
```
Move "PEOPLE" after "CONTENT" since content management is used more frequently than people management.

---

### Files Changed

| File | Change |
|---|---|
| `src/index.css` | Update ECOWAS color tokens, add new animations |
| `tailwind.config.ts` | Add new animation keyframes |
| `src/components/crm/CRMSidebar.tsx` | Full redesign — logo, animations, responsive drawer, active indicators |
| `src/components/crm/CRMLayout.tsx` | Glassmorphism header, animated breadcrumbs, responsive hamburger |
| `src/components/crm/modules/DashboardModule.tsx` | Welcome banner, animated stat cards, staggered chart entry |
| `src/components/crm/crmModules.ts` | Reorder MODULE_GROUPS |

