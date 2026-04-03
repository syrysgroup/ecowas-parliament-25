-- Create storage bucket for partner logos and assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-assets', 'partner-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to partner assets
CREATE POLICY "Public can read partner assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'partner-assets');

-- Allow admins to upload partner assets
CREATE POLICY "Admins can upload partner assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'partner-assets' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
);

-- Allow admins to delete partner assets
CREATE POLICY "Admins can delete partner assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'partner-assets' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
);