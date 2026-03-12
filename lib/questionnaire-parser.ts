/**
 * Parser centralizado para dados de questionário pós-operatório.
 * Normaliza todos os nomes de campo variantes (pain, dor, painAtRest, nivel_dor, etc.)
 * em uma interface padronizada.
 */

export interface EvacuationDetail {
  actualDay: number
  time?: string
  pain: number
}

export interface RestingPainEntry {
  time?: string  // Horário aproximado (ex: "10h30", "após almoço", "mais tarde")
  pain: number   // Nível de dor 0-10
}

export interface ParsedQuestionnaireData {
  painAtRest: number | null
  restingPainHistory: RestingPainEntry[] | null  // Leituras espontâneas adicionais de dor em repouso
  painDuringEvacuation: number | null
  didEvacuate: boolean
  evacuationActualDay: number | null
  evacuationDetails: EvacuationDetail[] | null
  bleeding: string | null
  fever: boolean
  temperature: number | null
  medications: boolean
  urinated: boolean
  concerns: string | null
  hasRedFlags: boolean
  usedExtraMedication: boolean
  extraMedicationDetails: string | null
  localCareAdherence: boolean | null
  additionalSymptoms: string | null
  satisfactionRating: number | null
  wouldRecommend: boolean | null
  positiveFeedback: string | null
  improvementSuggestions: string | null
}

interface DbResponseColumns {
  painAtRest?: number | null
  painDuringBowel?: number | null
  redFlags?: string | null
  riskLevel?: string | null
}

/**
 * Faz parse do questionnaireData (string JSON ou objeto) e normaliza os campos.
 * Lida com dados no nível raiz OU dentro de `extractedData`.
 * Usa ?? (não ||) para aceitar valor 0.
 * Faz fallback para colunas tipadas do banco (painAtRest, painDuringBowel).
 */
