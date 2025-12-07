/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AI Prompts - Sistema de Prompts para Análise Claude AI
 * Prompts específicos para cada tipo de cirurgia e dia de pós-operatório
 *
 * Responsável por:
 * - Gerar prompts contextualizados
 * - Definir expectativas clínicas por dia
 * - Identificar red flags específicos
 * - Formatar resposta estruturada
 */

import { SurgeryType, SURGERY_TYPES } from './surgery-templates';

// ============================================
// TYPES
// ============================================

export interface AnalysisPromptParams {
  surgeryType: SurgeryType;
  dayNumber: number;
  answers: Record<string, any>;
  patientName: string;
  patientAge?: number;
  hasComorbidities?: boolean;
}

export interface ExpectedOutcomes {
  painRange: string;
  bleedingExpected: boolean;
  bleedingLevel: string;
  bowelMovement: string;
  specificExpectations: string[];
}

// ============================================
// EXPECTATIVAS CLÍNICAS POR CIRURGIA E DIA
// ============================================

/**
 * Define expectativas clínicas para Hemorroidectomia
 */
function getHemorroidectomiaExpectations(day: number): ExpectedOutcomes {
  if (day <= 3) {
    return {
      painRange: 'Dor intensa (7-9/10)',
      bleedingExpected: true,
      bleedingLevel: 'Leve a moderado',
      bowelMovement: 'Primeira evacuação pode ocorrer D+1-3 com dor intensa',
      specificExpectations: [
        'Pico de dor nas primeiras 48-72h',
        'Retenção urinária comum em D+1 (até 25% dos casos)',
        'Sangramento leve ao evacuar é esperado',
        'Uso regular de analgésicos potentes',
      ],
    };
  } else if (day <= 7) {
    return {
      painRange: 'Dor moderada (4-6/10)',
      bleedingExpected: true,
      bleedingLevel: 'Leve ocasional',
      bowelMovement: 'Evacuações regulares com desconforto decrescente',
      specificExpectations: [
        'Melhora progressiva da dor',
        'Sangramento apenas em pequenas quantidades',
        'Redução gradual de analgésicos',
        'Retorno parcial a atividades leves',
      ],
    };
  } else {
    return {
      painRange: 'Dor leve (2-4/10)',
      bleedingExpected: false,
      bleedingLevel: 'Mínimo ou ausente',
      bowelMovement: 'Confortável com analgesia mínima',
      specificExpectations: [
        'Dor controlada com analgésicos simples',
        'Sangramento raro',
        'Retorno gradual às atividades',
        'Cicatrização em andamento',
      ],
    };
  }
}

/**
 * Define expectativas clínicas para Fistulotomia
 */
function getFistulaExpectations(day: number): ExpectedOutcomes {
  if (day <= 3) {
    return {
      painRange: 'Dor moderada a intensa (5-8/10)',
      bleedingExpected: true,
      bleedingLevel: 'Leve a moderado',
      bowelMovement: 'Evacuações possíveis com dor',
      specificExpectations: [
        'Dor moderada nas primeiras 72h',
        'Drenagem serosa ou serossanguinolenta é normal',
        'Edema local esperado',
        'Primeira evacuação pode ser desconfortável',
      ],
    };
  } else if (day <= 7) {
    return {
      painRange: 'Dor leve a moderada (3-5/10)',
      bleedingExpected: false,
      bleedingLevel: 'Mínimo',
      bowelMovement: 'Evacuações com leve desconforto',
      specificExpectations: [
        'Drenagem diminuindo progressivamente',
        'Dor controlada com analgésicos simples',
        'Início da cicatrização',
        'Possível drenagem clara residual',
      ],
    };
  } else {
    return {
      painRange: 'Dor leve (1-3/10)',
      bleedingExpected: false,
      bleedingLevel: 'Ausente',
      bowelMovement: 'Normal ou próximo ao normal',
      specificExpectations: [
        'Ferida cicatrizando de dentro para fora',
        'Drenagem mínima ou ausente',
        'Retorno às atividades habituais',
        'Sem sinais de recidiva',
      ],
    };
  }
}

