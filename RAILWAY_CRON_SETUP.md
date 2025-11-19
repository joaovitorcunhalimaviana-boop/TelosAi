# Configuração de Cron Jobs no Railway usando Cron-job.org

**Plataforma**: Railway
**Serviço de Cron**: Cron-job.org (Gratuito)
**Data**: 2025-11-19

---

## 🎯 Visão Geral

Como o Railway não tem suporte nativo para cron jobs, usamos o **Cron-job.org** - um serviço externo gratuito que chama endpoints HTTP em horários programados.

---

## 📋 Passo a Passo

### 1. Criar Conta no Cron-job.org

1. **Acesse**: https://cron-job.org/
2. **Clique em "Sign Up"** (Cadastrar)
3. **Preencha**:
   - Email: seu@email.com
   - Senha
   - Confirme email

### 2. Configurar Cron Job para Envio de Follow-ups Diários

#### 2.1 Criar Novo Cron Job

1. **No dashboard**, clique em **"Create cronjob"**
2. **Preencha**:

**Title (Título)**:
```
WhatsApp Follow-ups Diários
```

**URL**:
```
https://proactive-rejoicing-production.up.railway.app/api/cron/send-followups
```

**Schedule (Agendamento)**:
- **Every**: Day
- **At**: 10:00 (ou o horário que preferir)
- **Timezone**: America/Sao_Paulo (Brasília)

**Request Method**: `GET`

**Request Headers** (Cabeçalhos):
Clique em **"Add header"** e adicione:
- **Key**: `Authorization`
- **Value**: `Bearer SEU_CRON_SECRET`

> ⚠️ Substitua `SEU_CRON_SECRET` pelo valor da variável `CRON_SECRET` do seu `.env`

**Advanced Options**:
- ✅ Enable job
- ✅ Save responses
- ✅ Send notification on failure

3. **Clique em "Create cronjob"**

---

### 3. Configurar Cron Job para Renovação de Token (A cada 50 dias)

#### 3.1 Criar Segundo Cron Job

1. **No dashboard**, clique em **"Create cronjob"** novamente
2. **Preencha**:

**Title**:
```
Renovação Token WhatsApp (50 dias)
```

**URL**:
```
https://proactive-rejoicing-production.up.railway.app/api/cron/renew-whatsapp-token
```

**Schedule**:
- **Every**: `50 days`
- **At**: `00:00` (meia-noite)
- **Timezone**: America/Sao_Paulo

> 💡 **Como configurar "a cada 50 dias"**:
> - Clique em **"Advanced"**
> - No campo "Cron expression", cole: `0 0 */50 * *`
> - OU configure manualmente para rodar a cada 50 dias a partir da data atual

**Request Method**: `POST`

**Request Headers**:
- **Key**: `Authorization`
- **Value**: `Bearer SEU_CRON_SECRET`

**Advanced Options**:
- ✅ Enable job
- ✅ Save responses
- ✅ Send notification on failure
- ✅ Send notification on success

3. **Clique em "Create cronjob"**

---

## 🧪 Testar os Cron Jobs

### Teste Imediato

1. **No dashboard do Cron-job.org**
2. **Encontre seu cron job**
3. **Clique no ícone "▶️ Run now"** (Executar agora)
4. **Aguarde** e verifique o resultado

### Verificar Logs

1. **Clique no cron job**
2. **Veja a aba "Execution history"**
3. **Verifique**:
   - Status: `200 OK` = Sucesso
   - Status: `401` = Erro de autenticação (verifique CRON_SECRET)
   - Status: `500` = Erro interno (verifique logs do Railway)

---

## 🔐 Segurança

### CRON_SECRET

Certifique-se de que `CRON_SECRET` está configurado:

**No Railway**:
1. Acesse seu projeto no Railway
2. Vá em **Variables**
3. Adicione: `CRON_SECRET` = `seu-secret-aqui`

**Gerando um CRON_SECRET seguro**:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 📅 Cronograma dos Cron Jobs

| Cron Job | Frequência | Horário | Próxima Execução |
|----------|-----------|---------|------------------|
| **Follow-ups Diários** | Diariamente | 10:00 BRT | Todo dia às 10h |
| **Renovação Token** | A cada 50 dias | 00:00 BRT | 08/01/2025 |

---

## 🔔 Notificações

