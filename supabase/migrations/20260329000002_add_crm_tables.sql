-- Migration: Add CRM tables
-- Requires: 20260329000001_add_crm_roles.sql to have run first

-- ============================================================
-- HELPER FUNCTION: is_crm_staff
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_crm_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN (
        'super_admin',
        'admin',
        'moderator',
        'project_director',
        'programme_lead',
        'website_editor',
        'marketing_manager',
        'communications_officer',
        'finance_coordinator',
        'logistics_coordinator',
        'sponsor_manager',
        'consultant'
      )
  )
$$;

-- ============================================================
-- TABLE: tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  description text,
  pillar      text,       -- 'youth'|'trade'|'women'|'civic'|'culture'|'awards'|'parliament'|'general'
  assignee_id uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status      text        NOT NULL DEFAULT 'todo',    -- 'todo'|'in_progress'|'review'|'done'
  priority    text        NOT NULL DEFAULT 'medium',  -- 'low'|'medium'|'high'|'urgent'
  due_date    date,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CRM staff can view tasks"
  ON public.tasks FOR SELECT TO authenticated
  USING (public.is_crm_staff(auth.uid()));

CREATE POLICY "CRM staff can insert tasks"
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (public.is_crm_staff(auth.uid()));

CREATE POLICY "CRM staff can update tasks"
  ON public.tasks FOR UPDATE TO authenticated
  USING (public.is_crm_staff(auth.uid()));

CREATE POLICY "CRM staff can delete own tasks"
  ON public.tasks FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- TABLE: crm_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_messages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid       NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  to_email    text,
  subject     text        NOT NULL,
  body        text        NOT NULL,
  is_read     boolean     NOT NULL DEFAULT false,
  is_archived boolean     NOT NULL DEFAULT false,
  thread_id   uuid,       -- points to root message id (no FK — intentional for soft-delete safety)
  label       text,
  sent_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own messages"
  ON public.crm_messages FOR SELECT TO authenticated
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "CRM staff can send messages"
  ON public.crm_messages FOR INSERT TO authenticated
  WITH CHECK (public.is_crm_staff(auth.uid()) AND from_user_id = auth.uid());

CREATE POLICY "Recipients can update messages (mark read/archive)"
  ON public.crm_messages FOR UPDATE TO authenticated
  USING (to_user_id = auth.uid() OR from_user_id = auth.uid());

-- ============================================================
-- TABLE: crm_calendar_events
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_calendar_events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  description text,
  start_time  timestamptz NOT NULL,
  end_time    timestamptz,
  all_day     boolean     NOT NULL DEFAULT false,
  colour      text        NOT NULL DEFAULT 'green',  -- 'green'|'blue'|'amber'|'red'|'violet'|'teal'
  created_by  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CRM staff can view calendar events"
  ON public.crm_calendar_events FOR SELECT TO authenticated
  USING (public.is_crm_staff(auth.uid()));

CREATE POLICY "Permitted roles can create calendar events"
  ON public.crm_calendar_events FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'project_director') OR
    public.has_role(auth.uid(), 'programme_lead') OR
    public.has_role(auth.uid(), 'logistics_coordinator')
  );

CREATE POLICY "Creators and admins can update calendar events"
  ON public.crm_calendar_events FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid() OR
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Creators and admins can delete calendar events"
  ON public.crm_calendar_events FOR DELETE TO authenticated
  USING (
    created_by = auth.uid() OR
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin')
  );

-- ============================================================
-- TABLE: project_emails
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_emails (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id    text        NOT NULL DEFAULT 'ep25',
  email_handle  text        UNIQUE NOT NULL,
  display_name  text        NOT NULL,
  is_active     boolean     NOT NULL DEFAULT true,
  created_by    uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.project_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can manage all project emails"
  ON public.project_emails FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own project email"
  ON public.project_emails FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- PROFILE RLS: Allow CRM staff to read other staff profiles
-- (needed for task assignee selects and message compose)
-- ============================================================
CREATE POLICY "CRM staff can read staff profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_crm_staff(auth.uid()));
