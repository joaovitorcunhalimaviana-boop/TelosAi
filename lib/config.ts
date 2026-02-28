/**
 * Configurações centralizadas do sistema
 */

import type { SurgeryType, FollowUpDay } from '@/types/followup';

// ============================================
// CONFIGURAÇÕES DE IA
// ============================================

export const AI_CONFIG = {
  model: 'claude-haiku-4-5-20251001',
  maxTokens: 2000,
  temperature: 0.3, // Baixa temperatura para maior consistência
  timeout: 30000, // 30 segundos
} as const;

// ============================================
// CONFIGURAÇÕES DE RED FLAGS
// ============================================

export const RED_FLAG_THRESHOLDS = {
  // Febre
  fever: {
    high: 38.0, // °C
    critical: 39.0, // °C
  },

  // Dor (escala 0-10)
  pain: {
    moderate: 6,
    high: 8,
    extreme: 9,
  },

  // Retenção urinária (horas)
  urinaryRetention: {
    moderate: 6,
    prolonged: 12,
  },

  // Dias sem evacuação
  noBowelMovement: {
    hemorrhoid: 3, // D+3
    fissure: 4, // D+4
  },

  // Sangramento
  bleedingModerateAfterDay: 3, // D+3
} as const;

// ============================================
// CONFIGURAÇÕES DE FOLLOW-UP
// ============================================

export const FOLLOW_UP_CONFIG = {
  // Dias de follow-up padrão
  days: [1, 2, 3, 5, 7, 10, 14] as readonly FollowUpDay[],

  // Horário de envio (em horas, 24h format)
  sendTime: {
    hour: 9, // 09:00
    minute: 0,
  },

  // Considerar atrasado após (horas)
  overdueThresholdHours: 24,

  // Tempo para reenvio se não respondido (horas)
  reminderAfterHours: 48,
} as const;

// ============================================
// QUESTÕES DO QUESTIONÁRIO POR TIPO DE CIRURGIA
// ============================================

export const QUESTIONNAIRE_QUESTIONS = {
  hemorroidectomia: [
    {
      id: 'painLevel',
      question: 'Numa escala de 0 a 10, qual o nível de dor que você está sentindo?',
      type: 'number',
      required: true,
    },
    {
      id: 'urinaryRetention',
      question: 'Você está com dificuldade para urinar?',
      type: 'boolean',
      required: true,
    },
    {
      id: 'urinaryRetentionHours',
      question: 'Há quantas horas você não consegue urinar?',
      type: 'number',
      required: false,
      showIf: { urinaryRetention: true },
    },
    {
      id: 'bowelMovement',
      question: 'Você já evacuou após a cirurgia?',
      type: 'boolean',
      required: true,
    },
    {
      id: 'bleeding',
      question: 'Está tendo sangramento?',
      type: 'select',
      options: ['none', 'light', 'moderate', 'severe'],
      required: true,
    },
    {
      id: 'fever',
      question: 'Você está com febre?',
      type: 'boolean',
      required: true,
    },
    {
      id: 'temperature',
      question: 'Qual a sua temperatura?',
      type: 'number',
      required: false,
      showIf: { fever: true },
    },
  ],

  fistula: [
    {
      id: 'painLevel',
      question: 'Numa escala de 0 a 10, qual o nível de dor que você está sentindo?',
      type: 'number',
      required: true,
    },
    {
      id: 'fever',
      question: 'Você está com febre?',
      type: 'boolean',
      required: true,
    },
    {
      id: 'temperature',
      question: 'Qual a sua temperatura?',
      type: 'number',
      required: false,
      showIf: { fever: true },
    },
    {
      id: 'additionalSymptoms',
      question: 'Você está com vermelhidão, inchaço ou calor ao redor da ferida?',
      type: 'multiselect',
      options: ['Vermelhidão', 'Inchaço', 'Calor local'],
      required: false,
    },
  ],

  fissura: [
    {
      id: 'painLevel',
      question: 'Numa escala de 0 a 10, qual o nível de dor que você está sentindo?',
      type: 'number',
      required: true,
    },
    {
      id: 'bowelMovement',
      question: 'Você já evacuou após a cirurgia?',
      type: 'boolean',
      required: true,
    },
    {
      id: 'bleeding',
      question: 'Está tendo sangramento?',
      type: 'select',
      options: ['none', 'light', 'moderate', 'severe'],
      required: true,
    },
    {
      id: 'fever',
      question: 'Você está com febre?',
      type: 'boolean',
      required: true,
    },
  ],

  pilonidal: [
    {
      id: 'painLevel',
      question: 'Numa escala de 0 a 10, qual o nível de dor que você está sentindo?',
      type: 'number',
      required: true,
    },
    {
      id: 'fever',
      question: 'Você está com febre?',
      type: 'boolean',
      required: true,
    },
    {
      id: 'temperature',
      question: 'Qual a sua temperatura?',
      type: 'number',
      required: false,
      showIf: { fever: true },
    },
    {
      id: 'additionalSymptoms',
      question: 'Você está com vermelhidão, inchaço ou calor ao redor da ferida?',
      type: 'multiselect',
      options: ['Vermelhidão', 'Inchaço', 'Calor local'],
      required: false,
    },
  ],
} as const;

