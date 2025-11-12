# Contextual Validation System Guide

## Overview

The contextual validation system provides intelligent, adaptive validation for patient registration forms. It automatically adjusts validation rules based on whether the patient is a standard patient or research participant.

## Files Created

```
lib/
  registration-validation.ts      # Core validation logic
components/
  FieldRequirementBadge.tsx       # Visual feedback components
  examples/
    ValidatedPatientForm.tsx      # Complete example implementation
```

## Core Concepts

### 1. Validation Context

The validation context determines which rules apply:

```typescript
interface ValidationContext {
  isResearchParticipant: boolean;  // Changes validation requirements
  researchId?: string;              // Optional research study identifier
  requiredSections?: string[];     // Custom required sections
  studyAgeRange?: {                // Age restrictions for research
    min: number;
    max: number;
  };
}
```

### 2. Requirement Levels

Fields have three requirement levels:

- **Required** (red badge): Must be filled, validation errors prevent submission
- **Recommended** (yellow badge): Should be filled, warnings don't prevent submission
- **Optional** (gray badge): Nice to have, no validation

### 3. Validation Results

```typescript
interface ValidationResult {
  isValid: boolean;                // Can the form be submitted?
  errors: Record<string, string>;  // Field errors (prevent submission)
  warnings: Record<string, string>; // Field warnings (allow submission)
  missingRequired: string[];       // List of missing required fields
  missingRecommended?: string[];   // List of missing recommended fields
}
```

## Validation Rules

### Standard Patient

**Required Fields:**
- Name
- Phone
- Surgery Type
- Surgery Date

**Recommended Fields:**
- Email
- CPF
- Date of Birth
- Sex

### Research Participant

**Required Fields:**
- All standard required fields PLUS:
- Date of Birth (for age verification)
- Sex (for research demographics)
- CPF (for unique identification)
- Email (for follow-up communication)

**Recommended Fields:**
- Surgery Details
- Comorbidities
- Medications

**Additional Validations:**
- Age must be within study range (default: 18-80)
- Complete medical history sections
- Cross-field validations (e.g., surgery date after birth date)

## Field-Specific Validations

### Name
```typescript
- Minimum 3 characters
- Letters only (including accented characters)
- Required for all patients
```

### Phone
```typescript
- 10-11 digits
- Valid Brazilian phone format
- Required for all patients
```

### Email
```typescript
- Valid email format (user@domain.com)
- Required for research participants
- Recommended for standard patients
```

### CPF
```typescript
- Exactly 11 digits
- Valid CPF checksum algorithm
- No repeated digits (e.g., 111.111.111-11)
- Required for research participants
```

### Date of Birth
```typescript
- Valid date format
- Age between 0-150
- For research: age must be within study range
- Cross-validation with surgery date
```

### Surgery Date
```typescript
- Valid date format
- Not more than 6 months in future
- Must be after patient's birth date
- Required for all patients
```

## Usage Examples

### Basic Usage

```typescript
import {
  validateRegistrationData,
  validateField,
  type ValidationContext
} from '@/lib/registration-validation';

// Define context
const context: ValidationContext = {
  isResearchParticipant: true,
  studyAgeRange: { min: 18, max: 80 }
};

// Validate entire form
const result = validateRegistrationData(formData, context);

if (result.isValid) {
  // Submit form
  await submitPatient(formData);
} else {
  // Show errors
  console.log('Errors:', result.errors);
  console.log('Missing:', result.missingRequired);
}
```

### Real-time Field Validation

```typescript
import { validateField } from '@/lib/registration-validation';

// Validate on change
const handleFieldChange = (fieldName: string, value: any) => {
  const validation = validateField(fieldName, value, context, formData);

  if (validation.error) {
    setFieldError(fieldName, validation.error);
  } else if (validation.warning) {
    setFieldWarning(fieldName, validation.warning);
  } else {
    clearFieldMessages(fieldName);
  }
};
```

### Visual Feedback Components

```typescript
import { FieldRequirementBadge } from '@/components/FieldRequirementBadge';

// Show requirement badge
<FieldRequirementBadge
  fieldName="email"
  context={context}
  showTooltip={true}
  size="sm"
/>
```

### Validation Messages

```typescript
import { FieldValidationMessage } from '@/components/FieldRequirementBadge';

// Show error/warning messages
<FieldValidationMessage
  error={fieldErrors.email}
  warning={fieldWarnings.email}
/>
```

### Validation Summary

```typescript
import { ValidationSummary } from '@/components/FieldRequirementBadge';

// Show overall validation status
<ValidationSummary
  errors={formatValidationErrors(validation.errors)}
  warnings={Object.values(validation.warnings)}
  missingRequired={validation.missingRequired.map(getFieldLabel)}
  missingRecommended={validation.missingRecommended?.map(getFieldLabel)}
/>
```

### Section Summary

