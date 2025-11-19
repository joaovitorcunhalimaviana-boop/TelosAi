# Testes da Integração ML

Este documento fornece scripts e comandos para testar a integração completa de Machine Learning.

---

## 1. Testar API ML (Python)

### 1.1 Rodar API de Exemplo

```bash
cd C:\Users\joaov\sistema-pos-operatorio\ml
python python-api-example.py
```

**Saída esperada:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 1.2 Testar Health Check

```bash
curl http://localhost:8000/health
```

**Saída esperada:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-11-19T12:00:00.000Z"
}
```

### 1.3 Testar Predição

```bash
curl -X POST http://localhost:8000/api/ml/predict \
  -H "Content-Type: application/json" \
  -d "{\"age\":65,\"sex\":\"Masculino\",\"surgeryType\":\"hemorroidectomia\",\"hasComorbidities\":true,\"comorbidityCount\":2,\"medicationCount\":3}"
```

**Saída esperada:**
```json
{
  "risk": 0.35,
  "feature_importance": {
    "age": 0.25,
    "comorbidityCount": 0.40,
    "surgeryType": 0.20,
    "medicationCount": 0.15
  },
  "model_version": "1.0.0"
}
```

### 1.4 Documentação Interativa

Abra no navegador:
```
http://localhost:8000/docs
```

Teste os endpoints diretamente pela interface Swagger.

---

## 2. Testar Integração Next.js

### 2.1 Verificar Variáveis de Ambiente

Arquivo `.env`:
```env
ML_API_URL=http://localhost:8000
ML_MODEL_VERSION=1.0.0
```

### 2.2 Cadastrar Paciente de Teste

1. Acesse: http://localhost:3000/cadastro
2. Preencha:
   - Nome: Teste ML João Silva
   - WhatsApp: +55 11 99999-0001
   - Email: teste-ml@example.com
   - Tipo: Hemorroidectomia
   - Data: Amanhã
3. Clique em "Cadastrar"

**Resultado esperado:**
- ✅ Mensagem: "Paciente cadastrado com sucesso"
- ✅ Redirecionamento para dashboard
- ✅ Log no console do servidor Next.js:
  ```
  [ML] Iniciando predição de risco: { patientId: '...', surgeryId: '...' }
  [ML] Predição concluída com sucesso: { risk: 0.XX, level: 'low|medium|high' }
  [ML] Predição salva com sucesso
  ```

### 2.3 Verificar Visualização

1. No dashboard, clique no paciente recém-criado
2. Clique em "Editar Dados Completos"

**Resultado esperado:**
- ✅ Card "Predição de Risco de Complicações" visível
- ✅ Badge colorido com nível de risco
- ✅ Barra de progresso (0-100%)
- ✅ Lista de fatores de risco
- ✅ Metadata (modelo v1.0.0, timestamp)

---

## 3. Testar Comportamento Sem API ML

### 3.1 Parar API Python

```bash
# Interromper o servidor Python (Ctrl+C)
```

### 3.2 Cadastrar Paciente (sem ML)

1. Acesse: http://localhost:3000/cadastro
2. Preencha:
   - Nome: Teste Sem ML Maria Santos
   - WhatsApp: +55 11 99999-0002
   - Email: teste-sem-ml@example.com
   - Tipo: Fístula
   - Data: Amanhã
3. Clique em "Cadastrar"

**Resultado esperado:**
- ✅ Cadastro funciona normalmente (NÃO deve falhar!)
- ✅ Mensagem: "Paciente cadastrado com sucesso"
- ✅ Log no console do servidor:
  ```
  [ML] Erro ao predizer risco (não-bloqueante): { error: 'fetch failed' }
  ```

### 3.3 Verificar Visualização (sem ML)

1. Abra página do paciente
2. Verifique seção de predição

**Resultado esperado:**
- ✅ Card "Predição de risco não disponível"
- ✅ Mensagem: "Complete mais informações do paciente para gerar uma predição de risco"

---

## 4. Testar com Prisma Studio

### 4.1 Abrir Prisma Studio

```bash
cd C:\Users\joaov\sistema-pos-operatorio
npx prisma studio
```

### 4.2 Verificar Campos ML

1. Acesse "Surgery"
2. Encontre cirurgia recém-criada
3. Verifique campos:
   - `predictedRisk` (deve ter valor entre 0.0 e 1.0)
   - `predictedRiskLevel` (deve ser "low", "medium" ou "high")
   - `mlModelVersion` (deve ser "1.0.0")
   - `mlPredictedAt` (deve ter timestamp)
   - `mlFeatures` (deve ter JSON)

---

## 5. Testar Health Check da Biblioteca

### 5.1 Criar Arquivo de Teste

Crie `test-ml-health.ts`:

```typescript
import { checkMLAPIHealth } from './lib/ml-prediction'

async function test() {
  console.log('Testando health check da API ML...')
  const isHealthy = await checkMLAPIHealth()
  console.log('API ML disponível:', isHealthy)
  process.exit(isHealthy ? 0 : 1)
}

