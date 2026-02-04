/**
 * Sistema de Resumo Diário para o Médico
 * Gera e envia um resumo consolidado diário do acompanhamento pós-operatório
 * via notificações in-app
 */

import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/create-notification';
import { toBrasiliaTime, fromBrasiliaTime, formatBrasiliaDate, startOfDayBrasilia, endOfDayBrasilia } from '@/lib/date-utils';
import { sleep } from '@/lib/utils';

interface PatientSummary {
  name: string;
  dayNumber: number;
  painAtRest: number | null;
  painDuringBowel: number | null;
  hadBowelMovement: boolean;
  hasFever: boolean;
  hasBleeding: boolean;
  painTrend: 'improving' | 'stable' | 'worsening' | 'unknown';
  hasRedFlags: boolean;
  redFlags: string[];
}

interface RedFlagPatient {
  name: string;
  dayNumber: number;
  painAtRest: number | null;
  redFlags: string[];
}

interface NoResponsePatient {
  name: string;
  dayNumber: number;
}

interface DailySummaryData {
  date: string;
  respondedPatients: PatientSummary[];
  redFlagPatients: RedFlagPatient[];
  noResponsePatients: NoResponsePatient[];
  trends: {
    improving: number;
    stable: number;
    worsening: number;
  };
}

/**
 * Gera o resumo diário para um médico específico
 */
