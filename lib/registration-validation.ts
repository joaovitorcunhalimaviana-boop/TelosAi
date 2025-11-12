/**
 * Contextual Validation System for Patient Registration
 *
 * This module provides intelligent validation that adapts based on whether
 * the patient is a research participant or standard patient.
 */

export interface ValidationContext {
  isResearchParticipant: boolean;
  researchId?: string;
  requiredSections?: string[];
  studyAgeRange?: { min: number; max: number };
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  missingRequired: string[];
  missingRecommended?: string[];
}

export interface FieldValidation {
  error?: string;
  warning?: string;
}

export interface PatientData {
  name?: string;
  phone?: string;
  email?: string;
  cpf?: string;
  dateOfBirth?: string;
  sex?: string;
  surgeryType?: string;
  surgeryDate?: string;
  surgeryDetails?: string;
  comorbidities?: string[];
  medications?: string[];
  allergies?: string[];
  observations?: string;
  [key: string]: any;
}

// Field requirement levels
export type RequirementLevel = 'required' | 'recommended' | 'optional';

export interface FieldRequirement {
  level: RequirementLevel;
  reason: string;
  section: string;
}

/**
 * Get required fields based on validation context
 */
export function getRequiredFields(context: ValidationContext): string[] {
  const baseRequired = ['name', 'phone', 'surgeryType', 'surgeryDate'];

  if (context.isResearchParticipant) {
    return [
      ...baseRequired,
      'dateOfBirth',
      'sex',
      'email',
      'cpf'
    ];
  }

  return baseRequired;
}

/**
 * Get recommended fields (not required but strongly suggested)
 */
export function getRecommendedFields(context: ValidationContext): string[] {
  if (context.isResearchParticipant) {
    return ['surgeryDetails', 'comorbidities', 'medications'];
  }

  return ['email', 'cpf', 'dateOfBirth', 'sex'];
}

/**
 * Get field requirement information
 */
export function getFieldRequirement(
  fieldName: string,
  context: ValidationContext
): FieldRequirement {
  const required = getRequiredFields(context);
  const recommended = getRecommendedFields(context);

  if (required.includes(fieldName)) {
    return {
      level: 'required',
      reason: context.isResearchParticipant
        ? 'Obrigatório para participantes de pesquisa'
        : 'Campo obrigatório',
      section: getFieldSection(fieldName)
    };
  }

  if (recommended.includes(fieldName)) {
    return {
      level: 'recommended',
      reason: context.isResearchParticipant
        ? 'Recomendado para melhor qualidade dos dados da pesquisa'
        : 'Recomendado para melhor acompanhamento',
      section: getFieldSection(fieldName)
    };
  }

  return {
    level: 'optional',
    reason: 'Campo opcional',
    section: getFieldSection(fieldName)
  };
}

/**
 * Get the section a field belongs to
 */
function getFieldSection(fieldName: string): string {
  const sections: Record<string, string> = {
    name: 'Dados Pessoais',
    phone: 'Dados Pessoais',
    email: 'Dados Pessoais',
    cpf: 'Dados Pessoais',
    dateOfBirth: 'Dados Pessoais',
    sex: 'Dados Pessoais',
    surgeryType: 'Dados Cirúrgicos',
    surgeryDate: 'Dados Cirúrgicos',
    surgeryDetails: 'Dados Cirúrgicos',
    comorbidities: 'Histórico Médico',
    medications: 'Histórico Médico',
    allergies: 'Histórico Médico',
    observations: 'Observações'
  };

  return sections[fieldName] || 'Outros';
}

/**
 * Validate a single field
 */
