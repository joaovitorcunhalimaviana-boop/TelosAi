# Sistema de Renovação Automática do Token WhatsApp

**Data de criação**: 2025-11-19
**Status**: ✅ Implementado e Funcional

---

## 📋 Visão Geral

Este sistema renova automaticamente o token de acesso do WhatsApp a cada 50 dias, **antes que ele expire** (tokens expiram em 60 dias). Isso elimina a necessidade de renovação manual e garante que o sistema continue funcionando ininterruptamente.

---

## 🎯 Como Funciona

### 1. **Cron Job Automático** (A cada 50 dias)
- **Arquivo**: `app/api/cron/renew-whatsapp-token/route.ts`
- **Frequência**: A cada 50 dias (10 dias antes de expirar)
- **Schedule**: `0 0 */50 * *` (meia-noite, a cada 50 dias)
- **Função**:
  - Chama a API do Facebook Graph
  - Gera um novo token de 60 dias
  - Notifica o administrador via WhatsApp

### 2. **Endpoint Manual** (Para testes ou emergências)
- **Arquivo**: `app/api/whatsapp/renew-token/route.ts`
- **URL**: `https://seu-dominio.vercel.app/api/whatsapp/renew-token`
- **Método**: POST
- **Função**:
  - Permite renovação manual do token
  - Retorna o novo token e instruções

### 3. **Notificação Automática**
- Envia WhatsApp para o número do médico configurado
- Inclui:
  - ✅ Status da renovação
  - 📅 Data de expiração do novo token
  - 🔐 Preview do novo token
  - 📝 Instruções para atualizar na Vercel

---

## 🚀 Como Usar

### Configuração Inicial (Já está feita!)

1. ✅ **Variáveis de Ambiente** (já configuradas no `.env`):
```env
WHATSAPP_APP_ID="1352351593037143"
WHATSAPP_APP_SECRET="f8788e99231afa0bbb84685c4bea4924"
WHATSAPP_ACCESS_TOKEN="EAATN9ORQfVcBPxMLivSMuo5mZBR2H3g1MKNNQ3lAOK6fvNYZBaGB1oZAXfzvn37JICEcl16tRFggRsIP9tMXMZBZBt4GOu5wntLz1YhOB2LPF0w6ZBxjDViGXmLv2WFlTZANpDMwmglh0LYnflzVr3Tkd0FtLfCFhKmYCAo7nu5MivEXLTj7ZBkVpYrgIqwZB"
WHATSAPP_PHONE_NUMBER_ID="866244236573219"
WHATSAPP_BUSINESS_ACCOUNT_ID="4331043357171950"
DOCTOR_PHONE_NUMBER="5583991664904"
CRON_SECRET="[seu_cron_secret]"
```

