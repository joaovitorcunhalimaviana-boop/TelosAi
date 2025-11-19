# 🚀 MIGRAÇÃO COMPLETA: Railway → Vercel

## ✅ STATUS ATUAL

### O que JÁ foi feito:
- ✅ Deploy no Vercel completo
- ✅ Middleware corrigido (auth sem Prisma, compatível com Edge)
- ✅ Webhook bypass criado (`/api/webhook-bypass`)
- ✅ Deployment Protection desabilitada (você fez manualmente)
- ✅ Vercel.json configurado (1 cron job - send-followups às 10h)

### O que FALTA fazer:

## 📋 PASSO A PASSO

### 1. Configurar Variáveis de Ambiente no Vercel

**Acesse:** https://vercel.com/joao-vitor-vianas-projects/sistema-pos-operatorio/settings/environment-variables

**Adicione estas variáveis (Production):**

```bash
# Anthropic Claude AI
ANTHROPIC_API_KEY=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

# NextAuth
AUTH_SECRET=7lBvFRYgEcVpCiELM1zcfh1JmZG4/WhbLRfgAlSmznM=
AUTH_URL=https://sistema-pos-operatorio.vercel.app
NEXTAUTH_SECRET=7lBvFRYgEcVpCiELM1zcfh1JmZG4/WhbLRfgAlSmznM=
NEXTAUTH_URL=https://sistema-pos-operatorio.vercel.app

# Cron Protection
CRON_SECRET=eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA=

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_F9Kb4mPoVtcB@ep-royal-voice-ae6ov58i-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=EAATN9ORQfVcBPxMLivSMuo5mZBR2H3g1MKNNQ3lAOK6fvNYZBaGB1oZAXfzvn37JICEcl16tRFggRsIP9tMXMZBZBt4GOu5wntLz1YhOB2LPF0w6ZBxjDViGXmLv2WFlTZANpDMwmglh0LYnflzVr3Tkd0FtLfCFhKmYCAo7nu5MivEXLTj7ZBkVpYrgIqwZB
WHATSAPP_APP_ID=1352351593037143
WHATSAPP_APP_SECRET=f8788e99231afa0bbb84685c4bea4924
WHATSAPP_BUSINESS_ACCOUNT_ID=4331043357171950
WHATSAPP_PHONE_NUMBER_ID=866244236573219
WHATSAPP_VERIFY_TOKEN=meu-token-super-secreto-2024
WHATSAPP_WEBHOOK_VERIFY_TOKEN=meu-token-super-secreto-2024

# Doctor Contact
DOCTOR_PHONE_NUMBER=5583991664904

# Research (opcional)
RESEARCH_PSEUDONYM_SALT=f1668d9cfdf515ffb56fc3fde839244123b64ca042a58f8bef8a332d1cc208ef

# Email (opcional - placeholder)
RESEND_API_KEY=re_placeholder_key
```

**OU use o script automatizado:**
```bash
# 1. Crie token em: https://vercel.com/account/tokens (Full Account)
# 2. Execute:
set VERCEL_TOKEN=seu_token_aqui
node scripts/setup-vercel-complete.js
```

### 2. Atualizar Webhook no Meta WhatsApp Manager

**Acesse:** https://developers.facebook.com/apps/1352351593037143/whatsapp-business/wa-settings

**Webhook URL:**
```
https://sistema-pos-operatorio.vercel.app/api/whatsapp/webhook
```

**Verify Token:**
```
meu-token-super-secreto-2024
```

**Eventos a subscrever:**
- ✅ messages
- ✅ message_status (opcional)

### 3. Configurar Domínio Vercel (OPCIONAL mas RECOMENDADO)

**Acesse:** https://vercel.com/joao-vitor-vianas-projects/sistema-pos-operatorio/settings/domains

Vercel oferece um domínio melhor automaticamente:
```
sistema-pos-operatorio.vercel.app
```

**Se usar domínio diferente, atualize:**
1. As variáveis `AUTH_URL` e `NEXTAUTH_URL`
2. O webhook URL no Meta

### 4. Testar Sistema

```bash
# 1. Acesse o app
https://sistema-pos-operatorio.vercel.app

# 2. Faça login

# 3. Cadastre paciente de teste (ou use existente)

# 4. Envie mensagem WhatsApp para o paciente de teste

# 5. Responda "sim" no WhatsApp

# 6. Deve receber as perguntas do questionário!
```

## 🔍 TROUBLESHOOTING

### Webhook não funciona

1. **Verificar se deployment protection está desabilitada:**
   - https://vercel.com/joao-vitor-vianas-projects/sistema-pos-operatorio/settings/deployment-protection

2. **Testar webhook manualmente:**
   ```bash
   curl "https://sistema-pos-operatorio.vercel.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=meu-token-super-secreto-2024&hub.challenge=test123"
   # Deve retornar: test123
   ```

3. **Ver logs do Vercel:**
   ```bash
   vercel logs --prod
   # ou
   # https://vercel.com/joao-vitor-vianas-projects/sistema-pos-operatorio
   ```

### Middleware muito grande

**JÁ CORRIGIDO!** Middleware agora usa `auth.config.ts` sem Prisma (compatível com Edge).

Tamanho atual: ~2KB (limite: 1MB)

### Variáveis não aplicadas

Depois de adicionar variáveis, faça **redeploy**:
```bash
vercel --prod
```

## 🎯 PRÓXIMOS PASSOS

1. ✅ Configurar variáveis (passo 1)
2. ✅ Atualizar webhook (passo 2)
3. ✅ Testar sistema (passo 4)
4. ⏭️ Desativar Railway (quando tudo funcionar)

## 📊 COMPARAÇÃO

| Feature | Railway | Vercel |
|---------|---------|--------|
| Deploy | ❌ Falha frequente | ✅ Sempre funciona |
| Velocidade | 🐌 ~5min | ⚡ ~30s |
| Custo | 💰 $5/mês (limite atingido) | 🆓 Grátis ilimitado (hobby) |
| Cron Jobs | ✅ Ilimitado | ⚠️ Máximo 2 (free tier) |
| Edge Functions | ❌ Não | ✅ Sim |
| Build Time | ⏰ ~5min | ⚡ ~1-2min |

## ✅ VANTAGENS DO VERCEL

1. **Deploys SEMPRE funcionam**
2. **Mais rápido** (30s vs 5min)
3. **Grátis ilimitado** para hobby projects
4. **Melhor performance** (Edge Functions)
5. **Logs em tempo real**
6. **Preview deployments** automáticos

## ⚠️ LIMITAÇÕES DO VERCEL (Free Tier)

1. **Máximo 2 cron jobs** (temos 1: send-followups)
2. **Edge Functions: 1MB** (middleware: ~2KB ✅)
3. **100GB bandwidth/mês** (suficiente)
4. **Serverless Functions: 10s timeout** (suficiente)

---

**Criado em:** 2025-11-19
**Status:** Deploy completo, aguardando configuração de variáveis
