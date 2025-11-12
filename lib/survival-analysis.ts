// Survival Analysis Utilities for Medical Research
// Kaplan-Meier Estimation and Cox Proportional Hazards Regression

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface SurvivalDataPoint {
  time: number;        // Time to event (in days)
  event: boolean;      // true = event occurred, false = censored
  group?: string;      // Group identifier for stratified analysis
  covariates?: number[]; // For Cox regression
}

export interface KaplanMeierPoint {
  time: number;
  atRisk: number;
  events: number;
  censored: number;
  survival: number;
  se: number;           // Standard error
  ciLower: number;      // 95% CI lower bound
  ciUpper: number;      // 95% CI upper bound
}

export interface KaplanMeierResult {
  timePoints: KaplanMeierPoint[];
  medianSurvival: {
    time: number | null;
    ciLower: number | null;
    ciUpper: number | null;
  };
  survivalAt: {
    time: number;
    survival: number;
    ciLower: number;
    ciUpper: number;
  }[];
}

export interface LogRankTestResult {
  chiSquare: number;
  df: number;
  pValue: number;
  significant: boolean;
}

export interface CoxRegressionResult {
  coefficients: {
    name: string;
    beta: number;
    se: number;
    hazardRatio: number;
    ciLower: number;
    ciUpper: number;
    zScore: number;
    pValue: number;
    significant: boolean;
  }[];
  concordanceIndex: number;
  logLikelihood: number;
}

// ============================================
// KAPLAN-MEIER ESTIMATION
// ============================================

/**
 * Calculate Kaplan-Meier survival estimates
 * @param data Array of survival data points
 * @returns Kaplan-Meier curve with survival probabilities and confidence intervals
 */
export function calculateKaplanMeier(data: SurvivalDataPoint[]): KaplanMeierResult {
  if (data.length === 0) {
    return {
      timePoints: [],
      medianSurvival: { time: null, ciLower: null, ciUpper: null },
      survivalAt: [],
    };
  }

  // Sort by time
  const sorted = [...data].sort((a, b) => a.time - b.time);

  // Get unique event times
  const uniqueTimes = Array.from(new Set(sorted.map(d => d.time))).sort((a, b) => a - b);

  const kmPoints: KaplanMeierPoint[] = [];
  let survival = 1.0;
  let variance = 0; // For Greenwood's formula

  uniqueTimes.forEach(time => {
    // At risk: all patients who haven't had event or been censored before this time
    const atRisk = sorted.filter(d => d.time >= time).length;

    // Events at this exact time
    const events = sorted.filter(d => d.time === time && d.event).length;

    // Censored at this exact time
    const censored = sorted.filter(d => d.time === time && !d.event).length;

    if (atRisk > 0 && events > 0) {
      // Update survival probability using Kaplan-Meier formula
      const survivalProbability = (atRisk - events) / atRisk;
      survival *= survivalProbability;

      // Greenwood's formula for variance
      variance += events / (atRisk * (atRisk - events));
    }

    // Standard error
    const se = survival * Math.sqrt(variance);

    // 95% Confidence interval using log-log transformation (more stable)
    const z = 1.96; // 95% CI
    const logSurvival = Math.log(-Math.log(survival));
    const seLogLog = se / (survival * Math.abs(Math.log(survival)));

    let ciLower = survival;
    let ciUpper = survival;

    if (survival > 0 && survival < 1) {
      ciLower = Math.exp(-Math.exp(logSurvival + z * seLogLog));
      ciUpper = Math.exp(-Math.exp(logSurvival - z * seLogLog));
    }

    // Ensure bounds are within [0, 1]
    ciLower = Math.max(0, Math.min(1, ciLower));
    ciUpper = Math.max(0, Math.min(1, ciUpper));

    kmPoints.push({
      time,
      atRisk,
      events,
      censored,
      survival,
      se,
      ciLower,
      ciUpper,
    });
  });

  // Calculate median survival time (time when survival drops below 0.5)
  const medianSurvival = calculateMedianSurvival(kmPoints);

  // Calculate survival at clinically relevant time points
  const survivalAt = [7, 14, 30, 60, 90, 180].map(time => {
    const point = findSurvivalAtTime(kmPoints, time);
    return {
      time,
      survival: point.survival,
      ciLower: point.ciLower,
      ciUpper: point.ciUpper,
    };
  });

  return {
    timePoints: kmPoints,
    medianSurvival,
    survivalAt,
  };
}

/**
 * Calculate median survival time with confidence interval
 */
