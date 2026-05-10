INSERT INTO storage.buckets (id, name, public)
VALUES ('guides', 'guides', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read guides bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'guides');