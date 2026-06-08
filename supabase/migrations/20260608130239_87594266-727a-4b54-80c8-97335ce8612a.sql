
-- ─────────────────────────────────────────────────────────────────────────────
-- Roles & Permissions Unification — Part 1: schema, helpers, RLS, audit log
-- (Enum values added here cannot be USED inside this same migration; seeds
--  that reference the new values run in Part 2.)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add missing enum values used by the TypeScript AppRole union
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'budget_officer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';

-- 2. role_permissions integrity: dedupe + unique constraint
DELETE FROM public.role_permissions a
USING public.role_permissions b
WHERE a.ctid < b.ctid
  AND a.role = b.role
  AND a.module = b.module;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.role_permissions'::regclass
      AND conname = 'role_permissions_role_module_key'
  ) THEN
    ALTER TABLE public.role_permissions
      ADD CONSTRAINT role_permissions_role_module_key UNIQUE (role, module);
  END IF;
END $$;

-- 3. RLS: tighten role_permissions writes to super_admin only
DROP POLICY IF EXISTS "Admins manage permissions" ON public.role_permissions;
-- "Super admins manage permissions" and "Authenticated can read permissions"
-- already exist and remain in place.

-- 4. custom_roles table — runtime role labels mapped to a base enum bucket
CREATE TABLE IF NOT EXISTS public.custom_roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text NOT NULL UNIQUE,
  label       text NOT NULL,
  description text,
  base_role   public.app_role NOT NULL,
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.custom_roles TO authenticated;
GRANT ALL    ON public.custom_roles TO service_role;

ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_roles_read"             ON public.custom_roles;
DROP POLICY IF EXISTS "custom_roles_super_admin_all"  ON public.custom_roles;

CREATE POLICY "custom_roles_read"
  ON public.custom_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "custom_roles_super_admin_all"
  ON public.custom_roles FOR ALL
  TO authenticated
  USING      (public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP TRIGGER IF EXISTS custom_roles_set_updated_at ON public.custom_roles;
CREATE TRIGGER custom_roles_set_updated_at
  BEFORE UPDATE ON public.custom_roles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Audit-log triggers for role_permissions and user_roles
CREATE OR REPLACE FUNCTION public.log_role_permission_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_activity_logs(actor_user_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    lower(TG_OP),
    'role_permission',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'role',   COALESCE(NEW.role::text,   OLD.role::text),
      'module', COALESCE(NEW.module,        OLD.module),
      'old',    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
      'new',    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS role_permissions_audit ON public.role_permissions;
CREATE TRIGGER role_permissions_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.log_role_permission_change();

CREATE OR REPLACE FUNCTION public.log_user_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_activity_logs(actor_user_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    lower(TG_OP),
    'user_role',
    COALESCE(NEW.user_id, OLD.user_id),
    jsonb_build_object(
      'role',    COALESCE(NEW.role::text, OLD.role::text),
      'user_id', COALESCE(NEW.user_id,     OLD.user_id)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS user_roles_audit ON public.user_roles;
CREATE TRIGGER user_roles_audit
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_user_role_change();