test()
```

### 5.2 Executar Teste

```bash
npx ts-node test-ml-health.ts
```

**Saída esperada (com API rodando):**
```
Testando health check da API ML...
API ML disponível: true
```

**Saída esperada (sem API):**
```
Testando health check da API ML...
[ML] API não disponível: Error: ...
API ML disponível: false
```

---

## 6. Testar Predição Direta

### 6.1 Criar Script de Teste

Crie `test-ml-prediction.ts`:

```typescript
import { predictComplicationRisk } from './lib/ml-prediction'

// Mock data
const mockSurgery = {
  id: 'test-surgery-id',
  type: 'hemorroidectomia',
  date: new Date(),
  userId: 'test-user-id',
  patientId: 'test-patient-id',
  status: 'active',
  dataCompleteness: 20,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockPatient = {
  id: 'test-patient-id',
  name: 'Teste ML',
  phone: '+5511999990001',
  age: 65,
  sex: 'Masculino',
  userId: 'test-user-id',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

async function test() {
  console.log('Testando predição ML...')
  const result = await predictComplicationRisk(mockSurgery, mockPatient, {
    comorbidityCount: 2,
    medicationCount: 3,
  })

  if (result) {
    console.log('✅ Predição bem-sucedida:')
    console.log('   Risco:', result.risk)
    console.log('   Nível:', result.level)
    console.log('   Modelo:', result.modelVersion)
    console.log('   Top fatores:', Object.keys(result.features.importance).slice(0, 3))
  } else {
    console.log('❌ Predição falhou (API pode estar offline)')
  }
}

test()
```

### 6.2 Executar Teste

```bash
npx ts-node test-ml-prediction.ts
```

**Saída esperada (com API):**
```
Testando predição ML...
[ML] Iniciando predição de risco: { patientId: 'test-patient-id', ... }
[ML] Predição concluída com sucesso: { risk: 0.35, level: 'medium', ... }
✅ Predição bem-sucedida:
   Risco: 0.35
   Nível: medium
   Modelo: 1.0.0
   Top fatores: [ 'comorbidityCount', 'age', 'medicationCount' ]
```

---

## 7. Checklist de Testes

### Banco de Dados
- [ ] Schema tem campos ML no modelo Surgery
- [ ] Índice em predictedRiskLevel existe
- [ ] `npx prisma db push` executado com sucesso

### Biblioteca ML
- [ ] `lib/ml-prediction.ts` existe
- [ ] TypeScript compila sem erros
- [ ] Imports corretos

### Cadastro
- [ ] `app/cadastro/actions.ts` importa `predictComplicationRisk`
- [ ] Cadastro funciona COM API ML
- [ ] Cadastro funciona SEM API ML (não-bloqueante)

### Componente
- [ ] `components/ml/surgery-risk-display.tsx` existe
- [ ] Renderiza com dados válidos
- [ ] Mostra fallback quando sem predição

### Tela de Paciente
- [ ] Componente importado em `app/paciente/[id]/editar/page.tsx`
- [ ] Exibe predição quando disponível
- [ ] Exibe mensagem quando não disponível

### API Python
- [ ] `ml/python-api-example.py` existe
- [ ] API roda em localhost:8000
- [ ] Endpoint `/health` funciona
- [ ] Endpoint `/api/ml/predict` funciona

---

## 8. Testes de Performance

### 8.1 Medir Tempo de Resposta

```bash
time curl -X POST http://localhost:8000/api/ml/predict \
  -H "Content-Type: application/json" \
  -d '{"age":65,"sex":"Masculino","surgeryType":"hemorroidectomia"}'
```

**Resultado esperado:** < 1 segundo

### 8.2 Testar Timeout

Modifique `ML_API_TIMEOUT` em `lib/ml-prediction.ts` para 1000ms (1s).

Adicione delay na API Python:
```python
import time
time.sleep(2)  # 2 segundos
```

Cadastrar paciente.

**Resultado esperado:**
- Log: "Timeout error"
- Cadastro funciona normalmente

---

## 9. Testes de Carga (Opcional)

### 9.1 Múltiplos Cadastros Simultâneos

```bash
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/cadastro \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Teste $i\",\"phone\":\"+5511999990$i\"}" &
done
```

**Resultado esperado:**
- Todos os cadastros funcionam
- Alguns podem ter predição ML, outros não (dependendo da carga)

---

## 10. Troubleshooting

### API ML não responde

**Verificar:**
```bash
netstat -an | grep 8000
```

Se nada aparecer, API não está rodando.

**Solução:**
```bash
cd ml
python python-api-example.py
```

### Campos ML não aparecem no banco

**Verificar:**
```bash
npx prisma studio
```

Abra modelo "Surgery" e verifique se campos existem.

**Solução:**
```bash
npx prisma db push
npx prisma generate
```

### Componente não renderiza

**Verificar console do navegador:**
- Erro de import?
- Erro de tipagem?
- Dados undefined?

**Solução:**
Verificar logs e corrigir imports/tipos.

---

**Testes prontos para execução!**

Execute os testes na ordem para garantir funcionamento completo.
