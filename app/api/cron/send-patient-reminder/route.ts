/**
 * Vercel Cron Job - Send Patient Reminder
 * Runs daily at 14:00 BRT (4 hours after follow-up is sent at 10:00)
 * Sends reminder to patients who haven't responded
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPatientReminder, isWhatsAppConfigured } from '@/lib/whatsapp';
import { toBrasiliaTime } from '@/lib/date-utils';

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

    console.log('🔔 Starting patient reminder cron job...');

    // Buscar follow-ups enviados há mais de 4 horas que ainda não foram respondidos
    const fourHoursAgo = new Date();
    fourHoursAgo.setHours(fourHoursAgo.getHours() - 4);

    // Buscar follow-ups com status='sent' enviados há mais de 4h
    const unansweredFollowUps = await prisma.followUp.findMany({
      where: {
        status: 'sent',
        sentAt: {
          lte: fourHoursAgo,
        },
      },
      include: {
        patient: true,
        surgery: true,
      },
    });

    console.log(`📋 Found ${unansweredFollowUps.length} unanswered follow-ups`);

    const results = {
      total: unansweredFollowUps.length,
      sent: 0,
      failed: 0,
      errors: [] as Array<{ patientId: string; error: string }>,
    };

    // Enviar lembretes
    for (const followUp of unansweredFollowUps) {
      try {
        // Verificar se já foi enviado lembrete hoje (evitar spam)
        // Podemos usar um campo metadata ou verificar pela hora do sentAt
        const sentAtBrasilia = toBrasiliaTime(followUp.sentAt!);
        const nowBrasilia = toBrasiliaTime(new Date());

        // Se foi enviado hoje e já passou 4h, enviar lembrete
        if (sentAtBrasilia.toDateString() === nowBrasilia.toDateString()) {
          console.log(`📱 Sending reminder to ${followUp.patient.name}`);

          const success = await sendPatientReminder(
            followUp.patient.phone,
            followUp.patient.name
          );

          if (success) {
            results.sent++;
            console.log(`✅ Reminder sent to ${followUp.patient.name}`);
          } else {
            results.failed++;
            results.errors.push({
              patientId: followUp.patientId,
              error: 'Failed to send reminder',
            });
          }

          // Delay para evitar rate limiting
          await sleep(500);
        }
      } catch (error) {
        console.error(`❌ Error sending reminder to ${followUp.patient.name}:`, error);
        results.failed++;
        results.errors.push({
          patientId: followUp.patientId,
          error: String(error),
        });
      }
    }

    console.log('✅ Patient reminder cron job completed:', results);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
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
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
