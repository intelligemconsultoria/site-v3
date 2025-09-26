# 🔄 MUDANÇAS NOS CAMPOS DOS SERVICES

## 📋 BLOG ARTICLES

### Campos que mudaram:
- `readTime` → `read_time`
- `image` → `image_url`  
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`

### Novos campos adicionados:
- `view_count` (número de visualizações)
- `meta_description` (descrição para SEO)
- `meta_keywords` (palavras-chave para SEO)

---

## 📊 CASE STUDIES

### Campos que mudaram:
- `image` → `image_url`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`
- `metrics` → agora é JSONB (era objeto simples)

### Novos campos adicionados:
- `view_count` (número de visualizações)

---

## 🤝 MEETING REQUESTS

### Campos que mudaram:
- `contactName` → `contact_name`
- `interestedSolution` → `interested_solution`
- `preferredTime` → `preferred_time`
- `sourceSection` → `source_page`
- `createdAt` → `created_at`

### Novos campos adicionados:
- `meeting_type` ('demo' | 'consultation' | 'technical')
- `actual_meeting_time`
- `meeting_duration`
- `specific_challenges`
- `preparation_notes`
- `qualification_score`
- `lead_quality`
- `calendar_event_id`
- `meeting_link`
- `follow_up_required`
- `meeting_outcome`
- `proposal_value`
- `updated_at`
- `confirmed_at`
- `completed_at`
- `assigned_to`
- `related_case_study_id`

---

## 📧 NEWSLETTER SUBSCRIBERS

### Campos que mudaram:
- `subscribedAt` → `subscribed_at`

### Novos campos adicionados:
- `confirmed` (confirmação por email)
- `interests` (array de interesses)
- `source` (origem da inscrição)
- `confirmed_at`
- `unsubscribed_at`

---

## 🎯 COMPONENTES QUE PRECISAM SER ATUALIZADOS

### Componentes que usam campos antigos:
1. **BlogSection.tsx** - usa `readTime`, `image`
2. **CasesSection.tsx** - usa `image`
3. **BlogAdmin.tsx** - usa todos os campos antigos
4. **ArticleReader.tsx** - usa campos antigos
5. **CaseReader.tsx** - usa campos antigos
6. **ArticleEditor.tsx** - usa campos antigos
7. **CaseEditor.tsx** - usa campos antigos
8. **MeetingRequestModal.tsx** - usa campos antigos
9. **MeetingsDashboard.tsx** - usa campos antigos

### Como lidar com as mudanças:
1. **Opção 1**: Criar mappers nos services para converter nomes
2. **Opção 2**: Atualizar todos os componentes para usar novos nomes
3. **Opção 3**: Criar interfaces compatíveis com ambos os nomes

**Recomendação**: Usar Opção 1 temporariamente e migrar gradualmente para Opção 2.

---

## 🔧 PRÓXIMOS PASSOS

1. ✅ Criar tabelas no Supabase (executar SQL scripts)
2. ✅ Implementar services conectados
3. 🔄 Atualizar componentes para novos nomes de campos
4. 🔄 Testar todas as funcionalidades
5. 🔄 Migrar dados do localStorage para Supabase (se necessário)