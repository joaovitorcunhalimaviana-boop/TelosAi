# 🚀 Deploy Rápido - Telos AI

## Informações do Projeto

- **URL Produção**: https://telos-ai.vercel.app
- **Repositório**: https://github.com/joaovitorcunhalimaviana-boop/TelosAi
- **Webhook**: https://telos-ai.vercel.app/api/postop/webhook

---

## 🔥 Deploy AGORA (3 Comandos)

```bash
# 1. Commit
git add . && git commit -m "feat: Sistema completo com APIs configuradas"

# 2. Push
git push origin master

# 3. Verificar deploy
# Vercel detecta automaticamente e faz deploy
```

---

## 🔐 Variáveis de Ambiente na Vercel

Acesse: https://vercel.com/dashboard → TelosAi → Settings → Environment Variables

Adicione:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_F9Kb4mPoVtcB@ep-royal-voice-ae6ov58i-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require

NEXTAUTH_URL=https://telos-ai.vercel.app
NEXTAUTH_SECRET=7lBvFRYgEcVpCiELM1zcfh1JmZG4/WhbLRfgAlSmznM=

ANTHROPIC_API_KEY=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

WHATSAPP_PHONE_NUMBER_ID=857908160740631
WHATSAPP_ACCESS_TOKEN=EAARBS2LEDjQBPxUxwWEVTLZCHCXHZBCXoAKksRdl9BNjlpnWPHDTIYuT6ZBiUEUOma1CtsVC1gJgESCADpt9AT6FMOOpKx2KIIvJcWz6shZAU5UK0EwZBCsSIo3upPw1dNvbIAXyxulqtLwm4ZCTqOBsUtCa5qL3hyHUwRKYIzVZCoqcwC8BPy8hXg5bE592i1yFfONKGbHKUVy9XZBUHCxoXoYVRZBtujZCODgdjZBSSAZCFTRJSwZDZD
WHATSAPP_BUSINESS_ACCOUNT_ID=1699737104331443
WHATSAPP_WEBHOOK_VERIFY_TOKEN=meu-token-super-secreto-2024
WHATSAPP_VERIFY_TOKEN=meu-token-super-secreto-2024

DOCTOR_PHONE_NUMBER=5583991221599
```

Marque: ✅ Production ✅ Preview ✅ Development

---

## 📱 Configurar Webhook WhatsApp

1. Acesse: https://developers.facebook.com/apps/
2. WhatsApp → Configuration → Webhook
3. **Callback URL**: `https://telos-ai.vercel.app/api/postop/webhook`
4. **Verify Token**: `meu-token-super-secreto-2024`
5. Clique em "Verify and Save"
6. Marque: ✅ messages

---

## ✅ Testar Tudo

```bash
# 1. Webhook
curl "https://telos-ai.vercel.app/api/postop/webhook?hub.mode=subscribe&hub.verify_token=meu-token-super-secreto-2024&hub.challenge=test"

# 2. Login
# Acesse: https://telos-ai.vercel.app
# Faça login

# 3. APIs
# Acesse: https://telos-ai.vercel.app/dashboard/settings/api-config
# Teste Anthropic ✅
# Teste WhatsApp ✅
```

---

## 🎯 Status

- ✅ Código pronto
- ✅ Webhook em `/api/postop/webhook`
- ✅ Build passa
- 🔄 Aguardando: Commit → Push → Deploy → Configurar variáveis → Webhook
