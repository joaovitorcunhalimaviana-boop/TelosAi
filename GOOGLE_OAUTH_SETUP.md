# Configuracao do Google OAuth para Telos.AI

Este guia explica como configurar o Google OAuth para permitir login com Google no sistema.

## Passo 1: Acessar o Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Faca login com sua conta Google (pode ser qualquer conta Google)

## Passo 2: Criar um Novo Projeto

1. Clique no menu dropdown de projetos no topo da pagina
2. Clique em "Novo Projeto"
3. Nome do projeto: `Telos AI` (ou o nome que preferir)
4. Clique em "Criar"
5. Aguarde alguns segundos ate o projeto ser criado
6. Selecione o projeto recem-criado no dropdown

## Passo 3: Configurar a Tela de Consentimento OAuth

1. No menu lateral, va em: **APIs e servicos** > **Tela de consentimento OAuth**
2. Escolha **Externo** (para permitir qualquer usuario Google fazer login)
3. Clique em **Criar**
4. Preencha as informacoes obrigatorias:
   - **Nome do app**: `Telos.AI`
   - **E-mail de suporte do usuario**: seu e-mail
   - **Dominios autorizados**: deixe vazio por enquanto
   - **Informacoes de contato do desenvolvedor**: seu e-mail
5. Clique em **Salvar e continuar**
6. Na tela de **Escopos**, clique em **Salvar e continuar** (nao precisa adicionar escopos customizados)
7. Na tela de **Usuarios de teste**, clique em **Salvar e continuar**
8. Revise as informacoes e clique em **Voltar ao painel**

## Passo 4: Criar Credenciais OAuth 2.0

1. No menu lateral, va em: **APIs e servicos** > **Credenciais**
2. Clique em **+ Criar credenciais** > **ID do cliente OAuth 2.0**
3. Tipo de aplicativo: **Aplicativo da Web**
4. Nome: `Telos AI Web Client`
5. **URIs de redirecionamento autorizados** - Adicione os seguintes URLs:

   **Para desenvolvimento local:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```

   **Para producao (Vercel):**
   ```
   https://telos-ai.vercel.app/api/auth/callback/google
   ```

   **IMPORTANTE**: Se voce tiver um dominio customizado, adicione tambem:
   ```
   https://seu-dominio.com/api/auth/callback/google
   ```

6. Clique em **Criar**

## Passo 5: Copiar as Credenciais

Apos criar, aparecera um popup com:
- **ID do cliente** (ex: `123456789-abcdefg.apps.googleusercontent.com`)
- **Chave secreta do cliente** (ex: `GOCSPX-xyz123abc`)

**COPIE ESSES VALORES!** Voce vai precisar deles no proximo passo.

## Passo 6: Adicionar as Credenciais ao Arquivo .env

1. Abra o arquivo `.env` na raiz do projeto
2. Localize as linhas:
   ```env
   GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE"
   GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET_HERE"
   ```
3. Substitua pelos valores que voce copiou:
   ```env
   GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-xyz123abc"
   ```

## Passo 7: Testar o Login

1. Certifique-se de que o servidor esta rodando: `npm run dev`
2. Acesse: `http://localhost:3000/auth/login`
3. Clique no botao "Continuar com Google"
4. Selecione sua conta Google
5. Aceite as permissoes solicitadas
6. Voce sera redirecionado para o dashboard!

## Solucao de Problemas

### Erro: "redirect_uri_mismatch"
- Verifique se o URI de redirecionamento no Google Cloud Console esta EXATAMENTE igual ao que o app esta usando
- Certifique-se de incluir `http://` ou `https://`
- Nao esqueca a barra final em alguns casos

### Erro: "Access blocked: This app's request is invalid"
- Verifique se a Tela de Consentimento OAuth foi configurada
- Certifique-se de que seu e-mail esta listado nos "Usuarios de teste" (se o app estiver em modo de teste)

### Login funciona localmente mas nao em producao
- Verifique se voce adicionou o URI de redirecionamento da Vercel no Google Cloud Console
- Certifique-se de que as variaveis de ambiente estao configuradas na Vercel:
  - Va em: Vercel Dashboard > Seu Projeto > Settings > Environment Variables
  - Adicione `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`

## Proximos Passos

Apos configurar o Google OAuth:
1. Crie seu primeiro usuario medico atraves do cadastro
2. Faca login usando Google ou email/senha
3. Configure seu perfil e CRM
4. Comece a cadastrar pacientes!

## Seguranca

- **NUNCA** compartilhe seu `GOOGLE_CLIENT_SECRET`
- **NUNCA** commite o arquivo `.env` no Git
- O arquivo `.env` ja esta no `.gitignore`
- Em producao, use variaveis de ambiente da plataforma (Vercel, Railway, etc)

## Documentacao Oficial

Para mais informacoes, consulte:
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
