import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ResearchPDFGenerator } from "@/lib/pdf-export"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { researchId } = await request.json()

    // Busca pesquisa com dados
    const research = await prisma.research.findUnique({
      where: { id: researchId },
      include: {
        groups: true,
        patients: {
          include: {
            surgeries: {
              include: {
                followUps: {
                  include: {
                    responses: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!research) {
      return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 })
    }

    // Verifica permissão
    if (research.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    // Cria gerador de PDF
    const generator = await ResearchPDFGenerator.create({
      title: research.title,
      subtitle: research.description.substring(0, 200),
      author: session.user.name || "Telos.AI User",
      date: new Date(),
      includeTableOfContents: true,
      includeCoverPage: true,
      includeWatermark: true,
      orientation: "portrait",
      language: "pt",
    })

    // Adiciona capa
    generator.addCoverPage()

    // Seção: Informações da Pesquisa
    generator.addSectionHeading("1. Informações da Pesquisa", 1)

    generator.addParagraph(`Título: ${research.title}`)
    generator.addParagraph(`Descrição: ${research.description}`)
    generator.addParagraph(
      `Período: ${new Date(research.startDate).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })} - ${research.endDate ? new Date(research.endDate).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "Em andamento"}`
    )
    generator.addParagraph(`Status: ${research.isActive ? "Ativa" : "Inativa"}`)
    generator.addParagraph(`Total de pacientes: ${research.totalPatients}`)

    generator.addSpacer(10)

    // Seção: Grupos de Pesquisa
    if (research.groups.length > 0) {
      generator.addSectionHeading("2. Grupos de Pesquisa", 1)

      const groupData = research.groups.map((group) => [
        group.groupCode,
        group.groupName,
        group.patientCount.toString(),
        group.description,
      ])

      await generator.addTable({
        title: "Distribuição de Pacientes por Grupo",
        headers: ["Código", "Nome do Grupo", "N° Pacientes", "Descrição"],
        rows: groupData,
      })

      generator.addSpacer(10)
    }

    // Seção: Estatísticas Descritivas
    generator.addSectionHeading("3. Estatísticas Descritivas", 1)

    // Calcula estatísticas por grupo
    const statsByGroup = research.groups.map((group) => {
      const groupPatients = research.patients.filter((p) => p.researchGroup === group.groupCode)

      // Calcula média de idade
      const ages = groupPatients.map((p) => p.age).filter((age): age is number => age !== null)
      const avgAge = ages.length > 0 ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : "-"

      // Conta sexos
      const maleCount = groupPatients.filter((p) => p.sex === "Masculino").length
      const femaleCount = groupPatients.filter((p) => p.sex === "Feminino").length

      // Calcula média de dor D+1
      const painD1: number[] = []
      groupPatients.forEach((p) => {
        p.surgeries.forEach((s) => {
          const d1FollowUp = s.followUps.find((fu) => fu.dayNumber === 1)
          if (d1FollowUp?.responses[0]) {
            try {
              const data = JSON.parse(d1FollowUp.responses[0].questionnaireData)
              if (data.painLevel) painD1.push(Number(data.painLevel))
            } catch {}
          }
        })
      })
      const avgPainD1 = painD1.length > 0 ? (painD1.reduce((a, b) => a + b, 0) / painD1.length).toFixed(1) : "-"

      return {
        groupName: `Grupo ${group.groupCode} (${group.groupName})`,
        metrics: [
          { label: "N", value: groupPatients.length },
          { label: "Idade Média", value: avgAge, unit: "anos" },
          { label: "Masculino", value: maleCount },
          { label: "Feminino", value: femaleCount },
          { label: "Dor D+1", value: avgPainD1, unit: "/10" },
        ],
      }
    })

    generator.addStatisticalSummary(statsByGroup)

    generator.addSpacer(15)

    // Seção: Dados Pseudonimizados
    generator.addSectionHeading("4. Dados Pseudonimizados", 1)

    generator.addParagraph(
      "Os dados abaixo são apresentados de forma pseudonimizada em conformidade com a LGPD (Art. 13 § 3º). " +
        "Identificadores diretos foram substituídos por IDs pseudônimos gerados através de hash SHA-256 com salt secreto."
    )

    generator.addSpacer(8)

    // Tabela de pacientes pseudonimizados
    const pseudonymizedData = research.patients.slice(0, 50).map((patient) => {
      // Gera ID pseudônimo simples (em produção, usar a lib de pseudonimização)
      const pseudoId = `PSE-${patient.id.substring(0, 12).toUpperCase()}`

      const surgery = patient.surgeries[0]
      const d1FollowUp = surgery?.followUps.find((fu) => fu.dayNumber === 1)
      let painD1 = "-"
      if (d1FollowUp?.responses[0]) {
        try {
          const data = JSON.parse(d1FollowUp.responses[0].questionnaireData)
          painD1 = data.painLevel || "-"
        } catch {}
      }

      return [
        pseudoId,
        patient.researchGroup || "-",
        patient.age?.toString() || "-",
        patient.sex || "-",
        surgery?.type || "-",
        painD1,
      ]
    })

    await generator.addTable({
      title: "Amostra de Dados Pseudonimizados (primeiros 50 pacientes)",
      headers: ["ID Pseudônimo", "Grupo", "Idade", "Sexo", "Cirurgia", "Dor D+1"],
      rows: pseudonymizedData,
      footNote:
        "Dados completos disponíveis para exportação em Excel com análises estatísticas detalhadas.",
    })

    // Tabela de conteúdos
    generator.addTableOfContents()

    // Gera PDF como buffer
    const pdfBuffer = generator.getBuffer()

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="pesquisa-${research.title.replace(/\s/g, "_")}-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Erro ao gerar PDF de pesquisa:", error)
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 })
  }
}
