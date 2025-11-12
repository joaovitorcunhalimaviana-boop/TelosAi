/**
 * Template Utilities
 * Sistema de templates para procedimentos cirúrgicos padrão
 * Permite ao Dr. João salvar e aplicar suas configurações padrão
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface TemplateData {
  surgeryDetails?: {
    // Hemorroidectomia
    hemorrhoidTechnique?: string[]
    hemorrhoidEnergyType?: string
    hemorrhoidNumMamillae?: number
    hemorrhoidPositions?: string
    hemorrhoidType?: string
    hemorrhoidInternalGrade?: string
    hemorrhoidExternalDetails?: string

    // Fístula
    fistulaType?: string
    fistulaTechnique?: string
    fistulaNumTracts?: number
    fistulaSeton?: boolean
    fistulaSetonMaterial?: string

    // Fissura
    fissureType?: string
    fissureLocation?: string
    fissureTechnique?: string[]

    // Pilonidal
    pilonidalTechnique?: string

    // Comum
    fullDescription?: string
    complications?: string
    recoveryRoomMinutes?: number
    sameDayDischarge?: boolean
    hospitalizationDays?: number
  }

  preOp?: {
    botoxUsed?: boolean
    botoxDate?: Date
    botoxDoseUnits?: number
    botoxLocation?: string
    botoxObservations?: string
    intestinalPrep?: boolean
    intestinalPrepType?: string
    otherPreparations?: string
  }

  anesthesia?: {
    type?: string
    anesthesiologist?: string
    observations?: string
    pudendoBlock?: boolean
    pudendoTechnique?: string
    pudendoAccess?: string
    pudendoAnesthetic?: string
    pudendoConcentration?: string
    pudendoVolumeML?: number
    pudendoLaterality?: string
    pudendoAdjuvants?: string[]
    pudendoDetails?: string
  }

  prescription?: {
    ointments?: Array<{
      name: string
      frequency: string
      durationDays: number
    }>
    medications?: Array<{
      name: string
      dose: string
      route: string
      frequency: string
      durationDays: number
      category: string
    }>
  }
}

export interface SurgeryTemplate {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string
  surgeryType: string
  templateData: string // JSON string
  isDefault: boolean
}

export interface PatientData {
  id: string
  name: string
  cpf?: string
  dateOfBirth?: Date
  age?: number
  sex?: string
  phone: string
  email?: string
  surgery: {
    id: string
    type: string
    date: Date
    hospital?: string
    durationMinutes?: number
    dataCompleteness: number
    details?: any
    preOp?: any
    anesthesia?: any
    postOp?: any
  }
}

// ============================================
// EXTRACT TEMPLATE FROM SURGERY
// ============================================

/**
 * Extrai dados de template de uma cirurgia existente
 * Remove dados específicos do paciente (nomes, datas, etc)
 */
export function extractTemplateFromSurgery(patientData: PatientData): TemplateData {
  const template: TemplateData = {}

  // Extrair detalhes cirúrgicos
  if (patientData.surgery.details) {
    const details = patientData.surgery.details
    template.surgeryDetails = {
      // Hemorroidectomia
      hemorrhoidTechnique: details.hemorrhoidTechnique,
      hemorrhoidEnergyType: details.hemorrhoidEnergyType,
      hemorrhoidType: details.hemorrhoidType,
      hemorrhoidInternalGrade: details.hemorrhoidInternalGrade,
      hemorrhoidExternalDetails: details.hemorrhoidExternalDetails,

      // Fístula
      fistulaType: details.fistulaType,
      fistulaTechnique: details.fistulaTechnique,
      fistulaSeton: details.fistulaSeton,
      fistulaSetonMaterial: details.fistulaSetonMaterial,

      // Fissura
      fissureType: details.fissureType,
      fissureLocation: details.fissureLocation,
      fissureTechnique: details.fissureTechnique,

      // Pilonidal
      pilonidalTechnique: details.pilonidalTechnique,

      // Comum (sem descrição completa - template é apenas padrões)
      recoveryRoomMinutes: details.recoveryRoomMinutes,
      sameDayDischarge: details.sameDayDischarge,
      hospitalizationDays: details.hospitalizationDays,
    }
  }

  // Extrair pré-operatório (sem datas específicas)
  if (patientData.surgery.preOp) {
    const preOp = patientData.surgery.preOp
    template.preOp = {
      botoxUsed: preOp.botoxUsed,
      // Não incluir botoxDate - específico do paciente
      botoxDoseUnits: preOp.botoxDoseUnits,
      botoxLocation: preOp.botoxLocation,
      intestinalPrep: preOp.intestinalPrep,
      intestinalPrepType: preOp.intestinalPrepType,
    }
  }

  // Extrair anestesia (sem nomes de anestesistas)
  if (patientData.surgery.anesthesia) {
    const anesthesia = patientData.surgery.anesthesia
    template.anesthesia = {
      type: anesthesia.type,
      // Não incluir anesthesiologist - específico
      pudendoBlock: anesthesia.pudendoBlock,
      pudendoTechnique: anesthesia.pudendoTechnique,
      pudendoAccess: anesthesia.pudendoAccess,
      pudendoAnesthetic: anesthesia.pudendoAnesthetic,
      pudendoConcentration: anesthesia.pudendoConcentration,
      pudendoVolumeML: anesthesia.pudendoVolumeML,
      pudendoLaterality: anesthesia.pudendoLaterality,
      pudendoAdjuvants: anesthesia.pudendoAdjuvants ? JSON.parse(anesthesia.pudendoAdjuvants) : undefined,
    }
  }

  // Extrair prescrição
  if (patientData.surgery.postOp) {
    const postOp = patientData.surgery.postOp
    template.prescription = {
      ointments: postOp.ointments ? JSON.parse(postOp.ointments) : undefined,
      medications: postOp.medications ? JSON.parse(postOp.medications) : undefined,
    }
  }

  return template
}

