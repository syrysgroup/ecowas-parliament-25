
-- 1. budget_items: drop permissive authenticated SELECT
DROP POLICY IF EXISTS "Authenticated can read budget items" ON public.budget_items;

-- 2. distribution_log: restrict SELECT to admins/marketing
DROP POLICY IF EXISTS "staff_read_distribution_log" ON public.distribution_log;
CREATE POLICY "staff_read_distribution_log" ON public.distribution_log
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'marketing_manager'::app_role)
    OR has_role(auth.uid(), 'communications_officer'::app_role)
  );

-- 3. global_settings: restrict SELECT to admins
DROP POLICY IF EXISTS "global_settings_read" ON public.global_settings;
CREATE POLICY "global_settings_read" ON public.global_settings
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- 4. invoices / invoice_items: restrict SELECT to admins/finance/creator
DROP POLICY IF EXISTS "Authenticated can read invoices" ON public.invoices;
CREATE POLICY "Finance staff or creator can read invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'finance_coordinator'::app_role)
    OR auth.uid() = created_by
  );

DROP POLICY IF EXISTS "Authenticated can read invoice items" ON public.invoice_items;
CREATE POLICY "Finance staff or creator can read invoice items" ON public.invoice_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = invoice_items.invoice_id
        AND (
          has_role(auth.uid(), 'super_admin'::app_role)
          OR has_role(auth.uid(), 'admin'::app_role)
          OR has_role(auth.uid(), 'finance_coordinator'::app_role)
          OR auth.uid() = i.created_by
        )
    )
  );

-- 5. nomination_votes: remove public read, restrict to staff/voter
DROP POLICY IF EXISTS "Votes are publicly readable" ON public.nomination_votes;
CREATE POLICY "Voter or staff can read votes" ON public.nomination_votes
  FOR SELECT TO authenticated
  USING (
    auth.uid() = voter_user_id
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'moderator'::app_role)
  );

-- 6. nominations: replace broad authenticated read with scoped policies
DROP POLICY IF EXISTS "Anyone authenticated can read nominations" ON public.nominations;
CREATE POLICY "Staff can read all nominations" ON public.nominations
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'moderator'::app_role)
  );
CREATE POLICY "Users can read own nominations" ON public.nominations
  FOR SELECT TO authenticated
  USING (
    auth.uid() = nominator_user_id
    OR auth.uid() = nominee_user_id
  );

-- 7. parliament_content: restrict to CRM staff
DROP POLICY IF EXISTS "staff_read_parliament_content" ON public.parliament_content;
CREATE POLICY "staff_read_parliament_content" ON public.parliament_content
  FOR SELECT TO authenticated
  USING (public.is_crm_staff(auth.uid()));

-- 8. profiles: hide sensitive columns from anon
REVOKE SELECT (phone, date_of_birth, notification_email, linkedin_url)
  ON public.profiles FROM anon;

-- 9. site_settings: only safe keys public
DROP POLICY IF EXISTS "Site settings publicly readable" ON public.site_settings;
CREATE POLICY "Public can read safe site settings" ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (
    key IN (
      'site_name',
      'site_logo_url',
      'footer_text',
      'contact_email',
      'social_facebook',
      'social_instagram',
      'social_linkedin',
      'social_twitter',
      'social_youtube'
    )
  );

-- 10. Fix mutable search_path on helper trigger functions
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.update_global_settings_updated_at() SET search_path = public;
ALTER FUNCTION public.touch_parliament_content_updated_at() SET search_path = public;

-- 11. Security definer view -> security invoker
ALTER VIEW public.integration_secrets_status SET (security_invoker = true);
