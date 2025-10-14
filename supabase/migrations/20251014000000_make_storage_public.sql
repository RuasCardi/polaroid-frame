-- Tornar o bucket album-photos público para permitir acesso às imagens
UPDATE storage.buckets 
SET public = true 
WHERE id = 'album-photos';

-- Verificar se foi atualizado (apenas para confirmar)
-- SELECT id, name, public FROM storage.buckets WHERE id = 'album-photos';
