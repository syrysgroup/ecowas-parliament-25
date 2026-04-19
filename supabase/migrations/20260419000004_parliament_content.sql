-- ============================================================
-- Parliament Content: AI-processed content + distribution log
-- ============================================================

CREATE TABLE IF NOT EXISTS public.parliament_content (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text        NOT NULL,
  session_ref   text,
  session_date  date,
  committee     text,
  raw_input     text,
  summary_en    text,
  summary_fr    text,
  summary_pt    text,
  whatsapp_en   text,
  whatsapp_fr   text,
  whatsapp_pt   text,
  telegram_en   text,
  social_x      text,
  social_ig     text,
  status        text        NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft','review','approved','published','archived')),
  country_tags  text[]      NOT NULL DEFAULT '{}',
  topic_tags    text[]      NOT NULL DEFAULT '{}',
  source_doc    text,
  fact_checked  boolean     NOT NULL DEFAULT false,
  reviewed_by   uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by   uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at  timestamptz,
  created_by    uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.parliament_content ENABLE ROW LEVEL SECURITY;

-- Authenticated staff can read
CREATE POLICY "staff_read_parliament_content"
  ON public.parliament_content FOR SELECT TO authenticated
  USING (true);

-- Admin+ can create/update
CREATE POLICY "admin_write_parliament_content"
  ON public.parliament_content FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'communications_officer'::public.app_role)
  );

CREATE POLICY "admin_update_parliament_content"
  ON public.parliament_content FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'communications_officer'::public.app_role)
  );

-- Only super_admin can delete
CREATE POLICY "superadmin_delete_parliament_content"
  ON public.parliament_content FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.touch_parliament_content_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER parliament_content_updated_at
  BEFORE UPDATE ON public.parliament_content
  FOR EACH ROW EXECUTE FUNCTION public.touch_parliament_content_updated_at();

-- ============================================================
-- Distribution Log
-- ============================================================

CREATE TABLE IF NOT EXISTS public.distribution_log (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id  uuid        REFERENCES public.parliament_content(id) ON DELETE CASCADE,
  platform    text        NOT NULL,
  language    text        NOT NULL DEFAULT 'en',
  status      text        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('sent','failed','pending','retry')),
  recipients  integer,
  error_msg   text,
  external_id text,
  sent_by     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  sent_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.distribution_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_read_distribution_log"
  ON public.distribution_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "admin_write_distribution_log"
  ON public.distribution_log FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );
