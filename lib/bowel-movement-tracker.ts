/**
 * Rastreador de Primeira Evacuação Pós-Operatória
 *
 * Rastreia quando o paciente evacua pela primeira vez após a cirurgia.
 * Isso é crítico porque:
 * - Medo de dor pode fazer paciente evitar evacuar (constipação funcional)
 * - Primeira evacuação pode ocorrer em D+2, D+3, D+4, D+5
 * - Dados importantes para pesquisa comparativa de técnicas anestésicas
 */

import { prisma } from './prisma';
import { Surgery } from '@prisma/client';
import { toBrasiliaTime } from './date-utils';

export interface BowelMovementStatus {
  hadFirstMovement: boolean;
  dayNumber?: number;
  date?: Date;
  daysWithoutMovement: number;
  urgencyLevel: 'normal' | 'reminder' | 'concern' | 'urgent';
  message: string;
}

/**
 * Verifica status da primeira evacuação
 */
export async function checkBowelMovementStatus(
  surgeryId: string,
  currentDayPostOp: number
): Promise<BowelMovementStatus> {
  const surgery = await prisma.surgery.findUnique({
    where: { id: surgeryId }
  });

  if (!surgery) {
    throw new Error('Surgery not found');
  }

  // Se já evacuou, retornar dados
  if (surgery.hadFirstBowelMovement) {
    return {
      hadFirstMovement: true,
      dayNumber: surgery.firstBowelMovementDay || undefined,
      date: surgery.firstBowelMovementDate || undefined,
      daysWithoutMovement: 0,
      urgencyLevel: 'normal',
      message: `Primeira evacuação registrada em D+${surgery.firstBowelMovementDay}`
    };
  }

  // Se não evacuou, calcular urgência baseado nos dias
  const daysWithoutMovement = currentDayPostOp;

  let urgencyLevel: 'normal' | 'reminder' | 'concern' | 'urgent';
  let message: string;

  if (daysWithoutMovement <= 2) {
    // D+1 ou D+2: Normal não ter evacuado ainda
    urgencyLevel = 'normal';
    message = 'Normal ainda não ter evacuado. Continue tomando as medicações conforme prescrito.';
  } else if (daysWithoutMovement === 3) {
    // D+3: Lembrete gentil
    urgencyLevel = 'reminder';
    message = 'É importante evacuar. Continue hidratando bastante e tomando os laxantes prescritos.';
  } else if (daysWithoutMovement === 4) {
    // D+4: Preocupação leve
    urgencyLevel = 'concern';
    message = 'Está há 4 dias sem evacuar. É muito importante tomar os laxantes e se hidratar. Se tiver dificuldade, entre em contato com o Dr. João Vitor.';
  } else {
    // D+5+: Urgente
    urgencyLevel = 'urgent';
    message = `Você está há ${daysWithoutMovement} dias sem evacuar. Isso precisa ser avaliado pelo médico. Por favor, entre em contato com o Dr. João Vitor urgentemente.`;
  }

  return {
    hadFirstMovement: false,
    daysWithoutMovement,
    urgencyLevel,
    message
  };
}

/**
 * Registra a primeira evacuação
 */
export async function recordFirstBowelMovement(
  surgeryId: string,
  dayNumber: number,
  painDuringBowelMovement: number,
  stoolConsistency: number, // Bristol Scale 1-7
  timestamp: Date = new Date(),
  bowelMovementTime?: string // Hora aproximada da evacuação
): Promise<void> {
  await prisma.surgery.update({
    where: { id: surgeryId },
    data: {
      hadFirstBowelMovement: true,
      firstBowelMovementDate: timestamp,
      firstBowelMovementDay: dayNumber,
      firstBowelMovementTime: bowelMovementTime || null
    }
  });

  console.log('✅ First bowel movement recorded:', {
    surgeryId,
    dayNumber,
    timestamp,
    bowelMovementTime,
    painDuringBowelMovement,
    stoolConsistency
  });
}

/**
 * Retorna mensagem contextual sobre evacuação baseado no dia pós-op
 */
export function getBowelMovementContextMessage(
  hadFirstMovement: boolean,
  currentDay: number
): string {
  if (hadFirstMovement) {
    return '';
  }

  // Mensagens contextuais para IA saber como abordar
  if (currentDay === 1) {
    return 'Contexto: D+1 - Ainda sob efeito do bloqueio pudendo. Normal não ter evacuado.';
  } else if (currentDay === 2) {
    return 'Contexto: D+2 - Normal não ter evacuado ainda. Não pressionar o paciente.';
  } else if (currentDay === 3) {
    return 'Contexto: D+3 - Começar a encorajar evacuação. Perguntar se está tomando laxantes.';
  } else if (currentDay === 4) {
    return 'Contexto: D+4 - Importante evacuar logo. Reforçar hidratação e laxantes. Investigar se há medo de dor.';
  } else {
    return `Contexto: D+${currentDay} - URGENTE. Paciente deve ser avaliado pelo médico. Possível fecaloma.`;
  }
}

