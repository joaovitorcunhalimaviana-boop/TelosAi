/**
 * Manual Follow-up Send Endpoint
 * Allows manually triggering a follow-up questionnaire send
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendFollowUpQuestionnaire, isWhatsAppConfigured } from '@/lib/whatsapp';

/**
 * POST - Manually send a specific follow-up
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: followUpId } = await params;

    if (!followUpId) {
      return NextResponse.json(
        { error: 'Follow-up ID is required' },
        { status: 400 }
      );
    }

    // Verificar se WhatsApp está configurado
    if (!isWhatsAppConfigured()) {
      return NextResponse.json(
        { error: 'WhatsApp not configured' },
        { status: 500 }
      );
    }

    // Buscar follow-up
    const followUp = await prisma.followUp.findUnique({
      where: { id: followUpId },
      include: {
        patient: true,
        surgery: true,
      },
    });

    if (!followUp) {
      return NextResponse.json(
        { error: 'Follow-up not found' },
        { status: 404 }
      );
    }

    // Verificar se já foi respondido
    if (followUp.status === 'responded') {
      return NextResponse.json(
        { error: 'Follow-up already responded' },
        { status: 400 }
      );
    }

    // Validar telefone do paciente
    if (!followUp.patient.phone) {
      return NextResponse.json(
        { error: 'Patient has no phone number' },
        { status: 400 }
      );
    }

    console.log(
      `Manually sending follow-up D+${followUp.dayNumber} to patient ${followUp.patient.name}`
    );

    // Enviar questionário
    const whatsappResponse = await sendFollowUpQuestionnaire(
      followUp,
      followUp.patient,
      followUp.surgery
    );

    // Atualizar status
    await prisma.followUp.update({
      where: { id: followUpId },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    });

    console.log(`Follow-up sent successfully to ${followUp.patient.name}`);

    return NextResponse.json({
      success: true,
      followUpId: followUp.id,
      patientName: followUp.patient.name,
      dayNumber: followUp.dayNumber,
      sentAt: new Date().toISOString(),
      whatsappMessageId: whatsappResponse.messages[0]?.id,
    });

  } catch (error) {
    console.error('Error sending follow-up:', error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Get follow-up details and status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: followUpId } = await params;

    if (!followUpId) {
      return NextResponse.json(
        { error: 'Follow-up ID is required' },
        { status: 400 }
      );
    }

    // Buscar follow-up
    const followUp = await prisma.followUp.findUnique({
      where: { id: followUpId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        surgery: {
          select: {
            id: true,
            type: true,
            date: true,
          },
        },
        responses: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!followUp) {
      return NextResponse.json(
        { error: 'Follow-up not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: followUp.id,
      dayNumber: followUp.dayNumber,
      scheduledDate: followUp.scheduledDate,
      status: followUp.status,
      sentAt: followUp.sentAt,
      respondedAt: followUp.respondedAt,
      patient: followUp.patient,
      surgery: followUp.surgery,
      responses: followUp.responses,
      canResend: followUp.status !== 'responded',
    });

  } catch (error) {
    console.error('Error fetching follow-up:', error);
    return NextResponse.json(
      {
        error: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Cancel/skip a follow-up
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: followUpId } = await params;

    if (!followUpId) {
      return NextResponse.json(
        { error: 'Follow-up ID is required' },
        { status: 400 }
      );
    }

    // Buscar follow-up
    const followUp = await prisma.followUp.findUnique({
      where: { id: followUpId },
    });

    if (!followUp) {
      return NextResponse.json(
        { error: 'Follow-up not found' },
        { status: 404 }
      );
    }

    // Verificar se já foi respondido
    if (followUp.status === 'responded') {
      return NextResponse.json(
        { error: 'Cannot skip a responded follow-up' },
        { status: 400 }
      );
    }

    // Atualizar status para 'skipped'
    await prisma.followUp.update({
      where: { id: followUpId },
      data: {
        status: 'skipped',
      },
    });

    console.log(`Follow-up ${followUpId} marked as skipped`);

    return NextResponse.json({
      success: true,
      followUpId: followUp.id,
      status: 'skipped',
    });

  } catch (error) {
    console.error('Error skipping follow-up:', error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
