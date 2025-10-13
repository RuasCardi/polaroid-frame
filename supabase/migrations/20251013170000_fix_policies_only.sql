-- ============================================
-- AJUSTAR APENAS AS POLÍTICAS DE SEGURANÇA
-- (Mantém tabelas e dados existentes)
-- ============================================

-- 1. Remover políticas antigas restritivas (se existirem)
DO $$ 
BEGIN
  -- Políticas de albums
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'albums' AND policyname = 'Admins can create albums') THEN
    DROP POLICY "Admins can create albums" ON public.albums;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'albums' AND policyname = 'Admins can update albums') THEN
    DROP POLICY "Admins can update albums" ON public.albums;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'albums' AND policyname = 'Admins can delete albums') THEN
    DROP POLICY "Admins can delete albums" ON public.albums;
  END IF;

  -- Políticas de photos
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'photos' AND policyname = 'Admins can create photos') THEN
    DROP POLICY "Admins can create photos" ON public.photos;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'photos' AND policyname = 'Admins can delete photos') THEN
    DROP POLICY "Admins can delete photos" ON public.photos;
  END IF;

  -- Políticas de storage
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload album photos') THEN
    DROP POLICY "Admins can upload album photos" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can delete album photos') THEN
    DROP POLICY "Admins can delete album photos" ON storage.objects;
  END IF;
END $$;

-- 2. Criar novas políticas permissivas para usuários autenticados
DO $$
BEGIN
  -- Políticas de albums
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'albums' AND policyname = 'Authenticated users can create albums') THEN
    CREATE POLICY "Authenticated users can create albums"
      ON public.albums FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'albums' AND policyname = 'Authenticated users can update albums') THEN
    CREATE POLICY "Authenticated users can update albums"
      ON public.albums FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'albums' AND policyname = 'Authenticated users can delete albums') THEN
    CREATE POLICY "Authenticated users can delete albums"
      ON public.albums FOR DELETE
      TO authenticated
      USING (true);
  END IF;

  -- Políticas de photos
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'photos' AND policyname = 'Authenticated users can create photos') THEN
    CREATE POLICY "Authenticated users can create photos"
      ON public.photos FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'photos' AND policyname = 'Authenticated users can delete photos') THEN
    CREATE POLICY "Authenticated users can delete photos"
      ON public.photos FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- 3. Ajustar políticas de storage
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload album photos') THEN
    CREATE POLICY "Authenticated users can upload album photos"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'album-photos');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can delete album photos') THEN
    CREATE POLICY "Authenticated users can delete album photos"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'album-photos');
  END IF;
END $$;
