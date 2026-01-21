/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cron Job Unificado - Executa tarefas baseado no horário
 *
 * Este endpoint é chamado múltiplas vezes ao dia e executa a tarefa apropriada
 * baseado no horário de Brasília:
 *
 * - 10:00 BRT (13:00 UTC): Envio de follow-ups do dia
 * - 14:00 BRT (17:00 UTC): Primeiro lembrete para não respondidos
 * - 18:00 BRT (21:00 UTC): Segundo lembrete para não respondidos
 * - 19:00 BRT (22:00 UTC): Notifica médico sobre não respondidos + marca overdue
 * - 00:00 BRT (03:00 UTC): Backup + renovação token WhatsApp
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMessage, sendFollowUpQuestionnaire, isWhatsAppConfigured } from '@/lib/whatsapp';
import { toBrasiliaTime, fromBrasiliaTime } from '@/lib/date-utils';
import { sendDailySummaryToAllDoctors } from '@/lib/daily-summary';

const CRON_SECRET = process.env.CRON_SECRET?.trim();

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '').trim();

    if (CRON_SECRET && providedSecret !== CRON_SECRET) {
      console.error('❌ Unauthorized cron job access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obter hora atual em Brasília
    const nowBrasilia = toBrasiliaTime(new Date());
    const currentHour = nowBrasilia.getHours();

    console.log(`🕐 Cron Unificado - Hora Brasília: ${currentHour}:00`);

    // Verificar se WhatsApp está configurado (necessário para maioria das tarefas)
    const whatsappOk = isWhatsAppConfigured();

    let result: any = { hour: currentHour, task: 'none', success: true };

    // 10:00 BRT - Envio de follow-ups
    if (currentHour >= 9 && currentHour < 12) {
      console.log('📨 Executando: Envio de Follow-ups');
      result = await taskSendFollowUps();
      result.task = 'send-followups';
    }
    // 14:00 BRT - Primeiro lembrete
    else if (currentHour >= 13 && currentHour < 16) {
      console.log('🔔 Executando: Primeiro Lembrete (14h)');
      result = await taskSendReminders('first');
      result.task = 'reminder-14h';
    }
    // 18:00 BRT - Segundo lembrete
    else if (currentHour >= 17 && currentHour < 20) {
      console.log('🔔 Executando: Segundo Lembrete (18h)');
      result = await taskSendReminders('second');
      result.task = 'reminder-18h';
    }
    // 19:00 BRT - Notificar médico + marcar overdue
    else if (currentHour >= 19 && currentHour < 21) {
      console.log('👨‍⚕️ Executando: Notificar Médico + Marcar Overdue');
      result = await taskNotifyDoctorAndMarkOverdue();
      result.task = 'notify-doctor-overdue';
    }
    // 00:00-03:00 BRT - Backup e manutenção
    else if (currentHour >= 0 && currentHour < 4) {
      console.log('🔧 Executando: Manutenção (backup, token)');
      result = await taskMaintenance();
      result.task = 'maintenance';
    }
    else {
      console.log('⏭️ Nenhuma tarefa agendada para este horário');
      result.task = 'none';
    }

    result.timestamp = new Date().toISOString();
    result.hourBrasilia = currentHour;

    console.log('✅ Cron Unificado concluído:', result.task);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Erro no cron unificado:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}

// ================================================
// TAREFA: Enviar Follow-ups do dia (10h BRT)
// ================================================
async function taskSendFollowUps() {
  const nowBrasilia = toBrasiliaTime(new Date());
  nowBrasilia.setHours(0, 0, 0, 0);
  const todayStart = fromBrasiliaTime(nowBrasilia);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const pendingFollowUps = await prisma.followUp.findMany({
    where: {
      status: 'pending',
      scheduledDate: { gte: todayStart, lt: todayEnd },
    },
    include: { patient: true, surgery: true },
  });

  const results = { total: pendingFollowUps.length, sent: 0, failed: 0, errors: [] as string[] };

  for (const followUp of pendingFollowUps) {
    try {
      if (!followUp.patient.phone) {
        throw new Error('Patient has no phone');
      }

      await sendFollowUpQuestionnaire(followUp, followUp.patient, followUp.surgery);

      await prisma.followUp.update({
        where: { id: followUp.id },
        data: { status: 'sent', sentAt: new Date() },
      });

      results.sent++;
      await sleep(500);
    } catch (error: any) {
      results.failed++;
      results.errors.push(`${followUp.patient.name}: ${error?.message}`);
    }
  }

  return { success: true, results };
}

// ================================================
// TAREFA: Enviar Lembretes (14h e 18h BRT)
// ================================================
async function taskSendReminders(type: 'first' | 'second') {
  const nowBrasilia = toBrasiliaTime(new Date());
  nowBrasilia.setHours(0, 0, 0, 0);
  const todayStart = fromBrasiliaTime(nowBrasilia);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const results = {
    noResponse: { found: 0, sent: 0, errors: [] as string[] },
    partialResponse: { found: 0, sent: 0, errors: [] as string[] },
  };

  // Follow-ups enviados mas não respondidos
  const unansweredFollowUps = await prisma.followUp.findMany({
    where: {
      status: 'sent',
      scheduledDate: { gte: todayStart, lt: todayEnd },
    },
    include: { patient: true },
  });

  results.noResponse.found = unansweredFollowUps.length;

  // Conversas parciais
  const partialConversations = await prisma.conversation.findMany({
    where: {
      state: 'collecting_answers',
      updatedAt: { gte: todayStart, lt: todayEnd },
    },
    include: { patient: true },
  });

  results.partialResponse.found = partialConversations.length;

  // Enviar lembretes para não respondidos
  for (const followUp of unansweredFollowUps) {
    try {
      const hasPartial = partialConversations.some(c => c.patientId === followUp.patientId);
      if (hasPartial) continue;

      const firstName = followUp.patient.name.split(' ')[0];
      const message = type === 'first'
        ? `Olá, ${firstName}! 👋\n\nPercebi que você ainda não respondeu o acompanhamento de hoje.\n\nPode me contar como está se sentindo? Responda "sim" para começarmos! 🙏`
        : `Boa tarde, ${firstName}! 😊\n\nEstou preocupada com você! Ainda não tive notícias suas hoje.\n\nComo está se sentindo depois da cirurgia? Responda "sim" quando puder!`;

      await sendMessage(followUp.patient.phone, message);
      results.noResponse.sent++;
      await sleep(300);
    } catch (error: any) {
      results.noResponse.errors.push(`${followUp.patient.name}: ${error?.message}`);
    }
  }

  // Enviar lembretes para parciais
  for (const conv of partialConversations) {
    try {
      if (!conv.patient) continue;

      const firstName = conv.patient.name.split(' ')[0];
      const message = type === 'first'
        ? `Olá, ${firstName}! 👋\n\nPercebi que não terminamos nossa conversa de hoje. Pode continuar respondendo? Faltam poucas perguntas! 😊`
        : `${firstName}, boa tarde! 😊\n\nAinda estou aguardando suas respostas. Complete o questionário quando puder - é importante para sua recuperação!`;

      await sendMessage(conv.phoneNumber, message);
      results.partialResponse.sent++;
      await sleep(300);
    } catch (error: any) {
      results.partialResponse.errors.push(`${conv.patient?.name}: ${error?.message}`);
    }
  }

  return { success: true, results };
}

// ================================================
// TAREFA: Notificar médico + Marcar overdue (19h BRT)
// ================================================
async function taskNotifyDoctorAndMarkOverdue() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999);

  // Marcar como overdue
  const overdueFollowUps = await prisma.followUp.findMany({
    where: {
      status: { in: ['pending', 'sent'] },
      scheduledDate: { lt: yesterday },
    },
  });

  for (const followUp of overdueFollowUps) {
    await prisma.followUp.update({
      where: { id: followUp.id },
      data: { status: 'overdue' },
    });
  }

  // Enviar resumo diário consolidado para todos os médicos
  console.log('📊 Enviando resumo diário para médicos...');
  let summaryResults = { total: 0, sent: 0, failed: 0 };

  try {
    summaryResults = await sendDailySummaryToAllDoctors();
  } catch (error) {
    console.error('❌ Erro ao enviar resumos diários:', error);
  }

  return {
    success: true,
    overdueMarked: overdueFollowUps.length,
    dailySummary: summaryResults,
  };
}

// ================================================
// TAREFA: Manutenção (00h-03h BRT)
// ================================================
async function taskMaintenance() {
  // Por enquanto, apenas log - backup e token são tratados pelo daily-tasks existente
  return { success: true, message: 'Maintenance tasks delegated to daily-tasks' };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  return GET(request);
}
