/**
 * Machine Learning Prediction Service
 *
 * Integra predições de risco de complicações pós-operatórias
 * usando modelo de ML externo via API Python.
 *
 * IMPORTANTE: Este serviço NÃO bloqueia o fluxo principal.
 * Se a API ML falhar, o cadastro continua normalmente.
 */

import { Patient, Surgery } from '@prisma/client'

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface MLPredictionInput {
  // Dados do paciente
  age?: number | null
  sex?: string | null

  // Tipo de cirurgia
  surgeryType: string

  // Comorbidades (se disponível)
  hasComorbidities?: boolean
  comorbidityCount?: number

  // Medicações (se disponível)
  medicationCount?: number

  // Outros fatores de risco
  [key: string]: any
}

export interface MLPredictionResult {
  risk: number // 0.0 a 1.0
  level: 'low' | 'medium' | 'high'
  features: {
    importance: Record<string, number>
    values: Record<string, any>
  }
  modelVersion: string
  timestamp: Date
}

export interface MLPredictionError {
  error: string
  timestamp: Date
}

// ============================================
// CONFIGURAÇÕES
// ============================================

const ML_API_BASE_URL = process.env.ML_API_URL || 'http://localhost:8000'
const ML_API_TIMEOUT = 5000 // 5 segundos
const ML_MODEL_VERSION = process.env.ML_MODEL_VERSION || '1.0.0'

// Thresholds para classificação de risco
const RISK_THRESHOLDS = {
  LOW: 0.3,    // 0.0 - 0.3 = baixo risco
  MEDIUM: 0.6, // 0.3 - 0.6 = médio risco
  // > 0.6 = alto risco
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Classifica o nível de risco baseado na probabilidade
 */
function classifyRiskLevel(probability: number): 'low' | 'medium' | 'high' {
  if (probability < RISK_THRESHOLDS.LOW) return 'low'
  if (probability < RISK_THRESHOLDS.MEDIUM) return 'medium'
  return 'high'
}

/**
 * Prepara os dados do paciente para enviar ao modelo ML
 */
function prepareMLInput(
  surgery: Surgery,
  patient: Patient,
  additionalData?: any
): MLPredictionInput {
  return {
    age: patient.age,
    sex: patient.sex,
    surgeryType: surgery.type,
    hasComorbidities: additionalData?.comorbidityCount > 0,
    comorbidityCount: additionalData?.comorbidityCount || 0,
    medicationCount: additionalData?.medicationCount || 0,
    // Adicione outros campos conforme necessário
    ...additionalData,
  }
}

/**
 * Faz chamada HTTP com timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// ============================================
// FUNÇÃO PRINCIPAL DE PREDIÇÃO
// ============================================

/**
 * Prediz o risco de complicações pós-operatórias
 *
 * @param surgery - Dados da cirurgia
 * @param patient - Dados do paciente
 * @param additionalData - Dados adicionais (comorbidades, medicações, etc)
 * @returns Resultado da predição ou null se falhar
 *
 * IMPORTANTE: Esta função é não-bloqueante. Se falhar, retorna null
 * e o sistema continua funcionando normalmente.
 */
export async function predictComplicationRisk(
  surgery: Surgery,
  patient: Patient,
  additionalData?: any
): Promise<MLPredictionResult | null> {
  const startTime = Date.now()

  try {
    // Preparar dados de entrada
    const input = prepareMLInput(surgery, patient, additionalData)

    console.log('[ML] Iniciando predição de risco:', {
      patientId: patient.id,
      surgeryId: surgery.id,
      surgeryType: surgery.type,
      timestamp: new Date().toISOString(),
    })

    // Chamar API de ML
    const response = await fetchWithTimeout(
      `${ML_API_BASE_URL}/api/ml/predict`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      },
      ML_API_TIMEOUT
    )

    if (!response.ok) {
      throw new Error(`ML API retornou status ${response.status}`)
    }

    const data = await response.json()

    // Validar resposta
    if (typeof data.risk !== 'number' || data.risk < 0 || data.risk > 1) {
      throw new Error('Resposta inválida da API ML: risco fora do intervalo [0,1]')
    }

    // Classificar nível de risco
    const riskLevel = classifyRiskLevel(data.risk)

    const result: MLPredictionResult = {
      risk: data.risk,
      level: riskLevel,
      features: {
        importance: data.feature_importance || {},
        values: input,
      },
      modelVersion: data.model_version || ML_MODEL_VERSION,
      timestamp: new Date(),
    }

    const elapsedTime = Date.now() - startTime
    console.log('[ML] Predição concluída com sucesso:', {
      patientId: patient.id,
      surgeryId: surgery.id,
      risk: result.risk,
      level: result.level,
      elapsedTimeMs: elapsedTime,
    })

    return result

  } catch (error) {
    const elapsedTime = Date.now() - startTime

    // Log de erro mas NÃO propaga (não-bloqueante)
    console.error('[ML] Erro ao predizer risco (não-bloqueante):', {
      patientId: patient.id,
      surgeryId: surgery.id,
      error: error instanceof Error ? error.message : String(error),
      elapsedTimeMs: elapsedTime,
    })

    // Retornar null em caso de erro
    return null
  }
}

// ============================================
// PREDIÇÃO ASYNC (FIRE-AND-FORGET)
// ============================================

/**
 * Executa predição em background sem bloquear o fluxo
 * Ideal para usar após cadastro de paciente
 *
 * @param surgery - Dados da cirurgia
 * @param patient - Dados do paciente
 * @param onSuccess - Callback opcional para sucesso
 * @param onError - Callback opcional para erro
 */
export function predictComplicationRiskAsync(
  surgery: Surgery,
  patient: Patient,
  additionalData?: any,
  onSuccess?: (result: MLPredictionResult) => void,
  onError?: (error: Error) => void
): void {
  // Fire-and-forget: não espera resultado
  predictComplicationRisk(surgery, patient, additionalData)
    .then((result) => {
      if (result && onSuccess) {
        onSuccess(result)
      }
    })
    .catch((error) => {
      if (onError) {
        onError(error)
      }
    })
}

// ============================================
// UTILIDADES PARA VISUALIZAÇÃO
// ============================================

/**
 * Formata o risco como percentual para exibição
 */
export function formatRiskPercentage(risk: number): string {
  return `${Math.round(risk * 100)}%`
}

/**
 * Retorna a cor apropriada para o nível de risco
 */
export function getRiskColor(level: 'low' | 'medium' | 'high'): string {
  const colors = {
    low: '#22c55e',    // green-500
    medium: '#eab308', // yellow-500
    high: '#ef4444',   // red-500
  }
  return colors[level]
}

/**
 * Retorna o texto descritivo para o nível de risco
 */
export function getRiskLabel(level: 'low' | 'medium' | 'high'): string {
  const labels = {
    low: 'Baixo Risco',
    medium: 'Risco Moderado',
    high: 'Alto Risco',
  }
  return labels[level]
}

/**
 * Retorna os principais fatores de risco ordenados por importância
 */
export function getTopRiskFactors(
  features: MLPredictionResult['features'],
  topN: number = 5
): Array<{ name: string; importance: number; value: any }> {
  const { importance, values } = features

  return Object.entries(importance)
    .map(([name, importanceValue]) => ({
      name,
      importance: importanceValue,
      value: values[name],
    }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, topN)
}

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Verifica se a API ML está disponível
 */
export async function checkMLAPIHealth(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(
      `${ML_API_BASE_URL}/health`,
      { method: 'GET' },
      3000
    )
    return response.ok
  } catch (error) {
    console.error('[ML] API não disponível:', error)
    return false
  }
}
