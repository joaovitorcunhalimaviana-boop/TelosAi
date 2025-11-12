import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { TemplateData } from "@/lib/template-utils"

// ============================================
// GET - List all templates (filter by surgery type)
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const surgeryType = searchParams.get("surgeryType")

    const templates = await prisma.surgeryTemplate.findMany({
      where: surgeryType ? { surgeryType } : undefined,
      orderBy: [
        { isDefault: "desc" }, // Default templates first
        { createdAt: "desc" }
      ]
    })

    // Parse templateData JSON for each template
    const parsedTemplates = templates.map(template => ({
      ...template,
      templateDataParsed: JSON.parse(template.templateData) as TemplateData
    }))

    return NextResponse.json(parsedTemplates)
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json(
      { error: "Erro ao buscar templates" },
      { status: 500 }
    )
  }
}

// ============================================
// POST - Create new template
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, surgeryType, templateData, isDefault, userId } = body

    // Validação
    if (!name || !surgeryType || !templateData || !userId) {
      return NextResponse.json(
        { error: "Nome, tipo de cirurgia, dados do template e userId são obrigatórios" },
        { status: 400 }
      )
    }

    // Se marcado como default, remover default de outros templates do mesmo tipo
    if (isDefault) {
      await prisma.surgeryTemplate.updateMany({
        where: { surgeryType, isDefault: true, userId },
        data: { isDefault: false }
      })
    }

    // Criar template
    const template = await prisma.surgeryTemplate.create({
      data: {
        name,
        surgeryType,
        templateData: JSON.stringify(templateData),
        isDefault: isDefault || false,
        userId
      }
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json(
      { error: "Erro ao criar template" },
      { status: 500 }
    )
  }
}

// ============================================
// PATCH - Update template
// ============================================

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, templateData, isDefault } = body

    if (!id) {
      return NextResponse.json(
        { error: "ID do template é obrigatório" },
        { status: 400 }
      )
    }

    // Buscar template existente
    const existingTemplate = await prisma.surgeryTemplate.findUnique({
      where: { id }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template não encontrado" },
        { status: 404 }
      )
    }

    // Se marcado como default, remover default de outros templates do mesmo tipo
    if (isDefault) {
      await prisma.surgeryTemplate.updateMany({
        where: {
          surgeryType: existingTemplate.surgeryType,
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      })
    }

    // Atualizar template
    const template = await prisma.surgeryTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(templateData && { templateData: JSON.stringify(templateData) }),
        ...(isDefault !== undefined && { isDefault })
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error updating template:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar template" },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE - Delete template
// ============================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID do template é obrigatório" },
        { status: 400 }
      )
    }

    await prisma.surgeryTemplate.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting template:", error)
    return NextResponse.json(
      { error: "Erro ao excluir template" },
      { status: 500 }
    )
  }
}