/**
 * Define expectativas clínicas para Fissurectomia
 */
function getFissuraExpectations(day: number): ExpectedOutcomes {
  if (day <= 3) {
    return {
      painRange: 'Dor intensa ao evacuar (7-9/10)',
      bleedingExpected: true,
      bleedingLevel: 'Leve (sangue vivo)',
      bowelMovement: 'Primeira evacuação muito dolorosa',
      specificExpectations: [
        'Dor intensa durante e após evacuação (pode durar 2-4h)',
        'Espasmo esfincteriano importante',
        'Sangramento mínimo vivo ao evacuar',
        'Uso obrigatório de laxantes e pomadas',
      ],
    };
  } else if (day <= 7) {
    return {
      painRange: 'Dor moderada ao evacuar (4-6/10)',
      bleedingExpected: false,
      bleedingLevel: 'Mínimo ou ausente',
      bowelMovement: 'Evacuações com desconforto decrescente',
      specificExpectations: [
        'Melhora progressiva da dor',
        'Redução do espasmo anal',
        'Sangramento raro',
        'Fezes amolecidas com laxantes',
      ],
    };
  } else {
    return {
      painRange: 'Dor leve (2-4/10)',
      bleedingExpected: false,
      bleedingLevel: 'Ausente',
      bowelMovement: 'Confortável',
      specificExpectations: [
        'Evacuações sem dor significativa',
        'Espasmo resolvido',
        'Cicatrização da fissura',
        'Possível manter laxantes por mais tempo',
      ],
    };
  }
}

/**
 * Define expectativas clínicas para Cisto Pilonidal
 */
function getPilonidalExpectations(day: number): ExpectedOutcomes {
  if (day <= 3) {
    return {
      painRange: 'Dor moderada (4-7/10)',
      bleedingExpected: true,
      bleedingLevel: 'Leve',
      bowelMovement: 'Normal (não afeta diretamente)',
      specificExpectations: [
        'Dor ao sentar e deitar de costas',
        'Edema local esperado',
        'Drenagem serossanguinolenta se ferida aberta',
        'Dificuldade para sentar confortavelmente',
      ],
    };
  } else if (day <= 7) {
    return {
      painRange: 'Dor leve a moderada (2-5/10)',
      bleedingExpected: false,
      bleedingLevel: 'Ausente',
      bowelMovement: 'Normal',
      specificExpectations: [
        'Melhora progressiva da dor',
        'Redução do edema',
        'Drenagem diminuindo (se ferida aberta)',
        'Maior conforto para sentar',
      ],
    };
  } else {
    return {
      painRange: 'Dor leve (1-3/10)',
      bleedingExpected: false,
      bleedingLevel: 'Ausente',
      bowelMovement: 'Normal',
      specificExpectations: [
        'Cicatrização em andamento',
        'Conforto para sentar',
        'Sem sinais de infecção',
        'Retorno gradual às atividades',
      ],
    };
  }
}

/**
 * Retorna expectativas baseadas no tipo de cirurgia e dia
 */
function getExpectations(surgeryType: SurgeryType, day: number): ExpectedOutcomes {
  switch (surgeryType) {
    case SURGERY_TYPES.HEMORROIDECTOMIA:
      return getHemorroidectomiaExpectations(day);
    case SURGERY_TYPES.FISTULOTOMIA:
      return getFistulaExpectations(day);
    case SURGERY_TYPES.FISSURECTOMIA:
      return getFissuraExpectations(day);
    case SURGERY_TYPES.CISTO_PILONIDAL:
      return getPilonidalExpectations(day);
    default:
      return getHemorroidectomiaExpectations(day);
  }
}

// ============================================
// RED FLAGS POR CIRURGIA
// ============================================

const RED_FLAGS_HEMORROIDECTOMIA = [
  'Dor 9-10/10 persistente após D+3',
  'Sangramento intenso (encharcando absorvente)',
  'Febre > 38°C',
  'Retenção urinária > 6 horas',
  'Prolapso hemorroidário recorrente',
  'Incontinência fecal sólida',
  'Sinais de trombose hemorroidária externa',
  'Ausência de evacuação após D+3',
];

