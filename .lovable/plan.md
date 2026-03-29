

# Index Page Redesign + Auth System + Sponsor Visibility Overhaul

## Summary

A comprehensive redesign of the Index page with programme-scoped sponsor visibility, integration of the uploaded AuthContext/SuperAdminDashboard/ProtectedRoute/Auth files, and modern interactive design with generated images and animations.

---

## Part 1: Integrate Uploaded Auth System Files

The user uploaded 6 files that constitute a proper role-based auth system. These need to be added/replaced in the project:

1. **Create `src/contexts/AuthContext.tsx`** — from uploaded file. Provides `AuthProvider` with role fetching, `useAuthContext` hook, convenience booleans (`isSuperAdmin`, `isAdmin`, etc.)

2. **Replace `src/hooks/useAuth.ts`** — with uploaded version that re-exports from AuthContext for backwards compatibility

3. **Replace `src/components/admin/ProtectedRoute.tsx`** — with uploaded version that uses `useAuthContext` and supports `bare` prop

4. **Replace `src/pages/Auth.tsx`** — with uploaded version that has role-based redirects, forgot password, improved UI

5. **Create `src/pages/admin/SuperAdminDashboard.tsx`** — from uploaded file (822 lines). Full super admin hub with user management, invitations, activity logs, route map

6. **Update `src/App.tsx`** — from uploaded version: wrap with `AuthProvider`, add `/admin/super` route for SuperAdminDashboard, update ProtectedRoute `allowedRoles`

---

## Part 2: Programme-Scoped Sponsor System

**Key concept:** Sponsors are tied to specific programmes, not displayed globally. The Index page shows sponsors organized by programme so each sponsor gets visibility only for what they support.

### New `SponsorsSection.tsx` — Complete Rewrite

Data structure:
```typescript
interface Sponsor {
  name: string;
  color: string;
  tier: "platinum" | "gold" | "silver" | "supporter";
}

interface ProgrammeSponsorGroup {
  programme: string;
  programmePath: string;
  sponsors: Sponsor[];
}
```

- **Tier-based logo sizing:** Platinum = 96px, Gold = 80px, Silver = 64px, Supporter = 48px
- Each programme shows its own sponsors in a labelled section
- Currently only "@25 Anniversary" programme has sponsors (NASENI, SMEDAN, Providus Bank, Alliance)
- Partners section: AWALCO shown as "Partner" (not implementing partner)
- Clear visual separation between partners and programme sponsors

### Partners vs Sponsors clarity:
- **Partners** = AWALCO (strategic partnership, shown prominently)
- **Sponsors** = NASENI, SMEDAN, Providus Bank, Alliance (shown under their programme with tier-based sizing)

---

## Part 3: Index Page Full Redesign

### New Section Order:
1. **HeroSection** — cinematic, full-viewport, particle-like floating dots, staggered text animation, count-up stats, social media
2. **CountdownTimer** — glassmorphic cards (keep existing)
3. **Programme Showcase** — redesigned PillarsGrid as a horizontal scrolling carousel on mobile, grid on desktop, with animated gradient borders
4. **Countries Section** — flags in a marquee/ticker strip (auto-scrolling), clean and minimal
5. **Did You Know** — keep existing carousel with progress bar
6. **Partners & Sponsors** — redesigned with programme-scoped sponsors, tier-based logo sizes, partner distinction
7. **Quote Strip** — keep existing
8. **Latest News** — keep existing with gradient cards
9. **Sponsor CTA** — keep existing

### HeroSection Redesign:
- Animated gradient background with CSS `@keyframes gradient-shift`
- Particle dots (small colored circles) floating with staggered delays
- "ECOWAS Parliament Initiatives" as primary branding
- "@25" positioned as the current flagship initiative subtitle
- Stats bar with count-up animation (12 States, 7 Programmes, 115 Seats, 25 Years)
- Social media icons with glassmorphism

### Countries Section Redesign:
- Auto-scrolling marquee of flags (CSS animation, infinite loop)
- Duplicated flag row for seamless scroll
- On hover: pause animation, flag scales up
- Title: "Across 12 Member States"

### New Animations in `index.css`:
```css
@keyframes gradient-shift { ... }   /* hero background */
@keyframes marquee { ... }          /* flag ticker */
@keyframes shimmer { ... }          /* sponsor card hover */
@keyframes particle { ... }         /* floating particles */
```

---

## Part 4: Navbar Menu Restructuring

Group menus to accommodate multiple projects/initiatives:

```
Home | About | Initiatives ▼ | Resources ▼ | Get Involved ▼
```

- **Initiatives** dropdown: groups all 7 programme pillars + link to "All Programmes"
- **Resources** dropdown: Timeline, News, Documents, Events, Media Kit
- **Get Involved** dropdown: Sponsor Portal, Contact, Stakeholders, Team

This reduces navbar clutter and scales for future projects.

---

## Part 5: SQL Bootstrap

The uploaded `superadmin_bootstrap.sql` needs to be run in Supabase SQL Editor (not as a migration). Will note this to the user. The UID `0b5747ee-cf4a-4c22-8592-a649fca67e45` for `emmatemile@gmail.com` will be set as super_admin.

---

## Files Created/Modified

**Created (3):**
- `src/contexts/AuthContext.tsx`
- `src/pages/admin/SuperAdminDashboard.tsx`
- (SQL bootstrap — user runs manually)

**Modified (~10):**
- `src/App.tsx` — AuthProvider wrap, new routes
- `src/hooks/useAuth.ts` — re-export from AuthContext
- `src/components/admin/ProtectedRoute.tsx` — use AuthContext
- `src/pages/Auth.tsx` — role-based redirects
- `src/pages/Index.tsx` — new section order
- `src/components/home/HeroSection.tsx` — full redesign with particles
- `src/components/home/CountriesSection.tsx` — marquee ticker
- `src/components/home/SponsorsSection.tsx` — programme-scoped, tier-based
- `src/components/layout/Navbar.tsx` — grouped menus
- `src/index.css` — new keyframe animations

