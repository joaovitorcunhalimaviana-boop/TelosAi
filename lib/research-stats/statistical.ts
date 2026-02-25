/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Statistical tests for research statistics
 * Handles t-tests, chi-square tests, ANOVA, and categorical analysis
 */

import { mean, tTest } from '@/lib/statistics';
import {
  performANOVAAnalysis,
  calculateChiSquare,
  calculateExpectedFrequencies,
  calculateFisherExact,
  interpretCramerV,
} from '@/lib/research-export-utils';
import type {
  Patient,
  GroupStats,
  TTestResult,
  StatisticalTests,
  CategoricalAnalysis,
} from './types';

/**
 * Perform t-test for comparing two groups
 */
export function performTTest(group1: number[], group2: number[]): TTestResult | null {
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
}

/**
 * Calculate statistical tests based on number of groups
 */
export function calculateStatisticalTests(
  groupStats: GroupStats[],
  patients: Patient[]
): StatisticalTests | null {
  if (groupStats.length < 2) return null;

  if (groupStats.length === 2) {
    // T-test for 2 groups
    const group1Ages = patients
      .filter((p) => p.researchGroup === groupStats[0].groupCode && p.age)
      .map((p) => p.age as number);
    const group2Ages = patients
      .filter((p) => p.researchGroup === groupStats[1].groupCode && p.age)
      .map((p) => p.age as number);

    return {
      testType: 't-test',
      ageTTest: performTTest(group1Ages, group2Ages),
    };
  }

  // ANOVA for 3+ groups
  const groupAges = groupStats.map((groupStat) =>
    patients
      .filter((p) => p.researchGroup === groupStat.groupCode && p.age)
      .map((p) => p.age as number)
  );

  const groupNames = groupStats.map((g) => `${g.groupCode}: ${g.groupName}`);
  const ageANOVA = performANOVAAnalysis(groupAges, groupNames);

  // Pain scores ANOVA (Day 7)
  const groupPainScores = groupStats.map((groupStat) => {
    return groupStat.painScores
      .filter((p) => p.day === 7)
      .map((p) => p.painLevel);
  });

  const painANOVA = groupPainScores.every((g) => g.length > 0)
    ? performANOVAAnalysis(groupPainScores, groupNames)
    : null;

  return {
    testType: 'ANOVA',
    ageANOVA,
    painANOVA,
  };
}

/**
 * Analyze sex distribution across groups
 */
export function analyzeSexDistribution(
  groupStats: GroupStats[]
): CategoricalAnalysis | null {
  const sexCategories = ['Masculino', 'Feminino', 'Outro'];
  const observed: number[][] = groupStats.map((groupStat) =>
    sexCategories.map((sex) => groupStat.sexDistribution[sex] || 0)
  );

  if (!observed.some((row) => row.some((val) => val > 0))) {
    return null;
  }

  const expected = calculateExpectedFrequencies(observed);
  const chiSquareResult = calculateChiSquare(observed, expected);

  return {
    variable: 'sex',
    label: 'Distribuicao de Sexo',
    categories: sexCategories,
    groupLabels: groupStats.map((g) => `Grupo ${g.groupCode}`),
    contingencyTable: {
      observed,
      expected,
      rowTotals: observed.map((row) => row.reduce((a, b) => a + b, 0)),
      colTotals: sexCategories.map((_, j) =>
        observed.reduce((sum, row) => sum + row[j], 0)
      ),
      total: observed.flat().reduce((a, b) => a + b, 0),
    },
    chiSquareTest: chiSquareResult,
    fisherExactTest:
      observed.length === 2 && observed[0].length === 2
        ? calculateFisherExact(observed)
        : null,
    interpretation: `${chiSquareResult.significant ? 'Diferenca significativa' : 'Sem diferenca significativa'} na distribuicao de sexo entre grupos (p=${chiSquareResult.pValue.toFixed(3)}). Tamanho do efeito (Cramer's V): ${interpretCramerV(chiSquareResult.cramerV, chiSquareResult.degreesOfFreedom)}.`,
  };
}

/**
 * Analyze complications across groups
 */
