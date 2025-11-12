/**
 * Tipos TypeScript para o sistema de follow-up e análise de respostas
 */

// ============================================
// TIPOS DE CIRURGIA
// ============================================

export type SurgeryType = 'hemorroidectomia' | 'fistula' | 'fissura' | 'pilonidal';

export const SURGERY_TYPE_LABELS: Record<SurgeryType, string> = {
  hemorroidectomia: 'Hemorroidectomia',
  fistula: 'Fístula Anal',
  fissura: 'Fissura Anal',
  pilonidal: 'Cisto Pilonidal',
};

// ============================================
// NÍVEIS DE RISCO
// ============================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
  critical: 'Crítico',
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  low: 'green',
  medium: 'yellow',
  high: 'orange',
  critical: 'red',
};

// ============================================
// QUESTIONÁRIO DE FOLLOW-UP
// ============================================

export type BleedingLevel = 'none' | 'light' | 'moderate' | 'severe';
export type DischargeType = 'none' | 'serous' | 'purulent' | 'abundant';

export interface QuestionnaireData {
  // Dor (escala 0-10)
  painLevel?: number;

  // Retenção urinária
  urinaryRetention?: boolean;
  urinaryRetentionHours?: number;

  // Função intestinal
  bowelMovement?: boolean;
  bowelMovementDate?: Date;

  // Sangramento
  bleeding?: BleedingLevel;
  bleedingDetails?: string;

  // Febre
  fever?: boolean;
  temperature?: number;

  // Secreção
  discharge?: DischargeType;
  dischargeDetails?: string;

  // Sintomas adicionais
  additionalSymptoms?: string[];

  // Preocupações do paciente
  concerns?: string;

  // Outras observações
  notes?: string;
}

// ============================================
// DADOS DO PACIENTE
// ============================================

export interface PatientData {
  name: string;
  age?: number;
  sex?: string;
  comorbidities?: string[];
  medications?: string[];
}

// ============================================
// RED FLAGS
// ============================================

export type RedFlagSeverity = 'critical' | 'high' | 'medium';

export interface RedFlag {
  id: string;
  severity: RedFlagSeverity;
  message: string;
  recommendation: string;
}

export interface RedFlagInput {
  surgeryType: SurgeryType;
  dayNumber: number;
  painLevel?: number;
  urinaryRetention?: boolean;
  urinaryRetentionHours?: number;
  bowelMovement?: boolean;
  bleeding?: BleedingLevel;
  fever?: boolean;
  temperature?: number;
  discharge?: DischargeType;
  additionalSymptoms?: string[];
}

// ============================================
// ANÁLISE DE IA
// ============================================

export interface AnalysisInput {
  surgeryType: string;
  dayNumber: number;
  patientData: PatientData;
  questionnaireData: QuestionnaireData;
  detectedRedFlags: string[];
}

export interface AnalysisOutput {
  riskLevel: RiskLevel;
  additionalRedFlags: string[];
  empatheticResponse: string;
  seekCareAdvice: string | null;
  reasoning?: string;
}

// ============================================
// RESPOSTA DE FOLLOW-UP (Banco de Dados)
// ============================================

export interface FollowUpResponseData {
  id: string;
  createdAt: Date;
  followUpId: string;

  // Dados do questionário
  questionnaireData: QuestionnaireData;

  // Análise da IA
  aiAnalysis?: {
    deterministicRedFlags: RedFlag[];
    deterministicRiskLevel: RiskLevel;
    aiRiskLevel: RiskLevel;
    finalRiskLevel: RiskLevel;
    reasoning?: string;
    seekCareAdvice: string | null;
  };

  // Resposta empática enviada ao paciente
  aiResponse?: string;

  // Nível de risco
  riskLevel: RiskLevel;

  // Red flags detectados
  redFlags: string[];

  // Alerta médico
  doctorAlerted: boolean;
  alertSentAt?: Date;
}

// ============================================
// API REQUEST/RESPONSE
// ============================================

export interface AnalyzeResponseRequest {
  followUpId: string;
  questionnaireData: QuestionnaireData;
}

