# 🏗️ ESTRUTURA SUPABASE - INTELLIGEM
*Banco de dados otimizado para o ecossistema IntelliGem*

---

## 📋 VISÃO GERAL DO PROJETO

### **Funcionalidades Atuais:**
- ✅ **Blog corporativo** com editor rico
- ✅ **Cases de sucesso** das soluções (GemFlow, GemInsights, GemMind)
- ✅ **Sistema de upload** de imagens (Supabase Storage)
- ✅ **Newsletter** para captação de leads
- ✅ **Painel administrativo** completo
- ✅ **Autenticação** para administradores
- ✅ **Site institucional** responsivo

### **Stack Tecnológico:**
- **Frontend:** React + TypeScript + Tailwind v4 + Vite
- **Backend:** Supabase (PostgreSQL + Storage + Auth + Edge Functions)
- **Editor:** RichTextEditor customizado (substituindo ReactQuill)
- **Deploy:** Netlify + Netlify Functions
- **Tema:** Sistema dark/light integrado

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### **1. TABELA `blog_articles` (Artigos do Blog)**

```sql
CREATE TABLE blog_articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,                    -- Título do artigo
    subtitle VARCHAR(500),                          -- Subtítulo opcional
    excerpt TEXT NOT NULL,                          -- Resumo para listagens
    content TEXT NOT NULL,                          -- Conteúdo HTML do editor
    author VARCHAR(100) NOT NULL,                   -- Nome do autor
    date DATE NOT NULL DEFAULT CURRENT_DATE,        -- Data de publicação
    read_time VARCHAR(20) NOT NULL,                 -- Ex: "5 min", calculado automaticamente
    category VARCHAR(50) NOT NULL,                  -- "Tendências", "IA", "Automação", etc.
    image_url TEXT,                                 -- URL da imagem de destaque
    featured BOOLEAN DEFAULT FALSE,                 -- Artigo em destaque na home
    published BOOLEAN DEFAULT FALSE,                -- Status de publicação
    slug VARCHAR(300) UNIQUE NOT NULL,              -- URL amigável gerada do título
    tags TEXT[] DEFAULT '{}',                       -- Array de tags para filtros
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- SEO e Analytics (futuro)
    meta_description TEXT,
    meta_keywords TEXT[],
    view_count INTEGER DEFAULT 0,
    
    -- Validações
    CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT valid_read_time CHECK (read_time ~ '^\d+ min$')
);
```

### **2. TABELA `case_studies` (Cases de Sucesso)**

```sql
CREATE TABLE case_studies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,                    -- Título do case
    excerpt TEXT NOT NULL,                          -- Resumo executivo
    content TEXT NOT NULL,                          -- Conteúdo detalhado HTML
    
    -- Informações do Cliente
    client VARCHAR(150) NOT NULL,                   -- Nome do cliente
    industry VARCHAR(100) NOT NULL,                 -- Setor/Indústria
    
    -- Estrutura do Case
    challenge TEXT NOT NULL,                        -- Desafio enfrentado
    solution TEXT NOT NULL,                         -- Solução implementada
    results TEXT[] NOT NULL,                        -- Array de resultados obtidos
    
    -- Classificação
    category VARCHAR(20) NOT NULL                   -- 'GemFlow', 'GemInsights', 'GemMind'
        CHECK (category IN ('GemFlow', 'GemInsights', 'GemMind')),
    
    -- Métricas de Impacto
    metrics JSONB DEFAULT '{}',                     -- Ex: {"roi": "400%", "time_saved": "40h/week"}
    
    -- Mídia e Apresentação
    image_url TEXT,                                 -- Imagem principal
    featured BOOLEAN DEFAULT FALSE,                 -- Case em destaque
    published BOOLEAN DEFAULT FALSE,                -- Visível publicamente
    
    -- SEO
    slug VARCHAR(300) UNIQUE NOT NULL,
    tags TEXT[] DEFAULT '{}',
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    conversion_source VARCHAR(50),                  -- Origem do lead gerado
    
    CONSTRAINT valid_case_slug CHECK (slug ~ '^[a-z0-9-]+$')
);
```

### **3. TABELA `newsletter_subscribers` (Newsletter)**

```sql
CREATE TABLE newsletter_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Status de Inscrição
    active BOOLEAN DEFAULT TRUE,
    confirmed BOOLEAN DEFAULT FALSE,                -- Confirmação por email (futuro)
    
    -- Segmentação
    interests TEXT[] DEFAULT '{}',                  -- ['BI', 'Automação', 'IA']
    source VARCHAR(50),                             -- Origem da inscrição
    
    -- Metadados
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    
    -- Validação
    CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);
```

### **4. TABELA `site_settings` (Configurações do Site)**

```sql
CREATE TABLE site_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,               -- Ex: 'hero_title', 'cta_text'
    value TEXT,                                     -- Valor da configuração
    type VARCHAR(20) DEFAULT 'text',                -- 'text', 'json', 'boolean', 'number'
    category VARCHAR(50),                           -- 'hero', 'about', 'solutions', 'contact'
    description TEXT,                               -- Descrição da configuração
    
    -- Controle
    editable BOOLEAN DEFAULT TRUE,                  -- Pode ser editado pelo admin
    active BOOLEAN DEFAULT TRUE,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_setting_type CHECK (type IN ('text', 'json', 'boolean', 'number', 'url'))
);
```

