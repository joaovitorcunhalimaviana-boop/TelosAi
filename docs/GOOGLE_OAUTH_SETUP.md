# Configuração do Google OAuth

## Como Configurar o Login com Google

Para ativar o botão "Continuar com Google", você precisa configurar as credenciais OAuth no Google Cloud Console.

### Passo 1: Acessar Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Crie um novo projeto ou selecione um existente

### Passo 2: Habilitar a Google OAuth API

1. No menu lateral, vá em **APIs & Services** > **Library**
2. Pesquise por "Google+ API" ou "Google Identity"
3. Clique em **Enable**

### Passo 3: Criar Credenciais OAuth

1. Vá em **APIs & Services** > **Credentials**
2. Clique em **Create Credentials** > **OAuth client ID**
3. Se solicitado, configure a **OAuth consent screen**:
   - **User Type**: External
   - **App name**: Telos.AI
   - **User support email**: Seu email
   - **Developer contact**: Seu email
   - **Scopes**: Adicione `email` e `profile`
   - Salve

4. Agora crie o **OAuth Client ID**:
   - **Application type**: Web application
   - **Name**: Telos.AI Web
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (desenvolvimento)
     - `https://seu-dominio.com` (produção)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (desenvolvimento)
     - `https://seu-dominio.com/api/auth/callback/google` (produção)
   - Clique em **Create**

5. Copie o **Client ID** e **Client Secret**

### Passo 4: Adicionar ao .env

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui

# NextAuth URL (importante!)
NEXTAUTH_URL=http://localhost:3000
# Em produção:
# NEXTAUTH_URL=https://seu-dominio.com
```

### Passo 5: Reiniciar o Servidor

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

### Passo 6: Testar

1. Acesse: http://localhost:3000/auth/login
2. Clique em "Continuar com Google"
3. Selecione sua conta Google
4. Autorize o acesso
5. Você será redirecionado automaticamente para o dashboard!

## Como Funciona?

1. **Primeiro Login com Google**:
   - Se o email não existir no banco, um novo usuário é criado automaticamente
   - Plano padrão: Professional (R$ 950/mês)
   - firstLogin = true (redirecionado para onboarding)

2. **Logins Subsequentes**:
   - O sistema busca o usuário pelo email
   - Sessão criada normalmente

3. **Email já Cadastrado com Senha**:
   - Você pode usar tanto senha quanto Google
   - Ambos funcionam para o mesmo usuário

## Dados Coletados do Google

- **Nome completo**: Para preencher `nomeCompleto`
- **Email**: Identificador único
- **Foto de perfil**: (opcional, não estamos usando ainda)

## Segurança

✅ **OAuth 2.0**: Protocolo seguro da indústria
✅ **Google gerencia senha**: Você nunca vê a senha do usuário
✅ **Tokens JWT**: Sessões criptografadas
✅ **HTTPS obrigatório**: Em produção

## Troubleshooting

**Erro: "redirect_uri_mismatch"**
- Verifique se a URL de redirect está correta no Google Cloud Console
- Deve ser exatamente: `http://localhost:3000/api/auth/callback/google`

**Erro: "access_denied"**
- Usuário cancelou o login
- Normal, não precisa fazer nada

**Erro: "invalid_client"**
- GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET incorretos
- Verifique o .env

**Botão não aparece**
- Verifique se as variáveis de ambiente estão configuradas
- Reinicie o servidor

## Modo de Desenvolvimento vs Produção

**Desenvolvimento (localhost:3000)**:
```env
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Produção (seu domínio)**:
```env
NEXTAUTH_URL=https://telos.ai
GOOGLE_CLIENT_ID=... (mesmo)
GOOGLE_CLIENT_SECRET=... (mesmo)
```

**IMPORTANTE**: Adicione o domínio de produção nas **Authorized redirect URIs** do Google Cloud Console!
