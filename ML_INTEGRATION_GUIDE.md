# Guia de Integração de Machine Learning

## Resumo da Implementação

A integração de Machine Learning para predição de risco de complicações pós-operatórias foi implementada com sucesso no sistema. Esta integração é **não-bloqueante** e **fault-tolerant**, garantindo que falhas no modelo ML não afetem o funcionamento principal do sistema.

---

## Arquivos Criados/Modificados

### 1. Schema do Banco de Dados

**Arquivo:** `prisma/schema.prisma`

**Mudanças:**
- Adicionados 5 novos campos ao modelo `Surgery`:
  - `predictedRisk` (Float?) - Probabilidade de complicação (0.0 a 1.0)
  - `predictedRiskLevel` (String?) - Nível de risco (low, medium, high)
  - `mlModelVersion` (String?) - Versão do modelo ML usado
  - `mlPredictedAt` (DateTime?) - Timestamp da predição
  - `mlFeatures` (String?) - JSON com features usadas na predição
- Adicionado índice em `predictedRiskLevel` para queries otimizadas

**Status:** ✅ Migrado para o banco de dados

---

### 2. Biblioteca de Predição ML

**Arquivo:** `lib/ml-prediction.ts`

**Funcionalidades:**
- `predictComplicationRisk()` - Função principal de predição
- `predictComplicationRiskAsync()` - Versão fire-and-forget
- `checkMLAPIHealth()` - Verifica disponibilidade da API ML
- Funções auxiliares para formatação e visualização

**Características:**
- ✅ Timeout de 5 segundos
- ✅ Tratamento de erros não-bloqueante
- ✅ Logging detalhado
- ✅ TypeScript estrito
- ✅ Classificação automática de risco (low/medium/high)

**Configuração (variáveis de ambiente):**
```env
ML_API_URL=http://localhost:8000
ML_MODEL_VERSION=1.0.0
```

**Thresholds de Risco:**
- 0.0 - 0.3 = Baixo Risco (low)
- 0.3 - 0.6 = Risco Moderado (medium)
- 0.6 - 1.0 = Alto Risco (high)

---

### 3. Integração no Cadastro

**Arquivo:** `app/cadastro/actions.ts`

**Mudanças:**
- Importação de `predictComplicationRisk`
- Chamada assíncrona (não-bloqueante) após criação da cirurgia
- Salvamento automático da predição no banco de dados
- Logs de sucesso/erro

**Fluxo:**
1. Paciente é cadastrado (sucesso sempre garantido)
2. Cirurgia é criada
3. Follow-ups são agendados
4. **Predição ML é executada em background** (fire-and-forget)
5. Se predição bem-sucedida → salva no banco
6. Se predição falhar → apenas log de erro (não afeta cadastro)

---

### 4. Componente de Visualização

**Arquivo:** `components/ml/surgery-risk-display.tsx`

**Componentes:**
- `SurgeryRiskDisplay` - Exibe predição completa
- `SurgeryRiskNotAvailable` - Mensagem quando não há predição

**Features:**
- ✅ Indicador visual de risco (barra de progresso colorida)
- ✅ Badge com nível de risco
- ✅ Explicação do que significa cada nível
- ✅ Top 5 fatores de risco mais importantes
- ✅ Metadata (versão do modelo, timestamp)
- ✅ Versão compacta (apenas badge)
- ✅ Tooltips explicativos
- ✅ Cores adaptativas (verde/amarelo/vermelho)

**Exemplo de Uso:**
```tsx
// Versão completa
<SurgeryRiskDisplay
  risk={0.35}
  level="medium"
  features={featuresJson}
  modelVersion="1.0.0"
  predictedAt={new Date()}
  showDetails={true}
  showFactors={true}
/>

// Versão compacta
<SurgeryRiskDisplay
  risk={0.15}
  level="low"
  compact={true}
/>
```

---

### 5. Tela de Detalhes do Paciente

**Arquivo:** `app/paciente/[id]/editar/page.tsx`

**Mudanças:**
- Importação dos componentes ML
- Adição dos campos ML na interface `PatientData`
- Exibição condicional do componente `SurgeryRiskDisplay`
- Fallback para `SurgeryRiskNotAvailable` quando não há predição

**Localização:** Entre o "Research Completion Progress" e o formulário principal

---

## Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CADASTRO DE PACIENTE                                     │
│    - Dados básicos (nome, telefone, email)                  │
│    - Tipo de cirurgia e data                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CRIAÇÃO NO BANCO                                         │
│    - Patient (cadastro principal)                           │
│    - Surgery (sem campos ML ainda)                          │
│    - FollowUps (agendados)                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. PREDIÇÃO ML (ASYNC - NÃO BLOQUEIA)                       │
│    - Prepara dados do paciente                              │
│    - Chama API Python (timeout 5s)                          │
│    - Classifica nível de risco                              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌───────────────┐
│ 4a. SUCESSO   │         │ 4b. FALHA     │
│ - Update      │         │ - Log erro    │
│   Surgery     │         │ - Sistema     │
│   com ML      │         │   continua    │
└───────┬───────┘         └───────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. VISUALIZAÇÃO                                             │
│    - Médico acessa página do paciente                       │
│    - Component exibe predição (se disponível)               │
│    - Badge, gráficos, fatores de risco                      │
└─────────────────────────────────────────────────────────────┘
```

---

## API Python Esperada

### Endpoint: `POST /api/ml/predict`

**Request Body:**
```json
{
  "age": 45,
  "sex": "Masculino",
  "surgeryType": "hemorroidectomia",
  "hasComorbidities": true,
  "comorbidityCount": 2,
  "medicationCount": 3
}
```

**Response (Sucesso):**
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

**Response (Erro):**
```json
{
  "error": "Mensagem de erro",
  "detail": "Detalhes técnicos"
}
```

### Health Check: `GET /health`

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

## Configuração da API ML

### 1. Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
# Machine Learning API
ML_API_URL=http://localhost:8000
ML_MODEL_VERSION=1.0.0
```

### 2. Para Produção

Atualize `ML_API_URL` para o endpoint de produção:
```env
ML_API_URL=https://ml-api.seu-dominio.com
```

---

## Testes

### 1. Testar Cadastro (sem ML)

```bash
# Se a API ML não estiver disponível:
# - Cadastro funciona normalmente
# - Log mostra erro ML (não-crítico)
# - Página do paciente mostra "Predição não disponível"
```

### 2. Testar Cadastro (com ML)

```bash
# Com API ML rodando:
# - Cadastro funciona
# - Predição é calculada e salva
# - Página do paciente mostra componente de risco
```

### 3. Verificar Health Check

```typescript
import { checkMLAPIHealth } from '@/lib/ml-prediction'

const isHealthy = await checkMLAPIHealth()
console.log('API ML disponível:', isHealthy)
```

---

## Monitoramento

### Logs Importantes

**Sucesso:**
```
[ML] Iniciando predição de risco: { patientId: '...', surgeryId: '...', ... }
[ML] Predição concluída com sucesso: { risk: 0.35, level: 'medium', elapsedTimeMs: 245 }
[ML] Predição salva com sucesso: { surgeryId: '...', risk: 0.35, level: 'medium' }
```

**Erro (não-bloqueante):**
```
[ML] Erro ao predizer risco (não-bloqueante): { error: 'timeout', elapsedTimeMs: 5001 }
[ML] Erro ao salvar predição (não-crítico): { error: '...' }
```

### Métricas Recomendadas

1. **Taxa de sucesso de predições**
   - Quantas predições foram bem-sucedidas vs. falharam
2. **Tempo médio de resposta**
   - Deve estar abaixo de 5 segundos
3. **Distribuição de risco**
   - Quantos pacientes em cada nível (low/medium/high)

---

## Próximos Passos (Opcionais)

### 1. Dashboard de Predições
- Gráfico de distribuição de risco
- Histórico de predições por paciente
- Comparação com outcomes reais

### 2. Alertas Proativos
- Notificar médico quando paciente de alto risco é cadastrado
- Email/SMS automático com recomendações

### 3. Re-predição Dinâmica
- Quando médico adiciona comorbidades/medicações
- Atualizar predição automaticamente

### 4. Análise de Acurácia
- Comparar predições com outcomes reais (follow-ups)
- Métricas: AUC-ROC, precision, recall
- Feedback loop para melhorar modelo

### 5. Explicabilidade Avançada
- SHAP values para explicar cada predição
- Gráficos de waterfall
- Comparação com "paciente médio"

---

## Troubleshooting

### Problema: Predição sempre falha

**Solução:**
1. Verificar se `ML_API_URL` está correto
2. Testar health check: `GET ML_API_URL/health`
3. Verificar logs do servidor ML
4. Aumentar timeout se necessário (em `lib/ml-prediction.ts`)

### Problema: Predição não aparece na tela

**Solução:**
1. Verificar no banco se `predictedRisk` foi salvo
2. Verificar se API retorna os campos ML
3. Verificar console do navegador por erros

### Problema: Campos ML não existem no banco

**Solução:**
```bash
cd C:\Users\joaov\sistema-pos-operatorio
npx prisma db push
```

---

## Conformidade e Segurança

### LGPD/GDPR
- ✅ Predições são armazenadas junto aos dados do paciente (criptografados)
- ✅ Auditoria automática (quem visualizou a predição)
- ✅ Exportação de dados inclui predições ML
- ✅ Exclusão de paciente remove predições

### Segurança
- ✅ Timeout previne DoS
- ✅ Validação de entrada (TypeScript)
- ✅ Não expõe dados sensíveis na API pública
- ✅ Logging sem PII

---

## Contato e Suporte

Para dúvidas sobre a integração ML:
- Documentação técnica: Este arquivo
- Código-fonte: `lib/ml-prediction.ts`
- Componentes: `components/ml/surgery-risk-display.tsx`

---

**Status da Integração:** ✅ COMPLETA E FUNCIONAL

**Data:** 2025-11-19

**Versão:** 1.0.0
