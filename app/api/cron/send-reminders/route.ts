/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Vercel Cron Job - Send Reminders (14h e 18h BRT)
 *
 * Este cron envia lembretes para pacientes que:
 * 1. Não responderam ao follow-up do dia (status: sent)
 * 2. Começaram a responder mas não terminaram (conversation.state: collecting_answers)
 *
 * Executado às 14:00 e 18:00 horário de Brasília
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMessage, isWhatsAppConfigured } from '@/lib/whatsapp';
import { toBrasiliaTime, fromBrasiliaTime } from '@/lib/date-utils';

const CRON_SECRET = process.env.CRON_SECRET!;

/**
 * GET - Trigger Cron Job
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '');

    if (providedSecret !== CRON_SECRET) {
      console.error('Unauthorized cron job access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se WhatsApp está configurado
    if (!isWhatsAppConfigured()) {
      console.error('WhatsApp not configured');
      return NextResponse.json({ error: 'WhatsApp not configured' }, { status: 500 });
    }

    console.log('🔔 Starting reminder cron job...');

    // Obter hora atual em Brasília
    const nowBrasilia = toBrasiliaTime(new Date());
    const currentHour = nowBrasilia.getHours();

    // Determinar qual lembrete estamos enviando (1º às 14h, 2º às 18h)
    const isFirstReminder = currentHour >= 13 && currentHour < 16; // ~14h
    const isSecondReminder = currentHour >= 17 && currentHour < 20; // ~18h

    console.log(`⏰ Current hour (Brasília): ${currentHour}, isFirstReminder: ${isFirstReminder}, isSecondReminder: ${isSecondReminder}`);

    // Data de hoje no horário de Brasília (início do dia)
    const todayBrasilia = new Date(nowBrasilia);
    todayBrasilia.setHours(0, 0, 0, 0);
    const todayStart = fromBrasiliaTime(todayBrasilia);

    // Fim do dia hoje
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const results = {
      timestamp: new Date().toISOString(),
      currentHourBrasilia: currentHour,
      reminderType: isFirstReminder ? '14h' : isSecondReminder ? '18h' : 'unknown',
      noResponse: { found: 0, sent: 0, errors: [] as string[] },
      partialResponse: { found: 0, sent: 0, errors: [] as string[] },
    };

    // 1. Buscar follow-ups enviados hoje que ainda não foram respondidos
    const unansweredFollowUps = await prisma.followUp.findMany({
      where: {
        status: 'sent',
        scheduledDate: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
      include: {
        patient: true,
        surgery: true,
      },
    });

    results.noResponse.found = unansweredFollowUps.length;
    console.log(`📋 Found ${unansweredFollowUps.length} unanswered follow-ups for today`);

    // 2. Buscar conversas em estado "collecting_answers" (parciais)
    const partialConversations = await prisma.conversation.findMany({
      where: {
        state: 'collecting_answers',
        updatedAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
      include: {
        patient: true,
      },
    });

    results.partialResponse.found = partialConversations.length;
    console.log(`📋 Found ${partialConversations.length} partial conversations for today`);

    // 3. Processar follow-ups sem resposta
    for (const followUp of unansweredFollowUps) {
      try {
        // Verificar se já existe conversa parcial para este paciente (evitar duplicata)
        const hasPartialConversation = partialConversations.some(
          conv => conv.patientId === followUp.patientId
        );

        if (hasPartialConversation) {
          console.log(`⏭️ Skipping ${followUp.patient.name} - already in partial conversation`);
          continue;
        }

        const firstName = followUp.patient.name.split(' ')[0];
        let message: string;

        if (isFirstReminder) {
          // Primeiro lembrete - 14h
          message = `Olá, ${firstName}! 👋\n\n` +
            `Percebi que você ainda não respondeu o acompanhamento de hoje.\n\n` +
            `Pode me contar como está se sentindo? Suas respostas são muito importantes para sua recuperação. 🙏\n\n` +
            `Responda "sim" para começarmos!`;
        } else if (isSecondReminder) {
          // Segundo lembrete - 18h
          message = `Boa tarde, ${firstName}! 😊\n\n` +
            `Estou preocupada com você! Ainda não tive notícias suas hoje.\n\n` +
            `Como está se sentindo depois da cirurgia?\n\n` +
            `Responda "sim" quando puder, ok?`;
        } else {
          continue; // Não é horário de lembrete
        }

        console.log(`📤 Sending no-response reminder to ${followUp.patient.name}...`);
        await sendMessage(followUp.patient.phone, message);
        results.noResponse.sent++;

        // Pequeno delay para evitar rate limiting
        await sleep(300);

      } catch (error: any) {
        console.error(`❌ Error sending reminder to ${followUp.patient.name}:`, error?.message);
        results.noResponse.errors.push(`${followUp.patient.name}: ${error?.message}`);
      }
    }

    // 4. Processar conversas parciais
    for (const conversation of partialConversations) {
      try {
        if (!conversation.patient) {
          console.log(`⏭️ Skipping conversation ${conversation.id} - no patient linked`);
          continue;
        }

        const firstName = conversation.patient.name.split(' ')[0];
        let message: string;

        if (isFirstReminder) {
          // Primeiro lembrete para resposta parcial - 14h
          message = `Olá, ${firstName}! 👋\n\n` +
            `Percebi que não terminamos nossa conversa de hoje.\n\n` +
            `Pode continuar respondendo? Faltam poucas perguntas! 😊`;
        } else if (isSecondReminder) {
          // Segundo lembrete para resposta parcial - 18h
          message = `${firstName}, boa tarde! 😊\n\n` +
            `Ainda estou aguardando suas respostas.\n\n` +
            `Por favor, complete o questionário quando puder - é importante para acompanharmos sua recuperação!`;
        } else {
          continue;
        }

        console.log(`📤 Sending partial-response reminder to ${conversation.patient.name}...`);
        await sendMessage(conversation.phoneNumber, message);
        results.partialResponse.sent++;

        // Pequeno delay para evitar rate limiting
        await sleep(300);

      } catch (error: any) {
        console.error(`❌ Error sending partial reminder to conversation ${conversation.id}:`, error?.message);
        results.partialResponse.errors.push(`${conversation.patient?.name || conversation.id}: ${error?.message}`);
      }
    }

    console.log('✅ Reminder cron job completed:', results);

    return NextResponse.json({
      success: true,
      results,
    });

  } catch (error: any) {
    console.error('❌ Reminder cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Alternative trigger method
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
