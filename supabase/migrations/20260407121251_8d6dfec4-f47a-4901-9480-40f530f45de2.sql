
-- 1. Create programme_pillars table
CREATE TABLE IF NOT EXISTS public.programme_pillars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  emoji text,
  color text,
  icon_bg text,
  route text,
  progress_percent integer NOT NULL DEFAULT 0,
  lead_name text,
  sponsors text[] NOT NULL DEFAULT '{}',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.programme_pillars ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Programme pillars publicly readable"
  ON public.programme_pillars FOR SELECT
  TO public
  USING (is_active = true);

-- Admin manage
CREATE POLICY "Admins manage programme pillars"
  ON public.programme_pillars FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- 2. Seed the 7 programme pillars
INSERT INTO public.programme_pillars (slug, title, emoji, color, icon_bg, route, progress_percent, lead_name, display_order)
VALUES
  ('youth',       'Youth Parliament',       '🏛️', 'hsl(152 100% 26%)', 'bg-emerald-100 dark:bg-emerald-900/30', '/programmes/parliament', 35, NULL, 1),
  ('trade',       'Trade & Investment',      '📊', 'hsl(217 91% 60%)',  'bg-blue-100 dark:bg-blue-900/30',       '/programmes/trade',      20, NULL, 2),
  ('women',       'Women Empowerment',       '👩‍💼', 'hsl(330 81% 60%)',  'bg-pink-100 dark:bg-pink-900/30',       '/programmes/women',      15, NULL, 3),
  ('culture',     'Culture & Heritage',      '🎭', 'hsl(25 95% 53%)',   'bg-orange-100 dark:bg-orange-900/30',   '/programmes/culture',    10, NULL, 4),
  ('awards',      'Awards & Recognition',    '🏆', 'hsl(45 93% 47%)',   'bg-yellow-100 dark:bg-yellow-900/30',   '/programmes/awards',     10, NULL, 5),
  ('civic',       'Civic Education',         '📚', 'hsl(262 83% 58%)',  'bg-violet-100 dark:bg-violet-900/30',   '/programmes/civic',      5,  NULL, 6),
  ('innovators',  'Innovators Challenge',    '💡', 'hsl(174 72% 40%)',  'bg-teal-100 dark:bg-teal-900/30',       '/programmes/innovators-challenge', 5, NULL, 7)
ON CONFLICT (slug) DO NOTHING;

-- 3. Create media_kit_items table if not exists
CREATE TABLE IF NOT EXISTS public.media_kit_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text,
  file_type text NOT NULL DEFAULT 'image',
  category text NOT NULL DEFAULT 'logo',
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.media_kit_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media kit items publicly readable"
  ON public.media_kit_items FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Admins manage media kit items"
  ON public.media_kit_items FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
