# Plan: Hemicycle Tooltips, Seat Data Fix, and Youth Representative Registration System

## Data Clarification

The user provided seat allocations for **11 countries** (not 15). The current code includes Guinea-Bissau, Burkina Faso, Mali, and Niger which are NOT in the user's list. The correct data sums to **92 seats** across 11 Member States:


| Country           | Seats  |
| ----------------- | ------ |
| Nigeria           | 35     |
| Ghana             | 7      |
| Ivory Coast       | 7      |
| Guinea            | 6      |
| Senegal           | 5      |
| Benin             | 5      |
| Cape Verde        | 5      |
| Gambia            | 5      |
| Liberia           | 5      |
| Sierra Leone      | 5      |
| Togo              | 5      |
| **Guinea-bissau** | **6**  |
| **Total**         | 96     |
| &nbsp;            | &nbsp; |


The hero stats currently say "115 seats / 15 countries" -- these will be corrected to "96 seats / 12 countries".

---

## Part 1: Fix Seat Data

**Files:** `HemicycleChart.tsx`, `Parliament.tsx`

- Remove Guinea-Bissau, Burkina Faso, Mali, Niger from the `countries` array in `HemicycleChart.tsx`
- Remove same 4 from the `delegations` array in `Parliament.tsx`
- Update hero stats from "115 / 15" to "96 / 12"
- The `totalSeats` is computed dynamically so it will auto-correct
- Update subtitle text ("12 Member States")

## Part 2: Hover Tooltips on Hemicycle Seats

**File:** `HemicycleChart.tsx`

Currently seats have a native `<title>` element (browser tooltip). Replace with Radix UI Tooltip (already available via `@/components/ui/tooltip`) for a polished, styled tooltip showing country flag, name, and seat count. This requires wrapping each `<circle>` in a Tooltip using `foreignObject` or a positioned HTML overlay approach. Since SVG + Radix tooltips are tricky, the cleanest approach is:

- Use a **floating tooltip div** positioned absolutely based on mouse coordinates, triggered by the existing `onMouseEnter`/`onMouseLeave` handlers
- Track mouse position via `onMouseMove` on the SVG container
- Render a styled tooltip div (matching the site's design tokens) outside the SVG, positioned with CSS `transform`
- This avoids Radix/SVG integration issues and gives full styling control

## Part 3: Authentication System

**Database migrations (Supabase):**

1. Create `profiles` table:
  - `id` (uuid, PK, FK to `auth.users(id)` ON DELETE CASCADE)
  - `full_name` (text, not null)
  - `email` (text, not null)
  - `country` (text, not null) -- one of the 11 member states
  - `date_of_birth` (date)
  - `created_at` (timestamptz, default now())
2. Create trigger to auto-create profile on signup
3. RLS: users can read/update their own profile

**New files:**

- `src/pages/Auth.tsx` -- login/signup page with email + password, email verification required
- `src/hooks/useAuth.ts` -- auth state hook using `onAuthStateChange`
- `src/components/auth/AuthGuard.tsx` -- wrapper that redirects to `/auth` if not logged in

**Route:** Add `/auth` route in `App.tsx`

## Part 4: Youth Representative Registration (Apply / Nominate)

**Database migrations:**

1. Create `applications` table:
  - `id` (uuid, PK, default gen_random_uuid())
  - `user_id` (uuid, FK to profiles.id, not null)
  - `country` (text, not null)
  - `motivation` (text, not null)
  - `status` (text, default 'pending') -- pending/approved/rejected
  - `created_at` (timestamptz, default now())
  - RLS: users can insert their own, read their own
2. Create `nominations` table:
  - `id` (uuid, PK, default gen_random_uuid())
  - `nominee_user_id` (uuid, FK to profiles.id, not null) -- who is being nominated
  - `nominator_user_id` (uuid, FK to profiles.id, not null) -- who is nominating
  - `country` (text, not null)
  - `created_at` (timestamptz, default now())
  - Unique constraint on `(nominee_user_id, nominator_user_id)` -- one nomination per person
  - RLS: authenticated users can insert (nominate), read nomination counts
3. Create a DB function `get_nomination_count(nominee_id uuid)` returning the count of nominations for a user

**New files:**

- `src/components/parliament/ApplicationModal.tsx` -- Dialog modal with two tabs:
  - **Apply** tab: form with motivation text, country selector. Requires authenticated user. Inserts into `applications`.
  - **Nominate** tab: search for a registered user by name/email, submit nomination. Shows current nomination count for the nominee. Displays "200 nominations required" threshold. Inserts into `nominations`.

**Modified files:**

- `Parliament.tsx`: "Apply as Youth Representative" button opens the `ApplicationModal`. If user not authenticated, redirect to `/auth` first.
- `NominationTimeline.tsx`: Update step 2 description to mention the 200-nomination threshold for the nomination path.
- `App.tsx`: Add `/auth` route.

## Implementation Order

1. Database migrations (profiles, applications, nominations tables + RLS + trigger)
2. Fix seat data in HemicycleChart and Parliament page
3. Add floating tooltip to HemicycleChart
4. Build Auth page + useAuth hook + AuthGuard
5. Build ApplicationModal with Apply/Nominate tabs
6. Wire everything together in Parliament.tsx and App.tsx