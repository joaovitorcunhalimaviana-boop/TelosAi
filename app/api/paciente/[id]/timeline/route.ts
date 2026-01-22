import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  buildErrorResponse,
  isValidCuid,
  buildTimelineEvents,
  TimelineEvent,
} from '@/lib/api-utils';

// ============================================
// GET - PATIENT TIMELINE
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID format
    if (!isValidCuid(id)) {
      return NextResponse.json(
        buildErrorResponse('Invalid patient ID format', 'ID must be a valid CUID'),
        { status: 400 }
      );
    }

    // Fetch patient with all timeline-related data
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        surgeries: {
          orderBy: {
            date: 'desc',
          },
        },
        followUps: {
          include: {
            responses: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          orderBy: {
            scheduledDate: 'desc',
          },
        },
        consentTerms: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        buildErrorResponse('Patient not found', `No patient found with ID: ${id}`),
        { status: 404 }
      );
    }

    // Build timeline events
    const events = buildTimelineEvents(patient);

    // Add additional detailed timeline events
    const detailedEvents: TimelineEvent[] = [...events];

    // Add follow-up response details
    patient.followUps.forEach((followUp) => {
      followUp.responses.forEach((response) => {
        // Parse questionnaireData if it exists
        let questionnaireData = null;
        if (response.questionnaireData) {
          try {
            questionnaireData = typeof response.questionnaireData === 'string'
              ? JSON.parse(response.questionnaireData)
              : response.questionnaireData;
          } catch (e) {
            console.error('Error parsing questionnaireData:', e);
          }
        }

        // Mesclar dados das colunas diretas com o JSON para garantir consistência
        // As colunas diretas (painAtRest, painDuringBowel) têm prioridade sobre o JSON
        const mergedQuestionnaireData = {
          ...questionnaireData,
          // Sobrescrever com valores das colunas diretas se existirem
          ...(response.painAtRest !== null && response.painAtRest !== undefined
            ? { painAtRest: response.painAtRest, pain: response.painAtRest }
            : {}),
          ...(response.painDuringBowel !== null && response.painDuringBowel !== undefined
            ? { painDuringBowelMovement: response.painDuringBowel, painDuringEvacuation: response.painDuringBowel }
            : {}),
        };

        detailedEvents.push({
          id: response.id,
          type: 'followup',
          date: response.createdAt,
          title: `Resposta D+${followUp.dayNumber}`,
          description: `Nível de risco: ${response.riskLevel}`,
          metadata: {
            followUpId: followUp.id,
            riskLevel: response.riskLevel,
            redFlags: response.redFlags ? JSON.parse(response.redFlags) : [],
            doctorAlerted: response.doctorAlerted,
            questionnaireData: mergedQuestionnaireData,
            aiAnalysis: response.aiAnalysis,
          },
        });
      });
    });

    // Sort all events by date (newest first)
    detailedEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Build statistics
    const stats = {
      totalSurgeries: patient.surgeries.length,
      totalFollowUps: patient.followUps.length,
      completedFollowUps: patient.followUps.filter((f) => f.status === 'responded')
        .length,
      pendingFollowUps: patient.followUps.filter((f) => f.status === 'pending').length,
      overdueFollowUps: patient.followUps.filter((f) => f.status === 'overdue').length,
      totalConsentTerms: patient.consentTerms.length,
      signedConsentTerms: patient.consentTerms.filter((c) => c.signedPhysically)
        .length,
      highRiskResponses: patient.followUps.reduce((count, followUp) => {
        return (
          count +
          followUp.responses.filter(
            (r) => r.riskLevel === 'high' || r.riskLevel === 'critical'
          ).length
        );
      }, 0),
    };

    // Build follow-up summary
    const followUpSummary = patient.followUps.map((followUp) => ({
      id: followUp.id,
      dayNumber: followUp.dayNumber,
      scheduledDate: followUp.scheduledDate,
      status: followUp.status,
      sentAt: followUp.sentAt,
      respondedAt: followUp.respondedAt,
      responseCount: followUp.responses.length,
      latestRiskLevel:
        followUp.responses.length > 0 ? followUp.responses[0].riskLevel : null,
      hasRedFlags:
        followUp.responses.length > 0 && followUp.responses[0].redFlags
          ? JSON.parse(followUp.responses[0].redFlags).length > 0
          : false,
    }));

    return NextResponse.json({
      success: true,
      data: {
        patientId: id,
        patientName: patient.name,
        timeline: detailedEvents,
        stats,
        followUpSummary,
      },
    });
  } catch (error) {
    console.error('Error fetching patient timeline:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Failed to fetch patient timeline',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

// ============================================
// GET TIMELINE BY TYPE
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type } = body; // 'surgery', 'followup', 'consent', 'update'

    if (!isValidCuid(id)) {
      return NextResponse.json(
        buildErrorResponse('Invalid patient ID format', 'ID must be a valid CUID'),
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        surgeries: true,
        followUps: {
          include: {
            responses: true,
          },
        },
        consentTerms: true,
      },
    });

    if (!patient) {
      return NextResponse.json(
        buildErrorResponse('Patient not found', `No patient found with ID: ${id}`),
        { status: 404 }
      );
    }

    const allEvents = buildTimelineEvents(patient);

    // Filter by type if specified
    const filteredEvents = type
      ? allEvents.filter((event) => event.type === type)
      : allEvents;

    return NextResponse.json({
      success: true,
      data: {
        patientId: id,
        type: type || 'all',
        events: filteredEvents,
        count: filteredEvents.length,
      },
    });
  } catch (error) {
    console.error('Error fetching filtered timeline:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Failed to fetch filtered timeline',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
