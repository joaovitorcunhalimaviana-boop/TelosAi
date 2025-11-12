# Validation System - Quick Reference

## 🚀 Quick Start

```typescript
import {
  validateRegistrationData,
  validateField,
  getRequiredFields,
  type ValidationContext
} from '@/lib/registration-validation';

import {
  FieldRequirementBadge,
  ValidationSummary,
  FieldValidationMessage
} from '@/components/FieldRequirementBadge';
```

## 📋 Common Use Cases

### 1. Validate Entire Form

```typescript
const context: ValidationContext = {
  isResearchParticipant: true,
  studyAgeRange: { min: 18, max: 80 }
};

const result = validateRegistrationData(formData, context);

if (result.isValid) {
  submitForm();
} else {
  showErrors(result.errors);
}
```

### 2. Validate Single Field (Real-time)

```typescript
const validation = validateField('email', email, context, formData);

if (validation.error) {
  setError(validation.error);
} else if (validation.warning) {
  setWarning(validation.warning);
}
```

### 3. Show Requirement Badge

```typescript
<Label>
  Email
  <FieldRequirementBadge fieldName="email" context={context} />
</Label>
```

### 4. Show Validation Message

```typescript
<Input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className={error ? 'border-red-500' : ''}
/>
<FieldValidationMessage error={error} warning={warning} />
```

### 5. Show Overall Summary

```typescript
<ValidationSummary
  errors={formatValidationErrors(result.errors)}
  missingRequired={result.missingRequired.map(getFieldLabel)}
  missingRecommended={result.missingRecommended?.map(getFieldLabel)}
/>
```

## 🎯 Validation Rules Cheat Sheet

| Field | Standard | Research | Validation |
|-------|----------|----------|------------|
| name | Required | Required | 3+ chars, letters only |
| phone | Required | Required | 10-11 digits |
| email | Recommended | Required | Valid email format |
| cpf | Recommended | Required | 11 digits + checksum |
| dateOfBirth | Recommended | Required | Valid date + age check |
| sex | Recommended | Required | M/F/Outro |
| surgeryType | Required | Required | Non-empty |
| surgeryDate | Required | Required | Valid date, max 6mo future |
| surgeryDetails | Optional | Recommended | Any text |
| comorbidities | Optional | Recommended | Array |

## 🎨 Badge Types

```typescript
// Red - Required
<FieldRequirementBadge fieldName="name" context={context} />
// Shows: 🔴 Obrigatório

// Yellow - Recommended
<FieldRequirementBadge fieldName="email" context={context} />
// Shows: 🟡 Recomendado

// Gray - Optional
<FieldRequirementBadge fieldName="observations" context={context} />
// Shows: ⚪ Opcional
```

## 🔧 Helper Functions

```typescript
// Get list of required fields
const required = getRequiredFields(context);

// Get list of recommended fields
const recommended = getRecommendedFields(context);

// Get field requirement info
const req = getFieldRequirement('email', context);
// { level: 'required', reason: '...', section: '...' }

// Format errors for display
const messages = formatValidationErrors(errors);

// Get user-friendly label
const label = getFieldLabel('dateOfBirth'); // 'Data de Nascimento'

// Get validation by section
const summary = getValidationSummary(result, context);

// Check research eligibility
const check = meetsResearchCriteria(data, context);
```

## 🎭 Context Presets

```typescript
// Standard patient
const standardContext: ValidationContext = {
  isResearchParticipant: false
};

// Research participant
const researchContext: ValidationContext = {
  isResearchParticipant: true,
  researchId: 'STUDY-001',
  studyAgeRange: { min: 18, max: 80 }
};

// Pediatric research
const pediatricContext: ValidationContext = {
  isResearchParticipant: true,
  studyAgeRange: { min: 0, max: 18 }
};
```

## 🧪 Field Validation Examples

### CPF Validation
```typescript
validateField('cpf', '123.456.789-00', context);
// error: 'CPF inválido'

validateField('cpf', '529.982.247-25', context);
// no error (valid CPF)
```

### Age Validation
```typescript
const context = {
  isResearchParticipant: true,
  studyAgeRange: { min: 18, max: 65 }
};

validateField('dateOfBirth', '2010-01-01', context);
// error: 'Para participar da pesquisa, a idade deve estar entre 18 e 65 anos'

validateField('dateOfBirth', '1990-01-01', context);
// no error (age 34)
```

### Phone Validation
```typescript
validateField('phone', '11999887766', context);
// no error (11 digits)

validateField('phone', '11 99988-7766', context);
// no error (formatting ignored, 11 digits)

validateField('phone', '123', context);
// error: 'Telefone deve ter 10 ou 11 dígitos'
```

### Email Validation
```typescript
validateField('email', 'user@example.com', context);
// no error

validateField('email', 'invalid-email', context);
// error: 'Email inválido'
```

## 🎬 Complete Form Example

