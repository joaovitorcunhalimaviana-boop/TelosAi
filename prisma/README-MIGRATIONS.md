# 📚 Guia de Migrations - Sistema Telos.AI

## 📊 Status Atual

- **Banco de Dados**: Neon PostgreSQL (Serverless)
- **Prisma Version**: 6.19.0
- **Migration Baseline**: `0_init` (aplicada)
- **Schema Models**: 17 models
- **Status**: ✅ Banco sincronizado com schema

---

## 🚀 Quando Fazer Migrations

### Você DEVE criar uma migration quando:

1. **Adicionar nova tabela** (novo model)
2. **Adicionar/remover campo** em model existente
3. **Alterar tipo de campo** (String → Int, etc)
4. **Adicionar/remover índice**
5. **Alterar relacionamento** entre models
6. **Adicionar constraint** (unique, check, etc)

### Você NÃO precisa fazer migration para:

- Mudanças em código TypeScript/React
- Mudanças em queries/mutations
- Mudanças em UI/components
- Mudanças em validações de formulário

---

## 📝 Como Fazer uma Migration (PASSO A PASSO)

### 1. Altere o schema.prisma

Exemplo: Adicionar campo "specialty" ao User

\`\`\`prisma
model User {
  id        String   @id @default(cuid())
  // ... outros campos

  // NOVO CAMPO
  specialty String? // Especialidade médica (opcional)

  // ... resto do model
}
\`\`\`

### 2. Crie a migration em DESENVOLVIMENTO

\`\`\`bash
npx prisma migrate dev --name add_user_specialty
\`\`\`

Este comando vai:
- ✅ Criar arquivo SQL em `prisma/migrations/YYYYMMDDHHMMSS_add_user_specialty/`
- ✅ Aplicar a migration no banco de desenvolvimento
- ✅ Gerar novo Prisma Client automaticamente

### 3. Verifique a migration gerada

Abra o arquivo `.sql` criado e revise se está correto:

\`\`\`sql
-- AlterTable
ALTER TABLE "User" ADD COLUMN "specialty" TEXT;
\`\`\`

### 4. Teste localmente

Execute sua aplicação e teste se tudo funciona:

\`\`\`bash
npm run dev
\`\`\`

### 5. Commit a migration

\`\`\`bash
git add prisma/migrations
git commit -m "feat: Add specialty field to User model"
git push
\`\`\`

### 6. Deploy em PRODUÇÃO

A migration será aplicada automaticamente no Railway/Vercel durante o build:

\`\`\`bash
# Acontece automaticamente no postinstall:
npx prisma generate
npx prisma migrate deploy  # Aplica migrations pendentes
\`\`\`

---

## ⚠️ Migrations Perigosas (CUIDADO!)

### Dropping Columns (Deletar colunas)

❌ **NUNCA faça isso se já tem dados em produção:**

\`\`\`prisma
model User {
  // email String  ← Comentar/deletar sem backup = PERDA DE DADOS!
}
\`\`\`

✅ **Processo seguro para remover campo:**

1. Primeiro, faça backup dos dados
2. Depois, crie migration que remove o campo
3. Se der problema, você pode restaurar

### Alterando Tipos de Dados

⚠️ **Cuidado ao mudar tipos:**

\`\`\`prisma
model Patient {
  // age String  ← Era texto
  age Int        ← Agora é número
}
\`\`\`

Prisma pode **não** conseguir converter automaticamente!

**Solução**: Migration manual em 2 etapas:
1. Adicionar novo campo `ageNumber Int?`
2. Copiar dados com conversão
3. Deletar campo antigo
4. Renomear novo campo

---

## 🔧 Comandos Úteis

### Ver status das migrations

\`\`\`bash
npx prisma migrate status
\`\`\`

### Gerar Prisma Client (após alterar schema)

\`\`\`bash
npx prisma generate
\`\`\`

### Aplicar migrations em produção

\`\`\`bash
npx prisma migrate deploy
\`\`\`

### Resetar banco LOCAL (CUIDADO!)

\`\`\`bash
# ⚠️ APAGA TUDO e reaplica migrations
npx prisma migrate reset
\`\`\`

### Ver dados no Prisma Studio

\`\`\`bash
npx prisma studio
\`\`\`

---

## 🆘 Problemas Comuns

### Erro: "Migration already applied"

Significa que a migration já está no banco. Ignore ou:

\`\`\`bash
npx prisma migrate resolve --applied "nome_da_migration"
\`\`\`

### Erro: "Database schema is not in sync"

Execute:

\`\`\`bash
npx prisma db push  # Força sync sem criar migration
\`\`\`

### Erro: "Direct execution not supported"

Neon não suporta algumas migrations diretas. Use:

\`\`\`bash
npx prisma db push  # Em vez de migrate dev
\`\`\`

---

## 📋 Checklist Antes de Fazer Migration em Produção

- [ ] Testei localmente com `npm run dev`
- [ ] Revisei o arquivo `.sql` gerado
- [ ] Fiz backup dos dados importantes (se necessário)
- [ ] A migration é reversível ou tenho plano B
- [ ] Commitei e fiz push da migration
- [ ] Aguardei o build/deploy completar
- [ ] Verifiquei os logs do Railway/Vercel
- [ ] Testei a aplicação em produção

---

## 🔗 Links Úteis

- [Prisma Migrate Docs](https://www.prisma.io/docs/orm/prisma-migrate)
- [Neon Database Docs](https://neon.tech/docs/introduction)
- [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)

---

**Última Atualização**: 2025-11-13
**Migration Baseline**: 0_init
**Database**: Neon PostgreSQL
