# ✅ Checklist de Configuração do Supabase

## 🔍 Problema Atual

Não conseguimos conectar ao banco de dados Supabase. Possíveis causas:

1. ⚠️ IP não está na whitelist
2. ⚠️ Projeto pausado
3. ⚠️ Firewall bloqueando conexão
4. ⚠️ Senha incorreta

---

## 📋 PASSO A PASSO PARA RESOLVER

### 1️⃣ Acesse o Supabase Dashboard

🔗 https://supabase.com/dashboard/project/rqyvjluxxiofchwiljgc

### 2️⃣ Verifique o Status do Projeto

- [ ] Projeto está **ATIVO** (não pausado)
- [ ] Banco de dados está **HEALTHY**

Se estiver pausado:
- Clique em "Resume Project"
- Aguarde alguns minutos

### 3️⃣ Verifique as Credenciais

**Settings > Database > Connection string**

Copie as strings de conexão e compare:

**Connection Pooling (Transactions):**
```
postgresql://postgres.rqyvjluxxiofchwiljgc:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Direct Connection:**
```
postgresql://postgres:[PASSWORD]@db.rqyvjluxxiofchwiljgc.supabase.co:5432/postgres
```

- [ ] As URLs estão corretas?
- [ ] A senha é: `umavidacompropositos0201`

### 4️⃣ Configure o IP Whitelist

**Settings > Database > Network Restrictions**

**Opção A (Para testes - mais fácil):**
- [ ] Clique em "Add IP Address"
- [ ] Selecione **"Allow all IPv4"**
- [ ] Clique em "Apply"

**Opção B (Mais seguro - produção):**
- [ ] Descubra seu IP público: https://whatismyipaddress.com
- [ ] Adicione seu IP na whitelist
- [ ] Se usar Vercel, adicione IPs do Vercel também

### 5️⃣ Verifique SSL

**Settings > Database > SSL enforcement**

- [ ] SSL está **DESABILITADO** ou **OPCIONAL**

Se estiver obrigatório, você precisa adicionar `?sslmode=require` na URL.

### 6️⃣ Teste a Conexão Pelo Supabase

**SQL Editor > New query**

Execute:
```sql
SELECT 1 as test;
```

- [ ] Query funcionou no SQL Editor?

Se sim, o problema é de rede local.
Se não, o banco está com problema.

---

## 🔧 APÓS CONFIGURAR NO SUPABASE

### Teste 1: Conexão Básica

```bash
npx ts-node scripts/test-db-connection.ts
```

**Deve retornar:**
```
✅ Conexão com o banco de dados estabelecida com sucesso!
```

### Teste 2: Aplicar Schema

```bash
npm run db:push
```

**Deve criar todas as tabelas.**

### Teste 3: Popular Dados

```bash
npm run db:seed
```

**Deve inserir 56 comorbidades + 69 medicações.**

---

## 🆘 SE AINDA NÃO FUNCIONAR

### Teste Manual de Conexão

Instale o `psql` (cliente PostgreSQL) e teste:

```bash
# Windows (com chocolatey)
choco install postgresql

# Testar conexão direta
psql "postgresql://postgres:umavidacompropositos0201@db.rqyvjluxxiofchwiljgc.supabase.co:5432/postgres"
```

### Alternativa: Use Prisma Studio via Supabase

Se a conexão local não funcionar, você pode usar o SQL Editor do Supabase:

1. Copie o conteúdo de `prisma/schema.prisma`
2. Use o gerador online do Prisma para criar SQL
3. Execute o SQL no Supabase SQL Editor

---

## 📝 CHECKLIST RÁPIDO

Execute este checklist no Supabase:

- [ ] Projeto ativo
- [ ] Senha confirmada: `umavidacompropositos0201`
- [ ] IP na whitelist (ou "Allow all" para teste)
- [ ] SSL opcional/desabilitado
- [ ] Teste no SQL Editor funcionou

**Depois:**

- [ ] `npx ts-node scripts/test-db-connection.ts` ✅
- [ ] `npm run db:push` ✅
- [ ] `npm run db:seed` ✅

---

## 🌐 URLs Corretas (com nova senha)

### Para Migrations e Setup
```
DATABASE_URL="postgresql://postgres:umavidacompropositos0201@db.rqyvjluxxiofchwiljgc.supabase.co:5432/postgres"
```

### Para Aplicação (depois de configurar)
```
DATABASE_URL="postgresql://postgres.rqyvjluxxiofchwiljgc:umavidacompropositos0201@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
```

---

## 💡 DICA IMPORTANTE

O formato muda entre pooler e direto:

| Conexão | Formato do Usuário | Porta |
|---------|-------------------|-------|
| Direta  | `postgres`        | 5432  |
| Pooler  | `postgres.PROJECT_REF` | 6543 |

---

Após fazer essas verificações no Supabase, me avise o que você encontrou e vamos continuar a configuração! 🚀
