# Roles & Permissions — Full Unification Plan

Consolidates the audit findings. Ships in one phase as a single migration plus coordinated UI changes in `apps/admin` and `apps/web`.

---

## 1. Migration: `20260608120000_roles_permissions_unification.sql`

**Enum + helper sync**
- `ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'budget_officer';`
- `ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';`
- Rebuild `public.is_crm_staff(uuid)` to include both (`media` and `sponsor` stay excluded).

**`role_permissions` integrity**
- Dedupe existing rows by `(role, module)` keeping latest.
- `ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_role_module_key UNIQUE (role, module);`
- Drop the `Admins manage permissions` policy. Keep `Super admins manage permissions` (super_admin only writes). Keep authenticated read.

**Backfill seeds** for the 10 missing modules — idempotent `INSERT … ON CONFLICT (role, module) DO UPDATE`:
- `volunteer` — admin (full); communications_officer, programme_lead, moderator (view/create/edit)
- `media-accreditation` — admin (full); communications_officer, marketing_manager (view/create/edit)
- `legal-pages` — admin (full); website_editor (view/create/edit)
- `youth-sub-pillars` — admin (full); website_editor, programme_lead (view/create/edit)
- `sponsor-portal-config` — admin (full); sponsor_manager (view/create/edit)
- `timeline` — admin (full); website_editor, programme_lead, communications_officer (view/create/edit)
- `pages` — admin (full); website_editor, communications_officer (view/create/edit)
- `forms` — admin (full); website_editor, communications_officer (view/create/edit)
- `marketplace` — admin (full); project_director, programme_lead, sponsor_manager (view/create/edit)
- `parliament-tour` — admin (full); website_editor, communications_officer (view/create/edit)
- `media` role: `profile` (view/edit), `settings` (view)

**`custom_roles` (new table)** — runtime role labels mapped to a base enum, no schema change per role.
```
id uuid pk, key text unique, label text, description text,
base_role app_role not null, created_by uuid, created_at, updated_at
```
GRANT authenticated SELECT, service_role ALL. RLS: read = authenticated; write = super_admin only.

**Audit log triggers** on `role_permissions` and `user_roles` writes → insert into `admin_activity_logs` (`action`, `entity_type`, `entity_id`, `payload jsonb`, `actor_user_id = auth.uid()`).

---

## 2. Admin code (`apps/admin/`)

**New files**
- `src/components/crm/permRegistry.ts` — exports `PERM_MODULES` (derived from `CRM_MODULES`, excluding `super-admin`) and `PERM_ROLES` (derived from `AppRole` minus `super_admin`, including `media`).

**Edits**
- `PermissionManagerPanel.tsx`
  - Import `PERM_MODULES` / `PERM_ROLES` from `permRegistry`.
  - Replace destructive `DELETE … + INSERT` with chunked `upsert` on the new unique constraint.
  - Render a locked all-true Super Admin row at top with tooltip.
  - Gate edit UI on `isSuperAdmin` (admin is read-only).
  - "Reseed from registry" button: inserts missing `(role, module)` rows defaulting to each module's `allowedRoles` so newly registered modules appear immediately.
- `RolesModule.tsx`
  - "Add custom role" drawer (super_admin only) → inserts into `custom_roles`.
  - `canManage={isSuperAdmin || isAdmin}` for non-super_admin role assignment (matches RLS).
  - Custom role creation + permission matrix editing super_admin only.
- `usePermissions.ts` — add `canManageRoles` flag (super_admin only).
- `crmModules.ts` — add brief comment on `finance` entry documenting intentional exclusion of `admin`; `allowedRoles` remain default seeds, runtime check stays on `canView()`.

---

## 3. Web code (`apps/web/`)

- Sync `AppRole` and `CRM_STAFF_ROLES` in `src/contexts/AuthContext.tsx` (already in sync — verify after enum addition).
- Mirror `usePermissions.ts` updates so sponsor/media portals share semantics.

---

## 4. Verification

1. `supabase db push`; check `SELECT enum_range(NULL::app_role);` includes both new values.
2. Permissions UI as super_admin: all 41 modules visible; Super Admin row locked-true; toggles persist via upsert.
3. Login as `communications_officer` → `volunteer`, `pages`, `forms`, `parliament-tour` load without redirect.
4. Login as `admin` → Permissions matrix loads read-only; user role assignment for non-super_admin works.
5. Login as `media` → profile/settings reachable, CRM modules hidden.
6. Edit a permission cell → row appears in `admin_activity_logs` with actor.
7. Create a custom role → row in `custom_roles`; assignable from user drawer.

---

## Technical notes

- Postgres enum values cannot be added inside a transaction with later use of that value. The migration splits enum additions and seed inserts using `COMMIT;` between blocks, or runs the seed in a follow-up migration if the runner enforces single-transaction. Plan: two-file split if needed (`…_unification_enum.sql` then `…_unification_seed.sql`).
- `custom_roles.base_role` lets us scale role names without enum churn. Display label resolves at render time; permissions remain keyed to `app_role`.
- All web/admin code defers to the DB matrix via `usePermissions`; `allowedRoles` in `crmModules.ts` is only used for the reseed button defaults and sidebar fallback during initial load.

## Out of scope

- Sponsor/media portal module-level permissions (separate surface).
- Roles UI re-theming.
- Row-level ACLs beyond existing `has_role` helpers.
