import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendFollowUpQuestionnaire, isWhatsAppConfigured } from '@/lib/whatsapp';

/**
 * Dispara follow-up manualmente para teste
 * GET /api/debug/trigger-followup?phone=83998663089
 * GET /api/debug/trigger-followup?phone=83998663089&day=1
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const dayParam = searchParams.get('day');

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone required. Use ?phone=83998663089' },
        { status: 400 }
      );
    }

    // Verificar WhatsApp
    if (!isWhatsAppConfigured()) {
      return NextResponse.json(
        { error: 'WhatsApp not configured' },
        { status: 500 }
      );
    }

    // Normalizar telefone
    const phoneDigits = phone.replace(/\D/g, '');
    const last9 = phoneDigits.slice(-9);

    console.log('🔍 Searching patient with phone ending:', last9);

    // Buscar paciente
    const patients = await prisma.patient.findMany({
      include: {
        surgeries: {
          include: {
            followUps: {
              orderBy: { dayNumber: 'asc' }
            }
          }
        }
      }
    });

    const patient = patients.find(p => {
      const pDigits = (p.phone || '').replace(/\D/g, '');
      return pDigits.slice(-9) === last9;
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    console.log('👤 Found patient:', patient.name);

    // Verificar se tem cirurgias
    if (!patient.surgeries || patient.surgeries.length === 0) {
      return NextResponse.json(
        { error: 'Patient has no surgeries' },
        { status: 400 }
      );
    }

    const surgery = patient.surgeries[0];

    // Encontrar follow-up específico ou o primeiro pendente
    let followUp;
    if (dayParam) {
      const dayNumber = parseInt(dayParam);
      followUp = surgery.followUps.find(f => f.dayNumber === dayNumber);
      if (!followUp) {
        return NextResponse.json(
          { error: `Follow-up D+${dayNumber} not found` },
          { status: 404 }
        );
      }
    } else {
      // Pegar o primeiro follow-up pendente
      followUp = surgery.followUps.find(f => f.status === 'pending');
      if (!followUp) {
        return NextResponse.json(
          { error: 'No pending follow-ups found' },
          { status: 400 }
        );
      }
    }

    console.log(`📤 Sending follow-up D+${followUp.dayNumber} to ${patient.name}`);

    // Enviar mensagem
    await sendFollowUpQuestionnaire(followUp, patient, surgery);

    // Atualizar status
    await prisma.followUp.update({
      where: { id: followUp.id },
      data: {
        status: 'sent',
        sentAt: new Date()
      }
    });

    console.log('✅ Follow-up sent successfully!');

    return NextResponse.json({
      success: true,
      message: `Follow-up D+${followUp.dayNumber} sent to ${patient.name}`,
      patient: {
        name: patient.name,
        phone: patient.phone
      },
      followUp: {
        dayNumber: followUp.dayNumber,
        status: 'sent',
        sentAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error triggering follow-up:', error);
    return NextResponse.json(
      {
        error: 'Failed to send follow-up',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