function calculateMedianSurvival(
  kmPoints: KaplanMeierPoint[]
): { time: number | null; ciLower: number | null; ciUpper: number | null } {
  // Find first time when survival drops below 0.5
  const medianPoint = kmPoints.find(p => p.survival < 0.5);

  if (!medianPoint) {
    return { time: null, ciLower: null, ciUpper: null };
  }

  const medianTime = medianPoint.time;

  // Find CI bounds (first time when CI bounds cross 0.5)
  const ciLowerPoint = kmPoints.find(p => p.ciUpper < 0.5);
  const ciUpperPoint = kmPoints.find(p => p.ciLower < 0.5);

  return {
    time: medianTime,
    ciLower: ciLowerPoint ? ciLowerPoint.time : null,
    ciUpper: ciUpperPoint ? ciUpperPoint.time : null,
  };
}

/**
 * Find survival probability at a specific time point
 */
function findSurvivalAtTime(
  kmPoints: KaplanMeierPoint[],
  time: number
): { survival: number; ciLower: number; ciUpper: number } {
  // Find the last time point before or at the requested time
  const relevantPoints = kmPoints.filter(p => p.time <= time);

  if (relevantPoints.length === 0) {
    return { survival: 1.0, ciLower: 1.0, ciUpper: 1.0 };
  }

  const lastPoint = relevantPoints[relevantPoints.length - 1];
  return {
    survival: lastPoint.survival,
    ciLower: lastPoint.ciLower,
    ciUpper: lastPoint.ciUpper,
  };
}

// ============================================
// LOG-RANK TEST
// ============================================

/**
 * Log-rank test to compare survival curves between two groups
 * @param group1 Survival data for group 1
 * @param group2 Survival data for group 2
 * @returns Log-rank test statistics
 */
export function calculateLogRankTest(
  group1: SurvivalDataPoint[],
  group2: SurvivalDataPoint[]
): LogRankTestResult {
  // Combine and sort all data
  const allData = [
    ...group1.map(d => ({ ...d, group: 1 })),
    ...group2.map(d => ({ ...d, group: 2 })),
  ].sort((a, b) => a.time - b.time);

  // Get unique event times (only consider actual events, not censored)
  const eventTimes = Array.from(
    new Set(allData.filter(d => d.event).map(d => d.time))
  ).sort((a, b) => a - b);

  let observedGroup1 = 0;
  let expectedGroup1 = 0;
  let variance = 0;

  eventTimes.forEach(time => {
    // At each event time, calculate:
    const n1 = allData.filter(d => d.group === 1 && d.time >= time).length; // At risk in group 1
    const n2 = allData.filter(d => d.group === 2 && d.time >= time).length; // At risk in group 2
    const n = n1 + n2; // Total at risk

    const d1 = allData.filter(d => d.group === 1 && d.time === time && d.event).length; // Events in group 1
    const d2 = allData.filter(d => d.group === 2 && d.time === time && d.event).length; // Events in group 2
    const d = d1 + d2; // Total events

    if (n > 0 && d > 0) {
      // Expected events in group 1
      const expected = (n1 * d) / n;

      // Variance
      const v = (n1 * n2 * d * (n - d)) / (n * n * (n - 1));

      observedGroup1 += d1;
      expectedGroup1 += expected;
      variance += v;
    }
  });

  // Calculate chi-square statistic
  const chiSquare = variance > 0
    ? Math.pow(observedGroup1 - expectedGroup1, 2) / variance
    : 0;

  // Calculate p-value using chi-square distribution (df = 1)
  const pValue = calculateChiSquarePValue(chiSquare, 1);

  return {
    chiSquare,
    df: 1,
    pValue,
    significant: pValue < 0.05,
  };
}

/**
 * Approximate chi-square p-value calculation
 */
function calculateChiSquarePValue(chiSquare: number, df: number): number {
  // Simplified approximation for df = 1
  if (df === 1) {
    if (chiSquare > 10.83) return 0.001;
    if (chiSquare > 7.88) return 0.005;
    if (chiSquare > 6.63) return 0.01;
    if (chiSquare > 5.02) return 0.025;
    if (chiSquare > 3.84) return 0.05;
    if (chiSquare > 2.71) return 0.10;
    if (chiSquare > 1.64) return 0.20;
    return 0.50;
  }

  // For other df, return approximate value
  return chiSquare > 3.84 ? 0.05 : 0.10;
}

// ============================================
// COX PROPORTIONAL HAZARDS REGRESSION
// ============================================

/**
 * Cox proportional hazards regression (simplified implementation)
 * @param data Survival data with covariates
 * @param covariateNames Names of covariates
 * @returns Cox regression results with hazard ratios
 */
