-- Add is_global flag to calendar events
ALTER TABLE public.crm_calendar_events
  ADD COLUMN IF NOT EXISTS is_global boolean NOT NULL DEFAULT false;

-- Update RLS policy to include global events
DROP POLICY IF EXISTS "CRM staff can view calendar events" ON public.crm_calendar_events;
CREATE POLICY "CRM staff can view calendar events"
  ON public.crm_calendar_events FOR SELECT TO authenticated
  USING (
    created_by = auth.uid() OR is_global = true OR public.is_crm_staff(auth.uid())
  );
