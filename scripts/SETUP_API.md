# Scripts de Configuração - Railway + Cron-job.org

Scripts Node.js para configurar automaticamente o sistema de acompanhamento pós-operatório via APIs.

---

## 📋 Pré-requisitos

1. **Node.js** instalado (versão 18+)
2. **Railway API Token** - Obtenha em: https://railway.com/account/tokens
3. **Cron-job.org API Key** - Obtenha em: https://console.cron-job.org/settings

---

## 🚀 Configuração Rápida

### 1. Configure o Railway

```bash
# Opção 1: Editar o arquivo scripts/configure-railway.js e colar seu token
# RAILWAY_TOKEN = 'seu_token_aqui'

# Opção 2: Usar variável de ambiente
set RAILWAY_TOKEN=seu_token_aqui
node scripts/configure-railway.js
```

**Resultado**:
- ✅ Todas as variáveis de ambiente configuradas
- ✅ CRON_SECRET gerado automaticamente
- ✅ Railway fará redeploy automático

**Importante**: Copie o `CRON_SECRET` gerado! Você vai precisar dele.

---

### 2. Configure o Cron-job.org

**2.1. Obter API Key**:
1. Acesse: https://console.cron-job.org/
2. Crie uma conta (se ainda não tem)
3. Vá em **Settings** > **API**
4. Clique em **"Create API Key"**
5. Copie a API key

**2.2. Executar script**:
```bash
# Opção 1: Editar o arquivo scripts/configure-cronjob.js e colar sua API key
# CRONJOB_API_KEY = 'sua_api_key_aqui'
# CRON_SECRET = 'o_secret_gerado_pelo_script_anterior'

# Opção 2: Usar variáveis de ambiente
set CRONJOB_API_KEY=sua_api_key_aqui
set CRON_SECRET=secret_gerado_anteriormente
node scripts/configure-cronjob.js
```

**Resultado**:
- ✅ Cron job "Follow-ups Diários" criado (10h da manhã)
- ✅ Cron job "Renovação Token" criado
- ⚠️ Ajuste manual necessário para "a cada 50 dias"

---

## 📝 Configuração Manual do Cron de 50 dias

O script cria o job, mas você precisa ajustar para executar a cada 50 dias:

1. Acesse: https://console.cron-job.org/dashboard
2. Encontre o job "Renovação Token WhatsApp (50 dias)"
3. Clique em **Edit**
4. Na seção **Schedule**:
   - Clique em **Advanced**
   - No campo "Cron expression", cole: `0 0 */50 * *`
   - OU configure: "Every 50 days at 00:00"
5. Clique em **Save**

---

## 🧪 Testar Configuração

### Testar Railway:
```bash
curl -H "Authorization: Bearer SEU_CRON_SECRET" \
  https://proactive-rejoicing-production.up.railway.app/api/cron/send-followups
```

### Testar Cron-job.org:
1. Acesse: https://console.cron-job.org/dashboard
2. Clique no job criado
3. Clique em **▶️ Run now**
4. Verifique o resultado na aba "Execution history"

---

## 📁 Estrutura dos Scripts

```
scripts/
├── configure-railway.js     # Configura variáveis no Railway
├── configure-cronjob.js     # Cria cron jobs no Cron-job.org
└── SETUP_API.md            # Esta documentação
```

---

## 🔧 Variáveis Configuradas no Railway

| Variável | Descrição |
|----------|-----------|
| `WHATSAPP_APP_ID` | ID do app Meta |
| `WHATSAPP_APP_SECRET` | Secret do app Meta |
| `WHATSAPP_ACCESS_TOKEN` | Token de acesso (60 dias) |
| `WHATSAPP_PHONE_NUMBER_ID` | ID do número WhatsApp |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | ID da conta Business |
| `WHATSAPP_VERIFY_TOKEN` | Token de verificação webhook |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Token webhook (mesmo acima) |
| `DOCTOR_PHONE_NUMBER` | Telefone para receber alertas |
| `CRON_SECRET` | Secret para autenticar cron jobs |

---

## ⏰ Cron Jobs Criados

### 1. WhatsApp Follow-ups Diários
- **Frequência**: Diariamente às 10:00 BRT
- **Endpoint**: `/api/cron/send-followups`
- **Método**: GET
- **Função**: Envia questionários de acompanhamento

### 2. Renovação Token WhatsApp
- **Frequência**: A cada 50 dias às 00:00 BRT
- **Endpoint**: `/api/cron/renew-whatsapp-token`
- **Método**: POST
- **Função**: Renova token antes de expirar
- **Notificação**: Envia WhatsApp com novo token

---

## 🛠️ Troubleshooting

### Erro: "Invalid token" no Railway
**Solução**:
- Verifique se copiou o token completo de https://railway.com/account/tokens
- Certifique-se que é um **Account Token** ou **Project Token**

### Erro: "Unauthorized" no Cron-job.org
**Solução**:
- Verifique se a API key está correta
- Confirme que copiou a key completa das configurações

### Erro: "CRON_SECRET not found"
**Solução**:
- Execute primeiro `configure-railway.js`
- Copie o CRON_SECRET gerado
- Use no `configure-cronjob.js`

### Railway não está fazendo redeploy
**Solução**:
- Aguarde alguns segundos
- Verifique em: https://railway.app/project/83b9a90d-f379-4838-a4fe-3c5295a84d98
- Vá em "Deployments" e verifique o status

---

## 📚 Documentação das APIs

- **Railway API**: https://docs.railway.com/guides/public-api
- **Cron-job.org API**: https://docs.cron-job.org/rest-api.html
- **GraphiQL Playground**: https://railway.com/graphiql

---

## ✅ Checklist Completo

- [ ] Node.js instalado
- [ ] Railway API Token obtido
- [ ] Executado `configure-railway.js`
- [ ] CRON_SECRET copiado
- [ ] Conta Cron-job.org criada
- [ ] Cron-job.org API Key obtida
- [ ] Executado `configure-cronjob.js`
- [ ] Job de 50 dias ajustado manualmente
- [ ] Testes manuais executados
- [ ] Primeira notificação recebida

---

**Última atualização**: 2025-11-19
**Versão**: 1.0.0
