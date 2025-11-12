// API Route para preview de exportação de pesquisa
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { researchId, groupIds, dateRange } = body;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar pesquisa e grupos
    const research = await prisma.research.findFirst({
      where: {
        id: researchId,
        userId: user.id,
      },
      include: {
        groups: {
          where: {
            id: { in: groupIds },
          },
        },
      },
    });

    if (!research) {
      return NextResponse.json(
        { error: 'Pesquisa não encontrada' },
        { status: 404 }
      );
    }

    // Buscar pacientes e contar estatísticas
    const patients = await prisma.patient.findMany({
      where: {
        userId: user.id,
        isResearchParticipant: true,
        researchGroup: {
          in: research.groups.map(g => g.groupCode),
        },
      },
      include: {
        surgeries: {
          where: {
            ...(dateRange?.startDate || dateRange?.endDate
              ? {
                  date: {
                    ...(dateRange.startDate
                      ? { gte: new Date(dateRange.startDate) }
                      : {}),
                    ...(dateRange.endDate
                      ? { lte: new Date(dateRange.endDate) }
                      : {}),
                  },
                }
              : {}),
          },
          include: {
            followUps: true,
          },
        },
      },
    });

    const filteredPatients = patients.filter(p => p.surgeries.length > 0);
    const totalSurgeries = filteredPatients.reduce((sum, p) => sum + p.surgeries.length, 0);
    const totalFollowUps = filteredPatients.reduce(
      (sum, p) => sum + p.surgeries.reduce((s, surgery) => s + surgery.followUps.length, 0),
      0
    );

    // Estatísticas por grupo
    const groupStats = research.groups.map(group => {
      const groupPatients = filteredPatients.filter(p => p.researchGroup === group.groupCode);
      return {
        groupCode: group.groupCode,
        groupName: group.groupName,
        patientCount: groupPatients.length,
        surgeryCount: groupPatients.reduce((sum, p) => sum + p.surgeries.length, 0),
      };
    });

    return NextResponse.json({
      success: true,
      totalPatients: filteredPatients.length,
      totalSurgeries,
      totalFollowUps,
      groupStats,
      dateRange: dateRange || null,
    });
  } catch (error) {
    console.error('Erro ao gerar preview:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar preview' },
      { status: 500 }
    );
  }
}