/**
 * Parse seguro de JSON de questionário (retorna objeto raw, sem normalização).
 * Útil quando se precisa acessar campos arbitrários do JSON original.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeParseQuestionnaireJSON(jsonString: string): any {
  try {
    return JSON.parse(jsonString)
  } catch {
    return {}
  }
}

export function parseQuestionnaireData(
  questionnaireDataInput: string | Record<string, any> | null | undefined,
  dbResponse?: DbResponseColumns
): ParsedQuestionnaireData {
  let raw: Record<string, any> = {}

  try {
    if (typeof questionnaireDataInput === 'string') {
      raw = JSON.parse(questionnaireDataInput || '{}')
    } else {
      raw = questionnaireDataInput || {}
    }
  } catch {
    raw = {}
  }

  // Dados podem estar no nível raiz OU dentro de extractedData
  const extracted: Record<string, any> = raw.extractedData || {}

  // Helper: busca campo em extracted primeiro, depois no raw
  const get = (keys: string[]): any => {
    for (const key of keys) {
      if (extracted[key] !== undefined && extracted[key] !== null) return extracted[key]
    }
    for (const key of keys) {
      if (raw[key] !== undefined && raw[key] !== null) return raw[key]
    }
    return undefined
  }

  // --- Dor em repouso ---
  const rawPainAtRest = get(['pain', 'painAtRest', 'dor', 'nivel_dor'])
  const painAtRest = rawPainAtRest !== undefined
    ? Number(rawPainAtRest)
    : (dbResponse?.painAtRest ?? null)

  // --- Evacuação ---
  const didEvacuate = get([
    'bowelMovementSinceLastContact',
    'hadBowelMovementSinceLastContact',
    'evacuated',
    'bowelMovement',
  ]) === true

  // --- Dia real da evacuação (para plotar no dia correto) ---
  const rawEvacDay = get(['firstBowelMovementActualDay', 'evacuationActualDay', 'bowelMovementActualDay'])
  const evacuationActualDay = rawEvacDay !== undefined ? Number(rawEvacDay) : null

  // --- Detalhes de múltiplas evacuações ---
  let evacuationDetails: EvacuationDetail[] | null = null
  const rawEvacDetails = get(['evacuationDetails'])
  if (Array.isArray(rawEvacDetails) && rawEvacDetails.length > 0) {
    evacuationDetails = rawEvacDetails
      .filter((d: any) => d && typeof d.actualDay === 'number' && typeof d.pain === 'number')
      .map((d: any) => ({ actualDay: d.actualDay, time: d.time, pain: d.pain }))
    if (evacuationDetails.length === 0) evacuationDetails = null
  }

  // --- Histórico de dor em repouso (leituras espontâneas adicionais) ---
  let restingPainHistory: RestingPainEntry[] | null = null
  const rawRestingPainHistory = get(['restingPainHistory'])
  if (Array.isArray(rawRestingPainHistory) && rawRestingPainHistory.length > 0) {
    const parsed = rawRestingPainHistory
      .filter((d: any) => d && typeof d.pain === 'number')
      .map((d: any) => ({ time: d.time as string | undefined, pain: d.pain as number }))
    if (parsed.length > 0) restingPainHistory = parsed
  }

  // --- Dor durante evacuação ---
  let painDuringEvacuation: number | null = null
  if (didEvacuate) {
    const rawEvacPain = get([
      'painDuringBowelMovement',
      'painDuringBowel',
      'painDuringEvacuation',
      'evacuationPain',
      'dor_evacuar',
    ])
    painDuringEvacuation = rawEvacPain !== undefined
      ? Number(rawEvacPain)
      : (dbResponse?.painDuringBowel ?? null)

    // Se não há evacuationDetails mas há painDuringEvacuation e evacuationActualDay,
    // construir evacuationDetails a partir dos dados legados
    if (!evacuationDetails && painDuringEvacuation !== null && evacuationActualDay !== null) {
      evacuationDetails = [{ actualDay: evacuationActualDay, pain: painDuringEvacuation }]
    }
  }

  // --- Sangramento ---
  const bleedingRaw = get(['bleeding'])
  const bleeding = bleedingRaw !== undefined ? String(bleedingRaw) : null

  // --- Febre ---
  const fever = get(['fever']) === true

  // --- Temperatura ---
  const tempRaw = get(['temperature', 'feverTemperature'])
  const temperature = tempRaw !== undefined ? Number(tempRaw) : null

  // --- Medicação ---
  const medications = get(['medications']) === true

  // --- Urina ---
  const urinated = get(['urination', 'urinated']) === true

  // --- Preocupações ---
  const concerns = get(['concerns']) ?? null

  // --- Medicação extra ---
  const usedExtraMedication = get(['usedExtraMedication', 'usedExtraMeds']) === true

  // --- Detalhes da medicação extra ---
  const extraMedicationDetails = get(['extraMedicationDetails', 'extraMedsDetails']) ?? null

  // --- Cuidados locais ---
  const localCareRaw = get(['localCareAdherence', 'ointmentAdherence'])
  const localCareAdherence = localCareRaw !== undefined ? localCareRaw === true : null

  // --- Sintomas adicionais ---
  const additionalSymptoms = get(['additionalSymptoms']) ?? null

  // --- Satisfação (D+14) ---
  const satisfactionRatingRaw = get(['satisfactionRating'])
  const satisfactionRating = satisfactionRatingRaw !== undefined ? Number(satisfactionRatingRaw) : null
  const wouldRecommendRaw = get(['wouldRecommend'])
  const wouldRecommend = wouldRecommendRaw !== undefined ? wouldRecommendRaw === true : null
  const positiveFeedback = get(['positiveFeedback']) ?? null
  const improvementSuggestions = get(['improvementSuggestions', 'satisfactionComments']) ?? null

  // --- Red flags ---
  let hasRedFlags = false
  if (dbResponse?.redFlags) {
    try {
      const flags = typeof dbResponse.redFlags === 'string'
        ? JSON.parse(dbResponse.redFlags)
        : dbResponse.redFlags
      hasRedFlags = Array.isArray(flags) && flags.length > 0
    } catch {
      hasRedFlags = false
    }
  }
  if (dbResponse?.riskLevel === 'critical' || dbResponse?.riskLevel === 'high') {
    hasRedFlags = true
  }

  return {
    painAtRest: painAtRest !== null && !isNaN(painAtRest as number) ? painAtRest : null,
    restingPainHistory,
    painDuringEvacuation: painDuringEvacuation !== null && !isNaN(painDuringEvacuation as number) ? painDuringEvacuation : null,
    didEvacuate,
    evacuationActualDay,
    evacuationDetails,
    bleeding,
    fever,
    temperature,
    medications,
    urinated,
    concerns,
    hasRedFlags,
    usedExtraMedication,
    extraMedicationDetails,
    localCareAdherence,
    additionalSymptoms,
    satisfactionRating: satisfactionRating !== null && !isNaN(satisfactionRating) ? satisfactionRating : null,
    wouldRecommend,
    positiveFeedback,
    improvementSuggestions,
  }
}
