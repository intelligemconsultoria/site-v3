# 🚨 Solução para Erro 403 do Supabase

## 📋 **Problema Identificado:**
O erro 403 indica que o usuário autenticado não tem permissão para inserir dados na tabela `blog_articles` devido às políticas RLS (Row Level Security) do Supabase.

## 🔧 **Soluções:**

### **1. Solução Rápida (Desenvolvimento)**
Execute este SQL no **SQL Editor** do Supabase Dashboard:

```sql
-- Desabilitar RLS temporariamente (APENAS PARA DESENVOLVIMENTO)
ALTER TABLE blog_articles DISABLE ROW LEVEL SECURITY;
```

### **2. Solução Correta (Produção)**
Execute o arquivo `supabase_rls_fix.sql` no **SQL Editor** do Supabase Dashboard.

### **3. Verificar Status**
1. Acesse o painel de debug em: `http://localhost:3001/debug` (se implementado)
2. Ou use o console do navegador: `window.logger.getLogs()`

## 🔍 **Diagnóstico Detalhado:**

### **Logs do Supabase:**
- **Status**: 403 Forbidden
- **Usuário**: Autenticado (`ad9633bc-3403-4458-bf43-46a3349a275f`)
- **JWT**: Válido e não expirado
- **Problema**: Políticas RLS bloqueando inserção

### **Tabelas Afetadas:**
- `blog_articles` - Erro 403
- Possivelmente outras tabelas com RLS habilitado

## 🛠️ **Passos para Correção:**

### **Passo 1: Acessar Supabase Dashboard**
1. Vá para [supabase.com](https://supabase.com)
2. Acesse seu projeto
3. Vá em **SQL Editor**

### **Passo 2: Executar Script de Correção**
Copie e cole o conteúdo do arquivo `supabase_rls_fix.sql` no SQL Editor e execute.

### **Passo 3: Verificar Políticas**
Execute esta query para verificar as políticas:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'blog_articles'
ORDER BY policyname;
```

### **Passo 4: Testar Aplicação**
1. Recarregue a aplicação
2. Tente criar um novo artigo
3. Verifique os logs no console

## 🔐 **Políticas RLS Recomendadas:**

```sql
-- Permitir leitura para todos
CREATE POLICY "Permitir leitura de artigos para todos" ON blog_articles
    FOR SELECT USING (true);

-- Permitir inserção para usuários autenticados
CREATE POLICY "Permitir inserção de artigos para usuários autenticados" ON blog_articles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir atualização para usuários autenticados
CREATE POLICY "Permitir atualização de artigos para usuários autenticados" ON blog_articles
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Permitir exclusão para usuários autenticados
CREATE POLICY "Permitir exclusão de artigos para usuários autenticados" ON blog_articles
    FOR DELETE USING (auth.role() = 'authenticated');
```

## 🚨 **Importante:**
- **Desenvolvimento**: Pode desabilitar RLS temporariamente
- **Produção**: SEMPRE use políticas RLS adequadas
- **Teste**: Sempre teste as políticas antes de fazer deploy

## 📞 **Suporte:**
Se o problema persistir, verifique:
1. Se o usuário está realmente autenticado
2. Se as políticas RLS foram aplicadas corretamente
3. Se há conflitos entre políticas
4. Logs detalhados no console do navegador
