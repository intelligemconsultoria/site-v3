-- 📁 SETUP STORAGE - SUPABASE INTELLIGEM
-- Execute este script no SQL Editor do Supabase Dashboard (APÓS o script principal)

-- ====================================
-- 1. CRIAR BUCKETS DE STORAGE
-- ====================================

-- IMAGENS DO BLOG
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true);

-- IMAGENS DOS CASES DE SUCESSO
INSERT INTO storage.buckets (id, name, public) 
VALUES ('case-images', 'case-images', true);

-- ASSETS DO SITE (logos, hero, etc.)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true);

-- UPLOADS GERAIS/TEMPORÁRIOS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', false);

-- ====================================
-- 2. POLÍTICAS DE STORAGE
-- ====================================

-- BLOG IMAGES - Leitura pública
CREATE POLICY "Public read blog images" ON storage.objects
    FOR SELECT USING (bucket_id = 'blog-images');

-- BLOG IMAGES - Upload para usuários autenticados
CREATE POLICY "Authenticated upload blog images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'blog-images' 
        AND auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- BLOG IMAGES - Edição/exclusão para admins
CREATE POLICY "Admin manage blog images" ON storage.objects
    FOR ALL USING (
        bucket_id = 'blog-images' 
        AND auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- CASE IMAGES - Leitura pública
CREATE POLICY "Public read case images" ON storage.objects
    FOR SELECT USING (bucket_id = 'case-images');

-- CASE IMAGES - Upload para usuários autenticados
CREATE POLICY "Authenticated upload case images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'case-images' 
        AND auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- CASE IMAGES - Edição/exclusão para admins
CREATE POLICY "Admin manage case images" ON storage.objects
    FOR ALL USING (
        bucket_id = 'case-images' 
        AND auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- SITE ASSETS - Leitura pública
CREATE POLICY "Public read site assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'site-assets');

-- SITE ASSETS - Upload para usuários autenticados
CREATE POLICY "Authenticated upload site assets" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'site-assets' 
        AND auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- SITE ASSETS - Edição/exclusão para admins
CREATE POLICY "Admin manage site assets" ON storage.objects
    FOR ALL USING (
        bucket_id = 'site-assets' 
        AND auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- UPLOADS - Apenas para usuários autenticados
CREATE POLICY "Authenticated access uploads" ON storage.objects
    FOR ALL USING (
        bucket_id = 'uploads' 
        AND auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- ====================================
-- 3. CONFIGURAÇÕES DE MIME TYPES
-- ====================================

-- Permitir apenas tipos de arquivo específicos para cada bucket
-- (Estas políticas adicionais podem ser implementadas via código no frontend)

-- Comentário: As validações de tipo de arquivo serão implementadas no frontend
-- nos services de upload, permitindo apenas:
-- - Imagens: JPEG, PNG, WebP, GIF, SVG
-- - Documentos: PDF
-- - Vídeos: MP4 (para futuras implementações)

-- ====================================
-- 4. ESTRUTURA DE PASTAS RECOMENDADA
-- ====================================

-- BLOG-IMAGES/
--   ├── articles/
--   │   ├── {article-id}/
--   │   │   ├── featured.jpg
--   │   │   ├── content-image-1.jpg
--   │   │   └── content-image-2.jpg
--   ├── featured/
--   │   └── highlight-images/
--   └── thumbnails/
--       └── auto-generated/

-- CASE-IMAGES/
--   ├── cases/
--   │   ├── {case-id}/
--   │   │   ├── hero.jpg
--   │   │   ├── before.jpg
--   │   │   ├── after.jpg
--   │   │   └── results-chart.jpg
--   ├── clients/
--   │   └── logos/
--   └── solutions/
--       ├── gemflow/
--       ├── geminsights/
--       └── gemmind/

-- SITE-ASSETS/
--   ├── logos/
--   │   ├── intelligem-logo.svg
--   │   ├── intelligem-dark.svg
--   │   └── intelligem-light.svg
--   ├── hero/
--   │   ├── hero-bg.jpg
--   │   └── hero-video.mp4
--   ├── solutions/
--   │   ├── gemflow-icon.svg
--   │   ├── geminsights-icon.svg
--   │   └── gemmind-icon.svg
--   ├── team/
--   │   └── member-photos/
--   └── backgrounds/
--       ├── gradient-patterns/
--       └── textures/

-- UPLOADS/
--   ├── temp/
--   │   └── {user-id}/
--   │       └── temporary-files/
--   └── documents/
--       └── contracts-proposals/

-- ====================================
-- 5. EXEMPLO DE USO - URLs GERADAS
-- ====================================

-- Exemplos de URLs que serão geradas:
-- https://[project-id].supabase.co/storage/v1/object/public/blog-images/articles/uuid-123/featured.jpg
-- https://[project-id].supabase.co/storage/v1/object/public/case-images/cases/uuid-456/hero.jpg
-- https://[project-id].supabase.co/storage/v1/object/public/site-assets/logos/intelligem-logo.svg

-- ====================================
-- 6. FUNÇÕES AUXILIARES PARA STORAGE
-- ====================================

-- Função para limpar arquivos órfãos (sem referência em media_files)
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS INTEGER AS $$
DECLARE
    orphan_count INTEGER := 0;
    file_record RECORD;
BEGIN
    -- Buscar arquivos no storage que não estão referenciados na tabela media_files
    FOR file_record IN 
        SELECT bucket_id, name 
        FROM storage.objects 
        WHERE name NOT IN (SELECT file_path FROM media_files WHERE active = true)
    LOOP
        -- Registrar arquivo órfão (log)
        INSERT INTO media_files (
            filename, original_filename, file_path, file_size, mime_type,
            bucket_name, category, active, uploaded_at
        ) VALUES (
            'ORPHANED_' || file_record.name,
            'ORPHANED_' || file_record.name,
            file_record.name,
            0,
            'unknown/orphaned',
            file_record.bucket_id,
            'orphaned',
            false,
            NOW()
        );
        
        orphan_count := orphan_count + 1;
    END LOOP;
    
    RETURN orphan_count;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas de storage
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS TABLE (
    bucket_name TEXT,
    file_count BIGINT,
    total_size BIGINT,
    avg_size NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mf.bucket_name::TEXT,
        COUNT(*) as file_count,
        SUM(mf.file_size) as total_size,
        AVG(mf.file_size) as avg_size
    FROM media_files mf
    WHERE mf.active = true
    GROUP BY mf.bucket_name
    ORDER BY total_size DESC;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 7. TRIGGERS PARA MEDIA_FILES
-- ====================================

-- Trigger para validar extensões de arquivo
CREATE OR REPLACE FUNCTION validate_file_extension()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar extensão baseada no bucket
    IF NEW.bucket_name IN ('blog-images', 'case-images', 'site-assets') THEN
        IF NEW.mime_type NOT LIKE 'image/%' THEN
            RAISE EXCEPTION 'Only image files allowed in % bucket', NEW.bucket_name;
        END IF;
    END IF;
    
    -- Validar tamanho máximo (10MB para imagens)
    IF NEW.mime_type LIKE 'image/%' AND NEW.file_size > 10485760 THEN
        RAISE EXCEPTION 'Image file too large. Maximum size is 10MB';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_media_file_trigger
    BEFORE INSERT OR UPDATE ON media_files
    FOR EACH ROW EXECUTE FUNCTION validate_file_extension();

-- ====================================
-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ====================================

COMMENT ON POLICY "Public read blog images" ON storage.objects IS 'Permite leitura pública das imagens do blog';
COMMENT ON POLICY "Admin manage blog images" ON storage.objects IS 'Permite gerenciamento completo por administradores';

COMMENT ON FUNCTION cleanup_orphaned_files() IS 'Remove referências a arquivos órfãos no storage';
COMMENT ON FUNCTION get_storage_stats() IS 'Retorna estatísticas de uso do storage por bucket';

-- ====================================
-- ✅ STORAGE SETUP CONCLUÍDO!
-- ====================================

-- Verificar se os buckets foram criados corretamente:
SELECT id, name, public, created_at FROM storage.buckets ORDER BY created_at;

-- Verificar políticas criadas:
SELECT policyname, tablename FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Próximos passos:
-- 1. Testar upload de arquivo via interface do Supabase
-- 2. Configurar CORS se necessário
-- 3. Implementar service de upload no frontend
-- 4. Testar políticas de acesso