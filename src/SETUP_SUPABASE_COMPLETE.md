# 🚀 SETUP COMPLETO DO SUPABASE - INTELLIGEM

Este guia apresenta o passo a passo completo para configurar o Supabase para o projeto IntelliGem.

## 📋 PRÉ-REQUISITOS

1. ✅ Conta no Supabase criada
2. ✅ Projeto criado no Supabase
3. ✅ Variáveis de ambiente configuradas no projeto

## 🗄️ PASSO 1: CRIAR ESTRUTURA DO BANCO

### 1.1 Executar Script Principal
No **SQL Editor** do Supabase Dashboard, execute o conteúdo do arquivo:
```
supabase_setup.sql
```

### 1.2 Executar Tabelas Adicionais
Após executar o script principal, execute:
```
supabase_additional_tables.sql
```

## 📁 PASSO 2: CONFIGURAR STORAGE

### 2.1 Criar Buckets
Execute no **SQL Editor**:

```sql
-- Buckets para diferentes tipos de conteúdo
INSERT INTO storage.buckets (id, name, public) VALUES 
('blog-images-a91235ef', 'blog-images-a91235ef', false),
('case-images-a91235ef', 'case-images-a91235ef', false),
('site-assets-a91235ef', 'site-assets-a91235ef', false),
('site-images-a91235ef', 'site-images-a91235ef', false);
```

### 2.2 Configurar Políticas de Storage
```sql
-- Leitura pública para assets do site
CREATE POLICY "Public read access" ON storage.objects
    FOR SELECT USING (bucket_id IN ('blog-images-a91235ef', 'case-images-a91235ef', 'site-assets-a91235ef', 'site-images-a91235ef'));

-- Upload apenas para usuários autenticados
CREATE POLICY "Authenticated upload" ON storage.objects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Edição apenas para admins e service role
CREATE POLICY "Admin manage files" ON storage.objects
    FOR ALL USING (
        auth.role() = 'service_role' OR
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );
```

## 👤 PASSO 3: CRIAR USUÁRIO ADMIN

### 3.1 Registrar via Auth
1. Vá para **Authentication > Users**
2. Clique em **Add User**
3. Cadastre o email e senha do administrador
4. Anote o **User ID** gerado

### 3.2 Adicionar à Tabela admin_users
Execute no SQL Editor substituindo `USER_ID_AQUI`:

```sql
INSERT INTO admin_users (id, email, full_name, role, permissions) VALUES
(
    'USER_ID_AQUI', -- Substitua pelo ID do usuário criado
    'admin@intelligem.com.br',
    'Administrator',
    'admin',
    '{"blog": true, "cases": true, "newsletter": true, "settings": true, "users": true}'::jsonb
);
```

## 🔧 PASSO 4: CONFIGURAÇÕES INICIAIS

### 4.1 Dados de Exemplo (Opcional)
Para adicionar dados de exemplo para teste:

```sql
-- Artigo de exemplo
INSERT INTO blog_articles (title, excerpt, content, author, read_time, category, slug, published, featured, tags) VALUES
(
    'Bem-vindos ao Blog da IntelliGem',
    'Conheça nossa plataforma de conteúdo sobre dados, IA e automação.',
    '<h1>Bem-vindos ao Blog da IntelliGem</h1><p>Este é nosso primeiro artigo!</p>',
    'Equipe IntelliGem',
    '2 min',
    'Institucional',
    'bem-vindos-intelligem',
    true,
    true,
    ARRAY['institucional', 'bem-vindo']
);

-- Case de exemplo
INSERT INTO case_studies (title, excerpt, content, client, industry, challenge, solution, results, category, slug, published, featured, tags, metrics) VALUES
(
    'Transformação Digital de Sucesso',
    'Como ajudamos uma empresa a automatizar seus processos.',
    '<h1>Case de Sucesso</h1><p>Detalhes da implementação...</p>',
    'Empresa XYZ',
    'Tecnologia',
    'Processos manuais ineficientes',
    'Automação completa com GemFlow',
    ARRAY['50% redução no tempo', '300% aumento na produtividade'],
    'GemFlow',
    'transformacao-digital-sucesso',
    true,
    true,
    ARRAY['automação', 'gemflow'],
    '{"roi": "300%", "time_saved": "40h/week"}'::jsonb
);
```

## 🌐 PASSO 5: TESTAR CONEXÕES

### 5.1 Verificar Variáveis de Ambiente
Certifique-se de que estas variáveis estão configuradas:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico
```

### 5.2 Testar Edge Functions
As Edge Functions devem estar funcionando em:
```
https://seu-projeto.supabase.co/functions/v1/make-server-a91235ef/health
```

## 📊 PASSO 6: VERIFICAR FUNCIONALIDADES

### ✅ Checklist de Verificação:

- [ ] Tabelas criadas com sucesso
- [ ] RLS (Row Level Security) ativado
- [ ] Políticas de segurança aplicadas
- [ ] Buckets de storage criados
- [ ] Usuário admin criado e configurado
- [ ] Dados de exemplo inseridos (opcional)
- [ ] Edge Functions funcionando
- [ ] Frontend conectando com sucesso

## 🚨 SOLUÇÃO DE PROBLEMAS

### Erro: "table does not exist"
- Verifique se todos os scripts SQL foram executados
- Confirme que não houve erros durante a execução

### Erro: "RLS policy violation"
- Verifique se o usuário está autenticado
- Confirme se o usuário está na tabela `admin_users`

### Erro: "bucket does not exist"
- Execute novamente as configurações de storage
- Verifique se os buckets foram criados corretamente

### Erro de conexão
- Verifique as variáveis de ambiente
- Confirme se as chaves estão corretas

## 🎯 PRÓXIMOS PASSOS

Após completar este setup:

1. **Teste o login admin** na aplicação
2. **Verifique o blog e cases** funcionando
3. **Teste o sistema de reuniões**
4. **Configure integrações de email** (futuro)
5. **Implemente analytics avançados** (futuro)

---

## 📞 SUPORTE

Se encontrar problemas:
1. Verifique os logs do Supabase
2. Confirme todas as etapas deste guia
3. Teste as conexões uma por uma

**Status**: ✅ Implementação Completa - Pronto para Produção!