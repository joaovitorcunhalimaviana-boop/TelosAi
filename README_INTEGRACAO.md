# Integração Claude AI - Guia Rápido de Uso

## Visão Geral

Sistema completo de análise inteligente de respostas de pacientes em follow-up pós-operatório usando Claude AI da Anthropic.

## Arquivos Criados

```
C:\Users\joaov\sistema-pos-operatorio\
├── lib/
│   ├── anthropic.ts              # Cliente Anthropic + análise de IA
│   ├── anthropic.example.ts      # Exemplos de uso
│   ├── red-flags.ts              # Sistema de red flags determinístico
│   ├── red-flags.test.ts         # Testes do sistema de red flags
│   └── config.ts                 # Configurações centralizadas
├── app/
│   └── api/
│       └── analyze-response/
│           └── route.ts          # API endpoint para análise
├── types/
│   └── followup.ts               # Tipos TypeScript
├── scripts/
│   └── validate-setup.ts         # Script de validação
├── INTEGRACAO_CLAUDE_AI.md       # Documentação completa
└── README_INTEGRACAO.md          # Este arquivo
```

## Configuração Rápida

### 1. Configurar Variável de Ambiente

Edite o arquivo `.env` e adicione sua chave da API da Anthropic:

```bash
# Anthropic Claude AI
ANTHROPIC_API_KEY="sk-ant-api03-..."
```

**Como obter a chave:**
1. Acesse https://console.anthropic.com/
2. Faça login ou crie uma conta
3. Vá em "API Keys"
4. Crie uma nova chave e copie

### 2. Validar Instalação

Execute o script de validação:

```bash
npx ts-node scripts/validate-setup.ts
```

Este script verifica:
- ✓ Variáveis de ambiente configuradas
- ✓ Dependências instaladas
- ✓ Cliente Anthropic funcionando
- ✓ Sistema de red flags operacional
- ✓ Estrutura de arquivos correta
- ✓ Conexão com banco de dados

### 3. Testar Sistema de Red Flags

```bash
npx ts-node lib/red-flags.test.ts
```

## Uso Básico

### 1. Via API Route (Recomendado)

```typescript
// Frontend ou WhatsApp webhook
const response = await fetch('/api/analyze-response', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    followUpId: 'cuid-do-followup',
    questionnaireData: {
      painLevel: 7,
      urinaryRetention: true,
      urinaryRetentionHours: 10,
      fever: false,
      bowelMovement: false,
      bleeding: 'light',
    },
  }),
});

const result = await response.json();

if (result.success) {
  console.log('Nível de risco:', result.data.riskLevel);
  console.log('Resposta empática:', result.data.empatheticResponse);
  console.log('Red flags:', result.data.redFlags);
  console.log('Médico alertado:', result.data.doctorAlerted);
}
```

### 2. Via Função Direta

```typescript
import { analyzeFollowUpResponse } from '@/lib/anthropic';
import { detectRedFlags } from '@/lib/red-flags';

// 1. Detectar red flags determinísticos
const redFlags = detectRedFlags({
  surgeryType: 'hemorroidectomia',
  dayNumber: 2,
  painLevel: 8,
  fever: true,
  temperature: 38.5,
  // ... outros dados
});

// 2. Analisar com Claude AI
const analysis = await analyzeFollowUpResponse({
  surgeryType: 'hemorroidectomia',
  dayNumber: 2,
  patientData: {
    name: 'João Silva',
    age: 45,
    comorbidities: ['Hipertensão'],
  },
  questionnaireData: {
    painLevel: 8,
    fever: true,
    temperature: 38.5,
    // ... outros dados
  },
  detectedRedFlags: redFlags.map(rf => rf.message),
});

// 3. Usar a análise
console.log(analysis.riskLevel);         // 'high'
console.log(analysis.empatheticResponse); // Resposta empática
console.log(analysis.seekCareAdvice);    // Orientação
```

## Fluxo de Análise

```
Paciente responde questionário
    ↓
POST /api/analyze-response
    ↓
1. Red Flags Determinísticos
   (detectRedFlags)
    ↓
2. Análise Claude AI
   (analyzeFollowUpResponse)
    ↓
3. Nível de Risco Final
   (max entre determinístico e IA)
    ↓
4. Salvar no Banco
   (FollowUpResponse)
    ↓
5. Retornar Resposta
   (empática + orientações)
    ↓
Enviar ao paciente via WhatsApp
    ↓
Se risco high/critical → Alertar médico
```

## Níveis de Risco

| Nível | Descrição | Ação |
|-------|-----------|------|
| **low** | Recuperação normal | Resposta de acompanhamento padrão |
| **medium** | Sintomas que requerem atenção | Orientar paciente a monitorar |
| **high** | Sintomas preocupantes | Alertar médico + orientar buscar atendimento |
| **critical** | Sintomas graves | Alertar médico IMEDIATAMENTE + orientar emergência |

## Red Flags por Tipo de Cirurgia

