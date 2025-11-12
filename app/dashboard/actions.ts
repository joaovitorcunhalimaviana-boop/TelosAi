"use server"

import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, subDays } from "date-fns"
import { validateResearchFields } from "@/lib/research-field-validator"

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
}

export interface DashboardFilters {
  surgeryType?: SurgeryType | "all"
  dataStatus?: "all" | "incomplete" | "complete" | "research-incomplete"
  period?: "today" | "7days" | "30days" | "all"
  search?: string
  researchFilter?: "all" | "non-participants" | string // "all" | "non-participants" | researchId
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date()
  const todayStart = startOfDay(today)
  const todayEnd = endOfDay(today)

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

  return {
    todaySurgeries,
    activePatientsCount,
    pendingFollowUpsToday,
    criticalAlerts,
  }
}

export async function getDashboardPatients(
  filters: DashboardFilters = {}
): Promise<PatientCard[]> {
  const today = new Date()
  const todayStart = startOfDay(today)
  const todayEnd = endOfDay(today)

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
        take: 1,
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

    // Determinar o dia do follow-up
    let followUpDay = "D+0"
    if (latestFollowUp) {
      followUpDay = `D+${latestFollowUp.dayNumber}`
    } else if (daysSinceSurgery > 0) {
      followUpDay = `D+${daysSinceSurgery}`
    }

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
    }
  })

  // Filter research-incomplete post-query
  if (filters.dataStatus === "research-incomplete") {
    return patientCards.filter(card =>
      card.isResearchParticipant && !card.researchDataComplete
    )
  }

  return patientCards
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

  // For each research, count patients in each group
  const researchStats: ResearchStats[] = await Promise.all(
    researches.map(async (research) => {
      const groupCodes = research.groups.map(g => g.groupCode)

      // Count total patients in this research
      const researchPatientCount = await prisma.patient.count({
        where: {
          isActive: true,
          isResearchParticipant: true,
          researchGroup: {
            in: groupCodes,
          },
          ...(userId && { userId }),
        },
      })

      // Count patients in each group
      const groupStats = await Promise.all(
        research.groups.map(async (group) => {
          const count = await prisma.patient.count({
            where: {
              isActive: true,
              isResearchParticipant: true,
              researchGroup: group.groupCode,
              ...(userId && { userId }),
            },
          })

          return {
            groupCode: group.groupCode,
            groupName: group.groupName,
            patientCount: count,
          }
        })
      )

      return {
        researchId: research.id,
        researchTitle: research.title,
        patientCount: researchPatientCount,
        groups: groupStats,
      }
    })
  )

  return {
    totalPatients,
    nonParticipants,
    researches: researchStats,
  }
}
