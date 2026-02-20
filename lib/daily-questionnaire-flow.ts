/**
 * Fluxo de Questionário Diário Personalizado
 *
 * Define perguntas específicas para cada dia pós-operatório (D+1, D+2, D+3, D+5, D+7, D+10, D+14)
 * Integra:
 * - Rastreamento de primeira evacuação
 * - Análise de tendências de dor
 * - Questionário de analgesia
 * - Perguntas contextuais baseadas no dia
 */

import { Surgery } from '@prisma/client';
import {
  checkBowelMovementStatus,
  getBowelMovementQuestions,
  BowelMovementStatus
} from './bowel-movement-tracker';
import { getAnalgesiaQuestions } from './analgesia-questionnaire';
import { getPainHistory, analyzePainTrend, comparePainWithPreviousDay } from './pain-trend-analyzer';

export interface DailyQuestionSet {
  dayNumber: number;
  questions: QuestionDefinition[];
  contextForAI: string;
  expectedDataFields: string[];
  sendPainScaleImage: boolean;
}

export interface QuestionDefinition {
  id: string;
  category:
    | 'pain'
    | 'bowel_movement'
    | 'bleeding'
    | 'urination'
    | 'fever'
    | 'discharge'
    | 'analgesia'
    | 'general';
  required: boolean;
  text: string;
  followUpLogic?: string;
  contextNote?: string;
}

/**
 * Retorna conjunto de perguntas para um dia específico
 */
