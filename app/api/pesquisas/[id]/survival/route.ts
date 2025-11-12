import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  calculateKaplanMeier,
  calculateLogRankTest,
  calculateCoxRegression,
  extractTimeToComplication,
  extractTimeToPainResolution,
  extractTimeToReturnToActivities,
  SurvivalDataPoint,
} from '@/lib/survival-analysis';

// ============================================
// GET - SURVIVAL ANALYSIS FOR RESEARCH
// ============================================

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { message: 'Não autenticado' } },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const researchId = resolvedParams.id;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const outcome = searchParams.get('outcome') || 'complication'; // complication, pain_resolution, return_to_activities
    const groups = searchParams.get('groups')?.split(',') || [];

    // Fetch research
    const research = await prisma.research.findUnique({
      where: { id: researchId },
      include: {
        groups: {
          orderBy: { groupCode: 'asc' },
        },
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

    // Fetch patients with surgeries and follow-ups
    const patients = await prisma.patient.findMany({
      where: {
        userId: session.user.id,
        isResearchParticipant: true,
        researchGroup: {
          in: research.groups.map(g => g.groupCode),
        },
      },
      include: {
        surgeries: {
          include: {
            followUps: {
              include: {
                responses: true,
              },
              orderBy: {
                dayNumber: 'asc',
              },
            },
          },
        },
      },
    });

    // Extract survival data based on outcome type
    let survivalData: {
      overall: SurvivalDataPoint[];
      byGroup: Map<string, SurvivalDataPoint[]>;
    };

    let outcomeLabel: string;
    let outcomeDescription: string;

    switch (outcome) {
      case 'complication':
        survivalData = extractTimeToComplication(patients);
        outcomeLabel = 'Tempo até Primeira Complicação';
        outcomeDescription = 'Dias desde a cirurgia até a primeira complicação detectada (risco alto/crítico)';
        break;

      case 'pain_resolution':
        survivalData = extractTimeToPainResolution(patients, 3);
        outcomeLabel = 'Tempo até Resolução da Dor';
        outcomeDescription = 'Dias desde a cirurgia até dor < 3 na escala visual analógica';
        break;

      case 'return_to_activities':
        survivalData = extractTimeToReturnToActivities(patients);
        outcomeLabel = 'Tempo até Retorno às Atividades';
        outcomeDescription = 'Dias desde a cirurgia até retorno às atividades normais (dor < 3, sem complicações)';
        break;

      default:
        return NextResponse.json(
          { success: false, error: { message: 'Tipo de desfecho inválido' } },
          { status: 400 }
        );
    }

    // Calculate Kaplan-Meier for overall and each group
    const kmOverall = calculateKaplanMeier(survivalData.overall);

    const kmByGroup: Record<string, any> = {};
    const groupLabels: Record<string, string> = {};

    research.groups.forEach(group => {
      const groupData = survivalData.byGroup.get(group.groupCode) || [];
      kmByGroup[group.groupCode] = calculateKaplanMeier(groupData);
      groupLabels[group.groupCode] = group.groupName;
    });

    // Log-rank tests for pairwise comparisons
    const logRankTests: Array<{
      group1: string;
      group2: string;
      chiSquare: number;
      pValue: number;
      significant: boolean;
    }> = [];

    const groupCodes = research.groups.map(g => g.groupCode);
    for (let i = 0; i < groupCodes.length; i++) {
      for (let j = i + 1; j < groupCodes.length; j++) {
        const code1 = groupCodes[i];
        const code2 = groupCodes[j];

        const data1 = survivalData.byGroup.get(code1) || [];
        const data2 = survivalData.byGroup.get(code2) || [];

        if (data1.length > 0 && data2.length > 0) {
          const logRank = calculateLogRankTest(data1, data2);

          logRankTests.push({
            group1: code1,
            group2: code2,
            chiSquare: logRank.chiSquare,
            pValue: logRank.pValue,
            significant: logRank.significant,
          });
        }
      }
    }

    // Cox regression (if we have covariates)
    // For now, we'll create a simple model using group as binary covariates
    let coxRegression = null;

    if (research.groups.length === 2) {
      // Binary comparison
      const [group1Code, group2Code] = groupCodes;

      const coxData: SurvivalDataPoint[] = survivalData.overall.map(d => ({
        ...d,
        covariates: [d.group === group1Code ? 0 : 1], // Reference group vs treatment group
      }));

      coxRegression = calculateCoxRegression(coxData, [`${group2Code} vs ${group1Code}`]);
    } else if (research.groups.length > 2) {
      // Multi-group - create dummy variables
      const referenceGroup = groupCodes[0];

      const coxData: SurvivalDataPoint[] = survivalData.overall.map(d => {
        // Create dummy variables for each group (except reference)
        const covariates = groupCodes.slice(1).map(code => (d.group === code ? 1 : 0));
        return { ...d, covariates };
      });

      const covariateNames = groupCodes
        .slice(1)
        .map(code => `${code} vs ${referenceGroup}`);

      coxRegression = calculateCoxRegression(coxData, covariateNames);
    }

    // Summary statistics
    const summary = {
      totalPatients: patients.length,
      totalEvents: survivalData.overall.filter(d => d.event).length,
      totalCensored: survivalData.overall.filter(d => !d.event).length,
      eventRate: survivalData.overall.length > 0
        ? (survivalData.overall.filter(d => d.event).length / survivalData.overall.length) * 100
        : 0,
      medianFollowUp: calculateMedian(survivalData.overall.map(d => d.time)),
      groupSummary: research.groups.map(group => {
        const groupData = survivalData.byGroup.get(group.groupCode) || [];
        return {
          groupCode: group.groupCode,
          groupName: group.groupName,
          n: groupData.length,
          events: groupData.filter(d => d.event).length,
          censored: groupData.filter(d => !d.event).length,
          eventRate: groupData.length > 0
            ? (groupData.filter(d => d.event).length / groupData.length) * 100
            : 0,
          medianTime: kmByGroup[group.groupCode].medianSurvival.time,
        };
      }),
    };

    return NextResponse.json({
      success: true,
      data: {
        outcome: {
          type: outcome,
          label: outcomeLabel,
          description: outcomeDescription,
        },
        summary,
        kaplanMeier: {
          overall: kmOverall,
          byGroup: kmByGroup,
          groupLabels,
        },
        logRankTests,
        coxRegression,
        interpretation: generateInterpretation(
          outcome,
          summary,
          logRankTests,
          coxRegression
        ),
      },
    });
  } catch (error) {
    console.error('Error calculating survival analysis:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Erro ao calcular análise de sobrevivência',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function generateInterpretation(
  outcome: string,
  summary: any,
  logRankTests: any[],
  coxRegression: any
): string[] {
  const interpretations: string[] = [];

  // Event rate interpretation
  interpretations.push(
    `Taxa de eventos: ${summary.eventRate.toFixed(1)}% dos pacientes (${summary.totalEvents}/${summary.totalPatients})`
  );

  // Group comparison
  if (logRankTests.length > 0) {
    const significantTests = logRankTests.filter(t => t.significant);

    if (significantTests.length > 0) {
      significantTests.forEach(test => {
        interpretations.push(
          `Diferença significativa entre Grupo ${test.group1} e Grupo ${test.group2} (p = ${test.pValue.toFixed(3)})`
        );
      });
    } else {
      interpretations.push(
        'Não foram detectadas diferenças estatisticamente significativas entre os grupos (p > 0.05)'
      );
    }
  }

  // Median survival
  summary.groupSummary.forEach((group: any) => {
    if (group.medianTime !== null) {
      interpretations.push(
        `${group.groupName}: Mediana de ${group.medianTime.toFixed(0)} dias até o evento`
      );
    } else {
      interpretations.push(
        `${group.groupName}: Mediana não alcançada (>50% dos pacientes sem evento)`
      );
    }
  });

  // Cox regression
  if (coxRegression?.coefficients) {
    coxRegression.coefficients.forEach((coef: any) => {
      if (coef.significant) {
        const direction = coef.hazardRatio > 1 ? 'maior' : 'menor';
        interpretations.push(
          `${coef.name}: Risco ${direction} de evento (HR = ${coef.hazardRatio.toFixed(2)}, IC 95% [${coef.ciLower.toFixed(2)}, ${coef.ciUpper.toFixed(2)}], p = ${coef.pValue.toFixed(3)})`
        );
      }
    });

    interpretations.push(
      `Índice de concordância: ${(coxRegression.concordanceIndex * 100).toFixed(1)}% (capacidade discriminatória do modelo)`
    );
  }

  // Clinical interpretation based on outcome type
  switch (outcome) {
    case 'complication':
      interpretations.push(
        'Interpretação clínica: Curvas de sobrevivência livre de complicações mostram a proporção de pacientes sem eventos adversos ao longo do tempo.'
      );
      break;
    case 'pain_resolution':
      interpretations.push(
        'Interpretação clínica: Curvas mostram o tempo até resolução da dor (< 3/10). Medianas menores indicam recuperação mais rápida.'
      );
      break;
    case 'return_to_activities':
      interpretations.push(
        'Interpretação clínica: Tempo até retorno às atividades normais. Curvas mais íngremes indicam recuperação mais rápida.'
      );
      break;
  }

  return interpretations;
}
