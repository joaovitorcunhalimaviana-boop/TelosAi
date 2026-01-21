import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Reseta o status de um follow-up específico
 * GET /api/debug/reset-followup-status?phone=84988889153&day=2&status=pending
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const dayParam = searchParams.get('day');
    const newStatus = searchParams.get('status') || 'pending';

    if (!phone || !dayParam) {
      return NextResponse.json(
        { error: 'Required: ?phone=84988889153&day=2' },
        { status: 400 }
      );
    }

    const dayNumber = parseInt(dayParam);
    const phoneDigits = phone.replace(/\D/g, '');
    const last9 = phoneDigits.slice(-9);

    // Buscar paciente
    const patients = await prisma.patient.findMany({
      include: {
        surgeries: {
          include: {
            followUps: true
          }
        }
      }
    });

    const patient = patients.find(p => {
      const pDigits = (p.phone || '').replace(/\D/g, '');
      return pDigits.slice(-9) === last9;
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const surgery = patient.surgeries[0];
    if (!surgery) {
      return NextResponse.json({ error: 'No surgery found' }, { status: 404 });
    }

    const followUp = surgery.followUps.find(f => f.dayNumber === dayNumber);
    if (!followUp) {
      return NextResponse.json({ error: `Follow-up D+${dayNumber} not found` }, { status: 404 });
    }

    // Se resetando para pending, deletar respostas inválidas também
    let deletedResponses = 0;
    if (newStatus === 'pending') {
      const deleteResult = await prisma.followUpResponse.deleteMany({
        where: { followUpId: followUp.id }
      });
      deletedResponses = deleteResult.count;
    }

    // Atualizar status
    const updated = await prisma.followUp.update({
      where: { id: followUp.id },
      data: {
        status: newStatus,
        sentAt: newStatus === 'pending' ? null : followUp.sentAt,
        respondedAt: newStatus === 'pending' ? null : followUp.respondedAt
      }
    });

    return NextResponse.json({
      success: true,
      message: `Follow-up D+${dayNumber} reset to ${newStatus}`,
      patient: patient.name,
      followUp: {
        dayNumber: updated.dayNumber,
        status: updated.status,
        sentAt: updated.sentAt
      },
      deletedResponses
    });

  } catch (error) {
    console.error('Error resetting follow-up:', error);
    return NextResponse.json(
      { error: 'Internal error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
