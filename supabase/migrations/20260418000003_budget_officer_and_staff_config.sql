-- Runs after 20260418000002 which commits the new enum values.

-- Update is_crm_staff to include the new roles
CREATE OR REPLACE FUNCTION public.is_crm_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN (
        'super_admin', 'admin', 'moderator',
        'project_director', 'programme_lead', 'website_editor',
        'marketing_manager', 'communications_officer', 'finance_coordinator',
        'logistics_coordinator', 'sponsor_manager', 'consultant',
        'budget_officer', 'staff'
      )
  )
$$;

-- ── budget_items: grant budget_officer INSERT/UPDATE access ──────────────────
-- Replace the FOR ALL "Admins manage" policy with split policies so
-- budget_officer can write but not delete financial records.
DROP POLICY IF EXISTS "Admins manage budget items" ON public.budget_items;

CREATE POLICY "Finance write budget items"
  ON public.budget_items FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'finance_coordinator'::app_role) OR
    has_role(auth.uid(), 'budget_officer'::app_role)
  );

CREATE POLICY "Finance update budget items"
  ON public.budget_items FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'finance_coordinator'::app_role) OR
    has_role(auth.uid(), 'budget_officer'::app_role)
  );

CREATE POLICY "Admins delete budget items"
  ON public.budget_items FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

-- ── invoices: grant budget_officer INSERT/UPDATE access ──────────────────────
DROP POLICY IF EXISTS "Admins manage invoices" ON public.invoices;

CREATE POLICY "Finance write invoices"
  ON public.invoices FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'finance_coordinator'::app_role) OR
    has_role(auth.uid(), 'budget_officer'::app_role)
  );

CREATE POLICY "Finance update invoices"
  ON public.invoices FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'finance_coordinator'::app_role) OR
    has_role(auth.uid(), 'budget_officer'::app_role)
  );

CREATE POLICY "Admins delete invoices"
  ON public.invoices FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

-- ── invoice_items: same pattern ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins manage invoice items" ON public.invoice_items;

CREATE POLICY "Finance write invoice items"
  ON public.invoice_items FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'finance_coordinator'::app_role) OR
    has_role(auth.uid(), 'budget_officer'::app_role)
  );

CREATE POLICY "Finance update invoice items"
  ON public.invoice_items FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'finance_coordinator'::app_role) OR
    has_role(auth.uid(), 'budget_officer'::app_role)
  );

CREATE POLICY "Admins delete invoice items"
  ON public.invoice_items FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

-- ── Seed role_permissions for both new roles ─────────────────────────────────
INSERT INTO public.role_permissions (role, module, can_view, can_create, can_edit, can_delete) VALUES
  ('budget_officer', 'dashboard',   true,  false, false, false),
  ('budget_officer', 'tasks',       true,  true,  true,  false),
  ('budget_officer', 'calendar',    true,  true,  false, false),
  ('budget_officer', 'email-inbox', true,  true,  false, false),
  ('budget_officer', 'comms',       true,  true,  false, false),
  ('budget_officer', 'documents',   true,  true,  true,  false),
  ('budget_officer', 'finance',     true,  true,  true,  false),
  ('budget_officer', 'invoices',    true,  true,  true,  false),
  ('budget_officer', 'analytics',   true,  false, false, false),
  ('staff', 'dashboard',   true,  false, false, false),
  ('staff', 'tasks',       true,  true,  false, false),
  ('staff', 'calendar',    true,  false, false, false),
  ('staff', 'email-inbox', true,  true,  false, false),
  ('staff', 'comms',       true,  true,  false, false),
  ('staff', 'documents',   true,  false, false, false),
  ('staff', 'profile',     true,  true,  true,  false)
ON CONFLICT (role, module) DO NOTHING;
