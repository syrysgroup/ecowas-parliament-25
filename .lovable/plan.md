

## Plan: Logo Treatment, Tour Help Button, Super Admin Cleanup, Permissions Overhaul, and Profile Name Sync

This addresses six related requests in one pass.

---

### 1. Pure-logo treatment for ImplementingPartnersSection and InstitutionalPartnersSection

**Files:** `src/components/home/ImplementingPartnersSection.tsx`, `src/components/home/InstitutionalPartnersSection.tsx`

Both sections currently wrap logos in card containers with borders, padding, and hover effects. The SponsorsSection already uses a "pure logo" style (no card, logo floats at natural size with hover scale).

**Changes:**
- Remove the card wrapper (`bg-card border rounded-2xl p-6`) from each partner item
- Replace with a simple flex-col centered layout matching SponsorsSection: logo at natural size with `group-hover:scale-110 group-hover:drop-shadow-xl`, partner name below in small muted text
- Remove the `bg-muted/40 rounded-xl` logo container — let the logo float directly
- Keep the Link wrapper and "Learn more" hover text
- Adjust grid to use `items-center justify-items-center` for clean alignment

### 2. Help button in CRM topbar to trigger tour

**File:** `src/components/crm/CRMLayout.tsx`

- Import `useCRMTour` from `./CRMTour`
- Import `HelpCircle` from lucide-react
- Call `const { startTour } = useCRMTour(onNavigate)` inside the `CRMLayout` component
- Add a `<button>` with `<HelpCircle size={15} />` next to the theme toggle in the topbar right section
- On click, call `startTour()`

### 3. Remove "Super Admin Hub" as a separate sidebar group — merge into existing modules

**File:** `src/components/crm/crmModules.ts`

The super_admin is already listed in `allowedRoles` for every module. The separate "Super Admin Hub" module (`id: "super-admin"`) creates a redundant grouping.

**Changes:**
- Remove the `super-admin` module entry from `CRM_MODULES`
- The SuperAdminModule's functionality (user management, invitations, activity logs, routes, branding, email config) is already accessible via "People & Access", "Settings", etc.
- If any unique super-admin-only features exist that aren't elsewhere, we'll fold them into the Settings module under a super-admin-only tab

### 4. Role-differentiated dashboard

**File:** `src/components/crm/modules/DashboardModule.tsx`

Currently the dashboard shows the same content for all non-sponsor staff. Each role should see role-relevant quick actions and widgets.

**Changes:**
- Use `useAuthContext()` to get `roles`, `isSuperAdmin`, `isAdmin`, etc.
- **Super Admin / Admin:** Full dashboard with all stat cards, charts, and a quick "User Management" action button
- **Moderator:** Dashboard focused on pending applications, content review tasks, and recent activity
- **Programme Lead / Project Director:** Tasks, calendar events, programme-specific metrics
- **Marketing Manager:** Campaign stats, newsletter subscribers, website analytics
- **Finance Coordinator:** Budget overview, recent invoices, payment status
- **Sponsor:** Already handled (sponsor portal placeholder)
- **Other staff:** Basic dashboard with tasks, calendar, and activity feed
- The WelcomeBanner quick actions will adapt based on role

### 5. Overhaul PermissionManager in Settings

**File:** `src/components/crm/modules/SettingsModule.tsx`

The current permission manager only covers 3 roles (admin, moderator, sponsor) and 11 modules. It needs to cover all CRM roles and all actual CRM modules.

**Changes:**
- Expand `ROLES` to include all non-super_admin roles: `admin`, `moderator`, `project_director`, `programme_lead`, `website_editor`, `marketing_manager`, `communications_officer`, `finance_coordinator`, `logistics_coordinator`, `sponsor_manager`, `consultant`, `sponsor`
- Expand `MODULES` to match actual CRM module IDs from `crmModules.ts`: `dashboard`, `tasks`, `email-inbox`, `calendar`, `documents`, `team`, `people`, `news-editor`, `events-manager`, `programme-pillars`, `stakeholders-mgmt`, `media-kit-mgmt`, `sponsors-partners`, `site-content`, `cms`, `media-library`, `analytics`, `geo-analytics`, `sponsor-metrics`, `finance`, `invoices`, `marketing`, `newsletter`, `contact-submissions`, `parliament-ops`, `settings`
- Make the table horizontally scrollable with sticky first column for module names
- Add a "Select All" toggle per role column
- Super Admin note remains: "Super Admin always has full access"

### 6. Profile name sync — ensure CRM profile name stays in sync

**File:** `src/components/crm/modules/ProfileModule.tsx`

The `displayName` in `CRMLayout.tsx` reads from `user.user_metadata.full_name`, but the profile form saves to the `profiles` table. These can get out of sync.

**Changes:**
- In ProfileModule, after successfully saving the profile `full_name`, also call `supabase.auth.updateUser({ data: { full_name: newFullName } })` to keep `user_metadata` in sync
- This ensures the CRM header, sidebar avatar name, and profile page all show the same name
- Similarly, when the ProfileCompletionModal saves `full_name`, update `user_metadata` too

---

### Files Changed

| File | Change |
|---|---|
| `src/components/home/ImplementingPartnersSection.tsx` | Pure-logo treatment, remove card wrappers |
| `src/components/home/InstitutionalPartnersSection.tsx` | Pure-logo treatment, remove card wrappers |
| `src/components/crm/CRMLayout.tsx` | Add Help button with `useCRMTour`, sync name in ProfileCompletionModal |
| `src/components/crm/crmModules.ts` | Remove `super-admin` module entry |
| `src/components/crm/modules/DashboardModule.tsx` | Role-differentiated dashboard content |
| `src/components/crm/modules/SettingsModule.tsx` | Expand PermissionManager roles and modules |
| `src/components/crm/modules/ProfileModule.tsx` | Sync `full_name` to `user_metadata` on save |

