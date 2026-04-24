-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: allow admin role to manage user_roles and role_permissions
--
-- Previously only super_admin could write to these tables, meaning:
--   • Admins could not assign/revoke roles on the Users tab (silent RLS block)
--   • Admins could not save changes in the Roles & Permissions module
--   • handleRoleChange showed "Role granted" toast even when the DB write failed
-- ─────────────────────────────────────────────────────────────────────────────

-- ── user_roles: let admins manage roles for non-super-admin users ─────────────
-- super_admin assignment remains exclusively super_admin-only for safety.
CREATE POLICY "Admins manage non-super-admin roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    AND role != 'super_admin'
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    AND role != 'super_admin'
  );

-- ── user_roles: let admins SELECT all rows (needed for the Users tab) ─────────
-- Without this, a non-super_admin admin loading the Users tab can only see
-- their own role row, so every other user appears to have no roles.
CREATE POLICY "Admins read all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR auth.uid() = user_id
  );

-- ── role_permissions: let admins write to the permissions matrix ──────────────
CREATE POLICY "Admins manage permissions"
  ON public.role_permissions
  FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );
