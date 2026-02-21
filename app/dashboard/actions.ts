/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { subDays } from "date-fns"
import { validateResearchFields } from "@/lib/research-field-validator"
import { getNowBrasilia, startOfDayBrasilia, endOfDayBrasilia } from "@/lib/date-utils"
import { parseQuestionnaireData } from "@/lib/questionnaire-parser"
import { auth } from "@/lib/auth"

export type SurgeryType = "hemorroidectomia" | "fistula" | "fissura" | "pilonidal"

export interface DashboardStats {
  totalPatients: number
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
    usedExtraMedication?: boolean
    extraMedicationDetails?: string | null
    localCareAdherence?: boolean | null
  } | null
}

export interface DashboardFilters {
  surgeryType?: SurgeryType | "all"
  dataStatus?: "all" | "incomplete" | "complete" | "research-incomplete"
  period?: "today" | "7days" | "30days" | "all"
  search?: string
  researchFilter?: "all" | "non-participants" | string // "all" | "non-participants" | researchId
  followUpStatus?: "active" | "completed" | "all"
}

// Cached version of getDashboardStats - SECURITY: Requires userId for patient isolation
const getCachedDashboardStatsInternal = unstable_cache(
  async (userId: string) => {
    const startTime = Date.now()
    const today = getNowBrasilia()
    const todayStart = startOfDayBrasilia()
    const todayEnd = endOfDayBrasilia()

    // SECURITY: All queries filter by userId to ensure doctor only sees their own patients
    // Total de pacientes (ativos + concluídos, exclui excluídos pois cascade delete remove do banco)
    const totalPatients = await prisma.surgery.count({
      where: {
        status: { in: ["active", "completed"] },
        patient: {
          userId: userId,
        },
      },
    })

    // Pacientes em acompanhamento ativo (only for this doctor)
    const activePatientsCount = await prisma.surgery.count({
      where: {
        status: "active",
        patient: {
          userId: userId,
        },
      },
    })

    // Follow-ups pendentes para hoje (only for this doctor's patients, apenas cirurgias ativas)
    const pendingFollowUpsToday = await prisma.followUp.count({
      where: {
        scheduledDate: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: {
          in: ["pending", "sent"],
        },
        surgery: {
          status: "active",
        },
        patient: {
          userId: userId,
        },
      },
    })

    // Alertas críticos (red flags) (only for this doctor's patients)
    const criticalAlerts = await prisma.followUpResponse.count({
      where: {
        riskLevel: {
          in: ["high", "critical"],
        },
        doctorAlerted: false,
        createdAt: {
          gte: subDays(today, 7), // Últimos 7 dias
        },
        followUp: {
          patient: {
            userId: userId,
          },
        },
      },
    })

    const duration = Date.now() - startTime
    console.log(`[CACHE] Dashboard stats action computed in ${duration}ms for user ${userId}`)

    return {
      totalPatients,
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
  // SECURITY: Get current user session for patient isolation
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autenticado")
  }

  const startTime = Date.now()
  const stats = await getCachedDashboardStatsInternal(session.user.id)
  const duration = Date.now() - startTime
  console.log(`[CACHE] Dashboard stats action served in ${duration}ms`)
  return stats
}

// Cached version of getDashboardPatients with filter-based cache key
// SECURITY: Requires userId for patient isolation
const getCachedDashboardPatientsInternal = unstable_cache(
  async (filters: DashboardFilters, userId: string) => {
    const startTime = Date.now()
    const today = getNowBrasilia()
    const todayStart = startOfDayBrasilia()
    const todayEnd = endOfDayBrasilia()

    // SECURITY: Construct filters with mandatory userId to ensure doctor only sees their own patients
    const whereClause: any = {
      status: filters.followUpStatus === "completed"
        ? "completed"
        : filters.followUpStatus === "all"
          ? { in: ["active", "completed"] }
          : "active", // default to active
      patient: {
        userId: userId,
      },
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
      // SECURITY: Preserve userId filter when adding patient conditions
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
    // SECURITY: Merge with existing patient filter to preserve userId
    if (filters.search) {
      whereClause.patient = {
        ...whereClause.patient,
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
    // SECURITY: Merge with existing patient filter to preserve userId
    if (filters.researchFilter && filters.researchFilter !== "all") {
      if (filters.researchFilter === "non-participants") {
        // Pacientes que NÃO estão em nenhuma pesquisa
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

      // Extract pain history for sparkline using centralized parser
      const painHistory = surgery.followUps
        .filter(f => f.responses.length > 0)
        .map(f => {
          const response = f.responses[0];
          const parsed = parseQuestionnaireData(response.questionnaireData, {
            painAtRest: response.painAtRest,
            painDuringBowel: response.painDuringBowel,
          });

          return {
            day: `D+${f.dayNumber}`,
            value: parsed.painAtRest ?? 0,
            evacuation: parsed.painDuringEvacuation ?? 0,
            dayNumber: f.dayNumber,
          };
        })
        .sort((a, b) => a.dayNumber - b.dayNumber)
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
        latestResponse: latestResponse ? (() => {
          const parsedLatest = parseQuestionnaireData(latestResponse.questionnaireData, {
            painAtRest: latestResponse.painAtRest,
            painDuringBowel: latestResponse.painDuringBowel,
          });
          return {
            riskLevel: latestResponse.riskLevel as "low" | "medium" | "high" | "critical",
            usedExtraMedication: parsedLatest.usedExtraMedication,
            extraMedicationDetails: parsedLatest.extraMedicationDetails,
            localCareAdherence: parsedLatest.localCareAdherence,
          };
        })() : null,
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
  // SECURITY: Get current user session for patient isolation
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autenticado")
  }

  return getCachedDashboardPatientsInternal(filters, session.user.id)
}

export async function getPatientSummary(surgeryId: string) {
  // SECURITY: Get current user session for patient isolation
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autenticado")
  }

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

  // SECURITY: Verify patient belongs to the logged-in doctor
  if (surgery && surgery.patient.userId !== session.user.id) {
    throw new Error("Acesso negado: paciente não pertence a este médico")
  }

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

export interface TodayTask {
  id: string
  followUpId: string
  patientId: string
  patientName: string
  patientPhone: string
  surgeryType: string
  dayNumber: number
  scheduledDate: Date
  status: 'overdue' | 'in_progress' | 'pending_today'
  followUpStatus: string // original status from DB (pending, sent, in_progress)
}

export interface TodayTasksResult {
  overdue: TodayTask[]
  inProgress: TodayTask[]
  pendingToday: TodayTask[]
}

/**
 * Busca o histórico completo de conversas de um paciente
 * Agrega mensagens de TODAS as fontes: Conversation.messageHistory + FollowUpResponse.questionnaireData
 */
export async function getPatientConversationHistory(patientId: string) {
  // SECURITY: Get current user session for patient isolation
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autenticado")
  }

  // SECURITY: Verify patient belongs to the logged-in doctor
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { userId: true },
  })

  if (!patient) {
    throw new Error("Paciente não encontrado")
  }

  if (patient.userId !== session.user.id) {
    throw new Error("Acesso negado: paciente não pertence a este médico")
  }

  const allMessages: Array<{ role: string; content: string; timestamp: string | null; dayNumber?: number }> = [];

  // 1. Buscar mensagens da tabela Conversation (se existir)
  const conversation = await prisma.conversation.findFirst({
    where: { patientId }
  });

  if (conversation?.messageHistory) {
    const history = (conversation.messageHistory as any[]) || [];
    for (const msg of history) {
      allMessages.push({
        role: msg.role === 'system' ? 'assistant' : msg.role,
        content: msg.content,
        timestamp: msg.timestamp || null
      });
    }
  }

  // 2. Buscar TODOS os follow-ups com respostas e dados de envio
  const followUps = await prisma.followUp.findMany({
    where: { patientId },
    include: {
      patient: {
        select: {
          name: true,
          user: { select: { nomeCompleto: true } }
        }
      },
      responses: {
        orderBy: { createdAt: 'asc' },
      }
    },
    orderBy: { dayNumber: 'asc' }
  });

  for (const followUp of followUps) {
    // 2a. Se o follow-up foi enviado (template), adicionar mensagem sintética do template
    if (followUp.sentAt) {
      const firstName = followUp.patient?.name?.split(' ')[0] || 'Paciente';
      const doctorName = (followUp.patient as any)?.user?.nomeCompleto || 'seu médico';
      const templateText = followUp.dayNumber === 1
        ? `Olá ${firstName}! Sou a assistente virtual de ${doctorName}. Hoje é seu primeiro dia após a cirurgia e gostaria de saber como está se sentindo. Posso fazer algumas perguntas rápidas? Responda SIM para começarmos!`
        : `Olá ${firstName}! Tudo bem? 😊 Estou passando para fazer o acompanhamento do seu D+${followUp.dayNumber} pós-operatório. Posso fazer algumas perguntas rápidas? Responda SIM para começarmos!`;

      allMessages.push({
        role: 'assistant',
        content: templateText,
        timestamp: followUp.sentAt.toISOString(),
        dayNumber: followUp.dayNumber
      });
    }

    // 2b. Buscar mensagens de TODOS os FollowUpResponse (fonte principal de conversas)
    for (const response of followUp.responses) {
      try {
        const qData = response.questionnaireData
          ? JSON.parse(response.questionnaireData)
          : {};
        const conv = qData.conversation || [];

        for (const msg of conv) {
          allMessages.push({
            role: msg.role === 'system' ? 'assistant' : msg.role,
            content: msg.content,
            timestamp: msg.timestamp || response.createdAt?.toISOString() || null,
            dayNumber: followUp.dayNumber
          });
        }
      } catch {
        // JSON parse error, skip
      }
    }
  }

  // 3. Remover duplicatas por conteúdo+role (mensagens podem estar em ambas as fontes)
  const seen = new Set<string>();
  const uniqueMessages = allMessages.filter(msg => {
    const key = `${msg.role}:${msg.content.substring(0, 100)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 4. Ordenar por timestamp
  uniqueMessages.sort((a, b) => {
    if (!a.timestamp && !b.timestamp) return 0;
    if (!a.timestamp) return -1;
    if (!b.timestamp) return 1;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return uniqueMessages;
}

export async function getRecentPatientActivity(limit = 10): Promise<RecentActivity[]> {
  // SECURITY: Get current user session for patient isolation
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autenticado")
  }

  // Buscar mais respostas para garantir que temos o suficiente após agrupar por paciente
  // SECURITY: Filter by userId to ensure doctor only sees their own patients' activity
  const responses = await prisma.followUpResponse.findMany({
    take: limit * 3, // Buscar mais para compensar duplicatas
    orderBy: {
      createdAt: 'desc'
    },
    where: {
      followUp: {
        patient: {
          userId: session.user.id,
        },
      },
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

  // Agrupar por paciente - manter apenas a resposta mais recente de cada um
  const patientMap = new Map<string, typeof responses[0]>()

  for (const r of responses) {
    const patientId = r.followUp.patient.id
    // Como já está ordenado por createdAt desc, a primeira ocorrência é a mais recente
    if (!patientMap.has(patientId)) {
      patientMap.set(patientId, r)
    }
  }

  // Converter para array e limitar
  const uniqueResponses = Array.from(patientMap.values()).slice(0, limit)

  return uniqueResponses.map(r => ({
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

/**
 * Busca as tarefas de hoje para o dashboard:
 * - Follow-ups atrasados (dias anteriores, não respondidos)
 * - Follow-ups em andamento (paciente começou mas não terminou)
 * - Follow-ups pendentes para hoje (agendados para hoje, aguardando envio/resposta)
 * Exclui pacientes com cirurgias finalizadas (status "completed")
 */
export async function getTodayTasks(): Promise<TodayTasksResult> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autenticado")
  }

  const userId = session.user.id
  const todayStart = startOfDayBrasilia()
  const todayEnd = endOfDayBrasilia()

  // Follow-ups pendentes para hoje (agendados para hoje, não respondidos)
  const pendingToday = await prisma.followUp.findMany({
    where: {
      userId,
      status: { in: ['pending', 'sent'] },
      scheduledDate: {
        gte: todayStart,
        lte: todayEnd,
      },
      surgery: { status: 'active' },
    },
    include: {
      surgery: { select: { type: true } },
      patient: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { scheduledDate: 'asc' },
  })

  // Follow-ups atrasados (dias anteriores, não respondidos)
  const overdue = await prisma.followUp.findMany({
    where: {
      userId,
      status: { in: ['sent', 'pending'] },
      scheduledDate: { lt: todayStart },
      surgery: { status: 'active' },
    },
    include: {
      surgery: { select: { type: true } },
      patient: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { scheduledDate: 'asc' },
  })

  // Follow-ups em andamento (paciente começou mas não terminou)
  const inProgress = await prisma.followUp.findMany({
    where: {
      userId,
      status: 'in_progress',
      surgery: { status: 'active' },
    },
    include: {
      surgery: { select: { type: true } },
      patient: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { scheduledDate: 'asc' },
  })

  const mapToTask = (
    followUp: typeof pendingToday[0],
    taskStatus: 'overdue' | 'in_progress' | 'pending_today'
  ): TodayTask => ({
    id: followUp.id,
    followUpId: followUp.id,
    patientId: followUp.patient.id,
    patientName: followUp.patient.name,
    patientPhone: followUp.patient.phone,
    surgeryType: followUp.surgery.type,
    dayNumber: followUp.dayNumber,
    scheduledDate: followUp.scheduledDate,
    status: taskStatus,
    followUpStatus: followUp.status,
  })

  return {
    overdue: overdue.map(f => mapToTask(f, 'overdue')),
    inProgress: inProgress.map(f => mapToTask(f, 'in_progress')),
    pendingToday: pendingToday.map(f => mapToTask(f, 'pending_today')),
  }
}

/**
 * Marca uma cirurgia como "completed", movendo o paciente para a aba "Concluídos".
 */
export async function completeSurgery(surgeryId: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" }
  }

  const surgery = await prisma.surgery.findUnique({
    where: { id: surgeryId },
    include: { patient: { select: { userId: true } } },
  })

  if (!surgery) {
    return { success: false, error: "Cirurgia não encontrada" }
  }

  if (surgery.patient.userId !== session.user.id) {
    return { success: false, error: "Acesso negado" }
  }

  await prisma.surgery.update({
    where: { id: surgeryId },
    data: { status: 'completed' },
  })

  return { success: true }
}

/**
 * Exclui um paciente e todos os dados relacionados (cascade delete).
 */
export async function deletePatient(patientId: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" }
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { userId: true, name: true },
  })

  if (!patient) {
    return { success: false, error: "Paciente não encontrado" }
  }

  if (patient.userId !== session.user.id) {
    return { success: false, error: "Acesso negado" }
  }

  await prisma.patient.delete({
    where: { id: patientId },
  })

  return { success: true }
}
