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
import { sleep } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { sendMessage, sendTemplate, sendFollowUpQuestionnaire, isWhatsAppConfigured } from '@/lib/whatsapp';
import { toBrasiliaTime, fromBrasiliaTime, getBrasiliaHour, startOfDayBrasilia } from '@/lib/date-utils';
import { sendDailySummaryToAllDoctors } from '@/lib/daily-summary';

const CRON_SECRET = process.env.CRON_SECRET?.trim();

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação - aceita via header OU via query parameter
    const authHeader = request.headers.get('authorization');
    const providedSecretHeader = authHeader?.replace('Bearer ', '').trim();

    // Também aceitar via query parameter para compatibilidade com cron-job.org
    const url = new URL(request.url);
    const providedSecretQuery = url.searchParams.get('secret')?.trim();

    const providedSecret = providedSecretHeader || providedSecretQuery;

    // Também aceitar header x-vercel-cron para compatibilidade com Vercel
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';

    if (!isVercelCron && CRON_SECRET && providedSecret !== CRON_SECRET) {
      console.error('❌ Unauthorized cron job access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permitir forçar uma tarefa específica via query parameter
    // Ex: /api/cron/unified?task=reminder-14h ou ?task=reminder-18h
    const forcedTask = url.searchParams.get('task')?.trim();

    // Obter hora atual em Brasília (usando Intl para confiabilidade)
    const currentHour = getBrasiliaHour();

    console.log(`🕐 Cron Unificado - Hora Brasília: ${currentHour}:00`);

    // Verificar se WhatsApp está configurado (necessário para maioria das tarefas)
    const whatsappOk = isWhatsAppConfigured();

    const results: any = { hour: currentHour, tasks: [], success: true };

    // Se uma tarefa específica foi forçada via ?task=, executar só ela
    if (forcedTask) {
      console.log(`🎯 Tarefa forçada via query parameter: ${forcedTask}`);

      if (forcedTask === 'send-followups') {
        const r = await taskSendFollowUps();
        results.tasks.push({ task: 'send-followups', ...r });
      } else if (forcedTask === 'reminder-14h') {
        const r = await taskSendReminders('first');
        results.tasks.push({ task: 'reminder-14h', ...r });
      } else if (forcedTask === 'reminder-18h') {
        const r = await taskSendReminders('second');
        results.tasks.push({ task: 'reminder-18h', ...r });
      } else if (forcedTask === 'notify-doctor') {
        const r = await taskNotifyDoctorAndMarkOverdue();
        results.tasks.push({ task: 'notify-doctor-overdue', ...r });
      } else {
        results.tasks.push({ task: 'unknown', error: `Unknown task: ${forcedTask}` });
      }
    } else {
      // Executar TODAS as tarefas aplicáveis ao horário atual
      // (não usa else-if para evitar que uma tarefa bloqueie outra)

      // 10:00 BRT - Envio de follow-ups
      if (currentHour >= 9 && currentHour < 12) {
        console.log('📨 Executando: Envio de Follow-ups');
        const r = await taskSendFollowUps();
        results.tasks.push({ task: 'send-followups', ...r });
      }

      // 14:00 BRT - Primeiro lembrete
      if (currentHour >= 13 && currentHour < 16) {
        console.log('🔔 Executando: Primeiro Lembrete (14h)');
        const r = await taskSendReminders('first');
        results.tasks.push({ task: 'reminder-14h', ...r });
      }

      // 18:00 BRT - Segundo lembrete (17h-18h)
      if (currentHour >= 17 && currentHour < 19) {
        console.log('🔔 Executando: Segundo Lembrete (18h)');
        const r = await taskSendReminders('second');
        results.tasks.push({ task: 'reminder-18h', ...r });
      }

      // 19:00 BRT - Notificar médico + marcar overdue (19h-21h)
      if (currentHour >= 19 && currentHour < 21) {
        console.log('👨‍⚕️ Executando: Notificar Médico + Marcar Overdue');
        const r = await taskNotifyDoctorAndMarkOverdue();
        results.tasks.push({ task: 'notify-doctor-overdue', ...r });
      }

      // 00:00-03:00 BRT - Backup e manutenção
      if (currentHour >= 0 && currentHour < 4) {
        console.log('🔧 Executando: Manutenção (backup, token)');
        const r = await taskMaintenance();
        results.tasks.push({ task: 'maintenance', ...r });
      }
    }

    if (results.tasks.length === 0) {
      console.log('⏭️ Nenhuma tarefa agendada para este horário');
      results.tasks.push({ task: 'none' });
    }

    results.timestamp = new Date().toISOString();
    results.hourBrasilia = currentHour;

    console.log('✅ Cron Unificado concluído:', results.tasks.map((t: any) => t.task).join(', '));
    return NextResponse.json(results);

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
  const todayStart = startOfDayBrasilia();
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

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
  const todayStart = startOfDayBrasilia();
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const results = {
    noResponse: { found: 0, sent: 0, errors: [] as string[] },
    partialResponse: { found: 0, sent: 0, errors: [] as string[] },
  };

  // Follow-ups enviados mas não respondidos
  // CORREÇÃO: Buscar por sentAt OU scheduledDate (garante que funcione mesmo com envio atrasado)
  const unansweredFollowUps = await prisma.followUp.findMany({
    where: {
      status: { in: ['sent', 'in_progress'] },
      respondedAt: null,  // NUNCA enviar lembrete para quem já respondeu
      OR: [
        { sentAt: { gte: todayStart, lt: todayEnd } },
        { scheduledDate: { gte: todayStart, lt: todayEnd } },
        { sentAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
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

  // Enviar lembretes para não respondidos (usando template aprovado)
  for (const followUp of unansweredFollowUps) {
    try {
      const hasPartial = partialConversations.some(c => c.patientId === followUp.patientId);
      if (hasPartial) continue;

      // Usar template 'otherdays' aprovado pela Meta (funciona fora da janela de 24h)
      const firstName = followUp.patient.name.split(' ')[0];
      await sendTemplate(followUp.patient.phone, 'otherdays', [
        {
          type: 'body',
          parameters: [
            { type: 'text', parameter_name: 'customer_name', text: firstName }
          ]
        }
      ], 'pt_BR');
      results.noResponse.sent++;
      await sleep(300);
    } catch (error: any) {
      results.noResponse.errors.push(`${followUp.patient.name}: ${error?.message}`);
    }
  }

  // Enviar lembretes para parciais (usando template aprovado)
  for (const conv of partialConversations) {
    try {
      if (!conv.patient) continue;

      // Usar template 'otherdays' aprovado pela Meta (funciona fora da janela de 24h)
      const firstName = conv.patient.name.split(' ')[0];
      await sendTemplate(conv.patient.phone, 'otherdays', [
        {
          type: 'body',
          parameters: [
            { type: 'text', parameter_name: 'customer_name', text: firstName }
          ]
        }
      ], 'pt_BR');
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
  // Usar início do dia de ontem em Brasília para marcar overdue corretamente
  const yesterdayStart = startOfDayBrasilia(new Date(Date.now() - 24 * 60 * 60 * 1000));

  // Marcar como overdue
  const overdueFollowUps = await prisma.followUp.findMany({
    where: {
      status: { in: ['pending', 'sent'] },
      scheduledDate: { lt: yesterdayStart },
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

export async function POST(request: NextRequest) {
  return GET(request);
}
