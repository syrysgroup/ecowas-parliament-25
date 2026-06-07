ALTER TABLE public.news_articles
  ADD COLUMN IF NOT EXISTS flyer_image_url text;
