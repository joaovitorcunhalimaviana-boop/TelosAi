/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { parseQuestionnaireData } from "@/lib/questionnaire-parser"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const surgeryId = searchParams.get("surgeryId")

    if (!surgeryId) {
      return NextResponse.json({ error: "surgeryId obrigatorio" }, { status: 400 })
    }

    // Busca cirurgia com paciente, follow-ups e respostas
    const surgery = await prisma.surgery.findUnique({
      where: { id: surgeryId },
      include: {
        patient: true,
        user: true,
        followUps: {
          include: { responses: true },
          orderBy: { dayNumber: "asc" },
        },
      },
    })

    if (!surgery) {
      return NextResponse.json({ error: "Cirurgia nao encontrada" }, { status: 404 })
    }

    // Verifica permissao (multi-tenant)
    if (surgery.userId !== session.user.id && session.user.role !== "admin") {
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
    doc.rect(0, 0, pageWidth, 55, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("RELATORIO DE ALTA POS-OPERATORIA", pageWidth / 2, 20, { align: "center" })

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text("VigIA - Sistema de Acompanhamento Pos-Operatorio", pageWidth / 2, 30, { align: "center" })

    // Informacoes do paciente no header
    doc.setFontSize(10)
    const surgeryDate = new Date(surgery.date).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
    doc.text(`Paciente: ${surgery.patient.name}  |  Cirurgia: ${surgery.type}  |  Data: ${surgeryDate}`, pageWidth / 2, 40, { align: "center" })

    const hospitalText = surgery.hospital ? `Hospital: ${surgery.hospital}  |  ` : ""
    const crmText = surgery.user.crm ? `CRM: ${surgery.user.crm}${surgery.user.estado ? `/${surgery.user.estado}` : ""}` : ""
    doc.text(`${hospitalText}Dr(a). ${surgery.user.nomeCompleto}  |  ${crmText}`, pageWidth / 2, 48, { align: "center" })

    let y = 70

    // ========== PAIN TRAJECTORY TABLE ==========
    doc.setTextColor(10, 38, 71)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Trajetoria de Dor", margin, y)
    y += 8

    const painTableData: any[][] = []
    const respondedFollowUps = surgery.followUps.filter(fu => fu.responses.length > 0)

    for (const fu of respondedFollowUps) {
      const resp = fu.responses[0]
      const parsed = parseQuestionnaireData(resp.questionnaireData, {
        painAtRest: resp.painAtRest,
        painDuringBowel: resp.painDuringBowel,
        redFlags: resp.redFlags,
        riskLevel: resp.riskLevel,
      })

      const painRest = parsed.painAtRest !== null ? `${parsed.painAtRest}/10` : "-"
      const painEvac = parsed.painDuringEvacuation !== null ? `${parsed.painDuringEvacuation}/10` : "-"

      let riskLabel = "Baixo"
      if (resp.riskLevel === "critical") riskLabel = "Critico"
      else if (resp.riskLevel === "high") riskLabel = "Alto"
      else if (resp.riskLevel === "medium") riskLabel = "Medio"

      painTableData.push([`D+${fu.dayNumber}`, painRest, painEvac, riskLabel])
    }

    if (painTableData.length > 0) {
      autoTable(doc, {
        head: [["Dia", "Dor Repouso", "Dor Evacuacao", "Nivel Risco"]],
        body: painTableData,
        startY: y,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: {
          fillColor: [10, 38, 71],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        didParseCell: (data: any) => {
          // Color the risk column
          if (data.section === "body" && data.column.index === 3) {
            const value = data.cell.raw as string
            if (value === "Baixo") {
              data.cell.styles.textColor = [39, 174, 96]
              data.cell.styles.fontStyle = "bold"
            } else if (value === "Medio") {
              data.cell.styles.textColor = [211, 167, 21]
              data.cell.styles.fontStyle = "bold"
            } else if (value === "Alto") {
              data.cell.styles.textColor = [230, 126, 34]
              data.cell.styles.fontStyle = "bold"
            } else if (value === "Critico") {
              data.cell.styles.textColor = [192, 57, 43]
              data.cell.styles.fontStyle = "bold"
            }
          }
        },
      })
      y = (doc as any).lastAutoTable.finalY + 12
    } else {
      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(100, 100, 100)
      doc.text("Nenhum dado de dor registrado.", margin, y)
      y += 10
    }

    // ========== FIRST BOWEL MOVEMENT ==========
    if (y > pageHeight - 60) { doc.addPage(); y = margin }

    doc.setTextColor(10, 38, 71)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Primeira Evacuacao", margin, y)
    y += 8

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)

    if (surgery.hadFirstBowelMovement && surgery.firstBowelMovementDate) {
      const bowelDate = new Date(surgery.firstBowelMovementDate).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
      doc.text(`Data: ${bowelDate}`, margin, y)
      y += 6
      if (surgery.firstBowelMovementDay !== null && surgery.firstBowelMovementDay !== undefined) {
        doc.text(`Dia pos-operatorio: D+${surgery.firstBowelMovementDay}`, margin, y)
        y += 6
      }
      if (surgery.firstBowelMovementTime) {
        doc.text(`Horario: ${surgery.firstBowelMovementTime}`, margin, y)
        y += 6
      }
    } else {
      doc.setTextColor(100, 100, 100)
      doc.text("Nao registrado", margin, y)
      y += 6
    }

    y += 10

    // ========== COMPLICATIONS / RED FLAGS ==========
    if (y > pageHeight - 60) { doc.addPage(); y = margin }

    doc.setTextColor(10, 38, 71)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Complicacoes / Red Flags", margin, y)
    y += 8

    const highRiskResponses: { dayNumber: number; riskLevel: string; redFlags: string[] }[] = []

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
          highRiskResponses.push({
            dayNumber: fu.dayNumber,
            riskLevel: resp.riskLevel,
            redFlags: flags,
          })
        }
      }
    }

    if (highRiskResponses.length > 0) {
      const complicationData = highRiskResponses.map(item => {
        const riskLabel = item.riskLevel === "critical" ? "Critico" : "Alto"
        const symptoms = item.redFlags.length > 0 ? item.redFlags.join(", ") : "Sem detalhes"
        return [`D+${item.dayNumber}`, riskLabel, symptoms]
      })

      autoTable(doc, {
        head: [["Dia", "Nivel Risco", "Sintomas"]],
        body: complicationData,
        startY: y,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: {
          fillColor: [192, 57, 43],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [255, 240, 240] },
        columnStyles: { 2: { cellWidth: 80 } },
      })
      y = (doc as any).lastAutoTable.finalY + 12
    } else {
      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(39, 174, 96)
      doc.text("Nenhuma complicacao registrada.", margin, y)
      y += 10
    }

    // ========== MEDICATION ==========
    if (y > pageHeight - 60) { doc.addPage(); y = margin }

    doc.setTextColor(10, 38, 71)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Adesao a Medicacao", margin, y)
    y += 8

    const medTableData: any[][] = []

    for (const fu of respondedFollowUps) {
      const resp = fu.responses[0]
      const parsed = parseQuestionnaireData(resp.questionnaireData, {
        painAtRest: resp.painAtRest,
        painDuringBowel: resp.painDuringBowel,
      })

      const adherence = parsed.medications ? "Sim" : "Nao"
      let extraMed = "Nao"
      if (parsed.usedExtraMedication) {
        extraMed = parsed.extraMedicationDetails ? `Sim (${parsed.extraMedicationDetails})` : "Sim"
      }

      medTableData.push([`D+${fu.dayNumber}`, adherence, extraMed])
    }

    if (medTableData.length > 0) {
      autoTable(doc, {
        head: [["Dia", "Aderiu?", "Medicacao Extra?"]],
        body: medTableData,
        startY: y,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: {
          fillColor: [10, 38, 71],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      })
      y = (doc as any).lastAutoTable.finalY + 12
    } else {
      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(100, 100, 100)
      doc.text("Nenhum dado de medicacao registrado.", margin, y)
      y += 10
    }

    // ========== SUMMARY ==========
    if (y > pageHeight - 70) { doc.addPage(); y = margin }

    doc.setTextColor(10, 38, 71)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Resumo", margin, y)
    y += 8

    const totalFollowUps = surgery.followUps.length
    const answeredFollowUps = respondedFollowUps.length
    const responseRate = totalFollowUps > 0 ? Math.round((answeredFollowUps / totalFollowUps) * 100) : 0

    // Calculate average pain
    let totalPainRest = 0
    let countPainRest = 0
    let totalPainEvac = 0
    let countPainEvac = 0

    for (const fu of respondedFollowUps) {
      const resp = fu.responses[0]
      const parsed = parseQuestionnaireData(resp.questionnaireData, {
        painAtRest: resp.painAtRest,
        painDuringBowel: resp.painDuringBowel,
      })
      if (parsed.painAtRest !== null) {
        totalPainRest += parsed.painAtRest
        countPainRest++
      }
      if (parsed.painDuringEvacuation !== null) {
        totalPainEvac += parsed.painDuringEvacuation
        countPainEvac++
      }
    }

    const avgPainRest = countPainRest > 0 ? (totalPainRest / countPainRest).toFixed(1) : "-"
    const avgPainEvac = countPainEvac > 0 ? (totalPainEvac / countPainEvac).toFixed(1) : "-"

    doc.setFillColor(245, 245, 250)
    doc.roundedRect(margin, y - 2, pageWidth - 2 * margin, 40, 3, 3, "F")

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)
    doc.text(`Follow-ups respondidos: ${answeredFollowUps} de ${totalFollowUps}`, margin + 5, y + 6)
    doc.text(`Dor media (repouso): ${avgPainRest}/10`, margin + 5, y + 14)
    doc.text(`Dor media (evacuacao): ${avgPainEvac}/10`, margin + 5, y + 22)
    doc.text(`Taxa de resposta: ${responseRate}%`, margin + 5, y + 30)

    y += 52

    // ========== SIGNATURE LINE ==========
    if (y > pageHeight - 50) { doc.addPage(); y = margin }

    y = Math.max(y, pageHeight - 60)

    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.line(pageWidth / 2 - 40, y, pageWidth / 2 + 40, y)

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)
    doc.text(surgery.user.nomeCompleto, pageWidth / 2, y + 7, { align: "center" })

    if (surgery.user.crm) {
      const crmFull = `CRM ${surgery.user.crm}${surgery.user.estado ? `/${surgery.user.estado}` : ""}`
      doc.text(crmFull, pageWidth / 2, y + 13, { align: "center" })
    }

    // ========== FOOTER ON EVERY PAGE ==========
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(
        `Gerado em: ${new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })} as ${new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
        margin,
        pageHeight - 10
      )
      doc.text(`Pagina ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" })
      doc.text("VigIA - Sistema de Acompanhamento Pos-Operatorio", pageWidth / 2, pageHeight - 10, { align: "center" })
    }

    // Gera o PDF como buffer
    const pdfBuffer = doc.output("arraybuffer")

    const safePatientName = surgery.patient.name.replace(/\s/g, "_")
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="relatorio-alta-${safePatientName}-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Erro ao gerar PDF de alta:", error)
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 })
  }
}
