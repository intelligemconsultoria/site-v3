-- 🗄️ SETUP COMPLETO - SUPABASE INTELLIGEM
-- Execute este script no SQL Editor do Supabase Dashboard

-- ====================================
-- 1. EXTENSÕES NECESSÁRIAS
-- ====================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ====================================
-- 2. TABELAS PRINCIPAIS  
-- ====================================

-- ARTIGOS DO BLOG
CREATE TABLE blog_articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    read_time VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT FALSE,
    slug VARCHAR(300) UNIQUE NOT NULL,
    tags TEXT[] DEFAULT '{}',
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- SEO e Analytics
    meta_description TEXT,
    meta_keywords TEXT[],
    view_count INTEGER DEFAULT 0,
    
    -- Validações
    CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT valid_read_time CHECK (read_time ~ '^\d+ min$')
);

-- CASES DE SUCESSO
CREATE TABLE case_studies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    
    -- Informações do Cliente
    client VARCHAR(150) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    
    -- Estrutura do Case
    challenge TEXT NOT NULL,
    solution TEXT NOT NULL,
    results TEXT[] NOT NULL,
    
    -- Classificação
    category VARCHAR(20) NOT NULL CHECK (category IN ('GemFlow', 'GemInsights', 'GemMind')),
    
    -- Métricas de Impacto
    metrics JSONB DEFAULT '{}',
    
    -- Mídia e Apresentação
    image_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT FALSE,
    
    -- SEO
    slug VARCHAR(300) UNIQUE NOT NULL,
    tags TEXT[] DEFAULT '{}',
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    conversion_source VARCHAR(50),
    
    CONSTRAINT valid_case_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

-- NEWSLETTER
CREATE TABLE newsletter_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Status de Inscrição
    active BOOLEAN DEFAULT TRUE,
    confirmed BOOLEAN DEFAULT FALSE,
    
    -- Segmentação
    interests TEXT[] DEFAULT '{}',
    source VARCHAR(50),
    
    -- Metadados
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    
    -- Validação
    CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- CONFIGURAÇÕES DO SITE
CREATE TABLE site_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(20) DEFAULT 'text',
    category VARCHAR(50),
    description TEXT,
    
    -- Controle
    editable BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_setting_type CHECK (type IN ('text', 'json', 'boolean', 'number', 'url'))
);

-- GERENCIAMENTO DE MÍDIA
CREATE TABLE media_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- Categorização
    bucket_name VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    
    -- Relacionamentos
    used_in_table VARCHAR(50),
    used_in_id UUID,
    
    -- Metadados de Imagem
    image_width INTEGER,
    image_height INTEGER,
    alt_text TEXT,
    
    -- Controle
    public_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    
    -- Metadados
    uploaded_by UUID,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_mime_type CHECK (
        mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf', 'video/mp4')
    )
);

-- USUÁRIOS ADMINISTRATIVOS
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

