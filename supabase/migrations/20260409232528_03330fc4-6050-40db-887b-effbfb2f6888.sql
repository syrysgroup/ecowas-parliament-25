ALTER TABLE public.email_accounts
  ADD CONSTRAINT email_accounts_user_id_key UNIQUE (user_id);