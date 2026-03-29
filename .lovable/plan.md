

## Plan: Content corrections, auth routing, sponsor visuals, and button fixes

### 1. Fix AWALCO description
Update all references from "Association of West African Living Councils" to **"Association of West African Legislative Correspondents"** in:
- `src/components/home/SponsorsSection.tsx`
- `src/components/home/PartnersStrip.tsx`

### 2. Structure initiatives hierarchy
Update the About page and PillarsGrid to clarify that the **25th Anniversary ECOWAS Parliament Programme** is the current initiative, and all 7 programme pillars fall under it. The implementing partners for this programme are **Duchess NL**, **Borderless Trade & Investment**, and **CMD Tourism & Trade Enterprises** (already in SponsorPortal — will add a brief mention on the About page and the homepage SponsorsSection).

### 3. Role-based auth redirect after sign-in
Update `src/pages/Auth.tsx` to redirect users to their role-specific dashboard after login instead of `navigate(-1)`:
- `super_admin` → `/admin`
- `admin` → `/admin`
- `moderator` → `/admin`
- `sponsor` → `/sponsor-dashboard`
- No role → `/` (homepage)

This requires querying `user_roles` after successful sign-in to determine the redirect target.

### 4. Super admin dashboard visibility
The super admin already has access to `/admin`, `/admin/project`, and `/admin/users`. Will ensure:
- The AdminDashboard (`/admin`) shows navigation links to Project Dashboard and User Management for super_admin/admin roles
- Add a quick-access sidebar or nav cards on the AdminDashboard linking to all admin sub-pages

### 5. Sponsor section visual upgrade
Replace the SVG-based `SponsorLogo` component with AI-generated placeholder logos for NASENI, SMEDAN, Providus Bank, and Alliance. Use the Nano banana image generation API to create branded placeholder logos, save them to `src/assets/`, and update `SponsorsSection.tsx` to use `<img>` tags instead of the SVG component. Add a gradient background, larger cards, and hover effects to make the section more visually impactful.

### 6. Fix transparent/invisible buttons
The screenshot shows hero buttons are nearly invisible. Fix across multiple files:
- **HeroSection.tsx**: The "Explore the Programme" button uses `bg-ecowas-yellow text-accent-foreground` — `accent-foreground` is very dark green on dark green background. Change to explicit white or ensure contrast. The "View Timeline" outline button is invisible. Add `bg-primary-foreground/10` as base background.
- **SponsorCTA.tsx**: Same outline button issue
- **SponsorPortal.tsx**: `bg-transparent` on the "Book a briefing call" button
- Global audit: ensure all `variant="outline"` buttons on dark backgrounds have explicit `text-primary-foreground` and visible border/background

### 7. List roles and dashboards clearly

| Role | Dashboard | Access |
|------|-----------|--------|
| `super_admin` | `/admin` + `/admin/project` + `/admin/users` | Everything: user management, invitations, all content |
| `admin` | `/admin` + `/admin/project` | Content management, applications, nominations, representatives |
| `moderator` | `/admin` | Review queues: applications, nominations, delegate publishing |
| `sponsor` | `/sponsor-dashboard` | Visibility metrics, logo placements, event schedule |

### Technical details

**Files to create:**
- Generated sponsor logo images (4 files in `src/assets/sponsors/`)

**Files to modify:**
- `src/pages/Auth.tsx` — role-based redirect after login
- `src/pages/admin/AdminDashboard.tsx` — add nav links to sub-pages for super_admin
- `src/components/home/SponsorsSection.tsx` — AWALCO fix, implementing partners, visual upgrade
- `src/components/home/PartnersStrip.tsx` — AWALCO description fix
- `src/components/home/LatestNews.tsx` — AWALCO description fix
- `src/components/home/HeroSection.tsx` — fix button visibility
- `src/components/home/SponsorCTA.tsx` — fix outline button visibility
- `src/pages/SponsorPortal.tsx` — fix transparent button
- `src/pages/About.tsx` — add initiative hierarchy context
- ~6 programme pages — audit outline buttons on hero sections

