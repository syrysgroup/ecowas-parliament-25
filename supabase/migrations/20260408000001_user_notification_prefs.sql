-- Migration: user_notification_prefs table
-- Used by SettingsModule to store per-user notification preferences

CREATE TABLE IF NOT EXISTS public.user_notification_prefs (
  user_id          uuid     PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notify_new_message  boolean NOT NULL DEFAULT true,
  notify_task_assign  boolean NOT NULL DEFAULT true,
  notify_event_remind boolean NOT NULL DEFAULT true,
  notify_app_pending  boolean NOT NULL DEFAULT true,
  notify_invite_accept boolean NOT NULL DEFAULT true,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_notification_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notification prefs"
  ON public.user_notification_prefs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_notif_prefs_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER user_notification_prefs_updated_at
  BEFORE UPDATE ON public.user_notification_prefs
  FOR EACH ROW EXECUTE FUNCTION public.set_notif_prefs_updated_at();
