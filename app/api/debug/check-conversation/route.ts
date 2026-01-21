import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Verifica o estado da conversa de um paciente
 * GET /api/debug/check-conversation?phone=83998663089
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone required' },
        { status: 400 }
      );
    }

    const phoneDigits = phone.replace(/\D/g, '');
    const last9 = phoneDigits.slice(-9);

    // Buscar conversas
    const conversations = await prisma.conversation.findMany();

    const conversation = conversations.find(c => {
      const cDigits = (c.phoneNumber || '').replace(/\D/g, '');
      return cDigits.slice(-9) === last9 || cDigits.includes(phoneDigits);
    });

    if (!conversation) {
      return NextResponse.json({
        found: false,
        message: 'No conversation found for this phone'
      });
    }

    // Buscar paciente e follow-ups
    const patient = conversation.patientId
      ? await prisma.patient.findUnique({
          where: { id: conversation.patientId },
          include: {
            surgeries: {
              include: {
                followUps: {
                  include: {
                    responses: true
                  },
                  orderBy: { dayNumber: 'asc' }
                }
              }
            }
          }
        })
      : null;

    return NextResponse.json({
      found: true,
      conversation: {
        id: conversation.id,
        phoneNumber: conversation.phoneNumber,
        patientId: conversation.patientId,
        state: conversation.state,
        context: conversation.context,
        lastUserMessage: conversation.lastUserMessage,
        lastUserMessageAt: conversation.lastUserMessageAt,
        lastSystemMessage: conversation.lastSystemMessage?.substring(0, 100) + '...',
        lastSystemMessageAt: conversation.lastSystemMessageAt,
        messageHistoryCount: Array.isArray(conversation.messageHistory)
          ? (conversation.messageHistory as any[]).length
          : 0,
        updatedAt: conversation.updatedAt
      },
      patient: patient ? {
        name: patient.name,
        surgeries: patient.surgeries.map(s => ({
          type: s.type,
          date: s.date,
          followUps: s.followUps.map(f => ({
            dayNumber: f.dayNumber,
            status: f.status,
            scheduledDate: f.scheduledDate,
            sentAt: f.sentAt,
            respondedAt: f.respondedAt,
            responsesCount: f.responses.length
          }))
        }))
      } : null
    });

  } catch (error) {
    console.error('Error checking conversation:', error);
    return NextResponse.json(
      { error: 'Internal error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