### **5. TABELA `media_files` (Gerenciamento de Mídia)**

```sql
CREATE TABLE media_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,                        -- Caminho no Supabase Storage
    file_size INTEGER NOT NULL,                     -- Tamanho em bytes
    mime_type VARCHAR(100) NOT NULL,
    
    -- Categorização
    bucket_name VARCHAR(50) NOT NULL,               -- 'blog-images', 'case-images', etc.
    category VARCHAR(50),                           -- 'article', 'case', 'site', 'upload'
    
    -- Relacionamentos
    used_in_table VARCHAR(50),                      -- 'blog_articles', 'case_studies'
    used_in_id UUID,                                -- ID do registro que usa o arquivo
    
    -- Metadados de Imagem (para imagens)
    image_width INTEGER,
    image_height INTEGER,
    alt_text TEXT,
    
    -- Controle
    public_url TEXT,                                -- URL pública gerada
    active BOOLEAN DEFAULT TRUE,
    
    -- Metadados
    uploaded_by UUID,                               -- ID do usuário que fez upload
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_mime_type CHECK (
        mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf', 'video/mp4')
    )
);
```

### **6. TABELA `admin_users` (Usuários Administrativos)**

```sql
CREATE TABLE admin_users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    
    -- Permissões
    role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
    permissions JSONB DEFAULT '{"blog": true, "cases": true, "newsletter": false, "settings": false}',
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **7. TABELA `contact_submissions` (Formulários de Contato)**

```sql
CREATE TABLE contact_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Dados do Contato
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(150),
    phone VARCHAR(20),
    
    -- Interesse
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    interested_solution VARCHAR(20),                -- 'GemFlow', 'GemInsights', 'GemMind', 'All'
    
    -- Tracking
    source VARCHAR(50),                             -- 'website', 'blog', 'case_study'
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Status
    status VARCHAR(20) DEFAULT 'new'                -- 'new', 'contacted', 'qualified', 'closed'
        CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
    
    -- Metadados
    ip_address INET,
    user_agent TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_contact_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);
```

### **8. TABELA `meeting_requests` (Solicitações de Reunião)** ⭐ **NOVA**

```sql
CREATE TABLE meeting_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Dados do Contato
    contact_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    
    -- Interesse e Tipo de Reunião
    interested_solution VARCHAR(20) NOT NULL        -- 'GemFlow', 'GemInsights', 'GemMind', 'All'
        CHECK (interested_solution IN ('GemFlow', 'GemInsights', 'GemMind', 'All')),
    meeting_type VARCHAR(20) NOT NULL               -- 'demo', 'consultation', 'technical'
        CHECK (meeting_type IN ('demo', 'consultation', 'technical')),
    
    -- Agendamento
    preferred_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_meeting_time TIMESTAMP WITH TIME ZONE,   -- Horário real confirmado (pode diferir do preferido)
    meeting_duration INTEGER DEFAULT 30,            -- Duração em minutos
    
    -- Detalhes Adicionais
    specific_challenges TEXT,                       -- Desafios específicos mencionados
    preparation_notes TEXT,                         -- Notas para preparação da reunião
    
    -- Status e Workflow
    status VARCHAR(20) DEFAULT 'pending'            -- 'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
        CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    
    -- Tracking e Analytics
    source_page VARCHAR(50) NOT NULL,               -- 'hero-section', 'cta-section', 'gemflow-page', etc.
    qualification_score INTEGER,                    -- Score de qualificação (1-10)
    lead_quality VARCHAR(20),                       -- 'hot', 'warm', 'cold'
    
    -- Integração com Calendário
    calendar_event_id VARCHAR(255),                 -- ID do evento no Google Calendar/Outlook
    meeting_link TEXT,                              -- Link da reunião (Google Meet, Zoom, etc.)
    
    -- Follow-up e Resultados
    follow_up_required BOOLEAN DEFAULT TRUE,
    meeting_outcome VARCHAR(50),                    -- 'proposal_sent', 'not_interested', 'follow_up_scheduled'
    proposal_value DECIMAL(10,2),                   -- Valor estimado da proposta
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Relacionamentos
    assigned_to UUID REFERENCES admin_users(id),    -- Responsável pela reunião
    related_case_study_id UUID,                     -- Case relacionado mostrado na reunião
    
    -- Validações
    CONSTRAINT valid_meeting_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}

### **Estrutura de Buckets:**

```sql
-- 1. IMAGENS DO BLOG
CREATE BUCKET blog-images;
-- Estrutura: /articles/{article-id}/{filename}
--           /featured/{filename}
--           /thumbnails/{filename}

-- 2. IMAGENS DOS CASES
CREATE BUCKET case-images;
-- Estrutura: /cases/{case-id}/{filename}
--           /results-charts/{filename}
--           /before-after/{filename}

-- 3. IMAGENS DO SITE
CREATE BUCKET site-assets;
-- Estrutura: /logos/{filename}
--           /hero/{filename}
--           /solutions/{filename}
--           /team/{filename}

-- 4. UPLOADS GERAIS
CREATE BUCKET uploads;
-- Estrutura: /temp/{user-id}/{filename}
--           /documents/{filename}
```

