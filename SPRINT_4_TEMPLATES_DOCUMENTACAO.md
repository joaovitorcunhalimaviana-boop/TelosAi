# SPRINT 4: Templates das 4 Cirurgias Orificiais - Documentação Completa

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Perguntas por Cirurgia](#perguntas-por-cirurgia)
4. [Análise com Claude AI](#análise-com-claude-ai)
5. [Como Usar](#como-usar)
6. [Exemplos Práticos](#exemplos-práticos)
7. [API Reference](#api-reference)
8. [Testes](#testes)

---

## 🎯 Visão Geral

Sistema completo de templates para 4 cirurgias orificiais com análise inteligente usando Claude AI.

### Cirurgias Suportadas

1. **Hemorroidectomia** - `hemorroidectomia`
2. **Fistulotomia/Fistulectomia** - `fistula`
3. **Fissurectomia** - `fissura`
4. **Cisto Pilonidal** - `pilonidal`

### Follow-ups Automáticos

- D+1, D+2, D+3, D+5, D+7, D+10, D+14
- Perguntas enviadas via WhatsApp
- Respostas analisadas por Claude AI
- Alertas automáticos ao médico

---

## 🏗️ Arquitetura do Sistema

### Arquivos Criados/Modificados

```
lib/
├── surgery-templates.ts          ✅ NOVO - Configuração de perguntas
├── ai-prompts.ts                 ✅ NOVO - Prompts Claude AI
├── follow-up-analyzer.ts         ✅ NOVO - Análise de IA
├── questionnaires.ts             ✅ ATUALIZADO - Integração com templates
├── follow-up-scheduler.ts        ⚪ Existente
└── whatsapp.ts                   ⚪ Existente

components/
└── FollowUpAnalysis.tsx          ✅ NOVO - UI de análise

app/api/follow-up/
└── analyze/route.ts              ✅ NOVO - API de análise

scripts/
└── test-ai-analysis.ts           ✅ NOVO - Testes automatizados
```

### Fluxo de Dados

```
1. Cirurgia Cadastrada
   ↓
2. Follow-ups Agendados (D+1 a D+14)
   ↓
3. WhatsApp Envia Perguntas (surgery-templates.ts)
   ↓
4. Paciente Responde
   ↓
5. Claude AI Analisa (ai-prompts.ts + follow-up-analyzer.ts)
   ↓
6. Sistema Detecta Red Flags
   ↓
7. Médico Alertado (se necessário)
   ↓
8. Dashboard Atualizado (FollowUpAnalysis.tsx)
```

---

## 📝 Perguntas por Cirurgia

### Perguntas Comuns (Todas as Cirurgias)

Aplicadas em todos os dias D+1 a D+14:

1. **Dor** - Escala 0-10
   - Red flag: ≥ 9/10

2. **Sangramento**
   - Opções: Não / Leve / Moderado / Intenso
   - Red flag: Intenso

3. **Evacuação**
   - Opções: Sim / Não / Com dificuldade
   - Red flag: Não (após D+3)

4. **Febre**
   - Sim/Não + Temperatura
   - Red flag: ≥ 38°C

5. **Medicações**
   - Opções: Sim, todas / Parcialmente / Não
   - Red flag: Não

6. **Observações**
   - Texto livre

### Hemorroidectomia - Perguntas Específicas

```typescript
// Todos os dias
- Prolapso hemorroidário? (Sim/Não)
  Red flag: Sim

- Incontinência fecal?
  Opções: Não / Apenas gases / Fezes líquidas / Fezes sólidas
  Red flag: Fezes sólidas

- Dor ao evacuar (0-10)

// Apenas D+1, D+2, D+3
- Conseguiu urinar normalmente? (Sim/Não)
  Red flag: Não

- Se não, há quantas horas sem urinar?
  Red flag: ≥ 6 horas
```

**Red Flags Hemorroidectomia:**
- Dor 9-10/10 persistente após D+3
- Sangramento intenso
- Febre > 38°C
- Retenção urinária > 6 horas
- Prolapso hemorroidário recorrente
- Incontinência fecal sólida

### Fistulotomia - Perguntas Específicas

```typescript
- Drenagem de secreção pela ferida?
  Opções: Não / Leve / Moderada / Intensa
  Red flag: Intensa

- Odor fétido na secreção? (Sim/Não)
  Red flag: Sim

- Incontinência fecal?
  Opções: Não / Parcial - gases / Parcial - líquidas / Total
  Red flag: Total

- Tipo de secreção?
  Opções: Clara/serosa / Amarelada / Purulenta (pus) / Sanguinolenta
  Red flag: Purulenta

// D+7, D+10, D+14
- A ferida está fechando?
  Opções: Sim, bem / Não sei / Não, aberta / Está piorando
  Red flag: Está piorando
```

**Red Flags Fistulotomia:**
- Febre persistente ou > 38°C
- Drenagem purulenta + odor fétido
- Incontinência fecal total
- Dor intensa crescente após D+5
- Sinais de abscesso recidivante

### Fissurectomia - Perguntas Específicas

```typescript
- Dor ao evacuar (0-10)
  Red flag: ≥ 9/10

- Sangramento vivo ao evacuar? (Sim/Não)
  Red flag: Sim

- Espasmo anal?
  Opções: Não / Leve / Moderado / Severo
  Red flag: Severo

- Constipação intestinal?
  Opções: Não / Leve / Moderada / Severa - não evacuou há 3+ dias
  Red flag: Severa

- Duração da dor após evacuar?
  Opções: Sem dor / < 1h / 1-2h / > 2h / Dor constante
  Red flag: Dor constante
```

**Red Flags Fissurectomia:**
- Dor 9-10/10 ao evacuar após D+7
- Sangramento intenso persistente
- Constipação severa (> 3 dias sem evacuar)
- Espasmo anal severo persistente
- Sinais de infecção da ferida

### Cisto Pilonidal - Perguntas Específicas

```typescript
- Drenagem de secreção?
  Opções: Não / Leve / Moderada / Intensa
  Red flag: Intensa

- Edema (inchaço) local?
  Opções: Nenhum / Leve / Moderado / Severo
  Red flag: Severo

- Hiperemia (vermelhidão)?
  Opções: Nenhuma / Leve / Moderada / Severa
  Red flag: Severa

- Odor fétido? (Sim/Não)
  Red flag: Sim

- Deiscência de sutura (pontos abriram)?
  Opções: Não, intactos / Não sei / Sim, parcialmente / Sim, totalmente
  Red flag: Sim, totalmente

- A região está quente ao toque? (Sim/Não)
  Red flag: Sim

- Consegue sentar confortavelmente?
  Opções: Sim, sem problema / Com leve desconforto / Com dor moderada / Não consigo
```

**Red Flags Cisto Pilonidal:**
- Febre + drenagem purulenta
- Odor fétido na ferida
- Edema crescente + hiperemia severa
- Deiscência completa de sutura
- Sinais de celulite (vermelhidão se espalhando)

---

## 🤖 Análise com Claude AI

### Expectativas Clínicas por Dia

O sistema define expectativas específicas para cada cirurgia e dia de pós-operatório.

#### Hemorroidectomia

**D+1 a D+3:**
- Dor intensa (7-9/10)
- Sangramento leve a moderado esperado
- Primeira evacuação pode ocorrer com dor intensa
- Retenção urinária comum (até 25% dos casos)

**D+5 a D+7:**
- Dor moderada (4-6/10)
- Sangramento leve ocasional
- Evacuações regulares com desconforto decrescente
- Retorno parcial a atividades leves

**D+10 a D+14:**
- Dor leve (2-4/10)
- Sangramento mínimo ou ausente
- Evacuações confortáveis
- Retorno gradual às atividades

#### Fistulotomia

**D+1 a D+3:**
- Dor moderada a intensa (5-8/10)
- Drenagem serosa/serossanguinolenta normal
- Edema local esperado

**D+5 a D+7:**
- Dor leve a moderada (3-5/10)
- Drenagem diminuindo progressivamente
- Início da cicatrização

**D+10 a D+14:**
- Dor leve (1-3/10)
- Ferida cicatrizando de dentro para fora
- Drenagem mínima ou ausente

#### Fissurectomia

**D+1 a D+3:**
- Dor intensa ao evacuar (7-9/10)
- Dor pode persistir 2-4h após evacuação
- Espasmo esfincteriano importante
- Sangramento mínimo vivo ao evacuar

**D+5 a D+7:**
- Dor moderada ao evacuar (4-6/10)
- Redução do espasmo anal
- Sangramento raro

**D+10 a D+14:**
- Dor leve (2-4/10)
- Evacuações sem dor significativa
- Espasmo resolvido

#### Cisto Pilonidal

**D+1 a D+3:**
- Dor moderada (4-7/10)
- Dor ao sentar e deitar de costas
- Edema local esperado
- Drenagem serossanguinolenta se ferida aberta

**D+5 a D+7:**
- Dor leve a moderada (2-5/10)
- Redução do edema
- Maior conforto para sentar

**D+10 a D+14:**
- Dor leve (1-3/10)
- Cicatrização em andamento
- Conforto para sentar

### Classificação de Risco

A IA classifica cada caso em 4 níveis:

#### NORMAL (Risk: Low)
- Evolução dentro do esperado
- Sem red flags
- Nenhuma ação necessária

#### ATENÇÃO (Risk: Medium)
- Algo fora do padrão
- Red flags leves
- Monitorar evolução

#### URGENTE (Risk: High)
- Red flags importantes detectados
- Contato médico necessário
- Não aguardar retorno agendado

#### EMERGÊNCIA (Risk: Critical)
- Situação grave
- Avaliação imediata necessária
- Procurar pronto-socorro

### Estrutura da Resposta AI

```typescript
{
  "status": "NORMAL" | "ATENÇÃO" | "URGENTE" | "EMERGÊNCIA",
  "riskLevel": "low" | "medium" | "high" | "critical",
  "redFlags": ["array de red flags detectados"],
  "analise": "Análise clínica detalhada",
  "raciocinioClinico": "Explicação do raciocínio médico",
  "recomendacoes": ["array de recomendações práticas"],
  "respostaEmpática": "Mensagem para o paciente",
  "alertarMedico": true | false,
  "urgencia": "baixa" | "média" | "alta" | "crítica"
}
```

---

## 💻 Como Usar

### 1. Obter Perguntas para um Tipo de Cirurgia

```typescript
import { getQuestionsForSurgery, formatQuestionsForWhatsApp } from '@/lib/surgery-templates';

// Obter perguntas para Hemorroidectomia D+2
const questions = getQuestionsForSurgery('hemorroidectomia', 2);

// Formatar para envio via WhatsApp
const message = formatQuestionsForWhatsApp(
  'hemorroidectomia',
  2,
  'João Silva'
);

// Enviar via WhatsApp
await sendMessage(patientPhone, message);
```

### 2. Analisar Respostas com IA

```typescript
import { analyzeFollowUpResponse } from '@/lib/follow-up-analyzer';

const analysis = await analyzeFollowUpResponse({
  surgeryType: 'hemorroidectomia',
  dayNumber: 2,
  patientName: 'João Silva',
  patientAge: 45,
  hasComorbidities: false,
  answers: {
    dor: '7',
    sangramento: 'Leve',
    evacuacao: 'Com dificuldade',
    febre: false,
    medicacoes: 'Sim, todas',
    prolapso: false,
    retencao_urinaria: true,
    incontinencia_fecal: 'Não',
  },
});

console.log(analysis.status); // "NORMAL"
console.log(analysis.riskLevel); // "low"
console.log(analysis.respostaEmpática); // Mensagem para o paciente
```

### 3. Visualizar Análise no Dashboard

```tsx
import FollowUpAnalysis from '@/components/FollowUpAnalysis';

<FollowUpAnalysis
  analysis={analysis}
  patientName="João Silva"
  dayNumber={2}
  surgeryType="Hemorroidectomia"
  onSendWhatsApp={() => handleSendWhatsApp()}
  onMarkAsRead={() => handleMarkAsRead()}
  onAlert={() => handleAlert()}
  showActions={true}
/>
```

### 4. API para Análise

```typescript
// POST /api/follow-up/analyze
const response = await fetch('/api/follow-up/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    followUpId: 'clxxx',
    surgeryType: 'hemorroidectomia',
    dayNumber: 2,
    answers: { /* respostas */ },
    patientName: 'João Silva',
    patientAge: 45,
    hasComorbidities: false,
  }),
});

const { success, analysis, responseId } = await response.json();
```

---

## 📚 Exemplos Práticos

### Exemplo 1: Caso Normal - Hemorroidectomia D+2

```typescript
const respostas = {
  dor: '7',
  sangramento: 'Leve',
  evacuacao: 'Com dificuldade',
  febre: false,
  medicacoes: 'Sim, todas',
  prolapso: false,
  retencao_urinaria: true, // Conseguiu urinar
  incontinencia_fecal: 'Não',
  dor_evacuacao: '8',
  observacoes: 'Primeira evacuação hoje, foi dolorosa mas consegui',
};

// Resultado esperado:
// Status: NORMAL
// Risk: low
// Red Flags: []
// Resposta: "João, sua recuperação está dentro do esperado..."
```

### Exemplo 2: Caso Urgente - Hemorroidectomia D+1

```typescript
const respostas = {
  dor: '9',
  sangramento: 'Moderado',
  evacuacao: 'Não',
  febre: false,
  medicacoes: 'Sim, todas',
  prolapso: false,
  retencao_urinaria: false, // NÃO conseguiu urinar
  horas_sem_urinar: '8', // RED FLAG
  incontinencia_fecal: 'Não',
  observacoes: 'Muita dor e não consigo urinar',
};

// Resultado esperado:
// Status: URGENTE
// Risk: high
// Red Flags: ["Retenção urinária > 6 horas", "Dor intensa 9/10"]
// Alertar Médico: true
// Resposta: "Maria, identifiquei sinais que precisam atenção médica..."
```

### Exemplo 3: Caso Emergência - Fistulotomia D+3

```typescript
const respostas = {
  dor: '8',
  sangramento: 'Leve',
  evacuacao: 'Com dificuldade',
  febre: true,
  temperatura: '38.7', // RED FLAG
  medicacoes: 'Sim, todas',
  drenagem_secrecao: 'Intensa', // RED FLAG
  odor_fetido: true, // RED FLAG
  tipo_secrecao: 'Purulenta (pus)', // RED FLAG
  observacoes: 'Muita dor, febre, e saindo secreção com cheiro ruim',
};

// Resultado esperado:
// Status: EMERGÊNCIA
// Risk: critical
// Red Flags: ["Febre 38.7°C", "Drenagem purulenta intensa", "Odor fétido", "Sinais de infecção"]
// Alertar Médico: true (IMEDIATO)
// Resposta: "Ana, sua situação requer atenção IMEDIATA. Procure o pronto-socorro AGORA..."
```

---

## 🔌 API Reference

### `getQuestionsForSurgery(surgeryType, dayNumber)`

Retorna array de perguntas para tipo de cirurgia e dia específico.

**Parâmetros:**
- `surgeryType`: `'hemorroidectomia' | 'fistula' | 'fissura' | 'pilonidal'`
- `dayNumber`: `1 | 2 | 3 | 5 | 7 | 10 | 14`

**Retorno:**
```typescript
SurgeryQuestion[] // Array de perguntas
```

### `formatQuestionsForWhatsApp(surgeryType, dayNumber, patientName)`

Formata perguntas para envio via WhatsApp.

**Parâmetros:**
- `surgeryType`: Tipo da cirurgia
- `dayNumber`: Dia do follow-up
- `patientName`: Nome do paciente

**Retorno:**
```typescript
string // Mensagem formatada
```

### `analyzeFollowUpResponse(params)`

Analisa respostas usando Claude AI.

**Parâmetros:**
```typescript
{
  surgeryType: SurgeryType,
  dayNumber: number,
  answers: Record<string, any>,
  patientName: string,
  patientAge?: number,
  hasComorbidities?: boolean,
}
```

**Retorno:**
```typescript
Promise<AnalysisResult>
```

### `detectRedFlags(surgeryType, dayNumber, answers)`

Detecta red flags nas respostas (sem IA).

**Retorno:**
```typescript
string[] // Array de IDs de red flags
```

---

## 🧪 Testes

### Executar Testes Automatizados

```bash
# Instalar dependências
npm install tsx

# Executar testes
npx tsx scripts/test-ai-analysis.ts
```

### Casos de Teste Incluídos

O arquivo `scripts/test-ai-analysis.ts` inclui 8 casos de teste:

1. ✅ Hemorroidectomia D+2 - NORMAL
2. ✅ Hemorroidectomia D+1 - URGENTE (Retenção Urinária)
3. ✅ Fistulotomia D+5 - ATENÇÃO
4. ✅ Fistulotomia D+3 - EMERGÊNCIA (Infecção)
5. ✅ Fissurectomia D+7 - NORMAL
6. ✅ Fissurectomia D+4 - URGENTE (Constipação)
7. ✅ Cisto Pilonidal D+3 - NORMAL
8. ✅ Cisto Pilonidal D+5 - URGENTE (Deiscência)

### Exemplo de Saída de Teste

```
================================================================================
TESTE: Hemorroidectomia D+1 - URGENTE (Retenção)
================================================================================
Paciente: Maria Santos
Cirurgia: hemorroidectomia
Dia: D+1

🤖 Analisando com Claude AI...

✅ Análise completa!

⏱️  Tempo: 1523ms

📊 RESULTADO:
────────────────────────────────────────────────────────────────────────────────
Status: URGENTE
Nível de Risco: high
Alertar Médico: SIM
Urgência: alta

🚩 Red Flags (2):
   1. Retenção urinária há 8 horas
   2. Dor intensa 9/10

📋 Análise:
Paciente no D+1 pós-hemorroidectomia apresenta quadro de atenção com retenção
urinária há 8 horas e dor intensa 9/10. Retenção urinária é complicação comum
mas requer intervenção rápida para evitar lesão vesical...

💡 Recomendações:
   1. Contatar médico IMEDIATAMENTE
   2. Retenção urinária > 6h requer avaliação urgente
   3. Possível necessidade de cateterização vesical
   4. Não aguardar consulta de retorno agendada

💬 Resposta ao Paciente:
────────────────────────────────────────────────────────────────────────────────
Maria, obrigado por responder. Identifiquei alguns sinais que precisam de
atenção médica. Por favor, entre em contato com seu médico o mais breve
possível, sem aguardar a consulta de retorno. Ele poderá avaliar melhor sua
situação e orientar os próximos passos. A retenção urinária requer atenção
rápida para seu conforto e segurança.
────────────────────────────────────────────────────────────────────────────────
```

---

## 📊 Estatísticas do Sistema

### Perguntas por Cirurgia

| Cirurgia | Comuns | Específicas | Total |
|----------|--------|-------------|-------|
| Hemorroidectomia | 7 | 5 | 12 |
| Fistulotomia | 7 | 5 | 12 |
| Fissurectomia | 7 | 5 | 12 |
| Cisto Pilonidal | 7 | 7 | 14 |

### Red Flags por Cirurgia

- **Hemorroidectomia**: 8 red flags monitorados
- **Fistulotomia**: 7 red flags monitorados
- **Fissurectomia**: 7 red flags monitorados
- **Cisto Pilonidal**: 8 red flags monitorados

---

## 🚀 Próximos Passos

1. **Integração WhatsApp**
   - Envio automático de questionários
   - Recebimento e parsing de respostas
   - Envio de respostas empáticas

2. **Dashboard Médico**
   - Visualização de todos os follow-ups
   - Filtros por status/risco
   - Gráficos de evolução

3. **Notificações**
   - Push notifications para médico
   - SMS para casos urgentes
   - Email para relatórios

4. **Relatórios**
   - Exportação de dados
   - Análise estatística
   - Publicações científicas

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte esta documentação
2. Verifique os exemplos práticos
3. Execute os testes automatizados
4. Revise os logs do sistema

---

**Desenvolvido com ❤️ para Dr. João Vitor Viana**

Sistema de Acompanhamento Pós-Operatório Inteligente
Versão: Sprint 4 - Templates Completos
Data: 2025-11-10
