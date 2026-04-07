
ALTER TABLE public.email_accounts ADD COLUMN IF NOT EXISTS zoho_account_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
