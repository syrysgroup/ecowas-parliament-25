

## Plan: Comprehensive ECOWAS Parliament Platform Upgrade

This is a large multi-phase implementation covering authentication/roles, domain/branding, i18n, and new features.

---

### Phase 1: Role System & Database Changes

**Current state:** The `app_role` enum only has `admin` and `moderator`. No `super_admin` role exists. The `has_role` function and all RLS policies use this enum.

**Changes needed:**

1. **Add `super_admin` role to `app_role` enum** via migration:
   ```sql
   ALTER TYPE public.app_role ADD VALUE 'super_admin';
   ```

2. **Assign super_admin to user `0b5747ee-cf4a-4c22-8592-a649fca67e45`** via insert tool:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('0b5747ee-cf4a-4c22-8592-a649fca67e45', 'super_admin')
   ON CONFLICT (user_id, role) DO NOTHING;
   ```

3. **Update `has_role` function** — no change needed, it already works generically.

4. **Update RLS policies** to grant `super_admin` full access everywhere (on `user_roles`, `applications`, `nominations`, `representatives`, `profiles`, `admin_activity_logs`). Each policy that checks `has_role(auth.uid(), 'admin')` will also check `has_role(auth.uid(), 'super_admin')`.

5. **Add RLS policy for super_admin to manage user_roles** (insert/update/delete) so they can create admins, moderators, etc.

---

### Phase 2: Invitation System (Edge Function)

Super admins need to invite users by email and pre-assign a role.

1. **Create `invitations` table** via migration:
   - `id`, `email`, `role` (app_role), `invited_by` (uuid), `accepted_at`, `created_at`, `token` (unique)
   - RLS: super_admin can insert/read, invited user can read their own

2. **Create `invite-user` edge function:**
   - Accepts `{ email, role }` from authenticated super_admin
   - Calls `supabase.auth.admin.inviteUserByEmail(email, { redirectTo })` using service role key
   - Inserts into `invitations` table with the assigned role
   - When the invited user accepts and signs up, a trigger assigns the role from the `invitations` table

3. **Create trigger `handle_invitation_role`** — on profile creation (or auth signup), check `invitations` table for matching email, and if found, insert the role into `user_roles` and mark invitation as accepted.

4. **Admin UI:** Add a "User Management" tab to `ProjectDashboard.tsx` or `AdminDashboard.tsx` with:
   - Invite form (email + role dropdown)
   - List of current users with roles
   - Ability to change roles (super_admin only)

---

### Phase 3: Update ProtectedRoute & Dashboard Access

1. **Update `ProtectedRoute.tsx`** to accept `super_admin` in `allowedRoles`.
2. **Update `AdminDashboard.tsx`** and **`ProjectDashboard.tsx`** to show role-specific UI:
   - Super admin: sees everything + user management + invitation
   - Admin: sees everything except user management
   - Moderator: sees review queues only
3. **Add `/admin/users` route** for user management (super_admin only).

---

### Phase 4: Branding & Content Updates

**All references across ~10 files:**

1. **Replace `ecowasparliament25.org`** with `ecowasparliamentinitiatives.org` in all email addresses and URLs.
2. **Replace `15 member states`** with `12 member states` everywhere (Footer, SponsorPortal, MediaKit, Timeline, ProjectDashboard, Culture page, etc.).
3. **Replace `15-country`** with `12-country`** in ProjectDashboard task data and chat messages.
4. **Ensure "ECOWAS Parliament" is used** (not just "ECOWAS") — audit all headings and copy.
5. **Update email addresses:**
   - `info@ecowasparliamentinitiatives.org`
   - `media@ecowasparliamentinitiatives.org`
   - `sponsors@ecowasparliamentinitiatives.org`

**Files to update:** Footer.tsx, Contact.tsx, MediaKit.tsx, SponsorPortal.tsx, ProjectDashboard.tsx, Timeline.tsx, Culture.tsx, CountriesSection.tsx

---

### Phase 5: French Language Support (i18n)

1. **Create `src/lib/i18n.ts`** — lightweight translation system using React Context with `en` and `fr` locale support.
2. **Create translation files** `src/locales/en.json` and `src/locales/fr.json` with all UI strings.
3. **Add language toggle** to Navbar (EN | FR button).
4. **Wrap Layout** with `I18nProvider`.
5. **Update all pages** to use `useTranslation()` hook for static text.

This is a significant effort — the initial implementation will cover the Navbar, Footer, Index page, and key programme pages. Remaining pages can be translated incrementally.

---

### Phase 6: Event Registration / RSVP

1. **Create `events` table** — `id`, `title`, `description`, `date`, `location`, `country`, `programme`, `capacity`, `created_at`.
2. **Create `event_registrations` table** — `id`, `event_id`, `user_id`, `name`, `email`, `country`, `status`, `created_at`.
3. **RLS:** Public can read events. Authenticated users can register. Admins can manage.
4. **Create `/events` page** listing upcoming events with RSVP buttons.
5. **Create RSVP modal/form** — collects name, email, country. Stores in `event_registrations`.

---

### Phase 7: Sponsor Dashboard Login

1. **Add `sponsor` to `app_role` enum**.
2. **Create `/sponsor-dashboard` route** behind `ProtectedRoute` with `allowedRoles={["sponsor", "admin", "super_admin"]}`.
3. **Sponsor dashboard page** shows: visibility metrics, logo placements, event schedule, impact reports — data from existing `sponsors` static data initially, later from database.
4. **Super admins can invite sponsors** via the invitation system with `sponsor` role.

---

### Phase 8: Domain Configuration

Domains are configured via Lovable's domain settings, not in code. I will:
1. Add the domain references in the codebase (meta tags, footer links).
2. Note that domain setup (ecowasparliamentinitiatives.org + redirects for initiativesparlementecedeao.org, parcedeao.org, ecoparl.org) must be configured in **Project Settings → Domains**.

---

### Implementation Order

Due to the size, implementation will be split across multiple steps:

1. Database migrations (role enum, invitations table, events tables, RLS)
2. Edge function for invitations
3. ProtectedRoute + Admin UI updates (user management, role-based views)
4. Branding/content find-and-replace (12 states, email domains, ECOWAS Parliament naming)
5. French language system
6. Event registration pages
7. Sponsor dashboard
8. Auth page improvements (redirect after login to appropriate dashboard based on role)

### Technical Details

- **New database tables:** `invitations`, `events`, `event_registrations`
- **Modified enum:** `app_role` adds `super_admin` and `sponsor`
- **New edge function:** `invite-user`
- **New pages:** `/admin/users`, `/events`, `/sponsor-dashboard`
- **Modified files:** ~15-20 existing files for branding, ~10 for i18n wrapper
- **New files:** ~8-10 new component/page files

