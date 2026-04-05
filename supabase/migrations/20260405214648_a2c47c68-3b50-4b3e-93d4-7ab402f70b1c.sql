
-- ═══════════════════════════════════════════════════════════
-- 1. SPONSORS TABLE
-- ═══════════════════════════════════════════════════════════
CREATE TABLE public.sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  description text,
  tier text NOT NULL DEFAULT 'standard',
  website text,
  email text,
  programmes text[] DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sponsors publicly readable when published" ON public.sponsors
  FOR SELECT TO public USING (is_published = true);

CREATE POLICY "Admins manage sponsors" ON public.sponsors
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- ═══════════════════════════════════════════════════════════
-- 2. PARTNERS TABLE
-- ═══════════════════════════════════════════════════════════
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  description text,
  partner_type text NOT NULL DEFAULT 'implementing',
  website text,
  lead_name text,
  lead_role text,
  lead_image_url text,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners publicly readable when published" ON public.partners
  FOR SELECT TO public USING (is_published = true);

CREATE POLICY "Admins manage partners" ON public.partners
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- ═══════════════════════════════════════════════════════════
-- 3. NEWS ARTICLES TABLE
-- ═══════════════════════════════════════════════════════════
CREATE TABLE public.news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  cover_image_url text,
  author_id uuid REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published news publicly readable" ON public.news_articles
  FOR SELECT TO public USING (status = 'published');

CREATE POLICY "Admins manage news" ON public.news_articles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- ═══════════════════════════════════════════════════════════
-- 4. SITE CONTENT TABLE (key-value for homepage sections)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  content jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site content publicly readable" ON public.site_content
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins manage site content" ON public.site_content
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- ═══════════════════════════════════════════════════════════
-- 5. NEWSLETTER SUBSCRIBERS TABLE
-- ═══════════════════════════════════════════════════════════
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT TO public WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- 6. EVENTS TABLE ADDITIONS
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_type text NOT NULL DEFAULT 'none';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tag text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tag_color text;

-- ═══════════════════════════════════════════════════════════
-- 7. STORAGE BUCKETS
-- ═══════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public) VALUES ('team-avatars', 'team-avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('sponsor-logos', 'sponsor-logos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('news-images', 'news-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('cms-media', 'cms-media', true) ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for team-avatars
CREATE POLICY "Public can view team avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'team-avatars');
CREATE POLICY "Admins upload team avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'team-avatars' AND (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Admins delete team avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'team-avatars' AND (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

-- Storage RLS policies for event-images
CREATE POLICY "Public can view event images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'event-images');
CREATE POLICY "Admins upload event images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'event-images' AND (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Admins delete event images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'event-images' AND (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

-- Storage RLS policies for sponsor-logos
CREATE POLICY "Public can view sponsor logos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'sponsor-logos');
CREATE POLICY "Admins upload sponsor logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'sponsor-logos' AND (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Admins delete sponsor logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'sponsor-logos' AND (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

-- Storage RLS policies for news-images
CREATE POLICY "Public can view news images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'news-images');
CREATE POLICY "Admins upload news images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'news-images' AND (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)));
CREATE POLICY "Admins delete news images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'news-images' AND (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)));

-- Storage RLS policies for cms-media
CREATE POLICY "Public can view cms media" ON storage.objects FOR SELECT TO public USING (bucket_id = 'cms-media');
CREATE POLICY "Admins upload cms media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cms-media' AND (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Admins delete cms media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cms-media' AND (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
