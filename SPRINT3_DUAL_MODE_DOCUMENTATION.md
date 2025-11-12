# SPRINT 3: Sistema de Cadastro Dual-Mode de Pacientes

## Visão Geral

A Sprint 3 implementa um sistema inteligente de cadastro de pacientes com **dois modos diferentes** baseados no perfil do usuário:

- **Modo Simplificado**: Para médicos comuns (cadastro rápido em 30 segundos)
- **Modo Completo**: Para admin/pesquisadores (todos os campos incluindo dados para pesquisa)

## Arquitetura do Sistema

### 1. Multi-Tenancy

Cada usuário (médico) tem seus próprios pacientes isolados:

```typescript
// Todos os modelos principais têm userId
Patient { userId, ... }
Surgery { userId, ... }
FollowUp { userId, ... }
SurgeryDetails { userId, ... }
FollowUpResponse { userId, ... }
SurgeryTemplate { userId, ... }
```

### 2. Modelo User

```prisma
model User {
  id        String   @id @default(cuid())

  // Autenticação
  email    String @unique
  password String
  name     String
  crm      String?
  whatsapp String?

  // Perfil
  role String @default("medico") // admin | medico

  // Plano
  plan                   String  @default("founding")
  maxPatients            Int     @default(3)
  currentPatients        Int     @default(0)

  // Relações
  patients            Patient[]
  surgeries           Surgery[]
  followUps           FollowUp[]
  // ... outros
}
```

## Componentes Criados

### 1. CadastroPacienteSimplificado.tsx

**Campos:**
- Nome completo
- Data de nascimento (com cálculo automático de idade)
- WhatsApp (máscara BR)
- Email (opcional)
- Tipo de cirurgia (dropdown)
- Data da cirurgia
- Observações (opcional)

**Validações:**
- Nome mínimo 3 caracteres
- WhatsApp formato `(XX) XXXXX-XXXX`
- Email formato válido
- Data cirurgia não pode ser futura
- Idade calculada automaticamente

**Características:**
- Validação em tempo real com Zod
- Máscaras automáticas
- UI responsiva
- 20% de completude de dados

### 2. CadastroPacienteCompleto.tsx

**Campos Adicionais:**
- Sexo (Masculino/Feminino/Outro)
- CPF (máscara automática)
- Hospital/Clínica

**Características:**
- Badge visual "Modo Admin"
- Todos os campos do simplificado +
- Campos para pesquisa científica
- 40% de completude inicial
- Flag `forResearch: true`

### 3. Página Dual-Mode

```typescript
// app/cadastro/page-dual.tsx
const isAdmin = session?.user?.role === 'admin'

return isAdmin ? (
  <CadastroPacienteCompleto onSubmit={handleCompleteSubmit} />
) : (
  <CadastroPacienteSimplificado onSubmit={handleSimplifiedSubmit} />
)
```

## Server Actions

### createSimplifiedPatient()

```typescript
// Cria paciente com dados básicos
- Patient (name, phone, email, dateOfBirth, age)
- Surgery (type, date, dataCompleteness: 20%)
- 7 FollowUps automáticos (D+1, D+2, D+3, D+5, D+7, D+10, D+14)
- Incrementa user.currentPatients
```

### createCompletePatient()

```typescript
// Cria paciente com TODOS os dados
- Patient (+ sex, cpf)
- Surgery (+ hospital, dataCompleteness: 40%)
- 7 FollowUps automáticos
- Incrementa user.currentPatients
- Flag forResearch: true
```

## Follow-Up Scheduler

### lib/follow-up-scheduler.ts

```typescript
// Função principal
createFollowUpSchedule({
  patientId,
  surgeryId,
  surgeryDate,
  userId
})

// Cria automaticamente:
const FOLLOW_UP_DAYS = [1, 2, 3, 5, 7, 10, 14]

// Cada follow-up:
{
  dayNumber: 1,
  scheduledDate: surgeryDate + 1 dia,
  status: 'pending',
  userId: userId
}
```

