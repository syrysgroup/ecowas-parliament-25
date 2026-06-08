-- Migration: Re-point tasks.assignee_id FK to profiles instead of auth.users
-- This allows PostgREST to resolve the `!assignee_id` join hint used in TaskBoardModule:
--   .select("*, assignee:profiles!assignee_id(id, full_name, avatar_url)")

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey;

ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_assignee_id_fkey
  FOREIGN KEY (assignee_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
