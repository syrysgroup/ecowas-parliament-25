-- 1. Tasks FK to profiles (for PostgREST join hints)
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey;
ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_assignee_id_fkey
  FOREIGN KEY (assignee_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Update calendar RLS for is_global support
DROP POLICY IF EXISTS "CRM staff can view calendar events" ON public.crm_calendar_events;
CREATE POLICY "CRM staff can view calendar events"
  ON public.crm_calendar_events FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR is_global = true OR public.is_crm_staff(auth.uid()));