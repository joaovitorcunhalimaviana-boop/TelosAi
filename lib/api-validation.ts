import { z } from 'zod';

// ============================================
// PATIENT VALIDATION SCHEMAS
// ============================================

export const createPatientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  age: z.number().int().min(0).max(120).optional().nullable(),
  sex: z.enum(['Masculino', 'Feminino', 'Outro']).optional().nullable(),
  phone: z.string().min(10, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido').optional().nullable(),
});

export const updatePatientBasicSchema = z.object({
  name: z.string().min(1).optional(),
  cpf: z.string().optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  age: z.number().int().min(0).max(120).optional().nullable(),
  sex: z.enum(['Masculino', 'Feminino', 'Outro']).optional().nullable(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional().nullable(),
});

// ============================================
// SURGERY VALIDATION SCHEMAS
// ============================================

export const surgerySchema = z.object({
  type: z.enum([
    'hemorroidectomia',
    'fistula',
    'fissura',
    'pilonidal',
  ]),
  date: z.string().datetime(),
  hospital: z.string().optional().nullable(),
  durationMinutes: z.number().int().min(0).optional().nullable(),
  status: z.enum(['active', 'completed', 'cancelled']).default('active'),
});

export const updateSurgerySchema = surgerySchema.partial();

// ============================================
// SURGERY DETAILS VALIDATION SCHEMAS
// ============================================

export const surgeryDetailsSchema = z.object({
  // Hemorrhoid fields
  hemorrhoidTechnique: z.string().optional().nullable(),
  hemorrhoidEnergyType: z
    .enum([
      'bisturi_eletrico',
      'bipolar',
      'ligasure',
      'ultrasonica',
      'laser_co2',
      'laser_diodo',
      'radiofrequencia',
      'bisturi_frio',
    ])
    .optional()
    .nullable(),
  hemorrhoidNumMamillae: z.number().int().min(1).max(10).optional().nullable(),
  hemorrhoidPositions: z.string().optional().nullable(),
  hemorrhoidType: z.enum(['interna', 'externa', 'mista']).optional().nullable(),
  hemorrhoidInternalGrade: z.enum(['I', 'II', 'III', 'IV']).optional().nullable(),
  hemorrhoidExternalDetails: z.string().optional().nullable(),

  // Fistula fields
  fistulaType: z
    .enum([
      'interesfincteriana',
      'transesfincteriana',
      'supraesfincteriana',
      'extraesfincteriana',
      'superficial',
    ])
    .optional()
    .nullable(),
  fistulaTechnique: z
    .enum([
      'LIFT',
      'fistulotomia',
      'fistulectomia',
      'flap',
      'selante',
      'plug',
      'VAAFT',
      'laser',
    ])
    .optional()
    .nullable(),
  fistulaNumTracts: z.number().int().min(1).optional().nullable(),
  fistulaSeton: z.boolean().optional().nullable(),
  fistulaSetonMaterial: z.string().optional().nullable(),

  // Fissure fields
  fissureType: z.enum(['aguda', 'cronica']).optional().nullable(),
  fissureLocation: z.enum(['anterior', 'posterior', 'lateral']).optional().nullable(),
  fissureTechnique: z.string().optional().nullable(),

  // Pilonidal fields
  pilonidalTechnique: z.string().optional().nullable(),

  // Common fields
  fullDescription: z.string().optional().nullable(),
  complications: z.string().optional().nullable(),
  recoveryRoomMinutes: z.number().int().min(0).optional().nullable(),
  sameDayDischarge: z.boolean().default(true),
  hospitalizationDays: z.number().int().min(0).optional().nullable(),
});

// ============================================
// ANESTHESIA VALIDATION SCHEMAS
// ============================================

export const anesthesiaSchema = z.object({
  type: z.enum([
    'geral_IOT',
    'geral_mascara',
    'raqui',
    'peridural',
    'local_sedacao',
    'local',
    'bloqueio_plexo',
    'outra',
  ]),
  anesthesiologist: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),

  // Pudendo block
  pudendoBlock: z.boolean().default(false),
  pudendoTechnique: z
    .enum(['anatomia', 'ultrassom', 'neuroestimulacao', 'combinado'])
    .optional()
    .nullable(),
  pudendoAccess: z
    .enum(['transperineal', 'transvaginal', 'transglutea', 'outra'])
    .optional()
    .nullable(),
  pudendoAnesthetic: z
    .enum(['ropivacaina', 'bupivacaina', 'levobupivacaina', 'lidocaina', 'outra'])
    .optional()
    .nullable(),
  pudendoConcentration: z
    .enum(['0.25%', '0.5%', '0.75%', '1%', '2%'])
    .optional()
    .nullable(),
  pudendoVolumeML: z.number().min(0).optional().nullable(),
  pudendoLaterality: z
    .enum(['bilateral', 'unilateral_direito', 'unilateral_esquerdo'])
    .optional()
    .nullable(),
  pudendoAdjuvants: z.string().optional().nullable(),
  pudendoDetails: z.string().optional().nullable(),
});

