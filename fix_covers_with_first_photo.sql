-- 🔧 CORREÇÃO: Definir primeira foto como capa de cada álbum
-- Execute no Supabase SQL Editor

-- 1. Atualizar cover_storage_path e cover_url baseado na primeira foto de cada pasta
WITH first_photos AS (
  SELECT DISTINCT ON (SPLIT_PART(name, '/', 1))
    SPLIT_PART(name, '/', 1) as album_id,
    name as storage_path,
    'https://' || current_setting('app.settings.supabase_url', true) || '/storage/v1/object/public/album-photos/' || name as public_url
  FROM storage.objects
  WHERE bucket_id = 'album-photos'
  ORDER BY SPLIT_PART(name, '/', 1), created_at
)
UPDATE albums a
SET 
  cover_storage_path = fp.storage_path,
  cover_url = fp.public_url
FROM first_photos fp
WHERE a.id = fp.album_id::uuid
  AND (a.cover_storage_path IS NULL OR a.cover_url IS NULL);

-- 2. Verificar resultado
SELECT 
  a.id,
  a.title,
  a.cover_storage_path,
  CASE 
    WHEN a.cover_url IS NOT NULL THEN '✅'
    ELSE '❌'
  END as tem_capa
FROM albums a
ORDER BY a.created_at DESC;

-- 3. Garantir bucket público
UPDATE storage.buckets
SET public = true
WHERE name = 'album-photos';