### **Políticas de Storage:**

```sql
-- Leitura pública para assets do site
CREATE POLICY "Public read access" ON storage.objects
    FOR SELECT USING (bucket_id IN ('blog-images', 'case-images', 'site-assets'));

-- Upload apenas para usuários autenticados
CREATE POLICY "Authenticated upload" ON storage.objects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Edição apenas para admins
CREATE POLICY "Admin manage files" ON storage.objects
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );
```

---

## 🔧 FUNÇÕES AUXILIARES

### **1. Trigger para Updated_At:**

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar em todas as tabelas relevantes
CREATE TRIGGER update_blog_articles_updated_at BEFORE UPDATE ON blog_articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_studies_updated_at BEFORE UPDATE ON case_studies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **2. Função para Gerar Slugs:**

```sql
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                unaccent(input_text), 
                '[^a-zA-Z0-9\s]', '', 'g'
            ), 
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 ÍNDICES PARA PERFORMANCE

```sql
-- Blog Articles
CREATE INDEX idx_blog_articles_published ON blog_articles(published, created_at DESC);
CREATE INDEX idx_blog_articles_featured ON blog_articles(featured) WHERE featured = true;
CREATE INDEX idx_blog_articles_category ON blog_articles(category);
CREATE INDEX idx_blog_articles_tags ON blog_articles USING GIN(tags);
CREATE INDEX idx_blog_articles_search ON blog_articles USING GIN(to_tsvector('portuguese', title || ' ' || excerpt));

-- Case Studies
CREATE INDEX idx_case_studies_published ON case_studies(published, created_at DESC);
CREATE INDEX idx_case_studies_category ON case_studies(category);
CREATE INDEX idx_case_studies_featured ON case_studies(featured) WHERE featured = true;
CREATE INDEX idx_case_studies_industry ON case_studies(industry);

-- Newsletter
CREATE INDEX idx_newsletter_active ON newsletter_subscribers(active) WHERE active = true;
CREATE INDEX idx_newsletter_interests ON newsletter_subscribers USING GIN(interests);

-- Media Files
CREATE INDEX idx_media_files_category ON media_files(category, bucket_name);
CREATE INDEX idx_media_files_usage ON media_files(used_in_table, used_in_id);

-- Contact Submissions
CREATE INDEX idx_contact_status ON contact_submissions(status, submitted_at DESC);
CREATE INDEX idx_contact_source ON contact_submissions(source, submitted_at DESC);
```

---

## 📝 VIEWS ÚTEIS

### **1. View de Artigos Publicados:**

```sql
CREATE VIEW published_articles AS
SELECT 
    id, title, subtitle, excerpt, author, date, read_time, 
    category, image_url, slug, tags, created_at,
    view_count
FROM blog_articles 
WHERE published = true 
ORDER BY created_at DESC;
```

### **2. View de Cases com Métricas:**

```sql
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

### **3. View de Analytics do Site:**

```sql
CREATE VIEW site_analytics AS
SELECT 
    'articles' as content_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE published = true) as published_count,
    COUNT(*) FILTER (WHERE featured = true) as featured_count,
    SUM(view_count) as total_views
FROM blog_articles
UNION ALL
SELECT 
    'cases' as content_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE published = true) as published_count,
    COUNT(*) FILTER (WHERE featured = true) as featured_count,
    SUM(view_count) as total_views
FROM case_studies;
```

---

## 🔐 ROW LEVEL SECURITY (RLS)

### **Políticas de Segurança:**

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- BLOG ARTICLES
CREATE POLICY "Public read published articles" ON blog_articles
    FOR SELECT USING (published = true);

CREATE POLICY "Admin full access articles" ON blog_articles
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- CASE STUDIES
CREATE POLICY "Public read published cases" ON case_studies
    FOR SELECT USING (published = true);

CREATE POLICY "Admin full access cases" ON case_studies
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- NEWSLETTER
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage subscribers" ON newsletter_subscribers
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- CONTACT SUBMISSIONS
CREATE POLICY "Anyone can submit contact" ON contact_submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin read contacts" ON contact_submissions
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );
```

---

## 🚀 DADOS INICIAIS

### **Configurações do Site:**

```sql
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

### **Usuário Admin Inicial:**

```sql
-- Será criado via Supabase Auth e depois vinculado
INSERT INTO admin_users (id, email, full_name, role, permissions) VALUES
(
    'uuid-do-usuario-criado-no-auth',
    'admin@intelligem.com.br',
    'Administrator',
    'admin',
    '{"blog": true, "cases": true, "newsletter": true, "settings": true, "users": true}'
);
```

---

## 📈 PLANO DE MIGRAÇÃO

### **Fase 1: Estrutura Base**
1. ✅ Criar tabelas principais
2. ✅ Configurar RLS e políticas
3. ✅ Configurar buckets de storage
4. ✅ Implementar triggers e funções

