# Arquitetura da Integração ML

## Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                       SISTEMA NEXT.JS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   Cadastro   │      │ Biblioteca   │      │  Componente  │ │
│  │  (Frontend)  │─────▶│ ML Prediction│─────▶│ Visualização │ │
│  └──────────────┘      └──────────────┘      └──────────────┘ │
│         │                     │                      ▲         │
│         │                     │                      │         │
│         ▼                     ▼                      │         │
│  ┌──────────────┐      ┌──────────────┐             │         │
│  │   Actions    │      │  PostgreSQL  │─────────────┘         │
│  │ (Server)     │─────▶│   Database   │                       │
│  └──────────────┘      └──────────────┘                       │
│         │                                                      │
└─────────┼──────────────────────────────────────────────────────┘
          │
          │ HTTP POST (timeout 5s)
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API PYTHON ML                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   FastAPI    │─────▶│Random Forest │─────▶│   Response   │ │
│  │  Endpoints   │      │    Model     │      │     JSON     │ │
│  └──────────────┘      └──────────────┘      └──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Componentes Detalhados

### 1. Frontend (Cadastro)

**Arquivo:** `app/cadastro/page.tsx`

```
┌─────────────────────────────────┐
│   Formulário de Cadastro        │
│                                 │
│  - Nome                         │
│  - WhatsApp                     │
│  - Email                        │
│  - Tipo de Cirurgia             │
│  - Data da Cirurgia             │
│                                 │
│  [Botão Cadastrar]              │
└────────────┬────────────────────┘
             │
             │ onSubmit
             ▼
      createQuickPatient()
```

### 2. Server Actions

**Arquivo:** `app/cadastro/actions.ts`

```typescript
export async function createQuickPatient(data: QuickPatientData) {
  // 1. Criar Patient
  const patient = await prisma.patient.create({ ... })

  // 2. Criar Surgery
  const surgery = await prisma.surgery.create({ ... })

  // 3. Criar FollowUps
  await prisma.followUp.createMany({ ... })

  // 4. PREDIÇÃO ML (ASYNC - NÃO BLOQUEIA)
  predictComplicationRisk(surgery, patient)
    .then(async (prediction) => {
      if (prediction) {
        await prisma.surgery.update({
          where: { id: surgery.id },
          data: { ...prediction }
        })
      }
    })
    .catch(console.error)

  // 5. Retornar sucesso imediatamente
  return { success: true, patientId, surgeryId }
}
```

**Fluxo:**
```
1. CREATE Patient    ─┐
2. CREATE Surgery    ─┼─▶ RETORNA SUCESSO (não espera ML)
3. CREATE FollowUps  ─┘
4. ML Prediction ──────▶ (background, não-bloqueante)
```

### 3. Biblioteca ML

**Arquivo:** `lib/ml-prediction.ts`

```typescript
export async function predictComplicationRisk(
  surgery: Surgery,
  patient: Patient,
  additionalData?: any
): Promise<MLPredictionResult | null> {

  // 1. Preparar dados
  const input = prepareMLInput(surgery, patient, additionalData)

  // 2. Chamar API (com timeout)
  const response = await fetchWithTimeout(
    `${ML_API_URL}/api/ml/predict`,
    { method: 'POST', body: JSON.stringify(input) },
    5000 // 5 segundos
  )

  // 3. Processar resposta
  const data = await response.json()

  // 4. Classificar risco
  const level = classifyRiskLevel(data.risk)

  // 5. Retornar resultado
  return {
    risk: data.risk,
    level,
    features: data.feature_importance,
    modelVersion: data.model_version,
    timestamp: new Date()
  }
}
```

**Classificação de Risco:**
```
0.0 ─────── 0.3 ─────── 0.6 ─────── 1.0
   └─ LOW ─┘   └─ MEDIUM ─┘  └─ HIGH ─┘
   (verde)     (amarelo)      (vermelho)
```

### 4. API Python

**Arquivo:** `ml/python-api-example.py`

```python
@app.post("/api/ml/predict")
async def predict_complication_risk(input_data: PredictionInput):
    # 1. Receber dados
    # { age, sex, surgeryType, comorbidityCount, ... }

    # 2. Fazer predição
    risk = model.predict(input_data)

    # 3. Calcular feature importance
    importance = model.feature_importances_

    # 4. Retornar resultado
    return {
        "risk": 0.35,
        "feature_importance": { ... },
        "model_version": "1.0.0"
    }
```

