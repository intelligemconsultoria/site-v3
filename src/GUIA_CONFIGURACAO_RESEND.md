# 🚀 Guia Completo de Configuração do Resend

Este guia vai te ajudar a configurar o Resend corretamente para que os e-mails automáticos funcionem.

## ❗ Problema Identificado

Você implementou tudo corretamente no código, mas há algumas configurações no **Resend** que precisam ser feitas para que os e-mails sejam enviados.

## 📋 Checklist de Configuração

### 1. ✅ Criar Conta no Resend
- [ ] Acesse [resend.com](https://resend.com)
- [ ] Crie uma conta (use o e-mail da empresa)
- [ ] Confirme o e-mail

### 2. 🔑 Obter API Key
- [ ] Acesse [resend.com/api-keys](https://resend.com/api-keys)
- [ ] Clique em "Create API Key"
- [ ] Nome: `IntelliGem Production`
- [ ] Permissão: `Sending access`
- [ ] **Copie a chave e guarde com segurança**

### 3. 🌐 Configurar Domínio (IMPORTANTE!)
- [ ] Acesse [resend.com/domains](https://resend.com/domains)
- [ ] Clique em "Add Domain"
- [ ] Digite: `intelligem.com.br`
- [ ] Copie os registros DNS fornecidos
- [ ] Configure no seu provedor de DNS:

```dns
Tipo: TXT
Nome: @
Valor: [valor fornecido pelo Resend]

Tipo: CNAME  
Nome: rs._domainkey
Valor: [valor fornecido pelo Resend]
```

### 4. ⚙️ Configurar no Supabase
- [ ] Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Vá em `Edge Functions` → `Environment Variables`
- [ ] Adicione/edite a variável:
  - **Nome:** `RESEND_API_KEY`
  - **Valor:** [a chave que você copiou no passo 2]

### 5. 🧪 Testar a Configuração
- [ ] Acesse o dashboard administrativo do seu site
- [ ] Vá na aba "Sistema de E-mails"
- [ ] Clique em "Diagnóstico" para verificar se tudo está funcionando
- [ ] Clique em "Testar E-mails" para enviar um teste

## 🔍 Verificações de Troubleshooting

### Se os e-mails não chegarem:

1. **Verifique o domínio:**
   - O domínio `intelligem.com.br` DEVE estar verificado no Resend
   - Status deve estar "Verified" (verde)

2. **Verifique a API Key:**
   - Deve começar com `re_`
   - Deve ter permissão de "Sending access"

3. **Verifique modo Sandbox:**
   - Por padrão, o Resend opera em modo sandbox
   - Isso significa que só envia para e-mails verificados
   - Para produção, pode precisar fazer upgrade do plano

4. **Logs do Resend:**
   - Acesse [resend.com/logs](https://resend.com/logs)
   - Verifique se há tentativas de envio
   - Veja os erros específicos

## 📧 Configuração de DNS Detalhada

Quando você adicionar o domínio no Resend, receberá instruções similares a estas:

```dns
# Registro TXT para verificação do domínio
Tipo: TXT
Nome: @
Valor: resend-verify=abc123def456

# Registro CNAME para autenticação DKIM
Tipo: CNAME
Nome: rs._domainkey
Valor: rs._domainkey.resend.com

# Opcional: Registro TXT para SPF
Tipo: TXT
Nome: @
Valor: v=spf1 include:_spf.resend.com ~all
```

## 🚨 Pontos Importantes

1. **Tempo de Propagação DNS:** Pode levar até 24h para os registros DNS se propagarem
2. **Verificação do Domínio:** Essencial para evitar que os e-mails sejam marcados como spam
3. **Modo Sandbox:** Contas gratuitas podem ter limitações
4. **Rate Limits:** Verifique os limites do seu plano

## 📱 Como Testar

1. **Teste Interno (com diagnóstico):**
   - Use o botão "Diagnóstico" no dashboard
   - Verifica conectividade e configuração

2. **Teste Real:**
   - Use o botão "Testar E-mails"
   - Envia e-mails reais para verificar templates

3. **Teste com Agendamento:**
   - Faça um agendamento real pelo site
   - Verifique se chegaram os 2 e-mails (interno + cliente)

## 🔧 Se Ainda Não Funcionar

1. **Verifique os logs:**
   ```bash
   # No console do navegador, procure por erros de API
   # No Resend Dashboard, verifique os logs de envio
   ```

2. **Use e-mail temporário:**
   - Para testes, use o seu próprio e-mail
   - Ou use serviços como temp-mail.org

3. **Contato com Resend:**
   - Suporte: [resend.com/support](https://resend.com/support)
   - Documentação: [resend.com/docs](https://resend.com/docs)

## ✅ Resultado Esperado

Após a configuração correta:
- ✅ E-mails chegam na caixa de entrada (não spam)
- ✅ Templates aparecem formatados corretamente
- ✅ Diagnóstico mostra tudo funcionando
- ✅ Logs do Resend mostram entregas com sucesso

---

**💡 Dica:** Use o componente de diagnóstico que acabei de criar para facilitar a identificação de problemas!