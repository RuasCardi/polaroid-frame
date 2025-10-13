-- ============================================
-- SETUP COMPLETO DO BANCO DE DADOS
-- ============================================

-- 1. Create app_role enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END $$;

-- 2. Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Create albums table
CREATE TABLE IF NOT EXISTS public.albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  cover_url TEXT,
  photo_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on albums
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

-- 5. Create photos table
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on photos
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for albums (public read, authenticated write)
CREATE POLICY IF NOT EXISTS "Anyone can view albums"
  ON public.albums FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can create albums"
  ON public.albums FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can update albums"
  ON public.albums FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can delete albums"
  ON public.albums FOR DELETE
  TO authenticated
  USING (true);

-- 7. Create RLS Policies for photos (public read, authenticated write)
CREATE POLICY IF NOT EXISTS "Anyone can view photos"
  ON public.photos FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can create photos"
  ON public.photos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can delete photos"
  ON public.photos FOR DELETE
  TO authenticated
  USING (true);

-- 8. Create RLS Policy for user_roles
CREATE POLICY IF NOT EXISTS "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- 9. Function to update album photo count
CREATE OR REPLACE FUNCTION public.update_album_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.albums
    SET photo_count = photo_count + 1
    WHERE id = NEW.album_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.albums
    SET photo_count = photo_count - 1
    WHERE id = OLD.album_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. Trigger to automatically update photo count
DROP TRIGGER IF EXISTS update_album_photo_count_trigger ON public.photos;
CREATE TRIGGER update_album_photo_count_trigger
AFTER INSERT OR DELETE ON public.photos
FOR EACH ROW
EXECUTE FUNCTION public.update_album_photo_count();

-- 11. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 12. Trigger for albums updated_at
DROP TRIGGER IF EXISTS update_albums_updated_at ON public.albums;
CREATE TRIGGER update_albums_updated_at
BEFORE UPDATE ON public.albums
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('album-photos', 'album-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 14. Storage policies for album photos (public read, authenticated write)
CREATE POLICY IF NOT EXISTS "Anyone can view album photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'album-photos');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload album photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'album-photos');

CREATE POLICY IF NOT EXISTS "Authenticated users can delete album photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'album-photos');
