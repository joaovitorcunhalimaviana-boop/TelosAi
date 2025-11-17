import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { AuditLogger } from "@/lib/audit/logger"
import { getClientIP } from "@/lib/utils/ip"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { patientId, fileUrl, termData } = await req.json()

    // Verifica se o paciente existe e pertence ao médico
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    })

    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    if (patient.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    // Atualiza o paciente com consentimento
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        consentTermSigned: true,
        consentTermDate: new Date(),
        consentTermFileUrl: fileUrl || null,
        whatsappConsent: true, // Termo inclui autorização WhatsApp
      },
    })

    // Audit log: consentimento assinado
    await AuditLogger.consentSigned({
      userId: session.user.id,
      patientId,
      termType: termData?.termType || 'whatsapp_followup',
      ipAddress: getClientIP(req),
      userAgent: req.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Erro ao confirmar consentimento:", error)
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    )
  }
}