-- KV STORE (Para Edge Functions)
CREATE TABLE kv_store_a91235ef (
    key TEXT NOT NULL PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AGENDAMENTOS DE REUNIÃO
CREATE TABLE meeting_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Dados do Contato
    contact_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    
    -- Interesse e Tipo de Reunião
    interested_solution VARCHAR(20) NOT NULL 
        CHECK (interested_solution IN ('GemFlow', 'GemInsights', 'GemMind', 'All')),
    meeting_type VARCHAR(20) NOT NULL 
        CHECK (meeting_type IN ('demo', 'consultation', 'technical')),
    
    -- Agendamento
    preferred_time TEXT NOT NULL,  -- Storing as text to allow flexible time formats
    actual_meeting_time TIMESTAMP WITH TIME ZONE,
    meeting_duration INTEGER DEFAULT 30,
    
    -- Detalhes Adicionais
    specific_challenges TEXT,
    preparation_notes TEXT,
    
    -- Status e Workflow
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    
    -- Tracking e Analytics
    source_page VARCHAR(50) NOT NULL,
    qualification_score INTEGER,
    lead_quality VARCHAR(20) CHECK (lead_quality IN ('hot', 'warm', 'cold')),
    
    -- Integração com Calendário
    calendar_event_id VARCHAR(255),
    meeting_link TEXT,
    
    -- Follow-up e Resultados
    follow_up_required BOOLEAN DEFAULT TRUE,
    meeting_outcome TEXT,
    proposal_value DECIMAL(10,2),
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Relacionamentos
    assigned_to UUID,
    related_case_study_id UUID,
    
    -- Validações
    CONSTRAINT valid_meeting_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Dados do Contato
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(150),
    phone VARCHAR(20),
    
    -- Interesse
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    interested_solution VARCHAR(20),
    
    -- Tracking
    source VARCHAR(50),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Status
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
    
    -- Metadados
    ip_address INET,
    user_agent TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_contact_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ====================================
-- 3. FUNÇÕES AUXILIARES
-- ====================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para gerar slugs
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

-- ====================================
-- 4. TRIGGERS
-- ====================================

-- Triggers para updated_at
CREATE TRIGGER update_blog_articles_updated_at 
    BEFORE UPDATE ON blog_articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_studies_updated_at 
    BEFORE UPDATE ON case_studies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at 
    BEFORE UPDATE ON site_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kv_store_updated_at 
    BEFORE UPDATE ON kv_store_a91235ef 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- 5. ÍNDICES PARA PERFORMANCE
-- ====================================

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

-- KV Store
CREATE INDEX idx_kv_store_created_at ON kv_store_a91235ef(created_at);

-- ====================================
-- 6. VIEWS ÚTEIS
-- ====================================

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

-- View de analytics do site
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

-- ====================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ====================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE kv_store_a91235ef ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS - BLOG ARTICLES
CREATE POLICY "Public read published articles" ON blog_articles
    FOR SELECT USING (published = true);

CREATE POLICY "Admin full access articles" ON blog_articles
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- POLÍTICAS - CASE STUDIES
CREATE POLICY "Public read published cases" ON case_studies
    FOR SELECT USING (published = true);

CREATE POLICY "Admin full access cases" ON case_studies
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- POLÍTICAS - NEWSLETTER
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage subscribers" ON newsletter_subscribers
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- POLÍTICAS - CONTACT SUBMISSIONS
CREATE POLICY "Anyone can submit contact" ON contact_submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin read contacts" ON contact_submissions
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- POLÍTICAS - SITE SETTINGS
CREATE POLICY "Public read active settings" ON site_settings
    FOR SELECT USING (active = true);

CREATE POLICY "Admin manage settings" ON site_settings
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true AND permissions->>'settings' = 'true')
    );

-- POLÍTICAS - MEDIA FILES
CREATE POLICY "Public read active media" ON media_files
    FOR SELECT USING (active = true);

CREATE POLICY "Admin manage media" ON media_files
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- POLÍTICAS - ADMIN USERS
CREATE POLICY "Users can view their own profile" ON admin_users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin manage users" ON admin_users
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true AND role = 'admin')
    );

-- POLÍTICAS - KV STORE
CREATE POLICY "Service role can manage kv_store" ON kv_store_a91235ef
    FOR ALL USING (true);

-- ====================================
-- 8. DADOS INICIAIS
-- ====================================

-- Configurações do site
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
('newsletter_title', 'Receba insights exclusivos sobre dados e IA', 'text', 'newsletter', 'Título da seção newsletter'),

-- SEO
('site_title', 'IntelliGem - Transforme Dados em Decisões Inteligentes', 'text', 'seo', 'Título do site para SEO'),
('site_description', 'Soluções em dados, automação e IA para impulsionar seu negócio. GemFlow, GemInsights e GemMind.', 'text', 'seo', 'Descrição do site para SEO');

-- ====================================
-- 9. COMENTÁRIOS E DOCUMENTAÇÃO
-- ====================================

COMMENT ON TABLE blog_articles IS 'Artigos do blog da IntelliGem com conteúdo rico';
COMMENT ON TABLE case_studies IS 'Cases de sucesso das soluções GemFlow, GemInsights e GemMind';
COMMENT ON TABLE newsletter_subscribers IS 'Assinantes da newsletter para lead generation';
COMMENT ON TABLE site_settings IS 'Configurações editáveis do site institucional';
COMMENT ON TABLE media_files IS 'Gerenciamento centralizado de arquivos de mídia';
COMMENT ON TABLE admin_users IS 'Usuários com acesso administrativo ao sistema';
COMMENT ON TABLE contact_submissions IS 'Formulários de contato e solicitações de orçamento';

-- ====================================
-- ✅ SETUP CONCLUÍDO!
-- ====================================

-- Próximos passos:
-- 1. Configurar Storage Buckets no painel do Supabase
-- 2. Criar primeiro usuário admin via Supabase Auth
-- 3. Executar migração de dados do localStorage
-- 4. Atualizar services no frontend),
    CONSTRAINT valid_qualification_score CHECK (qualification_score >= 1 AND qualification_score <= 10)
);

