-- Script para corrigir políticas RLS do Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se a tabela blog_articles existe e tem RLS habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'blog_articles';

-- 2. Desabilitar RLS temporariamente para testar (CUIDADO: apenas para desenvolvimento)
-- ALTER TABLE blog_articles DISABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS adequadas para blog_articles
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

-- 4. Verificar se a tabela newsletter_subscribers existe e criar políticas
-- Política para newsletter_subscribers
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

-- 5. Verificar se a tabela site_images existe e criar políticas
CREATE POLICY "Permitir leitura de imagens para todos" ON site_images
    FOR SELECT
    USING (true);

CREATE POLICY "Permitir inserção de imagens para usuários autenticados" ON site_images
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de imagens para usuários autenticados" ON site_images
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão de imagens para usuários autenticados" ON site_images
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- 6. Verificar se a tabela meetings existe e criar políticas
CREATE POLICY "Permitir leitura de meetings para todos" ON meetings
    FOR SELECT
    USING (true);

CREATE POLICY "Permitir inserção de meetings para todos" ON meetings
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Permitir atualização de meetings para usuários autenticados" ON meetings
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 7. Verificar se a tabela cases existe e criar políticas
CREATE POLICY "Permitir leitura de cases para todos" ON cases
    FOR SELECT
    USING (true);

CREATE POLICY "Permitir inserção de cases para usuários autenticados" ON cases
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de cases para usuários autenticados" ON cases
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão de cases para usuários autenticados" ON cases
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- 8. Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('blog_articles', 'newsletter_subscribers', 'site_images', 'meetings', 'cases')
ORDER BY tablename, policyname;

-- 9. Verificar se RLS está habilitado nas tabelas
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('blog_articles', 'newsletter_subscribers', 'site_images', 'meetings', 'cases')
ORDER BY tablename;
