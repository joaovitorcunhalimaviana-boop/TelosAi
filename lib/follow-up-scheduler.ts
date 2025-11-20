/**
 * Follow-up Scheduler
 * Cria os 7 follow-ups automáticos para o paciente após a cirurgia
 * D+1, D+2, D+3, D+5, D+7, D+10, D+14
 */

import { prisma } from '@/lib/prisma';
import { toBrasiliaTime, fromBrasiliaTime, BRASILIA_TZ } from '@/lib/date-utils';

const FOLLOW_UP_DAYS = [1, 2, 3, 5, 7, 10, 14];
const SEND_HOUR = 10; // 10:00 BRT (horário de Brasília)

interface CreateFollowUpScheduleParams {
  patientId: string;
  surgeryId: string;
  surgeryDate: Date;
  userId: string;
}

/**
 * Cria todos os follow-ups agendados para um paciente
 */
export async function createFollowUpSchedule({
  patientId,
  surgeryId,
  surgeryDate,
  userId,
}: CreateFollowUpScheduleParams) {
  try {
    const followUpsData = FOLLOW_UP_DAYS.map((dayNumber) => {
      // Adiciona o número de dias à data da cirurgia
      const scheduledDate = new Date(surgeryDate);
      scheduledDate.setDate(scheduledDate.getDate() + dayNumber);

      // Converter para timezone do Brasil
      const zonedDate = toBrasiliaTime(scheduledDate);
      zonedDate.setHours(SEND_HOUR, 0, 0, 0);

      // Converter de volta para UTC para salvar no banco
      const utcDate = fromBrasiliaTime(zonedDate);

      return {
        surgeryId,
        patientId,
        userId,
        dayNumber,
        scheduledDate: utcDate,
        status: 'pending',
      };
    });

    // Criar todos os follow-ups de uma vez
    const result = await prisma.followUp.createMany({
      data: followUpsData,
    });

    return {
      success: true,
      count: result.count,
      followUpDays: FOLLOW_UP_DAYS,
    };
  } catch (error) {
    console.error('Erro ao criar follow-ups:', error);
    throw new Error('Falha ao criar agendamento de follow-ups');
  }
}

/**
 * Obtém os follow-ups pendentes para um paciente
 */
export async function getPendingFollowUps(patientId: string) {
  return await prisma.followUp.findMany({
    where: {
      patientId,
      status: 'pending',
    },
    orderBy: {
      scheduledDate: 'asc',
    },
  });
}

/**
 * Obtém os follow-ups que devem ser enviados hoje
 */
export async function getTodayFollowUps(userId: string) {
  // Obter data atual no timezone do Brasil
  const nowInBrazil = toBrasiliaTime(new Date());
  nowInBrazil.setHours(0, 0, 0, 0);

  // Converter para UTC para comparar com o banco
  const today = fromBrasiliaTime(nowInBrazil);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return await prisma.followUp.findMany({
    where: {
      userId,
      status: 'pending',
      scheduledDate: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      patient: true,
      surgery: true,
    },
    orderBy: {
      scheduledDate: 'asc',
    },
  });
}

/**
 * Marca um follow-up como enviado
 */
export async function markFollowUpAsSent(followUpId: string) {
  return await prisma.followUp.update({
    where: { id: followUpId },
    data: {
      status: 'sent',
      sentAt: new Date(),
    },
  });
}

/**
 * Marca um follow-up como respondido
 */
export async function markFollowUpAsResponded(followUpId: string) {
  return await prisma.followUp.update({
    where: { id: followUpId },
    data: {
      status: 'responded',
      respondedAt: new Date(),
    },
  });
}
