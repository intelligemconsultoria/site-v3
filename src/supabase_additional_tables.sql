-- 🗄️ TABELAS ADICIONAIS - SUPABASE INTELLIGEM
-- Execute este script APÓS o supabase_setup.sql

-- ====================================
-- 1. TABELA KV_STORE (Para o servidor)
-- ====================================

-- Tabela Key-Value store para o servidor edge function
CREATE TABLE kv_store_a91235ef (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para performance
CREATE INDEX idx_kv_store_key ON kv_store_a91235ef(key);
CREATE INDEX idx_kv_store_updated_at ON kv_store_a91235ef(updated_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_kv_store_updated_at 
    BEFORE UPDATE ON kv_store_a91235ef 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- 2. TABELA MEETING_REQUESTS
-- ====================================

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
    preferred_time TIMESTAMP WITH TIME ZONE NOT NULL,
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
    lead_quality VARCHAR(20),
    
    -- Integração com Calendário
    calendar_event_id VARCHAR(255),
    meeting_link TEXT,
    
    -- Follow-up e Resultados
    follow_up_required BOOLEAN DEFAULT TRUE,
    meeting_outcome VARCHAR(50),
    proposal_value DECIMAL(10,2),
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Relacionamentos
    assigned_to UUID REFERENCES admin_users(id),
    related_case_study_id UUID,
    
    -- Validações
    CONSTRAINT valid_meeting_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_qualification_score CHECK (qualification_score >= 1 AND qualification_score <= 10),
    CONSTRAINT valid_meeting_time CHECK (preferred_time > NOW())
);

-- ====================================
-- 3. TABELA EMAIL_NOTIFICATIONS
-- ====================================

CREATE TABLE email_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Identificação do E-mail
    email_type VARCHAR(30) NOT NULL 
        CHECK (email_type IN ('meeting_notification', 'meeting_confirmation', 'newsletter', 'follow_up', 'reminder')),
    
    -- Destinatário
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(150),
    
    -- Conteúdo
    subject TEXT NOT NULL,
    email_content TEXT NOT NULL,
    template_used VARCHAR(50),
    
    -- Relacionamentos
    related_meeting_id UUID REFERENCES meeting_requests(id) ON DELETE SET NULL,
    related_contact_id UUID REFERENCES contact_submissions(id) ON DELETE SET NULL,
    related_newsletter_id UUID REFERENCES newsletter_subscribers(id) ON DELETE SET NULL,
    
    -- Status e Delivery
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked')),
    provider_response JSONB,
    provider_message_id TEXT,
    
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
    priority INTEGER DEFAULT 5,
    
    CONSTRAINT valid_email_recipient CHECK (recipient_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ====================================
-- 4. ÍNDICES PARA PERFORMANCE
-- ====================================

-- Meeting Requests
CREATE INDEX idx_meeting_requests_status ON meeting_requests(status, created_at DESC);
CREATE INDEX idx_meeting_requests_solution ON meeting_requests(interested_solution);
CREATE INDEX idx_meeting_requests_source ON meeting_requests(source_page);
CREATE INDEX idx_meeting_requests_email ON meeting_requests(email);
CREATE INDEX idx_meeting_requests_preferred_time ON meeting_requests(preferred_time);

-- Email Notifications
CREATE INDEX idx_email_notifications_type ON email_notifications(email_type, created_at DESC);
CREATE INDEX idx_email_notifications_status ON email_notifications(status, created_at DESC);
CREATE INDEX idx_email_notifications_recipient ON email_notifications(recipient_email);
CREATE INDEX idx_email_notifications_meeting ON email_notifications(related_meeting_id);

-- ====================================
-- 5. TRIGGERS
-- ====================================

-- Meeting Requests
CREATE TRIGGER update_meeting_requests_updated_at 
    BEFORE UPDATE ON meeting_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- 6. ROW LEVEL SECURITY
-- ====================================

-- KV Store - apenas para funções do servidor
ALTER TABLE kv_store_a91235ef ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access only" ON kv_store_a91235ef
    FOR ALL USING (auth.role() = 'service_role');

-- Meeting Requests
ALTER TABLE meeting_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create meeting requests" ON meeting_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage meeting requests" ON meeting_requests
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

-- Email Notifications
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read email notifications" ON email_notifications
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE active = true)
    );

CREATE POLICY "Service role manage emails" ON email_notifications
    FOR ALL USING (auth.role() = 'service_role');

-- ====================================
-- 7. VIEWS ÚTEIS
-- ====================================

-- View de reuniões pendentes
CREATE VIEW pending_meetings AS
SELECT 
    id, contact_name, email, company, interested_solution,
    meeting_type, preferred_time, source_page, created_at
FROM meeting_requests 
WHERE status = 'pending'
ORDER BY preferred_time ASC;

-- View de estatísticas de reuniões
CREATE VIEW meeting_stats AS
SELECT 
    COUNT(*) as total_meetings,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_meetings,
    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_meetings,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_meetings,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_meetings,
    interested_solution,
    source_page
FROM meeting_requests 
GROUP BY interested_solution, source_page;

-- ====================================
-- 8. COMENTÁRIOS
-- ====================================

COMMENT ON TABLE kv_store_a91235ef IS 'Key-Value store para edge functions do servidor';
COMMENT ON TABLE meeting_requests IS 'Solicitações de reunião e agendamentos';
COMMENT ON TABLE email_notifications IS 'Log de emails enviados pelo sistema';

-- ====================================
-- ✅ TABELAS ADICIONAIS CRIADAS!
-- ====================================