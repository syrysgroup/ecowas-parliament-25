-- Add workflow columns to contact_submissions
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved')),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Index for fast assigned-user lookups
CREATE INDEX IF NOT EXISTS idx_contact_submissions_assigned_to
  ON public.contact_submissions(assigned_to);

-- Assigned users can read their own submissions
DROP POLICY IF EXISTS "assigned_users_select_contact_submissions" ON public.contact_submissions;
CREATE POLICY "assigned_users_select_contact_submissions"
  ON public.contact_submissions FOR SELECT
  USING (assigned_to = auth.uid());

-- Assigned users can update (notes, status) on their own submissions
DROP POLICY IF EXISTS "assigned_users_update_contact_submissions" ON public.contact_submissions;
CREATE POLICY "assigned_users_update_contact_submissions"
  ON public.contact_submissions FOR UPDATE
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());
