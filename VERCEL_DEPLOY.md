# Guia de Deploy na Vercel - Sistema Pós-Operatório

## ⚠️ Correção do Erro MIDDLEWARE_INVOCATION_FAILED

Este documento explica como corrigir o erro `500: INTERNAL_SERVER_ERROR - Code: MIDDLEWARE_INVOCATION_FAILED` ao fazer deploy na Vercel.

---

## 🔧 Correções Implementadas

### 1. Middleware Atualizado (`middleware.ts`)

✅ **ANTES (Problemático):**
```typescript
export default NextAuth(authConfig).auth;
```

✅ **DEPOIS (Corrigido):**
```typescript
export { auth as middleware } from "@/lib/auth";
```

**Por quê?** Esta é a sintaxe recomendada para NextAuth v5 com Edge Runtime, evitando problemas de instanciação inline.

---

### 2. Next.js Config Otimizado (`next.config.ts`)

Adicionado `serverExternalPackages` para garantir que Prisma e bcryptjs não sejam bundled incorretamente no Edge Runtime:

```typescript
serverExternalPackages: ['@prisma/client', 'bcryptjs'],
```

---

## 🚀 Configuração de Variáveis de Ambiente na Vercel

### Variáveis OBRIGATÓRIAS

**No dashboard da Vercel (Settings → Environment Variables):**

| Variável | Valor | Ambiente | Descrição |
|----------|-------|----------|-----------|
| `DATABASE_URL` | `postgresql://...` | Production, Preview, Development | URL do banco Neon PostgreSQL |
| `NEXTAUTH_SECRET` | `(gere um novo)` | Production, Preview, Development | Secret para criptografia de sessões |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Production, Preview, Development | API Key do Claude AI |
| `WHATSAPP_PHONE_NUMBER_ID` | `123...` | Production, Preview, Development | ID do número WhatsApp Business |
| `WHATSAPP_ACCESS_TOKEN` | `EAAxxxxx` | Production, Preview, Development | Token de acesso WhatsApp |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | `my-token` | Production, Preview, Development | Token de verificação do webhook |
| `DOCTOR_PHONE_NUMBER` | `5511999999999` | Production, Preview, Development | Número do médico |
| `CRON_SECRET` | `(gere um novo)` | Production, Preview, Development | Secret para cron jobs |

### ⚠️ Variável que NÃO deve ser definida na Vercel

| Variável | ❌ NÃO definir | Por quê? |
|----------|---------------|----------|
| `NEXTAUTH_URL` | ❌ **NÃO adicionar** | NextAuth v5 auto-detecta a URL na Vercel. Definir manualmente causa conflitos! |

---

## 🔐 Como Gerar NEXTAUTH_SECRET

Execute no terminal:

```bash
openssl rand -base64 32
```

Copie o resultado e adicione na Vercel como variável de ambiente `NEXTAUTH_SECRET`.

---

## 📋 Checklist de Deploy

Antes de fazer deploy na Vercel, verifique:

- [ ] ✅ Todas as variáveis obrigatórias estão definidas na Vercel
- [ ] ❌ `NEXTAUTH_URL` **NÃO** está definida na Vercel
- [ ] ✅ `NEXTAUTH_SECRET` foi gerado com `openssl rand -base64 32`
- [ ] ✅ `DATABASE_URL` aponta para o banco Neon PostgreSQL
- [ ] ✅ Prisma migrations foram executadas no banco: `npx prisma migrate deploy`
- [ ] ✅ Build local passou sem erros: `npm run build`
- [ ] ✅ TypeScript sem erros: `npx tsc --noEmit`

---

## 🏗️ Arquitetura do Middleware

### Separação Edge Runtime vs Node.js

```
├── auth.config.ts          # ✅ Edge-compatible (SEM Prisma/bcrypt)
├── lib/
│   └── auth.ts             # ✅ Node.js runtime (COM Prisma/bcrypt)
├── middleware.ts           # ✅ Usa apenas auth de lib/auth.ts
└── app/api/auth/
    └── [...nextauth]/
        └── route.ts        # ✅ Node.js runtime (rotas de autenticação)
```

**Por quê essa separação?**

- **Edge Runtime** (middleware): Roda em nodes próximos ao usuário, mas com APIs limitadas
  - ❌ Não suporta Prisma Client
  - ❌ Não suporta bcrypt/bcryptjs
  - ❌ Não tem acesso a Node.js APIs completas
  - ✅ Apenas validação de JWT

- **Node.js Runtime** (rotas API): Roda no servidor principal com Node.js completo
  - ✅ Suporta Prisma Client
  - ✅ Suporta bcrypt/bcryptjs
  - ✅ Acesso completo a banco de dados

---

## 🐛 Troubleshooting

### Erro: "Invalid `prisma.user.findUnique()` invocation"

**Causa:** Prisma Client não foi gerado ou está desatualizado.

**Solução:**
```bash
npx prisma generate
npx prisma migrate deploy
```

### Erro: "NEXTAUTH_SECRET not set"

**Causa:** Variável de ambiente não definida na Vercel.

**Solução:**
1. Acesse Vercel Dashboard → Settings → Environment Variables
2. Adicione `NEXTAUTH_SECRET` com valor gerado por `openssl rand -base64 32`
3. Salve e faça redeploy

### Erro: "Failed to fetch session"

**Causa:** Configuração incorreta de NEXTAUTH_URL.

**Solução:**
1. **REMOVA** a variável `NEXTAUTH_URL` da Vercel (se existir)
2. NextAuth v5 auto-detecta a URL corretamente

### Erro persiste após correções

**Passos adicionais:**

1. **Limpar cache e rebuild:**
   ```bash
   rm -rf .next
   npm run build
   ```

2. **Verificar logs na Vercel:**
   - Acesse: `https://seu-app.vercel.app/_logs`
   - Procure por stack traces detalhados

3. **Forçar redeploy na Vercel:**
   - Dashboard → Deployments → ... → Redeploy

4. **Verificar versões:**
   ```json
   {
     "next": "16.0.1",
     "next-auth": "5.0.0-beta.30"
   }
   ```

---

## 📚 Documentação de Referência

- [NextAuth v5 Documentation](https://authjs.dev/)
- [Next.js Edge Runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Neon PostgreSQL](https://neon.tech/docs/introduction)

---

## ✅ Resumo das Mudanças

| Arquivo | Mudança | Motivo |
|---------|---------|--------|
| `middleware.ts` | Sintaxe de export simplificada | Compatibilidade Edge Runtime |
| `next.config.ts` | Adicionado `serverExternalPackages` | Evitar bundling incorreto |
| `.env.example` | Documentação melhorada | Orientar configuração correta |
| `VERCEL_DEPLOY.md` | Novo arquivo | Guia completo de deploy |

---

## 🎯 Próximos Passos

1. Commit das mudanças:
   ```bash
   git add .
   git commit -m "Fix: Corrige MIDDLEWARE_INVOCATION_FAILED na Vercel"
   git push
   ```

2. Deploy automático na Vercel (se conectado ao GitHub)

3. Verificar no dashboard da Vercel:
   - Build passou ✅
   - Deployment ativo ✅
   - Sem erros de runtime ✅

4. Testar funcionalidades:
   - Login de usuários ✅
   - Proteção de rotas ✅
   - Acesso ao dashboard ✅

---

**Desenvolvido com Claude Code**