export async function getDailyQuestions(
  surgeryId: string,
  dayNumber: number
): Promise<DailyQuestionSet> {
  const surgery = await getSurgery(surgeryId);
  const bowelStatus = await checkBowelMovementStatus(surgeryId, dayNumber);
  const painHistory = await getPainHistory(surgeryId);

  // Perguntas base (presentes em todos os dias)
  const baseQuestions: QuestionDefinition[] = [
    {
      id: 'pain_at_rest',
      category: 'pain',
      required: true,
      text: 'Como está sua dor AGORA, em repouso? Me diz um número de 0 a 10.',
      contextNote:
        'SEMPRE enviar imagem da escala visual analógica ANTES desta pergunta. NUNCA aceitar respostas vagas.'
    }
  ];

  // Perguntas sobre evacuação (variam se já evacuou ou não)
  const bowelQuestions = getBowelMovementQuestions(
    bowelStatus.hadFirstMovement,
    dayNumber
  );

  // Adicionar pergunta sobre evacuação
  baseQuestions.push({
    id: 'bowel_movement',
    category: 'bowel_movement',
    required: true,
    text: bowelQuestions.mainQuestion,
    followUpLogic: `
      Se SIM:
        ${bowelQuestions.followUpIfYes.join('\n        ')}
      Se NÃO:
        ${bowelQuestions.followUpIfNo.join('\n        ')}
    `,
    contextNote: bowelQuestions.contextForAI
  });

  // Perguntas específicas por dia
  const daySpecificQuestions = getDaySpecificQuestions(dayNumber, bowelStatus, painHistory.length > 0);

  // Perguntas comuns a todos os dias (após as específicas)
  const commonQuestions: QuestionDefinition[] = [
    {
      id: 'bleeding',
      category: 'bleeding',
      required: true,
      text: 'Você está tendo sangramento? Se sim, me conta como está:',
      followUpLogic: `
        Classificação:
        - Nenhum: sem sangramento
        - Leve: apenas no papel higiênico
        - Moderado: mancha a roupa íntima
        - Intenso: encheu o vaso sanitário

        ⚠️ Se INTENSO: orientar procurar pronto-socorro IMEDIATAMENTE
      `
    },
    {
      id: 'urination',
      category: 'urination',
      required: true,
      text: 'Você está conseguindo urinar normalmente?',
      followUpLogic: `
        Se NÃO: perguntar quais dificuldades (dor, ardência, retenção)
        ⚠️ Se retenção urinária: orientar procurar pronto-socorro
      `
    },
    {
      id: 'fever',
      category: 'fever',
      required: true,
      text: 'Você teve febre?',
      followUpLogic: `
        Se SIM: perguntar qual foi a temperatura em °C
        ⚠️ Se ≥38°C: alerta médico
      `
    }
  ];

  // Adicionar pergunta sobre secreção se D+3 ou posterior
  if (dayNumber >= 3) {
    commonQuestions.push({
      id: 'discharge',
      category: 'discharge',
      required: true,
      text: 'Você tem saída de secreção (líquido) pela ferida operatória?',
      followUpLogic: `
        Se SIM:
          - Qual a cor/aspecto? (clara, amarelada, purulenta/pus, sanguinolenta)
          - Qual a quantidade? (pouca, moderada, muita)

        ⚠️ Se purulenta (pus) ou quantidade abundante: alerta médico
      `,
      contextNote: 'Secreção purulenta a partir de D+3 pode indicar infecção'
    });
  }

  // Perguntas sobre analgesia (todos os dias)
  const analgesiaQuestions = getAnalgesiaQuestions();
  baseQuestions.push(
    {
      id: 'taking_meds',
      category: 'analgesia',
      required: true,
      text: 'Você está tomando as medicações conforme o médico prescreveu?',
      followUpLogic: `
        Se NÃO: investigar motivo (esqueceu, efeito colateral, não comprou)
        Reforçar importância da analgesia preventiva
      `
    },
    {
      id: 'pain_controlled',
      category: 'analgesia',
      required: true,
      text: 'Sua dor está controlada com as medicações?',
      followUpLogic: `
        Se NÃO: alerta médico para ajuste de prescrição
      `
    },
    {
      id: 'medication_side_effects',
      category: 'analgesia',
      required: false,
      text: 'Você está tendo algum efeito colateral das medicações? (náusea, tontura, sonolência, etc)',
      followUpLogic: `
        Se SIM: investigar quais efeitos
        Se múltiplos efeitos severos: alerta médico
      `
    }
  );

  // Pergunta final sobre preocupações (sempre opcional)
  const finalQuestions: QuestionDefinition[] = [
    {
      id: 'concerns',
      category: 'general',
      required: false,
      text: 'Tem alguma dúvida ou preocupação que gostaria de compartilhar comigo?',
      contextNote: 'Campo livre para o paciente expressar qualquer preocupação'
    }
  ];

  // Montar lista completa de perguntas
  const allQuestions = [
    ...baseQuestions,
    ...daySpecificQuestions,
    ...commonQuestions,
    ...finalQuestions
  ];

  // Contexto para a IA
  const contextForAI = buildContextForAI(dayNumber, bowelStatus, painHistory);

  // Campos esperados no questionário
  const expectedDataFields = allQuestions.filter(q => q.required).map(q => q.id);

  return {
    dayNumber,
    questions: allQuestions,
    contextForAI,
    expectedDataFields,
    sendPainScaleImage: true // SEMPRE enviar imagem da escala antes de perguntas de dor
  };
}

/**
 * Perguntas específicas de cada dia
 */
