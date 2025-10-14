-- Add cover_storage_path column to albums for storing Supabase Storage key
ALTER TABLE public.albums
ADD COLUMN IF NOT EXISTS cover_storage_path TEXT;

-- Optional: backfill existing rows by deriving from photos table when possible
-- (manual update can be applied later if needed)
