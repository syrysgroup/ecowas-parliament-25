-- The legal_page_versions table was created with page_key constrained to
-- 'legal.privacy'|'legal.terms'|'legal.cookies', but all application code
-- (both LegalPagesModule.tsx and LegalPage.tsx) uses unprefixed keys:
-- 'privacy', 'terms', 'cookies'. This migration aligns the constraint with
-- the code so that admin saves and public reads actually work.

ALTER TABLE public.legal_page_versions
  DROP CONSTRAINT IF EXISTS legal_page_versions_page_key_check;

ALTER TABLE public.legal_page_versions
  ADD CONSTRAINT legal_page_versions_page_key_check
    CHECK (page_key IN ('privacy','terms','cookies'));