export async function generateDailySummary(userId: string): Promise<DailySummaryData> {
  // Obter início e fim do dia atual em Brasília
  const todayStart = startOfDayBrasilia();
  const todayEnd = endOfDayBrasilia();

  // Obter início e fim do dia anterior (para comparar tendências de dor)
  const yesterdayDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const yesterdayStart = startOfDayBrasilia(yesterdayDate);
  const yesterdayEnd = startOfDayBrasilia();

  // 1. Buscar follow-ups agendados para hoje
  const todayFollowUps = await prisma.followUp.findMany({
    where: {
      userId,
      scheduledDate: { gte: todayStart, lt: todayEnd },
    },
    include: {
      patient: true,
      responses: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const respondedPatients: PatientSummary[] = [];
  const redFlagPatients: RedFlagPatient[] = [];
  const noResponsePatients: NoResponsePatient[] = [];

  // 2. Processar cada follow-up
  for (const followUp of todayFollowUps) {
    const hasResponse = followUp.responses.length > 0;
    const response = followUp.responses[0];

    if (hasResponse && response) {
      // Parsear dados do questionário
      let questionnaireData: any = {};
      try {
        questionnaireData = JSON.parse(response.questionnaireData);
      } catch (e) {
        console.error('Erro ao parsear questionnaireData:', e);
      }

      // Determinar tendência de dor (comparar com ontem)
      const painTrend = await calculatePainTrend(
        followUp.patientId,
        response.painAtRest,
        yesterdayStart,
        yesterdayEnd
      );

      // Paciente respondeu
      const patientSummary: PatientSummary = {
        name: followUp.patient.name,
        dayNumber: followUp.dayNumber,
        painAtRest: response.painAtRest,
        painDuringBowel: response.painDuringBowel,
        hadBowelMovement: questionnaireData.hadBowelMovement === 'yes',
        hasFever: response.fever || false,
        hasBleeding: response.bleeding || false,
        painTrend,
        hasRedFlags: response.riskLevel === 'high' || response.riskLevel === 'critical',
        redFlags: parseRedFlags(response.redFlags),
      };

      respondedPatients.push(patientSummary);

      // Se tem red flags, adicionar à lista
      if (patientSummary.hasRedFlags) {
        redFlagPatients.push({
          name: patientSummary.name,
          dayNumber: patientSummary.dayNumber,
          painAtRest: patientSummary.painAtRest,
          redFlags: patientSummary.redFlags,
        });
      }
    } else {
      // Paciente não respondeu
      noResponsePatients.push({
        name: followUp.patient.name,
        dayNumber: followUp.dayNumber,
      });
    }
  }

  // 3. Calcular tendências gerais
  const trends = {
    improving: respondedPatients.filter((p) => p.painTrend === 'improving').length,
    stable: respondedPatients.filter((p) => p.painTrend === 'stable').length,
    worsening: respondedPatients.filter((p) => p.painTrend === 'worsening').length,
  };

  return {
    date: formatBrasiliaDate(new Date(), 'short'),
    respondedPatients,
    redFlagPatients,
    noResponsePatients,
    trends,
  };
}

/**
 * Formata o resumo diário para envio via WhatsApp
 */
export function formatDailySummaryMessage(summary: DailySummaryData): string {
  let message = `📋 *RESUMO DIÁRIO - ${summary.date}*\n\n`;

  // 1. Pacientes que responderam
  message += `✅ *RESPONDERAM HOJE (${summary.respondedPatients.length}):*\n`;
  if (summary.respondedPatients.length > 0) {
    for (const patient of summary.respondedPatients) {
      const firstName = patient.name.split(' ')[0];
      const painRest = patient.painAtRest !== null ? `${patient.painAtRest}/10` : '-';
      const painBowel = patient.painDuringBowel !== null ? `${patient.painDuringBowel}/10` : '-';
      const bowel = patient.hadBowelMovement ? 'evacuou' : 'não evacuou';
      const fever = patient.hasFever ? 'com febre' : 'sem febre';

      let trendIcon = '';
      if (patient.painTrend === 'improving') trendIcon = ' ↓';
      else if (patient.painTrend === 'worsening') trendIcon = ' ↑';

      message += `• ${firstName} (D+${patient.dayNumber}): Dor ${painRest}${trendIcon}, ${bowel}, ${fever}\n`;
    }
  } else {
    message += `_Nenhum paciente respondeu hoje_\n`;
  }

  message += '\n';

  // 2. Red Flags (destacados)
  message += `🚨 *RED FLAGS (${summary.redFlagPatients.length}):*\n`;
  if (summary.redFlagPatients.length > 0) {
    for (const patient of summary.redFlagPatients) {
      const firstName = patient.name.split(' ')[0];
      const painRest = patient.painAtRest !== null ? `${patient.painAtRest}/10` : '-';
      message += `• ${firstName} (D+${patient.dayNumber}): Dor ${painRest}`;

      // Adicionar detalhes dos red flags
      if (patient.redFlags.length > 0) {
        message += `, ${patient.redFlags.join(', ').toLowerCase()}`;
      }

      message += '\n';
    }
    message += `  → Recomendado contato urgente\n`;
  } else {
    message += `_Nenhum red flag detectado hoje_\n`;
  }

  message += '\n';

  // 3. Pacientes que NÃO responderam
  message += `❌ *NÃO RESPONDERAM (${summary.noResponsePatients.length}):*\n`;
  if (summary.noResponsePatients.length > 0) {
    for (const patient of summary.noResponsePatients) {
      const firstName = patient.name.split(' ')[0];
      message += `• ${firstName} (D+${patient.dayNumber})\n`;
    }
  } else {
    message += `_Todos os pacientes responderam_\n`;
  }

  message += '\n';

  // 4. Tendências de dor
  message += `📈 *TENDÊNCIAS:*\n`;
  message += `• ${summary.trends.improving} paciente(s) melhorando\n`;
  message += `• ${summary.trends.stable} paciente(s) estável(is)\n`;
  message += `• ${summary.trends.worsening} paciente(s) piorando\n`;

  return message;
}

/**
 * Envia o resumo diário para o médico via notificação in-app
 */
export async function sendDailySummaryToDoctor(userId: string): Promise<boolean> {
  try {
    // 1. Buscar dados do médico
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { nomeCompleto: true },
    });

    if (!user) {
      console.log(`⚠️ Médico ${userId} não encontrado.`);
      return false;
    }

    // 2. Gerar resumo
    const summary = await generateDailySummary(userId);

    // 3. Verificar se há algo para reportar
    const hasData =
      summary.respondedPatients.length > 0 ||
      summary.redFlagPatients.length > 0 ||
      summary.noResponsePatients.length > 0;

    if (!hasData) {
      console.log(`ℹ️ Nenhum follow-up agendado para hoje para médico ${userId}. Resumo não enviado.`);
      return false;
    }

    // 4. Determinar prioridade e tipo baseado nos red flags
    const hasRedFlags = summary.redFlagPatients.length > 0;
    const priority = hasRedFlags ? 'high' : 'medium';
    const type = hasRedFlags ? 'red_flag_high' : 'info';

    // 5. Criar título e mensagem
    const title = `📋 Resumo Diário - ${summary.date}`;
    const message = formatDailySummaryMessage(summary);

    // 6. Enviar notificação in-app
    await createNotification({
      userId,
      type,
      title,
      message,
      priority,
      actionUrl: '/dashboard',
      data: {
        date: summary.date,
        respondedCount: summary.respondedPatients.length,
        redFlagCount: summary.redFlagPatients.length,
        noResponseCount: summary.noResponsePatients.length,
        trends: summary.trends,
      },
    });

    console.log(`✅ Resumo diário enviado para médico ${user.nomeCompleto} (${userId})`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao enviar resumo diário para médico ${userId}:`, error);
    return false;
  }
}

/**
 * Envia resumo diário para todos os médicos ativos
 */
export async function sendDailySummaryToAllDoctors(): Promise<{
  total: number;
  sent: number;
  failed: number;
}> {
  try {
    // Buscar todos os médicos
    const doctors = await prisma.user.findMany({
      where: {
        role: 'medico',
      },
      select: { id: true, nomeCompleto: true },
    });

    const results = {
      total: doctors.length,
      sent: 0,
      failed: 0,
    };

    console.log(`📊 Enviando resumo diário para ${doctors.length} médico(s)...`);

    for (const doctor of doctors) {
      try {
        const success = await sendDailySummaryToDoctor(doctor.id);
        if (success) {
          results.sent++;
        }
        // Pequena pausa entre envios
        await sleep(100);
      } catch (error) {
        console.error(`❌ Erro ao enviar resumo para ${doctor.nomeCompleto}:`, error);
        results.failed++;
      }
    }

    console.log(`✅ Resumos enviados: ${results.sent}/${results.total} (${results.failed} falhas)`);
    return results;
  } catch (error) {
    console.error('❌ Erro ao enviar resumos diários:', error);
    throw error;
  }
}

/**
 * Calcula a tendência de dor comparando com o dia anterior
 */
async function calculatePainTrend(
  patientId: string,
  currentPain: number | null,
  yesterdayStart: Date,
  yesterdayEnd: Date
): Promise<'improving' | 'stable' | 'worsening' | 'unknown'> {
  if (currentPain === null) {
    return 'unknown';
  }

  // Buscar resposta de ontem
  const yesterdayResponse = await prisma.followUpResponse.findFirst({
    where: {
      followUp: {
        patientId,
        scheduledDate: { gte: yesterdayStart, lt: yesterdayEnd },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!yesterdayResponse || yesterdayResponse.painAtRest === null) {
    return 'unknown';
  }

  const yesterdayPain = yesterdayResponse.painAtRest;
  const diff = currentPain - yesterdayPain;

  // Melhora: redução de 2+ pontos
  if (diff <= -2) return 'improving';

  // Piora: aumento de 2+ pontos
  if (diff >= 2) return 'worsening';

  // Estável: diferença de -1, 0 ou 1
  return 'stable';
}

/**
 * Parseia a string de red flags em array
 */
function parseRedFlags(redFlagsString: string | null): string[] {
  if (!redFlagsString) return [];

  try {
    // Pode estar em formato JSON array ou string separada por vírgulas
    if (redFlagsString.startsWith('[')) {
      return JSON.parse(redFlagsString);
    }
    return redFlagsString.split(',').map((s) => s.trim()).filter(Boolean);
  } catch (e) {
    return [];
  }
}