const RED_FLAGS_FISTULA = [
  'Febre persistente ou > 38°C',
  'Drenagem purulenta abundante com odor fétido',
  'Incontinência fecal total',
  'Dor intensa crescente após D+5',
  'Edema e hiperemia crescentes (celulite)',
  'Sinais de abscesso recidivante',
  'Abertura de novo trajeto fistuloso',
];

const RED_FLAGS_FISSURA = [
  'Dor 9-10/10 ao evacuar após D+7',
  'Sangramento intenso persistente',
  'Constipação severa (>3 dias sem evacuar)',
  'Espasmo anal severo persistente',
  'Sinais de infecção da ferida',
  'Incontinência fecal nova',
  'Retenção urinária',
];

const RED_FLAGS_PILONIDAL = [
  'Febre + drenagem purulenta',
  'Odor fétido na ferida',
  'Edema crescente com hiperemia severa',
  'Deiscência completa de sutura',
  'Sinais de celulite (vermelhidão se espalhando)',
  'Dor intensa crescente após D+5',
  'Abscesso recidivante',
  'Flutuação à palpação (coleção)',
];

function getRedFlagsList(surgeryType: SurgeryType): string[] {
  switch (surgeryType) {
    case SURGERY_TYPES.HEMORROIDECTOMIA:
      return RED_FLAGS_HEMORROIDECTOMIA;
    case SURGERY_TYPES.FISTULOTOMIA:
      return RED_FLAGS_FISTULA;
    case SURGERY_TYPES.FISSURECTOMIA:
      return RED_FLAGS_FISSURA;
    case SURGERY_TYPES.CISTO_PILONIDAL:
      return RED_FLAGS_PILONIDAL;
    default:
      return [];
  }
}

// ============================================
// GERADOR DE PROMPT PRINCIPAL
// ============================================

/**
 * Gera prompt completo para análise Claude AI
 */