```typescript
import {
  getValidationSummary,
  SectionValidationSummary
} from '@/lib/registration-validation';

// Get summary by section
const summary = getValidationSummary(validation, context);

// Display section status
<SectionValidationSummary
  sectionName="Dados Pessoais"
  errors={summary['Dados Pessoais'].errors}
  warnings={summary['Dados Pessoais'].warnings}
  missingRequired={summary['Dados Pessoais'].missingRequired}
/>
```

### Research Criteria Check

```typescript
import { meetsResearchCriteria } from '@/lib/registration-validation';
import { ResearchCriteriaChecker } from '@/components/FieldRequirementBadge';

// Check if patient meets research criteria
const check = meetsResearchCriteria(formData, context);

// Display result
<ResearchCriteriaChecker
  meets={check.meets}
  reasons={check.reasons}
/>
```

## Helper Functions

### Get Required Fields

```typescript
import { getRequiredFields } from '@/lib/registration-validation';

const required = getRequiredFields(context);
// Returns: ['name', 'phone', 'surgeryType', 'surgeryDate', ...]
```

### Get Recommended Fields

```typescript
import { getRecommendedFields } from '@/lib/registration-validation';

const recommended = getRecommendedFields(context);
// Returns: ['email', 'cpf', 'surgeryDetails', ...]
```

### Get Field Requirement

```typescript
import { getFieldRequirement } from '@/lib/registration-validation';

const req = getFieldRequirement('email', context);
// Returns: { level: 'required', reason: '...', section: 'Dados Pessoais' }
```

### Format Errors for Display

```typescript
import { formatValidationErrors } from '@/lib/registration-validation';

const errorMessages = formatValidationErrors(validation.errors);
// Returns: ['Nome: Campo obrigatório', 'Email: Email inválido', ...]
```

### Get Field Label

```typescript
import { getFieldLabel } from '@/lib/registration-validation';

const label = getFieldLabel('dateOfBirth');
// Returns: 'Data de Nascimento'
```

## Advanced Features

### Cross-Field Validation

The system automatically validates relationships between fields:

```typescript
// Surgery date must be after birth date
if (surgeryDate < birthDate) {
  error: 'Data da cirurgia não pode ser anterior à data de nascimento'
}

// Age calculation based on birth date
if (age < studyAgeRange.min || age > studyAgeRange.max) {
  error: 'Idade fora do intervalo permitido para a pesquisa'
}
```

### Touched Fields Pattern

Only show errors after user has interacted with a field:

```typescript
const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

const handleFieldBlur = (fieldName: string) => {
  setTouchedFields(prev => new Set(prev).add(fieldName));
};

const shouldShowError = (fieldName: string) => {
  return (showAllErrors || touchedFields.has(fieldName)) &&
         fieldErrors[fieldName];
};
```

### Show All Errors on Submit

```typescript
const [showAllErrors, setShowAllErrors] = useState(false);

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setShowAllErrors(true); // Now all errors will be visible

  if (validation.isValid) {
    submitForm();
  } else {
    // Scroll to first error
    scrollToFirstError();
  }
};
```

### Draft Mode

Allow standard patients to save incomplete forms:

```typescript
<Button
  type="submit"
  disabled={!validation.isValid && isResearchParticipant}
>
  {validation.isValid ? 'Cadastrar' : 'Salvar Rascunho'}
</Button>
```

## Styling Guide

### Requirement Badge Colors

```typescript
Required:     red-100/red-700   (errors prevent submission)
Recommended:  amber-100/amber-700 (warnings, can still submit)
Optional:     gray-100/gray-600  (no validation)
```

### Validation Message Colors

```typescript
Error:   red-600   with AlertCircle icon
Warning: amber-600 with Info icon
Success: green-600 with CheckCircle icon
```

### Dark Mode Support

All components include full dark mode support using Tailwind's `dark:` variants.

## Integration with Forms

### React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { validateField } from '@/lib/registration-validation';

const form = useForm({
  mode: 'onChange',
  resolver: async (data) => {
    const result = validateRegistrationData(data, context);

    if (result.isValid) {
      return { values: data, errors: {} };
    }

    return {
      values: {},
      errors: Object.entries(result.errors).reduce((acc, [key, message]) => ({
        ...acc,
        [key]: { type: 'validation', message }
      }), {})
    };
  }
});
```

### Formik

```typescript
import { Formik } from 'formik';
import { validateRegistrationData } from '@/lib/registration-validation';

<Formik
  initialValues={initialData}
  validate={(values) => {
    const result = validateRegistrationData(values, context);
    return result.errors;
  }}
  onSubmit={handleSubmit}
>
  {/* Form content */}
</Formik>
```

## Testing

### Test Validation Logic

```typescript
import { validateField, validateRegistrationData } from '@/lib/registration-validation';

