

## Plan: Add AuthContext, SuperAdminDashboard, and Bootstrap Super Admin Role

The user uploaded a set of upgraded files that introduce a centralized AuthContext, a redesigned Auth page with forgot-password flow and team-mode, a new SuperAdminDashboard, and an updated ProtectedRoute. They also want the user with UID `0b5747ee-cf4a-4c22-8592-a649fca67e45` assigned as super_admin.

### What will be done

1. **Create `src/contexts/AuthContext.tsx`** — new React context providing user, session, roles, convenience booleans (isSuperAdmin, isAdmin, etc.), and signOut/refreshRoles methods. Single source of truth for auth state.

2. **Update `src/hooks/useAuth.ts`** — replace the standalone hook with a re-export from AuthContext for backward compatibility.

3. **Update `src/App.tsx`** — wrap the app in `<AuthProvider>`, add the `/admin/super` route pointing to `SuperAdminDashboard` (protected to super_admin only), import the new page.

4. **Replace `src/pages/Auth.tsx`** — new Auth page with sign-in, sign-up, forgot password, reset-sent modes, team/staff login toggle, ECOWAS branding header, and role-based redirect.

5. **Replace `src/components/admin/ProtectedRoute.tsx`** — uses `useAuthContext()` instead of standalone role-checking logic. Adds `bare` prop for minimal loading shell.

6. **Create `src/pages/admin/SuperAdminDashboard.tsx`** — full super admin hub with sidebar navigation, overview stats, user management with role assignment, invitation management, activity log viewer, site routes map, and system settings/info panel.

7. **Insert super_admin role for UID `0b5747ee-cf4a-4c22-8592-a649fca67e45`** — SQL insert into `user_roles` table.

### Technical details

- **AuthContext** fetches roles from `user_roles` table on auth state change; exposes `hasRole()`, `refreshRoles()`, computed booleans
- **ProtectedRoute** now reads from context (no separate `useEffect` + state for role checking)
- **SuperAdminDashboard** queries `profiles`, `user_roles`, `invitations`, `admin_activity_logs`; invokes `invite-user` edge function; manages roles via direct insert/delete on `user_roles`
- **SQL**: `INSERT INTO public.user_roles (user_id, role) VALUES ('0b5747ee-cf4a-4c22-8592-a649fca67e45', 'super_admin') ON CONFLICT (user_id, role) DO NOTHING;`
- All existing components using `useAuth` continue working via the re-export shim

### Files changed

| File | Action |
|------|--------|
| `src/contexts/AuthContext.tsx` | Create |
| `src/hooks/useAuth.ts` | Replace |
| `src/App.tsx` | Update (add AuthProvider wrapper, SuperAdminDashboard route) |
| `src/pages/Auth.tsx` | Replace |
| `src/components/admin/ProtectedRoute.tsx` | Replace |
| `src/pages/admin/SuperAdminDashboard.tsx` | Create |
| Database: `user_roles` | Insert super_admin role for given UID |