### **Fase 2: Migração de Dados**
1. ✅ Migrar artigos do localStorage para `blog_articles`
2. ✅ Migrar cases do localStorage para `case_studies`  
3. ✅ Migrar imagens para Supabase Storage
4. ✅ Configurar settings iniciais

### **Fase 3: Integração Frontend**
1. ✅ Atualizar `blogService.ts` para usar Supabase
2. ✅ Atualizar `casesService.ts` para usar Supabase
3. ✅ Implementar `settingsService.ts`
4. ✅ Atualizar componentes para nova estrutura

### **Fase 4: Funcionalidades Avançadas**
1. 🔄 Sistema de analytics
2. 🔄 Integração com email marketing  
3. 🔄 Sistema de notificações
4. 🔄 Dashboard de métricas

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. **Executar Scripts SQL** no Supabase Dashboard
2. **Configurar Storage Buckets** com políticas adequadas
3. **Migrar Dados Existentes** do localStorage
4. **Atualizar Services** para usar Supabase
5. **Implementar Sistema de Configurações** do site
6. **Adicionar Analytics Básico** (views, conversões)

    CONSTRAINT valid_qualification_score CHECK (qualification_score >= 1 AND qualification_score <= 10),
    CONSTRAINT valid_meeting_time CHECK (preferred_time > NOW())
);
```

---

## 📧 SISTEMA DE E-MAILS AUTOMATIZADOS

### **🎯 VISÃO GERAL**

O sistema de e-mails automatizados complementa o formulário de agendamento, enviando:
1. **E-mail de notificação** para `intelligemconsultoria@gmail.com`
2. **E-mail de confirmação** para o cliente

### **📋 TABELAS ADICIONAIS NECESSÁRIAS**

#### **1. TABELA `email_notifications` (Log de E-mails Enviados)**

```sql
CREATE TABLE email_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Identificação do E-mail
    email_type VARCHAR(30) NOT NULL                 -- 'meeting_notification', 'meeting_confirmation', 'newsletter', 'follow_up'
        CHECK (email_type IN ('meeting_notification', 'meeting_confirmation', 'newsletter', 'follow_up', 'reminder')),
    
    -- Destinatário
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(150),
    
    -- Conteúdo
    subject TEXT NOT NULL,
    email_content TEXT NOT NULL,                    -- HTML/texto do e-mail enviado
    template_used VARCHAR(50),                      -- Nome do template utilizado
    
    -- Relacionamentos
    related_meeting_id UUID REFERENCES meeting_requests(id) ON DELETE SET NULL,
    related_contact_id UUID REFERENCES contact_submissions(id) ON DELETE SET NULL,
    related_newsletter_id UUID REFERENCES newsletter_subscribers(id) ON DELETE SET NULL,
    
    -- Status e Delivery
    status VARCHAR(20) DEFAULT 'pending'            -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
        CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked')),
    provider_response JSONB,                        -- Resposta do provedor (Resend, SendGrid, etc.)
    provider_message_id TEXT,                       -- ID único do provedor
    
    -- Tracking e Analytics
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    first_clicked_at TIMESTAMP WITH TIME ZONE,
    bounce_reason TEXT,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Configuração
    priority INTEGER DEFAULT 5,                     -- 1=alta, 5=normal, 10=baixa
    
    CONSTRAINT valid_email_recipient CHECK (recipient_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}

### **Estrutura de Buckets:**

```sql
-- 1. IMAGENS DO BLOG
CREATE BUCKET blog-images;
-- Estrutura: /articles/{article-id}/{filename}
--           /featured/{filename}
--           /thumbnails/{filename}

-- 2. IMAGENS DOS CASES
CREATE BUCKET case-images;
-- Estrutura: /cases/{case-id}/{filename}
--           /results-charts/{filename}
--           /before-after/{filename}

-- 3. IMAGENS DO SITE
CREATE BUCKET site-assets;
-- Estrutura: /logos/{filename}
--           /hero/{filename}
--           /solutions/{filename}
--           /team/{filename}

-- 4. UPLOADS GERAIS
CREATE BUCKET uploads;
-- Estrutura: /temp/{user-id}/{filename}
--           /documents/{filename}
```

### **Políticas de Storage:**

```sql
-- Leitura pública para assets do site
CREATE POLICY "Public read access" ON storage.objects
    FOR SELECT USING (bucket_id IN ('blog-images', 'case-images', 'site-assets'));

-- Upload apenas para usuários autenticados
CREATE POLICY "Authenticated upload" ON storage.objects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Edição apenas para admins
CREATE POLICY "Admin manage files" ON storage.objects
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );
```

---

## 🔧 FUNÇÕES AUXILIARES

### **1. Trigger para Updated_At:**

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar em todas as tabelas relevantes
CREATE TRIGGER update_blog_articles_updated_at BEFORE UPDATE ON blog_articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_studies_updated_at BEFORE UPDATE ON case_studies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **2. Função para Gerar Slugs:**

