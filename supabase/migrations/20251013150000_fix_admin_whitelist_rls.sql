-- Drop existing policies that rely only on has_role
DROP POLICY IF EXISTS "Admins can create albums" ON public.albums;
DROP POLICY IF EXISTS "Admins can update albums" ON public.albums;
DROP POLICY IF EXISTS "Admins can delete albums" ON public.albums;
DROP POLICY IF EXISTS "Admins can create photos" ON public.photos;
DROP POLICY IF EXISTS "Admins can delete photos" ON public.photos;

-- Create new policies that allow authenticated users to write
-- (frontend will control actual access via whitelist)
CREATE POLICY "Authenticated users can create albums"
  ON public.albums FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update albums"
  ON public.albums FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete albums"
  ON public.albums FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create photos"
  ON public.photos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete photos"
  ON public.photos FOR DELETE
  TO authenticated
  USING (true);

-- Update storage policies
DROP POLICY IF EXISTS "Admins can upload album photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete album photos" ON storage.objects;

CREATE POLICY "Authenticated users can upload album photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'album-photos');

CREATE POLICY "Authenticated users can delete album photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'album-photos');
