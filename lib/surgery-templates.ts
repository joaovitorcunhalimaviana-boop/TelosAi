/**
 * Surgery Templates - Sistema de Templates para Cirurgias Orificiais
 * Define perguntas específicas para cada tipo de cirurgia
 *
 * 4 Cirurgias Suportadas:
 * - Hemorroidectomia
 * - Fistulotomia/Fistulectomia
 * - Fissurectomia
 * - Cisto Pilonidal
 *
 * Follow-ups: D+1, D+2, D+3, D+5, D+7, D+10, D+14
 */

// ============================================
// TYPES
// ============================================

export const SURGERY_TYPES = {
  HEMORROIDECTOMIA: 'hemorroidectomia',
  FISTULOTOMIA: 'fistula',
  FISSURECTOMIA: 'fissura',
  CISTO_PILONIDAL: 'pilonidal'
} as const;

export type SurgeryType = typeof SURGERY_TYPES[keyof typeof SURGERY_TYPES];

export interface SurgeryQuestion {
  id: string;
  question: string;
  type: 'scale' | 'select' | 'boolean' | 'text';
  options?: string[];
  min?: number;
  max?: number;
  required: boolean;
  redFlagTrigger?: (answer: any) => boolean;
  appliesTo?: number[]; // Dias específicos (vazio = todos os dias)
}

// ============================================
// PERGUNTAS COMUNS (TODAS AS CIRURGIAS)
// ============================================

export const COMMON_QUESTIONS: SurgeryQuestion[] = [
  {
    id: 'dor',
    question: 'Como está sua dor hoje? (0 = sem dor, 10 = pior dor imaginável)',
    type: 'scale',
    min: 0,
    max: 10,
    required: true,
    redFlagTrigger: (answer) => answer >= 9,
  },
  {
    id: 'sangramento',
    question: 'Está tendo sangramento?',
    type: 'select',
    options: ['Não', 'Leve', 'Moderado', 'Intenso'],
    required: true,
    redFlagTrigger: (answer) => answer === 'Intenso',
  },
  {
    id: 'evacuacao',
    question: 'Conseguiu evacuar?',
    type: 'select',
    options: ['Sim', 'Não', 'Com dificuldade'],
    required: true,
    redFlagTrigger: (answer) => answer === 'Não',
  },
  {
    id: 'febre',
    question: 'Está com febre?',
    type: 'boolean',
    required: true,
    redFlagTrigger: (answer) => answer === true,
  },
  {
    id: 'temperatura',
    question: 'Se sim, qual a temperatura em graus Celsius?',
    type: 'text',
    required: false,
    redFlagTrigger: (answer) => {
      const temp = parseFloat(answer);
      return !isNaN(temp) && temp >= 38;
    },
  },
  {
    id: 'medicacoes',
    question: 'Está tomando as medicações corretamente?',
    type: 'select',
    options: ['Sim, todas', 'Parcialmente', 'Não'],
    required: true,
    redFlagTrigger: (answer) => answer === 'Não',
  },
  {
    id: 'observacoes',
    question: 'Observações adicionais ou algo que te preocupa?',
    type: 'text',
    required: false,
  },
];

// ============================================
// PERGUNTAS ESPECÍFICAS - HEMORROIDECTOMIA
// ============================================

export const HEMORROIDECTOMIA_QUESTIONS: SurgeryQuestion[] = [
  {
    id: 'prolapso',
    question: 'Está sentindo prolapso hemorroidário (hemorroidas saindo)?',
    type: 'boolean',
    required: true,
    redFlagTrigger: (answer) => answer === true,
  },
  {
    id: 'retencao_urinaria',
    question: 'Conseguiu urinar normalmente?',
    type: 'boolean',
    required: true,
    appliesTo: [1, 2, 3], // Apenas nos primeiros 3 dias
    redFlagTrigger: (answer) => answer === false,
  },
  {
    id: 'horas_sem_urinar',
    question: 'Se não conseguiu urinar, há quantas horas está sem urinar?',
    type: 'text',
    required: false,
    appliesTo: [1, 2, 3],
    redFlagTrigger: (answer) => {
      const hours = parseInt(answer);
      return !isNaN(hours) && hours >= 6;
    },
  },
  {
    id: 'incontinencia_fecal',
    question: 'Está tendo incontinência fecal (perdendo fezes involuntariamente)?',
    type: 'select',
    options: ['Não', 'Sim - apenas gases', 'Sim - fezes líquidas', 'Sim - fezes sólidas'],
    required: true,
    redFlagTrigger: (answer) => answer === 'Sim - fezes sólidas',
  },
  {
    id: 'dor_evacuacao',
    question: 'Como é a dor durante a evacuação? (0-10)',
    type: 'scale',
    min: 0,
    max: 10,
    required: false,
  },
];

// ============================================
// PERGUNTAS ESPECÍFICAS - FISTULOTOMIA
// ============================================

