# 🚀 GUIA COMPLETO SUPABASE - INTELLIGEM
*Configuração passo a passo do Supabase para o projeto IntelliGem*

---

## 📋 PRÉ-REQUISITOS

### ✅ O que você precisa ter:
1. **Conta no Supabase** criada e ativa
2. **Projeto Supabase** criado
3. **Chaves de API** do Supabase (URL, Anon Key, Service Role Key)
4. **Conta no Resend** (para sistema de emails) - opcional

---

## 🗄️ PASSO 1: CONFIGURAR BANCO DE DADOS

### 1.1 Acessar o Supabase Dashboard
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto IntelliGem

### 1.2 Executar Scripts SQL
No **SQL Editor** do Supabase, execute os scripts na seguinte ordem:

#### **Script 1: Estrutura Principal**
```sql
-- Executar o conteúdo do arquivo: supabase_setup.sql
-- Este script cria todas as tabelas principais
```

#### **Script 2: Tabelas Adicionais**
```sql
-- Executar o conteúdo do arquivo: supabase_additional_tables.sql
-- Este script cria tabelas para emails e funcionalidades extras
```

#### **Script 3: Configurações de Storage**
```sql
-- Criar buckets para armazenamento de arquivos
INSERT INTO storage.buckets (id, name, public) VALUES 
('blog-images-a91235ef', 'blog-images-a91235ef', false),
('case-images-a91235ef', 'case-images-a91235ef', false),
('site-assets-a91235ef', 'site-assets-a91235ef', false),
('site-images-a91235ef', 'site-images-a91235ef', false);
```

#### **Script 4: Políticas de Segurança**
```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para blog_articles
CREATE POLICY "Public read published articles" ON blog_articles
    FOR SELECT USING (published = true);

CREATE POLICY "Admin full access articles" ON blog_articles
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- Políticas para case_studies
CREATE POLICY "Public read published cases" ON case_studies
    FOR SELECT USING (published = true);

CREATE POLICY "Admin full access cases" ON case_studies
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- Políticas para newsletter
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage subscribers" ON newsletter_subscribers
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- Políticas para contact_submissions
CREATE POLICY "Anyone can submit contact" ON contact_submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin read contacts" ON contact_submissions
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- Políticas para meeting_requests
CREATE POLICY "Anyone can create meeting" ON meeting_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage meetings" ON meeting_requests
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- Políticas para storage
CREATE POLICY "Public read access" ON storage.objects
    FOR SELECT USING (bucket_id IN ('blog-images-a91235ef', 'case-images-a91235ef', 'site-assets-a91235ef', 'site-images-a91235ef'));

CREATE POLICY "Authenticated upload" ON storage.objects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admin manage files" ON storage.objects
    FOR ALL USING (
        auth.role() = 'service_role' OR
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );
```

---

## 👤 PASSO 2: CRIAR USUÁRIO ADMINISTRADOR

### 2.1 Registrar Usuário via Auth
1. No Supabase Dashboard, vá para **Authentication > Users**
2. Clique em **Add User**
3. Preencha:
   - **Email**: `admin@intelligem.com.br`
   - **Password**: `[sua-senha-segura]`
   - **Email Confirm**: ✅ (marcado)
4. Clique em **Create User**
5. **ANOTE O USER ID** gerado (você precisará dele)

### 2.2 Adicionar à Tabela admin_users
Execute no SQL Editor substituindo `USER_ID_AQUI` pelo ID do usuário:

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

---

## ⚙️ PASSO 3: CONFIGURAR VARIÁVEIS DE AMBIENTE

### 3.1 Criar arquivo .env
Crie um arquivo `.env` na raiz do projeto com:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://abfowubusomlibuihqrz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiZm93dWJ1c29tbGlidWlocXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MDc3NDIsImV4cCI6MjA3NDM4Mzc0Mn0.-m8263Lv_RYqJhuaiy_VXP727h_KbucuNl1RMG2-ITk

# Supabase Service Role Key (para edge functions)
SUPABASE_URL=https://abfowubusomlibuihqrz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiZm93dWJ1c29tbGlidWlocXJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODgwNzc0MiwiZXhwIjoyMDc0MzgzNzQyfQ.YourServiceRoleKeyHere

