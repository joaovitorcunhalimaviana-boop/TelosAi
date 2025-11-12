# Integração com Claude AI - Sistema de Acompanhamento Pós-Operatório

Este documento descreve a integração com a API da Anthropic (Claude AI) para análise de respostas dos pacientes no acompanhamento pós-operatório.

## Visão Geral

A integração com Claude AI permite análise contextual e empática das respostas dos pacientes aos questionários de follow-up, combinando:

1. **Red Flags Determinísticos**: Sistema baseado em regras específicas por tipo de cirurgia
2. **Análise por IA**: Claude AI analisa o contexto completo e gera respostas empáticas
3. **Nível de Risco**: Classificação automática (low, medium, high, critical)
4. **Alerta Médico**: Notificação automática em casos de alto risco

## Arquitetura

### 1. Sistema de Red Flags Determinístico (`lib/red-flags.ts`)

Sistema baseado em regras que detecta sinais de alerta antes da análise da IA.

#### Red Flags Universais (todos os tipos de cirurgia)
- Febre ≥38°C (high) ou ≥39°C (critical)
- Sangramento intenso/ativo (critical)
- Sangramento moderado após D+3 (high)
- Dor extrema >9/10 (critical)

#### Red Flags Específicos por Cirurgia

**Hemorroidectomia:**
- Retenção urinária >12h (critical)
- Retenção urinária 6-12h (high)
- Dor >8/10 (high)
- Ausência de evacuação após D+3 (medium)

**Fístula:**
- Secreção purulenta abundante (high)
- Dor >8/10 (high)
- Sinais de celulite (high)

**Fissura:**
- Dor persistente >9/10 (high)
- Sangramento ativo (high)
- Ausência de evacuação após D+4 (medium)

**Doença Pilonidal:**
- Secreção purulenta (high)
- Sinais de celulite (high)
- Dor >8/10 (high)

#### Funções Principais

```typescript
// Detectar red flags
const redFlags = detectRedFlags({
  surgeryType: 'hemorroidectomia',
  dayNumber: 2,
  painLevel: 8,
  fever: true,
  temperature: 38.5,
  // ... outros dados
});

// Determinar nível de risco baseado nos red flags
const riskLevel = getRiskLevel(redFlags); // 'low' | 'medium' | 'high' | 'critical'

// Formatar red flags para exibição
const formatted = formatRedFlags(redFlags);
```

### 2. Cliente Anthropic (`lib/anthropic.ts`)

Cliente configurado para comunicação com a API da Anthropic usando Claude Sonnet 4.5.

#### Configuração

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});
```

#### Função Principal: `analyzeFollowUpResponse()`

Analisa a resposta do paciente considerando:
- Tipo de cirurgia
- Dia pós-operatório
- Dados do paciente (idade, sexo, comorbidades, medicações)
- Dados do questionário
- Red flags já detectados

**Entrada:**
```typescript
interface AnalysisInput {
  surgeryType: string;
  dayNumber: number;
  patientData: {
    name: string;
    age?: number;
    sex?: string;
    comorbidities?: string[];
    medications?: string[];
  };
  questionnaireData: {
    painLevel?: number;
    urinaryRetention?: boolean;
    urinaryRetentionHours?: number;
    bowelMovement?: boolean;
    bleeding?: 'none' | 'light' | 'moderate' | 'severe';
    fever?: boolean;
    temperature?: number;
    discharge?: 'none' | 'serous' | 'purulent' | 'abundant';
    additionalSymptoms?: string[];
    concerns?: string;
  };
  detectedRedFlags: string[];
}
```

**Saída:**
```typescript
interface AnalysisOutput {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  additionalRedFlags: string[];
  empatheticResponse: string;
  seekCareAdvice: string | null;
  reasoning?: string;
}
```

**Exemplo de uso:**
```typescript
const analysis = await analyzeFollowUpResponse({
  surgeryType: 'hemorroidectomia',
  dayNumber: 2,
  patientData: {
    name: 'João Silva',
    age: 45,
    comorbidities: ['Hipertensão'],
  },
  questionnaireData: {
    painLevel: 6,
    fever: false,
    bowelMovement: true,
  },
  detectedRedFlags: [],
});