export const FISTULOTOMIA_QUESTIONS: SurgeryQuestion[] = [
  {
    id: 'drenagem_secrecao',
    question: 'Está tendo drenagem de secreção pela ferida?',
    type: 'select',
    options: ['Não', 'Leve', 'Moderada', 'Intensa'],
    required: true,
    redFlagTrigger: (answer) => answer === 'Intensa',
  },
  {
    id: 'odor_fetido',
    question: 'A secreção tem odor fétido (cheiro forte/ruim)?',
    type: 'boolean',
    required: true,
    redFlagTrigger: (answer) => answer === true,
  },
  {
    id: 'incontinencia_fecal',
    question: 'Está tendo incontinência fecal?',
    type: 'select',
    options: ['Não', 'Parcial - apenas gases', 'Parcial - fezes líquidas', 'Total'],
    required: true,
    redFlagTrigger: (answer) => answer === 'Total',
  },
  {
    id: 'ferida_fechando',
    question: 'A ferida está fechando/cicatrizando?',
    type: 'select',
    options: ['Sim, cicatrizando bem', 'Não sei avaliar', 'Não, parece aberta', 'Está piorando'],
    required: true,
    appliesTo: [7, 10, 14], // Avaliar a partir do D+7
    redFlagTrigger: (answer) => answer === 'Está piorando',
  },
  {
    id: 'tipo_secrecao',
    question: 'Qual o tipo de secreção que está saindo?',
    type: 'select',
    options: ['Clara/serosa', 'Amarelada', 'Purulenta (pus)', 'Sanguinolenta'],
    required: false,
    redFlagTrigger: (answer) => answer === 'Purulenta (pus)',
  },
];

// ============================================
// PERGUNTAS ESPECÍFICAS - FISSURECTOMIA
// ============================================

export const FISSURECTOMIA_QUESTIONS: SurgeryQuestion[] = [
  {
    id: 'dor_evacuacao',
    question: 'Qual a dor ao evacuar? (0 = sem dor, 10 = pior dor imaginável)',
    type: 'scale',
    min: 0,
    max: 10,
    required: true,
    redFlagTrigger: (answer) => answer >= 9,
  },
  {
    id: 'sangramento_evacuacao',
    question: 'Está tendo sangramento vivo (vermelho) ao evacuar?',
    type: 'boolean',
    required: true,
    redFlagTrigger: (answer) => answer === true,
  },
  {
    id: 'espasmo_anal',
    question: 'Está sentindo espasmo anal (músculo do ânus travado/contraído)?',
    type: 'select',
    options: ['Não', 'Leve', 'Moderado', 'Severo'],
    required: true,
    redFlagTrigger: (answer) => answer === 'Severo',
  },
  {
    id: 'constipacao',
    question: 'Está com constipação intestinal (dificuldade para evacuar)?',
    type: 'select',
    options: ['Não', 'Leve', 'Moderada', 'Severa - não evacuou há 3+ dias'],
    required: true,
    redFlagTrigger: (answer) => answer === 'Severa - não evacuou há 3+ dias',
  },
  {
    id: 'duracao_dor',
    question: 'Por quanto tempo a dor persiste após evacuar?',
    type: 'select',
    options: ['Sem dor', 'Menos de 1 hora', '1-2 horas', 'Mais de 2 horas', 'Dor constante'],
    required: false,
    redFlagTrigger: (answer) => answer === 'Dor constante',
  },
];

// ============================================
// PERGUNTAS ESPECÍFICAS - CISTO PILONIDAL
// ============================================

export const CISTO_PILONIDAL_QUESTIONS: SurgeryQuestion[] = [
  {
    id: 'drenagem_secrecao',
    question: 'Está tendo drenagem de secreção pela ferida?',
    type: 'select',
    options: ['Não', 'Leve', 'Moderada', 'Intensa'],
    required: true,
    redFlagTrigger: (answer) => answer === 'Intensa',
  },
  {
    id: 'edema',
    question: 'Como está o inchaço (edema) no local da cirurgia?',
    type: 'select',
    options: ['Nenhum', 'Leve', 'Moderado', 'Severo'],
    required: true,
    redFlagTrigger: (answer) => answer === 'Severo',
  },
  {
    id: 'hiperemia',
    question: 'Como está a vermelhidão (hiperemia) no local?',
    type: 'select',
    options: ['Nenhuma', 'Leve', 'Moderada', 'Severa'],
    required: true,
    redFlagTrigger: (answer) => answer === 'Severa',
  },
  {
    id: 'odor_fetido',
    question: 'A ferida tem odor fétido (cheiro forte/ruim)?',
    type: 'boolean',
    required: true,
    redFlagTrigger: (answer) => answer === true,
  },
  {
    id: 'deiscencia_sutura',
    question: 'Os pontos abriram (deiscência de sutura)?',
    type: 'select',
    options: ['Não, pontos intactos', 'Não sei avaliar', 'Sim, parcialmente', 'Sim, totalmente'],
    required: true,
    redFlagTrigger: (answer) => answer === 'Sim, totalmente',
  },
  {
    id: 'calor_local',
    question: 'A região está quente ao toque?',
    type: 'boolean',
    required: true,
    redFlagTrigger: (answer) => answer === true,
  },
  {
    id: 'posicao_conforto',
    question: 'Consegue sentar confortavelmente?',
    type: 'select',
    options: ['Sim, sem problema', 'Com leve desconforto', 'Com dor moderada', 'Não consigo sentar'],
    required: false,
  },
];

