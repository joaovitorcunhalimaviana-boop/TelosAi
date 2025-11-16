# WhatsApp Business API - Token Permanente (60 dias)

## 🔑 Tipos de Tokens do WhatsApp

Existem 3 tipos de tokens de acesso:

### 1. **Token Temporário (24 horas)** ❌
- Gerado no **Graph API Explorer** (https://developers.facebook.com/tools/explorer/)
- **EXPIRA EM 24 HORAS**
- ⚠️ **NÃO USE EM PRODUÇÃO** - Apenas para testes rápidos
- É o token que você está usando e que expira toda hora

### 2. **Token de Longa Duração (60 dias)** ✅
- Gerado via **System User** no Meta Business Manager
- **EXPIRA EM 60 DIAS**
- ✅ **RECOMENDADO PARA PRODUÇÃO**
- Pode ser renovado automaticamente

### 3. **Token Permanente (Never-expiring)** 🏆
- Requer **Business Verification** (verificação de negócio)
- **NUNCA EXPIRA**
- 🎯 **IDEAL PARA PRODUÇÃO**
- Leva alguns dias para Meta aprovar

---

## 🚀 PASSO A PASSO: Gerar Token de 60 Dias (SEM Business Verification)

### Pré-requisitos
- Conta Meta Business
- App WhatsApp Business criado
- Número de telefone já configurado

### Passo 1: Acessar Meta Business Manager

1. Acesse: https://business.facebook.com/settings/
2. Clique em **"System Users"** (Usuários do Sistema) no menu lateral esquerdo
3. Se não aparecer, clique em **"Business Settings" → "Users" → "System Users"**

### Passo 2: Criar um System User

1. Clique em **"Add"** (Adicionar) no canto superior direito
2. Preencha:
   - **Name**: `Telos AI Production` (ou qualquer nome descritivo)
   - **Role**: **Admin** (Administrador)
3. Clique em **"Create System User"**

### Passo 3: Gerar o Token de 60 Dias

1. Na lista de System Users, clique no usuário que você acabou de criar
2. Clique em **"Generate New Token"** (Gerar Novo Token)
3. Selecione o seu **App WhatsApp Business**
4. Selecione as **Permissions** (Permissões):
   - ✅ `whatsapp_business_management`
   - ✅ `whatsapp_business_messaging`
   - ✅ `business_management`
5. Em **"Token expiration"** (Expiração), selecione: **60 days**
6. Clique em **"Generate Token"**
7. **COPIE O TOKEN IMEDIATAMENTE** ⚠️ Ele só aparece uma vez!

### Passo 4: Adicionar Assets ao System User

O System User precisa ter acesso ao seu WhatsApp Business Account:

1. Na página do System User, role até **"Assign Assets"**
2. Clique em **"Add Assets"**
3. Selecione **"WhatsApp Accounts"**
4. Encontre e selecione sua conta WhatsApp Business
5. Marque **"Full control"** (Controle total)
6. Clique em **"Save Changes"**

### Passo 5: Atualizar no Railway/Vercel

1. Copie o novo token de 60 dias
2. No Railway:
   ```bash
   railway variables --set WHATSAPP_ACCESS_TOKEN="seu-token-de-60-dias-aqui"
   ```

3. Ou na Vercel:
   ```bash
   vercel env rm WHATSAPP_ACCESS_TOKEN production
   vercel env add WHATSAPP_ACCESS_TOKEN production
   # Cole o token quando solicitado
   ```

4. Faça redeploy:
   ```bash
   railway up  # Railway
   # ou
   vercel --prod  # Vercel
   ```

---

## 🏆 PASSO A PASSO: Token Permanente (Com Business Verification)

Se você quiser um token que **NUNCA EXPIRA**, precisa verificar seu negócio:

### Passo 1: Iniciar Business Verification

1. Acesse: https://business.facebook.com/settings/security
2. Clique em **"Start Verification"**
3. Você precisará fornecer:
   - **Documentos da empresa** (CNPJ, Contrato Social, etc.)
   - **Endereço comercial**
   - **Telefone comercial**
   - **Website da empresa** (se tiver)
   - **Documento de identificação** do representante legal

### Passo 2: Aguardar Aprovação

- Meta pode levar **3-7 dias úteis** para analisar
- Você receberá notificação por email
- Pode ser necessário fornecer documentos adicionais

### Passo 3: Após Aprovação, Gerar Token Permanente

1. Siga os mesmos passos do Token de 60 dias (acima)
2. Na etapa de **"Token expiration"**, agora você terá a opção: **Never** (Nunca)
3. Selecione **"Never"** e gere o token

---

## 🔄 Renovação Automática do Token de 60 Dias

Você pode renovar o token de 60 dias automaticamente via API:

### Script de Renovação (Node.js)

```typescript
// scripts/renew-whatsapp-token.ts
import axios from 'axios'

async function renewWhatsAppToken() {
  const APP_ID = process.env.META_APP_ID!
  const APP_SECRET = process.env.META_APP_SECRET!
  const CURRENT_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!

  try {
    // Renovar token
    const response = await axios.get(
      `https://graph.facebook.com/v21.0/oauth/access_token`,
      {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: APP_ID,
          client_secret: APP_SECRET,
          fb_exchange_token: CURRENT_TOKEN
        }
      }
    )

    const newToken = response.data.access_token
    const expiresIn = response.data.expires_in // segundos

    console.log('✅ Token renovado com sucesso!')
    console.log('🔑 Novo token:', newToken)
    console.log('⏰ Expira em:', Math.floor(expiresIn / 86400), 'dias')

    return newToken
  } catch (error) {
    console.error('❌ Erro ao renovar token:', error)
    throw error
  }
}