console.log(analysis.riskLevel); // 'low'
console.log(analysis.empatheticResponse); // Resposta empática gerada pela IA
```

### 3. API Route (`app/api/analyze-response/route.ts`)

Endpoint REST para análise de respostas de follow-up.

#### POST `/api/analyze-response`

Analisa uma resposta do paciente e salva no banco de dados.

**Request Body:**
```json
{
  "followUpId": "cuid-do-followup",
  "questionnaireData": {
    "painLevel": 5,
    "urinaryRetention": false,
    "bowelMovement": true,
    "bleeding": "light",
    "fever": false,
    "discharge": "none",
    "additionalSymptoms": [],
    "concerns": ""
  }
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "data": {
    "responseId": "cuid-da-resposta",
    "riskLevel": "low",
    "empatheticResponse": "Olá! Que bom receber seu retorno...",
    "seekCareAdvice": null,
    "redFlags": [],
    "doctorAlerted": false
  }
}
```

**Response (Erro):**
```json
{
  "error": "Mensagem de erro",
  "details": "Detalhes técnicos"
}
```

#### GET `/api/analyze-response?responseId={id}`

Busca uma análise existente.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "response-id",
    "createdAt": "2025-11-09T10:00:00Z",
    "questionnaireData": { ... },
    "aiAnalysis": { ... },
    "aiResponse": "Resposta empática",
    "riskLevel": "low",
    "redFlags": [],
    "doctorAlerted": false,
    "alertSentAt": null,
    "followUp": { ... },
    "surgery": { ... },
    "patient": { ... }
  }
}
```

## Fluxo de Análise

```
1. Paciente responde questionário via WhatsApp
   ↓
2. Sistema recebe resposta e chama POST /api/analyze-response
   ↓
3. Busca dados do follow-up, cirurgia e paciente no banco
   ↓
4. PASSO 1: Aplica red flags determinísticos
   - detectRedFlags() retorna array de red flags
   - getRiskLevel() determina nível de risco inicial
   ↓
5. PASSO 2: Envia para Claude AI
   - analyzeFollowUpResponse() analisa contexto completo
   - IA retorna: riskLevel, additionalRedFlags, empatheticResponse, seekCareAdvice
   ↓
6. PASSO 3: Determina nível de risco final
   - Usa o mais grave entre determinístico e IA
   ↓
7. PASSO 4: Combina red flags
   - Une red flags determinísticos + detectados pela IA
   ↓
8. PASSO 5: Salva no banco (FollowUpResponse)
   - Salva questionnaireData, aiAnalysis, aiResponse, riskLevel, redFlags
   - Marca doctorAlerted=true se riskLevel for high/critical
   ↓
9. PASSO 6: Atualiza status do FollowUp
   - status = 'responded'
   - respondedAt = agora
   ↓
10. PASSO 7: Retorna resposta
    - responseId, riskLevel, empatheticResponse, seekCareAdvice, redFlags
    ↓
11. Sistema envia resposta empática ao paciente via WhatsApp
    ↓
12. Se doctorAlerted=true, sistema notifica médico
```

## Prompt para Claude AI

O prompt enviado à IA é estruturado para:

1. **Contexto**: Tipo de cirurgia, dia pós-operatório, dados do paciente
2. **Dados**: Resposta do questionário formatada de forma legível
3. **Red Flags**: Lista de red flags já detectados
4. **Tarefas**:
   - Avaliar nível de risco
   - Identificar red flags adicionais
   - Gerar resposta empática
   - Sugerir quando procurar atendimento

5. **Diretrizes**:
   - Ser conservador (preferir superestimar risco)
   - Usar linguagem acessível
   - Manter tom empático
   - Não minimizar sintomas preocupantes

## Configuração

### 1. Variáveis de Ambiente

Adicione ao arquivo `.env`:

```bash
# Anthropic Claude AI
ANTHROPIC_API_KEY="sk-ant-..."
```

### 2. Obter API Key