```typescript
function PatientForm() {
  const [data, setData] = useState<PatientData>({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(new Set());

  const context: ValidationContext = {
    isResearchParticipant: true,
    studyAgeRange: { min: 18, max: 80 }
  };

  const handleChange = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));

    const validation = validateField(field, value, context, {
      ...data,
      [field]: value
    });

    setErrors(prev => ({
      ...prev,
      [field]: validation.error || ''
    }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => new Set(prev).add(field));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = validateRegistrationData(data, context);

    if (result.isValid) {
      submitForm(data);
    } else {
      setErrors(result.errors);
      setTouched(new Set(Object.keys(result.errors)));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Label>
          Nome
          <FieldRequirementBadge fieldName="name" context={context} />
        </Label>
        <Input
          value={data.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          className={errors.name && touched.has('name') ? 'border-red-500' : ''}
        />
        {touched.has('name') && (
          <FieldValidationMessage error={errors.name} />
        )}
      </div>

      <ValidationSummary
        errors={formatValidationErrors(errors)}
        missingRequired={Object.keys(errors)}
      />

      <Button type="submit">Cadastrar</Button>
    </form>
  );
}
```

## 🎪 Advanced Patterns

### Pattern: Touched Fields
```typescript
const [touched, setTouched] = useState<Set<string>>(new Set());

const shouldShowError = (field: string) => {
  return touched.has(field) && errors[field];
};

<Input onBlur={() => setTouched(prev => new Set(prev).add(field))} />
{shouldShowError(field) && <FieldValidationMessage error={errors[field]} />}
```

### Pattern: Show All Errors on Submit
```typescript
const [showAll, setShowAll] = useState(false);

const handleSubmit = () => {
  setShowAll(true);
  // Now all errors will be visible
};

const shouldShowError = (field: string) => {
  return (showAll || touched.has(field)) && errors[field];
};
```

### Pattern: Section Validation
```typescript
const sections = {
  personal: ['name', 'phone', 'email', 'cpf'],
  surgery: ['surgeryType', 'surgeryDate'],
  medical: ['comorbidities', 'medications']
};

function isSectionValid(section: string): boolean {
  const fields = sections[section];
  return fields.every(field => !errors[field]);
}

<Button disabled={!isSectionValid('personal')}>
  Próximo
</Button>
```

### Pattern: Progressive Enhancement
```typescript
// Start with basic validation
const basicContext = { isResearchParticipant: false };

// Upgrade to research validation when user opts in
const [context, setContext] = useState(basicContext);

const handleOptIn = () => {
  setContext({
    isResearchParticipant: true,
    studyAgeRange: { min: 18, max: 80 }
  });
};
```

## 🐛 Common Mistakes

### ❌ Creating New Context Every Render
```typescript
// Bad - causes infinite re-renders
const context = { isResearchParticipant: true };

// Good - stable reference
const [context] = useState({ isResearchParticipant: true });
```

### ❌ Not Passing Full Form Data
```typescript
// Bad - cross-field validation won't work
validateField('surgeryDate', date, context);

// Good - enables cross-field validation
validateField('surgeryDate', date, context, formData);
```

### ❌ Showing Errors Immediately
```typescript
// Bad - errors show before user touches field
{errors.name && <FieldValidationMessage error={errors.name} />}

// Good - only show after interaction
{touched.has('name') && errors.name && <FieldValidationMessage error={errors.name} />}
```

## 📊 Validation Flow

```
User Input
    ↓
handleChange()
    ↓
validateField() ← Real-time validation
    ↓
Update errors state
    ↓
Show validation message (if touched)
    ↓
[User clicks Submit]
    ↓
validateRegistrationData() ← Full form validation
    ↓
result.isValid?
    ├─ Yes → Submit form
    └─ No → Show all errors
```

## 🎯 Testing Checklist

- [ ] Required fields show red badges
- [ ] Recommended fields show yellow badges
- [ ] Optional fields show gray badges
- [ ] Errors prevent submission (research mode)
- [ ] Warnings don't prevent submission
- [ ] Real-time validation updates on input
- [ ] Errors only show after field is touched
- [ ] All errors show after submit attempt
- [ ] CPF validation works correctly
- [ ] Age range validation for research
- [ ] Cross-field validation (surgery date vs birth date)
- [ ] Dark mode colors are readable
- [ ] Tooltips explain why fields are required
- [ ] Section summaries show correct counts

## 🔗 Files Reference

```
lib/registration-validation.ts          Core validation logic
components/FieldRequirementBadge.tsx    Visual feedback
components/examples/ValidatedPatientForm.tsx    Full example
VALIDATION_SYSTEM_GUIDE.md             Complete documentation
```

## 💡 Tips

1. **Always provide context** - Validation behavior changes based on context
2. **Use touched fields** - Don't show errors before user interaction
3. **Validate on blur** - Good balance between feedback and annoyance
4. **Show summary at bottom** - Help users see all issues at once
5. **Explain requirements** - Use tooltips to explain WHY fields are required
6. **Test with real CPFs** - Use valid CPF generator for testing
7. **Consider mobile** - Badges should be readable on small screens
8. **Accessibility matters** - Use semantic HTML and ARIA labels

## 🎨 Color Reference

```typescript
Required:    bg-red-100   text-red-700   border-red-200
Recommended: bg-amber-100 text-amber-700 border-amber-200
Optional:    bg-gray-100  text-gray-600  border-gray-200

Dark Mode:
Required:    bg-red-950   text-red-300   border-red-800
Recommended: bg-amber-950 text-amber-300 border-amber-800
Optional:    bg-gray-800  text-gray-400  border-gray-700
```
