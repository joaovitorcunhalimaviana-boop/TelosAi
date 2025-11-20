import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Limpa todos os dados de um paciente específico
 * Útil para testes - reseta conversas, follow-ups, respostas
 *
 * GET /api/debug/cleanup-patient?phone=5583991664904
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number required. Use ?phone=5583991664904' },
        { status: 400 }
      );
    }

    console.log('🧹 Starting cleanup for phone:', phone);

    // Buscar paciente
    const patient = await prisma.patient.findFirst({
      where: {
        phone: {
          contains: phone.replace(/\D/g, '').slice(-11)
        }
      },
      include: {
        surgeries: {
          include: {
            followUps: {
              include: {
                responses: true
              }
            }
          }
        },
        conversations: true
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    console.log('👤 Found patient:', patient.name);

    const stats = {
      patient: patient.name,
      phone: patient.phone,
      deleted: {
        conversations: 0,
        followUpResponses: 0,
        followUps: 0
      },
      reset: {
        followUps: 0
      }
    };

    // 1. Deletar conversas
    const deletedConversations = await prisma.conversation.deleteMany({
      where: { patientId: patient.id }
    });
    stats.deleted.conversations = deletedConversations.count;
    console.log('✅ Deleted conversations:', deletedConversations.count);

    // 2. Deletar respostas de follow-up
    for (const surgery of patient.surgeries) {
      for (const followUp of surgery.followUps) {
        const deletedResponses = await prisma.followUpResponse.deleteMany({
          where: { followUpId: followUp.id }
        });
        stats.deleted.followUpResponses += deletedResponses.count;
      }
    }
    console.log('✅ Deleted follow-up responses:', stats.deleted.followUpResponses);

    // 3. Resetar follow-ups para pending
    for (const surgery of patient.surgeries) {
      for (const followUp of surgery.followUps) {
        await prisma.followUp.update({
          where: { id: followUp.id },
          data: {
            status: 'pending',
            sentAt: null,
            respondedAt: null
          }
        });
        stats.reset.followUps++;
      }
    }
    console.log('✅ Reset follow-ups:', stats.reset.followUps);

    return NextResponse.json({
      success: true,
      message: `Patient ${patient.name} cleaned up successfully`,
      stats
    });

  } catch (error) {
    console.error('❌ Error cleaning up patient:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
