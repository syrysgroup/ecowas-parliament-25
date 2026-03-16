

# Plan: Auth Email Templates, User Profile Page, and Parliament Interactive Features

## Current State

- **No email domain configured** — a domain must be set up before auth email templates can be scaffolded.
- **No auth pages exist** — no login, signup, or profile pages anywhere in the app.
- **Parliament page** is a static programme page using `ProgrammePageTemplate` — no hemicycle visualization, no tooltips, no "Apply as Youth Representative" button, and no auth flow.
- **Database** has `profiles`, `applications`, and `nominations` tables with RLS policies already configured, but no frontend code uses them.

---

## 1. Email Domain Setup (Prerequisite)

Before custom auth email templates can be created, an email domain must be configured. The first step is to set up the sender domain through the email setup dialog. Once the domain is configured, templates will be scaffolded and branded with the ECOWAS design system (green primary, gold accent, Source Sans 3 font).

**Action**: Present the email domain setup dialog. After domain configuration completes, scaffold templates and deploy the `auth-email-hook` edge function.

---

## 2. Authentication Pages

Create login and signup pages so users can authenticate and access their profile.

### Files to create:
- **`src/pages/Auth.tsx`** — Combined login/signup page with tabs
  - Email + password login and signup forms
  - Signup collects: full name, email, country, password (matching `profiles` table)
  - Uses `supabase.auth.signUp()` with `raw_user_meta_data` for full_name and country (the existing `handle_new_user` trigger auto-creates the profile row)
  - ECOWAS-branded styling with hero background

### Files to modify:
- **`src/App.tsx`** — Add routes for `/auth` and `/profile`
- **`src/components/layout/Navbar.tsx`** — Add login/profile button to nav bar, show user state via `onAuthStateChange`

---

## 3. User Profile Page

### File to create:
- **`src/pages/Profile.tsx`** — Authenticated user dashboard showing:
  - **Profile info** from `profiles` table (name, email, country, DOB)
  - **Applications list** from `applications` table with status badges (pending/approved/rejected)
  - **Nominations received** using the existing `get_nomination_count` RPC function
  - Edit profile form (name, country, DOB) using the existing UPDATE RLS policy
  - Logout button
  - Redirects to `/auth` if not authenticated

---

## 4. Parliament Page: Hemicycle & Application Flow

Enhance the Parliament programme page with interactive elements.

### Changes to `src/pages/programmes/Parliament.tsx`:
- **Hemicycle SVG visualization** — A semicircular arrangement of seats representing ECOWAS member states (15 countries). Each seat is a colored circle with a tooltip showing the country name on hover.
- **"Apply as Youth Representative" CTA button** — Prominent button in the page content (passed as `children` to `ProgrammePageTemplate`)
- **Application modal** — Dialog that opens on click:
  - If not authenticated: shows message with link to `/auth`
  - If authenticated: shows form with country selector and motivation textarea, submits to `applications` table via Supabase client
  - Success state shows confirmation message

### New component:
- **`src/components/parliament/HemicycleChart.tsx`** — SVG hemicycle with 15 country seats, hover tooltips using the existing Tooltip components, color-coded by sub-region

---

## 5. Files Summary

| Action | File |
|--------|------|
| Create | `src/pages/Auth.tsx` |
| Create | `src/pages/Profile.tsx` |
| Create | `src/components/parliament/HemicycleChart.tsx` |
| Modify | `src/pages/programmes/Parliament.tsx` — add hemicycle + apply button + modal |
| Modify | `src/App.tsx` — add `/auth` and `/profile` routes |
| Modify | `src/components/layout/Navbar.tsx` — add auth state button |

---

## 6. Auth Email Templates

Dependent on email domain setup. Once a domain is configured:
- Scaffold all 6 auth email templates
- Brand with ECOWAS colors: primary `hsl(152, 100%, 26%)`, accent `hsl(50, 87%, 45%)`, font Source Sans 3
- Email body background: white `#ffffff`
- Deploy `auth-email-hook` edge function

