# Integração do Dashboard - Guia Técnico

## Rotas Necessárias

Para que o dashboard funcione completamente, as seguintes rotas precisam ser criadas:

### 1. Página de Detalhes do Paciente
**Rota**: `/paciente/[id]` ou `/paciente/[id]/page.tsx`

**Propósito**: Visualizar todos os detalhes de um paciente específico

**Dados a exibir**:
- Informações pessoais completas
- Histórico de cirurgias
- Comorbidades e medicações
- Timeline de follow-ups
- Respostas dos questionários
- Análises da IA
- Red flags históricos
- Gráficos de evolução

**Server Actions necessárias**:
```typescript
// app/paciente/[id]/actions.ts
export async function getPatientDetails(patientId: string)
export async function getPatientTimeline(patientId: string)
export async function getPatientStats(patientId: string)
```

### 2. Página de Edição/Completar Cadastro
**Rota**: `/paciente/[id]/editar` ou `/paciente/[id]/editar/page.tsx`

**Propósito**: Completar os dados restantes (80%) do cadastro express

**Formulários a implementar**:
- Dados pessoais adicionais (CPF, data nascimento, email)
- Comorbidades (seleção múltipla + detalhes)
- Medicações em uso (lista editável)
- Detalhes cirúrgicos específicos por tipo
- Preparo pré-operatório
- Anestesia e bloqueios
- Prescrição pós-operatória
- Termos de consentimento

**Server Actions necessárias**:
```typescript
// app/paciente/[id]/editar/actions.ts
export async function updatePatientData(patientId: string, data: any)
export async function updateSurgeryDetails(surgeryId: string, data: any)
export async function addComorbidity(patientId: string, comorbidity: any)
export async function addMedication(patientId: string, medication: any)
export async function updateDataCompleteness(surgeryId: string)
```

### 3. Sistema de Notificações (Opcional mas Recomendado)
**Rota**: `/alertas` ou componente global

**Propósito**: Notificar médico sobre alertas críticos em tempo real

**Funcionalidades**:
- Badge com contador de alertas não lidos
- Dropdown ou sidebar com lista de alertas
- Marcar como lido
- Link direto para paciente com alerta
- Filtro por nível de risco

## Integração com Sistema de Autenticação

O dashboard precisa ser protegido por autenticação. Sugestões:

### Opção 1: NextAuth.js
```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ token }) => token?.role === "doctor"
  },
})

export const config = {
  matcher: ["/dashboard/:path*", "/paciente/:path*"]
}
```

### Opção 2: Clerk
```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs"

export default authMiddleware({
  publicRoutes: ["/"],
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
```

### Opção 3: Autenticação Simples (Desenvolvimento)
```typescript
// app/dashboard/layout.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default function DashboardLayout({ children }) {
  const cookieStore = cookies()
  const session = cookieStore.get('session')

  if (!session) {
    redirect('/login')
  }

  return <>{children}</>
}
```

## Atualização de Dados em Tempo Real

### Opção 1: Polling (Simples)
```typescript
// app/dashboard/page.tsx
useEffect(() => {
  const interval = setInterval(() => {
    loadDashboard() // Recarregar a cada 30 segundos
  }, 30000)

  return () => clearInterval(interval)
}, [])
```

### Opção 2: Server-Sent Events (SSE)
```typescript
// app/api/dashboard/events/route.ts
export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      // Enviar atualizações quando houver mudanças
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

### Opção 3: WebSockets (Avançado)
Usar biblioteca como Pusher, Ably ou Socket.io

## Integração com WhatsApp

O dashboard exibe dados de follow-ups. Para integrar com WhatsApp:

### 1. Envio de Mensagens
```typescript
// lib/whatsapp.ts
export async function sendFollowUpMessage(
  phone: string,
  dayNumber: number,
  patientName: string
) {
  // Usar API do WhatsApp Business
  // Pode ser Evolution API, Baileys, ou oficial
}
```

### 2. Recebimento de Respostas
```typescript
// app/api/whatsapp/webhook/route.ts
export async function POST(request: Request) {
  const body = await request.json()

  // Processar resposta do paciente
  // Enviar para IA (Claude) analisar
  // Salvar no banco
  // Detectar red flags
  // Alertar médico se necessário
}
```

## Cálculo de Completude de Dados

A completude é calculada com base nos campos preenchidos:

```typescript
// utils/calculateCompleteness.ts
export function calculateDataCompleteness(surgery: Surgery) {
  let totalFields = 100
  let filledFields = 20 // Cadastro express base

  // Dados do paciente (20 pontos)
  if (surgery.patient.cpf) filledFields += 5
  if (surgery.patient.dateOfBirth) filledFields += 5
  if (surgery.patient.email) filledFields += 5
  if (surgery.patient.comorbidities.length > 0) filledFields += 5

  // Detalhes cirúrgicos (30 pontos)
  if (surgery.details?.fullDescription) filledFields += 10
  if (surgery.details?.hemorrhoidTechnique) filledFields += 10
  if (surgery.details?.complications) filledFields += 10

  // Anestesia (15 pontos)
  if (surgery.anesthesia?.type) filledFields += 10
  if (surgery.anesthesia?.pudendoBlock) filledFields += 5

  // Prescrição (15 pontos)
  if (surgery.postOp?.medications) filledFields += 10
  if (surgery.postOp?.ointments) filledFields += 5

  // Termos de consentimento (20 pontos)
  if (surgery.consentTerms.length > 0) filledFields += 20

  return Math.min(filledFields, 100)
}
```

## Testes Recomendados

### 1. Testes Unitários (Vitest/Jest)
```typescript
// __tests__/dashboard/actions.test.ts
import { getDashboardStats, getDashboardPatients } from '@/app/dashboard/actions'

