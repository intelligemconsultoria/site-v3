-- Script COMPLETO para corrigir políticas RLS do Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- ====================================
-- 1. VERIFICAR TABELAS EXISTENTES
-- ====================================

-- Verificar se as tabelas existem
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN (
    'blog_articles', 
    'newsletter_subscribers', 
    'case_studies',
    'contact_submissions',
    'site_settings',
    'meeting_requests',
    'site_images'
)
ORDER BY tablename;

-- ====================================
-- 2. REMOVER POLÍTICAS EXISTENTES (se necessário)
-- ====================================

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Permitir leitura de artigos para todos" ON blog_articles;
DROP POLICY IF EXISTS "Permitir inserção de artigos para usuários autenticados" ON blog_articles;
DROP POLICY IF EXISTS "Permitir atualização de artigos para usuários autenticados" ON blog_articles;
DROP POLICY IF EXISTS "Permitir exclusão de artigos para usuários autenticados" ON blog_articles;

DROP POLICY IF EXISTS "Permitir leitura de newsletter para todos" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Permitir inserção de newsletter para todos" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Permitir atualização de newsletter para usuários autenticados" ON newsletter_subscribers;

DROP POLICY IF EXISTS "Permitir leitura de case_studies para todos" ON case_studies;
DROP POLICY IF EXISTS "Permitir inserção de case_studies para usuários autenticados" ON case_studies;
DROP POLICY IF EXISTS "Permitir atualização de case_studies para usuários autenticados" ON case_studies;
DROP POLICY IF EXISTS "Permitir exclusão de case_studies para usuários autenticados" ON case_studies;

-- ====================================
-- 3. CRIAR POLÍTICAS RLS PARA BLOG_ARTICLES
-- ====================================

-- Política para permitir leitura para todos (usuários anônimos e autenticados)
CREATE POLICY "Permitir leitura de artigos para todos" ON blog_articles
    FOR SELECT
    USING (true);

-- Política para permitir inserção para usuários autenticados
CREATE POLICY "Permitir inserção de artigos para usuários autenticados" ON blog_articles
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir atualização para usuários autenticados
CREATE POLICY "Permitir atualização de artigos para usuários autenticados" ON blog_articles
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir exclusão para usuários autenticados
CREATE POLICY "Permitir exclusão de artigos para usuários autenticados" ON blog_articles
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ====================================
-- 4. CRIAR POLÍTICAS RLS PARA NEWSLETTER_SUBSCRIBERS
-- ====================================

CREATE POLICY "Permitir leitura de newsletter para todos" ON newsletter_subscribers
    FOR SELECT
    USING (true);

CREATE POLICY "Permitir inserção de newsletter para todos" ON newsletter_subscribers
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Permitir atualização de newsletter para usuários autenticados" ON newsletter_subscribers
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ====================================
-- 5. CRIAR POLÍTICAS RLS PARA CASE_STUDIES
-- ====================================

CREATE POLICY "Permitir leitura de case_studies para todos" ON case_studies
    FOR SELECT
    USING (true);

CREATE POLICY "Permitir inserção de case_studies para usuários autenticados" ON case_studies
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de case_studies para usuários autenticados" ON case_studies
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão de case_studies para usuários autenticados" ON case_studies
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ====================================
-- 6. CRIAR POLÍTICAS RLS PARA CONTACT_SUBMISSIONS
-- ====================================

CREATE POLICY "Permitir leitura de contact_submissions para usuários autenticados" ON contact_submissions
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção de contact_submissions para todos" ON contact_submissions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Permitir atualização de contact_submissions para usuários autenticados" ON contact_submissions
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão de contact_submissions para usuários autenticados" ON contact_submissions
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ====================================
-- 7. CRIAR POLÍTICAS RLS PARA SITE_SETTINGS
-- ====================================

CREATE POLICY "Permitir leitura de site_settings para todos" ON site_settings
    FOR SELECT
    USING (true);

CREATE POLICY "Permitir inserção de site_settings para usuários autenticados" ON site_settings
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de site_settings para usuários autenticados" ON site_settings
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão de site_settings para usuários autenticados" ON site_settings
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ====================================
-- 8. CRIAR POLÍTICAS RLS PARA MEETING_REQUESTS
-- ====================================

CREATE POLICY "Permitir leitura de meeting_requests para usuários autenticados" ON meeting_requests
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção de meeting_requests para todos" ON meeting_requests
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Permitir atualização de meeting_requests para usuários autenticados" ON meeting_requests
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão de meeting_requests para usuários autenticados" ON meeting_requests
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ====================================
-- 9. CRIAR POLÍTICAS RLS PARA SITE_IMAGES
-- ====================================

CREATE POLICY "Permitir leitura de site_images para todos" ON site_images
    FOR SELECT
    USING (true);

CREATE POLICY "Permitir inserção de site_images para usuários autenticados" ON site_images
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de site_images para usuários autenticados" ON site_images
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão de site_images para usuários autenticados" ON site_images
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ====================================
-- 10. VERIFICAR POLÍTICAS CRIADAS
-- ====================================

-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN (
    'blog_articles', 
    'newsletter_subscribers', 
    'case_studies',
    'contact_submissions',
    'site_settings',
    'meeting_requests',
    'site_images'
)
ORDER BY tablename, policyname;

-- ====================================
-- 11. VERIFICAR STATUS RLS
-- ====================================

-- Verificar se RLS está habilitado nas tabelas
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN (
    'blog_articles', 
    'newsletter_subscribers', 
    'case_studies',
    'contact_submissions',
    'site_settings',
    'meeting_requests',
    'site_images'
)
ORDER BY tablename;

-- ====================================
-- 12. TESTE RÁPIDO (OPCIONAL)
-- ====================================

-- Teste para verificar se as políticas estão funcionando
-- (Execute apenas se quiser testar)
/*
-- Teste de leitura (deve funcionar para todos)
SELECT COUNT(*) FROM blog_articles;

-- Teste de inserção (deve funcionar apenas para usuários autenticados)
-- INSERT INTO blog_articles (title, excerpt, content, author, category, slug, read_time) 
-- VALUES ('Teste', 'Teste', 'Teste', 'Teste', 'teste', 'teste-' || extract(epoch from now()), '1 min');
*/
