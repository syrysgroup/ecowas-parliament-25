# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a monorepo with two independent Vite apps (no shared packages or workspace tooling — they are standalone):

```
apps/admin/   — CRM (invitation-only staff portal)
apps/web/     — Public-facing ECOWAS Parliament website
supabase/     — Edge functions (Deno) + migrations
```

Both apps share identical `package.json` scripts and identical dependency lists. There is no root-level `package.json` — commands must be run from within each app directory. AWS Amplify handles deployment (`amplify.yml` at root).

## Commands

Run from `apps/admin/` or `apps/web/`:

```bash
npm run dev          # Vite dev server
npm run build        # Production build → dist/
npm run build:dev    # Development build
npm run lint         # ESLint
npm run test         # Vitest (single run)
npm run test:watch   # Vitest (watch mode)
npm run preview      # Preview production build
```

Supabase (from repo root, requires Supabase CLI):
```bash
supabase functions serve          # Serve all edge functions locally
supabase functions deploy <name>  # Deploy a single function
supabase db push                  # Apply pending migrations
```

## Architecture

### Admin CRM (`apps/admin/`)

Navigation is URL-driven: `/crm/:section` maps to a module. The module registry is `crmModules.ts` — add a new module entry there first, then handle the section in `CRMDashboard.tsx`.

**Module system flow:**
1. `src/components/crm/crmModules.ts` — defines `CRM_MODULES[]` with `id`, `section`, `allowedRoles`, and `group`
2. `src/pages/CRMDashboard.tsx` — imports modules, uses `getModulesForRoles()` to filter by auth, renders the active section
3. `src/components/crm/modules/` — one file per module (e.g. `NewsEditorModule.tsx`)
4. Frequently-used modules are eagerly imported; less-used ones use `lazy()`

**Auth & roles:**
- `src/contexts/AuthContext.tsx` — `AuthProvider` wraps the app; `useAuthContext()` returns `{ user, roles, isSuperAdmin, hasRole, ... }`
- 16 roles defined as `AppRole` type; `CRM_STAFF_ROLES[]` excludes `sponsor` and `media`
- Fine-grained permissions via `usePermissions()` hook → queries `role_permissions` table
- Access control: `isSuperAdmin` bypasses all permission checks

**SuperAdminModule** (`src/components/crm/modules/SuperAdminModule.tsx`) has a `Tab` type union and a `NAV` array — to add a new tab, extend both and add a render block. Sub-tab components live in `src/components/crm/modules/superadmin/`.

**Supabase client:** `src/integrations/supabase/client.ts` — single shared `supabase` instance. `src/integrations/supabase/types.ts` is auto-generated from the DB schema; regenerate with `supabase gen types typescript`.

**UI components:** shadcn/ui components are in `src/components/ui/`. Use `sonner` for toasts (`useToast` hook). Tailwind + Radix UI throughout.

**i18n:** Both apps use a custom `I18nProvider` with `useI18n()` / `t()`. Translations are in `src/lib/translations/{en,fr,pt}.ts`. The locale auto-detects from the browser.

**State:** TanStack Query for server state (default `staleTime: 5min`, `refetchOnWindowFocus: false`). Redux Toolkit for UI state only.

### Public Website (`apps/web/`)

Standard React Router v6 SPA. Public routes are unauthenticated. Auth pages (`/auth`, `/set-password`, `/complete-profile`) are shared. A `ProtectedRoute` wrapper gates the sponsor dashboard.

### Supabase Edge Functions (`supabase/functions/`)

All functions are Deno (TypeScript). Pattern:
- CORS preflight handled first (`OPTIONS` → return `corsHeaders`)
- Auth: extract `Authorization` header → `anonClient.auth.getUser()` → role check via `anonClient.rpc("has_role", ...)`
- Privileged DB writes use a `serviceClient` (service role key)
- Env vars accessed via `Deno.env.get()`

Required env vars for secrets functions: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SECRETS_ENCRYPTION_KEY` (64-char hex, AES-256-GCM).

Shared edge function deps are in `supabase/functions/deno.json`.

### Database

Migrations are in `supabase/migrations/` (timestamped SQL files). Key tables:
- `profiles` — user profiles (linked to `auth.users`)
- `user_roles` — role assignments (`user_id`, `role`); `has_role(uid, role)` RLS helper used everywhere
- `admin_activity_logs` — audit trail for admin actions
- `integration_secrets` — encrypted API keys (RLS: super_admin only); safe metadata via `integration_secrets_status` view
- `parliament_content` — AI-processed session content with distribution fields
- `distribution_log` — per-platform send records

RLS uses the `has_role(auth.uid(), 'role_name'::app_role)` function pattern consistently.
