# Como aplicar a correção do RLS para criar álbuns

## Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse https://supabase.com/dashboard
2. Entre no seu projeto (`xomspycopubwulpwvgby`)
3. Vá em **SQL Editor** (no menu lateral)
4. Cole o conteúdo do arquivo `/supabase/migrations/20251013150000_fix_admin_whitelist_rls.sql`
5. Clique em **Run** para executar

## Opção 2: Via Supabase CLI

```bash
# Se você tem o Supabase CLI instalado:
cd /home/guilherme-cardinalli/polaroid-frame
supabase db push
```

## O que essa correção faz:

- Remove as políticas RLS que exigem o papel `admin` na tabela `user_roles`
- Cria novas políticas que permitem qualquer usuário **autenticado** criar/editar/deletar álbuns e fotos
- A proteção de admin agora acontece no front-end (via whitelist de emails no .env)
- Álbuns criados aparecerão automaticamente na galeria pública

## Depois de aplicar:

1. Recarregue a página do admin
2. Tente criar um novo álbum
3. O erro deve desaparecer e o álbum será criado com sucesso
4. O álbum aparecerá automaticamente na página /galeria
