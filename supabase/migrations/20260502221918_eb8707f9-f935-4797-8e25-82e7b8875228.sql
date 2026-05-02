
-- Categories
CREATE TABLE public.marketplace_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories publicly readable" ON public.marketplace_categories
  FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.marketplace_categories
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Listings
CREATE TABLE public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  category_id uuid REFERENCES public.marketplace_categories(id) ON DELETE SET NULL,
  country text,
  seller_name text NOT NULL,
  seller_email text NOT NULL,
  seller_phone text,
  seller_company text,
  unit text NOT NULL DEFAULT 'units',
  moq numeric,
  available_quantity numeric,
  price_min numeric,
  price_max numeric,
  currency text NOT NULL DEFAULT 'USD',
  image_url text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  is_featured boolean NOT NULL DEFAULT false,
  view_count integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_listings_status ON public.marketplace_listings(status);
CREATE INDEX idx_listings_country ON public.marketplace_listings(country);
CREATE INDEX idx_listings_category ON public.marketplace_listings(category_id);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved listings publicly readable" ON public.marketplace_listings
  FOR SELECT USING (status = 'approved');
CREATE POLICY "CRM staff read all listings" ON public.marketplace_listings
  FOR SELECT TO authenticated USING (is_crm_staff(auth.uid()));
CREATE POLICY "Anyone can submit listings" ON public.marketplace_listings
  FOR INSERT TO anon WITH CHECK (status = 'pending');
CREATE POLICY "Authenticated can submit listings" ON public.marketplace_listings
  FOR INSERT TO authenticated WITH CHECK (status = 'pending' OR is_crm_staff(auth.uid()));
CREATE POLICY "CRM staff update listings" ON public.marketplace_listings
  FOR UPDATE TO authenticated USING (is_crm_staff(auth.uid())) WITH CHECK (is_crm_staff(auth.uid()));
CREATE POLICY "CRM staff delete listings" ON public.marketplace_listings
  FOR DELETE TO authenticated USING (is_crm_staff(auth.uid()));

CREATE TRIGGER trg_marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Interests
CREATE TABLE public.marketplace_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  buyer_phone text,
  buyer_country text,
  buyer_company text,
  quantity numeric,
  unit text,
  size_spec text,
  target_price numeric,
  delivery_timeline text,
  message text,
  status text NOT NULL DEFAULT 'new',
  assigned_to uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_interests_listing ON public.marketplace_interests(listing_id);
CREATE INDEX idx_interests_status ON public.marketplace_interests(status);

ALTER TABLE public.marketplace_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit interest" ON public.marketplace_interests
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Authenticated can submit interest" ON public.marketplace_interests
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "CRM staff read interests" ON public.marketplace_interests
  FOR SELECT TO authenticated USING (is_crm_staff(auth.uid()) OR assigned_to = auth.uid());
CREATE POLICY "CRM staff update interests" ON public.marketplace_interests
  FOR UPDATE TO authenticated USING (is_crm_staff(auth.uid()) OR assigned_to = auth.uid())
  WITH CHECK (is_crm_staff(auth.uid()) OR assigned_to = auth.uid());
CREATE POLICY "CRM staff delete interests" ON public.marketplace_interests
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('marketplace-media', 'marketplace-media', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Marketplace media public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'marketplace-media');
CREATE POLICY "Marketplace media authenticated upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'marketplace-media');
CREATE POLICY "Marketplace media anon upload" ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'marketplace-media');
CREATE POLICY "Marketplace media CRM update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'marketplace-media' AND is_crm_staff(auth.uid()));
CREATE POLICY "Marketplace media CRM delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'marketplace-media' AND is_crm_staff(auth.uid()));

-- Seed categories
INSERT INTO public.marketplace_categories (name, slug, sort_order) VALUES
  ('Agriculture & Food', 'agriculture-food', 10),
  ('Textiles & Apparel', 'textiles-apparel', 20),
  ('Cosmetics & Wellness', 'cosmetics-wellness', 30),
  ('Crafts & Leather', 'crafts-leather', 40),
  ('Minerals & Resources', 'minerals-resources', 50),
  ('Manufacturing & Equipment', 'manufacturing-equipment', 60),
  ('Services & Logistics', 'services-logistics', 70);

-- Seed sample listings
INSERT INTO public.marketplace_listings (slug, title, description, category_id, country, seller_name, seller_email, unit, moq, available_quantity, price_min, price_max, currency, status, is_featured) VALUES
  ('premium-parboiled-rice-nigeria', 'Premium Parboiled Rice', 'Locally milled long-grain parboiled rice from Kebbi State, ready for export within ECOWAS.', (SELECT id FROM public.marketplace_categories WHERE slug='agriculture-food'), 'Nigeria', 'Sahel Grains Ltd', 'sales@sahelgrains.example', 'tonnes', 20, 500, 850, 950, 'USD', 'approved', true),
  ('organic-cocoa-beans-ghana', 'Organic Cocoa Beans', 'Fair-trade certified cocoa beans, grade A, fermented and sun-dried.', (SELECT id FROM public.marketplace_categories WHERE slug='agriculture-food'), 'Ghana', 'Ashanti Cocoa Co-op', 'export@ashanticocoa.example', 'tonnes', 5, 200, 2400, 2700, 'USD', 'approved', true),
  ('raw-shea-butter-burkina', 'Raw Unrefined Shea Butter', 'Hand-processed shea butter from women co-operatives in the Sahel.', (SELECT id FROM public.marketplace_categories WHERE slug='cosmetics-wellness'), 'Burkina Faso', 'Karité Women Co-op', 'orders@karite.example', 'kg', 100, 5000, 6, 9, 'USD', 'approved', false),
  ('handwoven-kente-cloth', 'Handwoven Kente Cloth', 'Authentic kente strips, custom colours and patterns available.', (SELECT id FROM public.marketplace_categories WHERE slug='textiles-apparel'), 'Ghana', 'Kumasi Weavers Guild', 'sales@kumasiweavers.example', 'metres', 50, 1200, 25, 60, 'USD', 'approved', false),
  ('cassava-flour-bulk', 'High Quality Cassava Flour', 'Food-grade cassava flour, gluten-free, 25kg bags.', (SELECT id FROM public.marketplace_categories WHERE slug='agriculture-food'), 'Côte d''Ivoire', 'Abidjan Agro SARL', 'b2b@abidjanagro.example', 'tonnes', 10, 300, 600, 750, 'USD', 'approved', false),
  ('cashew-nuts-raw', 'Raw Cashew Nuts (RCN)', 'Current crop, KOR 48-50 lbs, ready for shipment FOB Cotonou.', (SELECT id FROM public.marketplace_categories WHERE slug='agriculture-food'), 'Benin', 'Cotonou Cashew Trading', 'export@cotonoucashew.example', 'tonnes', 25, 1000, 1100, 1350, 'USD', 'approved', false),
  ('crude-palm-oil', 'Crude Palm Oil (CPO)', 'Bulk CPO, FFA <5%, sustainable plantations in southern Liberia.', (SELECT id FROM public.marketplace_categories WHERE slug='agriculture-food'), 'Liberia', 'Monrovia Oils Plc', 'sales@monroviaoils.example', 'tonnes', 50, 800, 900, 1050, 'USD', 'approved', false),
  ('handmade-leather-goods', 'Tuareg Leather Goods', 'Bags, sandals and accessories handcrafted by artisans.', (SELECT id FROM public.marketplace_categories WHERE slug='crafts-leather'), 'Niger', 'Agadez Artisans Collective', 'shop@agadezartisans.example', 'units', 20, 400, 35, 120, 'USD', 'approved', false);
