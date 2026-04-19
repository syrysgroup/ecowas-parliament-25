-- ============================================================
-- Secrets Vault: integration_secrets table + RLS + status view
-- ============================================================

CREATE TABLE IF NOT EXISTS public.integration_secrets (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  service_key   text        NOT NULL UNIQUE,
  encrypted_val text        NOT NULL,
  last_four     text,
  is_set        boolean     NOT NULL DEFAULT true,
  group_name    text        NOT NULL DEFAULT 'other',
  description   text,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  updated_by    uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.integration_secrets ENABLE ROW LEVEL SECURITY;

-- Only super_admin can read or write this table
CREATE POLICY "super_admin_only_secrets"
  ON public.integration_secrets
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- Safe view: exposes metadata only — encrypted_val is never included
CREATE OR REPLACE VIEW public.integration_secrets_status AS
  SELECT
    id,
    service_key,
    last_four,
    is_set,
    group_name,
    description,
    updated_at,
    updated_by
  FROM public.integration_secrets;

-- Grant select on view to authenticated (RLS on base table still applies)
GRANT SELECT ON public.integration_secrets_status TO authenticated;