export const updateAnesthesiaSchema = anesthesiaSchema.partial();

// ============================================
// PRE-OP VALIDATION SCHEMAS
// ============================================

export const preOpSchema = z.object({
  botoxUsed: z.boolean().default(false),
  botoxDate: z.string().datetime().optional().nullable(),
  botoxDoseUnits: z.number().int().min(0).optional().nullable(),
  botoxLocation: z
    .enum(['esfíncter interno', 'externo', 'ambos'])
    .optional()
    .nullable(),
  botoxObservations: z.string().optional().nullable(),
  intestinalPrep: z.boolean().default(false),
  intestinalPrepType: z.string().optional().nullable(),
  otherPreparations: z.string().optional().nullable(),
});

export const updatePreOpSchema = preOpSchema.partial();

// ============================================
// POST-OP VALIDATION SCHEMAS
// ============================================

export const postOpSchema = z.object({
  ointments: z.string().optional().nullable(), // JSON string
  medications: z.string().optional().nullable(), // JSON string
});

// ============================================
// COMORBIDITY VALIDATION SCHEMAS
// ============================================

export const patientComorbiditySchema = z.object({
  comorbidityId: z.string().min(1, 'Comorbidity ID é obrigatório'),
  details: z.string().optional().nullable(),
  severity: z.enum(['Leve', 'Moderada', 'Grave']).optional().nullable(),
});

export const comorbiditiesArraySchema = z.array(patientComorbiditySchema);

// ============================================
// MEDICATION VALIDATION SCHEMAS
// ============================================

export const patientMedicationSchema = z.object({
  medicationId: z.string().min(1, 'Medication ID é obrigatório'),
  dose: z.string().optional().nullable(),
  frequency: z.string().optional().nullable(),
  route: z.enum(['VO', 'IV', 'IM', 'SC', 'Tópica']).optional().nullable(),
});

export const medicationsArraySchema = z.array(patientMedicationSchema);

// ============================================
// FOLLOW-UP VALIDATION SCHEMAS
// ============================================

