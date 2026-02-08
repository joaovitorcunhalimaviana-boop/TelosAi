/**
 * Demographics calculations for research statistics
 * Handles age distributions, sex distributions, and basic patient demographics
 */

import { mean } from '@/lib/statistics';
import type { Patient, GroupStats, OverviewStats } from './types';

/** Minimal group info needed for calculations */
export interface GroupInfo {
  groupCode: string;
  groupName: string;
}

/**
 * Calculate age statistics for a group of patients
 */
export function calculateAgeStats(patients: Patient[]): {
  avgAge: number;
  ageRange: [number, number];
  ages: number[];
} {
  const ages = patients
    .filter((p) => p.age !== null)
    .map((p) => p.age as number);

  const avgAge = ages.length > 0 ? mean(ages) : 0;
  const ageRange: [number, number] = ages.length > 0
    ? [Math.min(...ages), Math.max(...ages)]
    : [0, 0];

  return { avgAge, ageRange, ages };
}

/**
 * Calculate sex distribution for a group of patients
 */
export function calculateSexDistribution(patients: Patient[]): Record<string, number> {
  return patients.reduce((acc, p) => {
    const sex = p.sex || 'Nao informado';
    acc[sex] = (acc[sex] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Calculate surgery type distribution for a group of patients
 */
export function calculateSurgeryTypes(patients: Patient[]): Record<string, number> {
  return patients
    .flatMap((p) => p.surgeries)
    .reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
}

/**
 * Calculate data completeness average for a group
 */
export function calculateDataCompleteness(patients: Patient[]): number {
  const completeness = patients
    .flatMap((p) => p.surgeries)
    .map((s) => s.dataCompleteness);
  return completeness.length > 0 ? mean(completeness) : 0;
}

/**
 * Calculate comorbidity distribution for a group
 */
export function calculateComorbidities(patients: Patient[]): Record<string, number> {
  return patients
    .flatMap((p) => p.comorbidities)
    .reduce((acc, c) => {
      const name = c.comorbidity.name;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
}

/**
 * Calculate medication distribution for a group
 */
export function calculateMedications(patients: Patient[]): Record<string, number> {
  return patients
    .flatMap((p) => p.medications)
    .reduce((acc, m) => {
      const name = m.medication.name;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
}

/**
 * Calculate complete group demographics statistics
 */
export function calculateGroupDemographics(
  group: GroupInfo,
  patients: Patient[]
): Pick<GroupStats,
  'groupCode' | 'groupName' | 'patientCount' | 'avgAge' | 'ageRange' |
  'sexDistribution' | 'surgeryTypes' | 'avgCompleteness' | 'comorbidities' | 'medications'
> {
  const groupPatients = patients.filter((p) => p.researchGroup === group.groupCode);
  const { avgAge, ageRange } = calculateAgeStats(groupPatients);

  return {
    groupCode: group.groupCode,
    groupName: group.groupName,
    patientCount: groupPatients.length,
    avgAge: Math.round(avgAge * 10) / 10,
    ageRange,
    sexDistribution: calculateSexDistribution(groupPatients),
    surgeryTypes: calculateSurgeryTypes(groupPatients),
    avgCompleteness: Math.round(calculateDataCompleteness(groupPatients)),
    comorbidities: calculateComorbidities(groupPatients),
    medications: calculateMedications(groupPatients),
  };
}

/**
 * Calculate overall demographics for all patients
 */
export function calculateOverallDemographics(
  patients: Patient[],
  totalGroups: number
): OverviewStats {
  const { avgAge } = calculateAgeStats(patients);
  const sexDistribution = calculateSexDistribution(patients);
  const dataCompleteness = calculateDataCompleteness(patients);

  return {
    totalPatients: patients.length,
    avgAge: Math.round(avgAge * 10) / 10,
    sexDistribution,
    dataCompleteness: Math.round(dataCompleteness),
    totalGroups,
  };
}
