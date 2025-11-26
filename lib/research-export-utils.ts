// Utilitários para exportação de dados de pesquisa científica
import * as XLSX from 'xlsx';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ResearchInfo {
  id: string;
  title: string;
  description: string;
  surgeryType: string | null;
  startDate: Date;
  endDate: Date | null;
  totalPatients: number;
}

export interface ResearchGroupInfo {
  id: string;
  groupCode: string;
  groupName: string;
  description: string;
  patientCount: number;
}

export interface ComorbidityData {
  name: string;
  category: string;
  details: string | null;
  severity: string | null;
}

export interface MedicationData {
  name: string;
  category: string | null;
  dose: string | null;
  frequency: string | null;
  route: string | null;
}

export interface FollowUpResponseData {
  questionnaireData: string;
  aiAnalysis?: string | null;
  aiResponse?: string | null;
  riskLevel: string;
  redFlags: string | null;
  doctorAlerted: boolean;
  alertSentAt: Date | null;
}

export interface FollowUpData {
  dayNumber: number;
  scheduledDate: Date;
  status: string;
  sentAt: Date | null;
  respondedAt: Date | null;
  responses: FollowUpResponseData[];
}

export interface SurgeryData {
  id: string;
  type: string;
  date: Date;
  hospital: string | null;
  durationMinutes: number | null;
  details?: any;
  preOp?: any;
  anesthesia?: any;
  postOp?: any;
  followUps: FollowUpData[];
}

export interface PatientData {
  // ✅ LGPD: ID pseudônimo determinístico (hash SHA-256)
  // Permite re-identificação COM acesso ao banco, mas não com apenas o ID
  // Conforme Art. 13, § 3º da LGPD (pseudonimização para pesquisa)
  pseudonymousId: string;
  // ❌ LGPD: Removido 'name' (informação pessoal identificável)
  // ❌ LGPD: Removido 'dateOfBirth' (informação pessoal identificável)
  // ❌ LGPD: Removido 'phone' (informação pessoal identificável)
  age?: number | null;
  sex?: string | null;
  researchGroup: string | null;
  researchNotes: string | null;
  comorbidities: ComorbidityData[];
  medications: MedicationData[];
  surgeries: SurgeryData[];
}

export interface ResearchExportData {
  research: ResearchInfo;
  groups: ResearchGroupInfo[];
  patients: PatientData[];
}

export interface ResearchExportOptions {
  researchId: string;
  groupIds: string[];
  fields: {
    dadosBasicos: boolean;
    dadosCirurgicos: boolean;
    comorbidades: boolean;
    medicacoes: boolean;
    followUps: boolean;
    respostasQuestionarios: boolean;
    analiseIA: boolean;
  };
  exportType: 'individual' | 'comparative' | 'statistical' | 'timeline';
  format: 'xlsx' | 'csv' | 'pdf';
  dateRange?: {
    startDate?: string;
    endDate?: string;
  } | null;
  sendEmail?: boolean;
  emailAddress?: string | null;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }

  return age;
}

function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;

  return Math.sqrt(variance);
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

function parseQuestionnaireData(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch {
    return {};
  }
}

function parseRedFlags(jsonString: string | null): string[] {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
}

// ============================================
// CHI-SQUARE TESTS FOR CATEGORICAL DATA
// ============================================

export interface ChiSquareResult {
  chiSquare: number;
  degreesOfFreedom: number;
  pValue: number;
  cramerV: number;
  significant: boolean;
  contingencyTable: {
    observed: number[][];
    expected: number[][];
    standardizedResiduals: number[][];
  };
  cellsWithLowCount: number; // Cells with expected count < 5
  useFisherExact: boolean; // Recommend Fisher's exact test for small samples
}

export interface FisherExactResult {
  pValue: number;
  oddsRatio: number;
  significant: boolean;
}

/**
 * Calculate Chi-square statistic for categorical data comparison
 * @param observed 2D array of observed frequencies
 * @param expected 2D array of expected frequencies
 * @returns Chi-square statistic and related metrics
 */
export function calculateChiSquare(
  observed: number[][],
  expected: number[][]
): ChiSquareResult {
  if (observed.length === 0 || observed[0].length === 0) {
    throw new Error('Observed frequencies cannot be empty');
  }

  if (observed.length !== expected.length || observed[0].length !== expected[0].length) {
    throw new Error('Observed and expected arrays must have the same dimensions');
  }

  const rows = observed.length;
  const cols = observed[0].length;

  // Calculate chi-square statistic
  let chiSquare = 0;
  let cellsWithLowCount = 0;
  const standardizedResiduals: number[][] = [];

  for (let i = 0; i < rows; i++) {
    standardizedResiduals[i] = [];
    for (let j = 0; j < cols; j++) {
      const obs = observed[i][j];
      const exp = expected[i][j];

      if (exp < 5) {
        cellsWithLowCount++;
      }

      if (exp > 0) {
        // Chi-square contribution
        chiSquare += Math.pow(obs - exp, 2) / exp;

        // Standardized residual (for identifying significant cells)
        standardizedResiduals[i][j] = (obs - exp) / Math.sqrt(exp);
      } else {
        standardizedResiduals[i][j] = 0;
      }
    }
  }

  // Degrees of freedom
  const degreesOfFreedom = (rows - 1) * (cols - 1);

  // Approximate p-value using chi-square distribution
  // For simplicity, using a lookup table for common critical values
  const pValue = approximateChiSquarePValue(chiSquare, degreesOfFreedom);

  // Calculate Cramér's V (effect size)
  const totalN = observed.flat().reduce((a, b) => a + b, 0);
  const minDim = Math.min(rows - 1, cols - 1);
  const cramerV = Math.sqrt(chiSquare / (totalN * minDim));

  // Determine if Fisher's exact test should be used
  const useFisherExact = cellsWithLowCount > 0 || totalN < 20;

  return {
    chiSquare: Math.round(chiSquare * 1000) / 1000,
    degreesOfFreedom,
    pValue,
    cramerV: Math.round(cramerV * 1000) / 1000,
    significant: pValue < 0.05,
    contingencyTable: {
      observed,
      expected,
      standardizedResiduals,
    },
    cellsWithLowCount,
    useFisherExact,
  };
}

/**
 * Calculate expected frequencies from observed data
 * @param observed 2D array of observed frequencies
 * @returns 2D array of expected frequencies
 */
export function calculateExpectedFrequencies(observed: number[][]): number[][] {
  const rows = observed.length;
  const cols = observed[0].length;

  // Calculate row and column totals
  const rowTotals = observed.map(row => row.reduce((a, b) => a + b, 0));
  const colTotals: number[] = [];
  for (let j = 0; j < cols; j++) {
    colTotals[j] = 0;
    for (let i = 0; i < rows; i++) {
      colTotals[j] += observed[i][j];
    }
  }

  const total = rowTotals.reduce((a, b) => a + b, 0);

  // Calculate expected frequencies
  const expected: number[][] = [];
  for (let i = 0; i < rows; i++) {
    expected[i] = [];
    for (let j = 0; j < cols; j++) {
      expected[i][j] = (rowTotals[i] * colTotals[j]) / total;
    }
  }

  return expected;
}