-- NOTIFICAÇÕES DE EMAIL
CREATE TABLE email_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Dados básicos
    recipient VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    type VARCHAR(30) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    external_id TEXT,
    
    -- Relacionamentos
    related_id UUID,
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_email_type CHECK (type IN ('meeting_notification', 'client_confirmation', 'internal_notification', 'newsletter', 'follow_up')),
    CONSTRAINT valid_email_status CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced'))
);

-- FORMULÁRIOS DE CONTATO
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
    interested_solution VARCHAR(20),
    
    -- Tracking
    source VARCHAR(50),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Status
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
    
    -- Metadados
    ip_address INET,
    user_agent TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_contact_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ====================================
-- 3. FUNÇÕES AUXILIARES
-- ====================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para gerar slugs
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

-- ====================================
-- 4. TRIGGERS
-- ====================================

-- Triggers para updated_at
CREATE TRIGGER update_blog_articles_updated_at 
    BEFORE UPDATE ON blog_articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_studies_updated_at 
    BEFORE UPDATE ON case_studies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at 
    BEFORE UPDATE ON site_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kv_store_updated_at 
    BEFORE UPDATE ON kv_store_a91235ef 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- 5. ÍNDICES PARA PERFORMANCE
-- ====================================

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

-- KV Store
CREATE INDEX idx_kv_store_created_at ON kv_store_a91235ef(created_at);

-- ====================================
-- 6. VIEWS ÚTEIS
-- ====================================

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

-- View de analytics do site
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

-- ====================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ====================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE kv_store_a91235ef ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS - BLOG ARTICLES
CREATE POLICY "Public read published articles" ON blog_articles
    FOR SELECT USING (published = true);

CREATE POLICY "Admin full access articles" ON blog_articles
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- POLÍTICAS - CASE STUDIES
CREATE POLICY "Public read published cases" ON case_studies
    FOR SELECT USING (published = true);

CREATE POLICY "Admin full access cases" ON case_studies
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- POLÍTICAS - NEWSLETTER
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage subscribers" ON newsletter_subscribers
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- POLÍTICAS - CONTACT SUBMISSIONS
CREATE POLICY "Anyone can submit contact" ON contact_submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin read contacts" ON contact_submissions
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- POLÍTICAS - SITE SETTINGS
CREATE POLICY "Public read active settings" ON site_settings
    FOR SELECT USING (active = true);

CREATE POLICY "Admin manage settings" ON site_settings
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true AND permissions->>'settings' = 'true')
    );

-- POLÍTICAS - MEDIA FILES
CREATE POLICY "Public read active media" ON media_files
    FOR SELECT USING (active = true);

CREATE POLICY "Admin manage media" ON media_files
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- POLÍTICAS - ADMIN USERS
CREATE POLICY "Users can view their own profile" ON admin_users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin manage users" ON admin_users
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true AND role = 'admin')
    );

-- POLÍTICAS - KV STORE
CREATE POLICY "Service role can manage kv_store" ON kv_store_a91235ef
    FOR ALL USING (true);

-- ====================================
-- 8. DADOS INICIAIS
-- ====================================

-- Configurações do site
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
('newsletter_title', 'Receba insights exclusivos sobre dados e IA', 'text', 'newsletter', 'Título da seção newsletter'),

-- SEO
('site_title', 'IntelliGem - Transforme Dados em Decisões Inteligentes', 'text', 'seo', 'Título do site para SEO'),
('site_description', 'Soluções em dados, automação e IA para impulsionar seu negócio. GemFlow, GemInsights e GemMind.', 'text', 'seo', 'Descrição do site para SEO');

-- ====================================
-- 9. COMENTÁRIOS E DOCUMENTAÇÃO
-- ====================================

COMMENT ON TABLE blog_articles IS 'Artigos do blog da IntelliGem com conteúdo rico';
COMMENT ON TABLE case_studies IS 'Cases de sucesso das soluções GemFlow, GemInsights e GemMind';
COMMENT ON TABLE newsletter_subscribers IS 'Assinantes da newsletter para lead generation';
COMMENT ON TABLE site_settings IS 'Configurações editáveis do site institucional';
COMMENT ON TABLE media_files IS 'Gerenciamento centralizado de arquivos de mídia';
COMMENT ON TABLE admin_users IS 'Usuários com acesso administrativo ao sistema';
COMMENT ON TABLE contact_submissions IS 'Formulários de contato e solicitações de orçamento';

-- ====================================
-- ✅ SETUP CONCLUÍDO!
-- ====================================

-- Próximos passos:
-- 1. Configurar Storage Buckets no painel do Supabase
-- 2. Criar primeiro usuário admin via Supabase Auth
-- 3. Executar migração de dados do localStorage
-- 4. Atualizar services no frontend