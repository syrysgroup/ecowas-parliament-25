-- ============================================================
-- Phase 2: message_queue table + subscriber country/language
-- ============================================================

-- Message queue for retry logic
CREATE TABLE IF NOT EXISTS public.message_queue (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id   uuid        REFERENCES public.parliament_content(id) ON DELETE CASCADE,
  platform     text        NOT NULL,
  language     text        NOT NULL DEFAULT 'en',
  payload      jsonb,
  status       text        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','processing','sent','failed','dead')),
  retry_count  integer     NOT NULL DEFAULT 0,
  max_retries  integer     NOT NULL DEFAULT 3,
  last_error   text,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.message_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_message_queue"
  ON public.message_queue FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "admin_write_message_queue"
  ON public.message_queue FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "admin_update_message_queue"
  ON public.message_queue FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Add country + language segmentation to newsletter_subscribers
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS country  text,
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en'
    CHECK (language IN ('en', 'fr', 'pt')),
  ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- pg_cron: weekly digest every Friday at 16:00 WAT (UTC+1 = 15:00 UTC)
-- Requires pg_cron extension to be enabled in Supabase project settings
DO $$
BEGIN
  PERFORM cron.unschedule('weekly-digest');
EXCEPTION WHEN OTHERS THEN NULL;
END;
$$;

SELECT cron.schedule(
  'weekly-digest',
  '0 15 * * 5',
  $cron$
    SELECT net.http_post(
      url := (SELECT value::text FROM public.site_settings WHERE key = 'supabase_functions_url') || '/weekly-digest',
      headers := ('{"Content-Type":"application/json","Authorization":"Bearer ' ||
                 (SELECT value::text FROM public.site_settings WHERE key = 'supabase_service_key') || '"}')::jsonb,
      body := '{}'::jsonb
    );
  $cron$
);