/**
 * Approximate chi-square p-value (simplified for common cases)
 * For production, consider using a proper statistical library
 */
function approximateChiSquarePValue(chiSquare: number, df: number): number {
  // Critical values for common degrees of freedom at α = 0.05, 0.01, 0.001
  const criticalValues: { [key: number]: number[] } = {
    1: [3.841, 6.635, 10.828],
    2: [5.991, 9.210, 13.816],
    3: [7.815, 11.345, 16.266],
    4: [9.488, 13.277, 18.467],
    5: [11.070, 15.086, 20.515],
    6: [12.592, 16.812, 22.458],
    8: [15.507, 20.090, 26.125],
    10: [18.307, 23.209, 29.588],
  };

  if (df in criticalValues) {
    const [cv05, cv01, cv001] = criticalValues[df];
    if (chiSquare < cv05) return 0.10; // p > 0.05
    if (chiSquare < cv01) return 0.03; // 0.01 < p < 0.05
    if (chiSquare < cv001) return 0.005; // 0.001 < p < 0.01
    return 0.0005; // p < 0.001
  }

  // For other df, use a rough approximation
  if (chiSquare < df) return 0.50;
  if (chiSquare < df + 2 * Math.sqrt(2 * df)) return 0.10;
  if (chiSquare < df + 3 * Math.sqrt(2 * df)) return 0.01;
  return 0.001;
}

/**
 * Fisher's Exact Test for 2x2 contingency tables
 * Recommended when cell counts are small (< 5)
 */
export function calculateFisherExact(observed: number[][]): FisherExactResult {
  if (observed.length !== 2 || observed[0].length !== 2) {
    throw new Error('Fisher\'s exact test requires a 2x2 contingency table');
  }

  const [[a, b], [c, d]] = observed;

  // Calculate odds ratio
  const oddsRatio = (a * d) / (b * c);

  // For exact p-value calculation, we would need to enumerate all possible tables
  // For simplicity, using a hypergeometric approximation
  const n = a + b + c + d;
  const rowTotal1 = a + b;
  const colTotal1 = a + c;

  // Simplified p-value (this is an approximation)
  // In production, use a proper statistical library
  const expected = (rowTotal1 * colTotal1) / n;
  const variance = (rowTotal1 * colTotal1 * (n - rowTotal1) * (n - colTotal1)) /
                   (n * n * (n - 1));
  const z = Math.abs(a - expected) / Math.sqrt(variance);
  const pValue = 2 * (1 - normalCDF(z)); // Two-tailed

  return {
    pValue: Math.min(pValue, 1.0),
    oddsRatio: isFinite(oddsRatio) ? Math.round(oddsRatio * 1000) / 1000 : 0,
    significant: pValue < 0.05,
  };
}

/**
 * Cumulative distribution function for standard normal distribution
 */
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - probability : probability;
}

/**
 * Build contingency table from categorical data
 * @param group1Data Array of category labels for group 1
 * @param group2Data Array of category labels for group 2
 * @param categories Array of possible categories
 * @returns 2D contingency table
 */
export function buildContingencyTable(
  group1Data: string[],
  group2Data: string[],
  categories: string[]
): { observed: number[][]; rowLabels: string[]; colLabels: string[] } {
  const observed: number[][] = [[], []];

  categories.forEach(category => {
    observed[0].push(group1Data.filter(d => d === category).length);
    observed[1].push(group2Data.filter(d => d === category).length);
  });

  return {
    observed,
    rowLabels: ['Grupo 1', 'Grupo 2'],
    colLabels: categories,
  };
}

/**
 * Interpret Chi-square effect size (Cramér's V)
 */
export function interpretCramerV(cramerV: number, df: number): string {
  // Cohen's guidelines for effect size
  // For df=1: small=0.10, medium=0.30, large=0.50
  // For df=2: small=0.07, medium=0.21, large=0.35
  // For df≥3: small=0.06, medium=0.17, large=0.29

  let thresholds: { small: number; medium: number; large: number };

  if (df === 1) {
    thresholds = { small: 0.10, medium: 0.30, large: 0.50 };
  } else if (df === 2) {
    thresholds = { small: 0.07, medium: 0.21, large: 0.35 };
  } else {
    thresholds = { small: 0.06, medium: 0.17, large: 0.29 };
  }

  if (cramerV >= thresholds.large) return 'Grande';
  if (cramerV >= thresholds.medium) return 'Médio';
  if (cramerV >= thresholds.small) return 'Pequeno';
  return 'Desprezível';
}

// ============================================
// INDIVIDUAL DATA EXPORT
// ============================================

