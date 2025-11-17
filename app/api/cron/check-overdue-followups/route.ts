/**
 * Vercel Cron Job - Check Overdue Follow-ups
 * Roda a cada 6 horas para verificar follow-ups não respondidos há mais de 24h
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/create-notification';

const CRON_SECRET = process.env.CRON_SECRET!;

/**
 * GET - Trigger Cron Job
 * Chamado pelo Vercel Cron ou manualmente para testes
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '');

    if (providedSecret !== CRON_SECRET) {
      console.error('[OverdueCron] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[OverdueCron] Starting overdue follow-up check...');

    // Calcular data de 24 horas atrás
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Buscar follow-ups enviados há mais de 24h e ainda não respondidos
    const overdueFollowUps = await prisma.followUp.findMany({
      where: {
        status: 'sent',
        sentAt: {
          lt: twentyFourHoursAgo,
        },
      },
      include: {
        patient: true,
        surgery: true,
        user: true, // Include user to send notification
      },
    });

    console.log(`[OverdueCron] Found ${overdueFollowUps.length} overdue follow-ups`);

    const results = {
      total: overdueFollowUps.length,
      notified: 0,
      failed: 0,
      errors: [] as Array<{ followUpId: string; error: string }>,
    };

    // Processar cada follow-up atrasado
    for (const followUp of overdueFollowUps) {
      try {
        console.log(
          `[OverdueCron] Processing overdue follow-up D+${followUp.dayNumber} for patient ${followUp.patient.name}`
        );

        // Verificar se já existe uma notificação de overdue para este follow-up
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: followUp.userId,
            type: 'followup_overdue',
            data: {
              path: ['followUpId'],
              equals: followUp.id,
            },
          },
        });

        // Se já notificou, pular
        if (existingNotification) {
          console.log(`[OverdueCron] Already notified for follow-up ${followUp.id}`);
          continue;
        }

        // Criar notificação
        await createNotification({
          userId: followUp.userId,
          type: 'followup_overdue',
          title: `⏰ Follow-up Atrasado - ${followUp.patient.name}`,
          message: `O follow-up D+${followUp.dayNumber} foi enviado há mais de 24h e ainda não foi respondido`,
          priority: 'medium',
          actionUrl: `/paciente/${followUp.patient.id}`,
          data: {
            patientId: followUp.patient.id,
            patientName: followUp.patient.name,
            surgeryId: followUp.surgery.id,
            followUpId: followUp.id,
            dayNumber: followUp.dayNumber,
            sentAt: followUp.sentAt,
          },
        });

        // Atualizar status do follow-up para overdue
        await prisma.followUp.update({
          where: { id: followUp.id },
          data: {
            status: 'overdue',
          },
        });

        results.notified++;
        console.log(`[OverdueCron] Notification sent for follow-up ${followUp.id}`);
      } catch (error) {
        console.error(`[OverdueCron] Error processing follow-up ${followUp.id}:`, error);
        results.failed++;
        results.errors.push({
          followUpId: followUp.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log('[OverdueCron] Job completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Overdue follow-up check completed',
      results,
    });
  } catch (error) {
    console.error('[OverdueCron] Job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check overdue follow-ups',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