function getDaySpecificQuestions(
  dayNumber: number,
  bowelStatus: BowelMovementStatus,
  hasPainHistory: boolean
): QuestionDefinition[] {
  const questions: QuestionDefinition[] = [];

  // Aderência a cuidados locais (genérico - depende do protocolo do médico)
  questions.push({
    id: 'local_care_adherence',
    category: 'general',
    required: true,
    text: 'Está seguindo os cuidados locais orientados pelo médico? (como uso de pomadas, banhos de assento, compressas)',
    followUpLogic: `
      Se NÃO: investigar motivo e reforçar importância
      Consultar o PROTOCOLO MÉDICO para saber quais cuidados específicos orientar
    `
  });

  // D+1: Apenas perguntas básicas (aderência já adicionada acima)
  if (dayNumber === 1) {
    // Nenhuma pergunta específica adicional além da aderência
  }

  // Comparação de dor REMOVIDA - sistema calcula automaticamente pela nota de dor

  // D+7, D+10, D+14: Perguntar sobre retorno às atividades
  if (dayNumber >= 7) {
    questions.push({
      id: 'activity_level',
      category: 'general',
      required: false,
      text: 'Como está sua disposição para as atividades do dia a dia?',
      contextNote: 'Avaliar recuperação funcional do paciente'
    });
  }

  // D+14: Adicionar pesquisa de satisfação
  if (dayNumber === 14) {
    questions.push(
      {
        id: 'satisfaction_rating',
        category: 'general',
        required: true,
        text: 'Como última pergunta: de 0 a 10, qual nota você daria para o acompanhamento que recebeu durante sua recuperação?',
        contextNote: 'Pesquisa de satisfação NPS - nota de 0 a 10. 0=muito insatisfeito, 10=muito satisfeito.'
      },
      {
        id: 'would_recommend',
        category: 'general',
        required: true,
        text: 'Você recomendaria este tipo de acompanhamento pós-operatório para outros pacientes?',
        followUpLogic: 'Sim ou Não. Se quiser, o paciente pode elaborar.'
      },
      {
        id: 'positive_feedback',
        category: 'general',
        required: false,
        text: 'O que você mais gostou no acompanhamento? Tem algum elogio ou ponto positivo que gostaria de destacar?',
        contextNote: 'Coletar pontos positivos e elogios do paciente sobre o acompanhamento. Campo opcional.'
      },
      {
        id: 'improvement_suggestions',
        category: 'general',
        required: false,
        text: 'Você tem alguma crítica ou sugestão de como podemos melhorar o acompanhamento para futuros pacientes?',
        contextNote: 'Coletar críticas construtivas e sugestões de melhoria. Campo opcional mas muito valioso para aprimoramento do serviço.'
      }
    );
  }

  return questions;
}

/**
 * Constrói contexto detalhado para a IA
 */