### Email de Sucesso/Falha

O Cron-job.org enviará emails quando:
- ✅ Job executado com sucesso (opcional)
- ❌ Job falhou
- ⚠️ Job não retornou 200 OK

### WhatsApp (Renovação Token)

Quando o token for renovado, você receberá WhatsApp com:
- Novo token
- Data de expiração
- Instruções para atualizar no Railway

---

## 🛠️ Atualizar Token no Railway

Quando receber notificação de renovação:

### 1. Acessar Railway:
- URL: https://railway.app/
- Faça login

### 2. Selecionar Projeto:
- Clique no seu projeto

### 3. Atualizar Variável:
1. Vá em **Variables**
2. Encontre `WHATSAPP_ACCESS_TOKEN`
3. Clique para editar
4. Cole o novo token
5. Clique em **Save**
6. Railway fará redeploy automático

---

## 📊 Monitoramento

### Verificar Execuções

**No Cron-job.org**:
1. Dashboard > Seus cron jobs
2. Clique em um job
3. Aba **"Execution history"**
4. Veja todas as execuções, status e respostas

**No Railway**:
1. Seu projeto > **Deployments**
2. Clique no deployment ativo
3. **View Logs**
4. Filtre por: `cron` ou `renew-token`

---

## 🆘 Troubleshooting

### Problema: Cron job retorna 401 Unauthorized

**Solução**:
1. Verifique se o header `Authorization` está correto
2. Confirme que `CRON_SECRET` no Railway está igual ao do Cron-job.org
3. Teste manualmente:
```bash
curl -H "Authorization: Bearer SEU_CRON_SECRET" \
  https://proactive-rejoicing-production.up.railway.app/api/cron/send-followups
```

### Problema: Cron job não está executando

**Solução**:
1. Verifique se o job está **Enabled** no Cron-job.org
2. Confirme o timezone está correto (America/Sao_Paulo)
3. Verifique limites da conta (gratuita tem limite)

### Problema: Railway retorna 500 Internal Error

**Solução**:
1. Verifique logs do Railway
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Teste o endpoint manualmente

---

## 💰 Limites do Plano Gratuito

**Cron-job.org Free Tier**:
- ✅ Até 3 cron jobs
- ✅ Execuções ilimitadas
- ✅ Mínimo intervalo: 1 minuto
- ✅ Sem cartão de crédito necessário
- ✅ Retention de logs: 30 dias

**Nosso uso**:
- 2 cron jobs (Follow-ups + Renovação)
- Bem dentro do limite gratuito

---

## 🎓 URLs dos Endpoints

### 1. Envio Diário de Follow-ups
```
GET https://proactive-rejoicing-production.up.railway.app/api/cron/send-followups
Headers: Authorization: Bearer SEU_CRON_SECRET
```

### 2. Renovação Automática de Token
```
POST https://proactive-rejoicing-production.up.railway.app/api/cron/renew-whatsapp-token
Headers: Authorization: Bearer SEU_CRON_SECRET
```

### 3. Renovação Manual de Token
```
POST https://proactive-rejoicing-production.up.railway.app/api/whatsapp/renew-token
Headers: Authorization: Bearer SEU_CRON_SECRET
```

---

## ✅ Checklist de Configuração

- [x] Endpoints de cron criados no projeto
- [x] Conta no Cron-job.org criada
- [ ] CRON_SECRET gerado e adicionado no Railway
- [ ] Cron job "Follow-ups Diários" criado
- [ ] Cron job "Renovação Token" criado
- [ ] Teste manual executado com sucesso
- [ ] Notificações configuradas
- [ ] Primeira execução automática verificada

---

## 🔗 Links Úteis

- **Cron-job.org**: https://cron-job.org/
- **Railway Dashboard**: https://railway.app/
- **Seu App**: https://proactive-rejoicing-production.up.railway.app/
- **Documentação Railway**: https://docs.railway.app/

---

## 📝 Próximos Passos

1. ✅ Criar conta no Cron-job.org
2. ✅ Configurar os 2 cron jobs
3. ✅ Testar execução manual
4. ✅ Aguardar primeira execução automática (amanhã às 10h)
5. ✅ Verificar notificação WhatsApp quando token renovar

---

**Última atualização**: 2025-11-19
**Status**: 📝 Aguardando configuração no Cron-job.org
