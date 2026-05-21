ALTER TABLE public.parliament_panorama_scenes
  ADD COLUMN IF NOT EXISTS mobile_panorama_url text,
  ADD COLUMN IF NOT EXISTS preview_url text;