```sql
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                unaccent(input_text), 
                '[^a-zA-Z0-9\s]', '', 'g'
            ), 
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 ÍNDICES PARA PERFORMANCE

```sql
-- Blog Articles
CREATE INDEX idx_blog_articles_published ON blog_articles(published, created_at DESC);
CREATE INDEX idx_blog_articles_featured ON blog_articles(featured) WHERE featured = true;
CREATE INDEX idx_blog_articles_category ON blog_articles(category);
CREATE INDEX idx_blog_articles_tags ON blog_articles USING GIN(tags);
CREATE INDEX idx_blog_articles_search ON blog_articles USING GIN(to_tsvector('portuguese', title || ' ' || excerpt));

-- Case Studies
CREATE INDEX idx_case_studies_published ON case_studies(published, created_at DESC);
CREATE INDEX idx_case_studies_category ON case_studies(category);
CREATE INDEX idx_case_studies_featured ON case_studies(featured) WHERE featured = true;
CREATE INDEX idx_case_studies_industry ON case_studies(industry);

-- Newsletter
CREATE INDEX idx_newsletter_active ON newsletter_subscribers(active) WHERE active = true;
CREATE INDEX idx_newsletter_interests ON newsletter_subscribers USING GIN(interests);

-- Media Files
CREATE INDEX idx_media_files_category ON media_files(category, bucket_name);
CREATE INDEX idx_media_files_usage ON media_files(used_in_table, used_in_id);

-- Contact Submissions
CREATE INDEX idx_contact_status ON contact_submissions(status, submitted_at DESC);
CREATE INDEX idx_contact_source ON contact_submissions(source, submitted_at DESC);
```

---

## 📝 VIEWS ÚTEIS

### **1. View de Artigos Publicados:**

```sql
CREATE VIEW published_articles AS
SELECT 
    id, title, subtitle, excerpt, author, date, read_time, 
    category, image_url, slug, tags, created_at,
    view_count
FROM blog_articles 
WHERE published = true 
ORDER BY created_at DESC;
```

### **2. View de Cases com Métricas:**

```sql
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

### **3. View de Analytics do Site:**

```sql
CREATE VIEW site_analytics AS
SELECT 
    'articles' as content_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE published = true) as published_count,
    COUNT(*) FILTER (WHERE featured = true) as featured_count,
    SUM(view_count) as total_views
FROM blog_articles
UNION ALL
SELECT 
    'cases' as content_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE published = true) as published_count,
    COUNT(*) FILTER (WHERE featured = true) as featured_count,
    SUM(view_count) as total_views
FROM case_studies;
```

---

## 🔐 ROW LEVEL SECURITY (RLS)

### **Políticas de Segurança:**

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- BLOG ARTICLES
CREATE POLICY "Public read published articles" ON blog_articles
    FOR SELECT USING (published = true);

CREATE POLICY "Admin full access articles" ON blog_articles
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- CASE STUDIES
CREATE POLICY "Public read published cases" ON case_studies
    FOR SELECT USING (published = true);

CREATE POLICY "Admin full access cases" ON case_studies
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- NEWSLETTER
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage subscribers" ON newsletter_subscribers
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- CONTACT SUBMISSIONS
CREATE POLICY "Anyone can submit contact" ON contact_submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin read contacts" ON contact_submissions
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );
```

---

## 🚀 DADOS INICIAIS

### **Configurações do Site:**

```sql
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

### **Usuário Admin Inicial:**

```sql
-- Será criado via Supabase Auth e depois vinculado
INSERT INTO admin_users (id, email, full_name, role, permissions) VALUES
(
    'uuid-do-usuario-criado-no-auth',
    'admin@intelligem.com.br',
    'Administrator',
    'admin',
    '{"blog": true, "cases": true, "newsletter": true, "settings": true, "users": true}'
);
```

---

## 📈 PLANO DE MIGRAÇÃO

### **Fase 1: Estrutura Base**
1. ✅ Criar tabelas principais
2. ✅ Configurar RLS e políticas
3. ✅ Configurar buckets de storage
4. ✅ Implementar triggers e funções

### **Fase 2: Migração de Dados**
1. ✅ Migrar artigos do localStorage para `blog_articles`
2. ✅ Migrar cases do localStorage para `case_studies`  
3. ✅ Migrar imagens para Supabase Storage
4. ✅ Configurar settings iniciais

### **Fase 3: Integração Frontend**
1. ✅ Atualizar `blogService.ts` para usar Supabase
2. ✅ Atualizar `casesService.ts` para usar Supabase
3. ✅ Implementar `settingsService.ts`
4. ✅ Atualizar componentes para nova estrutura

### **Fase 4: Funcionalidades Avançadas**
1. 🔄 Sistema de analytics
2. 🔄 Integração com email marketing  
3. 🔄 Sistema de notificações
4. 🔄 Dashboard de métricas

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. **Executar Scripts SQL** no Supabase Dashboard
2. **Configurar Storage Buckets** com políticas adequadas
3. **Migrar Dados Existentes** do localStorage
4. **Atualizar Services** para usar Supabase
5. **Implementar Sistema de Configurações** do site
6. **Adicionar Analytics Básico** (views, conversões)
7. ⭐ **Implementar Sistema de E-mails** (nova prioridade alta)