function formatIndividualData(
  data: ResearchExportData,
  options: ResearchExportOptions
): any[] {
  const rows: any[] = [];

  data.patients.forEach(patient => {
    patient.surgeries.forEach(surgery => {
      const baseRow: any = {
        // ✅ LGPD: ID pseudônimo (hash SHA-256) - permite re-identificação
        ID_Pseudonimo: patient.pseudonymousId,
        Grupo_Pesquisa: patient.researchGroup,
      };

      // Dados básicos
      if (options.fields.dadosBasicos) {
        // ❌ LGPD: Removido 'Nome' (PII)
        baseRow['Idade'] = patient.age;
        baseRow['Sexo'] = patient.sex;
      }

      // Dados cirúrgicos
      if (options.fields.dadosCirurgicos) {
        baseRow['ID_Cirurgia'] = surgery.id;
        baseRow['Tipo_Cirurgia'] = surgery.type;
        baseRow['Data_Cirurgia'] = surgery.date.toISOString().split('T')[0];
        baseRow['Hospital'] = surgery.hospital;
        baseRow['Duracao_Min'] = surgery.durationMinutes;

        if (surgery.anesthesia) {
          baseRow['Tipo_Anestesia'] = surgery.anesthesia.type;
          baseRow['Bloqueio_Pudendo'] = surgery.anesthesia.pudendoBlock ? 'Sim' : 'Não';
          if (surgery.anesthesia.pudendoBlock) {
            baseRow['Pudendo_Tecnica'] = surgery.anesthesia.pudendoTechnique;
            baseRow['Pudendo_Acesso'] = surgery.anesthesia.pudendoAccess;
            baseRow['Pudendo_Anestesico'] = surgery.anesthesia.pudendoAnesthetic;
            baseRow['Pudendo_Lateralidade'] = surgery.anesthesia.pudendoLaterality;
          }
        }

        if (surgery.preOp) {
          baseRow['Botox_Usado'] = surgery.preOp.botoxUsed ? 'Sim' : 'Não';
          if (surgery.preOp.botoxUsed) {
            baseRow['Botox_Dose_UI'] = surgery.preOp.botoxDoseUnits;
          }
          baseRow['Preparo_Intestinal'] = surgery.preOp.intestinalPrep ? 'Sim' : 'Não';
        }

        if (surgery.details) {
          baseRow['Complicacoes_Intra'] = surgery.details.complications;
          baseRow['Alta_Mesmo_Dia'] = surgery.details.sameDayDischarge ? 'Sim' : 'Não';
          baseRow['Dias_Internacao'] = surgery.details.hospitalizationDays;
        }
      }

      // Comorbidades
      if (options.fields.comorbidades) {
        baseRow['Comorbidades'] = patient.comorbidities.map(c => c.name).join('; ');
        baseRow['Num_Comorbidades'] = patient.comorbidities.length;

        // Comorbidades por categoria
        const comorbiditiesByCategory = patient.comorbidities.reduce((acc, c) => {
          acc[c.category] = (acc[c.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        Object.entries(comorbiditiesByCategory).forEach(([category, count]) => {
          baseRow[`Comorbidades_${category}`] = count;
        });
      }

      // Medicações
      if (options.fields.medicacoes) {
        baseRow['Medicacoes'] = patient.medications.map(m => m.name).join('; ');
        baseRow['Num_Medicacoes'] = patient.medications.length;
      }

      // Follow-ups
      if (options.fields.followUps) {
        const completedFollowUps = surgery.followUps.filter(f => f.status === 'responded').length;
        const totalFollowUps = surgery.followUps.length;

        baseRow['FollowUps_Completos'] = completedFollowUps;
        baseRow['FollowUps_Total'] = totalFollowUps;
        baseRow['Taxa_Adesao'] = totalFollowUps > 0
          ? `${((completedFollowUps / totalFollowUps) * 100).toFixed(1)}%`
          : '0%';
      }

      // Respostas dos questionários
      if (options.fields.respostasQuestionarios) {
        // Estrutura para capturar dados separadamente por dia
        const painAtRestByDay: { [key: number]: number | null } = {};
        const painDuringBowelByDay: { [key: number]: number | null } = {};
        const bristolByDay: { [key: number]: number | null } = {};
        let firstBowelMovementDay: number | null = null;
        let firstBowelMovementTime: string | null = null;
        let npsScore: number | null = null;
        let painControlSatisfaction: number | null = null;
        let aiFollowUpSatisfaction: number | null = null;
        let feedback: string | null = null;

        surgery.followUps.forEach(followUp => {
          if (followUp.responses.length > 0) {
            const lastResponse = followUp.responses[followUp.responses.length - 1];
            const questionnaireData = parseQuestionnaireData(lastResponse.questionnaireData);
            const extracted = questionnaireData.extractedData || questionnaireData;

            // Dor em repouso (painAtRest ou painLevel para compatibilidade)
            const painAtRest = extracted.painAtRest ?? extracted.painLevel ?? null;
            if (painAtRest !== undefined && painAtRest !== null) {
              painAtRestByDay[followUp.dayNumber] = painAtRest;
            }

            // Dor durante evacuação
            if (extracted.painDuringBowelMovement !== undefined && extracted.painDuringBowelMovement !== null) {
              painDuringBowelByDay[followUp.dayNumber] = extracted.painDuringBowelMovement;
            }

            // Bristol Scale (registrar para D+5 e D+10)
            if (extracted.bristolScale !== undefined && extracted.bristolScale !== null) {
              bristolByDay[followUp.dayNumber] = extracted.bristolScale;
            }

            // Primeira evacuação (registrar a primeira ocorrência)
            if (extracted.isFirstBowelMovement || extracted.hadBowelMovementSinceLastContact) {
              if (firstBowelMovementDay === null) {
                firstBowelMovementDay = followUp.dayNumber;
                firstBowelMovementTime = extracted.bowelMovementTime || null;
              }
            }

            // Dados de satisfação (D+14)
            if (followUp.dayNumber === 14) {
              if (extracted.npsScore !== undefined) npsScore = extracted.npsScore;
              if (extracted.painControlSatisfaction !== undefined) painControlSatisfaction = extracted.painControlSatisfaction;
              if (extracted.aiFollowUpSatisfaction !== undefined) aiFollowUpSatisfaction = extracted.aiFollowUpSatisfaction;
              if (extracted.feedback !== undefined) feedback = extracted.feedback;
              // Compatibilidade com campo antigo nps
              if (npsScore === null && extracted.nps !== undefined) npsScore = extracted.nps;
            }
          }
        });

        // Dor em REPOUSO por dia (colunas separadas)
        [1, 2, 3, 5, 7, 10, 14].forEach(day => {
          baseRow[`Dor_Repouso_D${day}`] = painAtRestByDay[day] ?? null;
        });

        // Dor durante EVACUAÇÃO por dia (colunas separadas)
        [1, 2, 3, 5, 7, 10, 14].forEach(day => {
          baseRow[`Dor_Evacuacao_D${day}`] = painDuringBowelByDay[day] ?? null;
        });

        // Bristol Scale (apenas D+5 e D+10)
        baseRow['Bristol_D5'] = bristolByDay[5] ?? null;
        baseRow['Bristol_D10'] = bristolByDay[10] ?? null;

        // Primeira evacuação
        baseRow['Primeira_Evacuacao_Dia'] = firstBowelMovementDay;
        baseRow['Primeira_Evacuacao_Horario'] = firstBowelMovementTime;

        // Estatísticas de dor em repouso
        const painAtRestValues = Object.values(painAtRestByDay).filter(v => v !== null) as number[];
        if (painAtRestValues.length > 0) {
          baseRow['Dor_Repouso_Media'] = (painAtRestValues.reduce((a, b) => a + b, 0) / painAtRestValues.length).toFixed(2);
          baseRow['Dor_Repouso_Maxima'] = Math.max(...painAtRestValues);
          baseRow['Dor_Repouso_DP'] = calculateStdDev(painAtRestValues).toFixed(2);
        }

        // Estatísticas de dor durante evacuação
        const painDuringBowelValues = Object.values(painDuringBowelByDay).filter(v => v !== null) as number[];
        if (painDuringBowelValues.length > 0) {
          baseRow['Dor_Evacuacao_Media'] = (painDuringBowelValues.reduce((a, b) => a + b, 0) / painDuringBowelValues.length).toFixed(2);
          baseRow['Dor_Evacuacao_Maxima'] = Math.max(...painDuringBowelValues);
          baseRow['Dor_Evacuacao_DP'] = calculateStdDev(painDuringBowelValues).toFixed(2);
        }

        // Pesquisa de Satisfação (D+14)
        baseRow['Satisfacao_Controle_Dor'] = painControlSatisfaction;
        baseRow['Satisfacao_IA'] = aiFollowUpSatisfaction;
        baseRow['NPS'] = npsScore;
        baseRow['Feedback'] = feedback;

        // Classificação NPS
        if (npsScore !== null) {
          if (npsScore >= 9) {
            baseRow['NPS_Categoria'] = 'Promotor';
          } else if (npsScore >= 7) {
            baseRow['NPS_Categoria'] = 'Passivo';
          } else {
            baseRow['NPS_Categoria'] = 'Detrator';
          }
        } else {
          baseRow['NPS_Categoria'] = null;
        }

        // Red flags
        const allRedFlags = surgery.followUps
          .flatMap(f => f.responses.flatMap(r => parseRedFlags(r.redFlags)))
          .filter((v, i, a) => a.indexOf(v) === i);
        baseRow['Red_Flags'] = allRedFlags.join('; ');
        baseRow['Num_Red_Flags'] = allRedFlags.length;
      }

      // Análise de IA
      if (options.fields.analiseIA) {
        const highRiskFollowUps = surgery.followUps.filter(f =>
          f.responses.some(r => r.riskLevel === 'high' || r.riskLevel === 'critical')
        );
        baseRow['FollowUps_Alto_Risco'] = highRiskFollowUps.length;

        const alertedFollowUps = surgery.followUps.filter(f =>
          f.responses.some(r => r.doctorAlerted)
        );
        baseRow['Alertas_Medico'] = alertedFollowUps.length;
      }

      rows.push(baseRow);
    });
  });

  return rows;
}

// ============================================
// COMPARATIVE DATA EXPORT (Groups side-by-side)
// ============================================

function formatComparativeData(
  data: ResearchExportData,
  options: ResearchExportOptions
): any[] {
  const rows: any[] = [];

  // Criar uma linha para cada métrica comparando os grupos
  const metrics = [
    { label: 'Total de Pacientes', key: 'patientCount' },
    { label: 'Média de Idade', key: 'avgAge' },
    { label: 'Sexo Masculino (%)', key: 'malePercentage' },
    { label: 'Média de Comorbidades', key: 'avgComorbidities' },
    { label: 'Taxa de Adesão FollowUp (%)', key: 'followUpRate' },
    { label: 'Dor Média D+1', key: 'painD1' },
    { label: 'Dor Média D+7', key: 'painD7' },
    { label: 'Dor Média D+14', key: 'painD14' },
    { label: 'NPS Médio', key: 'avgNPS' },
  ];

  // Calcular estatísticas por grupo
  const groupStats: Record<string, any> = {};

  data.groups.forEach(group => {
    const groupPatients = data.patients.filter(p => p.researchGroup === group.groupCode);

    const ages = groupPatients.map(p => p.age).filter(a => a != null) as number[];
    const maleCount = groupPatients.filter(p => p.sex?.toLowerCase() === 'masculino').length;
    const comorbidities = groupPatients.flatMap(p => p.comorbidities);

    const painD1: number[] = [];
    const painD7: number[] = [];
    const painD14: number[] = [];
    const npsScores: number[] = [];
    let totalFollowUps = 0;
    let completedFollowUps = 0;

    groupPatients.forEach(patient => {
      patient.surgeries.forEach(surgery => {
        totalFollowUps += surgery.followUps.length;
        completedFollowUps += surgery.followUps.filter(f => f.status === 'responded').length;

        surgery.followUps.forEach(followUp => {
          if (followUp.responses.length > 0) {
            const data = parseQuestionnaireData(followUp.responses[0].questionnaireData);

            if (followUp.dayNumber === 1 && data.painLevel != null) painD1.push(data.painLevel);
            if (followUp.dayNumber === 7 && data.painLevel != null) painD7.push(data.painLevel);
            if (followUp.dayNumber === 14) {
              if (data.painLevel != null) painD14.push(data.painLevel);
              if (data.nps != null) npsScores.push(data.nps);
            }
          }
        });
      });
    });

    groupStats[group.groupCode] = {
      patientCount: groupPatients.length,
      avgAge: ages.length > 0 ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : '-',
      malePercentage: groupPatients.length > 0
        ? ((maleCount / groupPatients.length) * 100).toFixed(1)
        : '-',
      avgComorbidities: groupPatients.length > 0
        ? (comorbidities.length / groupPatients.length).toFixed(1)
        : '-',
      followUpRate: totalFollowUps > 0
        ? ((completedFollowUps / totalFollowUps) * 100).toFixed(1)
        : '-',
      painD1: painD1.length > 0
        ? `${(painD1.reduce((a, b) => a + b, 0) / painD1.length).toFixed(1)} ± ${calculateStdDev(painD1).toFixed(1)}`
        : '-',
      painD7: painD7.length > 0
        ? `${(painD7.reduce((a, b) => a + b, 0) / painD7.length).toFixed(1)} ± ${calculateStdDev(painD7).toFixed(1)}`
        : '-',
      painD14: painD14.length > 0
        ? `${(painD14.reduce((a, b) => a + b, 0) / painD14.length).toFixed(1)} ± ${calculateStdDev(painD14).toFixed(1)}`
        : '-',
      avgNPS: npsScores.length > 0
        ? (npsScores.reduce((a, b) => a + b, 0) / npsScores.length).toFixed(1)
        : '-',
    };
  });

  // Criar linhas de comparação
  metrics.forEach(metric => {
    const row: any = { Metrica: metric.label };

    data.groups.forEach(group => {
      row[`Grupo_${group.groupCode}_${group.groupName}`] = groupStats[group.groupCode][metric.key];
    });

    rows.push(row);
  });

  return rows;
}

// ============================================
// STATISTICAL SUMMARY EXPORT
// ============================================

function formatStatisticalData(
  data: ResearchExportData,
  options: ResearchExportOptions
): any[] {
  const stats: any[] = [];

  // Header
  stats.push({
    Categoria: 'RESUMO ESTATÍSTICO DA PESQUISA',
    Grupo: '',
    N: '',
    Media: '',
    DP: '',
    Mediana: '',
    Min_Max: '',
  });

  stats.push({
    Categoria: data.research.title,
    Grupo: '',
    N: '',
    Media: '',
    DP: '',
    Mediana: '',
    Min_Max: '',
  });

  stats.push({
    Categoria: '',
    Grupo: '',
    N: '',
    Media: '',
    DP: '',
    Mediana: '',
    Min_Max: '',
  });

  // Por grupo
  data.groups.forEach(group => {
    const groupPatients = data.patients.filter(p => p.researchGroup === group.groupCode);

    stats.push({
      Categoria: `GRUPO ${group.groupCode}: ${group.groupName}`,
      Grupo: '',
      N: '',
      Media: '',
      DP: '',
      Mediana: '',
      Min_Max: '',
    });

    // Dados demográficos
    if (options.fields.dadosBasicos) {
      const ages = groupPatients.map(p => p.age).filter(a => a != null) as number[];

      if (ages.length > 0) {
        stats.push({
          Categoria: 'Idade',
          Grupo: group.groupCode,
          N: ages.length,
          Media: (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1),
          DP: calculateStdDev(ages).toFixed(1),
          Mediana: calculateMedian(ages).toFixed(1),
          Min_Max: `${Math.min(...ages)} - ${Math.max(...ages)}`,
        });
      }

      const maleCount = groupPatients.filter(p => p.sex?.toLowerCase() === 'masculino').length;
      stats.push({
        Categoria: 'Sexo Masculino',
        Grupo: group.groupCode,
        N: groupPatients.length,
        Media: `${((maleCount / groupPatients.length) * 100).toFixed(1)}%`,
        DP: '-',
        Mediana: '-',
        Min_Max: '-',
      });
    }

    // Dados de dor por dia
    if (options.fields.respostasQuestionarios) {
      [1, 2, 3, 5, 7, 10, 14].forEach(day => {
        const painValues: number[] = [];

        groupPatients.forEach(patient => {
          patient.surgeries.forEach(surgery => {
            const followUp = surgery.followUps.find(f => f.dayNumber === day);
            if (followUp && followUp.responses.length > 0) {
              const data = parseQuestionnaireData(followUp.responses[0].questionnaireData);
              if (data.painLevel != null) {
                painValues.push(data.painLevel);
              }
            }
          });
        });

        if (painValues.length > 0) {
          stats.push({
            Categoria: `Dor D+${day}`,
            Grupo: group.groupCode,
            N: painValues.length,
            Media: (painValues.reduce((a, b) => a + b, 0) / painValues.length).toFixed(2),
            DP: calculateStdDev(painValues).toFixed(2),
            Mediana: calculateMedian(painValues).toFixed(1),
            Min_Max: `${Math.min(...painValues)} - ${Math.max(...painValues)}`,
          });
        }
      });

      // NPS
      const npsValues: number[] = [];
      groupPatients.forEach(patient => {
        patient.surgeries.forEach(surgery => {
          const d14 = surgery.followUps.find(f => f.dayNumber === 14);
          if (d14 && d14.responses.length > 0) {
            const data = parseQuestionnaireData(d14.responses[0].questionnaireData);
            if (data.nps != null) {
              npsValues.push(data.nps);
            }
          }
        });
      });

      if (npsValues.length > 0) {
        stats.push({
          Categoria: 'NPS',
          Grupo: group.groupCode,
          N: npsValues.length,
          Media: (npsValues.reduce((a, b) => a + b, 0) / npsValues.length).toFixed(1),
          DP: calculateStdDev(npsValues).toFixed(1),
          Mediana: calculateMedian(npsValues).toFixed(1),
          Min_Max: `${Math.min(...npsValues)} - ${Math.max(...npsValues)}`,
        });
      }
    }

    stats.push({
      Categoria: '',
      Grupo: '',
      N: '',
      Media: '',
      DP: '',
      Mediana: '',
      Min_Max: '',
    });
  });

  return stats;
}

// ============================================
// TIMELINE DATA EXPORT
// ============================================

function formatTimelineData(
  data: ResearchExportData,
  options: ResearchExportOptions
): any[] {
  const rows: any[] = [];

  data.patients.forEach(patient => {
    patient.surgeries.forEach(surgery => {
      const baseInfo = {
        // ✅ LGPD: ID pseudônimo (hash SHA-256) - permite re-identificação
        ID_Pseudonimo: patient.pseudonymousId,
        Grupo: patient.researchGroup,
        Data_Cirurgia: surgery.date.toISOString().split('T')[0],
      };

      // Uma linha por dia de follow-up
      surgery.followUps.forEach(followUp => {
        const row: any = {
          ...baseInfo,
          Dia_FollowUp: `D+${followUp.dayNumber}`,
          Data_Agendada: followUp.scheduledDate.toISOString().split('T')[0],
          Status: followUp.status,
          Respondido: followUp.respondedAt ? 'Sim' : 'Não',
        };

        if (followUp.responses.length > 0 && options.fields.respostasQuestionarios) {
          const questionnaireData = parseQuestionnaireData(followUp.responses[0].questionnaireData);

          row['Nivel_Dor'] = questionnaireData.painLevel ?? null;
          row['Retencao_Urinaria'] = questionnaireData.urinaryRetention ? 'Sim' : 'Não';
          row['Evacuacao'] = questionnaireData.bowelMovement ? 'Sim' : 'Não';
          row['Sangramento'] = questionnaireData.bleeding ? 'Sim' : 'Não';
          row['Nivel_Risco'] = followUp.responses[0].riskLevel;

          const redFlags = parseRedFlags(followUp.responses[0].redFlags);
          row['Red_Flags'] = redFlags.join(', ');
          row['Alerta_Medico'] = followUp.responses[0].doctorAlerted ? 'Sim' : 'Não';
        }

        rows.push(row);
      });
    });
  });

  return rows;
}

// ============================================
// RESEARCH INFO SHEET
// ============================================

function formatResearchInfo(data: ResearchExportData): any[] {
  const info: any[] = [];

  info.push({ Campo: 'INFORMAÇÕES DA PESQUISA', Valor: '' });
  info.push({ Campo: '', Valor: '' });
  info.push({ Campo: 'Título', Valor: data.research.title });
  info.push({ Campo: 'Descrição', Valor: data.research.description });
  info.push({ Campo: 'Tipo de Cirurgia', Valor: data.research.surgeryType || 'Não especificado' });
  info.push({ Campo: 'Data de Início', Valor: data.research.startDate.toISOString().split('T')[0] });
  info.push({
    Campo: 'Data de Término',
    Valor: data.research.endDate ? data.research.endDate.toISOString().split('T')[0] : 'Em andamento',
  });
  info.push({ Campo: 'Total de Pacientes', Valor: data.research.totalPatients });
  info.push({ Campo: '', Valor: '' });
  info.push({ Campo: 'GRUPOS DA PESQUISA', Valor: '' });
  info.push({ Campo: '', Valor: '' });

  data.groups.forEach(group => {
    info.push({ Campo: `Grupo ${group.groupCode}`, Valor: group.groupName });
    info.push({ Campo: 'Descrição', Valor: group.description });
    info.push({ Campo: 'Número de Pacientes', Valor: group.patientCount });
    info.push({ Campo: '', Valor: '' });
  });

  info.push({ Campo: 'DATA DE EXPORTAÇÃO', Valor: new Date().toISOString() });

  return info;
}

// ============================================
// GLOSSARY SHEET
// ============================================

function createGlossary(): any[] {
  return [
    { Campo: 'GLOSSÁRIO', Descricao: '' },
    { Campo: '', Descricao: '' },
    { Campo: 'ID_Pseudonimo', Descricao: 'Identificador pseudônimo (hash SHA-256) - permite re-identificação com acesso ao banco de dados. Conforme Art. 13, § 3º da LGPD para pesquisa científica.' },
    { Campo: 'Grupo_Pesquisa', Descricao: 'Código do grupo de pesquisa (A = anatomia, B = neuroestimulação, etc)' },
    { Campo: '', Descricao: '' },
    { Campo: 'VARIÁVEIS DE DOR', Descricao: '' },
    { Campo: 'Dor_Repouso_D+N', Descricao: 'Nível de dor em REPOUSO no dia N pós-operatório (EVA 0-10)' },
    { Campo: 'Dor_Evacuacao_D+N', Descricao: 'Nível de dor DURANTE EVACUAÇÃO no dia N pós-operatório (EVA 0-10)' },
    { Campo: 'Dor_Repouso_Media', Descricao: 'Média aritmética de todas as medições de dor em repouso' },
    { Campo: 'Dor_Repouso_Maxima', Descricao: 'Valor máximo de dor em repouso registrado' },
    { Campo: 'Dor_Repouso_DP', Descricao: 'Desvio padrão da dor em repouso' },
    { Campo: 'Dor_Evacuacao_Media', Descricao: 'Média aritmética de todas as medições de dor durante evacuação' },
    { Campo: 'Dor_Evacuacao_Maxima', Descricao: 'Valor máximo de dor durante evacuação registrado' },
    { Campo: 'Dor_Evacuacao_DP', Descricao: 'Desvio padrão da dor durante evacuação' },
    { Campo: '', Descricao: '' },
    { Campo: 'EVACUAÇÃO', Descricao: '' },
    { Campo: 'Primeira_Evacuacao_Dia', Descricao: 'Dia pós-operatório da primeira evacuação (D+1, D+2, etc)' },
    { Campo: 'Primeira_Evacuacao_Horario', Descricao: 'Horário aproximado da primeira evacuação' },
    { Campo: 'Bristol_D5', Descricao: 'Escala de Bristol no D+5 (1-7). 1-2=constipação, 3-5=normal, 6-7=diarréia' },
    { Campo: 'Bristol_D10', Descricao: 'Escala de Bristol no D+10 (1-7). 1-2=constipação, 3-5=normal, 6-7=diarréia' },
    { Campo: '', Descricao: '' },
    { Campo: 'SATISFAÇÃO (D+14)', Descricao: '' },
    { Campo: 'Satisfacao_Controle_Dor', Descricao: 'Satisfação com o controle da dor pós-operatória (0-10)' },
    { Campo: 'Satisfacao_IA', Descricao: 'Satisfação com o acompanhamento via IA (0-10)' },
    { Campo: 'NPS', Descricao: 'Net Promoter Score - probabilidade de recomendar (0-10)' },
    { Campo: 'NPS_Categoria', Descricao: 'Classificação NPS: 0-6=Detrator, 7-8=Passivo, 9-10=Promotor' },
    { Campo: 'Feedback', Descricao: 'Comentário livre do paciente sobre o acompanhamento' },
    { Campo: '', Descricao: '' },
    { Campo: 'OUTROS CAMPOS', Descricao: '' },
    { Campo: 'Red_Flags', Descricao: 'Sinais de alerta identificados pela IA' },
    { Campo: 'Taxa_Adesao', Descricao: 'Percentual de follow-ups respondidos' },
    { Campo: 'Bloqueio_Pudendo', Descricao: 'Se foi realizado bloqueio do nervo pudendo' },
    { Campo: 'Pudendo_Tecnica', Descricao: 'Técnica do bloqueio pudendo (anatomia vs neuroestimulação)' },
    { Campo: 'Botox_Usado', Descricao: 'Se foi utilizada toxina botulínica no preparo' },
    { Campo: '', Descricao: '' },
    { Campo: 'NÍVEIS DE RISCO', Descricao: '' },
    { Campo: 'low', Descricao: 'Baixo risco - evolução normal' },
    { Campo: 'medium', Descricao: 'Risco médio - atenção necessária' },
    { Campo: 'high', Descricao: 'Alto risco - contato com médico recomendado' },
    { Campo: 'critical', Descricao: 'Risco crítico - intervenção imediata' },
    { Campo: '', Descricao: '' },
    { Campo: 'ESCALA DE BRISTOL', Descricao: '' },
    { Campo: '1', Descricao: 'Pedaços duros separados (muito constipado)' },
    { Campo: '2', Descricao: 'Em forma de salsicha, mas com pedaços' },
    { Campo: '3', Descricao: 'Salsicha com rachaduras na superfície' },
    { Campo: '4', Descricao: 'Salsicha lisa e macia (IDEAL)' },
    { Campo: '5', Descricao: 'Pedaços macios com bordas definidas' },
    { Campo: '6', Descricao: 'Pedaços fofos com bordas irregulares' },
    { Campo: '7', Descricao: 'Aquosa, sem pedaços sólidos (diarreia)' },
  ];
}

// ============================================
// MAIN EXPORT FUNCTIONS
// ============================================

export async function generateResearchExcel(
  data: ResearchExportData,
  options: ResearchExportOptions
): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();

  // Aba 1: Informações da Pesquisa
  const infoData = formatResearchInfo(data);
  const infoSheet = XLSX.utils.json_to_sheet(infoData);
  XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informações');

  // Aba 2: Dados baseados no tipo de exportação
  let mainData: any[] = [];
  let sheetName = '';

  switch (options.exportType) {
    case 'individual':
      mainData = formatIndividualData(data, options);
      sheetName = 'Dados Individuais';
      break;
    case 'comparative':
      mainData = formatComparativeData(data, options);
      sheetName = 'Comparação de Grupos';
      break;
    case 'statistical':
      mainData = formatStatisticalData(data, options);
      sheetName = 'Análise Estatística';
      break;
    case 'timeline':
      mainData = formatTimelineData(data, options);
      sheetName = 'Linha do Tempo';
      break;
  }

  const mainSheet = XLSX.utils.json_to_sheet(mainData);
  XLSX.utils.book_append_sheet(workbook, mainSheet, sheetName);

  // Se for exportação individual, adicionar também dados estatísticos
  if (options.exportType === 'individual') {
    const statsData = formatStatisticalData(data, options);
    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estatísticas');
  }

  // Aba final: Glossário
  const glossaryData = createGlossary();
  const glossarySheet = XLSX.utils.json_to_sheet(glossaryData);
  XLSX.utils.book_append_sheet(workbook, glossarySheet, 'Glossário');

  // Converter para buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return excelBuffer;
}

export async function generateResearchCSV(
  data: ResearchExportData,
  options: ResearchExportOptions
): Promise<string> {
  let csvData: any[] = [];

  switch (options.exportType) {
    case 'individual':
      csvData = formatIndividualData(data, options);
      break;
    case 'comparative':
      csvData = formatComparativeData(data, options);
      break;
    case 'statistical':
      csvData = formatStatisticalData(data, options);
      break;
    case 'timeline':
      csvData = formatTimelineData(data, options);
      break;
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(csvData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

  const csv = XLSX.utils.sheet_to_csv(worksheet);
  return csv;
}

export async function generateResearchPDF(
  data: ResearchExportData,
  options: ResearchExportOptions
): Promise<Buffer> {
  // TODO: Implementar geração de PDF
  // Por enquanto, retornar um erro informativo
  throw new Error('Exportação em PDF será implementada em breve. Use Excel ou CSV por enquanto.');
}

// ============================================
// ANOVA (ANALYSIS OF VARIANCE) FUNCTIONS
// ============================================

export interface ANOVAResult {
  fStatistic: number;
  pValue: number;
  dfBetween: number;
  dfWithin: number;
  dfTotal: number;
  ssBetween: number;
  ssWithin: number;
  ssTotal: number;
  msBetween: number;
  msWithin: number;
  etaSquared: number;
  grandMean: number;
  groupMeans: number[];
  groupSizes: number[];
  significant: boolean;
  interpretation: string;
}

export interface TukeyHSDResult {
  group1Index: number;
  group2Index: number;
  group1Name: string;
  group2Name: string;
  meanDifference: number;
  qStatistic: number;
  pValue: number;
  significant: boolean;
  lowerCI: number;
  upperCI: number;
}

export interface ANOVAAnalysis {
  anova: ANOVAResult;
  postHoc?: TukeyHSDResult[];
}

/**
 * Calculate ANOVA (Analysis of Variance) for 3 or more groups
 * @param groups - Array of arrays, where each inner array contains numeric values for a group
 * @param groupNames - Optional array of group names for interpretation
 * @returns ANOVAResult object with F-statistic, p-value, and other statistics
 */
export function calculateANOVA(
  groups: number[][],
  groupNames?: string[]
): ANOVAResult {
  // Validation
  if (groups.length < 2) {
    throw new Error('ANOVA requires at least 2 groups');
  }

  // Filter out empty groups
  const validGroups = groups.filter(group => group.length > 0);

  if (validGroups.length < 2) {
    throw new Error('ANOVA requires at least 2 groups with data');
  }

  const k = validGroups.length; // Number of groups
  const groupSizes = validGroups.map(group => group.length);
  const n = groupSizes.reduce((a, b) => a + b, 0); // Total sample size

  // Calculate group means
  const groupMeans = validGroups.map(group => {
    return group.reduce((sum, val) => sum + val, 0) / group.length;
  });

  // Calculate grand mean
  const allValues = validGroups.flat();
  const grandMean = allValues.reduce((sum, val) => sum + val, 0) / n;

  // Calculate Sum of Squares Between Groups (SSB)
  const ssBetween = validGroups.reduce((sum, group, i) => {
    const groupMean = groupMeans[i];
    const groupSize = group.length;
    return sum + groupSize * Math.pow(groupMean - grandMean, 2);
  }, 0);

  // Calculate Sum of Squares Within Groups (SSW)
  const ssWithin = validGroups.reduce((sum, group, i) => {
    const groupMean = groupMeans[i];
    return sum + group.reduce((groupSum, val) => {
      return groupSum + Math.pow(val - groupMean, 2);
    }, 0);
  }, 0);

  // Calculate Total Sum of Squares (SST)
  const ssTotal = allValues.reduce((sum, val) => {
    return sum + Math.pow(val - grandMean, 2);
  }, 0);

  // Degrees of freedom
  const dfBetween = k - 1;
  const dfWithin = n - k;
  const dfTotal = n - 1;

  // Mean Squares
  const msBetween = ssBetween / dfBetween;
  const msWithin = ssWithin / dfWithin;

  // F-statistic
  const fStatistic = msBetween / msWithin;

  // Calculate p-value using F-distribution approximation
  const pValue = calculateFDistributionPValue(fStatistic, dfBetween, dfWithin);

  // Effect size (Eta-squared)
  const etaSquared = ssBetween / ssTotal;

  // Determine significance
  const significant = pValue < 0.05;

  // Interpretation
  let interpretation = '';
  if (pValue < 0.001) {
    interpretation = 'Highly significant difference detected between groups (p < 0.001). Strong evidence that at least one group mean differs from the others.';
  } else if (pValue < 0.01) {
    interpretation = 'Very significant difference detected between groups (p < 0.01). There is strong evidence of differences between group means.';
  } else if (pValue < 0.05) {
    interpretation = 'Significant difference detected between groups (p < 0.05). There is evidence that at least one group mean differs from the others.';
  } else {
    interpretation = 'No significant difference detected between groups (p ≥ 0.05). The data does not provide sufficient evidence of differences between group means.';
  }

  // Add effect size interpretation
  if (etaSquared >= 0.14) {
    interpretation += ' The effect size is large (η² ≥ 0.14), indicating substantial practical significance.';
  } else if (etaSquared >= 0.06) {
    interpretation += ' The effect size is medium (η² ≥ 0.06), indicating moderate practical significance.';
  } else if (etaSquared >= 0.01) {
    interpretation += ' The effect size is small (η² ≥ 0.01), indicating limited practical significance.';
  } else {
    interpretation += ' The effect size is very small (η² < 0.01), indicating minimal practical significance.';
  }

  return {
    fStatistic: Math.round(fStatistic * 1000) / 1000,
    pValue: Math.round(pValue * 10000) / 10000,
    dfBetween,
    dfWithin,
    dfTotal,
    ssBetween: Math.round(ssBetween * 100) / 100,
    ssWithin: Math.round(ssWithin * 100) / 100,
    ssTotal: Math.round(ssTotal * 100) / 100,
    msBetween: Math.round(msBetween * 100) / 100,
    msWithin: Math.round(msWithin * 100) / 100,
    etaSquared: Math.round(etaSquared * 1000) / 1000,
    grandMean: Math.round(grandMean * 100) / 100,
    groupMeans: groupMeans.map(m => Math.round(m * 100) / 100),
    groupSizes,
    significant,
    interpretation,
  };
}

/**
 * Calculate Tukey HSD (Honestly Significant Difference) post-hoc test
 * Performs pairwise comparisons between all groups after a significant ANOVA
 * @param groups - Array of arrays containing numeric values for each group
 * @param groupNames - Array of group names for labeling results
 * @param msWithin - Mean Square Within from ANOVA
 * @param dfWithin - Degrees of Freedom Within from ANOVA
 * @returns Array of TukeyHSDResult objects for each pairwise comparison
 */
export function calculateTukeyHSD(
  groups: number[][],
  groupNames: string[],
  msWithin: number,
  dfWithin: number
): TukeyHSDResult[] {
  const results: TukeyHSDResult[] = [];
  const k = groups.length;

  // Calculate group means and sizes
  const groupMeans = groups.map(group =>
    group.reduce((sum, val) => sum + val, 0) / group.length
  );
  const groupSizes = groups.map(group => group.length);

  // Perform all pairwise comparisons
  for (let i = 0; i < k - 1; i++) {
    for (let j = i + 1; j < k; j++) {
      const meanDifference = Math.abs(groupMeans[i] - groupMeans[j]);

      // Standard error for the comparison
      const n1 = groupSizes[i];
      const n2 = groupSizes[j];
      const standardError = Math.sqrt(msWithin * (1/n1 + 1/n2) / 2);

      // q-statistic (Studentized range statistic)
      const qStatistic = meanDifference / standardError;

      // Approximate p-value using Studentized range distribution
      // For simplification, we use a critical value approach
      const qCritical = getTukeyQCritical(k, dfWithin, 0.05);
      const significant = qStatistic > qCritical;

      // Approximate p-value
      const pValue = significant ?
        (qStatistic > getTukeyQCritical(k, dfWithin, 0.01) ? 0.005 : 0.025) :
        0.1;

      // 95% Confidence interval
      const margin = qCritical * standardError;
      const lowerCI = meanDifference - margin;
      const upperCI = meanDifference + margin;

      results.push({
        group1Index: i,
        group2Index: j,
        group1Name: groupNames[i] || `Group ${i + 1}`,
        group2Name: groupNames[j] || `Group ${j + 1}`,
        meanDifference: Math.round(meanDifference * 1000) / 1000,
        qStatistic: Math.round(qStatistic * 1000) / 1000,
        pValue: Math.round(pValue * 10000) / 10000,
        significant,
        lowerCI: Math.round(lowerCI * 1000) / 1000,
        upperCI: Math.round(upperCI * 1000) / 1000,
      });
    }
  }

  return results;
}

/**
 * Perform complete ANOVA analysis with post-hoc tests
 * @param groups - Array of arrays containing numeric values for each group
 * @param groupNames - Array of group names
 * @returns Complete ANOVA analysis including post-hoc tests if significant
 */
export function performANOVAAnalysis(
  groups: number[][],
  groupNames?: string[]
): ANOVAAnalysis {
  const anova = calculateANOVA(groups, groupNames);

  const names = groupNames || groups.map((_, i) => `Group ${i + 1}`);

  // Only perform post-hoc tests if ANOVA is significant and we have 3+ groups
  let postHoc: TukeyHSDResult[] | undefined;
  if (anova.significant && groups.length >= 3) {
    postHoc = calculateTukeyHSD(groups, names, anova.msWithin, anova.dfWithin);
  }

  return {
    anova,
    postHoc,
  };
}

/**
 * Calculate p-value for F-distribution
 * Uses approximation based on F-statistic and degrees of freedom
 */
function calculateFDistributionPValue(
  f: number,
  dfBetween: number,
  dfWithin: number
): number {
  if (f <= 0) return 1.0;

  // Simplified p-value calculation using approximation
  // For more accurate results, consider using a statistical library

  // Common critical values for F-distribution at alpha = 0.05
  const criticalValues: { [key: string]: number } = {
    '1_10': 4.96, '1_20': 4.35, '1_30': 4.17, '1_60': 4.00, '1_120': 3.92,
    '2_10': 4.10, '2_20': 3.49, '2_30': 3.32, '2_60': 3.15, '2_120': 3.07,
    '3_10': 3.71, '3_20': 3.10, '3_30': 2.92, '3_60': 2.76, '3_120': 2.68,
    '4_10': 3.48, '4_20': 2.87, '4_30': 2.69, '4_60': 2.53, '4_120': 2.45,
    '5_10': 3.33, '5_20': 2.71, '5_30': 2.53, '5_60': 2.37, '5_120': 2.29,
  };

  // Find closest critical value
  const dfWithinKey = dfWithin <= 10 ? 10 :
                      dfWithin <= 20 ? 20 :
                      dfWithin <= 30 ? 30 :
                      dfWithin <= 60 ? 60 : 120;

  const key = `${Math.min(dfBetween, 5)}_${dfWithinKey}`;
  const critical05 = criticalValues[key] || 3.0;

  // Rough approximation of p-value
  if (f > critical05 * 2) return 0.001;
  if (f > critical05 * 1.5) return 0.01;
  if (f > critical05) return 0.03;
  if (f > critical05 * 0.8) return 0.08;
  return 0.15;
}

/**
 * Get critical q-value for Tukey HSD test
 * @param k - Number of groups
 * @param dfWithin - Degrees of freedom within groups
 * @param alpha - Significance level (default 0.05)
 */
function getTukeyQCritical(k: number, dfWithin: number, alpha: number = 0.05): number {
  // Simplified critical values table for Studentized range distribution
  // k = number of groups, df = degrees of freedom within
  const criticalValues: { [key: string]: number } = {
    // Format: "k_df_alpha"
    '3_10_0.05': 3.88, '3_20_0.05': 3.58, '3_30_0.05': 3.49, '3_60_0.05': 3.40, '3_120_0.05': 3.36,
    '4_10_0.05': 4.33, '4_20_0.05': 3.96, '4_30_0.05': 3.85, '4_60_0.05': 3.74, '4_120_0.05': 3.68,
    '5_10_0.05': 4.65, '5_20_0.05': 4.23, '5_30_0.05': 4.10, '5_60_0.05': 3.98, '5_120_0.05': 3.92,
    '6_10_0.05': 4.91, '6_20_0.05': 4.45, '6_30_0.05': 4.30, '6_60_0.05': 4.16, '6_120_0.05': 4.10,
    '3_10_0.01': 5.27, '3_20_0.01': 4.64, '3_30_0.01': 4.45, '3_60_0.01': 4.28, '3_120_0.01': 4.20,
    '4_10_0.01': 5.77, '4_20_0.01': 5.02, '4_30_0.01': 4.80, '4_60_0.01': 4.59, '4_120_0.01': 4.50,
    '5_10_0.01': 6.14, '5_20_0.01': 5.29, '5_30_0.01': 5.05, '5_60_0.01': 4.82, '5_120_0.01': 4.71,
  };

  const dfKey = dfWithin <= 10 ? 10 :
                dfWithin <= 20 ? 20 :
                dfWithin <= 30 ? 30 :
                dfWithin <= 60 ? 60 : 120;

  const kClamped = Math.min(Math.max(k, 3), 6);
  const key = `${kClamped}_${dfKey}_${alpha}`;

  return criticalValues[key] || 3.5; // Default fallback
}