export function getAnalysisPrompt(params: AnalysisPromptParams): string {
  const { surgeryType, dayNumber, answers, patientName, patientAge, hasComorbidities } = params;

  const expectations = getExpectations(surgeryType, dayNumber);
  const redFlagsList = getRedFlagsList(surgeryType);
  const surgeryLabel = getSurgeryLabel(surgeryType);

  const prompt = `Você é um assistente médico especializado em pós-operatório de cirurgias coloproctológicas.

# CONTEXTO DO PACIENTE
- Nome: ${patientName}
${patientAge ? `- Idade: ${patientAge} anos` : ''}
${hasComorbidities ? '- Possui comorbididades registradas' : ''}

# CONTEXTO CIRÚRGICO
- Cirurgia: ${surgeryLabel}
- Pós-operatório: Dia ${dayNumber} (D+${dayNumber})

# EXPECTATIVAS CLÍNICAS PARA D+${dayNumber}

**Dor esperada:** ${expectations.painRange}
**Sangramento:** ${expectations.bleedingExpected ? `Esperado - ${expectations.bleedingLevel}` : 'Não esperado'}
**Evacuação:** ${expectations.bowelMovement}

**Pontos importantes:**
${expectations.specificExpectations.map(exp => `- ${exp}`).join('\n')}

# RED FLAGS ESPECÍFICOS PARA ${surgeryLabel.toUpperCase()}

**Atenção para:**
${redFlagsList.map(flag => `- ${flag}`).join('\n')}

# RESPOSTAS DO PACIENTE

\`\`\`json
${JSON.stringify(answers, null, 2)}
\`\`\`

# SUA TAREFA

Analise as respostas do paciente e forneça:

1. **Avaliação geral:** O quadro está dentro do esperado para D+${dayNumber}?
2. **Red flags:** Identifique TODOS os red flags presentes (se houver)
3. **Nível de risco:** Classifique como:
   - **NORMAL**: Evolução esperada, sem preocupações
   - **ATENÇÃO**: Algo fora do padrão, mas não urgente (monitorar)
   - **URGENTE**: Red flags importantes, contato médico necessário
   - **EMERGÊNCIA**: Situação grave, avaliação imediata necessária

4. **Análise detalhada:** Explique o raciocínio clínico
5. **Recomendações:** Orientações práticas para o paciente
6. **Resposta empática:** Mensagem de 2-3 parágrafos para enviar ao paciente via WhatsApp

# FORMATO DE RESPOSTA

Retorne APENAS um JSON válido no seguinte formato (sem markdown):

{
  "status": "NORMAL" | "ATENÇÃO" | "URGENTE" | "EMERGÊNCIA",
  "riskLevel": "low" | "medium" | "high" | "critical",
  "redFlags": ["array de red flags detectados - use descrições claras"],
  "analise": "Análise clínica detalhada do quadro atual",
  "raciocinioClinico": "Explicação do raciocínio médico",
  "recomendacoes": [
    "array de recomendações práticas",
    "uma recomendação por item"
  ],
  "respostaEmpática": "Mensagem em 2-3 parágrafos para o paciente, com tom acolhedor e profissional, explicando a situação e próximos passos",
  "alertarMedico": true | false,
  "urgencia": "baixa" | "média" | "alta" | "crítica"
}

# DIRETRIZES IMPORTANTES

1. **Seja conservador:** Em caso de dúvida, sempre classifique como nível de atenção maior
2. **Red flags são prioridade:** Um único red flag importante justifica status URGENTE
3. **Contextualize a dor:** Dor 8/10 em D+1 é diferente de dor 8/10 em D+10
4. **Febre é sempre alerta:** Febre ≥ 38°C exige atenção médica
5. **Sangramento intenso é urgência:** Sangramento que encharque absorvente é emergência
6. **Retenção urinária > 6h é urgência:** Requer intervenção rápida
7. **Sinais de infecção:** Febre + secreção purulenta + odor = URGENTE
8. **Incontinência fecal total:** Sempre classificar como URGENTE
9. **Deterioração clínica:** Se quadro está PIORANDO, aumentar nível de alerta
10. **Resposta empática:** Seja acolhedor, claro e tranquilizador (quando apropriado)

# EXEMPLOS DE CLASSIFICAÇÃO

**NORMAL:**
- D+2, dor 7/10, sangramento leve, evacuou com dor, sem febre
- D+7, dor 4/10, sem sangramento, evacuando normalmente

**ATENÇÃO:**
- D+5, dor 8/10 (deveria estar melhor), sangramento moderado
- D+3, não evacuou ainda, mas sem outros sintomas graves

**URGENTE:**
- Qualquer dia: febre 38.5°C
- D+1: retenção urinária há 8 horas
- D+7: dor 9/10 (não deveria estar tão alta)
- Sangramento intenso em qualquer dia
- Sinais de infecção (febre + secreção purulenta)

**EMERGÊNCIA:**
- Sangramento ativo intenso + dor 10/10
- Febre alta + deterioração do estado geral
- Sinais de sepse ou choque
- Incontinência fecal total súbita

Analise cuidadosamente e retorne o JSON.`;

  return prompt;
}

/**
 * Retorna label da cirurgia
 */
function getSurgeryLabel(surgeryType: SurgeryType): string {
  const labels: Record<SurgeryType, string> = {
    [SURGERY_TYPES.HEMORROIDECTOMIA]: 'Hemorroidectomia',
    [SURGERY_TYPES.FISTULOTOMIA]: 'Fistulotomia/Fistulectomia',
    [SURGERY_TYPES.FISSURECTOMIA]: 'Fissurectomia',
    [SURGERY_TYPES.CISTO_PILONIDAL]: 'Cisto Pilonidal',
  };

  return labels[surgeryType] || surgeryType;
}

/**
 * Gera prompt simplificado para testes
 */
export function getSimpleAnalysisPrompt(
  surgeryType: SurgeryType,
  day: number,
  answers: Record<string, any>
): string {
  return `Analise este pós-operatório de ${getSurgeryLabel(surgeryType)} em D+${day}:

${JSON.stringify(answers, null, 2)}

Retorne JSON com: status, riskLevel, redFlags, analise, recomendacoes, respostaEmpática`;
}
