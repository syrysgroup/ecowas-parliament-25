-- Schedule process-queue edge function every 5 minutes via pg_cron.
-- pg_cron and pg_net are already enabled by 20260417000001_pg_cron_event_reminders.sql.
-- supabase_functions_url and supabase_service_key are seeded in site_settings
-- (referenced by the weekly-digest job in 20260420000002_phase2_messaging.sql).

DO $$
BEGIN
  PERFORM cron.unschedule('process-queue-5min');
EXCEPTION WHEN OTHERS THEN NULL;
END;
$$;

SELECT cron.schedule(
  'process-queue-5min',
  '*/5 * * * *',
  $cron$
    SELECT net.http_post(
      url     := (SELECT value::text FROM public.site_settings WHERE key = 'supabase_functions_url') || '/process-queue',
      headers := ('{"Content-Type":"application/json","Authorization":"Bearer ' ||
                  (SELECT value::text FROM public.site_settings WHERE key = 'supabase_service_key') || '"}')::jsonb,
      body    := '{}'::jsonb
    );
  $cron$
);
