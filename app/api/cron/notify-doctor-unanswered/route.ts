/**
 * Vercel Cron Job - Notify Doctor of Unanswered Follow-ups
 * Runs daily at 16:00 BRT (6 hours after follow-up is sent at 10:00)
 * Notifies doctors when their patients haven't responded
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyDoctorUnanswered, isWhatsAppConfigured } from '@/lib/whatsapp';
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

    console.log('👨‍⚕️ Starting doctor notification cron job...');

    // Buscar follow-ups enviados há mais de 6 horas que ainda não foram respondidos
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

    // Buscar follow-ups com status='sent' enviados há mais de 6h
    const unansweredFollowUps = await prisma.followUp.findMany({
      where: {
        status: 'sent',
        sentAt: {
          lte: sixHoursAgo,
        },
      },
      include: {
        patient: true,
        surgery: true,
        user: {
          select: {
            id: true,
            nomeCompleto: true,
            whatsapp: true,
          },
        },
      },
    });

    console.log(`📋 Found ${unansweredFollowUps.length} unanswered follow-ups for doctor notification`);

    const results = {
      total: unansweredFollowUps.length,
      notified: 0,
      skipped: 0,
      failed: 0,
      errors: [] as Array<{ patientId: string; doctorId: string; error: string }>,
    };

    // Agrupar por médico para evitar múltiplas mensagens
    const byDoctor = new Map<string, typeof unansweredFollowUps>();

    for (const followUp of unansweredFollowUps) {
      const doctorId = followUp.userId;
      if (!byDoctor.has(doctorId)) {
        byDoctor.set(doctorId, []);
      }
      byDoctor.get(doctorId)!.push(followUp);
    }

    // Notificar cada médico
    for (const [doctorId, followUps] of byDoctor) {
      const doctor = followUps[0].user;

      // Verificar se médico tem WhatsApp cadastrado
      if (!doctor.whatsapp) {
        console.warn(`⚠️ Doctor ${doctor.nomeCompleto} (${doctorId}) has no WhatsApp configured. Skipping.`);
        results.skipped += followUps.length;
        continue;
      }

      // Enviar notificação para cada paciente que não respondeu
      for (const followUp of followUps) {
        try {
          // Verificar se foi enviado hoje (evitar notificar sobre follow-ups antigos)
          const sentAtBrasilia = toBrasiliaTime(followUp.sentAt!);
          const nowBrasilia = toBrasiliaTime(new Date());

          if (sentAtBrasilia.toDateString() !== nowBrasilia.toDateString()) {
            console.log(`⏭️ Skipping old follow-up for ${followUp.patient.name} (sent on different day)`);
            results.skipped++;
            continue;
          }

          console.log(`📱 Notifying Dr. ${doctor.nomeCompleto} about ${followUp.patient.name}`);

          const success = await notifyDoctorUnanswered(
            doctor.whatsapp,
            followUp.patient.name,
            followUp.dayNumber
          );

          if (success) {
            results.notified++;
            console.log(`✅ Doctor notified about ${followUp.patient.name}`);
          } else {
            results.failed++;
            results.errors.push({
              patientId: followUp.patientId,
              doctorId: doctorId,
              error: 'Failed to send notification',
            });
          }

          // Delay para evitar rate limiting
          await sleep(500);

        } catch (error) {
          console.error(`❌ Error notifying doctor about ${followUp.patient.name}:`, error);
          results.failed++;
          results.errors.push({
            patientId: followUp.patientId,
            doctorId: doctorId,
            error: String(error),
          });
        }
      }
    }

    console.log('✅ Doctor notification cron job completed:', results);

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