# Resend API Key (para sistema de emails)
RESEND_API_KEY=your_resend_api_key_here
```

### 3.2 Obter Chaves do Supabase
1. No Supabase Dashboard, vá para **Settings > API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

---

## 📧 PASSO 4: CONFIGURAR SISTEMA DE EMAILS (OPCIONAL)

### 4.1 Criar Conta no Resend
1. Vá para [resend.com](https://resend.com)
2. Crie uma conta gratuita
3. Obtenha sua API Key
4. Substitua `your_resend_api_key_here` no arquivo `.env`

### 4.2 Configurar Domínio (Opcional)
Para emails mais profissionais:
1. No Resend, adicione seu domínio
2. Configure os registros DNS
3. Atualize as configurações de email no banco

---

## 🚀 PASSO 5: CONFIGURAR EDGE FUNCTIONS

### 5.1 Deploy das Edge Functions
1. No Supabase Dashboard, vá para **Edge Functions**
2. Clique em **Create a new function**
3. Nome: `make-server-a91235ef`
4. Cole o conteúdo do arquivo `src/supabase/functions/server/index.tsx`
5. Clique em **Deploy**

### 5.2 Configurar Variáveis de Ambiente
Na Edge Function, adicione:
- `SUPABASE_URL`: Sua URL do Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Sua chave de service role
- `RESEND_API_KEY`: Sua chave do Resend (se configurado)

---

## 📊 PASSO 6: DADOS INICIAIS

### 6.1 Configurações do Site
Execute no SQL Editor:

```sql
-- Configurações iniciais do site
INSERT INTO site_settings (key, value, type, category, description) VALUES
-- Hero Section
('hero_title', 'Transforme Dados em Decisões Inteligentes', 'text', 'hero', 'Título principal da seção hero'),
('hero_subtitle', 'Soluções completas em dados, automação e inteligência artificial para impulsionar o crescimento do seu negócio', 'text', 'hero', 'Subtítulo da seção hero'),
('hero_cta_text', 'Descubra Nossas Soluções', 'text', 'hero', 'Texto do botão CTA principal'),

-- About Section
('about_title', 'Sobre a IntelliGem', 'text', 'about', 'Título da seção sobre'),
('about_description', 'Somos especialistas em transformação digital, oferecendo soluções inovadoras em dados, automação e IA.', 'text', 'about', 'Descrição da empresa'),

-- Contact
('contact_email', 'contato@intelligem.com.br', 'text', 'contact', 'Email de contato principal'),
('contact_phone', '+55 (11) 9999-9999', 'text', 'contact', 'Telefone de contato'),

-- Newsletter
('newsletter_enabled', 'true', 'boolean', 'newsletter', 'Ativar/desativar newsletter'),
('newsletter_title', 'Receba insights exclusivos sobre dados e IA', 'text', 'newsletter', 'Título da seção newsletter');
```

### 6.2 Dados de Exemplo (Opcional)
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

---

## 🧪 PASSO 7: TESTAR CONFIGURAÇÃO

### 7.1 Testar Conexão
1. Execute o projeto: `npm run dev`
2. Acesse: `http://localhost:3000`
3. Verifique se não há erros no console

### 7.2 Testar Login Admin
1. Acesse a área administrativa
2. Faça login com: `admin@intelligem.com.br`
3. Verifique se consegue acessar o dashboard

### 7.3 Testar Funcionalidades
- ✅ Blog: Criar, editar, publicar artigos
- ✅ Cases: Gerenciar cases de sucesso
- ✅ Newsletter: Inscrições funcionando
- ✅ Reuniões: Formulário de agendamento
- ✅ Upload: Imagens sendo enviadas

---

## 🔧 PASSO 8: SOLUÇÃO DE PROBLEMAS

### ❌ Erro: "projectId is not defined"
**Solução**: Verifique se as importações estão corretas no `imageService.ts`

### ❌ Erro: "500 Internal Server Error"
**Solução**: 
1. Verifique as variáveis de ambiente
2. Confirme se as Edge Functions estão deployadas
3. Verifique os logs do Supabase