export function validateField(
  fieldName: string,
  value: any,
  context: ValidationContext,
  allData?: PatientData
): FieldValidation {
  const result: FieldValidation = {};
  const requirement = getFieldRequirement(fieldName, context);

  // Check if field is empty
  const isEmpty = value === undefined || value === null || value === '' ||
    (Array.isArray(value) && value.length === 0);

  // Required field validation
  if (requirement.level === 'required' && isEmpty) {
    result.error = 'Este campo é obrigatório';
    return result;
  }

  // Recommended field validation
  if (requirement.level === 'recommended' && isEmpty) {
    result.warning = 'Este campo é recomendado';
  }

  // Skip further validation if field is empty
  if (isEmpty) {
    return result;
  }

  // Field-specific validation
  switch (fieldName) {
    case 'name':
      if (typeof value === 'string' && value.trim().length < 3) {
        result.error = 'Nome deve ter pelo menos 3 caracteres';
      } else if (typeof value === 'string' && !/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
        result.error = 'Nome deve conter apenas letras';
      }
      break;

    case 'phone':
      const phoneDigits = value.replace(/\D/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        result.error = 'Telefone deve ter 10 ou 11 dígitos';
      }
      break;

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        result.error = 'Email inválido';
      }
      break;

    case 'cpf':
      const cpfDigits = value.replace(/\D/g, '');
      if (cpfDigits.length !== 11) {
        result.error = 'CPF deve ter 11 dígitos';
      } else if (!isValidCPF(cpfDigits)) {
        result.error = 'CPF inválido';
      }
      break;

    case 'dateOfBirth':
      if (!isValidDate(value)) {
        result.error = 'Data de nascimento inválida';
      } else {
        const age = calculateAge(value);
        if (age < 0 || age > 150) {
          result.error = 'Data de nascimento inválida';
        } else if (context.isResearchParticipant) {
          const { min = 18, max = 80 } = context.studyAgeRange || {};
          if (age < min || age > max) {
            result.error = `Para participar da pesquisa, a idade deve estar entre ${min} e ${max} anos`;
          } else if (age < 18) {
            result.warning = 'Paciente menor de idade - verificar consentimento';
          }
        }
      }
      break;

    case 'surgeryDate':
      if (!isValidDate(value)) {
        result.error = 'Data da cirurgia inválida';
      } else {
        const surgeryDate = new Date(value);
        const today = new Date();
        const futureLimit = new Date();
        futureLimit.setMonth(futureLimit.getMonth() + 6);

        if (surgeryDate > futureLimit) {
          result.error = 'Data da cirurgia não pode ser superior a 6 meses no futuro';
        }
      }
      break;

    case 'sex':
      if (!['M', 'F', 'Outro'].includes(value)) {
        result.error = 'Sexo inválido';
      }
      break;
  }

  // Cross-field validation
  if (allData && fieldName === 'surgeryDate' && allData.dateOfBirth) {
    const birthDate = new Date(allData.dateOfBirth);
    const surgeryDate = new Date(value);

    if (surgeryDate < birthDate) {
      result.error = 'Data da cirurgia não pode ser anterior à data de nascimento';
    }
  }

  return result;
}

/**
 * Validate all registration data
 */
export function validateRegistrationData(
  data: PatientData,
  context: ValidationContext
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: {},
    warnings: {},
    missingRequired: [],
    missingRecommended: []
  };

  const requiredFields = getRequiredFields(context);
  const recommendedFields = getRecommendedFields(context);

  // Validate all required fields
  for (const fieldName of requiredFields) {
    const value = data[fieldName];
    const validation = validateField(fieldName, value, context, data);

    if (validation.error) {
      result.errors[fieldName] = validation.error;
      result.isValid = false;

      if (!value) {
        result.missingRequired.push(fieldName);
      }
    }

    if (validation.warning) {
      result.warnings[fieldName] = validation.warning;
    }
  }

  // Validate recommended fields (warnings only)
  for (const fieldName of recommendedFields) {
    const value = data[fieldName];
    const validation = validateField(fieldName, value, context, data);

    if (validation.error) {
      result.warnings[fieldName] = validation.error;
    } else if (validation.warning) {
      result.warnings[fieldName] = validation.warning;
    }

    if (!value) {
      result.missingRecommended = result.missingRecommended || [];
      result.missingRecommended.push(fieldName);
    }
  }

  // Validate other fields that have values
  const allFields = Object.keys(data);
  const processedFields = [...requiredFields, ...recommendedFields];

  for (const fieldName of allFields) {
    if (!processedFields.includes(fieldName)) {
      const value = data[fieldName];
      const validation = validateField(fieldName, value, context, data);

      if (validation.error) {
        result.errors[fieldName] = validation.error;
        result.isValid = false;
      }

      if (validation.warning) {
        result.warnings[fieldName] = validation.warning;
      }
    }
  }

  // Research-specific validations
  if (context.isResearchParticipant) {
    // Check for complete medical history
    if (!data.comorbidities || data.comorbidities.length === 0) {
      result.warnings['comorbidities'] =
        'Histórico de comorbidades ajuda na qualidade da pesquisa';
    }

    if (!data.medications || data.medications.length === 0) {
      result.warnings['medications'] =
        'Lista de medicamentos é importante para a pesquisa';
    }

    if (!data.surgeryDetails) {
      result.warnings['surgeryDetails'] =
        'Detalhes da cirurgia são importantes para a pesquisa';
    }
  }

  return result;
}