### Hemorroidectomia
- 🔴 Retenção urinária >12h
- 🔴 Dor >8/10
- 🟡 Ausência de evacuação D+3

### Fístula
- 🔴 Secreção purulenta
- 🔴 Sinais de celulite
- 🔴 Dor >8/10

### Fissura
- 🔴 Dor >9/10 persistente
- 🔴 Sangramento ativo
- 🟡 Ausência de evacuação D+4

### Pilonidal
- 🔴 Secreção purulenta
- 🔴 Sinais de celulite
- 🔴 Dor >8/10

### Universais (todos)
- 🔴 Febre ≥39°C
- 🟠 Febre ≥38°C
- 🔴 Sangramento intenso
- 🔴 Dor ≥9/10

## Exemplos de Uso

Ver arquivo `lib/anthropic.example.ts` para exemplos completos de:
- ✅ Caso de baixo risco
- ⚠️ Caso de alto risco
- 🚨 Caso crítico
- 🔌 Uso via API

## Testes

### Teste Manual de Red Flags

```typescript
import { detectRedFlags, getRiskLevel } from '@/lib/red-flags';

const flags = detectRedFlags({
  surgeryType: 'hemorroidectomia',
  dayNumber: 1,
  painLevel: 9,
  urinaryRetention: true,
  urinaryRetentionHours: 15,
  fever: true,
  temperature: 39.5,
});

console.log('Red flags:', flags);
console.log('Nível de risco:', getRiskLevel(flags));
```

### Teste Manual de Análise IA

```typescript
import { analyzeFollowUpResponse } from '@/lib/anthropic';

const result = await analyzeFollowUpResponse({
  surgeryType: 'hemorroidectomia',
  dayNumber: 2,
  patientData: {
    name: 'Teste',
    age: 45,
  },
  questionnaireData: {
    painLevel: 5,
    fever: false,
  },
  detectedRedFlags: [],
});

console.log(result);
```

## Monitoramento

### Logs Importantes

```typescript
// Em lib/anthropic.ts
console.log('Análise iniciada:', { followUpId, surgeryType });
console.log('Análise IA concluída:', { riskLevel, redFlags });

// Em app/api/analyze-response/route.ts
console.log('Red flags detectados:', detectedRedFlags);
console.log('Médico alertado:', doctorAlerted);
```

### Métricas

- Taxa de sucesso das análises
- Tempo de resposta da API Anthropic
- Distribuição de níveis de risco
- Taxa de alertas ao médico
- Custo mensal (tokens consumidos)

## Custos Estimados

**Claude Sonnet 4.5:**
- Input: ~$3.00 / 1M tokens
- Output: ~$15.00 / 1M tokens

**Por análise:**
- ~$0.008 (menos de 1 centavo)

**Mensal (700 análises):**
- ~$5.88

## Troubleshooting

### Erro: "API key inválida"
```bash
# Verifique se a chave está configurada corretamente
echo $ANTHROPIC_API_KEY

# Edite o .env
ANTHROPIC_API_KEY="sk-ant-..."
```

### Erro: "Modelo não encontrado"
```typescript
// Verifique o modelo em lib/config.ts
export const AI_CONFIG = {
  model: 'claude-sonnet-4-5-20250929', // Deve ser exatamente este
  // ...
};
```

### Erro: "Timeout na API"
```typescript
// Aumente o timeout em lib/config.ts
export const AI_CONFIG = {
  // ...
  timeout: 60000, // 60 segundos
};
```

### Red flags não detectados
```bash
# Execute os testes
npx ts-node lib/red-flags.test.ts

# Verifique os thresholds em lib/config.ts
```

## Próximos Passos

1. **Integração WhatsApp**: Enviar resposta empática automaticamente
2. **Dashboard Médico**: Visualizar alertas em tempo real
3. **Relatórios**: Exportar análises para pesquisa
4. **Notificações**: SMS/Email para alertas críticos
5. **Fine-tuning**: Ajustar prompts baseado em feedback

## Documentação Completa

Para documentação técnica detalhada, consulte:
- `INTEGRACAO_CLAUDE_AI.md` - Documentação completa
- `lib/anthropic.example.ts` - Exemplos de código
- `lib/red-flags.test.ts` - Testes e casos de uso

## Suporte

- **Documentação Anthropic**: https://docs.anthropic.com/
- **Status da API**: https://status.anthropic.com/
- **Modelo usado**: Claude Sonnet 4.5

## Resumo dos Comandos

```bash
# Validar instalação
npx ts-node scripts/validate-setup.ts

# Testar red flags
npx ts-node lib/red-flags.test.ts

# Executar exemplos
npx ts-node lib/anthropic.example.ts

# Iniciar servidor
npm run dev

# Testar API
curl -X POST http://localhost:3000/api/analyze-response \
  -H "Content-Type: application/json" \
  -d '{"followUpId":"...","questionnaireData":{...}}'
```

---

**Sistema desenvolvido para**: Dr. João Vitor Viana
**Tecnologias**: Next.js 16, TypeScript, Claude AI (Anthropic), PostgreSQL, Prisma