Esta estrutura fornece uma base sólida e escalável para o crescimento da IntelliGem, mantendo a flexibilidade para futuras expansões! 🚀

```sql
CREATE TABLE email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Identificação
    template_name VARCHAR(50) UNIQUE NOT NULL,      -- 'meeting_notification', 'meeting_confirmation'
    template_type VARCHAR(30) NOT NULL              -- Mesmo enum da tabela email_notifications
        CHECK (template_type IN ('meeting_notification', 'meeting_confirmation', 'newsletter', 'follow_up', 'reminder')),
    
    -- Conteúdo do Template
    subject_template TEXT NOT NULL,                 -- Ex: "🗓️ Nova Reunião Agendada - {{client_name}}"
    html_template TEXT NOT NULL,                    -- Template HTML com placeholders
    text_template TEXT,                             -- Versão texto alternativa
    
    -- Configurações
    from_email VARCHAR(255) NOT NULL,               -- E-mail remetente
    from_name VARCHAR(100) NOT NULL,                -- Nome do remetente
    reply_to VARCHAR(255),                          -- E-mail para respostas
    
    -- Variáveis Disponíveis
    available_variables JSONB DEFAULT '{}',         -- Ex: {"client_name": "Nome do Cliente", "meeting_date": "Data da Reunião"}
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    default_template BOOLEAN DEFAULT FALSE,         -- Template padrão para o tipo
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES admin_users(id),
    
    -- Versioning (para futuras melhorias)
    version INTEGER DEFAULT 1,
    parent_template_id UUID REFERENCES email_templates(id)
);
```

#### **3. TABELA `email_settings` (Configurações de E-mail)**

```sql
CREATE TABLE email_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Provedor de E-mail
    provider VARCHAR(20) NOT NULL DEFAULT 'resend'  -- 'resend', 'sendgrid', 'ses'
        CHECK (provider IN ('resend', 'sendgrid', 'ses', 'postmark')),
    
    -- Configurações do Provedor
    api_key_env_var VARCHAR(50) NOT NULL,           -- Nome da variável de ambiente com a API key
    
    -- Configurações Padrão
    default_from_email VARCHAR(255) NOT NULL,       -- E-mail padrão do remetente
    default_from_name VARCHAR(100) NOT NULL,        -- Nome padrão do remetente
    company_email VARCHAR(255) NOT NULL,            -- E-mail da empresa (para notificações)
    
    -- Configurações de Comportamento
    auto_retry_failed BOOLEAN DEFAULT TRUE,
    max_retry_attempts INTEGER DEFAULT 3,
    retry_delay_minutes INTEGER DEFAULT 5,
    
    -- Rate Limiting
    daily_send_limit INTEGER DEFAULT 1000,
    hourly_send_limit INTEGER DEFAULT 100,
    
    -- Tracking
    enable_open_tracking BOOLEAN DEFAULT TRUE,
    enable_click_tracking BOOLEAN DEFAULT TRUE,
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir apenas uma configuração ativa
    CONSTRAINT only_one_active_config CHECK (
        (active = TRUE AND (SELECT COUNT(*) FROM email_settings WHERE active = TRUE) <= 1) OR active = FALSE
    )
);
```

---

### **🚀 IMPLEMENTAÇÃO TÉCNICA**

#### **1. EDGE FUNCTION: E-mail Service**

**Arquivo:** `/supabase/functions/server/emailService.ts`

```typescript
import { Resend } from 'npm:resend@3.2.0';

interface EmailData {
  type: 'meeting_notification' | 'meeting_confirmation';
  recipientEmail: string;
  recipientName?: string;
  templateData: Record<string, any>;
  meetingId?: string;
}

export class EmailService {
  private resend: Resend;
  
  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendMeetingNotification(data: EmailData) {
    // Buscar template da base de dados
    // Substituir placeholders
    // Enviar via Resend
    // Registrar na tabela email_notifications
  }
}
```

#### **2. ROTA NO BACKEND**

**Adicionar em:** `/supabase/functions/server/index.tsx`

```typescript
// Rota para processar agendamento + envio de e-mails
app.post('/make-server-a91235ef/process-meeting-request', async (c) => {
  try {
    // 1. Salvar na tabela meeting_requests
    const meetingId = await saveMeetingRequest(meetingData);
    
    // 2. Enviar e-mail para a empresa
    await emailService.sendMeetingNotification({
      type: 'meeting_notification',
      recipientEmail: 'intelligemconsultoria@gmail.com',
      templateData: meetingData,
      meetingId
    });
    
    // 3. Enviar e-mail de confirmação para o cliente
    await emailService.sendMeetingNotification({
      type: 'meeting_confirmation',
      recipientEmail: meetingData.email,
      recipientName: meetingData.contact_name,
      templateData: meetingData,
      meetingId
    });
    
    return c.json({ success: true, meetingId });
  } catch (error) {
    console.error('Erro ao processar agendamento:', error);
    return c.json({ error: 'Erro interno' }, 500);
  }
});
```

#### **3. TEMPLATES PADRÃO**

