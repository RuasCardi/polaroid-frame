-- Backfill cover_storage_path for existing albums using stored cover_url when available
UPDATE public.albums
SET cover_storage_path = split_part(cover_url, '/album-photos/', 2)
WHERE cover_storage_path IS NULL
  AND cover_url LIKE '%/album-photos/%';
