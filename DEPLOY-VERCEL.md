# Deploy na Vercel - Guia Completo

## Pré-requisitos

- Conta no GitHub
- Conta na Vercel (pode usar login do GitHub)
- Banco de dados Neon PostgreSQL configurado
- APIs configuradas (Anthropic e WhatsApp)

---

## Passo 1: Preparar o Repositório GitHub

### 1.1. Inicializar Git (se ainda não foi feito)
```bash
git init
git add .
git commit -m "Initial commit - Sistema Pós-Operatório"
```

### 1.2. Criar Repositório no GitHub
1. Acesse: https://github.com/new
2. Nome: `sistema-pos-operatorio`
3. Deixe como **Private** (recomendado)
4. NÃO adicione README, .gitignore ou license
5. Clique em "Create repository"

### 1.3. Conectar e Enviar
```bash
git remote add origin https://github.com/seu-usuario/sistema-pos-operatorio.git
git branch -M main
git push -u origin main
```

---

## Passo 2: Deploy na Vercel

### 2.1. Conectar Repositório

1. Acesse: https://vercel.com
2. Clique em "Add New" → "Project"
3. Importe o repositório `sistema-pos-operatorio`
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: (deixe padrão)
   - **Output Directory**: (deixe padrão)

### 2.2. Configurar Variáveis de Ambiente

Na seção "Environment Variables", adicione TODAS as variáveis do `.env`:

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:npg_F9Kb4mPoVtcB@ep-royal-voice-ae6ov58i-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require

# NextAuth (IMPORTANTE: mudar NEXTAUTH_URL após deploy)
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=7lBvFRYgEcVpCiELM1zcfh1JmZG4/WhbLRfgAlSmznM=

# Anthropic API
ANTHROPIC_API_KEY=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

# WhatsApp API
WHATSAPP_PHONE_NUMBER_ID=857908160740631
WHATSAPP_ACCESS_TOKEN=EAARBS2LEDjQBPxUxwWEVTLZCHCXHZBCXoAKksRdl9BNjlpnWPHDTIYuT6ZBiUEUOma1CtsVC1gJgESCADpt9AT6FMOOpKx2KIIvJcWz6shZAU5UK0EwZBCsSIo3upPw1dNvbIAXyxulqtLwm4ZCTqOBsUtCa5qL3hyHUwRKYIzVZCoqcwC8BPy8hXg5bE592i1yFfONKGbHKUVy9XZBUHCxoXoYVRZBtujZCODgdjZBSSAZCFTRJSwZDZD
WHATSAPP_BUSINESS_ACCOUNT_ID=1699737104331443
WHATSAPP_VERIFY_TOKEN=meu-token-super-secreto-2024

# Telefone do Médico
DOCTOR_PHONE_NUMBER=5583991221599
```

**Importante**:
- Marque "Production", "Preview" e "Development" para todas as variáveis
- A variável `NEXTAUTH_URL` será atualizada após o primeiro deploy

### 2.3. Deploy Inicial

1. Clique em "Deploy"
2. Aguarde o build completar (2-3 minutos)
3. Anote a URL do deploy (ex: `https://seu-app.vercel.app`)

### 2.4. Atualizar NEXTAUTH_URL

1. Vá em "Settings" → "Environment Variables"
2. Edite `NEXTAUTH_URL`
3. Substitua por: `https://seu-app.vercel.app` (URL real do deploy)
4. Clique em "Save"
5. Vá em "Deployments" → clique nos 3 pontos do último deploy → "Redeploy"

---

## Passo 3: Configurar Webhook do WhatsApp

### 3.1. Acessar Meta for Developers

1. Acesse: https://developers.facebook.com/apps/
2. Selecione seu app
3. No menu lateral: "WhatsApp" → "Configuration"

### 3.2. Configurar Webhook