export function analyzeComplications(
  groupStats: GroupStats[]
): CategoricalAnalysis | null {
  const observed: number[][] = groupStats.map((groupStat) => {
    const withComplications = Math.round(
      (groupStat.complicationRate / 100) * groupStat.patientCount
    );
    const withoutComplications = groupStat.patientCount - withComplications;
    return [withComplications, withoutComplications];
  });

  if (!observed.some((row) => row.some((val) => val > 0))) {
    return null;
  }

  const expected = calculateExpectedFrequencies(observed);
  const chiSquareResult = calculateChiSquare(observed, expected);

  return {
    variable: 'complications',
    label: 'Presenca de Complicacoes',
    categories: ['Com Complicacoes', 'Sem Complicacoes'],
    groupLabels: groupStats.map((g) => `Grupo ${g.groupCode}`),
    contingencyTable: {
      observed,
      expected,
      rowTotals: observed.map((row) => row.reduce((a, b) => a + b, 0)),
      colTotals: ['Com Complicacoes', 'Sem Complicacoes'].map((_, j) =>
        observed.reduce((sum, row) => sum + row[j], 0)
      ),
      total: observed.flat().reduce((a, b) => a + b, 0),
    },
    chiSquareTest: chiSquareResult,
    fisherExactTest:
      observed.length === 2 && observed[0].length === 2
        ? calculateFisherExact(observed)
        : null,
    interpretation: `${chiSquareResult.significant ? 'Diferença significativa' : 'Sem diferença significativa'} na taxa de complicações entre grupos (p=${chiSquareResult.pValue.toFixed(3)}). ${chiSquareResult.useFisherExact ? 'Recomenda-se usar Teste Exato de Fisher devido ao tamanho amostral pequeno.' : ''}`,
  };
}

/**
 * Analyze comorbidities across groups
 */
export function analyzeComorbidities(
  groupStats: GroupStats[]
): CategoricalAnalysis[] {
  const results: CategoricalAnalysis[] = [];

  const uniqueComorbidities = Array.from(
    new Set(groupStats.flatMap((g) => Object.keys(g.comorbidities)))
  );

  uniqueComorbidities.forEach((comorbidity) => {
    const observed: number[][] = groupStats.map((groupStat) => {
      const withComorb = groupStat.comorbidities[comorbidity] || 0;
      const withoutComorb = groupStat.patientCount - withComorb;
      return [withComorb, withoutComorb];
    });

    if (!observed.some((row) => row.some((val) => val > 0))) {
      return;
    }

    const expected = calculateExpectedFrequencies(observed);
    const chiSquareResult = calculateChiSquare(observed, expected);

    results.push({
      variable: `comorbidity_${comorbidity.toLowerCase().replace(/\s+/g, '_')}`,
      label: `Comorbidade: ${comorbidity}`,
      categories: ['Presente', 'Ausente'],
      groupLabels: groupStats.map((g) => `Grupo ${g.groupCode}`),
      contingencyTable: {
        observed,
        expected,
        rowTotals: observed.map((row) => row.reduce((a, b) => a + b, 0)),
        colTotals: ['Presente', 'Ausente'].map((_, j) =>
          observed.reduce((sum, row) => sum + row[j], 0)
        ),
        total: observed.flat().reduce((a, b) => a + b, 0),
      },
      chiSquareTest: chiSquareResult,
      fisherExactTest:
        observed.length === 2 && observed[0].length === 2
          ? calculateFisherExact(observed)
          : null,
      interpretation: `${chiSquareResult.significant ? 'Diferenca significativa' : 'Sem diferenca significativa'} na prevalencia de ${comorbidity} entre grupos (p=${chiSquareResult.pValue.toFixed(3)}).`,
    });
  });

  return results;
}

/**
 * Analyze anesthesia types across groups
 */
