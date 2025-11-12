# SPRINT 3 - Guia de Migração do Banco de Dados

## Visão Geral

A Sprint 3 implementa o sistema **Dual-Mode de Cadastro de Pacientes** com suporte multi-tenant. Esta migração adiciona:

1. Modelo `User` para autenticação e multi-tenancy
2. Campo `userId` em todos os modelos principais
3. Sistema de limites de pacientes por usuário
4. Separação de formulários (Simplificado vs Completo)

## Pré-requisitos

- PostgreSQL instalado e rodando
- Backup do banco de dados atual
- Prisma CLI instalado (`npm install -g prisma`)

## Passo 1: Backup do Banco Atual

```bash
# PostgreSQL
pg_dump -U seu_usuario -d nome_do_banco > backup_pre_sprint3.sql
```

## Passo 2: Atualizar Schema

O schema já foi atualizado em `prisma/schema.prisma` com:

- **Modelo User**: Gerenciamento de usuários e planos
- **Multi-tenant**: Campo `userId` em Patient, Surgery, SurgeryDetails, FollowUp, FollowUpResponse, SurgeryTemplate
- **Índices**: Otimização de queries com índices em userId

## Passo 3: Criar Migração

```bash
cd C:\Users\joaov\sistema-pos-operatorio

# Gerar a migração
npx prisma migrate dev --name add_user_and_multitenant

# Se houver erros de dados existentes, você pode precisar:
# 1. Deletar dados de teste
# 2. Ou criar um usuário padrão e atribuir aos registros existentes
```

## Passo 4: Criar Usuário Padrão (Você - Admin)

Após a migração, crie seu usuário admin:

```typescript
// Script: scripts/create-admin-user.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  const hashedPassword = await bcrypt.hash('sua_senha_segura', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'seu_email@gmail.com',
      password: hashedPassword,
      name: 'Dr. João Vitor Viana',
      crm: 'SEU_CRM',
      whatsapp: '5511999999999',
      role: 'admin',
      plan: 'founding',
      maxPatients: 999, // Ilimitado para você
      currentPatients: 0,
    },
  });

  console.log('Admin criado:', admin);
}

createAdminUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Execute:

```bash
npx ts-node scripts/create-admin-user.ts
```

## Passo 5: Atualizar Registros Existentes (Se Houver)

Se você já tem pacientes no banco:

```sql
-- Atribuir todos os pacientes existentes ao usuário admin
UPDATE "Patient"
SET "userId" = (SELECT id FROM "User" WHERE role = 'admin' LIMIT 1)
WHERE "userId" IS NULL;

-- Atribuir todas as cirurgias ao usuário admin
UPDATE "Surgery"
SET "userId" = (SELECT id FROM "User" WHERE role = 'admin' LIMIT 1)
WHERE "userId" IS NULL;

-- Atribuir todos os follow-ups ao usuário admin
UPDATE "FollowUp"
SET "userId" = (SELECT id FROM "User" WHERE role = 'admin' LIMIT 1)
WHERE "userId" IS NULL;

-- Atualizar contador de pacientes do admin
UPDATE "User"
SET "currentPatients" = (SELECT COUNT(*) FROM "Patient" WHERE "userId" = "User".id)
WHERE role = 'admin';
```

## Passo 6: Verificar Migração

```bash
# Verificar schema
npx prisma db pull

# Abrir Prisma Studio para inspecionar dados
npx prisma studio
```

Verifique:
- [ ] Modelo User existe
- [ ] Todos os modelos têm campo userId
- [ ] Índices foram criados
- [ ] Usuário admin foi criado
- [ ] Registros existentes têm userId atribuído

## Passo 7: Testar Sistema Dual-Mode

1. **Teste como Admin:**
   - Login com seu usuário
   - Acesse `/cadastro`
   - Deve mostrar formulário COMPLETO com todos os campos

2. **Teste como Médico:**
   - Crie um usuário médico (role: 'medico')
   - Login com esse usuário
   - Acesse `/cadastro`
   - Deve mostrar formulário SIMPLIFICADO

## Arquivos Criados/Modificados

### Novos Arquivos:
- `lib/follow-up-scheduler.ts` - Agendamento automático de follow-ups
- `components/CadastroPacienteSimplificado.tsx` - Form simplificado
- `components/CadastroPacienteCompleto.tsx` - Form completo
- `components/ui/textarea.tsx` - Componente de textarea
- `app/cadastro/page-dual.tsx` - Página com dual-mode
- `app/cadastro/actions-dual.ts` - Server actions para cada tipo

### Arquivos Modificados:
- `prisma/schema.prisma` - Adicionado User e userId em todos os modelos
- `app/api/pacientes/route.ts` - Filtro por userId (multi-tenant)

## Rollback (Se Necessário)

Se algo der errado:

```bash
# Restaurar backup
psql -U seu_usuario -d nome_do_banco < backup_pre_sprint3.sql

# Ou reverter última migração
npx prisma migrate reset
```

## Próximos Passos

Após a migração bem-sucedida:

1. **Implementar NextAuth** (Sprint 4)
   - Configurar NextAuth com PostgreSQL adapter
   - Substituir `temp-user-id` por session real
   - Implementar middleware de autenticação

2. **Sistema de Planos** (Sprint 5)
   - Implementar lógica de limites de pacientes
   - Sistema de pagamento (Stripe/Mercado Pago)
   - Upgrade de planos

3. **Dashboard Multi-Tenant** (Sprint 6)
   - Cada médico vê apenas seus pacientes
   - Admin vê todos (para pesquisa)

## Suporte

Se encontrar problemas:

1. Verifique logs: `tail -f logs/migration.log`
2. Prisma Studio: `npx prisma studio`
3. Consulte documentação: https://www.prisma.io/docs/

## Checklist Final

- [ ] Backup realizado
- [ ] Migração executada sem erros
- [ ] Usuário admin criado
- [ ] Registros existentes migrados
- [ ] Testes de cadastro funcionando
- [ ] Multi-tenancy funcionando (cada user vê apenas seus dados)
- [ ] Follow-ups sendo criados automaticamente
- [ ] Contadores de pacientes funcionando
