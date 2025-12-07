/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Mock data generator for demonstration
const generateMockGroupData = (group: any, patientCount: number) => {
  const avgAge = 45 + Math.random() * 20;
  const maleCount = Math.floor(patientCount * (0.4 + Math.random() * 0.3));

  return {
    id: group.id,
    groupCode: group.groupCode,
    groupName: group.groupName,
    description: group.description,
    patientCount: patientCount,
    demographics: {
      avgAge: avgAge,
      ageSD: 8 + Math.random() * 4,
      ageRange: [Math.floor(avgAge - 15), Math.floor(avgAge + 15)] as [number, number],
      maleCount: maleCount,
      femaleCount: patientCount - maleCount,
      malePercentage: (maleCount / patientCount) * 100,
    },
    baseline: {
      avgBMI: 24 + Math.random() * 6,
      comorbidityCount: Math.floor(patientCount * (0.2 + Math.random() * 0.3)),
      commonComorbidities: ['Hipertensão', 'Diabetes', 'Obesidade'].slice(
        0,
        Math.floor(Math.random() * 3) + 1
      ),
    },
    surgical: {
      avgDuration: 60 + Math.random() * 40,
      durationSD: 10 + Math.random() * 5,
      complications: Math.floor(patientCount * (0.05 + Math.random() * 0.1)),
      complicationRate: 0.05 + Math.random() * 0.1,
    },
    outcomes: {
      painScores: Array.from({ length: 10 }, () => Math.random() * 10),
      avgPainDay1: 7 + Math.random() * 2,
      avgPainDay7: 3 + Math.random() * 3,
      avgPainDay30: 1 + Math.random() * 2,
      avgRecoveryDays: 14 + Math.random() * 10,
      satisfactionScore: 7 + Math.random() * 2.5,
      returnToNormalActivities: 21 + Math.random() * 14,
    },
    followUp: {
      completionRate: 0.75 + Math.random() * 0.2,
      lostToFollowUp: Math.floor(patientCount * (0.05 + Math.random() * 0.15)),
    },
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { message: 'Não autenticado' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const researchId = id;

    // Fetch research with groups
    const research = await prisma.research.findUnique({
      where: { id: researchId },
      include: {
        groups: true,
      },
    });

    if (!research) {
      return NextResponse.json(
        { success: false, error: { message: 'Pesquisa não encontrada' } },
        { status: 404 }
      );
    }

    // Verify user has access to this research
    if (research.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Acesso negado' } },
        { status: 403 }
      );
    }

    // Get patient counts for each group separately
    // Since Patient has researchGroup as a string field, not a relation
    const groupsData = await Promise.all(
      research.groups.map(async (group) => {
        const patientCount = await prisma.patient.count({
          where: {
            userId: session.user.id,
            researchGroup: group.groupCode,
          },
        });
        return generateMockGroupData(group, patientCount);
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        research: {
          id: research.id,
          title: research.title,
          description: research.description,
          totalPatients: research.totalPatients,
        },
        groups: groupsData,
      },
    });
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Erro ao buscar dados de comparação' },
      },
      { status: 500 }
    );
  }
}
