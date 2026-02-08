/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildErrorResponse } from '@/lib/api-utils';
import {
  performANOVAAnalysis,
  calculateChiSquare,
  calculateExpectedFrequencies,
  calculateFisherExact,
  interpretCramerV,
} from '@/lib/research-export-utils';
import { auth } from '@/lib/auth';
import {
  mean,
  standardDeviation,
  tTest,
  chiSquareTest,
  anovaOneWay,
  median,
  min,
  max
} from '@/lib/statistics';

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
    const patients = await prisma.patient.findMany({
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

    // Calculate statistics by group
    const groupStats = research.groups.map((group) => {
      const groupPatients = patients.filter(
        (p) => p.researchGroup === group.groupCode
      );

      // Demographics
      const ages = groupPatients
        .filter((p) => p.age !== null)
        .map((p) => p.age as number);
      const avgAge = ages.length > 0 ? mean(ages) : 0;

      const sexDistribution = groupPatients.reduce(
        (acc, p) => {
          const sex = p.sex || 'Não informado';
          acc[sex] = (acc[sex] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Surgery types
      const surgeryTypes = groupPatients
        .flatMap((p) => p.surgeries)
        .reduce(
          (acc, s) => {
            acc[s.type] = (acc[s.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

      // Data completeness
      const completeness = groupPatients
        .flatMap((p) => p.surgeries)
        .map((s) => s.dataCompleteness);
      const avgCompleteness = completeness.length > 0 ? mean(completeness) : 0;

      // Comorbidities
      const comorbidities = groupPatients
        .flatMap((p) => p.comorbidities)
        .reduce(
          (acc, c) => {
            const name = c.comorbidity.name;
            acc[name] = (acc[name] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

      // Medications
      const medications = groupPatients
        .flatMap((p) => p.medications)
        .reduce(
          (acc, m) => {
            const name = m.medication.name;
            acc[name] = (acc[name] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

      // Follow-up response rates
      const followUps = groupPatients.flatMap((p) =>
        p.surgeries.flatMap((s) => s.followUps)
      );
      const totalFollowUps = followUps.length;
      const respondedFollowUps = followUps.filter(
        (f) => f.status === 'responded'
      ).length;
      const responseRate =
        totalFollowUps > 0 ? (respondedFollowUps / totalFollowUps) * 100 : 0;

      // Pain scores over time
      const painScores = followUps
        .filter((f) => f.status === 'responded')
        .flatMap((f) => f.responses)
        .map((r) => {
          try {
            const data = JSON.parse(r.questionnaireData);
            return {
              day: followUps.find((f) =>
                f.responses.some((resp) => resp.id === r.id)
              )?.dayNumber || 0,
              painLevel: data.painLevel || 0,
            };
          } catch {
            return null;
          }
        })
        .filter((p) => p !== null);

      // Complications
      const complications = followUps
        .flatMap((f) => f.responses)
        .map((r) => {
          try {
            const flags = JSON.parse(r.redFlags || '[]');
            return flags;
          } catch {
            return [];
          }
        })
        .flat();

      const complicationRate =
        followUps.length > 0 ? (complications.length / followUps.length) * 100 : 0;

      return {
        groupCode: group.groupCode,
        groupName: group.groupName,
        patientCount: groupPatients.length,
        avgAge: Math.round(avgAge * 10) / 10,
        ageRange: ages.length > 0 ? [Math.min(...ages), Math.max(...ages)] : [0, 0],
        sexDistribution,
        surgeryTypes,
        avgCompleteness: Math.round(avgCompleteness),
        comorbidities,
        medications,
        responseRate: Math.round(responseRate * 10) / 10,
        painScores,
        complicationRate: Math.round(complicationRate * 10) / 10,
        totalFollowUps,
        respondedFollowUps,
      };
    });

    // Overall statistics
    const totalPatients = patients.length;
    const allAges = patients.filter((p) => p.age !== null).map((p) => p.age as number);
    const overallAvgAge = allAges.length > 0 ? mean(allAges) : 0;

    const overallSexDistribution = patients.reduce(
      (acc, p) => {
        const sex = p.sex || 'Não informado';
        acc[sex] = (acc[sex] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const allSurgeries = patients.flatMap((p) => p.surgeries);
    const overallCompleteness =
      allSurgeries.length > 0
        ? mean(allSurgeries.map((s) => s.dataCompleteness))
        : 0;



    // T-test for continuous variables using library function
    const performTTest = (group1: number[], group2: number[]) => {
      if (group1.length === 0 || group2.length === 0) return null;

      const result = tTest(group1, group2);
      const mean1 = mean(group1);
      const mean2 = mean(group2);

      return {
        tStatistic: Math.round(result.tStatistic * 1000) / 1000,
        pValue: result.pValue,
        degreesOfFreedom: result.degreesOfFreedom,
        significant: result.significant,
        mean1: Math.round(mean1 * 10) / 10,
        mean2: Math.round(mean2 * 10) / 10,
        difference: Math.round((mean1 - mean2) * 10) / 10,
      };
    };

    // Statistical comparisons
    let statisticalTests = null;

    if (groupStats.length === 2) {
      // T-test for 2 groups
      const group1Ages = patients
        .filter((p) => p.researchGroup === groupStats[0].groupCode && p.age)
        .map((p) => p.age as number);
      const group2Ages = patients
        .filter((p) => p.researchGroup === groupStats[1].groupCode && p.age)
        .map((p) => p.age as number);

      statisticalTests = {
        testType: 't-test',
        ageTTest: performTTest(group1Ages, group2Ages),
      };
    } else if (groupStats.length >= 3) {
      // ANOVA for 3+ groups
      const groupAges = groupStats.map((groupStat) =>
        patients
          .filter((p) => p.researchGroup === groupStat.groupCode && p.age)
          .map((p) => p.age as number)
      );

      const groupNames = groupStats.map((g) => `${g.groupCode}: ${g.groupName}`);

      // Age ANOVA
      const ageANOVA = performANOVAAnalysis(groupAges, groupNames);

      // Pain scores ANOVA (Day 7)
      const groupPainScores = groupStats.map((groupStat) => {
        const painScores = groupStat.painScores
          .filter((p) => p.day === 7)
          .map((p) => p.painLevel);
        return painScores;
      });

      const painANOVA = groupPainScores.every(g => g.length > 0)
        ? performANOVAAnalysis(groupPainScores, groupNames)
        : null;

      statisticalTests = {
        testType: 'ANOVA',
        ageANOVA,
        painANOVA,
      };
    }

    // ============================================
    // CATEGORICAL DATA ANALYSIS (Chi-square tests)
    // ============================================

    const categoricalAnalysis: any[] = [];

    if (groupStats.length >= 2) {
      // 1. SEX DISTRIBUTION
      const sexCategories = ['Masculino', 'Feminino', 'Outro'];
      const sexObserved: number[][] = groupStats.map(groupStat => {
        return sexCategories.map(sex => groupStat.sexDistribution[sex] || 0);
      });

      if (sexObserved.some(row => row.some(val => val > 0))) {
        const sexExpected = calculateExpectedFrequencies(sexObserved);
        const sexChiSquare = calculateChiSquare(sexObserved, sexExpected);

        categoricalAnalysis.push({
          variable: 'sex',
          label: 'Distribuição de Sexo',
          categories: sexCategories,
          groupLabels: groupStats.map(g => `Grupo ${g.groupCode}`),
          contingencyTable: {
            observed: sexObserved,
            expected: sexExpected,
            rowTotals: sexObserved.map(row => row.reduce((a, b) => a + b, 0)),
            colTotals: sexCategories.map((_, j) => sexObserved.reduce((sum, row) => sum + row[j], 0)),
            total: sexObserved.flat().reduce((a, b) => a + b, 0),
          },
          chiSquareTest: sexChiSquare,
          fisherExactTest: (sexObserved.length === 2 && sexObserved[0].length === 2)
            ? calculateFisherExact(sexObserved)
            : null,
          interpretation: `${sexChiSquare.significant ? 'Diferença significativa' : 'Sem diferença significativa'} na distribuição de sexo entre grupos (p=${sexChiSquare.pValue.toFixed(3)}). Tamanho do efeito (Cramér's V): ${interpretCramerV(sexChiSquare.cramerV, sexChiSquare.degreesOfFreedom)}.`,
        });
      }

      // 2. COMPLICATIONS (Yes/No)
      const complicationsObserved: number[][] = groupStats.map(groupStat => {
        const withComplications = Math.round((groupStat.complicationRate / 100) * groupStat.patientCount);
        const withoutComplications = groupStat.patientCount - withComplications;
        return [withComplications, withoutComplications];
      });

      if (complicationsObserved.some(row => row.some(val => val > 0))) {
        const complicationsExpected = calculateExpectedFrequencies(complicationsObserved);
        const complicationsChiSquare = calculateChiSquare(complicationsObserved, complicationsExpected);

        categoricalAnalysis.push({
          variable: 'complications',
          label: 'Presença de Complicações',
          categories: ['Com Complicações', 'Sem Complicações'],
          groupLabels: groupStats.map(g => `Grupo ${g.groupCode}`),
          contingencyTable: {
            observed: complicationsObserved,
            expected: complicationsExpected,
            rowTotals: complicationsObserved.map(row => row.reduce((a, b) => a + b, 0)),
            colTotals: ['Com Complicações', 'Sem Complicações'].map((_, j) =>
              complicationsObserved.reduce((sum, row) => sum + row[j], 0)
            ),
            total: complicationsObserved.flat().reduce((a, b) => a + b, 0),
          },
          chiSquareTest: complicationsChiSquare,
          fisherExactTest: (complicationsObserved.length === 2 && complicationsObserved[0].length === 2)
            ? calculateFisherExact(complicationsObserved)
            : null,
          interpretation: `${complicationsChiSquare.significant ? 'Diferença significativa' : 'Sem diferença significativa'} na taxa de complicações entre grupos (p=${complicationsChiSquare.pValue.toFixed(3)}). ${complicationsChiSquare.useFisherExact ? 'Recomenda-se usar Teste Exato de Fisher devido ao tamanho amostral pequeno.' : ''}`,
        });
      }

      // 3. COMORBIDITIES (Present/Absent)
      const uniqueComorbidities = Array.from(
        new Set(
          groupStats.flatMap(g => Object.keys(g.comorbidities))
        )
      );

      uniqueComorbidities.forEach(comorbidity => {
        const comorbidityObserved: number[][] = groupStats.map(groupStat => {
          const withComorb = groupStat.comorbidities[comorbidity] || 0;
          const withoutComorb = groupStat.patientCount - withComorb;
          return [withComorb, withoutComorb];
        });

        if (comorbidityObserved.some(row => row.some(val => val > 0))) {
          const comorbidityExpected = calculateExpectedFrequencies(comorbidityObserved);
          const comorbidityChiSquare = calculateChiSquare(comorbidityObserved, comorbidityExpected);

          categoricalAnalysis.push({
            variable: `comorbidity_${comorbidity.toLowerCase().replace(/\s+/g, '_')}`,
            label: `Comorbidade: ${comorbidity}`,
            categories: ['Presente', 'Ausente'],
            groupLabels: groupStats.map(g => `Grupo ${g.groupCode}`),
            contingencyTable: {
              observed: comorbidityObserved,
              expected: comorbidityExpected,
              rowTotals: comorbidityObserved.map(row => row.reduce((a, b) => a + b, 0)),
              colTotals: ['Presente', 'Ausente'].map((_, j) =>
                comorbidityObserved.reduce((sum, row) => sum + row[j], 0)
              ),
              total: comorbidityObserved.flat().reduce((a, b) => a + b, 0),
            },
            chiSquareTest: comorbidityChiSquare,
            fisherExactTest: (comorbidityObserved.length === 2 && comorbidityObserved[0].length === 2)
              ? calculateFisherExact(comorbidityObserved)
              : null,
            interpretation: `${comorbidityChiSquare.significant ? 'Diferença significativa' : 'Sem diferença significativa'} na prevalência de ${comorbidity} entre grupos (p=${comorbidityChiSquare.pValue.toFixed(3)}).`,
          });
        }
      });

      // 4. ANESTHESIA TYPE
      const anesthesiaTypes = Array.from(
        new Set(
          patients
            .flatMap(p => p.surgeries)
            .map(s => s.anesthesia?.type)
            .filter(type => type != null)
        )
      ) as string[];

      if (anesthesiaTypes.length > 0) {
        const anesthesiaObserved: number[][] = groupStats.map(groupStat => {
          const groupPatients = patients.filter(p => p.researchGroup === groupStat.groupCode);
          return anesthesiaTypes.map(type =>
            groupPatients
              .flatMap(p => p.surgeries)
              .filter(s => s.anesthesia?.type === type).length
          );
        });

        if (anesthesiaObserved.some(row => row.some(val => val > 0))) {
          const anesthesiaExpected = calculateExpectedFrequencies(anesthesiaObserved);
          const anesthesiaChiSquare = calculateChiSquare(anesthesiaObserved, anesthesiaExpected);

          categoricalAnalysis.push({
            variable: 'anesthesia_type',
            label: 'Tipo de Anestesia',
            categories: anesthesiaTypes,
            groupLabels: groupStats.map(g => `Grupo ${g.groupCode}`),
            contingencyTable: {
              observed: anesthesiaObserved,
              expected: anesthesiaExpected,
              rowTotals: anesthesiaObserved.map(row => row.reduce((a, b) => a + b, 0)),
              colTotals: anesthesiaTypes.map((_, j) => anesthesiaObserved.reduce((sum, row) => sum + row[j], 0)),
              total: anesthesiaObserved.flat().reduce((a, b) => a + b, 0),
            },
            chiSquareTest: anesthesiaChiSquare,
            fisherExactTest: null,
            interpretation: `${anesthesiaChiSquare.significant ? 'Diferença significativa' : 'Sem diferença significativa'} na distribuição de tipos de anestesia entre grupos (p=${anesthesiaChiSquare.pValue.toFixed(3)}).`,
          });
        }
      }

      // 5. PUDENDAL NERVE BLOCK (Yes/No)
      const pudendoObserved: number[][] = groupStats.map(groupStat => {
        const groupPatients = patients.filter(p => p.researchGroup === groupStat.groupCode);
        const withPudendo = groupPatients
          .flatMap(p => p.surgeries)
          .filter(s => s.anesthesia?.pudendoBlock === true).length;
        const withoutPudendo = groupPatients.flatMap(p => p.surgeries).length - withPudendo;
        return [withPudendo, withoutPudendo];
      });

      if (pudendoObserved.some(row => row.some(val => val > 0))) {
        const pudendoExpected = calculateExpectedFrequencies(pudendoObserved);
        const pudendoChiSquare = calculateChiSquare(pudendoObserved, pudendoExpected);

        categoricalAnalysis.push({
          variable: 'pudendal_block',
          label: 'Bloqueio do Nervo Pudendo',
          categories: ['Realizado', 'Não Realizado'],
          groupLabels: groupStats.map(g => `Grupo ${g.groupCode}`),
          contingencyTable: {
            observed: pudendoObserved,
            expected: pudendoExpected,
            rowTotals: pudendoObserved.map(row => row.reduce((a, b) => a + b, 0)),
            colTotals: ['Realizado', 'Não Realizado'].map((_, j) =>
              pudendoObserved.reduce((sum, row) => sum + row[j], 0)
            ),
            total: pudendoObserved.flat().reduce((a, b) => a + b, 0),
          },
          chiSquareTest: pudendoChiSquare,
          fisherExactTest: (pudendoObserved.length === 2 && pudendoObserved[0].length === 2)
            ? calculateFisherExact(pudendoObserved)
            : null,
          interpretation: `${pudendoChiSquare.significant ? 'Diferença significativa' : 'Sem diferença significativa'} no uso de bloqueio do nervo pudendo entre grupos (p=${pudendoChiSquare.pValue.toFixed(3)}).`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        research: {
          id: research.id,
          title: research.title,
          description: research.description,
          surgeryType: research.surgeryType,
          isActive: research.isActive,
          startDate: research.startDate,
          endDate: research.endDate,
        },
        overview: {
          totalPatients,
          avgAge: Math.round(overallAvgAge * 10) / 10,
          sexDistribution: overallSexDistribution,
          dataCompleteness: Math.round(overallCompleteness),
          totalGroups: research.groups.length,
        },
        groups: groupStats,
        statisticalTests,
        categoricalAnalysis,
      },
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
