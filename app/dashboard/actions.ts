/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { subDays } from "date-fns"
import { validateResearchFields } from "@/lib/research-field-validator"
import { getNowBrasilia, startOfDayBrasilia, endOfDayBrasilia } from "@/lib/date-utils"

export type SurgeryType = "hemorroidectomia" | "fistula" | "fissura" | "pilonidal"

export interface DashboardStats {
  todaySurgeries: number
  activePatientsCount: number
  pendingFollowUpsToday: number
  criticalAlerts: number
}

export interface PatientCard {
  id: string
  patientName: string
  phone: string // Telefone do paciente para WhatsApp
  surgeryType: SurgeryType
  surgeryDate: Date
  daysSinceSurgery: number
  followUpDay: string
  status: "active" | "completed" | "cancelled"
  dataCompleteness: number
  hasRedFlags: boolean
  redFlags: string[]
  patientId: string
  patientCreatedAt: Date // For NEW badge detection
  isResearchParticipant: boolean // For research badge
  researchGroup: string | null // Research group name
  researchDataComplete: boolean // Research fields validation
  researchMissingFieldsCount: number // Number of missing required fields
  painHistory: { day: string; value: number; evacuation: number }[]
  latestResponse?: {
    riskLevel: "low" | "medium" | "high" | "critical"
  } | null
}

export interface DashboardFilters {
  surgeryType?: SurgeryType | "all"
  dataStatus?: "all" | "incomplete" | "complete" | "research-incomplete"
  period?: "today" | "7days" | "30days" | "all"
  search?: string
  researchFilter?: "all" | "non-participants" | string // "all" | "non-participants" | researchId
}

// Cached version of getDashboardStats
const getCachedDashboardStatsInternal = unstable_cache(
  async () => {
    const startTime = Date.now()
    const today = getNowBrasilia()
    const todayStart = startOfDayBrasilia()
    const todayEnd = endOfDayBrasilia()

    // Total de cirurgias hoje
    const todaySurgeries = await prisma.surgery.count({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    })

    // Pacientes em acompanhamento ativo
    const activePatientsCount = await prisma.surgery.count({
      where: {
        status: "active",
      },
    })

    // Follow-ups pendentes para hoje
    const pendingFollowUpsToday = await prisma.followUp.count({
      where: {
        scheduledDate: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: {
          in: ["pending", "sent"],
        },
      },
    })

    // Alertas críticos (red flags)
    const criticalAlerts = await prisma.followUpResponse.count({
      where: {
        riskLevel: {
          in: ["high", "critical"],
        },
        doctorAlerted: false,
        createdAt: {
          gte: subDays(today, 7), // Últimos 7 dias
        },
      },
    })

    const duration = Date.now() - startTime
    console.log(`[CACHE] Dashboard stats action computed in ${duration}ms`)

    return {
      todaySurgeries,
      activePatientsCount,
      pendingFollowUpsToday,
      criticalAlerts,
    }
  },
  ['dashboard-stats-action'],
  {
    revalidate: 300, // 5 minutes
    tags: ['dashboard', 'dashboard-stats'],
  }
)

export async function getDashboardStats(): Promise<DashboardStats> {
  const startTime = Date.now()
  const stats = await getCachedDashboardStatsInternal()
  const duration = Date.now() - startTime
  console.log(`[CACHE] Dashboard stats action served in ${duration}ms`)
  return stats
}

