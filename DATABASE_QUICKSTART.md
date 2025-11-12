# 🚀 Guia Rápido - Banco de Dados

## Setup em 3 passos

### 1. Configure o `.env`

```bash
# Use a URL com pooler para desenvolvimento
DATABASE_URL="postgresql://postgres.rqyvjluxxiofchwiljgc:Logos1.1@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
```

### 2. Teste a conexão

```bash
npx ts-node scripts/test-db-connection.ts
```

### 3. Configure o banco (PRIMEIRA VEZ)

```bash
# Opção A - Usar db:push (mais rápido, sem migrations)
# Troque temporariamente para URL direta no .env:
# DATABASE_URL="postgresql://postgres:Logos1.1@db.rqyvjluxxiofchwiljgc.supabase.co:5432/postgres"

npm run db:push
npm run db:seed

# Volte para URL com pooler no .env
```

```bash
# Opção B - Usar migrations (recomendado para produção)
# Troque temporariamente para URL direta no .env

npm run db:migrate
npm run db:seed

# Volte para URL com pooler no .env
```

---

## Queries Comuns

### Importar Prisma Client

```typescript
import { prisma } from '@/lib/prisma'
```

### 1. Criar Paciente

```typescript
const patient = await prisma.patient.create({
  data: {
    name: 'João Silva',
    phone: '5511999999999',
    cpf: '12345678901',
    dateOfBirth: new Date('1980-01-15'),
    age: 44,
    sex: 'Masculino',
    email: 'joao@email.com',
  }
})
```

### 2. Criar Cirurgia com Follow-ups

```typescript
const surgery = await prisma.surgery.create({
  data: {
    patientId: patient.id,
    type: 'hemorroidectomia',
    date: new Date(),
    hospital: 'Hospital São Lucas',
    durationMinutes: 45,
    status: 'active',
    dataCompleteness: 20,
    // Criar 7 follow-ups automaticamente
    followUps: {
      create: [
        { patientId: patient.id, dayNumber: 1, scheduledDate: addDays(new Date(), 1), status: 'pending' },
        { patientId: patient.id, dayNumber: 2, scheduledDate: addDays(new Date(), 2), status: 'pending' },
        { patientId: patient.id, dayNumber: 3, scheduledDate: addDays(new Date(), 3), status: 'pending' },
        { patientId: patient.id, dayNumber: 5, scheduledDate: addDays(new Date(), 5), status: 'pending' },
        { patientId: patient.id, dayNumber: 7, scheduledDate: addDays(new Date(), 7), status: 'pending' },
        { patientId: patient.id, dayNumber: 10, scheduledDate: addDays(new Date(), 10), status: 'pending' },
        { patientId: patient.id, dayNumber: 14, scheduledDate: addDays(new Date(), 14), status: 'pending' },
      ]
    }
  }
})
```

### 3. Buscar Paciente com Tudo

```typescript
const patient = await prisma.patient.findUnique({
  where: { id: patientId },
  include: {
    comorbidities: {
      include: { comorbidity: true }
    },
    medications: {
      include: { medication: true }
    },
    surgeries: {
      include: {
        details: true,
        anesthesia: true,
        preOp: true,
        postOp: true,
        followUps: {
          include: { responses: true }
        }
      }
    }
  }
})
```

### 4. Adicionar Comorbidade ao Paciente

```typescript
// Buscar comorbidade existente
const has = await prisma.comorbidity.findUnique({
  where: { name: 'Hipertensão Arterial Sistêmica (HAS)' }
})

// Associar ao paciente
await prisma.patientComorbidity.create({
  data: {
    patientId: patient.id,
    comorbidityId: has.id,
    details: 'HAS controlada com medicação',
    severity: 'Moderada'
  }
})
```

### 5. Buscar Follow-ups Pendentes

```typescript
const pendingFollowUps = await prisma.followUp.findMany({
  where: {
    status: 'pending',
    scheduledDate: {
      lte: new Date() // Já passou da data agendada
    }
  },
  include: {
    patient: true,
    surgery: true
  }
})
```

### 6. Registrar Resposta de Follow-up

