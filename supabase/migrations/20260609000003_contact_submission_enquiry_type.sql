ALTER TABLE public.contact_submissions
  ADD COLUMN enquiry_type text;

CREATE INDEX contact_submissions_enquiry_type_idx
  ON public.contact_submissions (enquiry_type)
  WHERE enquiry_type IS NOT NULL;
