/**
 * Research Field Validator
 *
 * Validates that research participants have all required fields completed
 * Shows progress tracking and generates missing field lists
 */

export interface RequiredField {
  category: string;
  field: string;
  label: string;
  value: any;
  isFilled: boolean;
}

export interface ValidationResult {
  isComplete: boolean;
  totalFields: number;
  completedFields: number;
  percentComplete: number;
  missingFields: RequiredField[];
  missingByCategory: Record<string, RequiredField[]>;
}

/**
 * Required fields for research participants
 */
export const RESEARCH_REQUIRED_FIELDS = {
  dadosBasicos: [
    { field: 'name', label: 'Nome Completo' },
    { field: 'dateOfBirth', label: 'Data de Nascimento' },
    { field: 'age', label: 'Idade' },
    { field: 'sex', label: 'Sexo' },
    { field: 'phone', label: 'Telefone/WhatsApp' },
    { field: 'email', label: 'Email' },
    { field: 'cpf', label: 'CPF' },
  ],
  cirurgia: [
    { field: 'surgery.type', label: 'Tipo de Cirurgia' },
    { field: 'surgery.date', label: 'Data da Cirurgia' },
    { field: 'surgery.hospital', label: 'Hospital' },
  ],
  comorbidades: [
    { field: 'comorbidities', label: 'Comorbidades (pelo menos uma ou "Nenhuma")' },
  ],
  medicacoes: [
    { field: 'medications', label: 'Medicações (pelo menos uma ou "Nenhuma")' },
  ],
  detalhesCirurgicos: [
    { field: 'details.technique', label: 'Detalhes da Técnica Cirúrgica' },
  ],
  preOperatorio: [
    { field: 'preOp.intestinalPrep', label: 'Informações de Preparo Intestinal' },
  ],
  anestesia: [
    { field: 'anesthesia.type', label: 'Tipo de Anestesia' },
    { field: 'anesthesia.details', label: 'Detalhes da Anestesia' },
  ],
  prescricao: [
    { field: 'postOp.medications', label: 'Medicações Pós-Operatórias' },
  ],
};

/**
 * Category labels for display
 */
export const CATEGORY_LABELS: Record<string, string> = {
  dadosBasicos: 'Dados Básicos',
  cirurgia: 'Cirurgia',
  comorbidades: 'Comorbidades',
  medicacoes: 'Medicações',
  detalhesCirurgicos: 'Detalhes Cirúrgicos',
  preOperatorio: 'Pré-Operatório',
  anestesia: 'Anestesia',
  prescricao: 'Prescrição Pós-Operatória',
};

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Check if a field value is considered "filled"
 */
function isFieldFilled(value: any, field: string): boolean {
  // Handle null/undefined
  if (value === null || value === undefined) return false;

  // Handle strings
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  // Handle numbers
  if (typeof value === 'number') {
    return true; // Any number including 0 is valid
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return true; // Both true and false are valid values
  }

  // Handle arrays (comorbidades, medicacoes)
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  // Handle objects
  if (typeof value === 'object') {
    return Object.keys(value).length > 0;
  }

  return false;
}

/**
 * Validate patient data for research requirements
 */
export function validateResearchFields(patientData: any): ValidationResult {
  const allRequiredFields: RequiredField[] = [];
  const missingFields: RequiredField[] = [];
  const missingByCategory: Record<string, RequiredField[]> = {};

  // Iterate through all categories
  Object.entries(RESEARCH_REQUIRED_FIELDS).forEach(([category, fields]) => {
    fields.forEach(({ field, label }) => {
      const value = getNestedValue(patientData, field);
      const isFilled = isFieldFilled(value, field);

      const requiredField: RequiredField = {
        category: CATEGORY_LABELS[category],
        field,
        label,
        value,
        isFilled,
      };

      allRequiredFields.push(requiredField);

      if (!isFilled) {
        missingFields.push(requiredField);

        if (!missingByCategory[category]) {
          missingByCategory[category] = [];
        }
        missingByCategory[category].push(requiredField);
      }
    });
  });

  const completedFields = allRequiredFields.filter(f => f.isFilled).length;
  const totalFields = allRequiredFields.length;
  const percentComplete = Math.round((completedFields / totalFields) * 100);

  return {
    isComplete: missingFields.length === 0,
    totalFields,
    completedFields,
    percentComplete,
    missingFields,
    missingByCategory,
  };
}

/**
 * Get missing fields summary text
 */
export function getMissingFieldsSummary(validation: ValidationResult): string {
  if (validation.isComplete) {
    return 'Todos os campos obrigatórios estão completos!';
  }

  const categories = Object.keys(validation.missingByCategory);
  if (categories.length === 0) return '';

  const summaries = categories.map(category => {
    const fields = validation.missingByCategory[category];
    return `${CATEGORY_LABELS[category]}: ${fields.length} campo${fields.length > 1 ? 's' : ''}`;
  });

  return `Faltam ${validation.missingFields.length} campos: ${summaries.join(', ')}`;
}

/**
 * Get category completion status
 */
export function getCategoryCompletion(
  patientData: any,
  category: keyof typeof RESEARCH_REQUIRED_FIELDS
): { completed: number; total: number; percentage: number; isCategoryComplete: boolean } {
  const fields = RESEARCH_REQUIRED_FIELDS[category] || [];

  let completed = 0;
  fields.forEach(({ field }) => {
    const value = getNestedValue(patientData, field);
    if (isFieldFilled(value, field)) {
      completed++;
    }
  });

  const total = fields.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 100;
  const isCategoryComplete = completed === total;

  return { completed, total, percentage, isCategoryComplete };
}

/**
 * Check if a specific field is required for research
 */
export function isFieldRequiredForResearch(fieldPath: string): boolean {
  for (const fields of Object.values(RESEARCH_REQUIRED_FIELDS)) {
    if (fields.some(f => f.field === fieldPath)) {
      return true;
    }
  }
  return false;
}

/**
 * Get first missing field ID for auto-scroll
 */
export function getFirstMissingFieldId(validation: ValidationResult): string | null {
  if (validation.missingFields.length === 0) return null;

  // Convert field path to DOM ID (e.g., "surgery.type" -> "surgery-type")
  const firstMissingField = validation.missingFields[0];
  return firstMissingField.field.replace(/\./g, '-');
}
