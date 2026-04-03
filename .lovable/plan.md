

## Plan: Multiple Updates — Captcha, Login Page, Scroll Behavior, Footer Address, and Sponsors Redesign

---

### 1. Integrate Cloudflare Turnstile CAPTCHA on Login Page

**What**: Add Cloudflare Turnstile widget to the auth page so captcha tokens are sent with all auth requests.

- Install `@marsidev/react-turnstile` package
- Add invisible/managed Turnstile widget (site key: `0x4AAAAAAAczus4H6t9WSW6Oy`) to the Auth page
- Pass `captchaToken` option to `signInWithPassword()`, `signUp()`, and `resetPasswordForEmail()` calls
- Store token in state, refresh on each submission

### 2. Login Page — White Logo Background + Updated Text

**What**: Change the rectangle behind the ECOWAS logo to white, and update the branding text.

- Change `bg-primary-foreground/10` on the logo container (line 207) to `bg-white`
- Change the title from "ECOWAS Parliament" to "ECOWAS PARLIAMENT Initiative"
- Change subtitle from "25th Anniversary Celebration Platform" to "ECOWAS of the Peoples: Peace and Prosperity for All"

### 3. Scroll to Top on Reload and Home Navigation

**What**: Ensure page scrolls to top on reload and when "Home" is clicked.

- The existing `ScrollToTop` component in `App.tsx` already handles route changes — verify it covers all cases
- Add `window.scrollTo(0, 0)` on initial page load via a `useEffect` in the `ScrollToTop` component (handles browser reload)
- This ensures both reload and Home link clicks scroll to top

### 4. Update Footer Address

**What**: Add the official address to the footer.

- Add address line in the footer's contact info section: "Herbert Macaulay Way, Garki, Abuja 900103, Federal Capital Territory"
- Use a 📍 icon prefix consistent with the existing email format

### 5. Complete Redesign of "Our Partner Ecosystem" (SponsorsSection)

**What**: Replace the current tab-based overview with a creative, programme-focused sponsor showcase — no "Overview" tab.

**Design approach**:
- Remove the "Overview" tab entirely; only show programme-specific tabs (Youth Innovation, Trade & SME, Women's Forum, Civic Education, Culture, Awards, Youth Parliament)
- Each programme tab shows a rich card layout with:
  - Programme description and key project information
  - SVG-generated illustration/icon unique to each programme (geometric patterns with ECOWAS colors)
  - Sponsor cards organized by tier with animated entry (staggered fade-in + slide-up)
  - Each sponsor card includes: name, tier badge, role description, and a generated abstract logo (SVG initials pattern, reusing existing `SponsorLogo` component style)
  - Project highlights section showing what the sponsors are funding
- Add CSS keyframe animations for tab transitions (fade + scale)
- Sponsor tier visual hierarchy: Presenting sponsors get large hero-style cards, Gold gets medium cards with accent borders, Silver/Bronze get compact cards
- Each programme includes a brief "About this programme" blurb and "Key Projects" list
- CTA at the bottom for programmes seeking sponsors
- Responsive: 1-column on mobile, 2-3 columns on desktop

**Data structure changes**:
- Add `description` and `projects` fields to each programme
- Add `role` field to each sponsor (what they fund/support)
- Remove `id: "all"` programme entirely

### Files Changed

| File | Change |
|------|--------|
| `package.json` | Add `@marsidev/react-turnstile` |
| `src/pages/Auth.tsx` | Integrate Turnstile widget, pass captchaToken to auth calls, white logo bg, updated text |
| `src/App.tsx` | Enhance ScrollToTop to handle page reload |
| `src/components/layout/Footer.tsx` | Add official address |
| `src/components/home/SponsorsSection.tsx` | Complete redesign with programme-focused cards, animations, generated illustrations, project info |

