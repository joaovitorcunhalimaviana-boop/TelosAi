/**
 * Outcome calculations for research statistics
 * Handles pain scores, complications, follow-up rates
 */

import type { Patient, GroupStats, PainScore, FollowUp } from './types';

/** Minimal group info needed for calculations */
export interface GroupInfo {
  groupCode: string;
  groupName: string;
}

/**
 * Extract pain scores from follow-up responses
 */
export function extractPainScores(followUps: FollowUp[]): PainScore[] {
  return followUps
    .filter((f) => f.status === 'responded')
    .flatMap((f) => f.responses)
    .map((r) => {
      try {
        const data = JSON.parse(r.questionnaireData);
        const followUp = followUps.find((f) =>
          f.responses.some((resp) => resp.id === r.id)
        );
        return {
          day: followUp?.dayNumber || 0,
          painLevel: data.painLevel || 0,
        };
      } catch {
        return null;
      }
    })
    .filter((p): p is PainScore => p !== null);
}

/**
 * Calculate follow-up response rate
 */
export function calculateResponseRate(followUps: FollowUp[]): {
  responseRate: number;
  totalFollowUps: number;
  respondedFollowUps: number;
} {
  const totalFollowUps = followUps.length;
  const respondedFollowUps = followUps.filter((f) => f.status === 'responded').length;
  const responseRate = totalFollowUps > 0
    ? (respondedFollowUps / totalFollowUps) * 100
    : 0;

  return {
    responseRate: Math.round(responseRate * 10) / 10,
    totalFollowUps,
    respondedFollowUps,
  };
}

/**
 * Extract complications/red flags from follow-ups
 */
export function extractComplications(followUps: FollowUp[]): string[] {
  return followUps
    .flatMap((f) => f.responses)
    .map((r) => {
      try {
        return JSON.parse(r.redFlags || '[]');
      } catch {
        return [];
      }
    })
    .flat();
}

/**
 * Calculate complication rate
 */
export function calculateComplicationRate(followUps: FollowUp[]): number {
  const complications = extractComplications(followUps);
  return followUps.length > 0
    ? (complications.length / followUps.length) * 100
    : 0;
}

/**
 * Calculate complete outcome statistics for a group
 */
export function calculateGroupOutcomes(
  group: GroupInfo,
  patients: Patient[]
): Pick<GroupStats, 'responseRate' | 'painScores' | 'complicationRate' | 'totalFollowUps' | 'respondedFollowUps'> {
  const groupPatients = patients.filter((p) => p.researchGroup === group.groupCode);
  const followUps = groupPatients.flatMap((p) =>
    p.surgeries.flatMap((s) => s.followUps)
  );

  const { responseRate, totalFollowUps, respondedFollowUps } = calculateResponseRate(followUps);
  const painScores = extractPainScores(followUps);
  const complicationRate = calculateComplicationRate(followUps);

  return {
    responseRate,
    painScores,
    complicationRate: Math.round(complicationRate * 10) / 10,
    totalFollowUps,
    respondedFollowUps,
  };
}

/**
 * Get pain scores for a specific day from group stats
 */
export function getPainScoresForDay(
  painScores: PainScore[],
  day: number
): number[] {
  return painScores
    .filter((p) => p.day === day)
    .map((p) => p.painLevel);
}
