-- The volunteer_applications table was created with status constrained to
-- 'pending'|'approved'|'rejected'|'archived', but the public form (Volunteer.tsx)
-- submits status='new' and the admin module (VolunteerModule.tsx) uses
-- 'new'|'reviewing'|'accepted'|'rejected'. This mismatch causes public form
-- submissions to fail the constraint check. This migration aligns the DB with
-- the application code.

ALTER TABLE public.volunteer_applications
  DROP CONSTRAINT IF EXISTS volunteer_applications_status_check;

ALTER TABLE public.volunteer_applications
  ADD CONSTRAINT volunteer_applications_status_check
    CHECK (status IN ('new','reviewing','accepted','rejected','archived'));

ALTER TABLE public.volunteer_applications
  ALTER COLUMN status SET DEFAULT 'new';

-- Migrate any existing rows that used the old status values
UPDATE public.volunteer_applications SET status = 'new'      WHERE status = 'pending';
UPDATE public.volunteer_applications SET status = 'accepted' WHERE status = 'approved';
