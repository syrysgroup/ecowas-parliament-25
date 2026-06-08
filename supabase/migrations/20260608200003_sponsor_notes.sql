CREATE TABLE public.sponsor_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsor_notes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsor_notes TO authenticated;
GRANT ALL ON public.sponsor_notes TO service_role;

CREATE POLICY "Staff can manage sponsor notes"
  ON public.sponsor_notes FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'sponsor_manager'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'sponsor_manager'::app_role)
  );

CREATE POLICY "Sponsors can read their own notes"
  ON public.sponsor_notes FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'sponsor'::app_role) AND sponsor_id = auth.uid());

CREATE INDEX sponsor_notes_sponsor_id_idx ON public.sponsor_notes (sponsor_id, is_pinned DESC, created_at DESC);
