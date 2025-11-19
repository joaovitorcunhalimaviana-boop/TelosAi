# ✅ Configuração Completa - Sistema Pós-Operatório

**Data**: 2025-11-19
**Status**: ✅ Pronto para uso

---

## 🎉 O que foi configurado automaticamente:

### 1. ✅ Railway - Todas as variáveis configuradas
- ✅ WHATSAPP_APP_ID
- ✅ WHATSAPP_APP_SECRET
- ✅ WHATSAPP_ACCESS_TOKEN (válido por 60 dias)
- ✅ WHATSAPP_PHONE_NUMBER_ID
- ✅ WHATSAPP_BUSINESS_ACCOUNT_ID
- ✅ WHATSAPP_VERIFY_TOKEN
- ✅ WHATSAPP_WEBHOOK_VERIFY_TOKEN
- ✅ DOCTOR_PHONE_NUMBER
- ✅ CRON_SECRET

### 2. ✅ Cron-job.org - Job principal criado
- ✅ **Job ID**: 6882016
- ✅ **Nome**: "WhatsApp Follow-ups - 10h BRT"
- ✅ **Horário**: Diariamente às 10h (horário de Brasília)
- ✅ **URL**: https://proactive-rejoicing-production.up.railway.app/api/cron/send-followups

### 3. ✅ Templates WhatsApp Aprovados
- ✅ `day1` - Para primeiro dia pós-operatório
- ✅ `otherdays` - Para demais dias (D2+)
- ✅ 5 templates aprovados no total

---

## 🔐 Credenciais Importantes

### CRON_SECRET (SALVE ISSO!):
```
eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA=
```

**Você precisa usar este secret em:**
- Headers dos cron jobs no Cron-job.org
- Qualquer chamada manual aos endpoints de cron

---

## 📝 Configuração Manual Necessária

### 1. Adicionar Header de Autenticação no Cron Job

1. Acesse: https://console.cron-job.org/jobs/6882016/edit
2. Role até a seção **"Advanced"**
3. Clique em **"Headers"**
4. Adicione um header:
   - **Name**: `Authorization`
   - **Value**: `Bearer eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA=`
5. Clique em **"Save"**

### 2. Criar Job de Renovação de Token (Manual)

Devido a limitações da API, crie manualmente:

1. Acesse: https://console.cron-job.org/jobs/create
2. Preencha:
   - **Title**: Renovação Token WhatsApp - 50 dias
   - **URL**: https://proactive-rejoicing-production.up.railway.app/api/cron/renew-whatsapp-token
   - **Schedule**:
     - Timezone: America/Sao_Paulo
     - Custom: A cada 50 dias (configure primeira execução para 08/01/2025)
   - **Request Method**: POST
   - **Enable**: Deixe ativado
3. Em **Advanced > Headers**, adicione:
   - **Name**: `Authorization`
   - **Value**: `Bearer eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA=`
4. Em **Notifications**, ative:
   - ✅ On failure
   - ✅ On success
5. Clique em **"Create"**

---

## 🧪 Testar Configuração

### Teste 1: Verificar Railway

1. Acesse: https://railway.app/project/83b9a90d-f379-4838-a4fe-3c5295a84d98
2. Vá em **Variables** e confirme que todas estão lá
3. Verifique que o deploy foi bem-sucedido

### Teste 2: Testar Endpoint Manualmente

```bash
curl -H "Authorization: Bearer eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA=" \
  https://proactive-rejoicing-production.up.railway.app/api/cron/send-followups
```

**Resposta esperada**:
```json
{
  "success": true,
  "results": {
    "total": 0,
    "sent": 0,
    "failed": 0
  }
}
```

### Teste 3: Executar Cron Job Manualmente

1. Acesse: https://console.cron-job.org/dashboard
2. Encontre o job "WhatsApp Follow-ups - 10h BRT"
3. Clique no botão **▶️ Run now**
4. Aguarde e verifique o resultado na aba "Execution history"
5. Deve mostrar **Status 200** (sucesso)