function buildContextForAI(
  dayNumber: number,
  bowelStatus: BowelMovementStatus,
  painHistory: any[]
): string {
  let context = `
DIA PÓS-OPERATÓRIO: D+${dayNumber}

═══════════════════════════════════════════════════════════════
CONTEXTO CLÍNICO IMPORTANTE
═══════════════════════════════════════════════════════════════
`;

  // Contexto específico do dia
  if (dayNumber === 1) {
    context += `
📅 D+1 - PRIMEIRO DIA PÓS-OPERATÓRIO

Esperado:
- Bloqueio do nervo pudendo AINDA ATIVO (~48h de duração)
- Dor mínima em repouso (0-4/10)
- Paciente pode não ter evacuado ainda (NORMAL)
- Ainda em fase de adaptação pós-cirúrgica

⚠️ Red Flags D+1:
- Dor ≥8/10 (bloqueio pode ter falho)
- Sangramento intenso
- Retenção urinária
- Febre ≥38°C
`;
  } else if (dayNumber === 2) {
    context += `
📅 D+2 - TÉRMINO DO BLOQUEIO PUDENDO

⚠️ MUITO IMPORTANTE:
- Bloqueio anestésico está TERMINANDO (dura ~48h)
- É NORMAL e ESPERADO que a dor AUMENTE em relação a D+1
- Aumento de dor D+1→D+2 NÃO é motivo de alarme
- Espera-se dor entre 2-7/10

Esperado:
- Dor pode estar maior que ontem (isso é OK!)
- Paciente pode estar assustado com o aumento da dor
- Primeira evacuação pode ou não ter ocorrido

Abordagem:
- Se paciente relatar dor maior: TRANQUILIZAR
- Explicar que é esperado devido ao término do bloqueio
- Reforçar que deve melhorar nos próximos dias
- Verificar se está tomando analgésicos corretamente
`;
  } else if (dayNumber === 3) {
    context += `
📅 D+3 - PICO INFLAMATÓRIO

Esperado:
- Dor entre 2-6/10 (pico de resposta inflamatória)
- Deve começar a MELHORAR após este dia
- Paciente deve ter evacuado ou estar próximo (se não, investigar medo)
- Começar perguntas sobre secreção purulenta

⚠️ Red Flags D+3:
- Dor ≥8/10
- Não evacuou e está com medo de dor
- Febre (possível infecção)
`;
  } else if (dayNumber >= 4 && dayNumber <= 7) {
    context += `
📅 D+${dayNumber} - FASE DE MELHORA PROGRESSIVA

Esperado:
- Dor em TENDÊNCIA DE MELHORA (não necessariamente linear)
- Primeira evacuação JÁ DEVE ter ocorrido
- Paciente retomando funções básicas

⚠️ Red Flags D+${dayNumber}:
- Dor ≥7/10 ou piorando
- Ainda não evacuou (≥4 dias sem evacuar)
- Secreção purulenta abundante
- Febre persistente
`;
  } else if (dayNumber === 14) {
    context += `
📅 D+14 - ÚLTIMO DIA DE ACOMPANHAMENTO + PESQUISA DE SATISFAÇÃO

Esperado:
- Dor mínima (0-2/10) ou ausente
- Evacuações normalizadas
- Retorno às atividades normais

IMPORTANTE - PESQUISA DE SATISFAÇÃO:
Após coletar os dados clínicos habituais, fazer as perguntas de satisfação:

1. NOTA DE SATISFAÇÃO (0-10):
   "De 0 a 10, qual nota você daria para o acompanhamento que recebeu?"
   - Coletar número de 0 a 10
   - Não influenciar a resposta

2. RECOMENDARIA? (Sim/Não):
   "Você recomendaria este tipo de acompanhamento para outros pacientes?"

3. ELOGIOS/PONTOS POSITIVOS (Opcional):
   "O que você mais gostou no acompanhamento? Tem algum elogio ou ponto positivo?"
   - Deixar o paciente livre para expressar
   - Registrar feedback positivo

4. CRÍTICAS/SUGESTÕES DE MELHORIA (Opcional):
   "Você tem alguma crítica ou sugestão de como podemos melhorar?"
   - Incentivar feedback honesto
   - Registrar sugestões de melhoria para futuros pacientes

📝 FINALIZAÇÃO:
Após coletar a pesquisa de satisfação:
- Agradecer pelo feedback (positivo e construtivo)
- Desejar boa recuperação final
- Informar que pode entrar em contato se precisar de algo
`;
  } else if (dayNumber >= 8) {
    context += `
📅 D+${dayNumber} - RECUPERAÇÃO AVANÇADA

Esperado:
- Dor leve (0-4/10) ou ausente
- Evacuações regulares
- Retorno gradual às atividades

⚠️ Red Flags D+${dayNumber}:
- Dor persistente ≥5/10
- Sangramento novo ou intensificado
- Sinais de infecção tardia
`;
  }

  // Contexto sobre evacuação
  context += `

═══════════════════════════════════════════════════════════════
SITUAÇÃO DE EVACUAÇÃO
═══════════════════════════════════════════════════════════════

${
    bowelStatus.hadFirstMovement
      ? `✅ Primeira evacuação JÁ OCORREU em D+${bowelStatus.dayNumber}
   - Perguntas de rotina sobre evacuação
   - Se evacuou desde último contato: perguntar dor durante evacuação (0-10)`
      : `❌ Primeira evacuação AINDA NÃO OCORREU
   - Dias sem evacuar: ${bowelStatus.daysWithoutMovement}
   - Urgência: ${bowelStatus.urgencyLevel.toUpperCase()}
   - Orientação: ${bowelStatus.message}

   ${bowelStatus.urgencyLevel === 'urgent' ? '⚠️ IMPORTANTE: Avisar médico sobre constipação prolongada' : ''}
   ${bowelStatus.urgencyLevel === 'concern' ? '⚠️ Investigar: paciente está com medo de dor? Tomando laxantes?' : ''}`
  }

LEMBRAR: SEMPRE perguntar "evacuou desde a última vez que conversamos?"
          NUNCA perguntar "evacuou hoje?" ou "evacuou desde ontem?"

═══════════════════════════════════════════════════════════════
CUIDADOS LOCAIS
═══════════════════════════════════════════════════════════════

Perguntar se está seguindo os cuidados locais orientados pelo médico (pomadas, banhos de assento, compressas).
Consultar o PROTOCOLO MÉDICO OFICIAL para saber quais cuidados específicos o médico prescreveu.
`;

  // Contexto sobre dor (se houver histórico)
  if (painHistory.length > 0) {
    const lastPain = painHistory[painHistory.length - 1];
    context += `

═══════════════════════════════════════════════════════════════
HISTÓRICO DE DOR
═══════════════════════════════════════════════════════════════

Última dor registrada: ${lastPain.painAtRest}/10 em D+${lastPain.dayPostOp}

${
      dayNumber === 2
        ? `⚠️ Se dor aumentar em relação a D+1: tranquilizar paciente que é NORMAL`
        : dayNumber >= 3
        ? `⚠️ Espera-se melhora progressiva. Se piorar significativamente: alerta médico`
        : ''
    }
`;
  }

  // Instruções finais
  context += `

═══════════════════════════════════════════════════════════════
INSTRUÇÕES DE CONDUÇÃO
═══════════════════════════════════════════════════════════════

1. ENVIAR IMAGEM da escala visual analógica ANTES de perguntar sobre dor
2. UMA pergunta por vez, aguardar resposta
3. NUNCA sugerir ou direcionar respostas
4. Se resposta vaga: gentilmente insistir em dados específicos
5. Ser EMPÁTICA mas COLETAR DADOS ESTRUTURADOS
6. Red flags: alertar médico imediatamente

IMPORTANTE: Este é um questionário de PESQUISA científica.
           Os dados precisam ser precisos e comparáveis.
`;

  return context;
}

