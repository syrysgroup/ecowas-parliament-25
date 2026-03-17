
## Implementation plan

### What I found
- The current project is only partially built for this scope:
  - `/programmes/parliament` exists, but it still uses demo-only delegation data, wrong totals in places, no public representatives list, no voting leaderboard, and no admin backend.
  - The current seat chart shows **96 seats / 12 states**, but your required ECOWAS allocation is **104 seats / 12 states** based on the list you gave:
    - Benin 5, Cape Verde 5, Gambia 5, Ghana 8, Guinea 6, Guinea-Bissau 5, Ivory Coast 7, Liberia 5, Nigeria 35, Senegal 6, Sierra Leone 5, Togo 5.
  - Stakeholders and Team still mostly use placeholder icons instead of real/generated portraits.
  - Database currently has only `profiles`, `applications`, and `nominations`. No roles table, no admin workflows, no voting table, no representative records, no moderation queue.
- Testing result:
  - Hemicycle tooltip behavior works.
  - “Apply as Youth Representative” opens the auth-gated modal correctly.
  - End-to-end submission could not be completed because the preview session is not logged in.

### Agreed product direction
Based on your choices, I will design for:
- **Admins + moderators**
- **Apply + nominate + vote**
- **Mixed imagery**: use uploaded/real images where available, and generated portraits/event visuals where missing

---

## Build plan

### 1. Upgrade media, headers, and people imagery across the site
- Add stronger visual storytelling with:
  - header/hero images for key pages
  - generated supporting visuals where uploaded images are missing
  - stakeholder portraits for ECOWAS leadership and implementing partners
  - a much larger team directory with photos and role clusters
- Expand:
  - `Team` page into a real organisation-style directory
  - `Stakeholders` page into leadership, ECOWAS officials, implementing partners, sponsors, and advisory/support groups
- For parliament:
  - add nominee cards
  - add accepted/verified representative cards
  - include headshots, country, status, vote totals, and short bio

### 2. Rebuild the Parliament page as a live public platform
Enhance `/programmes/parliament` into a public-facing representative platform with:
- corrected ECOWAS seat allocations and totals
- public representative directory by country
- nominee spotlight section
- accepted/verified delegates section
- public vote leaderboard by country
- clearer application / nomination / voting CTAs
- stronger chamber-style editorial design with photography and country identity

### 3. Add secure backend structure for nominations, voting, approvals, and representatives
Create a proper data model for:
- user roles
- admin moderation
- self-applications
- peer nominations
- votes
- approved representatives
- country-level management
- audit/status history where needed

### 4. Add a role-based admin dashboard
Create protected admin routes/pages for:
- overview metrics
- review queues
- application approvals
- nomination approvals
- vote monitoring
- representative verification/publishing
- country-level delegation management
- admin/moderator separation of permissions

### 5. Complete testing path
After implementation:
- re-test hemicycle interactions
- test auth-gated application flow
- test nomination creation as authenticated user
- test duplicate nomination prevention
- test live leaderboard updates
- test admin review actions
- test moderator-scoped access
- test responsive behavior on parliament and dashboard pages

---

## Database / backend design

### New secure role model
Use a separate roles table, not profiles:
- `app_role` enum: `admin`, `moderator`
- `user_roles`
- `has_role(user_id, role)` security definer function

### Recommended new tables
I would add these tables:

- `countries`
  - canonical country records and seat allocations
- `applications`
  - likely extend existing table instead of replacing
  - add richer fields/status/review metadata
- `nominations`
  - likely extend existing table with moderation status
- `nomination_votes`
  - one row per voter per nominee
  - unique constraint to prevent duplicate votes
- `representatives`
  - accepted/verified delegates shown publicly
- `representative_profiles_public` view or equivalent safe public query shape
- `admin_activity_logs` or review notes table
  - moderation decisions and audit trail
- optional: `media_people` / `gallery_items`
  - if you want admin-managed portraits and headers later

### Key security decisions
- Keep private profile data protected.
- Do **not** keep public leaderboard or representative listing tied to raw unrestricted `profiles` access.
- Current `profiles` SELECT policy is too broad for a mature platform because authenticated users can read all profiles including email.
- I would tighten privacy by:
  - restricting direct profile access
  - using safe public-facing views/queries for nominee and representative cards
  - exposing only needed fields like name, country, bio, portrait, public status, vote count