**Modelo:**
```
INPUT:
  - age (0-120)
  - sex (M/F)
  - surgeryType (hemorroidectomia/fistula/...)
  - comorbidityCount (0-10+)
  - medicationCount (0-20+)
  - ... outras features

      ↓

[Random Forest Model]
   100 árvores
   max_depth: 10
   min_samples_split: 5

      ↓

OUTPUT:
  - risk: 0.35 (35% de chance de complicação)
  - level: "medium"
  - feature_importance: { age: 0.25, ... }
```

### 5. Banco de Dados

**Schema:** `prisma/schema.prisma`

```prisma
model Surgery {
  id                 String   @id @default(cuid())
  type               String   // hemorroidectomia, fistula, ...
  date               DateTime
  dataCompleteness   Int      @default(20)
  status             String   @default("active")

  // ========== CAMPOS ML ==========
  predictedRisk      Float?    // 0.0-1.0
  predictedRiskLevel String?   // low, medium, high
  mlModelVersion     String?   // "1.0.0"
  mlPredictedAt      DateTime? // timestamp
  mlFeatures         String?   // JSON: { importance: {...}, values: {...} }

  @@index([predictedRiskLevel])
}
```

**Exemplo de Dados:**
```json
{
  "id": "clx123abc",
  "type": "hemorroidectomia",
  "date": "2025-11-20T10:00:00Z",
  "predictedRisk": 0.35,
  "predictedRiskLevel": "medium",
  "mlModelVersion": "1.0.0",
  "mlPredictedAt": "2025-11-19T14:30:00Z",
  "mlFeatures": "{\"importance\":{\"age\":0.25,\"comorbidityCount\":0.40},\"values\":{\"age\":65,\"comorbidityCount\":2}}"
}
```

### 6. Componente de Visualização

**Arquivo:** `components/ml/surgery-risk-display.tsx`

```tsx
<SurgeryRiskDisplay
  risk={0.35}
  level="medium"
  features={featuresJson}
/>

┌──────────────────────────────────────────┐
│ 🧠 Predição de Risco de Complicações    │
│                           [RISCO MODERADO]│
├──────────────────────────────────────────┤
│ Probabilidade de Complicação:      35%  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 0%            30%           60%      100%│
├──────────────────────────────────────────┤
│ ℹ️ O que isso significa?                 │
│ Este paciente apresenta risco moderado   │
│ de complicações. Considere monitoramento │
│ mais frequente.                          │
├──────────────────────────────────────────┤
│ 📊 Principais Fatores de Risco          │
│ 1. comorbidityCount (40%)               │
│ 2. age (25%)                            │
│ 3. surgeryType (20%)                    │
│ 4. medicationCount (15%)                │
├──────────────────────────────────────────┤
│ Modelo: v1.0.0 | 19/11/2025 14:30       │
└──────────────────────────────────────────┘
```

**Props:**
- `risk`: número (0.0 a 1.0)
- `level`: "low" | "medium" | "high"
- `features`: JSON string
- `modelVersion`: string
- `predictedAt`: Date
- `showDetails`: boolean
- `showFactors`: boolean
- `compact`: boolean

### 7. Tela de Paciente

**Arquivo:** `app/paciente/[id]/editar/page.tsx`

```tsx
┌────────────────────────────────────────────┐
│ Paciente: João Silva                       │
│ Hemorroidectomia - 20/11/2025              │
│ [75% Completo]                             │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ PREDIÇÃO ML (se disponível)                │
│ [SurgeryRiskDisplay]                       │
└────────────────────────────────────────────┘
         OU
┌────────────────────────────────────────────┐
│ ⚠️ Predição de risco não disponível        │
│ Complete mais informações do paciente.     │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ FORMULÁRIO                                 │
│ [Dados Básicos] [Comorbidades] [...]      │
└────────────────────────────────────────────┘
```

---

## Fluxo de Dados

### Cadastro → Predição → Visualização

