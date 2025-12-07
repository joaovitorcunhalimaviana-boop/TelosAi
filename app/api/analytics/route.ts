/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateRange = searchParams.get("dateRange") || "30"; // dias
    const surgeryType = searchParams.get("surgeryType") || "all";

    // Calcular data de início baseada no range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    // Filtro base
    const baseFilter: any = {
      userId: user.id,
      date: {
        gte: startDate,
      },
    };

    if (surgeryType !== "all") {
      baseFilter.type = surgeryType;
    }

    // 1. EVOLUÇÃO DA DOR MÉDIA (D+1 a D+14)
    const painEvolution = await getPainEvolution(user.id, baseFilter);

    // 2. TAXA DE COMPLICAÇÕES POR TIPO DE CIRURGIA
    const complicationsRate = await getComplicationsRate(user.id, startDate, surgeryType);

    // 3. FOLLOW-UPS POR STATUS
    const followUpsByStatus = await getFollowUpsByStatus(user.id, startDate, surgeryType);

    // 4. RED FLAGS POR CATEGORIA
    const redFlagsByCategory = await getRedFlagsByCategory(user.id, startDate, surgeryType);

    return NextResponse.json({
      success: true,
      data: {
        painEvolution,
        complicationsRate,
        followUpsByStatus,
        redFlagsByCategory,
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

// Função auxiliar: Evolução da dor média
async function getPainEvolution(userId: string, baseFilter: any) {
  const surgeries = await prisma.surgery.findMany({
    where: baseFilter,
    include: {
      followUps: {
        include: {
          responses: true,
        },
      },
    },
  });

  // Agrupar por dia e tipo de cirurgia
  const painByDayAndType: Record<string, Record<number, number[]>> = {};

  surgeries.forEach((surgery) => {
    const surgeryType = surgery.type;
    if (!painByDayAndType[surgeryType]) {
      painByDayAndType[surgeryType] = {};
    }

    surgery.followUps.forEach((followUp) => {
      followUp.responses.forEach((response) => {
        try {
          const data = JSON.parse(response.questionnaireData);
          const painLevel = data.painLevel || data.dor || 0;
          const day = followUp.dayNumber;

          if (!painByDayAndType[surgeryType][day]) {
            painByDayAndType[surgeryType][day] = [];
          }
          painByDayAndType[surgeryType][day].push(painLevel);
        } catch (e) {
          console.error("Erro ao parsear questionnaireData:", e);
        }
      });
    });
  });

  // Calcular médias
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

// Função auxiliar: Taxa de complicações
async function getComplicationsRate(userId: string, startDate: Date, surgeryType: string) {
  const filter: any = {
    userId,
    date: { gte: startDate },
  };

  if (surgeryType !== "all") {
    filter.type = surgeryType;
  }

  const surgeries = await prisma.surgery.findMany({
    where: filter,
    include: {
      details: true,
    },
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

// Função auxiliar: Follow-ups por status
async function getFollowUpsByStatus(userId: string, startDate: Date, surgeryType: string) {
  const filter: any = {
    userId,
    scheduledDate: { gte: startDate },
  };

  if (surgeryType !== "all") {
    filter.surgery = {
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

// Função auxiliar: Red flags por categoria
async function getRedFlagsByCategory(userId: string, startDate: Date, surgeryType: string) {
  const filter: any = {
    userId,
    createdAt: { gte: startDate },
  };

  const responses = await prisma.followUpResponse.findMany({
    where: filter,
    include: {
      followUp: {
        include: {
          surgery: true,
        },
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
    // Filtrar por tipo de cirurgia se especificado
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
