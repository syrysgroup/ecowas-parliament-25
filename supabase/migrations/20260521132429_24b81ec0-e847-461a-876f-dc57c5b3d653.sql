ALTER TABLE public.parliament_panorama_scenes
  ADD COLUMN IF NOT EXISTS default_zoom numeric NOT NULL DEFAULT 50;