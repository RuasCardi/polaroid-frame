-- 🔧 CORREÇÃO URGENTE - Restaurar capas dos álbuns
-- Execute este SQL no Supabase SQL Editor AGORA

-- 1. Ver o estado atual dos álbums e arquivos no storage
SELECT 
    a.id as album_id,
    a.title,
    a.cover_url,
    a.cover_storage_path,
    (SELECT COUNT(*) FROM storage.objects o WHERE o.name LIKE a.id || '/%') as files_count
FROM albums a
ORDER BY a.created_at DESC;

-- 2. Atualizar cover_storage_path e cover_url baseado nos arquivos que existem no storage
UPDATE albums a
SET 
    cover_storage_path = (
        SELECT o.name
        FROM storage.objects o
        WHERE o.bucket_id = 'album-photos'
          AND o.name LIKE a.id || '/%'
          AND (o.name LIKE '%cover%' OR o.name LIKE a.id || '/cover.%')
        ORDER BY o.created_at
        LIMIT 1
    ),
    cover_url = (
        SELECT 'https://' || current_setting('app.settings.supabase_url', true) || '/storage/v1/object/public/album-photos/' || o.name
        FROM storage.objects o
        WHERE o.bucket_id = 'album-photos'
          AND o.name LIKE a.id || '/%'
          AND (o.name LIKE '%cover%' OR o.name LIKE a.id || '/cover.%')
        ORDER BY o.created_at
        LIMIT 1
    )
WHERE (a.cover_storage_path IS NULL OR a.cover_url IS NULL);

-- 3. Se não encontrou cover específico, usar a primeira foto do álbum
UPDATE albums a
SET 
    cover_storage_path = COALESCE(a.cover_storage_path, (
        SELECT o.name
        FROM storage.objects o
        WHERE o.bucket_id = 'album-photos'
          AND o.name LIKE a.id || '/%'
        ORDER BY o.created_at
        LIMIT 1
    )),
    cover_url = COALESCE(a.cover_url, (
        SELECT 'https://' || current_setting('app.settings.supabase_url', true) || '/storage/v1/object/public/album-photos/' || o.name
        FROM storage.objects o
        WHERE o.bucket_id = 'album-photos'
          AND o.name LIKE a.id || '/%'
        ORDER BY o.created_at
        LIMIT 1
    ))
WHERE (a.cover_storage_path IS NULL OR a.cover_url IS NULL);

-- 4. Verificar o resultado
SELECT 
    id,
    title,
    cover_storage_path,
    CASE 
        WHEN cover_url IS NOT NULL THEN '✅ TEM URL'
        ELSE '❌ SEM URL'
    END as status
FROM albums
ORDER BY created_at DESC;

-- 5. Garantir que o bucket está público
UPDATE storage.buckets
SET public = true
WHERE name = 'album-photos';
