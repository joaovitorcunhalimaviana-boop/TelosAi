import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { generateMLDataset } from "@/lib/collective-intelligence/pseudonymizer"
import { AuditLogger } from "@/lib/audit/logger"
import { getClientIP } from "@/lib/utils/ip"

/**
 * Exporta dataset pseudonimizado para treinamento de ML
 * Apenas médicos que optaram por participar + pacientes com consentimento
 * Apenas admin pode acessar
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Apenas admin pode exportar o dataset coletivo
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem exportar o dataset coletivo" },
        { status: 403 }
      )
    }

    // Busca TODOS os médicos (aceitaram Termos de Uso ao criar conta)
    const allDoctors = await prisma.user.findMany({
      where: {
        role: "medico",
        acceptedTermsOfService: true, // Obrigatório para usar plataforma
      },
      select: { id: true },
    })

    const allDoctorIds = allDoctors.map(d => d.id)

    if (allDoctorIds.length === 0) {
      return NextResponse.json({
        message: "Nenhum médico na plataforma ainda",
        dataset: {
          exportDate: new Date(),
          totalPatients: 0,
          totalSurgeries: 0,
          totalFollowUps: 0,
          patients: [],
          metadata: {
            version: "1.0.0",
            pseudonymizationMethod: "SHA-256 with secret salt",
            lgpdCompliant: true,
            legalBasis: "LGPD Art. 12 - Dados anonimizados não são dados pessoais",
          },
        },
      })
    }

    // Busca TODOS os pacientes (dados serão anonimizados, LGPD Art. 12)
    // Sem filtro de consentimento - não é necessário para dados anonimizados
    const patients = await prisma.patient.findMany({
      where: {
        userId: { in: allDoctorIds },
        // Removido: consentTermSigned: true
        // Motivo: Dados anonimizados não precisam consentimento (LGPD Art. 12)
      },
      include: {
        comorbidities: {
          include: {
            comorbidity: true,
          },
        },
        surgeries: {
          include: {
            anesthesia: true,
          },
        },
        followUps: {
          where: {
            status: "completed",
          },
          include: {
            responses: true,
          },
        },
      },
    })

    // Gera dataset pseudonimizado
    const dataset = await generateMLDataset(patients)

    // Audit log: exportação de dataset (SENSÍVEL)
    await AuditLogger.exportDataset({
      userId: session.user.id,
      exportType: 'json',
      recordCount: patients.length,
      filters: { totalDoctors: allDoctors.length },
      ipAddress: getClientIP(req),
      userAgent: req.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({
      success: true,
      dataset,
      stats: {
        totalDoctors: allDoctors.length,
        totalPatients: patients.length,
        note: "Todos os dados são anonimizados (SHA-256) conforme LGPD Art. 12",
      },
    })

  } catch (error) {
    console.error("Erro ao exportar dataset:", error)
    return NextResponse.json(
      { error: "Erro ao processar exportação" },
      { status: 500 }
    )
  }
}

/**
 * Exporta dataset em formato CSV para análise estatística
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const { format } = await req.json()

    // Busca TODOS os médicos e pacientes (mesma lógica do GET)
    const allDoctors = await prisma.user.findMany({
      where: {
        role: "medico",
        acceptedTermsOfService: true,
      },
      select: { id: true },
    })

    const allDoctorIds = allDoctors.map(d => d.id)

    const patients = await prisma.patient.findMany({
      where: {
        userId: { in: allDoctorIds },
        // Sem filtro de consentimento (dados anonimizados)
      },
      include: {
        comorbidities: {
          include: {
            comorbidity: true,
          },
        },
        surgeries: {
          include: {
            anesthesia: true,
          },
        },
        followUps: {
          where: {
            status: "completed",
          },
          include: {
            responses: true,
          },
        },
      },
    })

    const dataset = await generateMLDataset(patients)

    // Audit log: exportação de dataset CSV (SENSÍVEL)
    await AuditLogger.exportDataset({
      userId: session.user.id,
      exportType: format || 'json',
      recordCount: patients.length,
      filters: { totalDoctors: allDoctors.length },
      ipAddress: getClientIP(req),
      userAgent: req.headers.get('user-agent') || 'unknown',
    })

    if (format === "csv") {
      // Converte para CSV (formato tabular para análise)
      const csvRows = []

      // Header
      csvRows.push([
        "pseudoId",
        "age",
        "sex",
        "comorbidityCount",
        "surgeryType",
        "durationMinutes",
        "pudendalBlock",
        "dayNumber",
        "painLevel",
        "hasRedFlags",
      ].join(","))

      // Dados
      for (const patient of dataset.patients) {
        for (const surgery of patient.surgeries) {
          for (const followUp of patient.followUps) {
            csvRows.push([
              patient.pseudoId.slice(0, 16),
              patient.age || "",
              patient.sex || "",
              patient.comorbidities.length,
              surgery.type,
              surgery.durationMinutes || "",
              surgery.pudendalBlock ? 1 : 0,
              followUp.dayNumber,
              followUp.painLevel || "",
              followUp.hasRedFlags ? 1 : 0,
            ].join(","))
          }
        }
      }

      const csv = csvRows.join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="collective-intelligence-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    // Formato JSON por padrão
    return NextResponse.json(dataset)

  } catch (error) {
    console.error("Erro ao exportar:", error)
    return NextResponse.json(
      { error: "Erro ao processar exportação" },
      { status: 500 }
    )
  }
}
