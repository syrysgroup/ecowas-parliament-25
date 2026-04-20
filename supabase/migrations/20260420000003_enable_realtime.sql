-- Enable Realtime for chat and email tables.
-- The existing subscriptions in MessagingModule and EmailInboxModule are already
-- wired up — they just need these tables in the supabase_realtime publication.

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_messages;
EXCEPTION WHEN OTHERS THEN NULL;
END;
$$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
EXCEPTION WHEN OTHERS THEN NULL;
END;
$$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.emails;
EXCEPTION WHEN OTHERS THEN NULL;
END;
$$;
