-- ─────────────────────────────────────────────────────────────────────────────
-- Idempotent fix: ensure all role/permission RLS policies are in place.
-- Safe to run even if 20260423000001 was already applied — DROP IF EXISTS
-- prevents conflicts.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── user_roles ────────────────────────────────────────────────────────────────

-- Allow admins to INSERT/UPDATE/DELETE roles for non-super-admin users.
-- super_admin assignment remains exclusively super_admin-only for safety.
DROP POLICY IF EXISTS "Admins manage non-super-admin roles" ON public.user_roles;
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

-- Allow admins and super_admins to SELECT all role rows.
-- Without this, loading the Users tab as a non-super-admin returns only
-- the viewer's own role row, making every other user appear role-less.
DROP POLICY IF EXISTS "Admins read all roles" ON public.user_roles;
CREATE POLICY "Admins read all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR auth.uid() = user_id
  );

-- ── role_permissions ──────────────────────────────────────────────────────────

-- Allow admins to write the permissions matrix (alongside super_admin).
DROP POLICY IF EXISTS "Admins manage permissions" ON public.role_permissions;
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
