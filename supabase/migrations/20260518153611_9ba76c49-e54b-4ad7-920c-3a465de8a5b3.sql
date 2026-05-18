
-- Parliament panorama scenes and hotspots
CREATE TABLE IF NOT EXISTS public.parliament_panorama_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  panorama_url text NOT NULL,
  preview_url text,
  default_yaw double precision NOT NULL DEFAULT 0,
  default_pitch double precision NOT NULL DEFAULT 0,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.parliament_panorama_hotspots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id uuid NOT NULL REFERENCES public.parliament_panorama_scenes(id) ON DELETE CASCADE,
  yaw double precision NOT NULL,
  pitch double precision NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  link_url text,
  link_scene_id uuid REFERENCES public.parliament_panorama_scenes(id) ON DELETE SET NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.parliament_panorama_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parliament_panorama_hotspots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Panorama scenes public read"
  ON public.parliament_panorama_scenes FOR SELECT
  USING (is_active = true OR public.is_crm_staff());

CREATE POLICY "Panorama scenes staff write"
  ON public.parliament_panorama_scenes FOR ALL
  USING (public.is_crm_staff())
  WITH CHECK (public.is_crm_staff());

CREATE POLICY "Panorama hotspots public read"
  ON public.parliament_panorama_hotspots FOR SELECT
  USING (is_active = true OR public.is_crm_staff());

CREATE POLICY "Panorama hotspots staff write"
  ON public.parliament_panorama_hotspots FOR ALL
  USING (public.is_crm_staff())
  WITH CHECK (public.is_crm_staff());

CREATE TRIGGER trg_panorama_scenes_updated_at
  BEFORE UPDATE ON public.parliament_panorama_scenes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_panorama_hotspots_updated_at
  BEFORE UPDATE ON public.parliament_panorama_hotspots
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage bucket for panorama imagery
INSERT INTO storage.buckets (id, name, public)
VALUES ('parliament-panorama', 'parliament-panorama', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Panorama images public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'parliament-panorama');

CREATE POLICY "Panorama images staff write"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'parliament-panorama' AND public.is_crm_staff());

CREATE POLICY "Panorama images staff update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'parliament-panorama' AND public.is_crm_staff());

CREATE POLICY "Panorama images staff delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'parliament-panorama' AND public.is_crm_staff());

-- Seed a placeholder scene + hotspots so the UI is functional immediately
INSERT INTO public.parliament_panorama_scenes (slug, name, description, panorama_url, display_order)
VALUES (
  'main-chamber',
  'Main Chamber',
  'Step inside the ECOWAS Parliament chamber in Abuja — the seat of West African parliamentary democracy.',
  'https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg',
  1
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.parliament_panorama_hotspots (scene_id, yaw, pitch, title, description, display_order)
SELECT s.id, 0, 0, 'Speaker''s Chair', 'Where the Speaker of the ECOWAS Parliament presides over plenary sessions.', 1
FROM public.parliament_panorama_scenes s WHERE s.slug = 'main-chamber'
ON CONFLICT DO NOTHING;

INSERT INTO public.parliament_panorama_hotspots (scene_id, yaw, pitch, title, description, display_order)
SELECT s.id, 1.5, -0.1, 'Member Benches', 'Seating for the 95 parliamentarians representing all 12 ECOWAS member states.', 2
FROM public.parliament_panorama_scenes s WHERE s.slug = 'main-chamber'
ON CONFLICT DO NOTHING;

INSERT INTO public.parliament_panorama_hotspots (scene_id, yaw, pitch, title, description, display_order)
SELECT s.id, -1.5, 0.1, 'Public Gallery', 'Where citizens, press and observers witness parliamentary proceedings.', 3
FROM public.parliament_panorama_scenes s WHERE s.slug = 'main-chamber'
ON CONFLICT DO NOTHING;
