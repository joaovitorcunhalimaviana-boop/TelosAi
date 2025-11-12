# Validation System Integration Examples

This document provides practical examples of integrating the contextual validation system into your patient registration flows.

## Table of Contents
1. [Basic Integration](#basic-integration)
2. [With Existing Forms](#with-existing-forms)
3. [Multi-step Wizard](#multi-step-wizard)
4. [With Server Actions](#with-server-actions)
5. [Research Study Registration](#research-study-registration)
6. [Mobile-Optimized Forms](#mobile-optimized-forms)

---

## Basic Integration

### Simple Registration Form

```typescript
'use client';

import { useState } from 'react';
import {
  validateRegistrationData,
  validateField,
  type ValidationContext,
  type PatientData
} from '@/lib/registration-validation';
import { FieldRequirementBadge, FieldValidationMessage } from '@/components/FieldRequirementBadge';

export function SimpleRegistrationForm() {
  const [formData, setFormData] = useState<PatientData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const context: ValidationContext = {
    isResearchParticipant: false
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (touched.has(field)) {
      const validation = validateField(field, value, context, { ...formData, [field]: value });
      setErrors(prev => ({ ...prev, [field]: validation.error || '' }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => new Set(prev).add(field));

    const validation = validateField(field, formData[field], context, formData);
    setErrors(prev => ({ ...prev, [field]: validation.error || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = validateRegistrationData(formData, context);

    if (result.isValid) {
      // Submit to server
      await fetch('/api/patients', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
    } else {
      setErrors(result.errors);
      setTouched(new Set(Object.keys(result.errors)));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>
          Nome Completo
          <FieldRequirementBadge fieldName="name" context={context} />
        </Label>
        <Input
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          className={touched.has('name') && errors.name ? 'border-red-500' : ''}
        />
        {touched.has('name') && <FieldValidationMessage error={errors.name} />}
      </div>

      <Button type="submit">Cadastrar</Button>
    </form>
  );
}
```

---

## With Existing Forms

### Retrofitting Existing Form

If you have an existing form, here's how to add validation:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { validateRegistrationData } from '@/lib/registration-validation';

export function ExistingPatientForm({ initialData, onSave }) {
  // Your existing state
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');

  // Add validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  // Define context
  const context = {
    isResearchParticipant: initialData?.isResearchParticipant || false
  };

  // Validate on change
  useEffect(() => {
    const formData = { name, phone, email };
    const result = validateRegistrationData(formData, context);

    setValidationErrors(result.errors);
    setIsValid(result.isValid);
  }, [name, phone, email]);

  // Your existing submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Add validation check
    if (!isValid) {
      alert('Por favor, corrija os erros no formulário');
      return;
    }

    // Your existing save logic
    await onSave({ name, phone, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your existing form fields */}
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {validationErrors.name && (
        <span className="text-red-500">{validationErrors.name}</span>
      )}

      {/* ... rest of your form */}
    </form>
  );
}
```

---

## Multi-step Wizard

### Registration Wizard with Section Validation

```typescript
'use client';

import { useState } from 'react';
import {
  validateRegistrationData,
  getValidationSummary,
  type ValidationContext,
  type PatientData
} from '@/lib/registration-validation';
import { ValidationSummary, SectionValidationSummary } from '@/components/FieldRequirementBadge';

const SECTIONS = {
  personal: {
    title: 'Dados Pessoais',
    fields: ['name', 'phone', 'email', 'cpf', 'dateOfBirth', 'sex']
  },
  surgery: {
    title: 'Dados Cirúrgicos',
    fields: ['surgeryType', 'surgeryDate', 'surgeryDetails']
  },
  medical: {
    title: 'Histórico Médico',
    fields: ['comorbidities', 'medications', 'allergies']
  }
};

export function RegistrationWizard({ isResearchParticipant = false }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PatientData>({});

  const context: ValidationContext = {
    isResearchParticipant,
    studyAgeRange: { min: 18, max: 80 }
  };

  const sectionNames = Object.keys(SECTIONS);
  const currentSection = SECTIONS[sectionNames[currentStep]];

  // Validate current section
  const validateCurrentSection = (): boolean => {
    const sectionFields = currentSection.fields;
    const sectionData = sectionFields.reduce((acc, field) => ({
      ...acc,
      [field]: formData[field]
    }), {});

    const result = validateRegistrationData(sectionData, context);
    return result.isValid;
  };

  const handleNext = () => {
    if (validateCurrentSection()) {
      setCurrentStep(prev => Math.min(prev + 1, sectionNames.length - 1));
    } else {
      alert('Por favor, preencha todos os campos obrigatórios da seção atual');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    const result = validateRegistrationData(formData, context);

    if (result.isValid) {
      await fetch('/api/patients', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
    }
  };

  // Get validation summary
  const validation = validateRegistrationData(formData, context);
  const summary = getValidationSummary(validation, context);

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        {sectionNames.map((section, index) => (
          <div
            key={section}
            className={`flex-1 text-center ${
              index === currentStep ? 'font-bold' : ''
            }`}
          >
            <div className={`
              w-8 h-8 mx-auto rounded-full flex items-center justify-center
              ${index < currentStep ? 'bg-green-500' :
                index === currentStep ? 'bg-blue-500' : 'bg-gray-300'}
            `}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <div className="text-sm mt-2">{SECTIONS[section].title}</div>
            {summary[SECTIONS[section].title] && (
              <SectionValidationSummary
                sectionName={SECTIONS[section].title}
                {...summary[SECTIONS[section].title]}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Section Form */}
      <Card>
        <CardHeader>
          <CardTitle>{currentSection.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Render fields for current section */}
          {currentSection.fields.map(field => (
            <FormField
              key={field}
              name={field}
              value={formData[field]}
              onChange={(value) => setFormData(prev => ({ ...prev, [field]: value }))}
              context={context}
            />
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          variant="outline"
        >
          Anterior
        </Button>

        {currentStep === sectionNames.length - 1 ? (
          <Button onClick={handleSubmit} disabled={!validation.isValid}>
            Finalizar Cadastro
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Próximo
          </Button>
        )}
      </div>

      {/* Overall Summary */}
      <ValidationSummary
        errors={formatValidationErrors(validation.errors)}
        missingRequired={validation.missingRequired.map(getFieldLabel)}
        missingRecommended={validation.missingRecommended?.map(getFieldLabel)}
      />
    </div>
  );
}
```

---

## With Server Actions

### Server-Side Validation

```typescript
// app/actions/patient-actions.ts
'use server';

import { validateRegistrationData } from '@/lib/registration-validation';
import { prisma } from '@/lib/prisma';

export async function createPatient(data: PatientData, isResearchParticipant: boolean) {
  // Always validate on server too!
  const context = {
    isResearchParticipant,
    studyAgeRange: { min: 18, max: 80 }
  };

  const result = validateRegistrationData(data, context);

  if (!result.isValid) {
    return {
      success: false,
      errors: result.errors,
      message: 'Dados inválidos'
    };
  }

  // Additional server-side checks
  const existingPatient = await prisma.patient.findFirst({
    where: { cpf: data.cpf }
  });

  if (existingPatient) {
    return {
      success: false,
      errors: { cpf: 'CPF já cadastrado' },
      message: 'Paciente já existe'
    };
  }

  // Save to database
  const patient = await prisma.patient.create({
    data: {
      ...data,
      isResearchParticipant
    }
  });

  return {
    success: true,
    patientId: patient.id,
    message: 'Paciente cadastrado com sucesso'
  };
}
```

### Client Component Using Server Action

```typescript
'use client';

import { useState, useTransition } from 'react';
import { createPatient } from '@/app/actions/patient-actions';
import { validateRegistrationData } from '@/lib/registration-validation';

export function ServerActionForm() {
  const [formData, setFormData] = useState<PatientData>({});
  const [isPending, startTransition] = useTransition();
  const [serverErrors, setServerErrors] = useState({});

  const context = {
    isResearchParticipant: false
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation first
    const clientResult = validateRegistrationData(formData, context);
    if (!clientResult.isValid) {
      alert('Por favor, corrija os erros no formulário');
      return;
    }

    // Server action
    startTransition(async () => {
      const result = await createPatient(formData, false);

      if (!result.success) {
        setServerErrors(result.errors || {});
        alert(result.message);
      } else {
        alert('Paciente cadastrado com sucesso!');
        // Redirect or reset form
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Cadastrar'}
      </Button>

      {/* Show server errors */}
      {Object.keys(serverErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Erros do servidor</AlertTitle>
          <AlertDescription>
            {Object.entries(serverErrors).map(([field, error]) => (
              <div key={field}>{field}: {error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
```

---

## Research Study Registration

### Research Participant Consent Flow

```typescript
'use client';

import { useState } from 'react';
import {
  validateRegistrationData,
  meetsResearchCriteria,
  type ValidationContext
} from '@/lib/registration-validation';
import { ResearchCriteriaChecker } from '@/components/FieldRequirementBadge';

export function ResearchConsentFlow({ studyId }: { studyId: string }) {
  const [hasConsented, setHasConsented] = useState(false);
  const [formData, setFormData] = useState<PatientData>({});

  const context: ValidationContext = {
    isResearchParticipant: hasConsented,
    researchId: studyId,
    studyAgeRange: { min: 18, max: 65 }
  };

  // Check eligibility
  const eligibility = meetsResearchCriteria(formData, context);

  const handleConsentToggle = () => {
    if (!hasConsented) {
      // Show consent dialog
      const confirmed = confirm(
        'Ao participar da pesquisa, você aceita compartilhar seus dados para fins científicos. ' +
        'Campos adicionais serão obrigatórios. Deseja continuar?'
      );
      setHasConsented(confirmed);
    } else {
      setHasConsented(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Consent Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Participação em Pesquisa</CardTitle>
          <CardDescription>
            Esta cirurgia faz parte de um estudo científico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="research-consent"
              checked={hasConsented}
              onCheckedChange={handleConsentToggle}
            />
            <Label htmlFor="research-consent">
              Concordo em participar da pesquisa "{studyId}"
            </Label>
          </div>

          {hasConsented && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Como participante de pesquisa, campos adicionais são obrigatórios
                para garantir a qualidade dos dados coletados.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Form */}
      <PatientRegistrationForm
        formData={formData}
        onChange={setFormData}
        context={context}
      />

      {/* Eligibility Check */}
      {hasConsented && formData.dateOfBirth && (
        <ResearchCriteriaChecker
          meets={eligibility.meets}
          reasons={eligibility.reasons}
        />
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={hasConsented && !eligibility.meets}
      >
        {hasConsented && !eligibility.meets
          ? 'Não elegível para pesquisa'
          : 'Cadastrar Paciente'}
      </Button>
    </div>
  );
}
```

---

## Mobile-Optimized Forms

### Touch-Friendly Validation

```typescript
'use client';

import { useState, useEffect } from 'react';
import { validateField } from '@/lib/registration-validation';

export function MobileOptimizedForm() {
  const [formData, setFormData] = useState({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState({});

  // Debounced validation for mobile
  useEffect(() => {
    if (!focusedField) return;

    const timer = setTimeout(() => {
      const validation = validateField(
        focusedField,
        formData[focusedField],
        context,
        formData
      );

      setErrors(prev => ({
        ...prev,
        [focusedField]: validation.error || ''
      }));
    }, 500); // Wait for user to finish typing

    return () => clearTimeout(timer);
  }, [formData, focusedField]);

  return (
    <div className="space-y-4 px-4">
      {/* Large touch targets */}
      <div className="space-y-2">
        <Label className="text-lg">Nome</Label>
        <Input
          className="h-14 text-lg" // Larger for mobile
          value={formData.name || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          onFocus={() => setFocusedField('name')}
          onBlur={() => setFocusedField(null)}
        />
        {/* Show error below field (not as tooltip on mobile) */}
        {errors.name && (
          <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
            {errors.name}
          </div>
        )}
      </div>

      {/* Sticky submit button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button size="lg" className="w-full h-14 text-lg">
          Cadastrar
        </Button>
      </div>
    </div>
  );
}
```

---

## Integration Checklist

When integrating the validation system, make sure to:

- [ ] Define ValidationContext based on patient type
- [ ] Use validateRegistrationData for form-level validation
- [ ] Use validateField for real-time field validation
- [ ] Implement touched fields pattern to avoid premature errors
- [ ] Add FieldRequirementBadge to show requirement levels
- [ ] Show FieldValidationMessage for inline feedback
- [ ] Include ValidationSummary for overview
- [ ] Validate on both client and server
- [ ] Handle research eligibility checks
- [ ] Consider mobile UX (larger targets, debouncing)
- [ ] Add loading states during validation
- [ ] Provide clear error recovery paths
- [ ] Test with real user data
- [ ] Ensure accessibility (keyboard nav, screen readers)
- [ ] Support dark mode

---

## Common Patterns

### Pattern 1: Validate on Blur, Show on Touch

```typescript
const [touched, setTouched] = useState<Set<string>>(new Set());

<Input
  onBlur={(e) => {
    const field = e.target.name;
    setTouched(prev => new Set(prev).add(field));
    validateField(field, formData[field], context);
  }}
/>

{touched.has(field) && <FieldValidationMessage error={errors[field]} />}
```

### Pattern 2: Debounced Real-time Validation

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedValidate = useDebouncedCallback((field, value) => {
  const validation = validateField(field, value, context, formData);
  setErrors(prev => ({ ...prev, [field]: validation.error }));
}, 300);

<Input
  onChange={(e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    debouncedValidate(field, e.target.value);
  }}
/>
```

### Pattern 3: Show All Errors on Submit

```typescript
const [showAll, setShowAll] = useState(false);

const handleSubmit = (e) => {
  e.preventDefault();
  setShowAll(true);

  const result = validateRegistrationData(formData, context);
  if (!result.isValid) {
    // All errors now visible
    setErrors(result.errors);
  }
};

const shouldShow = (field) => showAll || touched.has(field);

{shouldShow(field) && <FieldValidationMessage error={errors[field]} />}
```

---

## Next Steps

1. Review the complete guide: `VALIDATION_SYSTEM_GUIDE.md`
2. Check quick reference: `VALIDATION_QUICK_REFERENCE.md`
3. Run the demo: Visit `/validation-demo`
4. Explore the example: `components/examples/ValidatedPatientForm.tsx`
5. Run tests: `npm test registration-validation`