/**
 * Get validation summary by section
 */
export function getValidationSummary(
  validationResult: ValidationResult,
  context: ValidationContext
): Record<string, { errors: number; warnings: number; missingRequired: string[] }> {
  const summary: Record<string, {
    errors: number;
    warnings: number;
    missingRequired: string[]
  }> = {};

  const allFields = [
    ...Object.keys(validationResult.errors),
    ...Object.keys(validationResult.warnings),
    ...validationResult.missingRequired
  ];

  const uniqueFields = Array.from(new Set(allFields));

  for (const field of uniqueFields) {
    const section = getFieldSection(field);

    if (!summary[section]) {
      summary[section] = { errors: 0, warnings: 0, missingRequired: [] };
    }

    if (validationResult.errors[field]) {
      summary[section].errors++;
    }

    if (validationResult.warnings[field]) {
      summary[section].warnings++;
    }

    if (validationResult.missingRequired.includes(field)) {
      summary[section].missingRequired.push(field);
    }
  }

  return summary;
}

/**
 * Get user-friendly field label
 */
export function getFieldLabel(fieldName: string): string {
  const labels: Record<string, string> = {
    name: 'Nome',
    phone: 'Telefone',
    email: 'Email',
    cpf: 'CPF',
    dateOfBirth: 'Data de Nascimento',
    sex: 'Sexo',
    surgeryType: 'Tipo de Cirurgia',
    surgeryDate: 'Data da Cirurgia',
    surgeryDetails: 'Detalhes da Cirurgia',
    comorbidities: 'Comorbidades',
    medications: 'Medicamentos',
    allergies: 'Alergias',
    observations: 'Observações'
  };

  return labels[fieldName] || fieldName;
}

// Helper functions

function isValidCPF(cpf: string): boolean {
  if (cpf.length !== 11) return false;

  // Check for known invalid CPFs
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;

  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;

  return true;
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

function calculateAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(
  errors: Record<string, string>
): string[] {
  return Object.entries(errors).map(([field, error]) => {
    const label = getFieldLabel(field);
    return `${label}: ${error}`;
  });
}

/**
 * Check if patient meets research criteria
 */
export function meetsResearchCriteria(
  data: PatientData,
  context: ValidationContext
): { meets: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (!context.isResearchParticipant) {
    return { meets: true, reasons: [] };
  }

  // Check age requirements
  if (data.dateOfBirth) {
    const age = calculateAge(data.dateOfBirth);
    const { min = 18, max = 80 } = context.studyAgeRange || {};

    if (age < min) {
      reasons.push(`Idade mínima para pesquisa: ${min} anos`);
    }
    if (age > max) {
      reasons.push(`Idade máxima para pesquisa: ${max} anos`);
    }
  }

  // Check required data completeness
  const requiredFields = getRequiredFields(context);
  const missingFields = requiredFields.filter(field => !data[field]);

  if (missingFields.length > 0) {
    reasons.push(`Campos obrigatórios faltando: ${missingFields.map(getFieldLabel).join(', ')}`);
  }

  return {
    meets: reasons.length === 0,
    reasons
  };
}