export interface AnalyzeResponseSuccess {
  success: true;
  data: {
    responseId: string;
    riskLevel: RiskLevel;
    empatheticResponse: string;
    seekCareAdvice: string | null;
    redFlags: string[];
    doctorAlerted: boolean;
  };
}

export interface AnalyzeResponseError {
  success: false;
  error: string;
  details?: string;
}

export type AnalyzeResponseResult = AnalyzeResponseSuccess | AnalyzeResponseError;

// ============================================
// FOLLOW-UP STATUS
// ============================================

export type FollowUpStatus = 'pending' | 'sent' | 'responded' | 'overdue' | 'skipped';

export const FOLLOW_UP_STATUS_LABELS: Record<FollowUpStatus, string> = {
  pending: 'Pendente',
  sent: 'Enviado',
  responded: 'Respondido',
  overdue: 'Atrasado',
  skipped: 'Ignorado',
};

// ============================================
// DIAS DE FOLLOW-UP
// ============================================

export const FOLLOW_UP_DAYS = [1, 2, 3, 5, 7, 10, 14] as const;
export type FollowUpDay = typeof FOLLOW_UP_DAYS[number];

// ============================================
// UTILITÁRIOS DE VALIDAÇÃO
// ============================================

export function isSurgeryType(value: string): value is SurgeryType {
  return ['hemorroidectomia', 'fistula', 'fissura', 'pilonidal'].includes(value);
}

export function isRiskLevel(value: string): value is RiskLevel {
  return ['low', 'medium', 'high', 'critical'].includes(value);
}

export function isBleedingLevel(value: string): value is BleedingLevel {
  return ['none', 'light', 'moderate', 'severe'].includes(value);
}

export function isDischargeType(value: string): value is DischargeType {
  return ['none', 'serous', 'purulent', 'abundant'].includes(value);
}

export function isFollowUpStatus(value: string): value is FollowUpStatus {
  return ['pending', 'sent', 'responded', 'overdue', 'skipped'].includes(value);
}

// ============================================
// HELPERS
// ============================================

/**
 * Calcula a data de follow-up baseado na data da cirurgia e dia
 */
export function calculateFollowUpDate(surgeryDate: Date, dayNumber: number): Date {
  const date = new Date(surgeryDate);
  date.setDate(date.getDate() + dayNumber);
  return date;
}

/**
 * Formata nível de risco para exibição
 */
export function formatRiskLevel(level: RiskLevel): string {
  return RISK_LEVEL_LABELS[level];
}

/**
 * Formata tipo de cirurgia para exibição
 */
export function formatSurgeryType(type: SurgeryType): string {
  return SURGERY_TYPE_LABELS[type];
}

/**
 * Determina se o follow-up está atrasado
 */
export function isFollowUpOverdue(scheduledDate: Date): boolean {
  const now = new Date();
  const scheduled = new Date(scheduledDate);
  // Considera atrasado se passou mais de 24h da data agendada
  const hoursDiff = (now.getTime() - scheduled.getTime()) / (1000 * 60 * 60);
  return hoursDiff > 24;
}

/**
 * Valida dados do questionário
 */
export function validateQuestionnaireData(data: QuestionnaireData): string[] {
  const errors: string[] = [];

  if (data.painLevel !== undefined) {
    if (data.painLevel < 0 || data.painLevel > 10) {
      errors.push('Nível de dor deve estar entre 0 e 10');
    }
  }

  if (data.urinaryRetention && data.urinaryRetentionHours !== undefined) {
    if (data.urinaryRetentionHours < 0) {
      errors.push('Horas de retenção urinária não pode ser negativo');
    }
  }

  if (data.temperature !== undefined) {
    if (data.temperature < 35 || data.temperature > 45) {
      errors.push('Temperatura fora da faixa válida (35-45°C)');
    }
  }

  if (data.bleeding && !isBleedingLevel(data.bleeding)) {
    errors.push('Nível de sangramento inválido');
  }

  if (data.discharge && !isDischargeType(data.discharge)) {
    errors.push('Tipo de secreção inválido');
  }

  return errors;
}
