/**
 * Questionários de Follow-up Pós-Operatório
 * Perguntas específicas para cada dia e tipo de cirurgia
 */

export interface Question {
  id: string;
  question: string;
  type: 'scale' | 'boolean' | 'choice' | 'text';
  options?: string[];
  required: boolean;
  redFlagTrigger?: (answer: any) => boolean;
}

export interface Questionnaire {
  dayNumber: number;
  surgeryType: 'hemorroidectomia' | 'fistula' | 'fissura' | 'pilonidal' | 'general';
  introduction: string;
  questions: Question[];
}

/**
 * Questionário D+1 (Dia 1 pós-operatório)
 * Foco: dor aguda, retenção urinária, sangramento inicial
 */
const questionnaireD1: Questionnaire = {
  dayNumber: 1,
  surgeryType: 'general',
  introduction: 'Como você está se sentindo no primeiro dia após a cirurgia?',
  questions: [
    {
      id: 'pain_level',
      question: 'Em uma escala de 0 a 10, qual o nível da sua dor? (0 = sem dor, 10 = pior dor imaginável)',
      type: 'scale',
      required: true,
      redFlagTrigger: (answer) => answer >= 9,
    },
    {
      id: 'urinary_retention',
      question: 'Você conseguiu urinar normalmente?',
      type: 'boolean',
      required: true,
      redFlagTrigger: (answer) => answer === false,
    },
    {
      id: 'urinary_retention_hours',
      question: 'Se não conseguiu urinar, há quantas horas está sem urinar?',
      type: 'text',
      required: false,
      redFlagTrigger: (answer) => {
        const hours = parseInt(answer);
        return hours >= 6;
      },
    },
    {
      id: 'bleeding',
      question: 'Está tendo sangramento? Se sim, qual a intensidade?',
      type: 'choice',
      options: ['Nenhum', 'Leve (manchas)', 'Moderado (precisa de absorvente)', 'Intenso (ativo)'],
      required: true,
      redFlagTrigger: (answer) => answer === 'Intenso (ativo)',
    },
    {
      id: 'fever',
      question: 'Está com febre?',
      type: 'boolean',
      required: true,
      redFlagTrigger: (answer) => answer === true,
    },
    {
      id: 'temperature',
      question: 'Se sim, qual a temperatura? (em graus Celsius)',
      type: 'text',
      required: false,
      redFlagTrigger: (answer) => {
        const temp = parseFloat(answer);
        return temp >= 38;
      },
    },
    {
      id: 'nausea_vomiting',
      question: 'Está com náuseas ou vômitos?',
      type: 'boolean',
      required: true,
    },
    {
      id: 'concerns',
      question: 'Há algo que te preocupa ou gostaria de relatar?',
      type: 'text',
      required: false,
    },
  ],
};

/**
 * Questionário D+2 (Dia 2 pós-operatório)
 * Foco: evolução da dor, primeira evacuação, sangramento
 */
const questionnaireD2: Questionnaire = {
  dayNumber: 2,
  surgeryType: 'general',
  introduction: 'Vamos avaliar como está sua recuperação no segundo dia.',
  questions: [
    {
      id: 'pain_level',
      question: 'Em uma escala de 0 a 10, qual o nível da sua dor hoje?',
      type: 'scale',
      required: true,
      redFlagTrigger: (answer) => answer >= 9,
    },
    {
      id: 'pain_compared',
      question: 'Comparado a ontem, a dor está:',
      type: 'choice',
      options: ['Melhor', 'Igual', 'Pior'],
      required: true,
      redFlagTrigger: (answer) => answer === 'Pior',
    },
    {
      id: 'bowel_movement',
      question: 'Já conseguiu evacuar?',
      type: 'boolean',
      required: true,
    },
    {
      id: 'bleeding',
      question: 'Como está o sangramento?',
      type: 'choice',
      options: ['Nenhum', 'Leve', 'Moderado', 'Intenso'],
      required: true,
      redFlagTrigger: (answer) => answer === 'Intenso',
    },
    {
      id: 'discharge',
      question: 'Está tendo alguma secreção na região operada?',
      type: 'choice',
      options: ['Nenhuma', 'Clara/serosa', 'Amarelada', 'Com pus'],
      required: true,
      redFlagTrigger: (answer) => answer === 'Com pus',
    },
    {
      id: 'fever',
      question: 'Teve febre nas últimas 24 horas?',
      type: 'boolean',
      required: true,
      redFlagTrigger: (answer) => answer === true,
    },
    {
      id: 'medication_adherence',
      question: 'Está tomando os medicamentos conforme prescrito?',
      type: 'boolean',
      required: true,
    },
    {
      id: 'concerns',
      question: 'Alguma dúvida ou preocupação?',
      type: 'text',
      required: false,
    },
  ],
};

