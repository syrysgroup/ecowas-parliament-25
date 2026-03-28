

## Plan: Integrate uploaded components into the project

The user has provided 6 ready-to-use React component files and needs them wired into the existing project. All assets (logos) already exist in `src/assets/`. The components use existing UI primitives (`Card`, `Badge`, `Button`, etc.) that are already in the project.

### What will be created/changed

**New page files (3):**
1. `src/pages/Contact.tsx` — copy from uploaded Contact.tsx (335 lines, contact form with enquiry types, office cards, social links)
2. `src/pages/MediaKit.tsx` — copy from uploaded MediaKit.tsx (330 lines, press releases, spokespeople, downloadable assets, event calendar)
3. `src/pages/SponsorPortal.tsx` — copy from uploaded SponsorPortal.tsx (414 lines, sponsorship tiers, current sponsors, implementing partners, impact metrics)

**New admin page (1):**
4. `src/pages/admin/ProjectDashboard.tsx` — copy from uploaded ProjectDashboard.tsx (826 lines, tabbed dashboard with Overview, Task Board, Calendar, Communications, Sponsors, Documents tabs — all with hardcoded static data)

**Updated files (3):**
5. `src/components/layout/Navbar.tsx` — replace with uploaded Navbar.tsx (188 lines). Adds "Get involved" dropdown (Sponsors, Media Kit, Contact), "Partner with us" and "Contact" CTA buttons, and a second dropdown state for the new menu group. Breakpoint changes from `lg` to `xl`.
6. `src/components/layout/Footer.tsx` — replace with uploaded Footer.tsx (122 lines). New 4-column layout with programme links, organisation links, "Get involved" links, newsletter subscription strip, and bottom bar with external ECOWAS link.
7. `src/App.tsx` — replace with uploaded App.tsx (88 lines). Adds routes: `/contact`, `/media-kit`, `/sponsors`, `/admin/project`. Imports the 4 new page components.

### Technical notes
- No database changes needed — all new pages use hardcoded/static data
- No new npm dependencies required — all components use existing UI primitives
- All referenced assets (`duchess-logo.png`, `cmd-logo.png`, `borderless-trade-logo.png`, `ecowas-parliament-logo.png`, `parliament-25-logo.png`) already exist in `src/assets/`
- The `ProjectDashboard` is protected behind `ProtectedRoute` at `/admin/project`
- The uploaded Navbar uses `ChevronDown` from lucide-react (already installed) and `useLocation` from react-router-dom