1. Na seção "Webhook", clique em "Edit"
2. Preencha:
   - **Callback URL**: `https://seu-app.vercel.app/api/webhook/whatsapp`
   - **Verify Token**: `meu-token-super-secreto-2024` (mesmo do .env)
3. Clique em "Verify and Save"

### 3.3. Inscrever em Eventos

Após verificar, marque os seguintes eventos:
- ✅ messages
- ✅ message_status (opcional)

Clique em "Save"

---

## Passo 4: Testar o Deploy

### 4.1. Acessar o Sistema
1. Acesse: `https://seu-app.vercel.app`
2. Faça login
3. Teste as funcionalidades básicas

### 4.2. Testar APIs
1. Vá para: `https://seu-app.vercel.app/dashboard/settings/api-config`
2. Clique em "Testar Conexão" para Anthropic
3. Clique em "Testar Conexão" para WhatsApp

### 4.3. Testar Webhook
1. Cadastre um paciente de teste com seu número
2. Registre uma cirurgia
3. Aguarde ou force o envio de um questionário
4. Responda pelo WhatsApp
5. Verifique se a resposta foi processada no sistema

---

## Passo 5: Configuração de Produção

### 5.1. Executar Migrations no Banco

Se precisar executar migrations:
```bash
# Localmente, com DATABASE_URL de produção
DATABASE_URL="sua-url-neon" npx prisma migrate deploy
```

Ou use o Prisma Studio da Vercel:
```bash
npx vercel env pull .env.production
DATABASE_URL="$(cat .env.production | grep DATABASE_URL | cut -d '=' -f2)" npx prisma studio
```

### 5.2. Domínio Customizado (Opcional)

1. Na Vercel, vá em "Settings" → "Domains"
2. Adicione seu domínio
3. Configure os DNS conforme instruções
4. Atualize `NEXTAUTH_URL` com o novo domínio
5. Atualize o webhook do WhatsApp com o novo domínio

---

## Comandos Úteis

### Deploy Manual via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Ver Logs em Tempo Real
```bash
vercel logs
```

### Atualizar Variáveis de Ambiente via CLI
```bash
vercel env add NOME_DA_VARIAVEL
```

---

## Troubleshooting

### Build falhou
1. Verifique os logs no painel da Vercel
2. Teste localmente: `npm run build`
3. Corrija erros de TypeScript ou ESLint

### Database connection error
1. Verifique se o DATABASE_URL está correto
2. Teste conexão: `npx prisma db push`
3. Verifique se o IP da Vercel está liberado no Neon (geralmente é automático)

### Webhook não funciona
1. Verifique se a URL está acessível publicamente
2. Teste: `curl https://seu-app.vercel.app/api/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=meu-token-super-secreto-2024&hub.challenge=test`
3. Verifique os logs da Vercel
4. Verifique o WHATSAPP_VERIFY_TOKEN

### NextAuth error
1. Verifique se NEXTAUTH_URL está correto (com https://)
2. Verifique se NEXTAUTH_SECRET está definido
3. Limpe cookies e tente novamente

---

## Monitoramento

### Logs da Vercel
- Acesse: https://vercel.com/seu-usuario/sistema-pos-operatorio/logs
- Filtre por erro: adicione `&level=error` na URL

### Database Usage (Neon)
- Acesse: https://console.neon.tech
- Monitore storage e compute usage

### API Usage
- **Anthropic**: https://console.anthropic.com/settings/usage
- **WhatsApp**: https://business.facebook.com/settings/whatsapp-business-accounts/

---

## Próximos Passos Após Deploy

1. ✅ Testar todas as funcionalidades
2. ✅ Cadastrar pacientes reais
3. ✅ Configurar agendamento automático de questionários
4. ✅ Monitorar logs e erros
5. ✅ Ajustar análise da IA conforme necessário
6. ✅ Coletar feedback dos usuários

---

## Suporte

- **Vercel**: https://vercel.com/docs
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **WhatsApp API**: https://developers.facebook.com/docs/whatsapp
