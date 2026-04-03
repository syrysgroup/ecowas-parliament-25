-- Migration: Email integration + module tables
-- Run this in Supabase SQL Editor → New Query → Run

-- ============================================================
-- PROFILES: add has_email_account column
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_email_account boolean NOT NULL DEFAULT false;

-- ============================================================
-- TABLE: email_accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_accounts (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_address    text        NOT NULL,
  zoho_account_id  text,
  is_active        boolean     NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email account"
  ON public.email_accounts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage email accounts"
  ON public.email_accounts FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin')
  );

-- ============================================================
-- TABLE: emails
-- ============================================================
CREATE TABLE IF NOT EXISTS public.emails (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       uuid        NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE,
  zoho_message_id  text        UNIQUE,
  from_address     text        NOT NULL DEFAULT '',
  from_name        text        NOT NULL DEFAULT '',
  to_address       text        NOT NULL DEFAULT '',
  cc_address       text,
  subject          text        NOT NULL DEFAULT '(No subject)',
  body_html        text,
  body_text        text,
  is_read          boolean     NOT NULL DEFAULT false,
  is_starred       boolean     NOT NULL DEFAULT false,
  folder           text        NOT NULL DEFAULT 'inbox',
  has_attachments  boolean     NOT NULL DEFAULT false,
  sent_at          timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own emails"
  ON public.emails FOR ALL TO authenticated
  USING (
    account_id IN (
      SELECT id FROM public.email_accounts WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- TABLE: budget_items  (Finance module)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.budget_items (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  category     text        NOT NULL DEFAULT 'general',
  amount       numeric     NOT NULL DEFAULT 0,
  type         text        NOT NULL DEFAULT 'expense',   -- 'income' | 'expense'
  status       text        NOT NULL DEFAULT 'pending',   -- 'pending' | 'approved' | 'paid'
  notes        text,
  created_by   uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finance staff can view budget items"
  ON public.budget_items FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'finance_coordinator')
  );

CREATE POLICY "Finance staff can insert budget items"
  ON public.budget_items FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'finance_coordinator')
  );

CREATE POLICY "Finance staff can update budget items"
  ON public.budget_items FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'finance_coordinator')
  );

CREATE POLICY "Admins can delete budget items"
  ON public.budget_items FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin')
  );

-- ============================================================
-- TABLE: campaigns  (Marketing module)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text        NOT NULL,
  type             text        NOT NULL DEFAULT 'email',   -- 'email' | 'social' | 'press'
  status           text        NOT NULL DEFAULT 'draft',   -- 'draft' | 'active' | 'completed'
  target_audience  text,
  scheduled_at     timestamptz,
  notes            text,
  created_by       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketing staff can view campaigns"
  ON public.campaigns FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'marketing_manager')
  );

CREATE POLICY "Marketing staff can insert campaigns"
  ON public.campaigns FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'marketing_manager')
  );

CREATE POLICY "Marketing staff can update campaigns"
  ON public.campaigns FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'marketing_manager')
  );

CREATE POLICY "Admins can delete campaigns"
  ON public.campaigns FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin')
  );

-- ============================================================
-- TABLE: cms_pages  (CMS module)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text        NOT NULL UNIQUE,
  title         text        NOT NULL,
  content       text,
  status        text        NOT NULL DEFAULT 'draft',   -- 'draft' | 'review' | 'published'
  last_edited_by uuid       REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CMS editors can view pages"
  ON public.cms_pages FOR SELECT TO authenticated
  USING (public.is_crm_staff(auth.uid()));

CREATE POLICY "CMS editors can insert pages"
  ON public.cms_pages FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'website_editor') OR
    public.has_role(auth.uid(), 'marketing_manager') OR
    public.has_role(auth.uid(), 'project_director') OR
    public.has_role(auth.uid(), 'programme_lead') OR
    public.has_role(auth.uid(), 'communications_officer')
  );

CREATE POLICY "CMS editors can update pages"
  ON public.cms_pages FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'website_editor') OR
    public.has_role(auth.uid(), 'marketing_manager') OR
    public.has_role(auth.uid(), 'project_director') OR
    public.has_role(auth.uid(), 'programme_lead') OR
    public.has_role(auth.uid(), 'communications_officer')
  );

CREATE POLICY "Admins can delete cms pages"
  ON public.cms_pages FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin')
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER cms_pages_updated_at
  BEFORE UPDATE ON public.cms_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TABLE: chat_messages  (Messaging module)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body         text        NOT NULL,
  sent_at      timestamptz NOT NULL DEFAULT now(),
  read_at      timestamptz,
  deleted_at   timestamptz
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat messages"
  ON public.chat_messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "CRM staff can send chat messages"
  ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (public.is_crm_staff(auth.uid()) AND sender_id = auth.uid());

CREATE POLICY "Sender can soft-delete own messages"
  ON public.chat_messages FOR UPDATE TO authenticated
  USING (sender_id = auth.uid());

-- Index for fast conversation lookups
CREATE INDEX IF NOT EXISTS chat_messages_conversation_idx
  ON public.chat_messages (
    LEAST(sender_id, recipient_id),
    GREATEST(sender_id, recipient_id),
    sent_at DESC
  );