### RLS approach
- Public:
  - read approved representatives
  - read public leaderboard
  - read published nominee summaries only if intended
- Authenticated users:
  - submit own application
  - create nominations
  - cast vote once per nominee/country rules
  - read their own records
- Moderators:
  - review queues, update moderation statuses
- Admins:
  - full management across all delegations
- Country moderators:
  - not in this phase, since you chose admins + moderators only

---

## Frontend implementation plan

### Public pages
- `Stakeholders.tsx`
  - replace icon placeholders with portrait cards
  - split ECOWAS leadership, implementing partners, sponsors cleanly
- `Team.tsx`
  - expand into departments and larger member grid with portraits
- `Parliament.tsx`
  - redesign into sections:
    - hero
    - chamber overview
    - corrected hemicycle
    - country delegation map/grid
    - nominees
    - verified representatives
    - leaderboard
    - application / nomination / vote explainer
    - CTA block
- `HemicycleChart.tsx`
  - update to 104 seats / 12 states
  - sync country names/counts with backend source of truth
- `CountryDelegationCard.tsx`
  - show live counts: applications, nominations, verified reps, seats filled
- `ApplicationModal.tsx`
  - extend from apply/nominate only to apply/nominate/vote-aware flow
  - better empty, auth, success, and duplicate states

### Admin pages/components
New protected admin area such as:
- `/admin`
- `/admin/applications`
- `/admin/nominations`
- `/admin/representatives`
- `/admin/countries`
- `/admin/users` or `/admin/roles`

Main features:
- dashboard stats cards
- searchable review queue tables
- approve/reject actions
- assign moderators
- verify representative profiles
- publish accepted delegates to the public page
- moderation notes and history

---

## Media/content plan
- Use uploaded project/event photos for:
  - headers
  - stakeholder/leadership imagery where available
  - parliament storytelling sections
- Generate missing items for:
  - team portraits
  - stakeholder portraits without assets
  - representative placeholders
  - regionally appropriate editorial visuals
- Keep visual language West Africa-specific:
  - regional flags/country identity
  - ECOWAS colors and civic styling
  - formal parliamentary tone, but modern youth-forward layout

---

## Technical issues to fix while implementing
- Correct mismatched parliament totals and seat counts in page copy/components.
- Replace current demo-only hardcoded data with DB-backed data source.
- Resolve privacy issue around broad profile search/read access.
- Ensure nomination duplicate prevention is enforced both:
  - in database uniqueness
  - in UI feedback
- Add live vote counts with efficient queries/views/RPC as needed.
- Add true protected admin routing and role checks.
- Keep representative/public data separate from sensitive private profile data.

---

## Files likely to change

### Existing files
- `src/pages/programmes/Parliament.tsx`
- `src/components/parliament/HemicycleChart.tsx`
- `src/components/parliament/CountryDelegationCard.tsx`
- `src/components/parliament/NominationTimeline.tsx`
- `src/components/parliament/ApplicationModal.tsx`
- `src/pages/Stakeholders.tsx`
- `src/pages/Team.tsx`
- `src/hooks/useAuth.ts`
- `src/App.tsx`
- `src/integrations/supabase/*` indirectly through regenerated types after schema changes

### New frontend files
- admin layout/components/pages
- public parliament cards for nominees/representatives/leaderboard
- route guards / role guards
- shared data hooks for parliament/admin queries

### New Supabase work
- migrations for roles, votes, representatives, moderation fields, safe views/functions, and updated RLS

---

## Test plan
I already confirmed:
- hemicycle tooltip works
- apply CTA opens auth-required modal

After implementation I will test:
1. anonymous user sees auth gate
2. signed-in user can apply
3. signed-in user can nominate another registered user
4. duplicate nomination is blocked
5. signed-in user can vote once according to rules
6. leaderboard updates correctly
7. moderator can review queues
8. admin can approve and publish representatives
9. public parliament page shows accepted/verified reps with bio and image
10. mobile/tablet layouts for parliament, team, stakeholders, and admin dashboard

## Recommended implementation order
1. Fix schema and RLS foundation
2. Add roles + admin access model
3. Add votes + representative publishing model
4. Rebuild parliament page on live data
5. Expand stakeholders/team with portraits and richer content
6. Build admin dashboard
7. Populate demo/public data presentation and test end-to-end
