/**
 * Wrapper para funções estatísticas usando simple-statistics
 * Substitui os cálculos manuais em research-export-utils.ts
 */

import * as ss from 'simple-statistics';

export interface ChiSquareResult {
  chiSquare: number;
  pValue: number;
  degreesOfFreedom: number;
  significant: boolean;
}

export interface ANOVAResult {
  fStatistic: number;
  pValue: number;
  significant: boolean;
}

/**
 * Calcula média
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return ss.mean(values);
}

/**
 * Calcula desvio padrão
 */
export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  return ss.standardDeviation(values);
}

/**
 * Calcula mediana
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  return ss.median(values);
}

/**
 * Calcula valor mínimo
 */
export function min(values: number[]): number {
  if (values.length === 0) return 0;
  return ss.min(values);
}

/**
 * Calcula valor máximo
 */
export function max(values: number[]): number {
  if (values.length === 0) return 0;
  return ss.max(values);
}

/**
 * T-test para duas amostras independentes
 */
export function tTest(group1: number[], group2: number[]): {
  tStatistic: number;
  pValue: number;
  degreesOfFreedom: number;
  significant: boolean;
} {
  if (group1.length < 2 || group2.length < 2) {
    return { tStatistic: 0, pValue: 1, degreesOfFreedom: 0, significant: false };
  }

  const tStatisticResult = ss.tTestTwoSample(group1, group2);
  // tTestTwoSample pode retornar null se os arrays forem vazios ou inválidos
  const tStatistic = tStatisticResult ?? 0;

  // Aproximação do p-value usando distribuição t
  const df = group1.length + group2.length - 2;
  const pValue = approximateTTestPValue(Math.abs(tStatistic), df);

  return {
    tStatistic,
    pValue,
    degreesOfFreedom: df,
    significant: pValue < 0.05
  };
}

/**
 * Aproximação de p-value para t-test
 */
function approximateTTestPValue(t: number, df: number): number {
  // Usando aproximação normal para df > 30
  if (df > 30) {
    const z = t;
    return 2 * (1 - normalCDF(Math.abs(z)));
  }
  // Valores críticos aproximados para df menores
  if (t > 3.5) return 0.001;
  if (t > 2.5) return 0.02;
  if (t > 2.0) return 0.05;
  if (t > 1.7) return 0.10;
  return 0.20;
}

/**
 * CDF da distribuição normal padrão
 */
function normalCDF(x: number): number {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Calcula chi-square para tabela de contingência 2x2
 */
export function chiSquareTest(observed: number[][]): ChiSquareResult {
  const total = observed.flat().reduce((a, b) => a + b, 0);
  if (total === 0) {
    return { chiSquare: 0, pValue: 1, degreesOfFreedom: 1, significant: false };
  }

  const rowTotals = observed.map(row => row.reduce((a, b) => a + b, 0));
  const colTotals = observed[0].map((_, i) => observed.reduce((sum, row) => sum + row[i], 0));

  let chiSquare = 0;
  for (let i = 0; i < observed.length; i++) {
    for (let j = 0; j < observed[i].length; j++) {
      const expected = (rowTotals[i] * colTotals[j]) / total;
      if (expected > 0) {
        chiSquare += Math.pow(observed[i][j] - expected, 2) / expected;
      }
    }
  }

  const df = (observed.length - 1) * (observed[0].length - 1);
  const pValue = chiSquarePValue(chiSquare, df);

  return {
    chiSquare,
    pValue,
    degreesOfFreedom: df,
    significant: pValue < 0.05
  };
}

/**
 * Aproximação de p-value para chi-square
 */
function chiSquarePValue(chiSquare: number, df: number): number {
  if (chiSquare <= 0) return 1;
  if (df === 1) {
    if (chiSquare > 10.83) return 0.001;
    if (chiSquare > 6.63) return 0.01;
    if (chiSquare > 3.84) return 0.05;
    if (chiSquare > 2.71) return 0.10;
    return 0.20;
  }
  // Para df > 1, usar aproximação
  const z = Math.pow(chiSquare / df, 1/3) - (1 - 2/(9*df));
  return 1 - normalCDF(z * Math.sqrt(9*df/2));
}

/**
 * ANOVA one-way
 */
export function anovaOneWay(groups: number[][]): ANOVAResult {
  const validGroups = groups.filter(g => g.length > 0);
  if (validGroups.length < 2) {
    return { fStatistic: 0, pValue: 1, significant: false };
  }

  const allValues = validGroups.flat();
  const grandMean = mean(allValues);
  const k = validGroups.length;
  const n = allValues.length;

  // Between-group sum of squares
  let ssBetween = 0;
  for (const group of validGroups) {
    const groupMean = mean(group);
    ssBetween += group.length * Math.pow(groupMean - grandMean, 2);
  }

  // Within-group sum of squares
  let ssWithin = 0;
  for (const group of validGroups) {
    const groupMean = mean(group);
    for (const value of group) {
      ssWithin += Math.pow(value - groupMean, 2);
    }
  }

  const dfBetween = k - 1;
  const dfWithin = n - k;

  if (dfWithin <= 0 || ssWithin === 0) {
    return { fStatistic: 0, pValue: 1, significant: false };
  }

  const msBetween = ssBetween / dfBetween;
  const msWithin = ssWithin / dfWithin;
  const fStatistic = msBetween / msWithin;

  // Aproximação do p-value
  const pValue = fTestPValue(fStatistic, dfBetween, dfWithin);

  return {
    fStatistic,
    pValue,
    significant: pValue < 0.05
  };
}

/**
 * Aproximação de p-value para F-test
 */
function fTestPValue(f: number, df1: number, df2: number): number {
  if (f <= 0) return 1;
  // Valores críticos aproximados
  if (f > 10) return 0.001;
  if (f > 5) return 0.01;
  if (f > 3) return 0.05;
  if (f > 2) return 0.10;
  return 0.20;
}