export function calculateCoxRegression(
  data: SurvivalDataPoint[],
  covariateNames: string[]
): CoxRegressionResult {
  if (data.length === 0 || !data[0].covariates) {
    return {
      coefficients: [],
      concordanceIndex: 0.5,
      logLikelihood: 0,
    };
  }

  const numCovariates = data[0].covariates.length;

  // Initialize coefficients (simplified - using univariate approach for each covariate)
  const coefficients = covariateNames.map((name, i) => {
    // Extract single covariate for univariate analysis
    const univariateData = data.map(d => ({
      time: d.time,
      event: d.event,
      covariate: d.covariates![i],
    }));

    // Simple univariate Cox regression
    const result = univariateCox(univariateData);

    return {
      name,
      beta: result.beta,
      se: result.se,
      hazardRatio: Math.exp(result.beta),
      ciLower: Math.exp(result.beta - 1.96 * result.se),
      ciUpper: Math.exp(result.beta + 1.96 * result.se),
      zScore: result.beta / result.se,
      pValue: calculateZPValue(result.beta / result.se),
      significant: Math.abs(result.beta / result.se) > 1.96,
    };
  });

  // Calculate concordance index (C-index)
  const cIndex = calculateConcordanceIndex(data);

  return {
    coefficients,
    concordanceIndex: cIndex,
    logLikelihood: 0, // Placeholder
  };
}

/**
 * Simplified univariate Cox regression
 */
function univariateCox(
  data: { time: number; event: boolean; covariate: number }[]
): { beta: number; se: number } {
  // Sort by time
  const sorted = [...data].sort((a, b) => a.time - b.time);

  // Simple approximation: use log-rank style approach
  let sumEvents = 0;
  let sumWeightedCovariate = 0;
  let variance = 0;

  const eventTimes = Array.from(new Set(sorted.filter(d => d.event).map(d => d.time)));

  eventTimes.forEach(time => {
    const atRisk = sorted.filter(d => d.time >= time);
    const events = sorted.filter(d => d.time === time && d.event);

    if (events.length > 0 && atRisk.length > 0) {
      const meanCovariate = atRisk.reduce((sum, d) => sum + d.covariate, 0) / atRisk.length;
      const varCovariate = atRisk.reduce((sum, d) => sum + Math.pow(d.covariate - meanCovariate, 2), 0) / atRisk.length;

      events.forEach(event => {
        sumEvents++;
        sumWeightedCovariate += event.covariate - meanCovariate;
        variance += varCovariate;
      });
    }
  });

  // Estimate beta
  const beta = sumEvents > 0 && variance > 0
    ? sumWeightedCovariate / variance
    : 0;

  // Estimate standard error
  const se = sumEvents > 0 && variance > 0
    ? Math.sqrt(1 / variance)
    : 1;

  return { beta, se };
}

/**
 * Calculate concordance index (C-index)
 * Measures discrimination ability of the model
 */
function calculateConcordanceIndex(data: SurvivalDataPoint[]): number {
  if (!data[0].covariates || data[0].covariates.length === 0) {
    return 0.5;
  }

  let concordant = 0;
  let discordant = 0;
  let ties = 0;

  // Compare all pairs
  for (let i = 0; i < data.length; i++) {
    for (let j = i + 1; j < data.length; j++) {
      const d1 = data[i];
      const d2 = data[j];

      // Only consider pairs where at least one has an event
      if (!d1.event && !d2.event) continue;

      // Determine which occurred first
      const earlier = d1.time < d2.time ? d1 : d2;
      const later = d1.time < d2.time ? d2 : d1;

      // Only count if earlier had event
      if (!earlier.event) continue;

      // Calculate risk scores (sum of covariates as simple risk score)
      const risk1 = d1.covariates!.reduce((sum, c) => sum + c, 0);
      const risk2 = d2.covariates!.reduce((sum, c) => sum + c, 0);

      // Check concordance
      if (earlier === d1) {
        if (risk1 > risk2) concordant++;
        else if (risk1 < risk2) discordant++;
        else ties++;
      } else {
        if (risk2 > risk1) concordant++;
        else if (risk2 < risk1) discordant++;
        else ties++;
      }
    }
  }

  const total = concordant + discordant + ties;
  return total > 0 ? (concordant + 0.5 * ties) / total : 0.5;
}

/**
 * Calculate p-value from z-score
 */
function calculateZPValue(z: number): number {
  const absZ = Math.abs(z);

  if (absZ > 3.29) return 0.001;
  if (absZ > 2.58) return 0.01;
  if (absZ > 1.96) return 0.05;
  if (absZ > 1.64) return 0.10;
  if (absZ > 1.28) return 0.20;

  return 0.50;
}

// ============================================
// HELPER FUNCTIONS FOR CLINICAL OUTCOMES
// ============================================

