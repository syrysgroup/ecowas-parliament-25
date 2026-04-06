-- ============================================================
-- Invoices: Full invoice management system for CRM
-- ============================================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  text        NOT NULL,
  client_name     text        NOT NULL,
  client_email    text,
  client_company  text,
  client_address  text,
  client_country  text,
  issue_date      date        NOT NULL DEFAULT CURRENT_DATE,
  due_date        date,
  status          text        NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','sent','paid','partial','overdue','cancelled')),
  notes           text,
  subtotal        numeric(12,2) NOT NULL DEFAULT 0,
  tax_rate        numeric(5,2)  DEFAULT 0,
  tax_amount      numeric(12,2) DEFAULT 0,
  total           numeric(12,2) NOT NULL DEFAULT 0,
  amount_paid     numeric(12,2) DEFAULT 0,
  balance         numeric(12,2) GENERATED ALWAYS AS (total - COALESCE(amount_paid,0)) STORED,
  currency        text        DEFAULT 'USD',
  created_by      uuid        REFERENCES public.profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id  uuid        NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description text        NOT NULL,
  quantity    numeric(10,2) NOT NULL DEFAULT 1,
  unit_price  numeric(12,2) NOT NULL DEFAULT 0,
  amount      numeric(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  sort_order  integer     DEFAULT 0
);

-- RLS
ALTER TABLE public.invoices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items  ENABLE ROW LEVEL SECURITY;

-- SELECT: finance coordinator, admin, super_admin, project_director
CREATE POLICY "invoice_select" ON public.invoices
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('super_admin','admin','finance_coordinator','project_director')
    )
  );

CREATE POLICY "invoice_items_select" ON public.invoice_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('super_admin','admin','finance_coordinator','project_director')
    )
  );

-- INSERT
CREATE POLICY "invoice_insert" ON public.invoices
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('super_admin','admin','finance_coordinator')
    )
  );

CREATE POLICY "invoice_items_insert" ON public.invoice_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('super_admin','admin','finance_coordinator')
    )
  );

-- UPDATE
CREATE POLICY "invoice_update" ON public.invoices
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('super_admin','admin','finance_coordinator')
    )
  );

CREATE POLICY "invoice_items_update" ON public.invoice_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('super_admin','admin','finance_coordinator')
    )
  );

-- DELETE
CREATE POLICY "invoice_delete" ON public.invoices
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('super_admin','admin')
    )
  );

CREATE POLICY "invoice_items_delete" ON public.invoice_items
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('super_admin','admin','finance_coordinator')
    )
  );

-- Seed a sequence-style invoice number via function
CREATE OR REPLACE FUNCTION public.next_invoice_number()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  seq integer;
BEGIN
  SELECT COALESCE(MAX(CAST(REPLACE(invoice_number, 'INV-', '') AS integer)), 0) + 1
  INTO seq
  FROM public.invoices
  WHERE invoice_number ~ '^INV-[0-9]+$';
  RETURN 'INV-' || LPAD(seq::text, 4, '0');
END;
$$;
