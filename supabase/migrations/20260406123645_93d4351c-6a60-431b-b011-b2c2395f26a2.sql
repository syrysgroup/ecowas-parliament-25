
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS external_links jsonb DEFAULT '[]'::jsonb;

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'media';
