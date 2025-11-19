# 🤖 GUIA DE AUTOMAÇÃO - VERCEL DEPLOY

Este guia documenta todo o processo de automação para configurar e deployar o sistema pós-operatório na Vercel.

---

## 📋 ÍNDICE

1. [Scripts Disponíveis](#scripts-disponíveis)
2. [Configuração Automática](#configuração-automática)
3. [Validação e Testes](#validação-e-testes)
4. [Resolução de Problemas](#resolução-de-problemas)

---

## 🛠️ SCRIPTS DISPONÍVEIS

### 1. Setup de Variáveis de Ambiente

**Arquivo:** `setup-vercel-env.js`

Configura todas as 17 variáveis de ambiente necessárias via API Vercel.

```bash
node setup-vercel-env.js
```

**O que faz:**
- ✅ Obtém token de autenticação do Vercel
- ✅ Busca informações do projeto
- ✅ Adiciona todas as variáveis de ambiente
- ✅ Valida configuração

**Saída esperada:**
```
✅ Adicionadas: 17
⚠️  Já existiam: 0
❌ Erros: 0
```

### 2. Setup de Webhook Meta

**Arquivo:** `setup-meta-webhook.js`

Configura o webhook do WhatsApp no Meta/Facebook via API.

```bash
node setup-meta-webhook.js
```

**O que faz:**
- ✅ Verifica webhook atual
- ✅ Remove webhook antigo (se existir)
- ✅ Configura novo webhook
- ✅ Valida configuração

**Saída esperada:**
```
✅ Webhook configurado com sucesso!
```

### 3. Validação Completa

**Arquivo:** `validate-system.js`

Executa 5 testes para validar todo o sistema.

```bash
node validate-system.js
```

**Testes realizados:**
1. ✅ Deploy Principal
2. ✅ Webhook Verification
3. ✅ API Health
4. ✅ Auth API
5. ✅ Middleware

**Saída esperada:**
```
✅ Passou: 5
❌ Falhou: 0
```

### 4. Teste Rápido (Shell)

**Arquivo:** `quick-test.sh`

Script bash para testes rápidos via curl.

```bash
bash quick-test.sh
```

---

## 🚀 CONFIGURAÇÃO AUTOMÁTICA

### Passo a Passo Completo

#### 1. Configurar Variáveis de Ambiente

```bash
node setup-vercel-env.js
```

**Variáveis configuradas:**
- Autenticação (4 variáveis)
- WhatsApp/Meta (8 variáveis)
- Database (1 variável)
- APIs Externas (2 variáveis)
- Segurança (2 variáveis)

#### 2. Deploy na Vercel

```bash
vercel --prod --yes
```

**Processo:**
- Upload de arquivos
- Build do projeto
- Deploy em produção
- URL gerada automaticamente

#### 3. Configurar Webhook

```bash
node setup-meta-webhook.js
```

**Configuração:**
- App ID: 1352351593037143
- Callback URL: [URL do deploy]
- Verify Token: meu-token-super-secreto-2024

#### 4. Validar Sistema

```bash
node validate-system.js
```

**Validação:**
- Todos os 5 testes devem passar
- Sistema pronto para uso

---

## ✅ VALIDAÇÃO E TESTES

### Testes Automatizados

**1. Site Principal**
```bash
curl -I https://sistema-pos-operatorio-5i1swk9c0-joao-vitor-vianas-projects.vercel.app
```
Esperado: HTTP 200 OK

**2. Webhook Verification**
```bash
curl "https://sistema-pos-operatorio-5i1swk9c0-joao-vitor-vianas-projects.vercel.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=meu-token-super-secreto-2024&hub.challenge=test123"
```
Esperado: test123

**3. NextAuth**
```bash
curl -I https://sistema-pos-operatorio-5i1swk9c0-joao-vitor-vianas-projects.vercel.app/api/auth/signin
```
Esperado: HTTP 2xx ou 3xx

**4. Middleware (Proteção)**
```bash
curl -I https://sistema-pos-operatorio-5i1swk9c0-joao-vitor-vianas-projects.vercel.app/dashboard
```
Esperado: HTTP 302, 307 ou 401 (redirecionamento/não autorizado)

### Teste Manual WhatsApp

1. Envie mensagem para: **+55 83 99166-4904**
2. Mensagem: **"sim"**
3. Aguarde resposta automática

---

## 🔧 RESOLUÇÃO DE PROBLEMAS

### Problema: Token do Vercel não encontrado

**Erro:**
```
❌ Erro ao obter token do Vercel: ENOENT
```

**Solução:**
```bash
vercel login
```

### Problema: Variáveis já existem

**Erro:**
```
⚠️  Já existiam: 17
```

**Solução:**
Variáveis já configuradas. Para reconfigurar:
```bash
# Remover todas
vercel env rm NOME_DA_VARIAVEL production

# Ou executar o script novamente (ele pula as existentes)
node setup-vercel-env.js
```

### Problema: Webhook retorna 400

**Erro:**
```
❌ Erro ao configurar webhook (400)
```

**Solução:**
Verifique se:
1. App ID está correto
2. App Secret está correto
3. URL do webhook está acessível
4. Token de acesso está válido

### Problema: Deploy falha

**Erro:**
```
Build failed
```

**Solução:**
```bash
# Ver logs
vercel logs

# Build local para debug
npm run build

# Verificar variáveis
vercel env ls production
```

### Problema: Middleware não protege rotas

**Sintoma:**
Dashboard acessível sem login (HTTP 200)

**Solução:**
1. Verificar `middleware.ts`
2. Verificar `auth.config.ts`
3. Verificar variáveis AUTH_SECRET e NEXTAUTH_SECRET
4. Redeploy:
```bash
vercel --prod --force
```

---

## 📊 ESTRUTURA DOS ARQUIVOS

```
sistema-pos-operatorio/
├── setup-vercel-env.js          # Script de configuração de variáveis
├── setup-meta-webhook.js         # Script de configuração de webhook
├── validate-system.js            # Script de validação completa
├── quick-test.sh                 # Script de teste rápido
├── .env.production               # Template de variáveis
├── env-values.txt                # Valores das variáveis
├── CONFIGURACAO_COMPLETA_VERCEL.md  # Relatório completo
└── AUTOMATION_GUIDE.md           # Este arquivo
```

---

## 🎯 COMANDOS ÚTEIS

### Vercel CLI

```bash
# Ver status do projeto
vercel

# Deploy em produção
vercel --prod

# Ver logs
vercel logs

# Ver variáveis
vercel env ls production

# Adicionar variável
vercel env add NOME_VARIAVEL production

# Remover variável
vercel env rm NOME_VARIAVEL production

# Pull variáveis localmente
vercel env pull .env.local

# Ver informações do projeto
vercel inspect
```

### Git

```bash
# Ver status
git status

# Commit
git add .
git commit -m "Configuração Vercel completa"

# Push
git push origin main
```

### npm

```bash
# Instalar dependências
npm install

# Build local
npm run build

# Dev local
npm run dev

# Lint
npm run lint
```

---

## 📈 MONITORAMENTO

### Vercel Dashboard

**URL:** https://vercel.com/joao-vitor-vianas-projects/sistema-pos-operatorio

**O que monitorar:**
- Deploys recentes
- Logs de erro
- Performance metrics
- Bandwidth usage

### Meta/Facebook Dashboard

**URL:** https://developers.facebook.com/apps/1352351593037143

**O que monitorar:**
- Webhook status
- Message templates
- API calls
- Quota usage

### Database (Neon)

**Conexão:** Via DATABASE_URL

**O que monitorar:**
- Connection pool
- Query performance
- Storage usage
- Active connections

---

## 🔐 SEGURANÇA

### Variáveis Sensíveis

**NUNCA commitar:**
- `.env`
- `.env.local`
- `.env.production`
- `env-values.txt`
- Qualquer arquivo com tokens/secrets

**Sempre usar:**
- Vercel Environment Variables
- Encriptação no Vercel
- Tokens com permissões mínimas

### Boas Práticas

1. ✅ Rotacionar tokens periodicamente
2. ✅ Usar diferentes tokens para dev/prod
3. ✅ Monitorar logs de acesso
4. ✅ Configurar rate limiting
5. ✅ Usar HTTPS sempre

---

## 📞 SUPORTE

### Documentação Oficial

- Vercel: https://vercel.com/docs
- Next.js: https://nextjs.org/docs
- Meta WhatsApp: https://developers.facebook.com/docs/whatsapp

### Scripts de Debug

```bash
# Debug completo
node validate-system.js

# Debug rápido
bash quick-test.sh

# Ver variáveis
vercel env ls production

# Ver logs
vercel logs --follow
```

---

**Última atualização:** 19/11/2025
**Versão:** 1.0.0
**Status:** 🟢 Production Ready
