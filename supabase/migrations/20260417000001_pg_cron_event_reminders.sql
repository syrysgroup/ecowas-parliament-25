-- Enable pg_cron and pg_net extensions (idempotent — safe if already enabled)
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net  with schema extensions;

-- Schedule hourly event reminder notifications
-- Calls the notify-upcoming-events edge function at the top of every hour.
-- The function finds events starting 23–25 hours from now and sends
-- external email reminders to users with notify_event_remind = true.
select cron.schedule(
  'notify-upcoming-events-hourly',
  '0 * * * *',
  $$
    select
      net.http_post(
        url     := current_setting('app.settings.supabase_url', true)
                   || '/functions/v1/notify-upcoming-events',
        headers := jsonb_build_object(
          'Content-Type',  'application/json',
          'Authorization', 'Bearer '
            || current_setting('app.settings.service_role_key', true)
        ),
        body    := '{}'::jsonb
      );
  $$
);