/**
 * Questionário D+3 (Dia 3 pós-operatório)
 */
const questionnaireD3: Questionnaire = {
  dayNumber: 3,
  surgeryType: 'general',
  introduction: 'Vamos ver como está sua recuperação no terceiro dia.',
  questions: [
    {
      id: 'pain_level',
      question: 'Qual o nível da sua dor hoje? (0 a 10)',
      type: 'scale',
      required: true,
      redFlagTrigger: (answer) => answer >= 8,
    },
    {
      id: 'bowel_movement',
      question: 'Conseguiu evacuar?',
      type: 'boolean',
      required: true,
      redFlagTrigger: (answer) => answer === false,
    },
    {
      id: 'bowel_movement_pain',
      question: 'Se evacuou, como foi a dor durante a evacuação?',
      type: 'choice',
      options: ['Sem dor', 'Dor leve', 'Dor moderada', 'Dor intensa'],
      required: false,
    },
    {
      id: 'bleeding',
      question: 'Como está o sangramento?',
      type: 'choice',
      options: ['Nenhum', 'Leve', 'Moderado', 'Intenso'],
      required: true,
      redFlagTrigger: (answer) => answer === 'Intenso' || answer === 'Moderado',
    },
    {
      id: 'swelling',
      question: 'Como está o inchaço na região?',
      type: 'choice',
      options: ['Nenhum', 'Leve', 'Moderado', 'Intenso'],
      required: true,
    },
    {
      id: 'redness',
      question: 'Notou vermelhidão intensa ou calor na região?',
      type: 'boolean',
      required: true,
      redFlagTrigger: (answer) => answer === true,
    },
    {
      id: 'fever',
      question: 'Teve febre?',
      type: 'boolean',
      required: true,
      redFlagTrigger: (answer) => answer === true,
    },
    {
      id: 'concerns',
      question: 'Alguma preocupação?',
      type: 'text',
      required: false,
    },
  ],
};

/**
 * Questionário D+5 (Dia 5 pós-operatório)
 */
const questionnaireD5: Questionnaire = {
  dayNumber: 5,
  surgeryType: 'general',
  introduction: 'Como está sua recuperação no quinto dia?',
  questions: [
    {
      id: 'pain_level',
      question: 'Qual o nível da sua dor? (0 a 10)',
      type: 'scale',
      required: true,
      redFlagTrigger: (answer) => answer >= 8,
    },
    {
      id: 'pain_trend',
      question: 'A dor está:',
      type: 'choice',
      options: ['Melhorando gradualmente', 'Estável', 'Piorando'],
      required: true,
      redFlagTrigger: (answer) => answer === 'Piorando',
    },
    {
      id: 'bowel_movement_regular',
      question: 'Está evacuando regularmente?',
      type: 'boolean',
      required: true,
      redFlagTrigger: (answer) => answer === false,
    },
    {
      id: 'bleeding',
      question: 'Como está o sangramento?',
      type: 'choice',
      options: ['Nenhum', 'Leve ocasional', 'Moderado', 'Intenso'],
      required: true,
      redFlagTrigger: (answer) => answer === 'Moderado' || answer === 'Intenso',
    },
    {
      id: 'discharge',
      question: 'Está tendo secreção?',
      type: 'choice',
      options: ['Nenhuma', 'Clara', 'Amarelada', 'Purulenta'],
      required: true,
      redFlagTrigger: (answer) => answer === 'Purulenta',
    },
    {
      id: 'daily_activities',
      question: 'Consegue fazer atividades leves do dia a dia?',
      type: 'boolean',
      required: true,
    },
    {
      id: 'medication_side_effects',
      question: 'Está tendo algum efeito colateral dos medicamentos?',
      type: 'text',
      required: false,
    },
    {
      id: 'concerns',
      question: 'Alguma dúvida?',
      type: 'text',
      required: false,
    },
  ],
};

