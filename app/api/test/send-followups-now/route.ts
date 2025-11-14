/**
 * Test endpoint to manually trigger follow-up sends
 * This endpoint bypasses the CRON_SECRET check for easier testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendFollowUpQuestionnaire, isWhatsAppConfigured } from '@/lib/whatsapp';
import { getCurrentUser } from '@/lib/session';
import { getNowBrasilia, startOfDayBrasilia, endOfDayBrasilia } from '@/lib/date-utils';

/**
 * POST - Manually send today's follow-ups
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar se usuário está autenticado
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // Verificar se WhatsApp está configurado
    if (!isWhatsAppConfigured()) {
      return NextResponse.json(
        {
          error: 'WhatsApp not configured',
          details: 'Please configure WhatsApp Business API credentials'
        },
        { status: 500 }
      );
    }

    console.log('🚀 Manual follow-up send triggered by:', user.email);

    // Data de hoje no horário de Brasília (início e fim do dia)
    const todayBrasilia = getNowBrasilia();
    const todayStart = startOfDayBrasilia();
    const todayEnd = endOfDayBrasilia();

    console.log('📅 Brasília Time:', todayBrasilia.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
    console.log('📅 Looking for follow-ups scheduled for:', todayStart.toDateString());

    // Buscar follow-ups pendentes para hoje
    const pendingFollowUps = await prisma.followUp.findMany({
      where: {
        userId: user.id, // Apenas do usuário logado
        status: 'pending',
        scheduledDate: {
          gte: todayStart,
          lt: todayEnd,
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

    console.log(`📋 Found ${pendingFollowUps.length} pending follow-ups for today`);

    if (pendingFollowUps.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending follow-ups found for today',
        timestamp: new Date().toISOString(),
        results: {
          total: 0,
          sent: 0,
          failed: 0,
        }
      });
    }

    const results = {
      total: pendingFollowUps.length,
      sent: 0,
      failed: 0,
      details: [] as Array<{
        patientName: string;
        dayNumber: number;
        phone: string;
        status: 'success' | 'failed';
        error?: string;
      }>,
    };

    // Processar cada follow-up
    for (const followUp of pendingFollowUps) {
      try {
        console.log(
          `📤 Sending follow-up D+${followUp.dayNumber} to patient ${followUp.patient.name}`
        );

        // Validar se paciente tem telefone válido
        if (!followUp.patient.phone) {
          throw new Error('Patient has no phone number');
        }

        // Enviar questionário via WhatsApp
        await sendFollowUpQuestionnaire(
          followUp,
          followUp.patient,
          followUp.surgery
        );

        // Atualizar status para 'sent'
        await prisma.followUp.update({
          where: { id: followUp.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
          },
        });

        results.sent++;
        results.details.push({
          patientName: followUp.patient.name,
          dayNumber: followUp.dayNumber,
          phone: followUp.patient.phone,
          status: 'success',
        });

        console.log(`✅ Follow-up sent successfully to ${followUp.patient.name}`);

        // Delay para evitar rate limiting (500ms entre mensagens)
        await sleep(500);

      } catch (error) {
        console.error(
          `❌ Error sending follow-up to patient ${followUp.patient.name}:`,
          error
        );

        results.failed++;
        results.details.push({
          patientName: followUp.patient.name,
          dayNumber: followUp.dayNumber,
          phone: followUp.patient.phone || 'N/A',
          status: 'failed',
          error: String(error),
        });
      }
    }

    // Log final
    console.log('✨ Manual send completed:', results);

    return NextResponse.json({
      success: true,
      message: `Sent ${results.sent} of ${results.total} follow-ups`,
      timestamp: new Date().toISOString(),
      results,
    });

  } catch (error) {
    console.error('💥 Error in manual send:', error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Show instructions
 */
export async function GET() {
  return NextResponse.json({
    message: 'Use POST to manually trigger follow-up sends',
    instructions: 'Send a POST request to this endpoint to send all pending follow-ups scheduled for today',
    note: 'You must be logged in to use this endpoint',
  });
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
