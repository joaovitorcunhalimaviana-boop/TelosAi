/**
 * Research Field Validator
 *
 * Validates that research participants have all required fields completed
 * Shows progress tracking and generates missing field lists
 *
 * Supports configurable required fields per research:
 * - Each research can define its own required fields via the `requiredFields` array
 * - If no custom fields are provided, falls back to DEFAULT_REQUIRED_FIELDS
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
 * Field definition with label for display
 */
export interface FieldDefinition {
  field: string;
  label: string;
}

/**
 * Default required fields for research participants
 * Used when a research doesn't have custom required fields configured
 */
export const DEFAULT_REQUIRED_FIELDS = {
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
 * Backwards compatibility alias
 * @deprecated Use DEFAULT_REQUIRED_FIELDS instead
 */
export const RESEARCH_REQUIRED_FIELDS = DEFAULT_REQUIRED_FIELDS;

/**
 * Mapping of field paths to their labels and categories
 * Used when converting custom required field arrays to full field definitions
 */
export const FIELD_DEFINITIONS: Record<string, { label: string; category: string }> = {
  // Dados Básicos
  'name': { label: 'Nome Completo', category: 'dadosBasicos' },
  'dateOfBirth': { label: 'Data de Nascimento', category: 'dadosBasicos' },
  'age': { label: 'Idade', category: 'dadosBasicos' },
  'sex': { label: 'Sexo', category: 'dadosBasicos' },
  'phone': { label: 'Telefone/WhatsApp', category: 'dadosBasicos' },
  'email': { label: 'Email', category: 'dadosBasicos' },
  'cpf': { label: 'CPF', category: 'dadosBasicos' },
  // Cirurgia
  'surgery.type': { label: 'Tipo de Cirurgia', category: 'cirurgia' },
  'surgery.date': { label: 'Data da Cirurgia', category: 'cirurgia' },
  'surgery.hospital': { label: 'Hospital', category: 'cirurgia' },
  // Comorbidades
  'comorbidities': { label: 'Comorbidades (pelo menos uma ou "Nenhuma")', category: 'comorbidades' },
  // Medicações
  'medications': { label: 'Medicações (pelo menos uma ou "Nenhuma")', category: 'medicacoes' },
  // Detalhes Cirúrgicos
  'details.technique': { label: 'Detalhes da Técnica Cirúrgica', category: 'detalhesCirurgicos' },
  // Pré-Operatório
  'preOp.intestinalPrep': { label: 'Informações de Preparo Intestinal', category: 'preOperatorio' },
  // Anestesia
  'anesthesia.type': { label: 'Tipo de Anestesia', category: 'anestesia' },
  'anesthesia.details': { label: 'Detalhes da Anestesia', category: 'anestesia' },
  // Prescrição
  'postOp.medications': { label: 'Medicações Pós-Operatórias', category: 'prescricao' },
};

/**
 * Get all available field paths that can be configured as required
 */
export function getAvailableRequiredFields(): { field: string; label: string; category: string }[] {
  return Object.entries(FIELD_DEFINITIONS).map(([field, { label, category }]) => ({
    field,
    label,
    category,
  }));
}

/**
 * Convert an array of field paths to categorized field definitions
 */
export function parseCustomRequiredFields(fieldPaths: string[]): Record<string, FieldDefinition[]> {
  const result: Record<string, FieldDefinition[]> = {};

  for (const fieldPath of fieldPaths) {
    const definition = FIELD_DEFINITIONS[fieldPath];
    if (definition) {
      const { category, label } = definition;
      if (!result[category]) {
        result[category] = [];
      }
      result[category].push({ field: fieldPath, label });
    } else {
      // Unknown field - add to a generic category
      if (!result['outros']) {
        result['outros'] = [];
      }
      result['outros'].push({ field: fieldPath, label: fieldPath });
    }
  }

  return result;
}

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
  outros: 'Outros Campos',
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
 *
 * @param patientData - The patient data object to validate
 * @param customRequiredFields - Optional array of field paths (e.g., ["name", "phone", "surgery.type"])
 *                               If provided, uses these instead of the default required fields.
 *                               If empty array, returns 100% complete (no required fields).
 *                               If null/undefined, uses DEFAULT_REQUIRED_FIELDS.
 */
export function validateResearchFields(
  patientData: any,
  customRequiredFields?: string[] | null
): ValidationResult {
  const allRequiredFields: RequiredField[] = [];
  const missingFields: RequiredField[] = [];
  const missingByCategory: Record<string, RequiredField[]> = {};

  // Determine which required fields to use
  let requiredFieldsByCategory: Record<string, FieldDefinition[]>;

  if (customRequiredFields !== undefined && customRequiredFields !== null) {
    // Use custom required fields if provided
    if (customRequiredFields.length === 0) {
      // Empty array means no required fields - everything is complete
      return {
        isComplete: true,
        totalFields: 0,
        completedFields: 0,
        percentComplete: 100,
        missingFields: [],
        missingByCategory: {},
      };
    }
    requiredFieldsByCategory = parseCustomRequiredFields(customRequiredFields);
  } else {
    // Use default required fields for backwards compatibility
    requiredFieldsByCategory = DEFAULT_REQUIRED_FIELDS;
  }

  // Iterate through all categories
  Object.entries(requiredFieldsByCategory).forEach(([category, fields]) => {
    fields.forEach(({ field, label }) => {
      const value = getNestedValue(patientData, field);
      const isFilled = isFieldFilled(value, field);

      const requiredField: RequiredField = {
        category: CATEGORY_LABELS[category] || category,
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
  const percentComplete = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 100;

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
 *
 * @param patientData - The patient data object to validate
 * @param category - The category to check
 * @param customRequiredFields - Optional array of field paths. If provided, only fields
 *                               matching this category will be considered.
 */
export function getCategoryCompletion(
  patientData: any,
  category: keyof typeof DEFAULT_REQUIRED_FIELDS | string,
  customRequiredFields?: string[] | null
): { completed: number; total: number; percentage: number; isCategoryComplete: boolean } {
  let fields: FieldDefinition[];

  if (customRequiredFields !== undefined && customRequiredFields !== null) {
    // Use custom required fields
    const parsedFields = parseCustomRequiredFields(customRequiredFields);
    fields = parsedFields[category] || [];
  } else {
    // Use default required fields
    fields = (DEFAULT_REQUIRED_FIELDS as Record<string, FieldDefinition[]>)[category] || [];
  }

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
 *
 * @param fieldPath - The field path to check (e.g., "name", "surgery.type")
 * @param customRequiredFields - Optional array of field paths. If provided, checks against these.
 */
export function isFieldRequiredForResearch(
  fieldPath: string,
  customRequiredFields?: string[] | null
): boolean {
  if (customRequiredFields !== undefined && customRequiredFields !== null) {
    // Check against custom required fields
    return customRequiredFields.includes(fieldPath);
  }

  // Check against default required fields
  for (const fields of Object.values(DEFAULT_REQUIRED_FIELDS)) {
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