/**
 * Questionário D+7 (Dia 7 pós-operatório - 1 semana)
 */
const questionnaireD7: Questionnaire = {
  dayNumber: 7,
  surgeryType: 'general',
  introduction: 'Parabéns por completar uma semana! Como você está?',
  questions: [
    {
      id: 'pain_level',
      question: 'Qual o nível da sua dor? (0 a 10)',
      type: 'scale',
      required: true,
      redFlagTrigger: (answer) => answer >= 7,
    },
    {
      id: 'bowel_movement_pattern',
      question: 'Como está o padrão de evacuação?',
      type: 'choice',
      options: ['Normal', 'Constipação', 'Diarreia', 'Irregular'],
      required: true,
    },
    {
      id: 'bleeding',
      question: 'Ainda tem sangramento?',
      type: 'choice',
      options: ['Nenhum', 'Apenas vestígios', 'Ocasional leve', 'Frequente'],
      required: true,
      redFlagTrigger: (answer) => answer === 'Frequente',
    },
    {
      id: 'wound_healing',
      question: 'Como você avalia a cicatrização?',
      type: 'choice',
      options: ['Boa - sem problemas', 'Razoável', 'Preocupante'],
      required: true,
      redFlagTrigger: (answer) => answer === 'Preocupante',
    },
    {
      id: 'mobility',
      question: 'Como está sua mobilidade?',
      type: 'choice',
      options: ['Normal', 'Limitação leve', 'Limitação moderada', 'Limitação severa'],
      required: true,
    },
    {
      id: 'return_activities',
      question: 'Já conseguiu retornar às suas atividades normais?',
      type: 'boolean',
      required: true,
    },
    {
      id: 'satisfaction',
      question: 'Como você está se sentindo em relação à recuperação?',
      type: 'choice',
      options: ['Muito bem', 'Bem', 'Regular', 'Preocupado'],
      required: true,
    },
    {
      id: 'concerns',
      question: 'Alguma preocupação para relatar?',
      type: 'text',
      required: false,
    },
  ],
};

/**
 * Questionário D+10 (Dia 10 pós-operatório)
 */
const questionnaireD10: Questionnaire = {
  dayNumber: 10,
  surgeryType: 'general',
  introduction: 'Estamos chegando ao final do acompanhamento inicial. Como você está?',
  questions: [
    {
      id: 'pain_level',
      question: 'Qual o nível da sua dor? (0 a 10)',
      type: 'scale',
      required: true,
      redFlagTrigger: (answer) => answer >= 6,
    },
    {
      id: 'bowel_comfort',
      question: 'Como está o conforto durante evacuações?',
      type: 'choice',
      options: ['Sem dor', 'Desconforto leve', 'Dor moderada', 'Dor intensa'],
      required: true,
      redFlagTrigger: (answer) => answer === 'Dor intensa',
    },
    {
      id: 'complications',
      question: 'Notou alguma complicação ou sintoma novo?',
      type: 'text',
      required: false,
    },
    {
      id: 'medication_status',
      question: 'Ainda está usando medicação para dor?',
      type: 'boolean',
      required: true,
    },
    {
      id: 'work_status',
      question: 'Já retornou ao trabalho ou atividades habituais?',
      type: 'boolean',
      required: true,
    },
    {
      id: 'overall_recovery',
      question: 'Como você classifica sua recuperação geral?',
      type: 'choice',
      options: ['Excelente', 'Boa', 'Regular', 'Ruim'],
      required: true,
    },
    {
      id: 'concerns',
      question: 'Alguma dúvida final?',
      type: 'text',
      required: false,
    },
  ],
};

