import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { patientId } = await request.json()

    // Busca paciente com todas as relações
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        comorbidities: {
          include: { comorbidity: true },
        },
        medications: {
          include: { medication: true },
        },
        surgeries: {
          include: {
            details: true,
            preOp: true,
            anesthesia: true,
            postOp: true,
            followUps: {
              include: {
                responses: true,
              },
              orderBy: { dayNumber: "asc" },
            },
          },
          orderBy: { date: "desc" },
        },
      },
    })

    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    // Verifica permissão (multi-tenant)
    if (patient.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    // Cria PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20

    // ========== CAPA ==========
    doc.setFillColor(10, 38, 71)
    doc.rect(0, 0, pageWidth, 60, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.setFont("helvetica", "bold")
    doc.text("Telos.AI", pageWidth / 2, 25, { align: "center" })

    doc.setFontSize(14)
    doc.setFont("helvetica", "normal")
    doc.text("Relatório Pós-Operatório", pageWidth / 2, 40, { align: "center" })

    // Informações do paciente
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text(`Paciente: ${patient.name}`, margin, 80)

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    let y = 95

    if (patient.age) {
      doc.text(`Idade: ${patient.age} anos`, margin, y)
      y += 7
    }

    if (patient.sex) {
      doc.text(`Sexo: ${patient.sex}`, margin, y)
      y += 7
    }

    if (patient.phone) {
      doc.text(`WhatsApp: ${patient.phone}`, margin, y)
      y += 7
    }

    if (patient.email) {
      doc.text(`Email: ${patient.email}`, margin, y)
      y += 7
    }

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
      margin,
      y + 5
    )

    y += 20

    // ========== COMORBIDADES ==========
    if (patient.comorbidities.length > 0) {
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 38, 71)
      doc.text("Comorbidades", margin, y)
      y += 10

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)

      patient.comorbidities.forEach((pc) => {
        let text = `• ${pc.comorbidity.name}`
        if (pc.details) {
          text += ` - ${pc.details}`
        }
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin)
        lines.forEach((line: string) => {
          if (y > pageHeight - 30) {
            doc.addPage()
            y = margin
          }
          doc.text(line, margin + 3, y)
          y += 6
        })
      })

      y += 10
    }

    // ========== MEDICAÇÕES ==========
    if (patient.medications.length > 0) {
      if (y > pageHeight - 50) {
        doc.addPage()
        y = margin
      }

      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 38, 71)
      doc.text("Medicações em Uso", margin, y)
      y += 10

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)

      patient.medications.forEach((pm) => {
        let text = `• ${pm.medication.name}`
        if (pm.dose) text += ` - ${pm.dose}`
        if (pm.frequency) text += ` (${pm.frequency})`
        if (pm.route) text += ` - ${pm.route}`

        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin)
        lines.forEach((line: string) => {
          if (y > pageHeight - 30) {
            doc.addPage()
            y = margin
          }
          doc.text(line, margin + 3, y)
          y += 6
        })
      })

      y += 10
    }

    // ========== CIRURGIAS ==========
    for (const surgery of patient.surgeries) {
      if (y > pageHeight - 80) {
        doc.addPage()
        y = margin
      }

      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 38, 71)
      doc.text(`Cirurgia: ${surgery.type.toUpperCase()}`, margin, y)
      y += 10

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)

      doc.text(`Data: ${new Date(surgery.date).toLocaleDateString("pt-BR")}`, margin, y)
      y += 7

      if (surgery.hospital) {
        doc.text(`Hospital: ${surgery.hospital}`, margin, y)
        y += 7
      }

      if (surgery.durationMinutes) {
        doc.text(`Duração: ${surgery.durationMinutes} minutos`, margin, y)
        y += 7
      }

      doc.text(`Completude: ${surgery.dataCompleteness}%`, margin, y)
      y += 12

      // Seguimentos (Follow-ups)
      if (surgery.followUps.length > 0) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(10, 38, 71)
        doc.text("Acompanhamento Pós-Operatório", margin, y)
        y += 8

        const followUpData = surgery.followUps.map((fu) => {
          const response = fu.responses[0]
          const status =
            fu.status === "responded"
              ? "✓ Respondido"
              : fu.status === "sent"
                ? "Enviado"
                : fu.status === "overdue"
                  ? "⚠ Atrasado"
                  : "Pendente"

          let riskLevel = "-"
          if (response) {
            riskLevel =
              response.riskLevel === "critical"
                ? "🔴 Crítico"
                : response.riskLevel === "high"
                  ? "🟠 Alto"
                  : response.riskLevel === "medium"
                    ? "🟡 Médio"
                    : "🟢 Baixo"
          }

          return [`D+${fu.dayNumber}`, status, riskLevel]
        })

        autoTable(doc, {
          head: [["Dia", "Status", "Nível de Risco"]],
          body: followUpData,
          startY: y,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 10,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [10, 38, 71],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
        })

        y = (doc as any).lastAutoTable.finalY + 10
      }
    }

    // ========== RODAPÉ ==========
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, {
        align: "center",
      })

      doc.setFontSize(8)
      doc.text("Telos.AI - Sistema de Acompanhamento Pós-Operatório", margin, pageHeight - 10)
    }

    // Gera o PDF como buffer
    const pdfBuffer = doc.output("arraybuffer")

    // Retorna como download
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="paciente-${patient.name.replace(/\s/g, "_")}-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Erro ao gerar PDF:", error)
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 })
  }
}
