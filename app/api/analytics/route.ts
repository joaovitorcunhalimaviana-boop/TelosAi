/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parseQuestionnaireData } from "@/lib/questionnaire-parser";

export const dynamic = "force-dynamic";

// Helper statistics functions
function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function standardDeviation(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const squaredDiffs = arr.map(x => Math.pow(x - m, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / (arr.length - 1));
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateRange = searchParams.get("dateRange") || "30";
    const surgeryType = searchParams.get("surgeryType") || "all";
    const includeAggregated = searchParams.get("aggregated") === "true";

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    // Base filter - ALWAYS exclude test patients
    const baseFilter: any = {
      userId: user.id,
      date: { gte: startDate },
      patient: { isTest: false },
    };

    if (surgeryType !== "all") {
      baseFilter.type = surgeryType;
    }

    // 1. EVOLUÇÃO DA DOR MÉDIA
    const painEvolution = await getPainEvolution(user.id, baseFilter);

    // 2. TAXA DE COMPLICAÇÕES
    const complicationsRate = await getComplicationsRate(user.id, startDate, surgeryType);

    // 3. FOLLOW-UPS POR STATUS
    const followUpsByStatus = await getFollowUpsByStatus(user.id, startDate, surgeryType);

    // 4. RED FLAGS POR CATEGORIA
    const redFlagsByCategory = await getRedFlagsByCategory(user.id, startDate, surgeryType);

    // 5. DADOS AGREGADOS (para publicação científica)
    let aggregatedData = null;
    if (includeAggregated) {
      aggregatedData = await getAggregatedData(user.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        painEvolution,
        complicationsRate,
        followUpsByStatus,
        redFlagsByCategory,
        ...(aggregatedData && { aggregatedData }),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar analytics:", error);
    return NextResponse.json(
      { error: "Erro ao buscar analytics" },
      { status: 500 }
    );
  }
}

// Pain evolution - uses centralized parser, takes only latest response per followUp
async function getPainEvolution(userId: string, baseFilter: any) {
  const surgeries = await prisma.surgery.findMany({
    where: baseFilter,
    include: {
      followUps: {
        include: {
          responses: {
            orderBy: { createdAt: 'desc' as const },
            take: 1,
          },
        },
      },
    },
  });

  const painByDayAndType: Record<string, Record<number, number[]>> = {};

  surgeries.forEach((surgery) => {
    const surgeryType = surgery.type;
    if (!painByDayAndType[surgeryType]) {
      painByDayAndType[surgeryType] = {};
    }

    surgery.followUps.forEach((followUp) => {
      if (followUp.responses.length === 0) return;
      const response = followUp.responses[0]; // latest (ordered desc, take 1)
      const parsed = parseQuestionnaireData(response.questionnaireData, {
        painAtRest: response.painAtRest,
        painDuringBowel: response.painDuringBowel,
      });
      const painLevel = parsed.painAtRest;
      if (painLevel === undefined || painLevel === null) return;
      const day = followUp.dayNumber;

      if (!painByDayAndType[surgeryType][day]) {
        painByDayAndType[surgeryType][day] = [];
      }
      painByDayAndType[surgeryType][day].push(Number(painLevel));
    });
  });

  const result: any[] = [];
  const days = [1, 2, 3, 5, 7, 10, 14];

  days.forEach((day) => {
    const dayData: any = { day: `D+${day}` };
    Object.keys(painByDayAndType).forEach((surgeryType) => {
      const painValues = painByDayAndType[surgeryType][day] || [];
      if (painValues.length > 0) {
        const avg = painValues.reduce((a, b) => a + b, 0) / painValues.length;
        dayData[surgeryType] = parseFloat(avg.toFixed(1));
      } else {
        dayData[surgeryType] = null;
      }
    });
    result.push(dayData);
  });

  return result;
}

// Complications rate - filter test patients
async function getComplicationsRate(userId: string, startDate: Date, surgeryType: string) {
  const filter: any = {
    userId,
    date: { gte: startDate },
    patient: { isTest: false },
  };

  if (surgeryType !== "all") {
    filter.type = surgeryType;
  }

  const surgeries = await prisma.surgery.findMany({
    where: filter,
    include: { details: true },
  });

  let withComplications = 0;
  let withoutComplications = 0;
  const complicationsBySurgeryType: Record<string, { with: number; without: number }> = {};

  surgeries.forEach((surgery) => {
    const hasComplication = surgery.details?.complications && surgery.details.complications.trim() !== "";
    const type = surgery.type;

    if (!complicationsBySurgeryType[type]) {
      complicationsBySurgeryType[type] = { with: 0, without: 0 };
    }

    if (hasComplication) {
      withComplications++;
      complicationsBySurgeryType[type].with++;
    } else {
      withoutComplications++;
      complicationsBySurgeryType[type].without++;
    }
  });

  const total = surgeries.length;
  const overallRate = total > 0 ? ((withComplications / total) * 100).toFixed(1) : "0.0";

  return {
    overall: {
      withComplications,
      withoutComplications,
      total,
      rate: parseFloat(overallRate),
    },
    bySurgeryType: Object.entries(complicationsBySurgeryType).map(([type, data]) => {
      const typeTotal = data.with + data.without;
      const rate = typeTotal > 0 ? ((data.with / typeTotal) * 100).toFixed(1) : "0.0";
      return {
        surgeryType: type,
        withComplications: data.with,
        withoutComplications: data.without,
        total: typeTotal,
        rate: parseFloat(rate),
      };
    }),
  };
}

// Follow-ups by status - filter test patients
async function getFollowUpsByStatus(userId: string, startDate: Date, surgeryType: string) {
  const filter: any = {
    userId,
    scheduledDate: { gte: startDate },
    surgery: {
      patient: { isTest: false },
    },
  };

  if (surgeryType !== "all") {
    filter.surgery = {
      ...filter.surgery,
      type: surgeryType,
    };
  }

  const followUps = await prisma.followUp.findMany({
    where: filter,
  });

  const statusCount: Record<string, number> = {
    pending: 0,
    sent: 0,
    responded: 0,
    overdue: 0,
    skipped: 0,
  };

  const now = new Date();

  followUps.forEach((followUp) => {
    if (followUp.status === "pending" && followUp.scheduledDate < now) {
      statusCount.overdue++;
    } else {
      statusCount[followUp.status] = (statusCount[followUp.status] || 0) + 1;
    }
  });

  return Object.entries(statusCount).map(([status, count]) => ({
    status,
    count,
  }));
}

// Red flags by category - filter test patients
async function getRedFlagsByCategory(userId: string, startDate: Date, surgeryType: string) {
  const filter: any = {
    userId,
    createdAt: { gte: startDate },
    followUp: {
      surgery: {
        patient: { isTest: false },
      },
    },
  };

  const responses = await prisma.followUpResponse.findMany({
    where: filter,
    include: {
      followUp: {
        include: { surgery: true },
      },
    },
  });

  const redFlagCategories: Record<string, number> = {
    febre: 0,
    sangramento: 0,
    dor_intensa: 0,
    retencao_urinaria: 0,
    outros: 0,
  };

  responses.forEach((response) => {
    if (surgeryType !== "all" && response.followUp.surgery.type !== surgeryType) {
      return;
    }

    if (response.redFlags) {
      try {
        const flags = JSON.parse(response.redFlags);
        flags.forEach((flag: string) => {
          const lowerFlag = flag.toLowerCase();
          if (lowerFlag.includes("febre")) {
            redFlagCategories.febre++;
          } else if (lowerFlag.includes("sangramento") || lowerFlag.includes("sangue")) {
            redFlagCategories.sangramento++;
          } else if (lowerFlag.includes("dor") && (lowerFlag.includes("intensa") || lowerFlag.includes("severa") || lowerFlag.includes("forte"))) {
            redFlagCategories.dor_intensa++;
          } else if (lowerFlag.includes("urin") || lowerFlag.includes("retenção")) {
            redFlagCategories.retencao_urinaria++;
          } else {
            redFlagCategories.outros++;
          }
        });
      } catch (e) {
        console.error("Erro ao parsear red flags:", e);
      }
    }
  });

  return Object.entries(redFlagCategories).map(([category, count]) => ({
    category,
    count,
  }));
}

// ============================================
// AGGREGATED DATA FOR SCIENTIFIC PUBLICATION
// ============================================
async function getAggregatedData(userId: string) {
  // Get ALL surgeries (no date filter) excluding test patients
  const surgeries = await prisma.surgery.findMany({
    where: {
      userId,
      patient: { isTest: false },
    },
    include: {
      patient: true,
      followUps: {
        include: {
          responses: {
            orderBy: { createdAt: 'desc' as const },
            take: 1,
          },
        },
      },
    },
  });

  const totalPatients = new Set(surgeries.map(s => s.patientId)).size;
  const totalSurgeries = surgeries.length;

  // Count by surgery type
  const bySurgeryType: Record<string, number> = {};
  surgeries.forEach(s => {
    bySurgeryType[s.type] = (bySurgeryType[s.type] || 0) + 1;
  });

  // Response rate
  const totalFollowUps = surgeries.reduce((sum, s) => sum + s.followUps.length, 0);
  const respondedFollowUps = surgeries.reduce((sum, s) =>
    sum + s.followUps.filter(f => f.status === 'responded').length, 0);
  const responseRate = totalFollowUps > 0 ? ((respondedFollowUps / totalFollowUps) * 100) : 0;

  // Pain at rest by day and surgery type
  const painAtRest = getPainByDayAndType(surgeries, 'painAtRest');

  // Pain during bowel movement by day and surgery type
  const painDuringBowel = getPainByDayAndType(surgeries, 'painDuringEvacuation');

  // First bowel movement stats by surgery type
  const firstBowelMovement = getFirstBowelMovementStats(surgeries);

  // Extra medication usage by day and surgery type
  const extraMedication = getExtraMedicationStats(surgeries);

  // Satisfaction stats by surgery type
  const satisfaction = getSatisfactionStats(surgeries);

  // Complications by day and surgery type
  const complications = getComplicationStats(surgeries);

  return {
    overview: {
      totalPatients,
      totalSurgeries,
      responseRate: parseFloat(responseRate.toFixed(1)),
      bySurgeryType: Object.entries(bySurgeryType).map(([type, count]) => ({
        surgeryType: type,
        count,
      })),
    },
    painAtRest,
    painDuringBowel,
    firstBowelMovement,
    extraMedication,
    satisfaction,
    complications,
  };
}

function getPainByDayAndType(surgeries: any[], painField: 'painAtRest' | 'painDuringEvacuation') {
  const data: Record<string, Record<number, number[]>> = {};

  surgeries.forEach(surgery => {
    const type = surgery.type;
    if (!data[type]) data[type] = {};

    surgery.followUps.forEach((followUp: any) => {
      if (!followUp.responses || followUp.responses.length === 0) return;
      // Take only the latest response (already ordered desc by createdAt, take 1)
      const response = followUp.responses[0];
      const parsed = parseQuestionnaireData(response.questionnaireData, {
        painAtRest: response.painAtRest,
        painDuringBowel: response.painDuringBowel,
      });
      const val = parsed[painField];
      if (val !== undefined && val !== null && !isNaN(Number(val))) {
        const day = followUp.dayNumber;
        if (!data[type][day]) data[type] = { ...data[type], [day]: [] };
        if (!data[type][day]) data[type][day] = [];
        data[type][day].push(Number(val));
      }
    });
  });

  const result: any[] = [];
  const allTypes = Object.keys(data);
  const allDays = new Set<number>();
  allTypes.forEach(type => Object.keys(data[type]).forEach(d => allDays.add(Number(d))));
  const sortedDays = [...allDays].sort((a, b) => a - b);

  sortedDays.forEach(day => {
    allTypes.forEach(type => {
      const values = data[type][day] || [];
      if (values.length > 0) {
        result.push({
          day,
          surgeryType: type,
          n: values.length,
          mean: parseFloat(mean(values).toFixed(1)),
          sd: parseFloat(standardDeviation(values).toFixed(1)),
          median: parseFloat(median(values).toFixed(1)),
          min: Math.min(...values),
          max: Math.max(...values),
        });
      }
    });
  });

  return result;
}

function getFirstBowelMovementStats(surgeries: any[]) {
  const byType: Record<string, number[]> = {};

  surgeries.forEach(surgery => {
    if (surgery.hadFirstBowelMovement && surgery.firstBowelMovementDay) {
      const type = surgery.type;
      if (!byType[type]) byType[type] = [];
      byType[type].push(surgery.firstBowelMovementDay);
    }
  });

  return Object.entries(byType).map(([type, days]) => ({
    surgeryType: type,
    n: days.length,
    meanDay: parseFloat(mean(days).toFixed(1)),
    sd: parseFloat(standardDeviation(days).toFixed(1)),
    medianDay: parseFloat(median(days).toFixed(1)),
    min: Math.min(...days),
    max: Math.max(...days),
  }));
}

function getExtraMedicationStats(surgeries: any[]) {
  const data: Record<string, Record<number, { used: number; total: number }>> = {};

  surgeries.forEach(surgery => {
    const type = surgery.type;
    if (!data[type]) data[type] = {};

    surgery.followUps.forEach((followUp: any) => {
      if (!followUp.responses || followUp.responses.length === 0) return;
      const response = followUp.responses[0]; // latest (ordered desc, take 1)
      try {
        const parsed = parseQuestionnaireData(response.questionnaireData);
        const day = followUp.dayNumber;
        if (!data[type][day]) data[type][day] = { used: 0, total: 0 };
        data[type][day].total++;
        if (parsed.usedExtraMedication === true) {
          data[type][day].used++;
        }
      } catch { /* skip */ }
    });
  });

  const result: any[] = [];
  Object.entries(data).forEach(([type, days]) => {
    Object.entries(days).forEach(([day, counts]) => {
      result.push({
        day: Number(day),
        surgeryType: type,
        percentUsed: parseFloat(((counts.used / counts.total) * 100).toFixed(1)),
        used: counts.used,
        n: counts.total,
      });
    });
  });

  return result.sort((a, b) => a.day - b.day || a.surgeryType.localeCompare(b.surgeryType));
}

function getSatisfactionStats(surgeries: any[]) {
  const byType: Record<string, { ratings: number[]; wouldRecommend: number; total: number }> = {};

  surgeries.forEach(surgery => {
    const type = surgery.type;

    surgery.followUps.forEach((followUp: any) => {
      if (followUp.dayNumber < 14) return; // Satisfaction only on D+14
      if (!followUp.responses || followUp.responses.length === 0) return;
      const response = followUp.responses[0]; // latest (ordered desc, take 1)
      try {
        const parsed = parseQuestionnaireData(response.questionnaireData);
        if (parsed.satisfactionRating !== undefined && parsed.satisfactionRating !== null) {
          if (!byType[type]) byType[type] = { ratings: [], wouldRecommend: 0, total: 0 };
          byType[type].ratings.push(Number(parsed.satisfactionRating));
          byType[type].total++;
          if (parsed.wouldRecommend === true) {
            byType[type].wouldRecommend++;
          }
        }
      } catch { /* skip */ }
    });
  });

  return Object.entries(byType).map(([type, data]) => ({
    surgeryType: type,
    n: data.total,
    meanRating: parseFloat(mean(data.ratings).toFixed(1)),
    sd: parseFloat(standardDeviation(data.ratings).toFixed(1)),
    medianRating: parseFloat(median(data.ratings).toFixed(1)),
    wouldRecommendPercent: data.total > 0 ? parseFloat(((data.wouldRecommend / data.total) * 100).toFixed(1)) : 0,
  }));
}

function getComplicationStats(surgeries: any[]) {
  const data: Record<string, Record<number, { fever: number; bleeding: number; retention: number; total: number }>> = {};

  surgeries.forEach(surgery => {
    const type = surgery.type;
    if (!data[type]) data[type] = {};

    surgery.followUps.forEach((followUp: any) => {
      if (!followUp.responses || followUp.responses.length === 0) return;
      const response = followUp.responses[0]; // latest (ordered desc, take 1)
      try {
        const parsed = parseQuestionnaireData(response.questionnaireData);
        const day = followUp.dayNumber;
        if (!data[type][day]) data[type][day] = { fever: 0, bleeding: 0, retention: 0, total: 0 };
        data[type][day].total++;

        if (parsed.fever === true) data[type][day].fever++;
        if (parsed.bleeding && parsed.bleeding !== 'none') data[type][day].bleeding++;
        if (parsed.urinated === false) data[type][day].retention++;
      } catch { /* skip */ }
    });
  });

  const result: any[] = [];
  Object.entries(data).forEach(([type, days]) => {
    Object.entries(days).forEach(([day, counts]) => {
      if (counts.total > 0) {
        result.push({
          day: Number(day),
          surgeryType: type,
          n: counts.total,
          feverRate: parseFloat(((counts.fever / counts.total) * 100).toFixed(1)),
          bleedingRate: parseFloat(((counts.bleeding / counts.total) * 100).toFixed(1)),
          retentionRate: parseFloat(((counts.retention / counts.total) * 100).toFixed(1)),
        });
      }
    });
  });

  return result.sort((a, b) => a.day - b.day || a.surgeryType.localeCompare(b.surgeryType));
}