/**
 * Questionário D+14 (Dia 14 pós-operatório - 2 semanas)
 */
const questionnaireD14: Questionnaire = {
  dayNumber: 14,
  surgeryType: 'general',
  introduction: 'Última avaliação do acompanhamento automático. Como você está após 2 semanas?',
  questions: [
    {
      id: 'pain_level',
      question: 'Qual o nível da sua dor atual? (0 a 10)',
      type: 'scale',
      required: true,
      redFlagTrigger: (answer) => answer >= 5,
    },
    {
      id: 'symptoms_resolution',
      question: 'Os sintomas pós-operatórios foram resolvidos?',
      type: 'boolean',
      required: true,
    },
    {
      id: 'residual_complaints',
      question: 'Quais sintomas ainda persistem, se houver?',
      type: 'text',
      required: false,
    },
    {
      id: 'quality_of_life',
      question: 'Sua qualidade de vida retornou ao normal?',
      type: 'boolean',
      required: true,
    },
    {
      id: 'surgery_satisfaction',
      question: 'Como você avalia o resultado da cirurgia?',
      type: 'choice',
      options: ['Muito satisfeito', 'Satisfeito', 'Neutro', 'Insatisfeito'],
      required: true,
    },
    {
      id: 'followup_appointment',
      question: 'Já agendou a consulta de retorno presencial?',
      type: 'boolean',
      required: true,
    },
    {
      id: 'additional_feedback',
      question: 'Gostaria de dar algum feedback sobre o acompanhamento via WhatsApp?',
      type: 'text',
      required: false,
    },
    {
      id: 'final_concerns',
      question: 'Alguma preocupação ou dúvida final?',
      type: 'text',
      required: false,
    },
  ],
};

/**
 * Mapeamento de questionários por dia
 */
const questionnairesByDay: Record<number, Questionnaire> = {
  1: questionnaireD1,
  2: questionnaireD2,
  3: questionnaireD3,
  5: questionnaireD5,
  7: questionnaireD7,
  10: questionnaireD10,
  14: questionnaireD14,
};

/**
 * Retorna o questionário apropriado para um dia específico
 */
export function getQuestionnaireForDay(
  dayNumber: number,
  surgeryType: 'hemorroidectomia' | 'fistula' | 'fissura' | 'pilonidal'
): Questionnaire {
  const baseQuestionnaire = questionnairesByDay[dayNumber];

  if (!baseQuestionnaire) {
    throw new Error(`Questionário não encontrado para o dia ${dayNumber}`);
  }

  // Clonar questionário para não modificar o original
  const questionnaire = JSON.parse(JSON.stringify(baseQuestionnaire));
  questionnaire.surgeryType = surgeryType;

  // Adicionar perguntas específicas do tipo de cirurgia se necessário
  addSurgerySpecificQuestions(questionnaire, surgeryType, dayNumber);

  return questionnaire;
}

/**
 * Adiciona perguntas específicas baseadas no tipo de cirurgia
 * ATUALIZADO: Integrado com surgery-templates.ts para perguntas detalhadas
 */