**Funções Auxiliares:**
- `getPendingFollowUps(patientId)` - Follow-ups pendentes
- `getTodayFollowUps(userId)` - Follow-ups agendados para hoje
- `markFollowUpAsSent(followUpId)` - Marcar como enviado
- `markFollowUpAsResponded(followUpId)` - Marcar como respondido

## Fluxo de Cadastro

### Modo Simplificado (Médico)

1. Médico acessa `/cadastro`
2. Sistema detecta `role: 'medico'`
3. Exibe `CadastroPacienteSimplificado`
4. Médico preenche dados básicos (30 segundos)
5. Submit → `createSimplifiedPatient()`
6. Sistema cria:
   - Paciente (20% completude)
   - Cirurgia
   - 7 Follow-ups automáticos
   - Incrementa contador
7. Redirect para `/dashboard` com toast de sucesso
8. Médico pode completar os 80% restantes depois

### Modo Completo (Admin)

1. Admin acessa `/cadastro`
2. Sistema detecta `role: 'admin'`
3. Exibe `CadastroPacienteCompleto`
4. Admin preenche TODOS os campos
5. Submit → `createCompletePatient()`
6. Sistema cria:
   - Paciente (40% completude + dados de pesquisa)
   - Cirurgia
   - 7 Follow-ups automáticos
   - Incrementa contador
   - Flag `forResearch: true`
7. Redirect para `/dashboard` com toast de sucesso

## API Routes Atualizadas

### GET /api/pacientes

```typescript
// SEMPRE filtra por userId (multi-tenant)
const where = {
  userId: session.user.id,
  // ... outros filtros
}

// Cada médico vê APENAS seus pacientes
```

### POST /api/pacientes

```typescript
// SEMPRE inclui userId
const patient = await prisma.patient.create({
  data: {
    userId: session.user.id,
    // ... outros campos
  }
})
```

## Validações Implementadas

### Validações de Form (Zod)

```typescript
// Nome
z.string().min(3, "Nome deve ter pelo menos 3 caracteres")

// WhatsApp
z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, "WhatsApp inválido")

// Email
z.string().email("Email inválido").optional()

// Data de Nascimento
z.string().min(1, "Data obrigatória")
+ Validação custom: não pode ser futura

// Data da Cirurgia
z.string().min(1, "Data obrigatória")
+ Validação custom: não pode ser futura
```

### Validações de Negócio

```typescript
// Limite de Pacientes
if (user.currentPatients >= user.maxPatients) {
  return { error: 'Limite de pacientes atingido' }
}

// Duplicação de WhatsApp
// Prisma Unique constraint: phone

// Duplicação de CPF
// Prisma Unique constraint: cpf
```

## Máscaras Implementadas

### WhatsApp

```typescript
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, "")
  // (XX) XXXXX-XXXX
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}
```

### CPF

```typescript
const formatCPF = (value: string) => {
  const numbers = value.replace(/\D/g, "")
  // XXX.XXX.XXX-XX
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
}
```

### Cálculo de Idade

```typescript
const calculateAge = (birthDate: string) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}
```

## Checklist de Implementação

### Backend
- [x] Modelo User no schema
- [x] Campo userId em todos os modelos principais
- [x] Índices de performance
- [x] lib/follow-up-scheduler.ts
- [x] Server actions (createSimplifiedPatient, createCompletePatient)
- [x] API routes com filtro userId

### Frontend
- [x] CadastroPacienteSimplificado.tsx
- [x] CadastroPacienteCompleto.tsx
- [x] Componente Textarea
- [x] Página dual-mode
- [x] Máscaras (WhatsApp, CPF)
- [x] Validações em tempo real
- [x] Cálculo automático de idade

### Migração
- [x] SPRINT3_MIGRATION_GUIDE.md
- [x] scripts/create-admin-user.ts
- [x] scripts/migrate-existing-data.ts