### ❌ Erro: "RLS policy violation"
**Solução**:
1. Confirme se o usuário está autenticado
2. Verifique se está na tabela `admin_users`
3. Confirme se as políticas RLS estão ativas

### ❌ Erro: "bucket does not exist"
**Solução**:
1. Execute novamente o script de criação de buckets
2. Verifique se os nomes estão corretos

---

## 📈 PASSO 9: OTIMIZAÇÕES

### 9.1 Configurar Índices
Execute para melhorar performance:

```sql
-- Índices para blog_articles
CREATE INDEX idx_blog_articles_published ON blog_articles(published, created_at DESC);
CREATE INDEX idx_blog_articles_featured ON blog_articles(featured) WHERE featured = true;
CREATE INDEX idx_blog_articles_category ON blog_articles(category);
CREATE INDEX idx_blog_articles_tags ON blog_articles USING GIN(tags);

-- Índices para case_studies
CREATE INDEX idx_case_studies_published ON case_studies(published, created_at DESC);
CREATE INDEX idx_case_studies_category ON case_studies(category);
CREATE INDEX idx_case_studies_featured ON case_studies(featured) WHERE featured = true;

-- Índices para newsletter
CREATE INDEX idx_newsletter_active ON newsletter_subscribers(active) WHERE active = true;
CREATE INDEX idx_newsletter_interests ON newsletter_subscribers USING GIN(interests);
```

### 9.2 Configurar Views Úteis
```sql
-- View de artigos publicados
CREATE VIEW published_articles AS
SELECT 
    id, title, subtitle, excerpt, author, date, read_time, 
    category, image_url, slug, tags, created_at, view_count
FROM blog_articles 
WHERE published = true 
ORDER BY created_at DESC;

-- View de cases com métricas
CREATE VIEW case_studies_summary AS
SELECT 
    id, title, excerpt, client, industry, category,
    image_url, slug, created_at,
    COALESCE(metrics->>'roi', 'N/A') as roi,
    COALESCE(metrics->>'time_saved', 'N/A') as time_saved,
    array_length(results, 1) as results_count
FROM case_studies 
WHERE published = true;
```

---

## ✅ CHECKLIST FINAL

### 🗄️ Banco de Dados
- [ ] Todas as tabelas criadas
- [ ] RLS ativado em todas as tabelas
- [ ] Políticas de segurança configuradas
- [ ] Índices de performance criados
- [ ] Views úteis configuradas

### 👤 Autenticação
- [ ] Usuário admin criado
- [ ] Usuário adicionado à tabela admin_users
- [ ] Login funcionando corretamente

### 📁 Storage
- [ ] Buckets criados
- [ ] Políticas de storage configuradas
- [ ] Upload de imagens funcionando

### ⚙️ Configuração
- [ ] Variáveis de ambiente configuradas
- [ ] Edge Functions deployadas
- [ ] Sistema de emails configurado (opcional)

### 🧪 Testes
- [ ] Conexão com banco funcionando
- [ ] Login admin funcionando
- [ ] Blog funcionando
- [ ] Cases funcionando
- [ ] Newsletter funcionando
- [ ] Sistema de reuniões funcionando

---

## 🎯 PRÓXIMOS PASSOS

Após completar a configuração:

1. **Migrar dados existentes** do localStorage (se houver)
2. **Configurar domínio personalizado** para emails
3. **Implementar analytics avançados**
4. **Configurar backup automático**
5. **Otimizar performance** com cache

---

## 📞 SUPORTE

Se encontrar problemas:

1. **Verifique os logs** do Supabase Dashboard
2. **Confirme todas as etapas** deste guia
3. **Teste as conexões** uma por uma
4. **Verifique as variáveis** de ambiente

---

## 🎉 PARABÉNS!

Se você chegou até aqui, seu Supabase está **100% configurado** e pronto para produção! 

**Status**: ✅ **IMPLEMENTAÇÃO COMPLETA** - Sistema pronto para uso! 🚀

---

*Guia criado para o projeto IntelliGem - Powered by Supabase* 💎
