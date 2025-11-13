# Configuração do Webhook WhatsApp - Railway

## URL de Produção Railway

**URL do Sistema**: https://proactive-rejoicing-production.up.railway.app
**Webhook Endpoint**: https://proactive-rejoicing-production.up.railway.app/api/postop/webhook
**Verify Token**: meu-token-super-secreto-2024

---

## Como Configurar no Meta Developer Console

1. Acesse: https://developers.facebook.com/apps/
2. Selecione seu app WhatsApp
3. Vá em **WhatsApp → Configuration → Webhook**
4. Clique em **Edit** ou **Configure Webhooks**
5. Configure:
   - **Callback URL**: `https://proactive-rejoicing-production.up.railway.app/api/postop/webhook`
   - **Verify Token**: `meu-token-super-secreto-2024`
6. Clique em **Verify and Save**
7. Marque a opção: ✅ **messages**
8. Salvar

---

## Teste de Verificação

O webhook foi testado com sucesso:

```bash
curl "https://proactive-rejoicing-production.up.railway.app/api/postop/webhook?hub.mode=subscribe&hub.verify_token=meu-token-super-secreto-2024&hub.challenge=test123"
```

**Resposta**: `test123` ✅

---

## Variáveis de Ambiente Configuradas

Todas as variáveis foram configuradas no Railway:

- ✅ DATABASE_URL
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL
- ✅ ANTHROPIC_API_KEY
- ✅ WHATSAPP_PHONE_NUMBER_ID
- ✅ WHATSAPP_ACCESS_TOKEN
- ✅ WHATSAPP_BUSINESS_ACCOUNT_ID
- ✅ WHATSAPP_WEBHOOK_VERIFY_TOKEN
- ✅ WHATSAPP_VERIFY_TOKEN
- ✅ DOCTOR_PHONE_NUMBER

---

## Status do Deploy

✅ Deploy concluído com sucesso no Railway
✅ Next.js 16.0.1 rodando
✅ Webhook verificado e funcionando
✅ Todas as variáveis de ambiente configuradas

---

## Próximos Passos

1. Configure o webhook no Meta Developer Console usando as informações acima
2. Envie uma mensagem de teste do WhatsApp para seu número
3. Verifique os logs no Railway: `railway logs`
4. Monitore o painel: https://railway.com/project/83b9a90d-f379-4838-a4fe-3c5295a84d98

---

## Acesso ao Painel Railway

**Dashboard**: https://railway.com/project/83b9a90d-f379-4838-a4fe-3c5295a84d98
**Service**: proactive-rejoicing
**Environment**: production
