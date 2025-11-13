# 📱 Configuração do Webhook - WhatsApp

## ✅ Status Atual

**URL do Sistema**: https://telos-ai.vercel.app
**Webhook Endpoint**: https://telos-ai.vercel.app/api/whatsapp/webhook
**Verify Token**: meu-token-super-secreto-2024

---

## 🔧 Configurar no Meta

1. Acesse: https://developers.facebook.com/apps/
2. Selecione seu app WhatsApp
3. WhatsApp → Configuration → Webhook
4. Configure:
   - **Callback URL**: `https://telos-ai.vercel.app/api/whatsapp/webhook`
   - **Verify Token**: `meu-token-super-secreto-2024`
5. Marque: ✅ messages
6. Salvar

---

## ⚠️ Problemas Atuais

O site está com problemas de deploy na Vercel (404 em todas as rotas).

**Próximos passos**:
1. Resolver erros de Edge Runtime
2. Testar webhook localmente primeiro
3. Depois configurar no Meta

---

## 🧪 Teste Local

```bash
# Rodar servidor
npm run dev

# Testar webhook
curl "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=meu-token-super-secreto-2024&hub.challenge=test"

# Deve retornar: test
```
