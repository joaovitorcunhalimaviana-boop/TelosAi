import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const { id: researchId } = await params;

    // Fetch research details
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

    // Verify user has access
    if (research.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Acesso negado' } },
        { status: 403 }
      );
    }

    // Get patient counts for each group
    const groupsWithCounts = await Promise.all(
      research.groups.map(async (group) => {
        const patientCount = await prisma.patient.count({
          where: {
            userId: session.user.id,
            researchGroup: group.groupCode,
          },
        });
        return {
          id: group.id,
          groupCode: group.groupCode,
          groupName: group.groupName,
          description: group.description,
          patientCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        id: research.id,
        title: research.title,
        description: research.description,
        surgeryType: research.surgeryType,
        isActive: research.isActive,
        startDate: research.startDate.toISOString(),
        endDate: research.endDate?.toISOString() || null,
        totalPatients: research.totalPatients,
        groups: groupsWithCounts,
      },
    });
  } catch (error) {
    console.error('Error fetching research:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Erro ao buscar pesquisa' },
      },
      { status: 500 }
    );
  }
}