describe('Validation System', () => {
  it('should require email for research participants', () => {
    const context = { isResearchParticipant: true };
    const data = { name: 'John', phone: '1234567890' };

    const result = validateRegistrationData(data, context);

    expect(result.isValid).toBe(false);
    expect(result.missingRequired).toContain('email');
  });

  it('should validate CPF format', () => {
    const context = { isResearchParticipant: true };
    const validation = validateField('cpf', '123.456.789-00', context);

    expect(validation.error).toBeTruthy();
  });

  it('should check age range for research', () => {
    const context = {
      isResearchParticipant: true,
      studyAgeRange: { min: 18, max: 65 }
    };

    const validation = validateField(
      'dateOfBirth',
      '2010-01-01', // 14 years old
      context
    );

    expect(validation.error).toContain('idade');
  });
});
```

## Best Practices

### 1. Progressive Disclosure

Show validation messages only when relevant:
- After user touches a field
- On form submission attempt
- During real-time validation for critical fields

### 2. Clear Error Messages

Use descriptive, actionable error messages:
- ❌ "Invalid input"
- ✅ "Email deve conter @ e um domínio válido"

### 3. Explain Requirements

Always explain WHY a field is required:
- "Obrigatório para participantes de pesquisa"
- "Necessário para acompanhamento pós-operatório"

### 4. Visual Hierarchy

```
Errors (red) > Warnings (yellow) > Success (green) > Info (blue)
```

### 5. Accessibility

- Use semantic HTML
- Include ARIA labels
- Ensure keyboard navigation
- Provide screen reader text

### 6. Performance

- Debounce real-time validation
- Validate only changed fields
- Use React.memo for badge components

## Common Patterns

### Pattern 1: Two-Step Validation

```typescript
// Step 1: Client-side validation
const clientResult = validateRegistrationData(data, context);

if (!clientResult.isValid) {
  showErrors(clientResult.errors);
  return;
}

// Step 2: Server-side validation
const serverResult = await validateOnServer(data);

if (!serverResult.isValid) {
  showErrors(serverResult.errors);
  return;
}

// Submit
await submitForm(data);
```

### Pattern 2: Wizard with Section Validation

```typescript
const sections = ['personal', 'surgery', 'medical'];
const [currentSection, setCurrentSection] = useState(0);

const canProceed = () => {
  const sectionFields = getSectionFields(sections[currentSection]);
  const sectionData = pick(formData, sectionFields);
  const result = validateRegistrationData(sectionData, context);

  return result.isValid;
};

<Button
  onClick={() => setCurrentSection(prev => prev + 1)}
  disabled={!canProceed()}
>
  Próximo
</Button>
```

### Pattern 3: Conditional Requirements

```typescript
// Add conditional requirements based on other fields
const context: ValidationContext = {
  isResearchParticipant: formData.participateInStudy === 'yes',
  studyAgeRange: getAgeRangeForStudy(formData.studyType)
};
```

## Troubleshooting

### Issue: Validation Not Updating

**Problem:** Validation doesn't update when form data changes.

**Solution:** Ensure ValidationContext is stable:

```typescript
// ❌ Bad - creates new object every render
const context = { isResearchParticipant: true };

// ✅ Good - stable reference
const [context] = useState({ isResearchParticipant: true });
```

### Issue: Too Many Validation Calls

**Problem:** Validation runs on every keystroke causing performance issues.

**Solution:** Debounce validation:

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedValidate = useDebouncedCallback(
  (fieldName, value) => {
    const validation = validateField(fieldName, value, context);
    setFieldError(validation.error);
  },
  300
);
```

### Issue: Errors Not Showing

**Problem:** Field errors not visible to user.

**Solution:** Check touched field logic:

```typescript
// Ensure field is marked as touched
const shouldShowError = (field: string) => {
  return (showAllErrors || touchedFields.has(field)) && fieldErrors[field];
};
```

## Migration Guide

### From Manual Validation

Before:
```typescript
const errors = {};
if (!formData.name) errors.name = 'Nome obrigatório';
if (!formData.phone) errors.phone = 'Telefone obrigatório';
// ... many more manual checks
```

After:
```typescript
const result = validateRegistrationData(formData, context);
const errors = result.errors;
```

### From Simple Required Fields

Before:
```typescript
const requiredFields = ['name', 'phone', 'email'];
```

After:
```typescript
const requiredFields = getRequiredFields(context);
// Automatically adapts based on context
```

## Future Enhancements

- [ ] Custom validation rules per research study
- [ ] Async validation (check uniqueness, verify CPF in database)
- [ ] Validation rule templates
- [ ] Internationalization support
- [ ] Validation analytics (most common errors)
- [ ] AI-powered suggestions for fixing errors

## Related Documentation

- Component Library: `components/ui/`
- Form Hooks: `hooks/useForm.ts`
- API Integration: `app/api/patients/`
- Research Studies: `SPRINT_4_RESUMO_FINAL.md`

## Support

For questions or issues with the validation system:
1. Check this guide first
2. Review the example implementation
3. Check TypeScript types for API details
4. Test in isolation with simple cases
