# ✅ Checklist - Cadastrar Primeiro Paciente (Teste)

## 📋 O que você precisa fazer ANTES de cadastrar o primeiro paciente

### 1. ⚠️ **CONFIGURAR WEBHOOK NO META DEVELOPER CONSOLE** (OBRIGATÓRIO)

**URL Atual do Sistema:** `https://proactive-rejoicing-production.up.railway.app`

**Passos:**

1. Acesse: https://developers.facebook.com/apps/
2. Selecione seu app WhatsApp Business
3. Vá em **WhatsApp → Configuration → Webhook**
4. Clique em **Edit** ou **Configure Webhooks**
5. Configure:
   - **Callback URL**: `https://proactive-rejoicing-production.up.railway.app/api/whatsapp/webhook`
   - **Verify Token**: `meu-token-super-secreto-2024`
6. Clique em **Verify and Save**
7. ✅ Marque: **messages**
8. Salvar

**⚠️ IMPORTANTE:** Sem isso, o sistema NÃO vai receber mensagens do WhatsApp!

---

### 2. ✅ **VERIFICAÇÕES PRÉ-CADASTRO** (Tudo OK!)

| Item | Status | Detalhes |
|------|--------|----------|
| ✅ Database conectado | OK | Neon PostgreSQL funcionando |
| ✅ Variáveis de ambiente | OK | Todas configuradas no Railway |
| ✅ Deploy ativo | OK | https://proactive-rejoicing-production.up.railway.app |
| ✅ WhatsApp API configurado | OK | Phone ID: `857908160740631` |
| ✅ Claude AI configurado | OK | Anthropic API Key válida |
| ✅ Telefone do médico | OK | `5583991221599` |
| ⚠️ Webhook WhatsApp | **PENDENTE** | Precisa configurar no Meta Console |

---

## 🎯 Como Cadastrar o Primeiro Paciente (Teste)

### **Passo 1: Faça Login no Sistema**

1. Acesse: https://proactive-rejoicing-production.up.railway.app/auth/login
2. Faça login com suas credenciais

### **Passo 2: Vá para o Dashboard**

1. Após login, você será redirecionado para `/dashboard`
2. Clique no botão **"+ Novo Paciente"** (canto superior direito)

### **Passo 3: Preencha o Formulário Simplificado**

**Campos obrigatórios:**
- **Nome completo**: Ex: "João Silva Teste"
- **Data de nascimento**: Ex: "01/01/1980"
- **WhatsApp**: Ex: "(83) 99999-9999" (formato brasileiro)
- **Tipo de cirurgia**: Escolha uma opção:
  - Hemorroidectomia
  - Fístula anal
  - Fissura anal
  - Cisto pilonidal
- **Data da cirurgia**: Ex: hoje ou data da cirurgia

**Campos opcionais:**
- **Email**
- **Observações**: Notas sobre o paciente

### **Passo 4: Salvar**

1. Clique em **"Cadastrar Paciente"**
2. O sistema vai:
   - ✅ Criar o paciente no banco
   - ✅ Criar a cirurgia associada
   - ✅ Agendar follow-ups automáticos (D+1, D+2, D+3, D+5, D+7, D+10, D+14)
   - ✅ Enviar primeira mensagem via WhatsApp (se o cron estiver ativo)

---

## 📱 Testando o WhatsApp

### **O que vai acontecer:**

1. **Agendamento automático**: Follow-ups agendados para D+1, D+2, etc
2. **Envio via cron**: Todo dia às 9h AM (horário de Brasília), o sistema:
   - Verifica follow-ups agendados para hoje
   - Envia questionário via WhatsApp
   - Marca como "sent"

3. **Paciente responde**: Quando o paciente responder:
   - Webhook recebe a mensagem
   - IA analisa a resposta
   - Detecta red flags
   - Envia resposta empática
   - Alerta o médico se necessário (risco alto/crítico)

### **Como testar AGORA (sem esperar cron):**

**Opção 1: Executar cron manualmente**
```bash
# Acesse a URL do cron:
https://proactive-rejoicing-production.up.railway.app/api/cron/send-followups
```

**Opção 2: Enviar mensagem de teste**
```bash
# Use a API de teste do WhatsApp:
curl -X POST https://proactive-rejoicing-production.up.railway.app/api/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5583999999999",
    "message": "Teste de envio"
  }'
```

---

## 🔍 Monitorando o Teste

### **Ver logs em tempo real:**
```bash
railway logs
```

### **Verificar no Dashboard:**
1. Vá em `/dashboard`
2. Veja o card do paciente teste
3. Clique para ver detalhes
4. Veja follow-ups agendados e enviados

### **Verificar no banco (opcional):**
```bash
railway run npx prisma studio
```

---

## ⚠️ Troubleshooting

### **Problema: WhatsApp não recebe mensagens**

**Checklist:**
- [ ] Webhook configurado no Meta Console?
- [ ] URL do webhook está correta?
- [ ] Verify token está correto?
- [ ] Subscribed to "messages" events?
- [ ] WhatsApp Access Token válido?
- [ ] Phone Number ID correto?

**Testar webhook:**
```bash
curl "https://proactive-rejoicing-production.up.railway.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=meu-token-super-secreto-2024&hub.challenge=test123"

# Deve retornar: test123
```

### **Problema: Paciente não recebe questionário**

**Possíveis causas:**
1. Follow-up não foi agendado → Verificar no banco
2. Cron não executou → Executar manualmente
3. WhatsApp API com erro → Ver logs
4. Número de telefone inválido → Verificar formato

### **Problema: Sistema não recebe respostas**

**Checklist:**
- [ ] Webhook configurado?
- [ ] Railway está rodando?
- [ ] Ver logs: `railway logs`

---

## 📊 Fluxo Completo do Primeiro Paciente

```mermaid
1. [VOCÊ] Cadastra paciente no /dashboard
   ↓
2. [SISTEMA] Cria paciente + cirurgia + follow-ups (D+1 a D+14)
   ↓
3. [CRON - 9h] Envia questionário via WhatsApp (D+1)
   ↓
4. [PACIENTE] Responde ao questionário
   ↓
5. [WEBHOOK] Recebe resposta → IA analisa → Detecta red flags
   ↓
6. [SISTEMA] Envia resposta empática ao paciente
   ↓
7. [MÉDICO] Recebe alerta se risco alto/crítico (via WhatsApp)
```

---

## 🎯 Resumo: O que falta fazer AGORA

| # | Ação | Urgência |
|---|------|----------|
| 1 | **Configurar webhook no Meta Console** | 🔴 **CRÍTICO** |
| 2 | Fazer login no sistema | ✅ Pronto |
| 3 | Cadastrar paciente teste | ✅ Pronto |
| 4 | Executar cron manualmente (ou esperar 9h) | 🟡 Opcional |
| 5 | Monitorar logs | 🟡 Recomendado |

---

## 📞 Contatos de Suporte

**Sistema:** https://proactive-rejoicing-production.up.railway.app
**Railway Dashboard:** https://railway.com/project/83b9a90d-f379-4838-a4fe-3c5295a84d98
**Meta Developer Console:** https://developers.facebook.com/apps/

---

## ✨ Após o Primeiro Paciente Teste

1. ✅ Verificar que o questionário foi enviado
2. ✅ Responder como paciente e ver se IA analisa
3. ✅ Verificar se médico recebe alerta (se houver red flag)
4. ✅ Conferir dashboard com dados atualizados
5. 🎉 **Sistema pronto para produção!**

---

**Última atualização:** 2025-11-13
**Status:** ⚠️ Falta apenas configurar webhook do WhatsApp
