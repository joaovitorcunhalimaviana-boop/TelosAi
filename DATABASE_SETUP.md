# 🗄️ Configuração do Banco de Dados

## Visão Geral

Este projeto usa **PostgreSQL** via **Supabase** com **Prisma ORM**.

## ⚙️ Configuração das URLs de Conexão

O Supabase fornece **duas URLs diferentes** para propósitos diferentes:

### 1️⃣ URL com Pooler (para desenvolvimento e produção)

```bash
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

**Quando usar:**
- Desenvolvimento local (`npm run dev`)
- Produção (Vercel, etc.)
- Queries da aplicação

**Por quê?**
- Connection pooling para melhor performance
- Suporta muitas conexões simultâneas

### 2️⃣ URL Direta (para migrations)

```bash
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Quando usar:**
- Criar migrations (`npm run db:migrate`)
- Deploy de migrations (`npm run db:migrate:deploy`)
- Prisma Studio (`npm run db:studio`)

**Por quê?**
- Prisma migrations precisam de conexão direta
- Pooler não é compatível com comandos DDL

---

## 🚀 Setup Inicial

### Passo 1: Configurar `.env`

Edite o arquivo `.env` na raiz do projeto:

```bash
# Para desenvolvimento (use pooler)
DATABASE_URL="postgresql://postgres.rqyvjluxxiofchwiljgc:Logos1.1@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
```

### Passo 2: Testar Conexão

```bash
npx ts-node scripts/test-db-connection.ts
```

### Passo 3: Aplicar Schema ao Banco

**Opção A - Com Migrations (recomendado para produção):**

```bash
# 1. Altere temporariamente o .env para usar URL DIRETA
# 2. Crie a migration inicial
npm run db:migrate

# 3. Volte o .env para usar URL com POOLER
```

**Opção B - Push Direto (mais rápido para dev):**

```bash
# 1. Altere temporariamente o .env para usar URL DIRETA
# 2. Aplique o schema
npm run db:push

# 3. Volte o .env para usar URL com POOLER
```

### Passo 4: Popular com Dados Base

```bash
npm run db:seed
```

Isso criará:
- ✅ 56 comorbidades pré-cadastradas
- ✅ 69 medicações comuns
- ✅ Dados essenciais para o sistema funcionar

---

## 📋 Scripts Disponíveis

### Desenvolvimento

```bash
npm run db:generate      # Gera o Prisma Client
npm run db:push          # Aplica schema ao banco (sem migrations)
npm run db:migrate       # Cria uma nova migration
npm run db:studio        # Abre interface visual do banco
npm run db:seed          # Popula dados base
```

### Produção

```bash
npm run db:migrate:deploy   # Aplica migrations em produção
```

### Utilidades

```bash
npm run db:reset         # ⚠️ CUIDADO: Apaga tudo e recria
npm run db:format        # Formata o schema.prisma
```

---

## 🔧 Troubleshooting

### Erro: "Can't reach database server"

**Causa:** Usando URL direta quando deveria usar pooler (ou vice-versa).

**Solução:**
- Para migrations: Use URL direta (`db.*.supabase.co:5432`)
- Para aplicação: Use URL com pooler (`pooler.supabase.com:6543`)

### Erro: "Tenant or user not found"

**Causa:** Formato incorreto do usuário na URL com pooler.

**Solução:**
- Pooler: `postgres.[PROJECT-REF]` (com ponto)
- Direto: `postgres` (sem ponto)

### Erro: "P1001" ou timeout

**Possíveis causas:**
1. Firewall/IP não está na whitelist do Supabase
2. VPN/proxy bloqueando conexão
3. Credenciais incorretas

**Solução:**
1. Verifique configurações de rede no Supabase
2. Adicione seu IP à whitelist (ou use "Allow all")
3. Verifique se as credenciais estão corretas

---

## 📊 Schema do Banco

O schema inclui **15 modelos principais**:

### Entidades Core
- `Patient` - Pacientes
- `Surgery` - Cirurgias
- `SurgeryDetails` - Detalhes cirúrgicos específicos

### Preparo e Procedimento
- `PreOpPreparation` - Preparo pré-operatório
- `Anesthesia` - Dados de anestesia
- `PostOpPrescription` - Prescrição pós-operatória

### Comorbidades e Medicações
- `Comorbidity` - Lista de comorbidades
- `PatientComorbidity` - Relação N:N com detalhes
- `Medication` - Lista de medicações
- `PatientMedication` - Relação N:N com posologia

### Follow-up e IA
- `FollowUp` - Agendamentos de follow-up
- `FollowUpResponse` - Respostas dos pacientes
- Red flags detectados pela IA Claude

### Outros
- `ConsentTerm` - Termos de consentimento
- `SurgeryTemplate` - Templates de cirurgia

---

## 🔐 Segurança

### Variáveis de Ambiente

**NUNCA** commite o arquivo `.env` com credenciais reais!

Use `.env.example` como template e mantenha `.env` no `.gitignore`.

### Prisma Client em Produção

O arquivo `lib/prisma.ts` já está configurado corretamente para:
- ✅ Reutilizar conexões em desenvolvimento (hot reload)
- ✅ Criar novas instâncias em produção
- ✅ Logging apropriado

---

## 📚 Documentação Adicional

- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Schema Reference](./prisma/schema.prisma)
- [Seed Example](./prisma/seed-example.ts)

---

## 🆘 Suporte

Se você encontrar problemas:

1. Verifique as configurações de rede do Supabase
2. Teste a conexão com `test-db-connection.ts`
3. Verifique os logs do Prisma (ativado em `lib/prisma.ts`)
4. Consulte a documentação oficial do Prisma e Supabase
