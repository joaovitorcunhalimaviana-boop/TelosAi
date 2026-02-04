/**
 * Parser centralizado para dados de questionário pós-operatório.
 * Normaliza todos os nomes de campo variantes (pain, dor, painAtRest, nivel_dor, etc.)
 * em uma interface padronizada.
 */

export interface ParsedQuestionnaireData {
  painAtRest: number | null
  painDuringEvacuation: number | null
  didEvacuate: boolean
  bleeding: string | null
  fever: boolean
  temperature: number | null
  medications: boolean
  urinated: boolean
  concerns: string | null
  hasRedFlags: boolean
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
    painDuringEvacuation: painDuringEvacuation !== null && !isNaN(painDuringEvacuation as number) ? painDuringEvacuation : null,
    didEvacuate,
    bleeding,
    fever,
    temperature,
    medications,
    urinated,
    concerns,
    hasRedFlags,
  }
}
