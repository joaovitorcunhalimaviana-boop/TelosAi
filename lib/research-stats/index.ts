/**
 * Research Statistics Module
 * Main orchestrator that combines demographics, outcomes, and statistical analysis
 */

import { calculateGroupDemographics, calculateOverallDemographics } from './demographics';
import { calculateGroupOutcomes } from './outcomes';
import { calculateStatisticalTests, performCategoricalAnalysis } from './statistical';
import type {
  Patient,
  Research,
  GroupStats,
  OverviewStats,
  StatisticalTests,
  CategoricalAnalysis,
  ResearchStatsResponse,
} from './types';

// Re-export types for external use
export * from './types';

// Re-export individual module functions for granular access
export {
  calculateAgeStats,
  calculateSexDistribution,
  calculateSurgeryTypes,
  calculateDataCompleteness,
  calculateComorbidities,
  calculateMedications,
  calculateGroupDemographics,
  calculateOverallDemographics,
  type GroupInfo,
} from './demographics';

export {
  extractPainScores,
  calculateResponseRate,
  extractComplications,
  calculateComplicationRate,
  calculateGroupOutcomes,
  getPainScoresForDay,
} from './outcomes';

export {
  performTTest,
  calculateStatisticalTests,
  analyzeSexDistribution,
  analyzeComplications,
  analyzeComorbidities,
  analyzeAnesthesiaTypes,
  analyzePudendalBlock,
  performCategoricalAnalysis,
} from './statistical';

/**
 * Calculate complete statistics for a single research group
 */
export function calculateGroupStats(
  group: { groupCode: string; groupName: string },
  patients: Patient[]
): GroupStats {
  const demographics = calculateGroupDemographics(group, patients);
  const outcomes = calculateGroupOutcomes(group, patients);

  return {
    ...demographics,
    ...outcomes,
  };
}

/**
 * Calculate complete research statistics
 * This is the main entry point for generating all research statistics
 */
export function calculateResearchStats(
  research: Research,
  patients: Patient[]
): ResearchStatsResponse {
  // Calculate group-level statistics
  const groupStats: GroupStats[] = research.groups.map((group) =>
    calculateGroupStats(group, patients)
  );

  // Calculate overall demographics
  const overview: OverviewStats = calculateOverallDemographics(
    patients,
    research.groups.length
  );

  // Perform statistical tests (t-test or ANOVA)
  const statisticalTests: StatisticalTests | null = calculateStatisticalTests(
    groupStats,
    patients
  );

  // Perform categorical analysis (chi-square tests)
  const categoricalAnalysis: CategoricalAnalysis[] = performCategoricalAnalysis(
    groupStats,
    patients
  );

  return {
    research: {
      id: research.id,
      title: research.title,
      description: research.description,
      surgeryType: research.surgeryType,
      isActive: research.isActive,
      startDate: research.startDate,
      endDate: research.endDate,
    },
    overview,
    groups: groupStats,
    statisticalTests,
    categoricalAnalysis,
  };
}
