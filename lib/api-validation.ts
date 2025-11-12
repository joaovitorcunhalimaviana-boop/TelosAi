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
