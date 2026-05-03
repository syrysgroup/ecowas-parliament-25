
-- Add spec_tags for advanced search
ALTER TABLE public.marketplace_listings
  ADD COLUMN IF NOT EXISTS spec_tags text[] DEFAULT '{}'::text[];

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_spec_tags ON public.marketplace_listings USING GIN(spec_tags);

-- Inquiries (buyer → ECOWAS thread)
CREATE TABLE IF NOT EXISTS public.marketplace_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL,
  interest_id uuid,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  buyer_phone text,
  buyer_country text,
  buyer_company text,
  subject text NOT NULL DEFAULT 'New enquiry',
  status text NOT NULL DEFAULT 'open',
  assigned_to uuid,
  access_token text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mp_inquiries_token ON public.marketplace_inquiries(access_token);
CREATE INDEX IF NOT EXISTS idx_mp_inquiries_listing ON public.marketplace_inquiries(listing_id);

ALTER TABLE public.marketplace_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can create inquiries" ON public.marketplace_inquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "CRM staff read inquiries" ON public.marketplace_inquiries
  FOR SELECT TO authenticated USING (is_crm_staff(auth.uid()) OR assigned_to = auth.uid());
CREATE POLICY "CRM staff update inquiries" ON public.marketplace_inquiries
  FOR UPDATE TO authenticated USING (is_crm_staff(auth.uid()) OR assigned_to = auth.uid())
  WITH CHECK (is_crm_staff(auth.uid()) OR assigned_to = auth.uid());
CREATE POLICY "Admins delete inquiries" ON public.marketplace_inquiries
  FOR DELETE TO authenticated USING (has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'admin'::app_role));

-- Inquiry messages
CREATE TABLE IF NOT EXISTS public.marketplace_inquiry_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL REFERENCES public.marketplace_inquiries(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('buyer','crm','seller')),
  sender_name text,
  sender_email text,
  body text NOT NULL,
  attachment_url text,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mp_inquiry_messages_inquiry ON public.marketplace_inquiry_messages(inquiry_id);

ALTER TABLE public.marketplace_inquiry_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert buyer messages" ON public.marketplace_inquiry_messages
  FOR INSERT TO anon, authenticated WITH CHECK (sender_type = 'buyer' AND is_internal = false);
CREATE POLICY "CRM staff insert messages" ON public.marketplace_inquiry_messages
  FOR INSERT TO authenticated WITH CHECK (is_crm_staff(auth.uid()));
CREATE POLICY "CRM staff read messages" ON public.marketplace_inquiry_messages
  FOR SELECT TO authenticated USING (is_crm_staff(auth.uid()));
CREATE POLICY "Admins delete messages" ON public.marketplace_inquiry_messages
  FOR DELETE TO authenticated USING (has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'admin'::app_role));

-- Seller "list with us" requests
CREATE TABLE IF NOT EXISTS public.marketplace_seller_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_name text NOT NULL,
  seller_email text NOT NULL,
  seller_phone text,
  seller_company text,
  country text,
  product_title text NOT NULL,
  product_description text,
  category_id uuid,
  unit text,
  available_quantity numeric,
  price_min numeric,
  price_max numeric,
  currency text DEFAULT 'USD',
  image_url text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.marketplace_seller_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public submit seller request" ON public.marketplace_seller_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "CRM staff manage seller requests" ON public.marketplace_seller_requests
  FOR SELECT TO authenticated USING (is_crm_staff(auth.uid()));
CREATE POLICY "CRM staff update seller requests" ON public.marketplace_seller_requests
  FOR UPDATE TO authenticated USING (is_crm_staff(auth.uid())) WITH CHECK (is_crm_staff(auth.uid()));
CREATE POLICY "Admins delete seller requests" ON public.marketplace_seller_requests
  FOR DELETE TO authenticated USING (has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'admin'::app_role));

-- Listing views (analytics)
CREATE TABLE IF NOT EXISTS public.marketplace_listing_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL,
  country text,
  referrer text,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mp_views_listing ON public.marketplace_listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_mp_views_created ON public.marketplace_listing_views(created_at);

ALTER TABLE public.marketplace_listing_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public log views" ON public.marketplace_listing_views
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "CRM staff read views" ON public.marketplace_listing_views
  FOR SELECT TO authenticated USING (is_crm_staff(auth.uid()));

-- updated_at triggers
CREATE TRIGGER trg_mp_inquiries_updated BEFORE UPDATE ON public.marketplace_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_mp_seller_requests_updated BEFORE UPDATE ON public.marketplace_seller_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