describe('Dashboard Actions', () => {
  test('getDashboardStats retorna estatísticas corretas', async () => {
    const stats = await getDashboardStats()
    expect(stats).toHaveProperty('todaySurgeries')
    expect(stats).toHaveProperty('activePatientsCount')
  })

  test('getDashboardPatients aplica filtros corretamente', async () => {
    const patients = await getDashboardPatients({
      surgeryType: 'hemorroidectomia'
    })
    expect(patients.every(p => p.surgeryType === 'hemorroidectomia')).toBe(true)
  })
})
```

### 2. Testes E2E (Playwright/Cypress)
```typescript
// e2e/dashboard.spec.ts
test('dashboard exibe estatísticas e pacientes', async ({ page }) => {
  await page.goto('/dashboard')

  // Verificar cards de estatísticas
  await expect(page.locator('text=Cirurgias Hoje')).toBeVisible()
  await expect(page.locator('text=Pacientes Ativos')).toBeVisible()

  // Verificar lista de pacientes
  await expect(page.locator('[data-testid="patient-card"]')).toHaveCount.greaterThan(0)

  // Testar filtros
  await page.selectOption('select', 'hemorroidectomia')
  await expect(page.locator('[data-testid="patient-card"]')).toHaveCount.lessThanOrEqual(
    previousCount
  )
})
```

## Performance e Otimização

### 1. Índices do Banco de Dados
Já definidos no schema.prisma:
- `@@index([patientId])` em Surgery
- `@@index([date])` em Surgery
- `@@index([type])` em Surgery
- `@@index([scheduledDate])` em FollowUp
- `@@index([status])` em FollowUp

### 2. Cache de Queries (React Query)
```typescript
// app/dashboard/page.tsx
import { useQuery } from '@tanstack/react-query'

const { data: stats } = useQuery({
  queryKey: ['dashboardStats'],
  queryFn: getDashboardStats,
  refetchInterval: 60000, // Recarregar a cada 1 minuto
})
```

### 3. Paginação
```typescript
// app/dashboard/actions.ts
export async function getDashboardPatients(
  filters: DashboardFilters,
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit

  const patients = await prisma.surgery.findMany({
    where: whereClause,
    skip,
    take: limit,
    // ...
  })

  const total = await prisma.surgery.count({ where: whereClause })

  return {
    patients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}
```

## Variáveis de Ambiente Necessárias

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# WhatsApp (se usar Evolution API)
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="your-api-key"
EVOLUTION_INSTANCE="instance-name"

# IA (Claude)
ANTHROPIC_API_KEY="sk-ant-..."

# Autenticação (se usar NextAuth)
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Estrutura Final Recomendada

```
app/
├── dashboard/
│   ├── page.tsx                 ✅ Criado
│   ├── actions.ts               ✅ Criado
│   ├── README.md                ✅ Criado
│   └── INTEGRATION.md           ✅ Criado
├── paciente/
│   └── [id]/
│       ├── page.tsx             ⏳ A criar
│       ├── actions.ts           ⏳ A criar
│       └── editar/
│           ├── page.tsx         ⏳ A criar
│           └── actions.ts       ⏳ A criar
├── alertas/
│   └── page.tsx                 ⏳ A criar (opcional)
├── api/
│   ├── whatsapp/
│   │   └── webhook/
│   │       └── route.ts         ⏳ A criar
│   └── dashboard/
│       └── events/
│           └── route.ts         ⏳ A criar (opcional)
└── login/
    └── page.tsx                 ⏳ A criar

prisma/
├── schema.prisma                ✅ Existe
├── seed-example.ts              ✅ Criado
└── migrations/                  ⏳ A executar

components/
├── ui/                          ✅ Existem
└── dashboard/
    ├── StatsCard.tsx            ⏳ A criar (opcional)
    ├── PatientCard.tsx          ⏳ A criar (opcional)
    └── Filters.tsx              ⏳ A criar (opcional)

lib/
├── prisma.ts                    ✅ Existe
├── whatsapp.ts                  ⏳ A criar
└── utils.ts                     ✅ Existe (presumido)
```

## Próximos Passos Imediatos

1. ✅ Dashboard criado
2. ⏳ Executar migrations do Prisma
3. ⏳ Testar seed de exemplo
4. ⏳ Criar página de login básica
5. ⏳ Criar página de detalhes do paciente
6. ⏳ Criar página de edição
7. ⏳ Integrar com WhatsApp
8. ⏳ Implementar sistema de alertas
9. ⏳ Adicionar testes
10. ⏳ Deploy em produção
