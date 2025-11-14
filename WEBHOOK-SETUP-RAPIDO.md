# 🚀 Configuração Rápida do Webhook WhatsApp

## ⚡ Guia de 5 Minutos

### 📍 **Passo 1: Acesse o Meta Developer Console**

URL: https://developers.facebook.com/apps/

### 📍 **Passo 2: Navegue até o Webhook**

1. Clique no seu app WhatsApp Business
2. No menu lateral esquerdo:
   - **WhatsApp** → **Configuration**
3. Ou procure por **"Webhook"** na busca

### 📍 **Passo 3: Configure o Webhook**

Clique em **"Edit"** ou **"Configure Webhooks"**

**Cole estas informações EXATAS:**

```
Callback URL: https://proactive-rejoicing-production.up.railway.app/api/whatsapp/webhook

Verify Token: meu-token-super-secreto-2024
```

### 📍 **Passo 4: Verificar e Salvar**

1. Clique em **"Verify and Save"**
2. ✅ Se aparecer "Verified", está correto!
3. ❌ Se der erro, verifique:
   - URL está exatamente igual?
   - Token está exatamente igual?
   - Railway está online?

### 📍 **Passo 5: Inscrever em Eventos**

**IMPORTANTE:** Marque esta opção:

- ✅ **messages** (Webhook fields)

Clique em **"Save"** ou **"Subscribe"**

---

## ✅ **Testar se Funcionou**

### Teste via Terminal:

```bash
curl "https://proactive-rejoicing-production.up.railway.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=meu-token-super-secreto-2024&hub.challenge=TESTE123"
```

**Resposta esperada:**
```
TESTE123
```

Se recebeu `TESTE123`, o webhook está **FUNCIONANDO!** ✅

---

## 🔧 **Configuração Atual**

| Item | Valor |
|------|-------|
| **Webhook URL** | `https://proactive-rejoicing-production.up.railway.app/api/whatsapp/webhook` |
| **Verify Token** | `meu-token-super-secreto-2024` |
| **Events** | ✅ messages |
| **Phone Number ID** | `857908160740631` |
| **Access Token** | Configurado no Railway |

---

## ❌ **Troubleshooting**

### Erro: "The URL couldn't be validated"

**Solução:**
1. Verifique se Railway está online: https://proactive-rejoicing-production.up.railway.app
2. Teste o endpoint: `curl https://proactive-rejoicing-production.up.railway.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=meu-token-super-secreto-2024&hub.challenge=test`
3. Ver logs: `railway logs`

### Erro: "Verify token doesn't match"

**Solução:**
1. O token DEVE ser EXATAMENTE: `meu-token-super-secreto-2024`
2. Sem espaços antes ou depois
3. Case-sensitive (maiúsculas/minúsculas importam)

### Erro: "Callback URL not whitelisted"

**Solução:**
1. Adicione o domínio nas configurações do app
2. Vá em **App Settings** → **Basic**
3. Adicione: `proactive-rejoicing-production.up.railway.app`

---

## 📱 **Próximo Passo: Testar com Paciente**

Após configurar o webhook:

1. ✅ Cadastre um paciente teste
2. ✅ Execute o cron: `https://proactive-rejoicing-production.up.railway.app/api/cron/send-followups`
3. ✅ Paciente deve receber questionário
4. ✅ Responda como paciente
5. ✅ Sistema deve processar resposta

---

**⏱️ Tempo estimado:** 5 minutos
**✅ Pronto para produção após este passo!**