// Cached version of getDashboardPatients with filter-based cache key
const getCachedDashboardPatientsInternal = unstable_cache(
  async (filters: DashboardFilters) => {
    const startTime = Date.now()
    const today = getNowBrasilia()
    const todayStart = startOfDayBrasilia()
    const todayEnd = endOfDayBrasilia()

    // Construir filtros dinâmicos
    const whereClause: any = {
      status: "active",
    }

    // Filtro por tipo de cirurgia
    if (filters.surgeryType && filters.surgeryType !== "all") {
      whereClause.type = filters.surgeryType
    }

    // Filtro por completude de dados
    if (filters.dataStatus === "incomplete") {
      whereClause.dataCompleteness = {
        lt: 100,
      }
    } else if (filters.dataStatus === "complete") {
      whereClause.dataCompleteness = 100
    } else if (filters.dataStatus === "research-incomplete") {
      // This will be filtered post-query since it requires validation logic
      if (!whereClause.patient) {
        whereClause.patient = {}
      }
      whereClause.patient.isResearchParticipant = true
    }

    // Filtro por período
    if (filters.period === "today") {
      whereClause.date = {
        gte: todayStart,
        lte: todayEnd,
      }
    } else if (filters.period === "7days") {
      whereClause.date = {
        gte: subDays(today, 7),
      }
    } else if (filters.period === "30days") {
      whereClause.date = {
        gte: subDays(today, 30),
      }
    }

    // Filtro por busca (nome ou telefone)
    if (filters.search) {
      whereClause.patient = {
        OR: [
          {
            name: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: filters.search,
            },
          },
        ],
      }
    }

    // Filtro por pesquisa
    if (filters.researchFilter && filters.researchFilter !== "all") {
      if (filters.researchFilter === "non-participants") {
        // Pacientes que NÃO estão em nenhuma pesquisa
        if (!whereClause.patient) {
          whereClause.patient = {}
        }
        whereClause.patient.isResearchParticipant = false
      } else {
        // Filtrar por pesquisa específica (researchId)
        // Precisamos buscar os grupos dessa pesquisa e filtrar pelos groupCodes
        const researchGroups = await prisma.researchGroup.findMany({
          where: {
            researchId: filters.researchFilter,
          },
          select: {
            groupCode: true,
          },
        })

        const groupCodes = researchGroups.map(g => g.groupCode)

        if (!whereClause.patient) {
          whereClause.patient = {}
        }
        whereClause.patient.isResearchParticipant = true
        whereClause.patient.researchGroup = {
          in: groupCodes,
        }
      }
    }

    const surgeries = await prisma.surgery.findMany({
      where: whereClause,
      include: {
        patient: true,
        followUps: {
          orderBy: {
            dayNumber: "desc",
          },
          take: 7,
          include: {
            responses: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    // Transformar em PatientCards
    const patientCards: PatientCard[] = surgeries.map((surgery) => {
      const daysSinceSurgery = Math.floor(
        (today.getTime() - surgery.date.getTime()) / (1000 * 60 * 60 * 24)
      )

      const latestFollowUp = surgery.followUps[0]
      const latestResponse = latestFollowUp?.responses[0]

      let hasRedFlags = false
      let redFlags: string[] = []

      if (latestResponse) {
        hasRedFlags = latestResponse.riskLevel === "high" || latestResponse.riskLevel === "critical"
        if (latestResponse.redFlags) {
          try {
            redFlags = JSON.parse(latestResponse.redFlags)
          } catch {
            redFlags = []
          }
        }
      }

      // Determinar o dia do follow-up e histórico de dor
      let followUpDay = "D+0"
      if (latestFollowUp) {
        followUpDay = `D+${latestFollowUp.dayNumber}`
      } else if (daysSinceSurgery > 0) {
        followUpDay = `D+${daysSinceSurgery}`
      }

      // Extract pain history for sparkline
      const painHistory = surgery.followUps
        .filter(f => f.responses.length > 0)
        .map(f => {
          const response = f.responses[0];
          let painValue = 0;
          let evacuationValue = 0;

          // Priority 1: New typed columns
          if (response.painAtRest !== null && response.painAtRest !== undefined) {
            painValue = response.painAtRest;
          } else {
            // Priority 2: JSON Fallback (Legacy)
            try {
              const data = JSON.parse(response.questionnaireData);
              painValue = Number(data.pain || data.dor || data.nivel_dor || 0);
            } catch {
              painValue = 0;
            }
          }

          if (response.painDuringBowel !== null && response.painDuringBowel !== undefined) {
            evacuationValue = response.painDuringBowel;
          } else {
            // Priority 2: JSON Fallback (Legacy)
            try {
              const data = JSON.parse(response.questionnaireData);
              // IA salva como painDuringBowel
              evacuationValue = Number(data.painDuringBowel || data.evacuationPain || data.dor_evacuar || data.pain_evacuation || 0);
            } catch {
              evacuationValue = 0;
            }
          }

          return {
            day: `D+${f.dayNumber}`,
            value: isNaN(painValue) ? 0 : painValue,
            evacuation: isNaN(evacuationValue) ? 0 : evacuationValue,
            dayNumber: f.dayNumber // Auxiliar para ordenação
          };
        })
        .sort((a, b) => a.dayNumber - b.dayNumber) // Ordenar cronologicamente
        .map(({ day, value, evacuation }) => ({ day, value, evacuation }));

      // Validate research fields if participant
      let researchDataComplete = true
      let researchMissingFieldsCount = 0

      if (surgery.patient.isResearchParticipant) {
        const validation = validateResearchFields({
          ...surgery.patient,
          surgery: {
            type: surgery.type,
            date: surgery.date,
            hospital: surgery.hospital,
          }
        })
        researchDataComplete = validation.isComplete
        researchMissingFieldsCount = validation.missingFields.length
      }

      return {
        id: surgery.id,
        patientName: surgery.patient.name,
        phone: surgery.patient.phone, // Telefone para WhatsApp
        surgeryType: surgery.type as SurgeryType,
        surgeryDate: surgery.date,
        daysSinceSurgery,
        followUpDay,
        status: surgery.status as "active" | "completed" | "cancelled",
        dataCompleteness: surgery.dataCompleteness,
        hasRedFlags,
        redFlags,
        patientId: surgery.patientId,
        patientCreatedAt: surgery.patient.createdAt,
        isResearchParticipant: surgery.patient.isResearchParticipant,
        researchGroup: surgery.patient.researchGroup,
        researchDataComplete,
        researchMissingFieldsCount,
        painHistory, // Adicionado campo de histórico de dor
        latestResponse: latestResponse ? {
          riskLevel: latestResponse.riskLevel as "low" | "medium" | "high" | "critical"
        } : null,
      }
    })

    // Filter research-incomplete post-query
    if (filters.dataStatus === "research-incomplete") {
      const filtered = patientCards.filter(card =>
        card.isResearchParticipant && !card.researchDataComplete
      )
      const duration = Date.now() - startTime
      console.log(`[CACHE] Dashboard patients computed in ${duration}ms (${filtered.length} results)`)
      return filtered
    }

    const duration = Date.now() - startTime
    console.log(`[CACHE] Dashboard patients computed in ${duration}ms (${patientCards.length} results)`)
    return patientCards
  },
  ['dashboard-patients-list'],
  {
    revalidate: 1,
    tags: ['dashboard', 'dashboard-patients']
  }
)

export async function getDashboardPatients(
  filters: DashboardFilters = {}
): Promise<PatientCard[]> {
  return getCachedDashboardPatientsInternal(filters)
}

export async function getPatientSummary(surgeryId: string) {
  const surgery = await prisma.surgery.findUnique({
    where: { id: surgeryId },
    include: {
      patient: {
        include: {
          comorbidities: {
            include: {
              comorbidity: true,
            },
          },
          medications: {
            include: {
              medication: true,
            },
          },
        },
      },
      details: true,
      preOp: true,
      anesthesia: true,
      postOp: true,
      followUps: {
        include: {
          responses: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        orderBy: {
          dayNumber: "asc",
        },
      },
    },
  })

  return surgery
}

export interface ResearchStats {
  researchId: string
  researchTitle: string
  patientCount: number
  groups: {
    groupCode: string
    groupName: string
    patientCount: number
  }[]
}

export async function getResearchStats(userId?: string): Promise<{
  totalPatients: number
  nonParticipants: number
  researches: ResearchStats[]
}> {
  // Get total active patients
  const totalPatients = await prisma.patient.count({
    where: {
      isActive: true,
      ...(userId && { userId }),
    },
  })

  // Get non-research participants
  const nonParticipants = await prisma.patient.count({
    where: {
      isActive: true,
      isResearchParticipant: false,
      ...(userId && { userId }),
    },
  })

  // Get all active researches with their groups
  const researches = await prisma.research.findMany({
    where: {
      isActive: true,
      ...(userId && { userId }),
    },
    include: {
      groups: {
        orderBy: {
          groupCode: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Get all patients grouped by research group in a single query to avoid N+1
  const patientsByGroup = await prisma.patient.groupBy({
    by: ['researchGroup'],
    where: {
      isActive: true,
      isResearchParticipant: true,
      ...(userId && { userId }),
    },
    _count: {
      id: true,
    },
  })

  // Create a map for O(1) lookup
  const groupCountMap = new Map<string, number>()
  patientsByGroup.forEach((group) => {
    if (group.researchGroup) {
      groupCountMap.set(group.researchGroup, group._count.id)
    }
  })

  // Build research stats using the precomputed counts (no more N+1 queries)
  const researchStats: ResearchStats[] = researches.map((research) => {
    const groupCodes = research.groups.map(g => g.groupCode)

    // Calculate total patients in this research by summing group counts
    const researchPatientCount = groupCodes.reduce((total, code) => {
      return total + (groupCountMap.get(code) || 0)
    }, 0)

    // Build group stats using the map
    const groupStats = research.groups.map((group) => {
      return {
        groupCode: group.groupCode,
        groupName: group.groupName,
        patientCount: groupCountMap.get(group.groupCode) || 0,
      }
    })

    return {
      researchId: research.id,
      researchTitle: research.title,
      patientCount: researchPatientCount,
      groups: groupStats,
    }
  })

  return {
    totalPatients,
    nonParticipants,
    researches: researchStats,
  }
}

export interface RecentActivity {
  id: string
  patientId: string
  patientName: string
  surgeryType: string
  dayNumber: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  summary: string
  timestamp: Date
  isRead: boolean
}

/**
 * Busca o histórico completo de conversas de um paciente
 */
export async function getPatientConversationHistory(patientId: string) {
  // Buscar a conversa do paciente
  const conversation = await prisma.conversation.findFirst({
    where: { patientId }
  });

  if (!conversation || !conversation.messageHistory) {
    return [];
  }

  // Formatar mensagens para exibição
  const messageHistory = (conversation.messageHistory as any[]) || [];

  return messageHistory.map((msg: any) => ({
    role: msg.role === 'system' ? 'assistant' : msg.role,
    content: msg.content,
    timestamp: msg.timestamp || null
  }));
}

export async function getRecentPatientActivity(limit = 10): Promise<RecentActivity[]> {
  const responses = await prisma.followUpResponse.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      followUp: {
        include: {
          patient: {
            select: {
              id: true,
              name: true
            }
          },
          surgery: {
            select: {
              type: true
            }
          }
        }
      }
    }
  })

  return responses.map(r => ({
    id: r.id,
    patientId: r.followUp.patient.id,
    patientName: r.followUp.patient.name,
    surgeryType: r.followUp.surgery.type,
    dayNumber: r.followUp.dayNumber,
    riskLevel: r.riskLevel as 'low' | 'medium' | 'high' | 'critical',
    summary: r.aiAnalysis || 'Resposta recebida',
    timestamp: r.createdAt,
    isRead: r.doctorAlerted
  }))
}
