ALTER TABLE public.sponsor_inquiries
  ADD COLUMN request_type text NOT NULL DEFAULT 'inquiry'
  CHECK (request_type IN ('inquiry', 'concept_note', 'briefing_call'));
