-- Add editorial workflow fields to news_articles
ALTER TABLE public.news_articles
  ADD COLUMN IF NOT EXISTS source_doc   text,
  ADD COLUMN IF NOT EXISTS fact_checked boolean NOT NULL DEFAULT false;
