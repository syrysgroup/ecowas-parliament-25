-- Add rich content + editorial metadata columns to news_articles
ALTER TABLE public.news_articles
  ADD COLUMN IF NOT EXISTS deck          text,
  ADD COLUMN IF NOT EXISTS author_name   text,
  ADD COLUMN IF NOT EXISTS location      text,
  ADD COLUMN IF NOT EXISTS category      text,
  ADD COLUMN IF NOT EXISTS image_caption text,
  ADD COLUMN IF NOT EXISTS event_id      uuid REFERENCES public.events(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS news_articles_event_id_idx ON public.news_articles(event_id);