### Documentação
- [x] SPRINT3_DUAL_MODE_DOCUMENTATION.md

## Próximos Passos (Sprint 4)

### 1. Autenticação (NextAuth)

```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        // Validar email/senha
        // Retornar user com role
      }
    })
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: user.role,
      }
    })
  }
}
```

### 2. Middleware de Autenticação

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.redirect('/login')
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/cadastro', '/dashboard', '/api/:path*']
}
```

### 3. Substituir temp-user-id

Encontrar todos os `temp-user-id` e substituir por:

```typescript
const session = await getServerSession(authOptions)
const userId = session.user.id
```

Arquivos para atualizar:
- app/cadastro/actions-dual.ts (2 ocorrências)
- app/api/pacientes/route.ts (2 ocorrências)
- Outros endpoints de API

### 4. Sistema de Limites

```typescript
// Antes de criar paciente
const limit = await checkPatientLimit(userId)

if (limit.hasReachedLimit) {
  return {
    error: `Limite de ${limit.maxPatients} pacientes atingido. Faça upgrade do plano.`
  }
}
```

### 5. Dashboard Multi-Tenant

```typescript
// Estatísticas filtradas por userId
const stats = await prisma.patient.aggregate({
  where: { userId: session.user.id },
  _count: true
})

// Lista de pacientes filtrada
const patients = await prisma.patient.findMany({
  where: { userId: session.user.id },
  orderBy: { createdAt: 'desc' }
})
```

## Testes Necessários

### Teste de Cadastro Simplificado
1. Login como médico
2. Acessar `/cadastro`
3. Preencher formulário simplificado
4. Verificar criação de:
   - Paciente (20% completude)
   - Cirurgia
   - 7 Follow-ups
   - Incremento de contador

### Teste de Cadastro Completo
1. Login como admin
2. Acessar `/cadastro`
3. Preencher formulário completo
4. Verificar criação de:
   - Paciente (40% completude + dados pesquisa)
   - Cirurgia
   - 7 Follow-ups
   - Flag forResearch
   - Incremento de contador

### Teste de Multi-Tenancy
1. Criar 2 usuários (médico1, médico2)
2. Médico1 cadastra paciente1
3. Médico2 cadastra paciente2
4. Verificar que:
   - Médico1 vê apenas paciente1
   - Médico2 vê apenas paciente2
   - Admin vê ambos

### Teste de Limites
1. Criar médico com maxPatients: 3
2. Cadastrar 3 pacientes
3. Tentar cadastrar 4º paciente
4. Verificar erro de limite

### Teste de Duplicação
1. Cadastrar paciente com WhatsApp X
2. Tentar cadastrar outro com mesmo WhatsApp
3. Verificar erro de duplicação

## Troubleshooting

### Erro: "userId is required"
- Verificar se session está funcionando
- Verificar se userId está sendo passado nas actions
- Verificar se schema tem campo userId

### Erro: "Unique constraint violation"
- Verificar se WhatsApp/CPF já existe
- Adicionar tratamento de erro nas actions

### Follow-ups não sendo criados
- Verificar lib/follow-up-scheduler.ts
- Verificar se userId está sendo passado
- Verificar logs do Prisma

### Formulário não aparecendo correto
- Verificar role do usuário
- Verificar lógica de isAdmin
- Verificar imports dos componentes

## Recursos

- Prisma Docs: https://www.prisma.io/docs
- NextAuth Docs: https://next-auth.js.org
- Zod Docs: https://zod.dev
- React Hook Form: https://react-hook-form.com

## Conclusão

A Sprint 3 estabelece a base para um sistema multi-tenant robusto com cadastro inteligente de pacientes. O dual-mode permite que médicos comuns trabalhem de forma rápida e eficiente, enquanto você (admin) tem acesso a todos os dados necessários para pesquisa científica.

**Próximo passo crítico:** Implementar autenticação (NextAuth) para ativar completamente o sistema multi-tenant.
