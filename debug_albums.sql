-- Script para debugar álbuns e suas capas
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar estrutura da tabela albums
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'albums'
ORDER BY ordinal_position;

-- 2. Ver todos os álbuns com suas capas
SELECT 
  id,
  title,
  slug,
  cover_url,
  cover_storage_path,
  photo_count,
  created_at
FROM albums
ORDER BY created_at DESC;

-- 3. Verificar arquivos no storage bucket album-photos
SELECT 
  name,
  id,
  bucket_id,
  created_at,
  updated_at,
  last_accessed_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'album-photos'
ORDER BY created_at DESC;

-- 4. Atualizar cover_storage_path baseado em cover_url (se necessário)
-- DESCOMENTE PARA EXECUTAR:
-- UPDATE albums
-- SET cover_storage_path = 
--   CASE 
--     WHEN cover_url LIKE '%/storage/v1/object/public/album-photos/%' THEN
--       SPLIT_PART(cover_url, '/storage/v1/object/public/album-photos/', 2)
--     ELSE cover_storage_path
--   END
-- WHERE cover_storage_path IS NULL AND cover_url IS NOT NULL;