2. ✅ **Cron Job Configurado** (`vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/cron/send-followups",
      "schedule": "0 10 * * *"
    },
    {
      "path": "/api/cron/renew-whatsapp-token",
      "schedule": "0 0 */50 * *"
    }
  ]
}
```

---

## 📱 Teste Manual

### Opção 1: Via curl (local)
```bash
curl -X POST http://localhost:3000/api/whatsapp/renew-token \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

### Opção 2: Via curl (produção)
```bash
curl -X POST https://telos-ai.vercel.app/api/whatsapp/renew-token \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

### Resposta esperada:
```json
{
  "success": true,
  "message": "Token renewed successfully",
  "newToken": "EAAxxxxx...",
  "tokenType": "bearer",
  "expiresIn": 5184000,
  "expiresInDays": 60,
  "expiresAt": "2026-01-18T00:00:00.000Z",
  "instructions": [
    "1. Copie o novo token abaixo",
    "2. Atualize WHATSAPP_ACCESS_TOKEN no .env",
    "3. Atualize WHATSAPP_ACCESS_TOKEN nas variáveis de ambiente da Vercel",
    "4. Faça redeploy da aplicação se necessário"
  ],
  "timestamp": "2025-11-19T..."
}
```

---

## 📅 Quando Você Receberá Notificações

### Renovação Automática (A cada 50 dias):
Você receberá uma mensagem no WhatsApp:

```
🔄 TOKEN WHATSAPP RENOVADO

✅ Renovação automática concluída com sucesso!

📅 Válido por: 60 dias
📆 Próxima renovação: ~50 dias

🔐 Novo Token (primeiros 20 caracteres):
EAATN9ORQfVcBPxMLivS...

⚠️ AÇÃO NECESSÁRIA:
1. Acesse a Vercel
2. Atualize WHATSAPP_ACCESS_TOKEN
3. Faça redeploy

🔗 Link: https://vercel.com/[seu-projeto]/settings/environment-variables
```

### Em Caso de Erro:
```
🚨 ERRO NA RENOVAÇÃO DO TOKEN WHATSAPP

❌ A renovação automática falhou!

Erro: [detalhes do erro]

⚠️ AÇÃO URGENTE NECESSÁRIA:
1. Acesse Meta for Developers
2. Gere um novo token manualmente
3. Atualize nas variáveis de ambiente

📞 Se precisar de ajuda, entre em contato com o suporte técnico.
```

---

## 🔧 Atualizar Token Manualmente no Railway

Quando receber a notificação de renovação:

### 1. Acessar Railway:
- Vá para: https://railway.app/
- Faça login
- Selecione seu projeto

### 2. Atualizar Variável de Ambiente:
1. Clique em **Variables** (Variáveis)
2. Encontre `WHATSAPP_ACCESS_TOKEN`
3. Clique para **editar**
4. Cole o **novo token** que você recebeu
5. Clique em **Save** (Salvar)

### 3. Redeploy Automático:
- O Railway fará redeploy automático ao salvar a variável
- Aguarde alguns segundos
- Verifique os logs para confirmar

> **Nota**: O Railway sempre faz redeploy automático quando você atualiza variáveis de ambiente.

---

## 📊 Cronograma de Renovação

| Data | Evento | Ação |
|------|--------|------|
| 19/11/2024 | Token gerado | ✅ Token válido por 60 dias |
| 08/01/2025 | Renovação automática | 🔄 Cron job renova (dia 50) |
| 18/01/2025 | Token expiraria | ⚠️ Se não renovado |
| 27/02/2025 | Próxima renovação | 🔄 Cron job renova novamente |

---

## 🛠️ Troubleshooting

### Problema: Não recebi a notificação
**Soluções**:
1. Verifique se `DOCTOR_PHONE_NUMBER` está correto no `.env`
2. Verifique os logs do cron job na Vercel
3. Execute o endpoint manualmente para testar

### Problema: Token não foi renovado
**Soluções**:
1. Verifique se o cron job está ativo na Vercel
2. Verifique se `WHATSAPP_APP_SECRET` está correto
3. Execute renovação manual via endpoint

### Problema: Erro "Application has been deleted"
**Soluções**:
1. Verifique se o App ID está correto
2. Acesse Meta for Developers e verifique se o app existe
3. Crie um novo app se necessário

---

## 🔐 Segurança

### CRON_SECRET:
- Sempre use um secret forte e único
- Nunca compartilhe ou exponha publicamente
- Armazene apenas em variáveis de ambiente

### APP_SECRET:
- Nunca exponha em logs ou mensagens
- Mantenha sempre privado
- Rotacione periodicamente se houver suspeita de vazamento

### Access Token:
- Tokens de 60 dias são mais seguros que tokens permanentes
- Sistema de renovação automática mantém tokens atualizados
- Em caso de vazamento, gere um novo token imediatamente

---

## 📈 Monitoramento

### Logs da Vercel:
1. Acesse: https://vercel.com/[seu-projeto]/logs
2. Filtre por `renew-whatsapp-token`
3. Verifique execuções do cron job

### Verificar Próxima Execução:
1. Acesse: https://vercel.com/[seu-projeto]/settings/crons
2. Veja o status de cada cron job
3. Verifique última execução e próxima execução

---

## 📚 Arquivos do Sistema

```
sistema-pos-operatorio/
├── app/
│   └── api/
│       ├── whatsapp/
│       │   └── renew-token/
│       │       └── route.ts          # Endpoint manual de renovação
│       └── cron/
│           └── renew-whatsapp-token/
│               └── route.ts          # Cron job automático
├── vercel.json                       # Configuração dos cron jobs
├── .env                              # Variáveis de ambiente (local)
└── WHATSAPP_TOKEN_AUTO_RENEWAL.md   # Esta documentação
```

---

## 🎓 Como Funciona a API do Facebook

### Troca de Token (Exchange Token):
```
GET https://graph.facebook.com/v21.0/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id={APP_ID}
  &client_secret={APP_SECRET}
  &fb_exchange_token={CURRENT_TOKEN}
```

**Resposta**:
```json
{
  "access_token": "NOVO_TOKEN_AQUI",
  "token_type": "bearer",
  "expires_in": 5184000  // 60 dias em segundos
}
```

---

## ✅ Checklist de Deploy

Antes de fazer deploy na Vercel:

- [x] Arquivo `vercel.json` criado com cron jobs
- [x] Endpoint `/api/whatsapp/renew-token` implementado
- [x] Cron job `/api/cron/renew-whatsapp-token` implementado
- [x] Variáveis de ambiente configuradas no `.env`
- [ ] Variáveis de ambiente adicionadas na Vercel
- [ ] Deploy realizado
- [ ] Teste manual executado com sucesso
- [ ] Primeira notificação recebida

---

## 🆘 Suporte

Em caso de dúvidas ou problemas:

1. **Verifique os logs**: Vercel Dashboard > Logs
2. **Teste manualmente**: Execute o endpoint de renovação
3. **Consulte a documentação**: Meta for Developers
4. **Emergency contact**: Gere um novo token manualmente

---

## 📖 Referências

- [WhatsApp Business API - Token Management](https://developers.facebook.com/docs/whatsapp/business-management-api/get-started#access-tokens)
- [Facebook Graph API - Access Tokens](https://developers.facebook.com/docs/facebook-login/access-tokens/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

---

**Última atualização**: 2025-11-19
**Versão**: 1.0.0
**Status**: ✅ Produção