1. Acesse https://console.anthropic.com/
2. Faça login ou crie uma conta
3. Vá em "API Keys"
4. Crie uma nova chave e copie
5. Cole no arquivo `.env`

### 3. Modelo Utilizado

- **Modelo**: `claude-sonnet-4-5-20250929`
- **Max Tokens**: 2000
- **Temperature**: 0.3 (baixa para maior consistência)

## Banco de Dados

### Model: FollowUpResponse

```prisma
model FollowUpResponse {
  id                String   @id @default(cuid())
  createdAt         DateTime @default(now())

  followUpId        String
  followUp          FollowUp @relation(fields: [followUpId], references: [id])

  questionnaireData String   @db.Text // JSON
  aiAnalysis        String?  @db.Text // JSON
  aiResponse        String?  @db.Text // Resposta empática

  riskLevel         String   @default("low") // low, medium, high, critical
  redFlags          String?  @db.Text // JSON array

  doctorAlerted     Boolean  @default(false)
  alertSentAt       DateTime?

  @@index([followUpId])
  @@index([riskLevel])
}
```

## Exemplo Completo

Ver arquivo `lib/anthropic.example.ts` para exemplos detalhados de uso.

## Testes

### Teste Manual via API

```bash
# Criar um follow-up response
curl -X POST http://localhost:3000/api/analyze-response \
  -H "Content-Type: application/json" \
  -d '{
    "followUpId": "clxxx...",
    "questionnaireData": {
      "painLevel": 7,
      "urinaryRetention": true,
      "urinaryRetentionHours": 10,
      "fever": false,
      "bowelMovement": false
    }
  }'

# Buscar análise
curl http://localhost:3000/api/analyze-response?responseId=clxxx...
```

### Teste de Red Flags

```typescript
import { detectRedFlags, getRiskLevel } from '@/lib/red-flags';

// Caso crítico
const flags = detectRedFlags({
  surgeryType: 'hemorroidectomia',
  dayNumber: 1,
  painLevel: 9,
  urinaryRetention: true,
  urinaryRetentionHours: 15,
  fever: true,
  temperature: 39.5,
});

console.log(flags); // Array de red flags
console.log(getRiskLevel(flags)); // 'critical'
```

## Segurança

1. **API Key**: Nunca commite a chave da API no git
2. **Validação**: Todos os dados são validados antes de enviar à IA
3. **Rate Limiting**: Considere implementar rate limiting na API
4. **Logs**: Erros são logados mas não expõem dados sensíveis
5. **Fallback**: Em caso de erro da IA, sistema usa análise conservadora

## Monitoramento

### Métricas Importantes

- Taxa de sucesso das análises
- Tempo de resposta da API da Anthropic
- Distribuição de níveis de risco
- Taxa de alertas ao médico
- Tokens consumidos

### Logs

```typescript
console.log('Análise iniciada:', { followUpId, surgeryType, dayNumber });
console.log('Red flags detectados:', detectedRedFlags);
console.log('Análise IA concluída:', { riskLevel, redFlags });
console.log('Médico alertado:', doctorAlerted);
```

## Custos

Claude Sonnet 4.5:
- **Input**: ~$3.00 / 1M tokens
- **Output**: ~$15.00 / 1M tokens

Estimativa por análise:
- Input: ~800 tokens = $0.0024
- Output: ~400 tokens = $0.006
- **Total**: ~$0.0084 por análise

Com 100 pacientes/mês e 7 follow-ups cada = 700 análises/mês:
- **Custo mensal**: ~$5.88

## Próximos Passos

1. **WhatsApp Integration**: Enviar resposta empática automaticamente
2. **Dashboard Médico**: Visualizar alertas e análises
3. **Histórico**: Comparar respostas ao longo do tempo
4. **Relatórios**: Exportar análises para pesquisa
5. **Fine-tuning**: Ajustar prompts baseado em feedback médico

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs da aplicação
2. Consulte a documentação da Anthropic: https://docs.anthropic.com/
3. Verifique o status da API: https://status.anthropic.com/

## Licença

Este código é parte do Sistema de Acompanhamento Pós-Operatório - Dr. João Vitor Viana.