// ============================================
// APPLY TEMPLATE TO SURGERY
// ============================================

/**
 * Aplica dados de template a uma cirurgia
 * Mescla com dados existentes (não sobrescreve dados específicos do paciente)
 */
export function applyTemplateToSurgery(
  patientData: PatientData,
  templateData: TemplateData
): PatientData {
  const updated = { ...patientData }

  // Aplicar detalhes cirúrgicos
  if (templateData.surgeryDetails) {
    updated.surgery.details = {
      ...updated.surgery.details,
      ...templateData.surgeryDetails,
    }
  }

  // Aplicar pré-operatório
  if (templateData.preOp) {
    updated.surgery.preOp = {
      ...updated.surgery.preOp,
      ...templateData.preOp,
    }
  }

  // Aplicar anestesia
  if (templateData.anesthesia) {
    // Converter adjuvants array para JSON string se necessário
    const anesthesiaData = { ...templateData.anesthesia }
    if (anesthesiaData.pudendoAdjuvants) {
      anesthesiaData.pudendoAdjuvants = JSON.stringify(anesthesiaData.pudendoAdjuvants) as any
    }

    updated.surgery.anesthesia = {
      ...updated.surgery.anesthesia,
      ...anesthesiaData,
    }
  }

  // Aplicar prescrição
  if (templateData.prescription) {
    updated.surgery.postOp = {
      ...updated.surgery.postOp,
      ointments: templateData.prescription.ointments
        ? JSON.stringify(templateData.prescription.ointments)
        : updated.surgery.postOp?.ointments,
      medications: templateData.prescription.medications
        ? JSON.stringify(templateData.prescription.medications)
        : updated.surgery.postOp?.medications,
    }
  }

  return updated
}

// ============================================
// VALIDATE TEMPLATE
// ============================================

/**
 * Valida se um template é compatível com um tipo de cirurgia
 */
export function validateTemplate(
  template: SurgeryTemplate,
  surgeryType: string
): { valid: boolean; message?: string } {
  if (template.surgeryType !== surgeryType) {
    return {
      valid: false,
      message: `Este template é para ${template.surgeryType}, mas a cirurgia é ${surgeryType}`
    }
  }

  return { valid: true }
}

// ============================================
// SURGERY TYPE LABELS
// ============================================

export const SURGERY_TYPE_LABELS: Record<string, string> = {
  hemorroidectomia: "Hemorroidectomia",
  fistula: "Fístula Anorretal",
  fissura: "Fissura Anal",
  pilonidal: "Doença Pilonidal"
}

// ============================================
// TEMPLATE SUMMARY
// ============================================

/**
 * Gera um resumo legível do template
 */
export function getTemplateSummary(templateData: TemplateData): string[] {
  const summary: string[] = []

  // Anestesia
  if (templateData.anesthesia?.type) {
    summary.push(`Anestesia: ${templateData.anesthesia.type}`)
    if (templateData.anesthesia.pudendoBlock) {
      summary.push(`Bloqueio pudendo: ${templateData.anesthesia.pudendoTechnique}`)
    }
  }

  // Detalhes cirúrgicos
  if (templateData.surgeryDetails) {
    const details = templateData.surgeryDetails

    if (details.hemorrhoidTechnique?.length) {
      summary.push(`Técnica: ${details.hemorrhoidTechnique.join(", ")}`)
    }
    if (details.hemorrhoidEnergyType) {
      summary.push(`Energia: ${details.hemorrhoidEnergyType}`)
    }
    if (details.fistulaType) {
      summary.push(`Tipo: ${details.fistulaType}`)
    }
    if (details.fistulaTechnique) {
      summary.push(`Técnica: ${details.fistulaTechnique}`)
    }
  }

  // Prescrição
  if (templateData.prescription) {
    const { ointments, medications } = templateData.prescription

    if (ointments?.length) {
      summary.push(`${ointments.length} pomada(s)`)
    }
    if (medications?.length) {
      summary.push(`${medications.length} medicação(ões)`)
    }
  }

  return summary
}