/**
 * Extract survival data for time to complication
 */
export function extractTimeToComplication(
  patients: any[]
): { overall: SurvivalDataPoint[]; byGroup: Map<string, SurvivalDataPoint[]> } {
  const overall: SurvivalDataPoint[] = [];
  const byGroup = new Map<string, SurvivalDataPoint[]>();

  patients.forEach(patient => {
    patient.surgeries?.forEach((surgery: any) => {
      const surgeryDate = new Date(surgery.date);
      const group = patient.researchGroup || 'unknown';

      // Look for complications in follow-ups
      let complicationTime: number | null = null;
      let lastFollowUpDay = 0;

      surgery.followUps?.forEach((followUp: any) => {
        lastFollowUpDay = Math.max(lastFollowUpDay, followUp.dayNumber);

        followUp.responses?.forEach((response: any) => {
          const redFlags = JSON.parse(response.redFlags || '[]');

          // If high risk or critical, consider it a complication
          if (
            (response.riskLevel === 'high' || response.riskLevel === 'critical') &&
            redFlags.length > 0 &&
            complicationTime === null
          ) {
            complicationTime = followUp.dayNumber;
          }
        });
      });

      const dataPoint: SurvivalDataPoint = {
        time: complicationTime || lastFollowUpDay || 14, // Use last follow-up or default
        event: complicationTime !== null,
        group,
      };

      overall.push(dataPoint);

      if (!byGroup.has(group)) {
        byGroup.set(group, []);
      }
      byGroup.get(group)!.push(dataPoint);
    });
  });

  return { overall, byGroup };
}

/**
 * Extract survival data for time to pain resolution
 */
export function extractTimeToPainResolution(
  patients: any[],
  painThreshold: number = 3
): { overall: SurvivalDataPoint[]; byGroup: Map<string, SurvivalDataPoint[]> } {
  const overall: SurvivalDataPoint[] = [];
  const byGroup = new Map<string, SurvivalDataPoint[]>();

  patients.forEach(patient => {
    patient.surgeries?.forEach((surgery: any) => {
      const group = patient.researchGroup || 'unknown';

      let resolutionTime: number | null = null;
      let lastFollowUpDay = 0;

      // Sort follow-ups by day
      const sortedFollowUps = [...(surgery.followUps || [])].sort(
        (a, b) => a.dayNumber - b.dayNumber
      );

      sortedFollowUps.forEach((followUp: any) => {
        lastFollowUpDay = Math.max(lastFollowUpDay, followUp.dayNumber);

        if (resolutionTime === null && followUp.responses?.length > 0) {
          const data = JSON.parse(followUp.responses[0].questionnaireData || '{}');

          if (data.painLevel !== undefined && data.painLevel < painThreshold) {
            resolutionTime = followUp.dayNumber;
          }
        }
      });

      const dataPoint: SurvivalDataPoint = {
        time: resolutionTime || lastFollowUpDay || 14,
        event: resolutionTime !== null,
        group,
      };

      overall.push(dataPoint);

      if (!byGroup.has(group)) {
        byGroup.set(group, []);
      }
      byGroup.get(group)!.push(dataPoint);
    });
  });

  return { overall, byGroup };
}

/**
 * Extract survival data for time to return to normal activities
 */
export function extractTimeToReturnToActivities(
  patients: any[]
): { overall: SurvivalDataPoint[]; byGroup: Map<string, SurvivalDataPoint[]> } {
  const overall: SurvivalDataPoint[] = [];
  const byGroup = new Map<string, SurvivalDataPoint[]>();

  patients.forEach(patient => {
    patient.surgeries?.forEach((surgery: any) => {
      const group = patient.researchGroup || 'unknown';

      let returnTime: number | null = null;
      let lastFollowUpDay = 0;

      surgery.followUps?.forEach((followUp: any) => {
        lastFollowUpDay = Math.max(lastFollowUpDay, followUp.dayNumber);

        if (returnTime === null && followUp.responses?.length > 0) {
          const data = JSON.parse(followUp.responses[0].questionnaireData || '{}');

          // Consider returned if pain < 3 and no complications
          if (
            data.painLevel !== undefined &&
            data.painLevel < 3 &&
            !data.urinaryRetention &&
            !data.bleeding
          ) {
            returnTime = followUp.dayNumber;
          }
        }
      });

      const dataPoint: SurvivalDataPoint = {
        time: returnTime || lastFollowUpDay || 30,
        event: returnTime !== null,
        group,
      };

      overall.push(dataPoint);

      if (!byGroup.has(group)) {
        byGroup.set(group, []);
      }
      byGroup.get(group)!.push(dataPoint);
    });
  });

  return { overall, byGroup };
}
