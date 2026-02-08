/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Type definitions for research statistics module
 */

// ============================================
// DATABASE/PRISMA TYPES
// ============================================

export interface ResearchGroup {
  id: string;
  groupCode: string;
  groupName: string;
  description?: string;
}

export interface Comorbidity {
  comorbidity: {
    name: string;
  };
}

export interface Medication {
  medication: {
    name: string;
  };
}

export interface FollowUpResponse {
  id: string;
  questionnaireData: string;
  redFlags: string | null;
}

export interface FollowUp {
  id: string;
  dayNumber: number;
  status: string;
  responses: FollowUpResponse[];
}

export interface Anesthesia {
  type: string;
  pudendoBlock: boolean;
}

export interface Surgery {
  id: string;
  type: string;
  dataCompleteness: number;
  anesthesia: Anesthesia | null;
  followUps: FollowUp[];
}

export interface Patient {
  id: string;
  age: number | null;
  sex: string | null;
  researchGroup: string | null;
  surgeries: Surgery[];
  comorbidities: Comorbidity[];
  medications: Medication[];
}

export interface Research {
  id: string;
  title: string;
  description: string | null;
  surgeryType: string | null;
  isActive: boolean;
  startDate: Date;
  endDate: Date | null;
  groups: ResearchGroup[];
}

// ============================================
// STATISTICS RESULT TYPES
// ============================================

export interface PainScore {
  day: number;
  painLevel: number;
}

export interface GroupStats {
  groupCode: string;
  groupName: string;
  patientCount: number;
  avgAge: number;
  ageRange: [number, number];
  sexDistribution: Record<string, number>;
  surgeryTypes: Record<string, number>;
  avgCompleteness: number;
  comorbidities: Record<string, number>;
  medications: Record<string, number>;
  responseRate: number;
  painScores: PainScore[];
  complicationRate: number;
  totalFollowUps: number;
  respondedFollowUps: number;
}

export interface OverviewStats {
  totalPatients: number;
  avgAge: number;
  sexDistribution: Record<string, number>;
  dataCompleteness: number;
  totalGroups: number;
}

export interface TTestResult {
  tStatistic: number;
  pValue: number;
  degreesOfFreedom: number;
  significant: boolean;
  mean1: number;
  mean2: number;
  difference: number;
}

export interface StatisticalTests {
  testType: string;
  ageTTest?: TTestResult | null;
  ageANOVA?: any;
  painANOVA?: any;
}

export interface ContingencyTable {
  observed: number[][];
  expected: number[][];
  rowTotals: number[];
  colTotals: number[];
  total: number;
}

export interface ChiSquareTestResult {
  chiSquare: number;
  degreesOfFreedom: number;
  pValue: number;
  cramerV: number;
  significant: boolean;
  cellsWithLowCount: number;
  useFisherExact: boolean;
}

export interface FisherExactTestResult {
  pValue: number;
  oddsRatio: number;
  significant: boolean;
}

export interface CategoricalAnalysis {
  variable: string;
  label: string;
  categories: string[];
  groupLabels: string[];
  contingencyTable: ContingencyTable;
  chiSquareTest: ChiSquareTestResult;
  fisherExactTest: FisherExactTestResult | null;
  interpretation: string;
}

export interface ResearchStatsResponse {
  research: {
    id: string;
    title: string;
    description: string | null;
    surgeryType: string | null;
    isActive: boolean;
    startDate: Date;
    endDate: Date | null;
  };
  overview: OverviewStats;
  groups: GroupStats[];
  statisticalTests: StatisticalTests | null;
  categoricalAnalysis: CategoricalAnalysis[];
}