```
┌─────────────┐
│ 1. CADASTRO │
│  (Frontend) │
└──────┬──────┘
       │ submit form
       ▼
┌─────────────────────────┐
│ 2. SERVER ACTION        │
│  createQuickPatient()   │
│                         │
│  ┌───────────────────┐  │
│  │ CREATE Patient    │  │
│  └───────────────────┘  │
│           ↓             │
│  ┌───────────────────┐  │
│  │ CREATE Surgery    │  │
│  └───────────────────┘  │
│           ↓             │
│  ┌───────────────────┐  │
│  │ CREATE FollowUps  │  │
│  └───────────────────┘  │
│           ↓             │
│  ┌───────────────────┐  │
│  │ RETURN success    │──┼──▶ Usuário vê mensagem
│  └───────────────────┘  │    de sucesso
│           │             │
│           │ fire-and-forget
│           ▼             │
│  ┌───────────────────┐  │
│  │ ML Prediction     │  │
│  │ (background)      │  │
│  └───────────────────┘  │
└──────────┬──────────────┘
           │ HTTP POST
           ▼
┌─────────────────────────┐
│ 3. PYTHON API           │
│  /api/ml/predict        │
│                         │
│  ┌───────────────────┐  │
│  │ Receive input     │  │
│  └───────────────────┘  │
│           ↓             │
│  ┌───────────────────┐  │
│  │ Model.predict()   │  │
│  └───────────────────┘  │
│           ↓             │
│  ┌───────────────────┐  │
│  │ Return result     │  │
│  └───────────────────┘  │
└──────────┬──────────────┘
           │ JSON response
           ▼
┌─────────────────────────┐
│ 4. SAVE TO DB           │
│  UPDATE Surgery         │
│                         │
│  SET predictedRisk = ..│
│      predictedRiskLevel │
│      mlModelVersion     │
│      mlPredictedAt      │
│      mlFeatures         │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ 5. VISUALIZAÇÃO         │
│  (quando médico acessar)│
│                         │
│  ┌───────────────────┐  │
│  │ GET /api/paciente │  │
│  │ /:id              │  │
│  └───────────────────┘  │
│           ↓             │
│  ┌───────────────────┐  │
│  │ Render component  │  │
│  │ SurgeryRiskDisplay│  │
│  └───────────────────┘  │
└─────────────────────────┘
```

---

## Tratamento de Erros

### Cenário 1: API ML Disponível

```
Cadastro → ML API (200 OK) → Salva no DB → Sucesso
          └──────────────────────────────────┘
                    1-2 segundos
```

### Cenário 2: API ML Timeout

```
Cadastro → ML API (timeout 5s) → Log erro → Continua
          └─────────────────────────────────┘
                 Não afeta cadastro
```

### Cenário 3: API ML Offline

```
Cadastro → ML API (connection refused) → Log erro → Continua
          └──────────────────────────────────────────┘
                       Não afeta cadastro
```

### Cenário 4: API ML Retorna Erro

```
Cadastro → ML API (500 error) → Log erro → Continua
          └───────────────────────────────────┘
                  Não afeta cadastro
```

**EM TODOS OS CASOS:**
- ✅ Cadastro funciona
- ✅ Paciente é criado
- ✅ Follow-ups são agendados
- ✅ Médico recebe confirmação

**Diferença:**
- ✅ Com ML: Tela mostra predição
- ⚠️ Sem ML: Tela mostra "Predição não disponível"

---

## Variáveis de Ambiente

```env
# Next.js
ML_API_URL=http://localhost:8000
ML_MODEL_VERSION=1.0.0

# Python (opcional)
DATABASE_URL=postgresql://...
MODEL_PATH=./risk_model.pkl
```

---

## Portas

- **Next.js:** 3000
- **Python API:** 8000
- **PostgreSQL:** 5432
- **Prisma Studio:** 5555

---

## Monitoramento

### Logs

```
[ML] Iniciando predição de risco: { patientId, surgeryId, surgeryType, timestamp }
[ML] Predição concluída com sucesso: { risk, level, elapsedTimeMs }
[ML] Predição salva com sucesso: { surgeryId, risk, level }

[ML] Erro ao predizer risco (não-bloqueante): { error, elapsedTimeMs }
[ML] Erro ao salvar predição (não-crítico): { error }
```

### Métricas Recomendadas

1. **Taxa de Sucesso:** % de predições bem-sucedidas
2. **Tempo Médio:** Tempo médio de resposta da API ML
3. **Distribuição:** % de pacientes em low/medium/high
4. **Disponibilidade:** Uptime da API ML

---

**Arquitetura pronta e documentada!**
