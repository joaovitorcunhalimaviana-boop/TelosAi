/**
 * Vercel Cron Job - Send Follow-ups
 * Runs daily at 10:00 AM to send scheduled follow-up questionnaires
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendFollowUpQuestionnaire, isWhatsAppConfigured } from '@/lib/whatsapp';

const CRON_SECRET = process.env.CRON_SECRET!;

/**
 * GET - Trigger Cron Job
 * Called by Vercel Cron or manually for testing
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '');

    if (providedSecret !== CRON_SECRET) {
      console.error('Unauthorized cron job access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verificar se WhatsApp está configurado
    if (!isWhatsAppConfigured()) {
      console.error('WhatsApp not configured');
      return NextResponse.json(
        { error: 'WhatsApp not configured' },
        { status: 500 }
      );
    }

    console.log('Starting follow-up cron job...');

    // Data de hoje (início e fim do dia)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar follow-ups pendentes para hoje
    const pendingFollowUps = await prisma.followUp.findMany({
      where: {
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

    console.log(`Found ${pendingFollowUps.length} pending follow-ups for today`);

    const results = {
      total: pendingFollowUps.length,
      sent: 0,
      failed: 0,
      errors: [] as Array<{ patientId: string; error: string }>,
    };

    // Processar cada follow-up
    for (const followUp of pendingFollowUps) {
      try {
        console.log(
          `Sending follow-up D+${followUp.dayNumber} to patient ${followUp.patient.name}`
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
        console.log(`Follow-up sent successfully to ${followUp.patient.name}`);

        // Delay para evitar rate limiting (500ms entre mensagens)
        await sleep(500);

      } catch (error) {
        console.error(
          `Error sending follow-up to patient ${followUp.patient.name}:`,
          error
        );

        results.failed++;
        results.errors.push({
          patientId: followUp.patientId,
          error: String(error),
        });

        // Não atualizar status em caso de erro para tentar novamente
        // Ou atualizar com contador de tentativas
        await incrementFailureAttempt(followUp.id);
      }
    }

    // Log final
    console.log('Cron job completed:', results);

    // Verificar follow-ups atrasados (overdue)
    await checkOverdueFollowUps();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });

  } catch (error) {
    console.error('Cron job error:', error);
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
 * POST - Alternative trigger method
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

/**
 * Incrementa contador de tentativas falhas
 */
async function incrementFailureAttempt(followUpId: string) {
  try {
    // Buscar follow-up atual
    const followUp = await prisma.followUp.findUnique({
      where: { id: followUpId },
    });

    if (!followUp) return;

    // Parse metadata (se existir) ou criar novo
    const metadata = (followUp as any).metadata
      ? JSON.parse((followUp as any).metadata)
      : {};

    const failureAttempts = (metadata.failureAttempts || 0) + 1;

    // Se excedeu 3 tentativas, marcar como 'skipped'
    if (failureAttempts >= 3) {
      await prisma.followUp.update({
        where: { id: followUpId },
        data: {
          status: 'skipped',
        },
      });

      console.log(
        `Follow-up ${followUpId} marked as skipped after ${failureAttempts} failed attempts`
      );
    }

    // Atualizar metadata (se o schema suportar)
    // await prisma.followUp.update({
    //   where: { id: followUpId },
    //   data: {
    //     metadata: JSON.stringify({ ...metadata, failureAttempts }),
    //   },
    // });

  } catch (error) {
    console.error('Error incrementing failure attempt:', error);
  }
}

/**
 * Verifica e marca follow-ups atrasados
 */
async function checkOverdueFollowUps() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    // Buscar follow-ups pendentes ou enviados que já deveriam ter resposta
    const overdueFollowUps = await prisma.followUp.findMany({
      where: {
        status: {
          in: ['pending', 'sent'],
        },
        scheduledDate: {
          lt: yesterday,
        },
      },
    });

    console.log(`Found ${overdueFollowUps.length} overdue follow-ups`);

    // Atualizar status para 'overdue'
    for (const followUp of overdueFollowUps) {
      await prisma.followUp.update({
        where: { id: followUp.id },
        data: {
          status: 'overdue',
        },
      });
    }

    if (overdueFollowUps.length > 0) {
      console.log(`Marked ${overdueFollowUps.length} follow-ups as overdue`);
    }

  } catch (error) {
    console.error('Error checking overdue follow-ups:', error);
  }
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculates next run time (informational)
 */
function getNextRunInfo(): string {
  const now = new Date();
  const next = new Date();
  next.setHours(10, 0, 0, 0);

  if (now.getHours() >= 10) {
    next.setDate(next.getDate() + 1);
  }

  return next.toISOString();
}
