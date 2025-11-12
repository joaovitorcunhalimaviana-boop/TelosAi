# Guia Rápido - Templates de Cirurgias

## 🎯 Quick Start

### 1. Enviar Questionário via WhatsApp

```typescript
import { formatQuestionsForWhatsApp } from '@/lib/surgery-templates';
import { sendMessage } from '@/lib/whatsapp';

// Formatar perguntas
const message = formatQuestionsForWhatsApp(
  'hemorroidectomia', // tipo cirurgia
  2,                   // dia (D+2)
  'João Silva'         // nome paciente
);

// Enviar
await sendMessage(patient.phone, message);
```

### 2. Analisar Respostas do Paciente

```typescript
import { analyzeFollowUpResponse } from '@/lib/follow-up-analyzer';

const analysis = await analyzeFollowUpResponse({
  surgeryType: 'hemorroidectomia',
  dayNumber: 2,
  patientName: 'João Silva',
  answers: {
    dor: '7',
    sangramento: 'Leve',
    evacuacao: 'Sim',
    febre: false,
    medicacoes: 'Sim, todas',
  },
});

console.log(analysis.status); // NORMAL, ATENÇÃO, URGENTE, EMERGÊNCIA
```

### 3. Mostrar Análise no Dashboard

```tsx
import FollowUpAnalysis from '@/components/FollowUpAnalysis';

<FollowUpAnalysis
  analysis={analysis}
  patientName="João Silva"
  dayNumber={2}
  surgeryType="Hemorroidectomia"
/>
```

---

## 📋 Tipos de Cirurgia

```typescript
'hemorroidectomia'  // Hemorroidectomia
'fistula'           // Fistulotomia/Fistulectomia
'fissura'           // Fissurectomia
'pilonidal'         // Cisto Pilonidal
```

---

## 🚩 Principais Red Flags

### Hemorroidectomia
- ❌ Retenção urinária > 6h
- ❌ Dor 9-10/10 após D+3
- ❌ Sangramento intenso
- ❌ Febre ≥ 38°C

### Fistulotomia
- ❌ Febre + drenagem purulenta
- ❌ Odor fétido
- ❌ Incontinência fecal total
- ❌ Dor crescente após D+5

### Fissurectomia
- ❌ Constipação > 3 dias
- ❌ Dor 9-10/10 ao evacuar
- ❌ Espasmo anal severo
- ❌ Sangramento intenso

### Cisto Pilonidal
- ❌ Deiscência de sutura
- ❌ Febre + secreção purulenta
- ❌ Edema/hiperemia severa
- ❌ Odor fétido

---

## 📊 Níveis de Status

| Status | Risk Level | Ação |
|--------|-----------|------|
| **NORMAL** | low | Nenhuma ação necessária |
| **ATENÇÃO** | medium | Monitorar evolução |
| **URGENTE** | high | Contatar médico hoje |
| **EMERGÊNCIA** | critical | Pronto-socorro AGORA |

---

## 🧪 Testar Sistema

```bash
# Executar todos os testes
npx tsx scripts/test-ai-analysis.ts

# Testa 8 cenários diferentes:
# - 4 cirurgias
# - Casos NORMAL, ATENÇÃO, URGENTE, EMERGÊNCIA
```

---

## 📁 Arquivos Principais

```
lib/
├── surgery-templates.ts      # Perguntas por cirurgia
├── ai-prompts.ts             # Prompts Claude AI
├── follow-up-analyzer.ts     # Análise com IA
└── whatsapp.ts               # Envio WhatsApp

components/
└── FollowUpAnalysis.tsx      # UI de análise

app/api/follow-up/
└── analyze/route.ts          # API endpoint
```

---

## 🔗 Links Úteis

- **Documentação Completa**: `SPRINT_4_TEMPLATES_DOCUMENTACAO.md`
- **Testes**: `scripts/test-ai-analysis.ts`
- **Código Exemplo**: Ver seção "Exemplos Práticos" na doc completa

---

## ⚙️ Variáveis de Ambiente Necessárias

```env
ANTHROPIC_API_KEY=sk-ant-xxxxx     # Claude AI
WHATSAPP_PHONE_NUMBER_ID=xxxxx     # WhatsApp Business
WHATSAPP_ACCESS_TOKEN=xxxxx        # Meta Cloud API
```

---

## 💡 Dicas

1. **Sempre use `await`** ao chamar `analyzeFollowUpResponse()`
2. **Red flags são automáticos** - sistema detecta localmente + via IA
3. **Status URGENTE** = médico deve ser alertado
4. **Status EMERGÊNCIA** = paciente deve ir ao PS
5. **Análise é assíncrona** - pode levar 1-3 segundos

---

**Desenvolvido para Dr. João Vitor Viana**
