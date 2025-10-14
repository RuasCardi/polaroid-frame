-- 🔧 SOLUÇÃO SIMPLES - Use este se o outro não funcionar
-- Execute no Supabase SQL Editor

-- 1. Ver quais arquivos existem no storage
SELECT 
    bucket_id,
    name,
    created_at
FROM storage.objects
WHERE bucket_id = 'album-photos'
ORDER BY created_at DESC;

-- 2. Para cada álbum que apareceu nos logs, atualize manualmente:
-- Substitua 'ALBUM_ID' pelo ID do álbum
-- Substitua 'CAMINHO_DO_ARQUIVO' pelo caminho do arquivo no storage

-- Exemplo para o álbum "xsx\":
UPDATE albums
SET 
    cover_storage_path = 'd229f719-38a9-4f01-bbbb-dc15d0205231/cover.jpg',
    cover_url = 'https://SEU_PROJETO.supabase.co/storage/v1/object/public/album-photos/d229f719-38a9-4f01-bbbb-dc15d0205231/cover.jpg'
WHERE id = 'd229f719-38a9-4f01-bbbb-dc15d0205231';

-- Repita para cada álbum...

-- OU SIMPLESMENTE DELETE OS ÁLBUNS SEM CAPA E RECRIE NO ADMIN:
-- DELETE FROM albums WHERE cover_storage_path IS NULL;
