
-- =========================================================
-- PAGES
-- =========================================================
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  route TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  og_image TEXT,
  published_at TIMESTAMPTZ,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published pages" ON public.pages
  FOR SELECT USING (status = 'published' OR public.is_crm_staff());
CREATE POLICY "Staff can manage pages" ON public.pages
  FOR ALL USING (public.is_crm_staff()) WITH CHECK (public.is_crm_staff());

CREATE TRIGGER trg_pages_updated_at BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- PAGE SECTIONS
-- =========================================================
CREATE TABLE public.page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  kind TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  props JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page_id, key)
);
CREATE INDEX idx_page_sections_page ON public.page_sections(page_id, position);
GRANT SELECT ON public.page_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_sections TO authenticated;
GRANT ALL ON public.page_sections TO service_role;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read sections of published pages" ON public.page_sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.pages p WHERE p.id = page_id AND (p.status='published' OR public.is_crm_staff()))
  );
CREATE POLICY "Staff can manage sections" ON public.page_sections
  FOR ALL USING (public.is_crm_staff()) WITH CHECK (public.is_crm_staff());

CREATE TRIGGER trg_page_sections_updated_at BEFORE UPDATE ON public.page_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- PAGE SECTION ITEMS (repeaters: stats, cards, partners, tags)
-- =========================================================
CREATE TABLE public.page_section_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.page_sections(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_page_section_items_section ON public.page_section_items(section_id, position);
GRANT SELECT ON public.page_section_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_section_items TO authenticated;
GRANT ALL ON public.page_section_items TO service_role;
ALTER TABLE public.page_section_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read items of published pages" ON public.page_section_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.page_sections s
      JOIN public.pages p ON p.id = s.page_id
      WHERE s.id = section_id AND (p.status='published' OR public.is_crm_staff())
    )
  );
CREATE POLICY "Staff can manage items" ON public.page_section_items
  FOR ALL USING (public.is_crm_staff()) WITH CHECK (public.is_crm_staff());

CREATE TRIGGER trg_page_section_items_updated_at BEFORE UPDATE ON public.page_section_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- MEDIA LIBRARY
-- =========================================================
CREATE TABLE public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  width INT,
  height INT,
  alt TEXT,
  credit TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bucket, path)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_library TO authenticated;
GRANT ALL ON public.media_library TO service_role;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage media library" ON public.media_library
  FOR ALL USING (public.is_crm_staff()) WITH CHECK (public.is_crm_staff());

CREATE TRIGGER trg_media_library_updated_at BEFORE UPDATE ON public.media_library
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- FORM DEFINITIONS
-- =========================================================
CREATE TABLE public.form_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  success_message TEXT NOT NULL DEFAULT 'Thanks. We received your submission.',
  notify_email TEXT,
  autoresponder_subject TEXT,
  autoresponder_body TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.form_definitions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_definitions TO authenticated;
GRANT ALL ON public.form_definitions TO service_role;
ALTER TABLE public.form_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active forms" ON public.form_definitions
  FOR SELECT USING (status='active' OR public.is_crm_staff());
CREATE POLICY "Staff can manage forms" ON public.form_definitions
  FOR ALL USING (public.is_crm_staff()) WITH CHECK (public.is_crm_staff());

CREATE TRIGGER trg_form_definitions_updated_at BEFORE UPDATE ON public.form_definitions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- FORM FIELDS
-- =========================================================
CREATE TABLE public.form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.form_definitions(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  help_text TEXT,
  type TEXT NOT NULL CHECK (type IN ('text','email','textarea','select','checkbox','radio','file','date','phone','country','number','url','multicheck')),
  required BOOLEAN NOT NULL DEFAULT false,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  validation JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (form_id, key)
);
CREATE INDEX idx_form_fields_form ON public.form_fields(form_id, position);
GRANT SELECT ON public.form_fields TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_fields TO authenticated;
GRANT ALL ON public.form_fields TO service_role;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read fields of active forms" ON public.form_fields
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.form_definitions f WHERE f.id = form_id AND (f.status='active' OR public.is_crm_staff()))
  );
CREATE POLICY "Staff can manage fields" ON public.form_fields
  FOR ALL USING (public.is_crm_staff()) WITH CHECK (public.is_crm_staff());

CREATE TRIGGER trg_form_fields_updated_at BEFORE UPDATE ON public.form_fields
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- FORM SUBMISSIONS
-- =========================================================
CREATE TABLE public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.form_definitions(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','archived','spam')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_form_submissions_form ON public.form_submissions(form_id, created_at DESC);
GRANT INSERT ON public.form_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_submissions TO authenticated;
GRANT ALL ON public.form_submissions TO service_role;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit to active forms" ON public.form_submissions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.form_definitions f WHERE f.id = form_id AND f.status='active')
  );
CREATE POLICY "Staff can read submissions" ON public.form_submissions
  FOR SELECT USING (public.is_crm_staff());
CREATE POLICY "Staff can manage submissions" ON public.form_submissions
  FOR UPDATE USING (public.is_crm_staff()) WITH CHECK (public.is_crm_staff());
CREATE POLICY "Staff can delete submissions" ON public.form_submissions
  FOR DELETE USING (public.is_crm_staff());

CREATE TRIGGER trg_form_submissions_updated_at BEFORE UPDATE ON public.form_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- CONTENT REVISIONS (generic)
-- =========================================================
CREATE TABLE public.content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('page','page_section','form_definition')),
  entity_id UUID NOT NULL,
  snapshot JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_content_revisions_entity ON public.content_revisions(entity_type, entity_id, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.content_revisions TO authenticated;
GRANT ALL ON public.content_revisions TO service_role;
ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage revisions" ON public.content_revisions
  FOR ALL USING (public.is_crm_staff()) WITH CHECK (public.is_crm_staff());
