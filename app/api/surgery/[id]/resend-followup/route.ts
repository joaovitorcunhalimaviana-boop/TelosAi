/**
 * Resend Latest Follow-up for a Surgery
 * Finds the latest pending/sent (non-responded) follow-up and resends it
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendFollowUpQuestionnaire, isWhatsAppConfigured } from '@/lib/whatsapp';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: surgeryId } = await params;

    if (!surgeryId) {
      return NextResponse.json({ error: 'Surgery ID is required' }, { status: 400 });
    }

    if (!isWhatsAppConfigured()) {
      return NextResponse.json({ error: 'WhatsApp not configured' }, { status: 500 });
    }

    // Buscar a cirurgia com o paciente
    const surgery = await prisma.surgery.findUnique({
      where: { id: surgeryId },
      include: {
        patient: true,
      },
    });

    if (!surgery) {
      return NextResponse.json({ error: 'Surgery not found' }, { status: 404 });
    }

    // Verificar se o médico é dono do paciente
    if (surgery.patient.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Buscar o último follow-up pendente (status sent ou pending)
    const latestFollowUp = await prisma.followUp.findFirst({
      where: {
        surgeryId: surgeryId,
        status: { in: ['pending', 'sent'] },
      },
      orderBy: { dayNumber: 'desc' },
    });

    if (!latestFollowUp) {
      return NextResponse.json(
        { error: 'Nenhum questionário pendente encontrado para este paciente' },
        { status: 404 }
      );
    }

    if (!surgery.patient.phone) {
      return NextResponse.json({ error: 'Patient has no phone number' }, { status: 400 });
    }

    // Enviar questionário
    const whatsappResponse = await sendFollowUpQuestionnaire(
      latestFollowUp,
      surgery.patient,
      surgery
    );

    // Atualizar status
    await prisma.followUp.update({
      where: { id: latestFollowUp.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      followUpId: latestFollowUp.id,
      patientName: surgery.patient.name,
      dayNumber: latestFollowUp.dayNumber,
      sentAt: new Date().toISOString(),
      whatsappMessageId: whatsappResponse.messages[0]?.id,
    });

  } catch (error) {
    console.error('Error resending follow-up:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