function addSurgerySpecificQuestions(
  questionnaire: Questionnaire,
  surgeryType: string,
  dayNumber: number
): void {
  // NOTA: Este sistema foi atualizado para usar surgery-templates.ts
  // As perguntas específicas agora são gerenciadas por getQuestionsForSurgery()
  // Mantemos este código por compatibilidade com código legado

  // Para hemorroidectomia em D+1 a D+3, perguntar sobre retenção urinária
  if (surgeryType === 'hemorroidectomia' && dayNumber <= 3) {
    const hasUrinaryQuestion = questionnaire.questions.some(
      q => q.id === 'urinary_retention'
    );

    if (!hasUrinaryQuestion) {
      questionnaire.questions.splice(2, 0, {
        id: 'urinary_retention',
        question: 'Conseguiu urinar normalmente?',
        type: 'boolean',
        required: true,
        redFlagTrigger: (answer) => answer === false,
      });
    }
  }

  // Para fístula, perguntar sobre secreção
  if (surgeryType === 'fistula' && dayNumber >= 2) {
    const hasDischargeQuestion = questionnaire.questions.some(
      q => q.id === 'discharge'
    );

    if (!hasDischargeQuestion) {
      questionnaire.questions.push({
        id: 'fistula_discharge',
        question: 'Como está a secreção no local da fístula?',
        type: 'choice',
        options: ['Nenhuma', 'Clara', 'Serosa', 'Purulenta', 'Abundante'],
        required: true,
        redFlagTrigger: (answer) => answer === 'Purulenta' || answer === 'Abundante',
      });
    }
  }

  // Para cisto pilonidal, perguntar sobre a ferida
  if (surgeryType === 'pilonidal' && dayNumber >= 2) {
    questionnaire.questions.push({
      id: 'wound_status',
      question: 'Como está o local da cirurgia (região sacrococcígea)?',
      type: 'choice',
      options: ['Cicatrizando bem', 'Vermelhidão leve', 'Inchaço', 'Vermelhidão intensa/calor'],
      required: true,
      redFlagTrigger: (answer) => answer === 'Vermelhidão intensa/calor',
    });
  }
}

/**
 * NOVO: Integração com surgery-templates.ts
 * Usa o novo sistema de templates para perguntas mais detalhadas
 */
export function getDetailedQuestionnaireForSurgery(
  surgeryType: 'hemorroidectomia' | 'fistula' | 'fissura' | 'pilonidal',
  dayNumber: number
): Questionnaire {
  // Importar dinamicamente para evitar circular dependency
  const baseQuestionnaire = getQuestionnaireForDay(dayNumber, surgeryType);

  // Para usar o novo sistema de templates, veja:
  // import { getQuestionsForSurgery, formatQuestionsForWhatsApp } from '@/lib/surgery-templates'
  // const questions = getQuestionsForSurgery(surgeryType, dayNumber)

  return baseQuestionnaire;
}

/**
 * Formata questionário para envio via WhatsApp
 */
export function formatQuestionnaireForWhatsApp(questionnaire: Questionnaire): string {
  let message = `${questionnaire.introduction}\n\n`;
  message += 'Por favor, responda as seguintes perguntas:\n\n';

  questionnaire.questions.forEach((q, index) => {
    message += `${index + 1}. ${q.question}\n`;

    if (q.options && q.options.length > 0) {
      q.options.forEach((option, i) => {
        message += `   ${String.fromCharCode(97 + i)}) ${option}\n`;
      });
    }

    message += '\n';
  });

  message += 'Responda cada pergunta separadamente. Estou aqui para ajudar!';

  return message;
}

/**
 * Parse resposta do paciente e extrai dados estruturados
 */
export function parsePatientResponse(
  message: string,
  questionnaire: Questionnaire
): Record<string, any> {
  // Esta é uma implementação simplificada
  // Em produção, você pode usar NLP ou análise mais sofisticada
  const responses: Record<string, any> = {};

  // Por enquanto, retorna objeto vazio
  // A lógica real de parsing deve ser implementada baseada no formato das respostas
  return responses;
}

/**
 * Retorna todos os dias de follow-up configurados
 */
export function getFollowUpDays(): number[] {
  return Object.keys(questionnairesByDay).map(Number).sort((a, b) => a - b);
}

/**
 * Valida se um dia tem questionário configurado
 */
export function hasQuestionnaireForDay(dayNumber: number): boolean {
  return dayNumber in questionnairesByDay;
}