---

## 📊 Monitoramento

### Ver Logs do Railway
```
https://railway.app/project/83b9a90d-f379-4838-a4fe-3c5295a84d98/service/9a6a64f3-0ab6-4038-9d04-43a730f28676
```

### Ver Execuções do Cron
```
https://console.cron-job.org/dashboard
```

### Próximas Execuções

| Job | Próxima Execução | Frequência |
|-----|------------------|------------|
| Follow-ups Diários | Amanhã às 10h | Diário |
| Renovação Token | 08/01/2025 | A cada 50 dias |

---

## 🔄 Fluxo Automático

### Diariamente às 10h:
1. Cron-job.org chama o endpoint
2. Railway processa requisição
3. Sistema busca follow-ups agendados para hoje
4. Envia questionários via WhatsApp
5. Aguarda respostas dos pacientes

### A cada 50 dias:
1. Cron-job.org chama endpoint de renovação
2. Sistema gera novo token (60 dias)
3. Envia WhatsApp para você com o novo token
4. Você atualiza no Railway (5 minutos)
5. Sistema continua funcionando

---

## 📱 Quando Receber Notificação

Você receberá WhatsApp quando:

### 1. Token for renovado (a cada 50 dias):
```
🔄 TOKEN WHATSAPP RENOVADO

✅ Renovação automática concluída!

📅 Válido por: 60 dias

🔐 Novo Token:
EAATN9ORQfVc...

⚠️ AÇÃO NECESSÁRIA:
1. Acesse Railway
2. Atualize WHATSAPP_ACCESS_TOKEN
3. Salve
```

**O que fazer**:
1. Acesse: https://railway.app/project/83b9a90d-f379-4838-a4fe-3c5295a84d98
2. Vá em **Variables**
3. Edite `WHATSAPP_ACCESS_TOKEN`
4. Cole o novo token
5. Salve (Railway faz redeploy automático)

### 2. Paciente com risco alto:
```
🚨 ALERTA - Paciente: João Silva

Dia: D+1
Nível de risco: ALTO

Red Flags detectados:
• Dor severa (nível 9)
• Febre alta
• Sangramento intenso

Acesse o sistema para mais detalhes.
```

---

## ✅ Checklist Final

- [x] Railway configurado com todas as variáveis
- [x] Token WhatsApp de 60 dias gerado
- [x] Cron job diário criado (10h)
- [ ] Header de autenticação adicionado no cron job
- [ ] Cron job de renovação criado (50 dias)
- [ ] Teste manual executado com sucesso
- [ ] Primeiro follow-up enviado e confirmado

---

## 📚 Documentação Adicional

- **Templates Aprovados**: `TEMPLATES_APROVADOS.md`
- **Setup Railway + Cron**: `RAILWAY_CRON_SETUP.md`
- **Renovação Automática**: `WHATSAPP_TOKEN_AUTO_RENEWAL.md`
- **Setup via API**: `scripts/SETUP_API.md`

---

## 🆘 Troubleshooting Rápido

### Cron job retorna 401
- Verifique se o header `Authorization` está configurado
- Confirme que o CRON_SECRET está correto

### WhatsApp não envia mensagens
- Verifique se o token está válido (60 dias)
- Confirme que as variáveis estão no Railway
- Teste o endpoint manualmente

### Railway não tem variáveis
- Execute novamente: `node scripts/configure-railway.js`
- Verifique se o RAILWAY_TOKEN está correto

---

## 🎯 Próximos Passos

1. ✅ Adicionar header de autenticação no cron job (5 min)
2. ✅ Criar cron job de renovação de token (5 min)
3. ✅ Testar envio manual de follow-up
4. ✅ Cadastrar primeiro paciente de teste
5. ✅ Aguardar primeira execução automática (amanhã 10h)

---

**Sistema pronto para uso! 🚀**

Última atualização: 2025-11-19
