-- Add ECOWAS Parliament Initiatives sponsor flag
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS is_ecowas_sponsor boolean NOT NULL DEFAULT false;