export function analyzeAnesthesiaTypes(
  groupStats: GroupStats[],
  patients: Patient[]
): CategoricalAnalysis | null {
  const anesthesiaTypes = Array.from(
    new Set(
      patients
        .flatMap((p) => p.surgeries)
        .map((s) => s.anesthesia?.type)
        .filter((type): type is string => type != null)
    )
  );

  if (anesthesiaTypes.length === 0) {
    return null;
  }

  const observed: number[][] = groupStats.map((groupStat) => {
    const groupPatients = patients.filter(
      (p) => p.researchGroup === groupStat.groupCode
    );
    return anesthesiaTypes.map(
      (type) =>
        groupPatients
          .flatMap((p) => p.surgeries)
          .filter((s) => s.anesthesia?.type === type).length
    );
  });

  if (!observed.some((row) => row.some((val) => val > 0))) {
    return null;
  }

  const expected = calculateExpectedFrequencies(observed);
  const chiSquareResult = calculateChiSquare(observed, expected);

  return {
    variable: 'anesthesia_type',
    label: 'Tipo de Anestesia',
    categories: anesthesiaTypes,
    groupLabels: groupStats.map((g) => `Grupo ${g.groupCode}`),
    contingencyTable: {
      observed,
      expected,
      rowTotals: observed.map((row) => row.reduce((a, b) => a + b, 0)),
      colTotals: anesthesiaTypes.map((_, j) =>
        observed.reduce((sum, row) => sum + row[j], 0)
      ),
      total: observed.flat().reduce((a, b) => a + b, 0),
    },
    chiSquareTest: chiSquareResult,
    fisherExactTest: null,
    interpretation: `${chiSquareResult.significant ? 'Diferenca significativa' : 'Sem diferenca significativa'} na distribuicao de tipos de anestesia entre grupos (p=${chiSquareResult.pValue.toFixed(3)}).`,
  };
}

/**
 * Analyze pudendal nerve block usage across groups
 */
export function analyzePudendalBlock(
  groupStats: GroupStats[],
  patients: Patient[]
): CategoricalAnalysis | null {
  const observed: number[][] = groupStats.map((groupStat) => {
    const groupPatients = patients.filter(
      (p) => p.researchGroup === groupStat.groupCode
    );
    const withPudendo = groupPatients
      .flatMap((p) => p.surgeries)
      .filter((s) => s.anesthesia?.pudendoBlock === true).length;
    const withoutPudendo =
      groupPatients.flatMap((p) => p.surgeries).length - withPudendo;
    return [withPudendo, withoutPudendo];
  });

  if (!observed.some((row) => row.some((val) => val > 0))) {
    return null;
  }

  const expected = calculateExpectedFrequencies(observed);
  const chiSquareResult = calculateChiSquare(observed, expected);

  return {
    variable: 'pudendal_block',
    label: 'Bloqueio do Nervo Pudendo',
    categories: ['Realizado', 'Nao Realizado'],
    groupLabels: groupStats.map((g) => `Grupo ${g.groupCode}`),
    contingencyTable: {
      observed,
      expected,
      rowTotals: observed.map((row) => row.reduce((a, b) => a + b, 0)),
      colTotals: ['Realizado', 'Nao Realizado'].map((_, j) =>
        observed.reduce((sum, row) => sum + row[j], 0)
      ),
      total: observed.flat().reduce((a, b) => a + b, 0),
    },
    chiSquareTest: chiSquareResult,
    fisherExactTest:
      observed.length === 2 && observed[0].length === 2
        ? calculateFisherExact(observed)
        : null,
    interpretation: `${chiSquareResult.significant ? 'Diferenca significativa' : 'Sem diferenca significativa'} no uso de bloqueio do nervo pudendo entre grupos (p=${chiSquareResult.pValue.toFixed(3)}).`,
  };
}

/**
 * Perform all categorical analyses
 */
export function performCategoricalAnalysis(
  groupStats: GroupStats[],
  patients: Patient[]
): CategoricalAnalysis[] {
  if (groupStats.length < 2) return [];

  const analyses: CategoricalAnalysis[] = [];

  // Sex distribution
  const sexAnalysis = analyzeSexDistribution(groupStats);
  if (sexAnalysis) analyses.push(sexAnalysis);

  // Complications
  const complicationsAnalysis = analyzeComplications(groupStats);
  if (complicationsAnalysis) analyses.push(complicationsAnalysis);

  // Comorbidities
  const comorbidityAnalyses = analyzeComorbidities(groupStats);
  analyses.push(...comorbidityAnalyses);

  // Anesthesia types
  const anesthesiaAnalysis = analyzeAnesthesiaTypes(groupStats, patients);
  if (anesthesiaAnalysis) analyses.push(anesthesiaAnalysis);

  // Pudendal block
  const pudendalAnalysis = analyzePudendalBlock(groupStats, patients);
  if (pudendalAnalysis) analyses.push(pudendalAnalysis);

  return analyses;
}