/**
 * Valida se todos os dados obrigatórios foram coletados
 */
export function isQuestionnaireComplete(
  collectedData: Record<string, any>,
  expectedFields: string[]
): boolean {
  for (const field of expectedFields) {
    if (collectedData[field] === undefined || collectedData[field] === null) {
      return false;
    }
  }
  return true;
}

/**
 * Helper para buscar cirurgia
 */
async function getSurgery(surgeryId: string): Promise<Surgery> {
  const { prisma } = await import('./prisma');
  const surgery = await prisma.surgery.findUnique({
    where: { id: surgeryId }
  });

  if (!surgery) {
    throw new Error('Surgery not found');
  }

  return surgery;
}

/**
 * Gera mensagem de introdução para o questionário do dia
 */
export function getIntroductionMessage(dayNumber: number): string {
  const greetings: Record<number, string> = {
    1: 'Como foi sua primeira noite após a cirurgia? Vamos ver como você está hoje.',
    2: 'Chegamos ao segundo dia! Como está se sentindo hoje?',
    3: 'Metade da primeira semana já passou. Como está indo sua recuperação?',
    5: 'Já fazem 5 dias da cirurgia. Vamos ver como está sua evolução.',
    7: 'Uma semana completa! Como você está se sentindo?',
    10: '10 dias de recuperação. Como está se sentindo?',
    14: 'Duas semanas! Hoje é nosso último dia de acompanhamento. Além das perguntas habituais, vou fazer uma breve pesquisa de satisfação. Como está?'
  };

  return (
    greetings[dayNumber] ||
    `Dia ${dayNumber} pós-operatório. Vamos conversar sobre como você está?`
  );
}