**Template de Notificação para Empresa:**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nova Reunião Agendada - IntelliGem</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; }
        .header { background: linear-gradient(135deg, #31af9d, #136eae); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .info-box { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #31af9d; }
        .footer { background: #030405; color: white; padding: 15px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗓️ Nova Reunião Agendada</h1>
        </div>
        
        <div class="content">
            <p>Uma nova reunião foi agendada no site IntelliGem:</p>
            
            <div class="info-box">
                <h3>👤 DADOS DO CLIENTE:</h3>
                <p><strong>Nome:</strong> {{contact_name}}</p>
                <p><strong>E-mail:</strong> {{email}}</p>
                <p><strong>Empresa:</strong> {{company}}</p>
                <p><strong>Telefone:</strong> {{phone}}</p>
            </div>
            
            <div class="info-box">
                <h3>📋 DETALHES DA REUNIÃO:</h3>
                <p><strong>Solução de Interesse:</strong> {{interested_solution}}</p>
                <p><strong>Tipo de Reunião:</strong> {{meeting_type}}</p>
                <p><strong>Horário Preferido:</strong> {{preferred_time}}</p>
            </div>
            
            <div class="info-box">
                <h3>💬 DESAFIOS MENCIONADOS:</h3>
                <p>{{specific_challenges}}</p>
            </div>
            
            <div class="info-box">
                <h3>📊 ORIGEM:</h3>
                <p><strong>Página:</strong> {{source_page}}</p>
                <p><strong>Timestamp:</strong> {{created_at}}</p>
            </div>
        </div>
        
        <div class="footer">
            <p>IntelliGem - Transformando Dados em Inteligência</p>
        </div>
    </div>
</body>
</html>
```

#### **4. CONFIGURAÇÕES NECESSÁRIAS**

**Variáveis de Ambiente:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
COMPANY_EMAIL=intelligemconsultoria@gmail.com
```

**Configuração da Base de Dados:**
```sql
-- Inserir configurações padrão
INSERT INTO email_settings (
    provider, api_key_env_var, default_from_email, 
    default_from_name, company_email, active
) VALUES (
    'resend', 'RESEND_API_KEY', 'no-reply@intelligem.com.br',
    'IntelliGem', 'intelligemconsultoria@gmail.com', true
);

-- RLS para tabelas de e-mail
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access emails" ON email_notifications
    FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users WHERE active = true));
```

---

### **📊 CRONOGRAMA DE IMPLEMENTAÇÃO**

#### **Fase 1: Setup Base (1-2 dias)**
1. ✅ Criar tabelas de e-mail no Supabase
2. ✅ Configurar conta no Resend.com
3. ✅ Adicionar variáveis de ambiente
4. ✅ Inserir templates padrão

#### **Fase 2: Backend (2-3 dias)**
1. 🔄 Criar `emailService.ts` 
2. 🔄 Implementar rota de processamento completo
3. 🔄 Adicionar logs detalhados
4. 🔄 Testes de envio

#### **Fase 3: Frontend Integration (1 dia)**
1. 🔄 Atualizar `meetingService.ts`
2. 🔄 Modificar `MeetingRequestModal.tsx`
3. 🔄 Adicionar toasts de confirmação
4. 🔄 Tratamento de erros

---

## 🗂️ SUPABASE STORAGE (Buckets)

### **Estrutura de Buckets:**

```sql
-- 1. IMAGENS DO BLOG
CREATE BUCKET blog-images;
-- Estrutura: /articles/{article-id}/{filename}
--           /featured/{filename}
--           /thumbnails/{filename}

-- 2. IMAGENS DOS CASES
CREATE BUCKET case-images;
-- Estrutura: /cases/{case-id}/{filename}
--           /results-charts/{filename}
--           /before-after/{filename}

-- 3. IMAGENS DO SITE
CREATE BUCKET site-assets;
-- Estrutura: /logos/{filename}
--           /hero/{filename}
--           /solutions/{filename}
--           /team/{filename}

-- 4. UPLOADS GERAIS
CREATE BUCKET uploads;
-- Estrutura: /temp/{user-id}/{filename}
--           /documents/{filename}
```

### **Políticas de Storage:**

```sql
-- Leitura pública para assets do site
CREATE POLICY "Public read access" ON storage.objects
    FOR SELECT USING (bucket_id IN ('blog-images', 'case-images', 'site-assets'));

-- Upload apenas para usuários autenticados
CREATE POLICY "Authenticated upload" ON storage.objects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Edição apenas para admins
CREATE POLICY "Admin manage files" ON storage.objects
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );
```

---

## 🔧 FUNÇÕES AUXILIARES

### **1. Trigger para Updated_At:**

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar em todas as tabelas relevantes
CREATE TRIGGER update_blog_articles_updated_at BEFORE UPDATE ON blog_articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_studies_updated_at BEFORE UPDATE ON case_studies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **2. Função para Gerar Slugs:**

```sql
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                unaccent(input_text), 
                '[^a-zA-Z0-9\s]', '', 'g'
            ), 
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 ÍNDICES PARA PERFORMANCE

```sql
-- Blog Articles
CREATE INDEX idx_blog_articles_published ON blog_articles(published, created_at DESC);
CREATE INDEX idx_blog_articles_featured ON blog_articles(featured) WHERE featured = true;
CREATE INDEX idx_blog_articles_category ON blog_articles(category);
CREATE INDEX idx_blog_articles_tags ON blog_articles USING GIN(tags);
CREATE INDEX idx_blog_articles_search ON blog_articles USING GIN(to_tsvector('portuguese', title || ' ' || excerpt));

-- Case Studies
CREATE INDEX idx_case_studies_published ON case_studies(published, created_at DESC);
CREATE INDEX idx_case_studies_category ON case_studies(category);
CREATE INDEX idx_case_studies_featured ON case_studies(featured) WHERE featured = true;
CREATE INDEX idx_case_studies_industry ON case_studies(industry);

-- Newsletter
CREATE INDEX idx_newsletter_active ON newsletter_subscribers(active) WHERE active = true;
CREATE INDEX idx_newsletter_interests ON newsletter_subscribers USING GIN(interests);

-- Media Files
CREATE INDEX idx_media_files_category ON media_files(category, bucket_name);
CREATE INDEX idx_media_files_usage ON media_files(used_in_table, used_in_id);

-- Contact Submissions
CREATE INDEX idx_contact_status ON contact_submissions(status, submitted_at DESC);
CREATE INDEX idx_contact_source ON contact_submissions(source, submitted_at DESC);
```

---

## 📝 VIEWS ÚTEIS

### **1. View de Artigos Publicados:**

```sql
CREATE VIEW published_articles AS
SELECT 
    id, title, subtitle, excerpt, author, date, read_time, 
    category, image_url, slug, tags, created_at,
    view_count
FROM blog_articles 
WHERE published = true 
ORDER BY created_at DESC;
```

### **2. View de Cases com Métricas:**

```sql
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

### **3. View de Analytics do Site:**

```sql
CREATE VIEW site_analytics AS
SELECT 
    'articles' as content_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE published = true) as published_count,
    COUNT(*) FILTER (WHERE featured = true) as featured_count,
    SUM(view_count) as total_views
FROM blog_articles
UNION ALL
SELECT 
    'cases' as content_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE published = true) as published_count,
    COUNT(*) FILTER (WHERE featured = true) as featured_count,
    SUM(view_count) as total_views
FROM case_studies;
```

---

## 🔐 ROW LEVEL SECURITY (RLS)

### **Políticas de Segurança:**

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- BLOG ARTICLES
CREATE POLICY "Public read published articles" ON blog_articles
    FOR SELECT USING (published = true);

CREATE POLICY "Admin full access articles" ON blog_articles
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- CASE STUDIES
CREATE POLICY "Public read published cases" ON case_studies
    FOR SELECT USING (published = true);

CREATE POLICY "Admin full access cases" ON case_studies
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- NEWSLETTER
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage subscribers" ON newsletter_subscribers
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- CONTACT SUBMISSIONS
CREATE POLICY "Anyone can submit contact" ON contact_submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin read contacts" ON contact_submissions
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );
```

---

## 🚀 DADOS INICIAIS

### **Configurações do Site:**

```sql
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

### **Usuário Admin Inicial:**

```sql
-- Será criado via Supabase Auth e depois vinculado
INSERT INTO admin_users (id, email, full_name, role, permissions) VALUES
(
    'uuid-do-usuario-criado-no-auth',
    'admin@intelligem.com.br',
    'Administrator',
    'admin',
    '{"blog": true, "cases": true, "newsletter": true, "settings": true, "users": true}'
);
```

---

## 📈 PLANO DE MIGRAÇÃO

### **Fase 1: Estrutura Base**
1. ✅ Criar tabelas principais
2. ✅ Configurar RLS e políticas
3. ✅ Configurar buckets de storage
4. ✅ Implementar triggers e funções

### **Fase 2: Migração de Dados**
1. ✅ Migrar artigos do localStorage para `blog_articles`
2. ✅ Migrar cases do localStorage para `case_studies`  
3. ✅ Migrar imagens para Supabase Storage
4. ✅ Configurar settings iniciais

### **Fase 3: Integração Frontend**
1. ✅ Atualizar `blogService.ts` para usar Supabase
2. ✅ Atualizar `casesService.ts` para usar Supabase
3. ✅ Implementar `settingsService.ts`
4. ✅ Atualizar componentes para nova estrutura

### **Fase 4: Funcionalidades Avançadas**
1. 🔄 Sistema de analytics
2. 🔄 Integração com email marketing  
3. 🔄 Sistema de notificações
4. 🔄 Dashboard de métricas

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. **Executar Scripts SQL** no Supabase Dashboard
2. **Configurar Storage Buckets** com políticas adequadas
3. **Migrar Dados Existentes** do localStorage
4. **Atualizar Services** para usar Supabase
5. **Implementar Sistema de Configurações** do site
6. **Adicionar Analytics Básico** (views, conversões)

Esta estrutura fornece uma base sólida e escalável para o crescimento da IntelliGem, mantendo a flexibilidade para futuras expansões! 🚀