renewWhatsAppToken()
```

### Agendar Renovação Automática (Cron Job)

No Railway ou Vercel, você pode criar um cron job que roda a cada 50 dias:

```typescript
// app/api/cron/renew-token/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Validar CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Renovar token (código acima)
  const newToken = await renewWhatsAppToken()

  // Atualizar no Railway/Vercel via API
  // (Você precisaria implementar isso)

  return NextResponse.json({ success: true, message: 'Token renovado' })
}
```

---

## 📝 Checklist de Configuração

- [ ] Token de 60 dias gerado via System User
- [ ] System User tem acesso ao WhatsApp Business Account
- [ ] Token atualizado no Railway/Vercel
- [ ] Aplicação redeployada
- [ ] Testado enviando mensagem via dashboard
- [ ] (Opcional) Business Verification iniciada para token permanente
- [ ] (Opcional) Cron job de renovação configurado

---

## ❓ Troubleshooting

### Erro: "Invalid OAuth access token"
- Token expirou → Gerar novo token de 60 dias
- Token não tem permissões → Verificar permissões no System User

### Erro: "Unsupported get request"
- System User não tem acesso ao WhatsApp Account
- Adicionar WhatsApp Account aos Assets do System User

### Erro: "Application does not have permission"
- App precisa ter permissões `whatsapp_business_management` e `whatsapp_business_messaging`
- Verificar permissões no App Dashboard

### Token continua expirando em 24h
- Você está usando token do Graph API Explorer
- Precisa gerar via System User (passos acima)

---

## 🔗 Links Úteis

- **Meta Business Manager**: https://business.facebook.com/settings/
- **Graph API Explorer**: https://developers.facebook.com/tools/explorer/
- **WhatsApp Business API Docs**: https://developers.facebook.com/docs/whatsapp/business-management-api/get-started
- **System Users Guide**: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/system-users

---

## 💡 Recomendações

1. **Use token de 60 dias** para evitar expirações frequentes
2. **Configure cron job** para renovar automaticamente antes de expirar
3. **Solicite Business Verification** para token permanente (melhor opção)
4. **Nunca commite tokens** no Git - sempre use variáveis de ambiente
5. **Armazene tokens antigos** por segurança (caso precise rollback)

---

## 📞 Próximos Passos

Após gerar o token de 60 dias:

1. ✅ Atualizar `WHATSAPP_ACCESS_TOKEN` no Railway
2. ✅ Redeploy da aplicação
3. ✅ Testar enviando mensagem D+1 no dashboard
4. 📋 (Opcional) Iniciar Business Verification para token permanente
5. 🔄 (Opcional) Configurar renovação automática

**Qualquer dúvida, consulte a documentação oficial da Meta ou entre em contato!**
