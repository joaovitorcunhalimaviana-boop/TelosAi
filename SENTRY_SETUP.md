# Configuração do Sentry

## ✅ O que foi implementado

O Sentry foi configurado com sucesso no projeto para monitoramento de erros e performance em produção.

### Arquivos criados/modificados:
- ✅ `sentry.client.config.ts` - Configuração do cliente (browser)
- ✅ `sentry.server.config.ts` - Configuração do servidor (Node.js)
- ✅ `sentry.edge.config.ts` - Configuração para Edge Runtime
- ✅ `next.config.ts` - Wrapper do Sentry adicionado
- ✅ `.sentryignore` - Arquivos a ignorar no upload
- ✅ `.env.example` - Variáveis de ambiente documentadas

## 📋 Próximos passos (configuração manual)

### 1. Criar conta no Sentry (se ainda não tiver)

1. Acesse https://sentry.io/signup/
2. Crie sua conta (pode usar GitHub)
3. Crie uma organização (ex: "telos-ai")

### 2. Criar projeto no Sentry

1. No dashboard do Sentry, clique em "Create Project"
2. Selecione "Next.js" como plataforma
3. Nome do projeto: `sistema-pos-operatorio` (ou outro de sua preferência)
4. Clique em "Create Project"

### 3. Copiar credenciais

Após criar o projeto, você receberá:

- **DSN** (Data Source Name): URL como `https://xxxxx@oxxxxx.ingest.sentry.io/xxxxx`
- **Organization Slug**: Nome da sua organização (ex: "telos-ai")
- **Project Slug**: Nome do projeto (ex: "sistema-pos-operatorio")

### 4. Criar Auth Token (para upload de source maps)

1. Vá em **Settings** → **Auth Tokens**
2. Clique em "Create New Token"
3. Nome: "Vercel Deploy Token"
4. Permissões necessárias:
   - ✅ `project:releases`
   - ✅ `project:write`
   - ✅ `org:read`
5. Copie o token gerado (só aparece uma vez!)

### 5. Adicionar variáveis no Vercel

No painel da Vercel (https://vercel.com), vá em:

**Settings → Environment Variables** e adicione:

```bash
# Sentry DSN (Client + Server)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@oxxxxx.ingest.sentry.io/xxxxx

# Sentry Organization
SENTRY_ORG=your-org-slug

# Sentry Project
SENTRY_PROJECT=sistema-pos-operatorio

# Sentry Auth Token (para upload de source maps)
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxxxxxxxxxx
```

**IMPORTANTE:** Marque todas as variáveis como disponíveis em:
- ✅ Production
- ✅ Preview
- ⚠️ Development (opcional - deixe desmarcado para não logar erros locais)

### 6. Redeploy no Vercel

Após adicionar as variáveis:

1. Vá em **Deployments**
2. Clique nos 3 pontinhos do último deploy
3. Clique em **Redeploy**
4. Aguarde o build completar

## 🎯 Funcionalidades configuradas

### Error Tracking
- ✅ Captura automática de erros no cliente (browser)
- ✅ Captura automática de erros no servidor (API routes)
- ✅ Captura automática de erros no Edge Runtime
- ✅ Upload de source maps para debug em produção

### Performance Monitoring
- ✅ Monitoramento de transações (10% sample rate)
- ✅ Integração com Prisma (queries SQL)
- ✅ Browser tracing (navegação, carregamento)

### Session Replay
- ✅ Gravação de 10% das sessões normais
- ✅ Gravação de 100% das sessões com erros
- ✅ Privacidade: texto e mídia ofuscados

### Otimizações
- ✅ Desabilitado em desenvolvimento local
- ✅ Sample rate de 10% para reduzir custos
- ✅ Ignora erros comuns de rede (ECONNRESET, etc.)
- ✅ Source maps ocultados em produção

## 🧪 Como testar

### 1. Forçar um erro de teste

Crie um arquivo `app/api/sentry-test/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  throw new Error("🧪 Teste do Sentry - Este erro foi proposital!");
}
```

### 2. Testar em produção

1. Deploy para Vercel
2. Acesse: `https://seu-dominio.vercel.app/api/sentry-test`
3. Aguarde ~1 minuto
4. Vá no dashboard do Sentry → **Issues**
5. Você deve ver o erro "🧪 Teste do Sentry"

### 3. Verificar source maps

No detalhe do erro no Sentry, você deve ver:
- ✅ Stack trace completo
- ✅ Código-fonte original (TypeScript)
- ✅ Linha exata do erro
- ✅ Contexto ao redor (linhas antes/depois)

## 📊 Monitoramento recomendado

### Alerts importantes para configurar:

1. **High Error Rate**
   - Se taxa de erro > 5% em 5 minutos
   - Notificar via email/Slack

2. **Critical Path Performance**
   - Se `/api/webhooks/whatsapp` > 3s
   - Se `/api/cron/send-followups` > 10s

3. **Database Issues**
   - Queries Prisma > 2s
   - Deadlocks ou timeouts

## 🔒 Privacidade

O Sentry está configurado para:
- ✅ Ofuscar todo texto nas gravações de sessão
- ✅ Bloquear toda mídia nas gravações
- ✅ Não capturar dados sensíveis (headers com tokens)

**Dados do paciente NÃO são enviados ao Sentry.**

## 💰 Custos

### Sentry Free Tier:
- ✅ 5.000 erros/mês
- ✅ 10.000 transações de performance/mês
- ✅ 50 sessões de replay/mês

Com nossas configurações (10% sample rate):
- ~500 erros reais = 5.000 capturados
- Suficiente para 100-200 pacientes ativos

Se precisar de mais, planos pagos começam em $26/mês.

## ✅ Checklist final

- [ ] Conta criada no Sentry
- [ ] Projeto Next.js criado
- [ ] DSN copiado
- [ ] Auth token gerado
- [ ] Variáveis adicionadas no Vercel
- [ ] Redeploy realizado
- [ ] Teste executado com sucesso
- [ ] Erro apareceu no dashboard do Sentry
- [ ] Source maps funcionando (código visível)

## 🆘 Troubleshooting

### Erros não aparecem no Sentry

1. Verificar que `NODE_ENV=production` no Vercel
2. Verificar que `NEXT_PUBLIC_SENTRY_DSN` está definido
3. Verificar que não há erros no build do Vercel
4. Aguardar 1-2 minutos (há delay no processamento)

### Source maps não funcionam

1. Verificar que `SENTRY_AUTH_TOKEN` está definido
2. Verificar que `SENTRY_ORG` e `SENTRY_PROJECT` estão corretos
3. Procurar por "Source maps uploaded" nos logs do build

### Muitos eventos / custos altos

1. Reduzir `tracesSampleRate` de 0.1 para 0.05 (5%)
2. Reduzir `replaysSessionSampleRate` de 0.1 para 0.05
3. Adicionar mais erros em `ignoreErrors` no server config

---

**Implementado em:** 2025-11-20
**Status:** ✅ Pronto para produção (após configurar credenciais)