/**
 * Obtém perguntas específicas sobre evacuação baseado no status
 */
export function getBowelMovementQuestions(
  hadFirstMovement: boolean,
  currentDay: number
): {
  mainQuestion: string;
  followUpIfYes: string[];
  followUpIfNo: string[];
  contextForAI: string;
} {
  if (!hadFirstMovement) {
    // Primeira evacuação ainda não ocorreu
    return {
      mainQuestion: 'Você evacuou desde a última vez que conversamos?',
      followUpIfYes: [
        'Que ótimo! Qual foi a dor durante a evacuação? Me diz um número de 0 a 10.',
        'Como estava a consistência das fezes? Vou te mostrar as opções do 1 ao 7:\n1 - Pedaços duros separados (muito constipado)\n2 - Em forma de salsicha, mas com pedaços\n3 - Salsicha com rachaduras na superfície\n4 - Salsicha lisa e macia (IDEAL)\n5 - Pedaços macios com bordas definidas\n6 - Pedaços fofos com bordas irregulares\n7 - Aquosa, sem pedaços sólidos (diarreia)'
      ],
      followUpIfNo: [
        currentDay <= 2
          ? 'Tudo bem, é normal. Quando foi a última vez que você evacuou?'
          : currentDay === 3
          ? 'Quando foi a última vez que você evacuou? Você está tomando os laxantes que o médico receitou?'
          : currentDay === 4
          ? 'Quando foi a última vez que você evacuou? É importante evacuar logo. Você está com medo da dor ou alguma dificuldade?'
          : 'Quando foi a última vez que você evacuou? Isso é importante. Vou avisar o Dr. João Vitor.'
      ],
      contextForAI: getBowelMovementContextMessage(false, currentDay)
    };
  } else {
    // Já evacuou pela primeira vez, perguntas de rotina
    return {
      mainQuestion: 'Você evacuou desde a última vez que conversamos?',
      followUpIfYes: [
        'Qual foi a dor durante a evacuação? Me diz um número de 0 a 10.',
        'Como estava a consistência? (Use a mesma escala de 1 a 7 que te mostrei antes)'
      ],
      followUpIfNo: [
        'Quando foi a última evacuação?'
      ],
      contextForAI: 'Paciente já teve primeira evacuação. Perguntas de rotina.'
    };
  }
}

/**
 * Verifica se deve alertar o médico sobre constipação
 */
export function shouldAlertDoctorAboutConstipation(
  hadFirstMovement: boolean,
  currentDay: number,
  lastBowelMovement?: string
): boolean {
  // D+5+ sem evacuar
  if (!hadFirstMovement && currentDay >= 5) {
    return true;
  }

  // Se última evacuação foi há mais de 4 dias
  if (lastBowelMovement) {
    const lastBMDate = new Date(lastBowelMovement);
    // toBrasiliaTime importado no topo do arquivo
    const nowBrt = toBrasiliaTime(new Date());
    const bmBrt = toBrasiliaTime(lastBMDate);
    const nowDay = new Date(nowBrt.getFullYear(), nowBrt.getMonth(), nowBrt.getDate());
    const bmDay = new Date(bmBrt.getFullYear(), bmBrt.getMonth(), bmBrt.getDate());
    const daysSinceLastBM = Math.round((nowDay.getTime() - bmDay.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastBM >= 4) {
      return true;
    }
  }

  return false;
}

/**
 * Analisa consistência das fezes (Bristol Scale)
 */
export function analyzeBristolScale(value: number): {
  category: 'constipated' | 'normal' | 'loose' | 'diarrhea';
  message: string;
  shouldAlert: boolean;
} {
  if (value >= 1 && value <= 2) {
    return {
      category: 'constipated',
      message: 'Fezes endurecidas indicam constipação. Continue tomando os laxantes.',
      shouldAlert: false
    };
  } else if (value >= 3 && value <= 5) {
    return {
      category: 'normal',
      message: 'Consistência normal das fezes.',
      shouldAlert: false
    };
  } else if (value === 6) {
    return {
      category: 'loose',
      message: 'Fezes amolecidas. Se persistir, informe o médico.',
      shouldAlert: false
    };
  } else if (value === 7) {
    return {
      category: 'diarrhea',
      message: 'Diarreia presente. Importante o médico saber disso.',
      shouldAlert: true
    };
  } else {
    throw new Error('Invalid Bristol Scale value. Must be 1-7.');
  }
}