// ============================================
// MENSAGENS PADRÃO WHATSAPP
// ============================================

export const WHATSAPP_MESSAGES = {
  greeting: (patientName: string, surgeryType: string, dayNumber: number) =>
    `Olá ${patientName}! 👋\n\n` +
    `Este é seu questionário de acompanhamento D+${dayNumber} após sua cirurgia de ${surgeryType}.\n\n` +
    `Por favor, responda às seguintes perguntas para que eu possa avaliar sua recuperação:`,

  thankYou:
    'Obrigado por responder! Estou analisando suas informações...',

  error:
    'Desculpe, ocorreu um erro ao processar sua resposta. Por favor, tente novamente ou entre em contato com o consultório.',

  doctorAlert: (patientName: string, surgeryType: string, dayNumber: number, riskLevel: string) =>
    `⚠️ ALERTA - Paciente: ${patientName}\n` +
    `Cirurgia: ${surgeryType} (D+${dayNumber})\n` +
    `Nível de risco: ${riskLevel.toUpperCase()}\n` +
    `Requer avaliação médica urgente.`,
} as const;

// ============================================
// CONFIGURAÇÕES DE ALERTA MÉDICO
// ============================================

export const DOCTOR_ALERT_CONFIG = {
  // Níveis de risco que geram alerta
  alertOnRiskLevels: ['high', 'critical'] as const,

  // Telefone do médico (WhatsApp)
  doctorPhone: process.env.DOCTOR_PHONE || '',

  // Email do médico
  doctorEmail: process.env.DOCTOR_EMAIL || 'dr.joaovitor@example.com',

  // Enviar SMS além do WhatsApp
  sendSMS: true,

  // Prioridade de alerta por nível de risco
  priority: {
    critical: 'immediate', // Enviar imediatamente
    high: 'urgent', // Enviar em até 15 minutos
    medium: 'normal', // Incluir no relatório diário
    low: 'low', // Apenas registrar
  },
} as const;

// ============================================
// CONFIGURAÇÕES DE PESQUISA CIENTÍFICA
// ============================================

export const RESEARCH_CONFIG = {
  // Campos obrigatórios para inclusão em pesquisa
  requiredFields: [
    'patient.age',
    'patient.sex',
    'surgery.type',
    'surgery.date',
    'followUpResponse.riskLevel',
  ],

  // Anonimização de dados
  anonymize: {
    removeNames: true,
    removeCPF: true,
    removePhone: true,
    removeEmail: true,
    hashPatientId: true,
  },

  // Exportar dados em formato
  exportFormats: ['csv', 'json', 'xlsx'],
} as const;

// ============================================
// CONFIGURAÇÕES DE BACKUP
// ============================================

export const BACKUP_CONFIG = {
  // Frequência de backup automático (cron expression)
  frequency: '0 2 * * *', // 02:00 todos os dias

  // Retenção de backups (dias)
  retentionDays: 30,

  // Path de backup
  backupPath: process.env.BACKUP_PATH || './backups',
} as const;

// ============================================
// CONFIGURAÇÕES DE LOG
// ============================================

export const LOG_CONFIG = {
  // Nível de log (development vs production)
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

  // Logs de IA (para análise e melhoria)
  logAIAnalysis: true,

  // Logs de red flags
  logRedFlags: true,

  // Logs de WhatsApp
  logWhatsApp: true,
} as const;

// ============================================
// EXPORTAR CONFIGURAÇÃO COMPLETA
// ============================================

export const CONFIG = {
  ai: AI_CONFIG,
  redFlags: RED_FLAG_THRESHOLDS,
  followUp: FOLLOW_UP_CONFIG,
  questionnaire: QUESTIONNAIRE_QUESTIONS,
  whatsapp: WHATSAPP_MESSAGES,
  doctorAlert: DOCTOR_ALERT_CONFIG,
  research: RESEARCH_CONFIG,
  backup: BACKUP_CONFIG,
  log: LOG_CONFIG,
} as const;

export default CONFIG;
