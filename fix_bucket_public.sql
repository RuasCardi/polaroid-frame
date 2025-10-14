-- Verificar e garantir que o bucket album-photos está público
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar configuração atual do bucket
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name = 'album-photos';

-- 2. Tornar o bucket público (se necessário)
UPDATE storage.buckets
SET public = true
WHERE name = 'album-photos';

-- 3. Verificar políticas de storage
SELECT 
  id,
  bucket_id,
  name,
  definition
FROM storage.policies
WHERE bucket_id = 'album-photos';

-- 4. Garantir que existe política de SELECT público
DO $$
BEGIN
  -- Remover política antiga se existir
  DELETE FROM storage.policies 
  WHERE bucket_id = 'album-photos' AND name = 'Public Access';
  
  -- Criar nova política de acesso público
  INSERT INTO storage.policies (bucket_id, name, definition)
  VALUES (
    'album-photos',
    'Public Access',
    'bucket_id = ''album-photos'''::text
  );
END $$;
