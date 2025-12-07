/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateTemplate, TemplateData } from "@/lib/template-utils"

// ============================================
// POST - Apply template to patient's surgery
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { patientId, surgeryId } = body
    const { id: templateId } = await params;

    // Validação
    if (!patientId || !surgeryId) {
      return NextResponse.json(
        { error: "ID do paciente e da cirurgia são obrigatórios" },
        { status: 400 }
      )
    }

    // Buscar template
    const template = await prisma.surgeryTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      return NextResponse.json(
        { error: "Template não encontrado" },
        { status: 404 }
      )
    }

    // Buscar cirurgia com todos os relacionamentos
    const surgery = await prisma.surgery.findUnique({
      where: { id: surgeryId },
      include: {
        details: true,
        preOp: true,
        anesthesia: true,
        postOp: true,
        patient: true
      }
    })

    if (!surgery) {
      return NextResponse.json(
        { error: "Cirurgia não encontrada" },
        { status: 404 }
      )
    }

    // Validar compatibilidade
    const validation = validateTemplate(template, surgery.type)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      )
    }

    // Parse template data
    const templateData = JSON.parse(template.templateData) as TemplateData

    // Aplicar template aos dados da cirurgia
    // Vamos atualizar cada seção separadamente no banco

    // 1. Detalhes cirúrgicos
    if (templateData.surgeryDetails) {
      const detailsData: any = {}

      // Hemorroidectomia
      if (templateData.surgeryDetails.hemorrhoidTechnique) {
        detailsData.hemorrhoidTechnique = JSON.stringify(templateData.surgeryDetails.hemorrhoidTechnique)
      }
      if (templateData.surgeryDetails.hemorrhoidEnergyType) {
        detailsData.hemorrhoidEnergyType = templateData.surgeryDetails.hemorrhoidEnergyType
      }
      if (templateData.surgeryDetails.hemorrhoidType) {
        detailsData.hemorrhoidType = templateData.surgeryDetails.hemorrhoidType
      }
      if (templateData.surgeryDetails.hemorrhoidInternalGrade) {
        detailsData.hemorrhoidInternalGrade = templateData.surgeryDetails.hemorrhoidInternalGrade
      }
      if (templateData.surgeryDetails.hemorrhoidExternalDetails) {
        detailsData.hemorrhoidExternalDetails = templateData.surgeryDetails.hemorrhoidExternalDetails
      }

      // Fístula
      if (templateData.surgeryDetails.fistulaType) {
        detailsData.fistulaType = templateData.surgeryDetails.fistulaType
      }
      if (templateData.surgeryDetails.fistulaTechnique) {
        detailsData.fistulaTechnique = templateData.surgeryDetails.fistulaTechnique
      }
      if (templateData.surgeryDetails.fistulaSeton !== undefined) {
        detailsData.fistulaSeton = templateData.surgeryDetails.fistulaSeton
      }
      if (templateData.surgeryDetails.fistulaSetonMaterial) {
        detailsData.fistulaSetonMaterial = templateData.surgeryDetails.fistulaSetonMaterial
      }

      // Fissura
      if (templateData.surgeryDetails.fissureType) {
        detailsData.fissureType = templateData.surgeryDetails.fissureType
      }
      if (templateData.surgeryDetails.fissureLocation) {
        detailsData.fissureLocation = templateData.surgeryDetails.fissureLocation
      }
      if (templateData.surgeryDetails.fissureTechnique) {
        detailsData.fissureTechnique = JSON.stringify(templateData.surgeryDetails.fissureTechnique)
      }

      // Pilonidal
      if (templateData.surgeryDetails.pilonidalTechnique) {
        detailsData.pilonidalTechnique = templateData.surgeryDetails.pilonidalTechnique
      }

      // Comum
      if (templateData.surgeryDetails.recoveryRoomMinutes !== undefined) {
        detailsData.recoveryRoomMinutes = templateData.surgeryDetails.recoveryRoomMinutes
      }
      if (templateData.surgeryDetails.sameDayDischarge !== undefined) {
        detailsData.sameDayDischarge = templateData.surgeryDetails.sameDayDischarge
      }
      if (templateData.surgeryDetails.hospitalizationDays !== undefined) {
        detailsData.hospitalizationDays = templateData.surgeryDetails.hospitalizationDays
      }

      if (Object.keys(detailsData).length > 0) {
        if (surgery.details) {
          await prisma.surgeryDetails.update({
            where: { surgeryId },
            data: detailsData
          })
        } else {
          await prisma.surgeryDetails.create({
            data: {
              surgeryId,
              ...detailsData
            }
          })
        }
      }
    }

    // 2. Pré-operatório
    if (templateData.preOp) {
      const preOpData: any = {}

      if (templateData.preOp.botoxUsed !== undefined) {
        preOpData.botoxUsed = templateData.preOp.botoxUsed
      }
      if (templateData.preOp.botoxDoseUnits !== undefined) {
        preOpData.botoxDoseUnits = templateData.preOp.botoxDoseUnits
      }
      if (templateData.preOp.botoxLocation) {
        preOpData.botoxLocation = templateData.preOp.botoxLocation
      }
      if (templateData.preOp.intestinalPrep !== undefined) {
        preOpData.intestinalPrep = templateData.preOp.intestinalPrep
      }
      if (templateData.preOp.intestinalPrepType) {
        preOpData.intestinalPrepType = templateData.preOp.intestinalPrepType
      }

      if (Object.keys(preOpData).length > 0) {
        if (surgery.preOp) {
          await prisma.preOpPreparation.update({
            where: { surgeryId },
            data: preOpData
          })
        } else {
          await prisma.preOpPreparation.create({
            data: {
              surgeryId,
              ...preOpData
            }
          })
        }
      }
    }

    // 3. Anestesia
    if (templateData.anesthesia) {
      const anesthesiaData: any = {}

      if (templateData.anesthesia.type) {
        anesthesiaData.type = templateData.anesthesia.type
      }
      if (templateData.anesthesia.pudendoBlock !== undefined) {
        anesthesiaData.pudendoBlock = templateData.anesthesia.pudendoBlock
      }
      if (templateData.anesthesia.pudendoTechnique) {
        anesthesiaData.pudendoTechnique = templateData.anesthesia.pudendoTechnique
      }
      if (templateData.anesthesia.pudendoAccess) {
        anesthesiaData.pudendoAccess = templateData.anesthesia.pudendoAccess
      }
      if (templateData.anesthesia.pudendoAnesthetic) {
        anesthesiaData.pudendoAnesthetic = templateData.anesthesia.pudendoAnesthetic
      }
      if (templateData.anesthesia.pudendoConcentration) {
        anesthesiaData.pudendoConcentration = templateData.anesthesia.pudendoConcentration
      }
      if (templateData.anesthesia.pudendoVolumeML !== undefined) {
        anesthesiaData.pudendoVolumeML = templateData.anesthesia.pudendoVolumeML
      }
      if (templateData.anesthesia.pudendoLaterality) {
        anesthesiaData.pudendoLaterality = templateData.anesthesia.pudendoLaterality
      }
      if (templateData.anesthesia.pudendoAdjuvants) {
        anesthesiaData.pudendoAdjuvants = JSON.stringify(templateData.anesthesia.pudendoAdjuvants)
      }

      if (Object.keys(anesthesiaData).length > 0) {
        if (surgery.anesthesia) {
          await prisma.anesthesia.update({
            where: { surgeryId },
            data: anesthesiaData
          })
        } else {
          await prisma.anesthesia.create({
            data: {
              surgeryId,
              ...anesthesiaData
            }
          })
        }
      }
    }

    // 4. Prescrição pós-operatória
    if (templateData.prescription) {
      const prescriptionData: any = {}

      if (templateData.prescription.ointments) {
        prescriptionData.ointments = JSON.stringify(templateData.prescription.ointments)
      }
      if (templateData.prescription.medications) {
        prescriptionData.medications = JSON.stringify(templateData.prescription.medications)
      }

      if (Object.keys(prescriptionData).length > 0) {
        if (surgery.postOp) {
          await prisma.postOpPrescription.update({
            where: { surgeryId },
            data: prescriptionData
          })
        } else {
          await prisma.postOpPrescription.create({
            data: {
              surgeryId,
              ...prescriptionData
            }
          })
        }
      }
    }

    // Atualizar completeness da cirurgia
    // Recalcular baseado nos dados agora presentes
    let completeness = 20 // Base
    if (surgery.details || templateData.surgeryDetails) completeness += 15
    if (surgery.preOp || templateData.preOp) completeness += 10
    if (surgery.anesthesia || templateData.anesthesia) completeness += 20
    if (surgery.postOp || templateData.prescription) completeness += 25

    await prisma.surgery.update({
      where: { id: surgeryId },
      data: { dataCompleteness: Math.min(completeness, 100) }
    })

    // Retornar dados atualizados
    const updatedSurgery = await prisma.surgery.findUnique({
      where: { id: surgeryId },
      include: {
        details: true,
        preOp: true,
        anesthesia: true,
        postOp: true,
        patient: true
      }
    })

    return NextResponse.json({
      success: true,
      message: `Template "${template.name}" aplicado com sucesso`,
      surgery: updatedSurgery
    })
  } catch (error) {
    console.error("Error applying template:", error)
    return NextResponse.json(
      { error: "Erro ao aplicar template" },
      { status: 500 }
    )
  }
}
