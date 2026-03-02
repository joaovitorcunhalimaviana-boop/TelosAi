/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface MessageEntry {
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: string | null
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")

    if (!patientId) {
      return NextResponse.json({ error: "patientId obrigatorio" }, { status: 400 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        conversations: true,
        surgeries: {
          include: {
            followUps: {
              include: { responses: true },
              orderBy: { dayNumber: "asc" },
            },
          },
          orderBy: { date: "desc" },
        },
      },
    })

    if (!patient) {
      return NextResponse.json({ error: "Paciente nao encontrado" }, { status: 404 })
    }

    // Verifica permissao
    if (patient.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Sem permissao" }, { status: 403 })
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

    // ========== HEADER ==========
    doc.setFillColor(10, 38, 71)
    doc.rect(0, 0, pageWidth, 50, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("HISTORICO DE COMUNICACAO", pageWidth / 2, 18, { align: "center" })

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Documento para fins de documentacao medico-legal", pageWidth / 2, 27, { align: "center" })

    // Patient info
    doc.setFontSize(10)
    doc.text(`Paciente: ${patient.name}  |  Telefone: ${patient.phone || "N/A"}`, pageWidth / 2, 37, { align: "center" })

    // Period
    const surgeryDates = patient.surgeries.map(s => new Date(s.date))
    const firstDate = surgeryDates.length > 0
      ? new Date(Math.min(...surgeryDates.map(d => d.getTime()))).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
      : "N/A"

    // Find last message date from conversations
    let lastMessageDate = "N/A"
    for (const conv of patient.conversations) {
      if (conv.lastUserMessageAt) {
        const d = new Date(conv.lastUserMessageAt)
        lastMessageDate = d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
      } else if (conv.lastSystemMessageAt) {
        const d = new Date(conv.lastSystemMessageAt)
        lastMessageDate = d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
      }
    }

    doc.text(`Periodo: ${firstDate} a ${lastMessageDate}`, pageWidth / 2, 45, { align: "center" })

    let y = 60

    // ========== CONVERSATION LOG ==========
    doc.setTextColor(10, 38, 71)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Registro de Conversas", margin, y)
    y += 8

    let hasMessages = false

    for (const conv of patient.conversations) {
      let messages: MessageEntry[] = []

      if (conv.messageHistory) {
        try {
          const parsed = typeof conv.messageHistory === "string"
            ? JSON.parse(conv.messageHistory)
            : conv.messageHistory
          if (Array.isArray(parsed)) {
            messages = parsed
          }
        } catch {
          messages = []
        }
      }

      if (messages.length === 0) continue
      hasMessages = true

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i]

        // Check page overflow
        if (y > pageHeight - 30) {
          doc.addPage()
          y = margin
        }

        const roleLabel = msg.role === "user" ? "PACIENTE" : "SISTEMA"
        const timestamp = msg.timestamp
          ? new Date(msg.timestamp).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
          : ""

        // Alternating background
        if (i % 2 === 0) {
          doc.setFillColor(245, 245, 250)
        } else {
          doc.setFillColor(255, 255, 255)
        }

        // Prepare the text
        const prefix = timestamp ? `[${timestamp}] ${roleLabel}: ` : `${roleLabel}: `
        const fullText = `${prefix}${msg.content}`
        const lines = doc.splitTextToSize(fullText, pageWidth - 2 * margin - 6)
        const blockHeight = lines.length * 5 + 4

        // Check if block fits
        if (y + blockHeight > pageHeight - 25) {
          doc.addPage()
          y = margin
        }

        doc.rect(margin, y - 2, pageWidth - 2 * margin, blockHeight, "F")

        doc.setFontSize(9)

        // Timestamp + role in bold
        doc.setFont("helvetica", "bold")
        doc.setTextColor(10, 38, 71)
        const prefixWidth = doc.getTextWidth(prefix)

        doc.text(prefix, margin + 3, y + 3)

        // Message content in normal
        doc.setFont("helvetica", "normal")
        doc.setTextColor(30, 30, 30)

        // Render all lines
        let lineY = y + 3
        for (let li = 0; li < lines.length; li++) {
          if (li === 0) {
            // First line: content starts after the prefix
            const firstLineContent = lines[0].substring(prefix.length)
            if (firstLineContent) {
              doc.text(firstLineContent, margin + 3 + prefixWidth, lineY)
            }
          } else {
            doc.text(lines[li], margin + 3, lineY)
          }
          lineY += 5
        }

        y += blockHeight + 1
      }
    }

    if (!hasMessages) {
      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(100, 100, 100)
      doc.text("Nenhuma conversa registrada.", margin, y)
      y += 10
    }

    // ========== ALERTS GENERATED ==========
    if (y > pageHeight - 50) { doc.addPage(); y = margin }

    doc.setTextColor(10, 38, 71)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Alertas Gerados", margin, y)
    y += 8

    const alertData: any[][] = []

    for (const surgery of patient.surgeries) {
      for (const fu of surgery.followUps) {
        for (const resp of fu.responses) {
          if (resp.riskLevel === "high" || resp.riskLevel === "critical") {
            let flags: string[] = []
            if (resp.redFlags) {
              try {
                const parsed = typeof resp.redFlags === "string" ? JSON.parse(resp.redFlags) : resp.redFlags
                if (Array.isArray(parsed)) flags = parsed
              } catch {
                flags = [resp.redFlags]
              }
            }

            const respDate = new Date(resp.createdAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
            const riskLabel = resp.riskLevel === "critical" ? "Critico" : "Alto"
            const symptoms = flags.length > 0 ? flags.join(", ") : "Sem detalhes"

            alertData.push([respDate, `D+${fu.dayNumber}`, riskLabel, symptoms])
          }
        }
      }
    }

    if (alertData.length > 0) {
      autoTable(doc, {
        head: [["Data", "Dia", "Nivel Risco", "Sintomas"]],
        body: alertData,
        startY: y,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: {
          fillColor: [192, 57, 43],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [255, 240, 240] },
        columnStyles: { 3: { cellWidth: 70 } },
      })
      y = (doc as any).lastAutoTable.finalY + 12
    } else {
      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(39, 174, 96)
      doc.text("Nenhum alerta registrado.", margin, y)
      y += 10
    }

    // ========== FOOTER ON EVERY PAGE ==========
    const pageCount = (doc as any).internal.getNumberOfPages()
    const generatedDate = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
    const generatedTime = new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(100, 100, 100)
      doc.text(
        "Documento gerado pela plataforma VigIA para fins de documentacao medico-legal",
        pageWidth / 2,
        pageHeight - 14,
        { align: "center" }
      )
      doc.text(
        `Gerado em: ${generatedDate} as ${generatedTime}`,
        margin,
        pageHeight - 8
      )
      doc.text(
        `Pagina ${i} de ${pageCount}`,
        pageWidth - margin,
        pageHeight - 8,
        { align: "right" }
      )
    }

    // Gera o PDF como buffer
    const pdfBuffer = doc.output("arraybuffer")

    const safePatientName = patient.name.replace(/\s/g, "_")
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="comunicacao-${safePatientName}-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Erro ao gerar PDF de comunicacao:", error)
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 })
  }
}