// ============================================
// MAPEAMENTO DE PERGUNTAS POR CIRURGIA
// ============================================

export const SURGERY_QUESTIONS: Record<SurgeryType, SurgeryQuestion[]> = {
  [SURGERY_TYPES.HEMORROIDECTOMIA]: HEMORROIDECTOMIA_QUESTIONS,
  [SURGERY_TYPES.FISTULOTOMIA]: FISTULOTOMIA_QUESTIONS,
  [SURGERY_TYPES.FISSURECTOMIA]: FISSURECTOMIA_QUESTIONS,
  [SURGERY_TYPES.CISTO_PILONIDAL]: CISTO_PILONIDAL_QUESTIONS,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Retorna todas as perguntas para um tipo de cirurgia e dia específico
 * Combina perguntas comuns + perguntas específicas
 */
export function getQuestionsForSurgery(
  surgeryType: SurgeryType,
  dayNumber: number
): SurgeryQuestion[] {
  const specificQuestions = SURGERY_QUESTIONS[surgeryType] || [];

  // Filtrar perguntas que aplicam ao dia específico
  const filteredCommon = COMMON_QUESTIONS.filter(
    q => !q.appliesTo || q.appliesTo.includes(dayNumber)
  );

  const filteredSpecific = specificQuestions.filter(
    q => !q.appliesTo || q.appliesTo.includes(dayNumber)
  );

  // Retornar perguntas comuns primeiro, depois específicas
  return [...filteredCommon, ...filteredSpecific];
}

/**
 * Formata perguntas para envio via WhatsApp
 */
export function formatQuestionsForWhatsApp(
  surgeryType: SurgeryType,
  dayNumber: number,
  patientName: string
): string {
  const questions = getQuestionsForSurgery(surgeryType, dayNumber);
  const firstName = patientName.split(' ')[0];

  const greeting = getGreeting();
  const surgeryLabel = getSurgeryLabel(surgeryType);

  let message = `${greeting} ${firstName}!\n\n`;
  message += `📋 *Questionário D+${dayNumber}* - ${surgeryLabel}\n\n`;
  message += `Por favor, responda as seguintes perguntas:\n\n`;

  questions.forEach((q, index) => {
    message += `*${index + 1}. ${q.question}*\n`;

    if (q.type === 'scale') {
      message += `   (Escala de ${q.min} a ${q.max})\n`;
    } else if (q.type === 'select' && q.options) {
      q.options.forEach((option, i) => {
        message += `   ${String.fromCharCode(97 + i)}) ${option}\n`;
      });
    } else if (q.type === 'boolean') {
      message += `   a) Sim\n   b) Não\n`;
    }

    message += '\n';
  });

  message += 'Pode responder cada pergunta separadamente.\n';
  message += 'Estou aqui para ajudar! 💚';

  return message;
}

/**
 * Detecta red flags nas respostas
 */
export function detectRedFlags(
  surgeryType: SurgeryType,
  dayNumber: number,
  answers: Record<string, any>
): string[] {
  const questions = getQuestionsForSurgery(surgeryType, dayNumber);
  const redFlags: string[] = [];

  questions.forEach(question => {
    const answer = answers[question.id];

    if (answer !== undefined && question.redFlagTrigger) {
      if (question.redFlagTrigger(answer)) {
        redFlags.push(question.id);
      }
    }
  });

  return redFlags;
}

/**
 * Retorna label legível do tipo de cirurgia
 */
export function getSurgeryLabel(surgeryType: SurgeryType): string {
  const labels: Record<SurgeryType, string> = {
    [SURGERY_TYPES.HEMORROIDECTOMIA]: 'Hemorroidectomia',
    [SURGERY_TYPES.FISTULOTOMIA]: 'Fistulotomia/Fistulectomia',
    [SURGERY_TYPES.FISSURECTOMIA]: 'Fissurectomia',
    [SURGERY_TYPES.CISTO_PILONIDAL]: 'Cisto Pilonidal',
  };

  return labels[surgeryType] || surgeryType;
}

/**
 * Retorna saudação baseada no horário
 */
function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'Bom dia';
  } else if (hour >= 12 && hour < 18) {
    return 'Boa tarde';
  } else {
    return 'Boa noite';
  }
}

/**
 * Valida se um tipo de cirurgia é suportado
 */
export function isSupportedSurgeryType(type: string): type is SurgeryType {
  return Object.values(SURGERY_TYPES).includes(type as SurgeryType);
}