```typescript
await prisma.followUpResponse.create({
  data: {
    followUpId: followUp.id,
    questionnaireData: JSON.stringify({
      painLevel: 7,
      fever: false,
      bleeding: false,
      bowelMovement: true,
    }),
    aiAnalysis: JSON.stringify({
      summary: 'Dor moderada, dentro do esperado',
      recommendations: ['Continuar analgesia']
    }),
    aiResponse: 'João, sua recuperação está progredindo bem!',
    riskLevel: 'low',
    redFlags: JSON.stringify([])
  }
})

// Atualizar status do follow-up
await prisma.followUp.update({
  where: { id: followUp.id },
  data: {
    status: 'responded',
    respondedAt: new Date()
  }
})
```

### 7. Buscar Alertas Críticos

```typescript
const criticalAlerts = await prisma.followUpResponse.findMany({
  where: {
    riskLevel: 'critical',
    doctorAlerted: false
  },
  include: {
    followUp: {
      include: {
        patient: true,
        surgery: true
      }
    }
  }
})
```

### 8. Listar Pacientes com Filtros

```typescript
const patients = await prisma.patient.findMany({
  where: {
    isActive: true,
    surgeries: {
      some: {
        type: 'hemorroidectomia',
        date: {
          gte: new Date('2024-01-01')
        }
      }
    }
  },
  include: {
    surgeries: {
      take: 1,
      orderBy: { date: 'desc' }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 10
})
```

### 9. Estatísticas do Dashboard

```typescript
// Total de pacientes
const totalPatients = await prisma.patient.count({
  where: { isActive: true }
})

// Cirurgias por tipo
const surgeryByType = await prisma.surgery.groupBy({
  by: ['type'],
  _count: { id: true }
})

// Follow-ups pendentes
const pendingFollowUps = await prisma.followUp.count({
  where: {
    status: 'pending',
    scheduledDate: { lte: new Date() }
  }
})

// Alertas críticos não vistos
const criticalAlerts = await prisma.followUpResponse.count({
  where: {
    riskLevel: 'critical',
    doctorAlerted: false
  }
})
```

### 10. Criar Template de Cirurgia

```typescript
const template = await prisma.surgeryTemplate.create({
  data: {
    name: 'Hemorroidectomia Padrão Dr. João',
    surgeryType: 'hemorroidectomia',
    isDefault: true,
    isActive: true,
    templateData: JSON.stringify({
      anesthesia: {
        type: 'raqui',
        pudendoBlock: true
      },
      prescription: {
        ointments: [
          { name: 'Diltiazem 2% + Lidocaína 2%', frequency: '3x/dia', durationDays: 14 }
        ],
        medications: [
          { name: 'Dipirona', dose: '1g', frequency: '6/6h', durationDays: 7 }
        ]
      }
    })
  }
})
```

---

## Transações

Para operações que precisam ser atômicas:

```typescript
await prisma.$transaction(async (tx) => {
  // Criar paciente
  const patient = await tx.patient.create({ data: {...} })

  // Criar cirurgia
  const surgery = await tx.surgery.create({
    data: {
      patientId: patient.id,
      ...
    }
  })

  // Criar follow-ups
  await tx.followUp.createMany({
    data: followUpsData
  })
})
```

---

## Prisma Studio

Interface visual para visualizar e editar dados:

```bash
npm run db:studio
```

Abre em: http://localhost:5555

---

## Raw SQL (se necessário)

```typescript
// Query
const result = await prisma.$queryRaw`
  SELECT * FROM "Patient" WHERE "age" > 50
`

// Execute
await prisma.$executeRaw`
  UPDATE "Surgery" SET "status" = 'completed' WHERE "date" < NOW() - INTERVAL '30 days'
`
```

---

## 🔍 Debugging

Ative logs detalhados em `lib/prisma.ts`:

```typescript
export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn', 'info'], // Adicione 'info' para mais detalhes
})
```

---

## 📚 Documentação Completa

Ver [DATABASE_SETUP.md](./DATABASE_SETUP.md) para:
- Configuração detalhada de URLs
- Troubleshooting completo
- Schema completo
- Segurança e boas práticas
