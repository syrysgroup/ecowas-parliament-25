
-- Marketplace buyers (public registration)
CREATE TABLE IF NOT EXISTS public.marketplace_buyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  organisation text NOT NULL,
  country text NOT NULL,
  categories_of_interest text[] NOT NULL DEFAULT '{}',
  email text NOT NULL,
  whatsapp text,
  sourcing_intent text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_buyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register as buyer" ON public.marketplace_buyers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "CRM staff can view buyers" ON public.marketplace_buyers
  FOR SELECT USING (public.is_crm_staff(auth.uid()));
CREATE POLICY "CRM staff can update buyers" ON public.marketplace_buyers
  FOR UPDATE USING (public.is_crm_staff(auth.uid()));
CREATE POLICY "CRM staff can delete buyers" ON public.marketplace_buyers
  FOR DELETE USING (public.is_crm_staff(auth.uid()));

CREATE TRIGGER trg_buyers_updated BEFORE UPDATE ON public.marketplace_buyers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Connection requests between buyers and sellers
CREATE TABLE IF NOT EXISTS public.marketplace_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  seller_email text,
  seller_company text,
  product_name text,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  buyer_whatsapp text,
  message text,
  status text NOT NULL DEFAULT 'new',
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit connection" ON public.marketplace_connections
  FOR INSERT WITH CHECK (true);
CREATE POLICY "CRM staff can view connections" ON public.marketplace_connections
  FOR SELECT USING (public.is_crm_staff(auth.uid()));
CREATE POLICY "CRM staff can update connections" ON public.marketplace_connections
  FOR UPDATE USING (public.is_crm_staff(auth.uid()));
CREATE POLICY "CRM staff can delete connections" ON public.marketplace_connections
  FOR DELETE USING (public.is_crm_staff(auth.uid()));

CREATE TRIGGER trg_connections_updated BEFORE UPDATE ON public.marketplace_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_connections_status ON public.marketplace_connections(status);
CREATE INDEX IF NOT EXISTS idx_connections_listing ON public.marketplace_connections(listing_id);
