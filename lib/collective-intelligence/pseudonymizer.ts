import { createHash } from "crypto"

/**
 * Pseudonimiza dados sensíveis usando SHA-256 com salt secreto
 * Conforme LGPD Art. 13 §3º sobre técnicas de anonimização
 */

const SALT = process.env.PSEUDONYMIZATION_SALT || "telos-ai-collective-intelligence-2024"

/**
 * Gera hash pseudônimo irreversível
 */
export function pseudonymize(value: string): string {
  if (!value) return ""

  const hash = createHash("sha256")
  hash.update(value + SALT)
  return hash.digest("hex")
}

/**
 * Pseudonimiza CPF removendo formatação e gerando hash
 */
export function pseudonymizeCPF(cpf: string | null): string | null {
  if (!cpf) return null

  // Remove pontos e traços
  const cleanCpf = cpf.replace(/[.-]/g, "")
  return pseudonymize(cleanCpf)
}

/**
 * Pseudonimiza telefone removendo formatação e gerando hash
 */
export function pseudonymizePhone(phone: string): string {
  if (!phone) return ""

  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, "")
  return pseudonymize(cleanPhone)
}

/**
 * Pseudonimiza email mantendo o domínio para análise
 */
export function pseudonymizeEmail(email: string | null): string | null {
  if (!email) return null

  const [localPart, domain] = email.split("@")
  const hashedLocal = pseudonymize(localPart)

  // Retorna hash curto + domínio (para permitir análise de domínios comuns)
  return `${hashedLocal.slice(0, 16)}@${domain}`
}

/**
 * Interface para dados pseudonimizados de paciente
 */
export interface PseudonymizedPatientData {
  pseudoId: string // Hash do ID original
  age: number | null
  sex: string | null
  comorbidities: string[] // Nomes das comorbidades (não sensível)
  surgeries: PseudonymizedSurgeryData[]
  followUps: PseudonymizedFollowUpData[]
}

export interface PseudonymizedSurgeryData {
  pseudoId: string
  type: string
  date: Date
  durationMinutes: number | null
  anesthesiaType: string | null
  pudendalBlock: boolean
  status: string
}

export interface PseudonymizedFollowUpData {
  pseudoId: string
  dayNumber: number
  painLevel: number | null
  riskLevel: string
  hasRedFlags: boolean
  status: string
}

/**
 * Pseudonimiza dados completos de um paciente para o pool coletivo
 */
export async function pseudonymizePatient(patient: any): Promise<PseudonymizedPatientData> {
  return {
    pseudoId: pseudonymize(patient.id),
    age: patient.age,
    sex: patient.sex,
    comorbidities: patient.comorbidities?.map((pc: any) => pc.comorbidity.name) || [],
    surgeries: patient.surgeries?.map((s: any) => pseudonymizeSurgery(s)) || [],
    followUps: patient.followUps?.map((f: any) => pseudonymizeFollowUp(f)) || [],
  }
}

function pseudonymizeSurgery(surgery: any): PseudonymizedSurgeryData {
  return {
    pseudoId: pseudonymize(surgery.id),
    type: surgery.type,
    date: surgery.date,
    durationMinutes: surgery.durationMinutes || null,
    anesthesiaType: surgery.anesthesia?.type || null,
    pudendalBlock: surgery.anesthesia?.pudendoBlock || false,
    status: surgery.status,
  }
}

function pseudonymizeFollowUp(followUp: any): PseudonymizedFollowUpData {
  const response = followUp.responses?.[0] // Primeira resposta

  // Parse questionnaireData JSON
  let painLevel = null
  try {
    if (response?.questionnaireData) {
      const data = JSON.parse(response.questionnaireData)
      painLevel = data.painLevel ? parseInt(data.painLevel) : null
    }
  } catch (e) {
    // Ignora erro de parse
  }

  return {
    pseudoId: pseudonymize(followUp.id),
    dayNumber: followUp.dayNumber,
    painLevel,
    riskLevel: response?.riskLevel || "low",
    hasRedFlags: response?.redFlags ? response.redFlags.length > 0 : false,
    status: followUp.status,
  }
}

/**
 * Exporta dados pseudonimizados para treinamento de ML
 */
export interface MLTrainingDataset {
  exportDate: Date
  totalPatients: number
  totalSurgeries: number
  totalFollowUps: number
  patients: PseudonymizedPatientData[]
  metadata: {
    version: string
    pseudonymizationMethod: string
    lgpdCompliant: boolean
  }
}

export async function generateMLDataset(
  patients: any[]
): Promise<MLTrainingDataset> {
  const pseudonymizedPatients = await Promise.all(
    patients.map(p => pseudonymizePatient(p))
  )

  return {
    exportDate: new Date(),
    totalPatients: pseudonymizedPatients.length,
    totalSurgeries: pseudonymizedPatients.reduce((sum, p) => sum + p.surgeries.length, 0),
    totalFollowUps: pseudonymizedPatients.reduce((sum, p) => sum + p.followUps.length, 0),
    patients: pseudonymizedPatients,
    metadata: {
      version: "1.0.0",
      pseudonymizationMethod: "SHA-256 with secret salt",
      lgpdCompliant: true,
    },
  }
}
