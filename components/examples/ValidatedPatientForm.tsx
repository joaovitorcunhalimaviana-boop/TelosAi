'use client';

/**
 * Example: Validated Patient Registration Form
 *
 * This component demonstrates how to use the contextual validation system
 * with real-time validation and visual feedback.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  validateRegistrationData,
  validateField,
  getValidationSummary,
  meetsResearchCriteria,
  getFieldLabel,
  formatValidationErrors,
  type ValidationContext,
  type ValidationResult,
  type PatientData
} from '@/lib/registration-validation';
import {
  FieldRequirementBadge,
  ValidationSummary,
  SectionValidationSummary,
  FieldValidationMessage,
  ResearchCriteriaChecker
} from '@/components/FieldRequirementBadge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ValidatedPatientFormProps {
  isResearchParticipant?: boolean;
  researchId?: string;
  studyAgeRange?: { min: number; max: number };
  onSubmit?: (data: PatientData) => void;
}

export function ValidatedPatientForm({
  isResearchParticipant = false,
  researchId,
  studyAgeRange = { min: 18, max: 80 },
  onSubmit
}: ValidatedPatientFormProps) {
  // Form data
  const [formData, setFormData] = useState<PatientData>({
    name: '',
    phone: '',
    email: '',
    cpf: '',
    dateOfBirth: '',
    sex: '',
    surgeryType: '',
    surgeryDate: '',
    surgeryDetails: '',
    comorbidities: [],
    medications: [],
    allergies: [],
    observations: ''
  });

  // Validation context
  const [context] = useState<ValidationContext>({
    isResearchParticipant,
    researchId,
    studyAgeRange
  });

  // Validation state
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    errors: {},
    warnings: {},
    missingRequired: []
  });

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fieldWarnings, setFieldWarnings] = useState<Record<string, string>>({});

  // Touched fields (for displaying errors only after user interaction)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Show all errors (triggered on submit attempt)
  const [showAllErrors, setShowAllErrors] = useState(false);

  // Validate entire form whenever data changes
  useEffect(() => {
    const result = validateRegistrationData(formData, context);
    setValidation(result);
  }, [formData, context]);

  // Handle field change
  const handleFieldChange = useCallback((
    fieldName: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Real-time validation for this field
    const fieldValidation = validateField(fieldName, value, context, {
      ...formData,
      [fieldName]: value
    });

    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: fieldValidation.error || ''
    }));

    setFieldWarnings(prev => ({
      ...prev,
      [fieldName]: fieldValidation.warning || ''
    }));
  }, [formData, context]);

  // Handle field blur (mark as touched)
  const handleFieldBlur = useCallback((fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setShowAllErrors(true);

    if (validation.isValid) {
      onSubmit?.(formData);
    } else {
      // Scroll to first error
      const firstErrorField = Object.keys(validation.errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(`field-${firstErrorField}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [validation, formData, onSubmit]);

  // Should show error for a field?
  const shouldShowError = (fieldName: string) => {
    return (showAllErrors || touchedFields.has(fieldName)) && fieldErrors[fieldName];
  };

  // Should show warning for a field?
  const shouldShowWarning = (fieldName: string) => {
    return (showAllErrors || touchedFields.has(fieldName)) &&
           fieldWarnings[fieldName] &&
           !fieldErrors[fieldName];
  };

  // Get validation summary by section
  const sectionSummary = getValidationSummary(validation, context);

  // Check research criteria
  const researchCheck = isResearchParticipant
    ? meetsResearchCriteria(formData, context)
    : { meets: true, reasons: [] };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Cadastro de Paciente
          {isResearchParticipant && ' - Participante de Pesquisa'}
        </h1>
        {isResearchParticipant && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Como participante de pesquisa, alguns campos adicionais são obrigatórios
              para garantir a qualidade dos dados coletados.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Research Criteria Check */}
      {isResearchParticipant && formData.dateOfBirth && (
        <ResearchCriteriaChecker
          meets={researchCheck.meets}
          reasons={researchCheck.reasons}
        />
      )}

      {/* Personal Data Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dados Pessoais</CardTitle>
            {sectionSummary['Dados Pessoais'] && (
              <SectionValidationSummary
                sectionName="Dados Pessoais"
                {...sectionSummary['Dados Pessoais']}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div id="field-name" className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <FieldRequirementBadge fieldName="name" context={context} />
            </div>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={() => handleFieldBlur('name')}
              placeholder="Digite o nome completo"
              className={shouldShowError('name') ? 'border-red-500' : ''}
            />
            {shouldShowError('name') && (
              <FieldValidationMessage error={fieldErrors.name} />
            )}
          </div>

          {/* Phone */}
          <div id="field-phone" className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <FieldRequirementBadge fieldName="phone" context={context} />
            </div>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              onBlur={() => handleFieldBlur('phone')}
              placeholder="(00) 00000-0000"
              className={shouldShowError('phone') ? 'border-red-500' : ''}
            />
            {shouldShowError('phone') && (
              <FieldValidationMessage error={fieldErrors.phone} />
            )}
          </div>

          {/* Email */}
          <div id="field-email" className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="email">Email</Label>
              <FieldRequirementBadge fieldName="email" context={context} />
            </div>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={() => handleFieldBlur('email')}
              placeholder="email@exemplo.com"
              className={shouldShowError('email') ? 'border-red-500' : ''}
            />
            {shouldShowError('email') ? (
              <FieldValidationMessage error={fieldErrors.email} />
            ) : shouldShowWarning('email') ? (
              <FieldValidationMessage warning={fieldWarnings.email} />
            ) : null}
          </div>

          {/* CPF */}
          <div id="field-cpf" className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="cpf">CPF</Label>
              <FieldRequirementBadge fieldName="cpf" context={context} />
            </div>
            <Input
              id="cpf"
              value={formData.cpf}
              onChange={(e) => handleFieldChange('cpf', e.target.value)}
              onBlur={() => handleFieldBlur('cpf')}
              placeholder="000.000.000-00"
              className={shouldShowError('cpf') ? 'border-red-500' : ''}
            />
            {shouldShowError('cpf') ? (
              <FieldValidationMessage error={fieldErrors.cpf} />
            ) : shouldShowWarning('cpf') ? (
              <FieldValidationMessage warning={fieldWarnings.cpf} />
            ) : null}
          </div>

          {/* Date of Birth */}
          <div id="field-dateOfBirth" className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
              <FieldRequirementBadge fieldName="dateOfBirth" context={context} />
            </div>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
              onBlur={() => handleFieldBlur('dateOfBirth')}
              className={shouldShowError('dateOfBirth') ? 'border-red-500' : ''}
            />
            {shouldShowError('dateOfBirth') ? (
              <FieldValidationMessage error={fieldErrors.dateOfBirth} />
            ) : shouldShowWarning('dateOfBirth') ? (
              <FieldValidationMessage warning={fieldWarnings.dateOfBirth} />
            ) : null}
          </div>

          {/* Sex */}
          <div id="field-sex" className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="sex">Sexo</Label>
              <FieldRequirementBadge fieldName="sex" context={context} />
            </div>
            <Select
              value={formData.sex}
              onValueChange={(value) => handleFieldChange('sex', value)}
            >
              <SelectTrigger
                id="sex"
                className={shouldShowError('sex') ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            {shouldShowError('sex') ? (
              <FieldValidationMessage error={fieldErrors.sex} />
            ) : shouldShowWarning('sex') ? (
              <FieldValidationMessage warning={fieldWarnings.sex} />
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Surgery Data Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dados Cirúrgicos</CardTitle>
            {sectionSummary['Dados Cirúrgicos'] && (
              <SectionValidationSummary
                sectionName="Dados Cirúrgicos"
                {...sectionSummary['Dados Cirúrgicos']}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Surgery Type */}
          <div id="field-surgeryType" className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="surgeryType">Tipo de Cirurgia</Label>
              <FieldRequirementBadge fieldName="surgeryType" context={context} />
            </div>
            <Input
              id="surgeryType"
              value={formData.surgeryType}
              onChange={(e) => handleFieldChange('surgeryType', e.target.value)}
              onBlur={() => handleFieldBlur('surgeryType')}
              placeholder="Ex: Apendicectomia"
              className={shouldShowError('surgeryType') ? 'border-red-500' : ''}
            />
            {shouldShowError('surgeryType') && (
              <FieldValidationMessage error={fieldErrors.surgeryType} />
            )}
          </div>

          {/* Surgery Date */}
          <div id="field-surgeryDate" className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="surgeryDate">Data da Cirurgia</Label>
              <FieldRequirementBadge fieldName="surgeryDate" context={context} />
            </div>
            <Input
              id="surgeryDate"
              type="date"
              value={formData.surgeryDate}
              onChange={(e) => handleFieldChange('surgeryDate', e.target.value)}
              onBlur={() => handleFieldBlur('surgeryDate')}
              className={shouldShowError('surgeryDate') ? 'border-red-500' : ''}
            />
            {shouldShowError('surgeryDate') && (
              <FieldValidationMessage error={fieldErrors.surgeryDate} />
            )}
          </div>

          {/* Surgery Details */}
          <div id="field-surgeryDetails" className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="surgeryDetails">Detalhes da Cirurgia</Label>
              <FieldRequirementBadge fieldName="surgeryDetails" context={context} />
            </div>
            <Input
              id="surgeryDetails"
              value={formData.surgeryDetails}
              onChange={(e) => handleFieldChange('surgeryDetails', e.target.value)}
              onBlur={() => handleFieldBlur('surgeryDetails')}
              placeholder="Informações adicionais sobre a cirurgia"
              className={shouldShowError('surgeryDetails') ? 'border-red-500' : ''}
            />
            {shouldShowWarning('surgeryDetails') && (
              <FieldValidationMessage warning={fieldWarnings.surgeryDetails} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      <ValidationSummary
        errors={formatValidationErrors(validation.errors)}
        missingRequired={validation.missingRequired.map(getFieldLabel)}
        missingRecommended={validation.missingRecommended?.map(getFieldLabel)}
      />

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="submit"
          size="lg"
          disabled={!validation.isValid && isResearchParticipant}
          className="flex-1"
        >
          {validation.isValid ? 'Cadastrar Paciente' : 'Preencha os campos obrigatórios'}
        </Button>
        {!isResearchParticipant && !validation.isValid && (
          <Button
            type="submit"
            variant="outline"
            size="lg"
          >
            Salvar Rascunho
          </Button>
        )}
      </div>
    </form>
  );
}