export const followUpResponseSchema = z.object({
  questionnaireData: z.string(), // JSON string
  aiAnalysis: z.string().optional().nullable(), // JSON string
  aiResponse: z.string().optional().nullable(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
  redFlags: z.string().optional().nullable(), // JSON array string
});

// ============================================
// CONSENT TERM VALIDATION SCHEMAS
// ============================================

export const consentTermSchema = z.object({
  termType: z.enum([
    'surgery_hemorrhoid',
    'surgery_fistula',
    'surgery_fissure',
    'surgery_pilonidal',
    'research_lgpd',
    'whatsapp_followup',
  ]),
  signedPhysically: z.boolean().default(false),
  signedDate: z.string().datetime().optional().nullable(),
  pdfPath: z.string().optional().nullable(),
});

// ============================================
// QUERY PARAMETER VALIDATION SCHEMAS
// ============================================

export const paginationParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const searchParamsSchema = z.object({
  search: z.string().optional(),
  surgeryType: z
    .enum(['hemorroidectomia', 'fistula', 'fissura', 'pilonidal'])
    .optional(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
  completeness: z.enum(['low', 'medium', 'high']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const patientListParamsSchema = paginationParamsSchema.merge(searchParamsSchema);

// ============================================
// HELPER FUNCTIONS
// ============================================

export function validateJSON(jsonString: string | null | undefined): boolean {
  if (!jsonString) return true; // Allow null/undefined

  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

export function parseJSONSafely<T = any>(
  jsonString: string | null | undefined,
  defaultValue: T = null as T
): T {
  if (!jsonString) return defaultValue;

  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return defaultValue;
  }
}

// ============================================
// CUSTOM VALIDATORS
// ============================================

export const cpfValidator = z.string().refine(
  (cpf) => {
    if (!cpf) return true; // Allow empty
    // Remove non-digits
    const cleanCPF = cpf.replace(/\D/g, '');
    // Must have 11 digits
    if (cleanCPF.length !== 11) return false;
    // Check if all digits are the same (invalid)
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    return true;
  },
  { message: 'CPF inválido' }
);

export const phoneValidator = z.string().refine(
  (phone) => {
    if (!phone) return false;
    // Remove non-digits
    const cleanPhone = phone.replace(/\D/g, '');
    // Must have 10 or 11 digits (with or without 9)
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  },
  { message: 'Telefone inválido' }
);

// ============================================
// POST-OPERATIVE DATA VALIDATION SCHEMAS
// Para validação em tempo real dos dados coletados via WhatsApp
// ============================================

/**
 * Schema para validar dados pós-operatórios coletados via questionário
 */
export const postOpDataSchema = z.object({
  // DOR - separada em repouso e durante evacuação
  painAtRest: z.number().min(0).max(10).optional().nullable(),
  painDuringBowelMovement: z.number().min(0).max(10).optional().nullable(),
  painLevel: z.number().min(0).max(10).optional().nullable(), // Legacy

  // FEBRE
  hasFever: z.boolean().optional().nullable(),
  feverDetails: z.string().optional().nullable(),

  // EVACUAÇÃO
  hadBowelMovementSinceLastContact: z.boolean().optional().nullable(),
  hadBowelMovement: z.boolean().optional().nullable(), // Legacy
  bowelMovementTime: z.string().optional().nullable(),
  bristolScale: z.number().min(1).max(7).optional().nullable(),
  isFirstBowelMovement: z.boolean().optional().nullable(),

  // SANGRAMENTO
  bleeding: z.enum(['none', 'mild', 'moderate', 'severe']).optional().nullable(),
  bleedingDetails: z.string().optional().nullable(),

  // ANALGÉSICOS
  takingPrescribedMeds: z.boolean().optional().nullable(),
  prescribedMedsDetails: z.string().optional().nullable(),
  takingExtraMeds: z.boolean().optional().nullable(),
  extraMedsDetails: z.string().optional().nullable(),

  // SECREÇÃO PURULENTA (apenas D+3 em diante)
  hasPurulentDischarge: z.boolean().optional().nullable(),
  purulentDischargeDetails: z.string().optional().nullable(),

  // OUTROS
  otherSymptoms: z.string().optional().nullable(),

  // PESQUISA DE SATISFAÇÃO (apenas D+14)
  painControlSatisfaction: z.number().min(0).max(10).optional().nullable(),
  aiFollowUpSatisfaction: z.number().min(0).max(10).optional().nullable(),
  npsScore: z.number().min(0).max(10).optional().nullable(),
  feedback: z.string().optional().nullable(),

  // Campos legados (manter para compatibilidade)
  canEat: z.boolean().optional().nullable(),
  dietDetails: z.string().optional().nullable(),
  canUrinate: z.boolean().optional().nullable(),
  urinationDetails: z.string().optional().nullable(),
}).passthrough(); // Permite campos extras não definidos

/**
 * Schema para validar resposta da IA Claude
 */
export const claudeAIResponseSchema = z.object({
  message: z.string().min(1, 'Mensagem da IA é obrigatória'),
  needsImage: z.enum(['pain_scale', 'bristol_scale']).nullable().optional(),
  dataCollected: z.record(z.string(), z.any()).default({}),
  completed: z.boolean().default(false),
  needsClarification: z.boolean().optional().default(false),
  conversationPhase: z.string().optional(),
});

/**
 * Schema para validar dados do questionário armazenados no banco
 */
export const questionnaireDataSchema = z.object({
  conversation: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).default([]),
  extractedData: z.record(z.string(), z.any()).default({}),
  completed: z.boolean().default(false),
  conversationPhase: z.string().optional(),
  hadFirstBowelMovement: z.boolean().optional(),
}).passthrough();

/**
 * Valida e sanitiza dados pós-operatórios
 * Retorna dados válidos ou null se inválido
 */
export function validatePostOpData(data: unknown): z.infer<typeof postOpDataSchema> | null {
  try {
    return postOpDataSchema.parse(data);
  } catch (error) {
    console.error('❌ PostOpData validation failed:', error);
    return null;
  }
}

/**
 * Valida resposta da IA Claude de forma segura
 * Retorna dados válidos ou null se inválido
 */
export function validateClaudeResponse(data: unknown): z.infer<typeof claudeAIResponseSchema> | null {
  try {
    return claudeAIResponseSchema.parse(data);
  } catch (error) {
    console.error('❌ Claude response validation failed:', error);
    return null;
  }
}

/**
 * Valida dados do questionário de forma segura
 * Retorna dados válidos ou default se inválido
 */
export function validateQuestionnaireData(data: unknown): z.infer<typeof questionnaireDataSchema> {
  try {
    return questionnaireDataSchema.parse(data);
  } catch (error) {
    console.warn('⚠️ Questionnaire data validation failed, using defaults:', error);
    return {
      conversation: [],
      extractedData: {},
      completed: false,
    };
  }
}

/**
 * Valida dados específicos por dia pós-operatório
 * Aplica regras de negócio contextual
 */
export function validatePostOpDataByDay(
  data: z.infer<typeof postOpDataSchema>,
  dayNumber: number
): { valid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Bristol Scale só é válida em D+5 e D+10
  if (data.bristolScale !== null && data.bristolScale !== undefined) {
    if (dayNumber !== 5 && dayNumber !== 10) {
      warnings.push(`Bristol Scale coletada em D+${dayNumber}, mas só é esperada em D+5 e D+10`);
    }
  }

  // Pesquisa de satisfação só em D+14
  if (dayNumber !== 14) {
    if (data.painControlSatisfaction !== null && data.painControlSatisfaction !== undefined) {
      warnings.push(`Satisfação com dor coletada em D+${dayNumber}, mas só é esperada em D+14`);
    }
    if (data.aiFollowUpSatisfaction !== null && data.aiFollowUpSatisfaction !== undefined) {
      warnings.push(`Satisfação com IA coletada em D+${dayNumber}, mas só é esperada em D+14`);
    }
    if (data.npsScore !== null && data.npsScore !== undefined) {
      warnings.push(`NPS coletado em D+${dayNumber}, mas só é esperado em D+14`);
    }
  }

  // Secreção purulenta só a partir de D+3
  if (dayNumber < 3) {
    if (data.hasPurulentDischarge !== null && data.hasPurulentDischarge !== undefined) {
      warnings.push(`Secreção purulenta coletada em D+${dayNumber}, mas só é esperada a partir de D+3`);
    }
  }

  // Validações de consistência
  if (data.hasFever === true && !data.feverDetails) {
    warnings.push('Febre informada mas sem detalhes de temperatura');
  }

  if (data.hadBowelMovementSinceLastContact === false && data.painDuringBowelMovement !== null) {
    errors.push('Dor durante evacuação informada mas paciente não evacuou');
  }

  if (data.hadBowelMovementSinceLastContact === false && data.bristolScale !== null) {
    errors.push('Bristol Scale informada mas paciente não evacuou');
  }

  // Alerta para dor alta
  if (data.painAtRest != null && data.painAtRest >= 8) {
    warnings.push(`Dor em repouso alta (${data.painAtRest}/10) - verificar necessidade de intervenção`);
  }

  if (data.painDuringBowelMovement != null && data.painDuringBowelMovement >= 8) {
    warnings.push(`Dor durante evacuação alta (${data.painDuringBowelMovement}/10) - verificar necessidade de intervenção`);
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}
