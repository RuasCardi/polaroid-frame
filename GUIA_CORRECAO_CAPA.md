# 🔧 GUIA DE CORREÇÃO - CAPA DO ÁLBUM NA GALERIA

## ✅ O que foi feito agora:

### 1. **PolaroidCard.tsx** - Adicionado logging detalhado
- Agora mostra EXATAMENTE qual URL está sendo usada
- Logs em cada etapa da resolução da capa
- Indica se está usando cover_storage_path ou cover_url

### 2. **Admin.tsx** - Confirmação de upload
- Logs detalhados quando a capa é criada
- Confirma quando o álbum é atualizado com cover_url e cover_storage_path

### 3. **Galeria.tsx** - Logging de dados carregados
- Mostra todos os álbuns carregados do banco
- Exibe cover_url e cover_storage_path de cada álbum

---

## 🚀 PASSOS PARA RESOLVER AGORA:

### PASSO 1: Execute o SQL no Supabase
Abra o **SQL Editor** do Supabase e execute:

```sql
-- 1. Tornar o bucket público
UPDATE storage.buckets
SET public = true
WHERE name = 'album-photos';

-- 2. Verificar se os álbuns têm cover_storage_path
SELECT 
  id,
  title,
  cover_url,
  cover_storage_path
FROM albums
ORDER BY created_at DESC;

-- 3. SE cover_storage_path estiver NULL, atualizar:
UPDATE albums
SET cover_storage_path = 
  CASE 
    WHEN cover_url LIKE '%/storage/v1/object/public/album-photos/%' THEN
      SPLIT_PART(cover_url, '/storage/v1/object/public/album-photos/', 2)
    ELSE cover_storage_path
  END
WHERE cover_storage_path IS NULL AND cover_url IS NOT NULL;

-- 4. Confirmar a atualização
SELECT 
  id,
  title,
  cover_storage_path
FROM albums;
```

### PASSO 2: Abra o navegador com DevTools
1. Abra http://localhost:8080/galeria
2. Pressione **F12** para abrir o Console
3. **Recarregue a página** (Ctrl+Shift+R)

### PASSO 3: Analise os logs no Console
Você verá logs como:

```
📚 ÁLBUNS CARREGADOS NA GALERIA: [...]
📖 Álbum: Nome do Álbum { id: '...', cover_url: '...', cover_storage_path: '...' }
🔍 PolaroidCard - Resolvendo capa para álbum: { ... }
✅ URL gerada via cover_storage_path: https://...
🖼️ URL da capa resolvida: https://...
📸 PolaroidCard renderizando: { albumTitle: '...', coverUsado: 'https://...' }
```

### PASSO 4: Identifique o problema pelos logs

#### ❌ Se aparecer "Nenhuma URL de capa resolvida":
→ **Problema**: cover_storage_path e cover_url estão vazios no banco
→ **Solução**: Execute o PASSO 1 novamente

#### ❌ Se aparecer URL mas a imagem falha (erro 404):
→ **Problema**: Arquivo não existe no storage
→ **Solução**: Recrie o álbum no Admin com nova capa

#### ❌ Se aparecer URL mas a imagem falha (erro 403):
→ **Problema**: Bucket não está público
→ **Solução**: Execute o PASSO 1 novamente

---

## 🔍 DEBUG ADICIONAL

### Ver arquivos no Storage:
No Supabase, vá em **Storage** → **album-photos** e verifique se os arquivos existem.

### Testar URL diretamente:
Copie a URL do log e cole no navegador. Se não carregar, o problema é no Storage/Supabase.

### Criar novo álbum de teste:
1. Vá em /admin
2. Crie um novo álbum com uma imagem de capa
3. Veja os logs no console:
   ```
   ✅ CAPA CRIADA: { albumId: '...', filePath: '...', publicUrl: '...' }
   ✅ ÁLBUM ATUALIZADO COM CAPA: { ... }
   ```
4. Vá em /galeria e veja se aparece

---

## 📝 CHECKLIST FINAL

- [ ] Bucket `album-photos` está **público** (public = true)
- [ ] Tabela `albums` tem coluna **cover_storage_path**
- [ ] Álbuns no banco têm **cover_storage_path** preenchido
- [ ] DevTools Console está aberto ao carregar /galeria
- [ ] Logs mostram URLs sendo geradas
- [ ] URLs testadas diretamente no navegador carregam

---

## 🆘 SE AINDA NÃO FUNCIONAR

Me envie a saída do Console (os logs com emojis) e executarei:
```sql
SELECT * FROM albums ORDER BY created_at DESC LIMIT 1;
```

E também verifique no Storage se o arquivo realmente existe!
