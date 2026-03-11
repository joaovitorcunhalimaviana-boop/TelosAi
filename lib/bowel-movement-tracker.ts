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
    message = 'Está há 4 dias sem evacuar. É muito importante tomar os laxantes e se hidratar. Se tiver dificuldade, entre em contato com seu médico.';
  } else {
    // D+5+: Urgente
    urgencyLevel = 'urgent';
    message = `Você está há ${daysWithoutMovement} dias sem evacuar. Isso precisa ser avaliado pelo médico. Por favor, entre em contato com seu médico urgentemente.`;
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
    painDuringBowelMovement
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
    // PRIMEIRA EVACUAÇÃO PÓS-CIRURGIA AINDA NÃO REGISTRADA
    return {
      mainQuestion: 'Você evacuou desde a última vez que conversamos?',
      followUpIfYes: [
        'Quando foi? Hoje ou ontem? Aproximadamente que horas?',
        'Qual foi a dor DURANTE a evacuação? De 0 a 10.',
        'Se evacuou HOJE: "E ANTES de ir ao banheiro, como estava sua dor? Parado(a), sem evacuar, de 0 a 10?" Se evacuou só ONTEM: "E agora, como está sua dor? Parado(a), em repouso, de 0 a 10?" ⛔ NÃO copiar dor da evacuação para cá — são campos diferentes!',
      ],
      followUpIfNo:
        currentDay <= 2
          ? ['Tudo bem, é normal nessa fase.']
          : currentDay === 3
          ? ['Está tomando os laxantes que o médico receitou? É importante manter a hidratação.']
          : currentDay === 4
          ? ['É importante evacuar logo. Está com medo da dor ou alguma dificuldade?']
          : ['Isso é importante. Vou avisar seu médico.'],
      contextForAI: getBowelMovementContextMessage(false, currentDay),
    };
  } else if (currentDay <= 7) {
    // DIÁRIO EVACUATÓRIO D1-D7 — COLETA DETALHADA (todas as evacuações)
    return {
      mainQuestion: 'Desde a última vez que conversamos, você evacuou?',
      followUpIfYes: [
        'Quantas vezes evacuou? Quando foram? (hoje, ontem) Aproximadamente que horas cada uma?',
        'Qual foi a dor durante cada evacuação? De 0 a 10.',
        'Se evacuou HOJE: "E ANTES de ir ao banheiro, como estava sua dor? Parado(a), sem evacuar, de 0 a 10?" Se evacuou só ONTEM: "E agora, como está sua dor? Parado(a), em repouso, de 0 a 10?" ⛔ NÃO copiar dor da evacuação para cá — são campos diferentes!',
      ],
      followUpIfNo: [],
      contextForAI: 'Primeira evacuação já registrada. D1-D7: coletar TODAS as evacuações com dia, horário e dor de cada uma. Extrair evacuationDetails como array.',
    };
  } else {
    // DIÁRIO EVACUATÓRIO D10+ — COLETA RESUMIDA (só última evacuação)
    return {
      mainQuestion: 'Desde a última vez que conversamos, você evacuou?',
      followUpIfYes: [
        'Quando foi a última evacuação? Que dia e aproximadamente que horas?',
        'Qual foi a dor na última evacuação? De 0 a 10.',
        'Se evacuou HOJE: "E ANTES de ir ao banheiro, como estava sua dor? Parado(a), sem evacuar, de 0 a 10?" Se evacuou só em dias anteriores: "E agora, como está sua dor? Parado(a), em repouso, de 0 a 10?" ⛔ NÃO copiar dor da evacuação para cá — são campos diferentes!',
      ],
      followUpIfNo: [],
      contextForAI: 'Primeira evacuação já registrada. D10+: coletar apenas a ÚLTIMA evacuação e sua dor.',
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