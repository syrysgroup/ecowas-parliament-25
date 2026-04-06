-- ============================================================
-- CRM Management: RLS policies for newsletter and contact_submissions
-- Allows admins to update (unsubscribe) and delete newsletter subscribers
-- Allows admins to mark-read and delete contact form submissions
-- ============================================================

-- Add is_read column to contact_submissions
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;

-- newsletter_subscribers: allow admins to update (e.g. set unsubscribed_at)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'newsletter_subscribers' AND policyname = 'admins_update_newsletter_subscribers'
  ) THEN
    CREATE POLICY admins_update_newsletter_subscribers
      ON public.newsletter_subscribers
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid()
            AND ur.role IN ('super_admin', 'admin', 'marketing_manager')
        )
      );
  END IF;
END $$;

-- newsletter_subscribers: allow admins to delete
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'newsletter_subscribers' AND policyname = 'admins_delete_newsletter_subscribers'
  ) THEN
    CREATE POLICY admins_delete_newsletter_subscribers
      ON public.newsletter_subscribers
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid()
            AND ur.role IN ('super_admin', 'admin', 'marketing_manager')
        )
      );
  END IF;
END $$;

-- contact_submissions: allow admins to delete
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contact_submissions' AND policyname = 'admins_delete_contact_submissions'
  ) THEN
    CREATE POLICY admins_delete_contact_submissions
      ON public.contact_submissions
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid()
            AND ur.role IN ('super_admin', 'admin')
        )
      );
  END IF;
END $$;

-- contact_submissions: allow admins to update (mark as read/archived)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contact_submissions' AND policyname = 'admins_update_contact_submissions'
  ) THEN
    CREATE POLICY admins_update_contact_submissions
      ON public.contact_submissions
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid()
            AND ur.role IN ('super_admin', 'admin')
        )
      );
  END IF;
END $$;
