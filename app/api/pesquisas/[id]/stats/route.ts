/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildErrorResponse } from '@/lib/api-utils';
import { auth } from '@/lib/auth';
import { calculateResearchStats } from '@/lib/research-stats';
import type { Patient, Research } from '@/lib/research-stats';

// ============================================
// GET - RESEARCH STATISTICS AND ANALYTICS
// ============================================

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const researchId = resolvedParams.id;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        buildErrorResponse('Unauthorized', 'You must be logged in'),
        { status: 401 }
      );
    }
    const userId = session.user.id;

    // Get research with all related data
    const research = await prisma.research.findFirst({
      where: {
        id: researchId,
        userId,
      },
      include: {
        groups: {
          orderBy: {
            groupCode: 'asc',
          },
        },
      },
    });

    if (!research) {
      return NextResponse.json(
        buildErrorResponse('Not found', 'Research not found'),
        { status: 404 }
      );
    }

    // Get all patients in this research
    const patientsData = await prisma.patient.findMany({
      where: {
        userId,
        isResearchParticipant: true,
        researchGroup: {
          in: research.groups.map((g) => g.groupCode),
        },
      },
      include: {
        surgeries: {
          include: {
            details: true,
            anesthesia: true,
            followUps: {
              include: {
                responses: true,
              },
            },
          },
        },
        comorbidities: {
          include: {
            comorbidity: true,
          },
        },
        medications: {
          include: {
            medication: true,
          },
        },
      },
    });

    // Transform data to match the expected types
    const patients: Patient[] = patientsData.map((p) => ({
      id: p.id,
      age: p.age,
      sex: p.sex,
      researchGroup: p.researchGroup,
      surgeries: p.surgeries.map((s) => ({
        id: s.id,
        type: s.type,
        dataCompleteness: s.dataCompleteness,
        anesthesia: s.anesthesia
          ? {
              type: s.anesthesia.type,
              pudendoBlock: s.anesthesia.pudendoBlock,
            }
          : null,
        followUps: s.followUps.map((f) => ({
          id: f.id,
          dayNumber: f.dayNumber,
          status: f.status,
          responses: f.responses.map((r) => ({
            id: r.id,
            questionnaireData: r.questionnaireData,
            redFlags: r.redFlags,
          })),
        })),
      })),
      comorbidities: p.comorbidities.map((c) => ({
        comorbidity: {
          name: c.comorbidity.name,
        },
      })),
      medications: p.medications.map((m) => ({
        medication: {
          name: m.medication.name,
        },
      })),
    }));

    // Transform research to match expected type
    const researchData: Research = {
      id: research.id,
      title: research.title,
      description: research.description,
      surgeryType: research.surgeryType,
      isActive: research.isActive,
      startDate: research.startDate,
      endDate: research.endDate,
      groups: research.groups.map((g) => ({
        id: g.id,
        groupCode: g.groupCode,
        groupName: g.groupName,
        description: g.description || undefined,
      })),
    };

    // Calculate all statistics using the modular functions
    const stats = calculateResearchStats(researchData, patients);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting research statistics:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Failed to get research statistics',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
