/**
 * Tests for Contextual Validation System
 *
 * Run with: npm test registration-validation
 */

import {
  validateField,
  validateRegistrationData,
  getRequiredFields,
  getRecommendedFields,
  getFieldRequirement,
  meetsResearchCriteria,
  getValidationSummary,
  formatValidationErrors,
  getFieldLabel,
  type ValidationContext,
  type PatientData
} from '../registration-validation';

describe('Validation System', () => {
  describe('Context-based Requirements', () => {
    it('should require basic fields for standard patients', () => {
      const context: ValidationContext = { isResearchParticipant: false };
      const required = getRequiredFields(context);

      expect(required).toContain('name');
      expect(required).toContain('phone');
      expect(required).toContain('surgeryType');
      expect(required).toContain('surgeryDate');
      expect(required).not.toContain('email');
      expect(required).not.toContain('cpf');
    });

    it('should require additional fields for research participants', () => {
      const context: ValidationContext = { isResearchParticipant: true };
      const required = getRequiredFields(context);

      expect(required).toContain('name');
      expect(required).toContain('phone');
      expect(required).toContain('email');
      expect(required).toContain('cpf');
      expect(required).toContain('dateOfBirth');
      expect(required).toContain('sex');
    });

    it('should recommend different fields based on context', () => {
      const standardContext: ValidationContext = { isResearchParticipant: false };
      const researchContext: ValidationContext = { isResearchParticipant: true };

      const standardRecommended = getRecommendedFields(standardContext);
      const researchRecommended = getRecommendedFields(researchContext);

      // Standard patients should have email/cpf as recommended
      expect(standardRecommended).toContain('email');
      expect(standardRecommended).toContain('cpf');

      // Research participants should have medical fields as recommended
      expect(researchRecommended).toContain('surgeryDetails');
      expect(researchRecommended).toContain('comorbidities');
    });
  });

  describe('Field Requirement Information', () => {
    it('should return correct requirement level', () => {
      const researchContext: ValidationContext = { isResearchParticipant: true };

      const nameReq = getFieldRequirement('name', researchContext);
      expect(nameReq.level).toBe('required');

      const surgeryDetailsReq = getFieldRequirement('surgeryDetails', researchContext);
      expect(surgeryDetailsReq.level).toBe('recommended');

      const observationsReq = getFieldRequirement('observations', researchContext);
      expect(observationsReq.level).toBe('optional');
    });

    it('should provide reason for requirement', () => {
      const researchContext: ValidationContext = { isResearchParticipant: true };
      const requirement = getFieldRequirement('email', researchContext);

      expect(requirement.reason).toContain('pesquisa');
    });

    it('should identify correct section', () => {
      const context: ValidationContext = { isResearchParticipant: false };

      expect(getFieldRequirement('name', context).section).toBe('Dados Pessoais');
      expect(getFieldRequirement('surgeryType', context).section).toBe('Dados Cirúrgicos');
      expect(getFieldRequirement('comorbidities', context).section).toBe('Histórico Médico');
    });
  });

  describe('Name Validation', () => {
    const context: ValidationContext = { isResearchParticipant: false };

    it('should accept valid names', () => {
      const validation = validateField('name', 'João Silva', context);
      expect(validation.error).toBeUndefined();
    });

    it('should reject names with less than 3 characters', () => {
      const validation = validateField('name', 'Jo', context);
      expect(validation.error).toBeTruthy();
    });

    it('should reject names with numbers', () => {
      const validation = validateField('name', 'João123', context);
      expect(validation.error).toBeTruthy();
    });

    it('should accept names with accented characters', () => {
      const validation = validateField('name', 'José María', context);
      expect(validation.error).toBeUndefined();
    });

    it('should require name field', () => {
      const validation = validateField('name', '', context);
      expect(validation.error).toBe('Este campo é obrigatório');
    });
  });

  describe('Phone Validation', () => {
    const context: ValidationContext = { isResearchParticipant: false };

    it('should accept 10-digit phone numbers', () => {
      const validation = validateField('phone', '1133334444', context);
      expect(validation.error).toBeUndefined();
    });

    it('should accept 11-digit phone numbers', () => {
      const validation = validateField('phone', '11999887766', context);
      expect(validation.error).toBeUndefined();
    });

    it('should accept formatted phone numbers', () => {
      const validation = validateField('phone', '(11) 99988-7766', context);
      expect(validation.error).toBeUndefined();
    });

    it('should reject invalid phone numbers', () => {
      const validation = validateField('phone', '123', context);
      expect(validation.error).toBeTruthy();
    });
  });

  describe('Email Validation', () => {
    const context: ValidationContext = { isResearchParticipant: false };

    it('should accept valid email addresses', () => {
      const validation = validateField('email', 'user@example.com', context);
      expect(validation.error).toBeUndefined();
    });

    it('should reject invalid email addresses', () => {
      const validation = validateField('email', 'invalid-email', context);
      expect(validation.error).toBeTruthy();
    });

    it('should show warning for standard patients when empty', () => {
      const validation = validateField('email', '', context);
      expect(validation.warning).toBeTruthy();
    });

    it('should show error for research participants when empty', () => {
      const researchContext: ValidationContext = { isResearchParticipant: true };
      const validation = validateField('email', '', researchContext);
      expect(validation.error).toBe('Este campo é obrigatório');
    });
  });

  describe('CPF Validation', () => {
    const context: ValidationContext = { isResearchParticipant: true };

    it('should accept valid CPF', () => {
      const validation = validateField('cpf', '52998224725', context);
      expect(validation.error).toBeUndefined();
    });

    it('should accept formatted CPF', () => {
      const validation = validateField('cpf', '529.982.247-25', context);
      expect(validation.error).toBeUndefined();
    });

    it('should reject invalid CPF', () => {
      const validation = validateField('cpf', '12345678900', context);
      expect(validation.error).toBeTruthy();
    });

    it('should reject CPF with all same digits', () => {
      const validation = validateField('cpf', '11111111111', context);
      expect(validation.error).toBeTruthy();
    });

    it('should reject CPF with wrong length', () => {
      const validation = validateField('cpf', '123456789', context);
      expect(validation.error).toBeTruthy();
    });
  });

  describe('Date of Birth Validation', () => {
    const context: ValidationContext = { isResearchParticipant: false };

    it('should accept valid dates', () => {
      const validation = validateField('dateOfBirth', '1990-01-01', context);
      expect(validation.error).toBeUndefined();
    });

    it('should reject invalid dates', () => {
      const validation = validateField('dateOfBirth', 'invalid-date', context);
      expect(validation.error).toBeTruthy();
    });

    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const validation = validateField('dateOfBirth', futureDate.toISOString().split('T')[0], context);
      expect(validation.error).toBeTruthy();
    });

    it('should check age range for research participants', () => {
      const researchContext: ValidationContext = {
        isResearchParticipant: true,
        studyAgeRange: { min: 18, max: 65 }
      };

      // Too young
      const youngValidation = validateField('dateOfBirth', '2010-01-01', researchContext);
      expect(youngValidation.error).toContain('idade');

      // Too old
      const oldValidation = validateField('dateOfBirth', '1950-01-01', researchContext);
      expect(oldValidation.error).toContain('idade');

      // Just right
      const validValidation = validateField('dateOfBirth', '1990-01-01', researchContext);
      expect(validValidation.error).toBeUndefined();
    });

    it('should warn about minors', () => {
      const validation = validateField('dateOfBirth', '2015-01-01', context);
      expect(validation.warning || validation.error).toBeTruthy();
    });
  });

  describe('Surgery Date Validation', () => {
    const context: ValidationContext = { isResearchParticipant: false };

    it('should accept valid surgery dates', () => {
      const validation = validateField('surgeryDate', '2024-01-01', context);
      expect(validation.error).toBeUndefined();
    });

    it('should reject dates too far in future', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const validation = validateField('surgeryDate', futureDate.toISOString().split('T')[0], context);
      expect(validation.error).toContain('6 meses');
    });

    it('should accept dates within 6 months in future', () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3);
      const validation = validateField('surgeryDate', futureDate.toISOString().split('T')[0], context);
      expect(validation.error).toBeUndefined();
    });
  });

  describe('Cross-Field Validation', () => {
    const context: ValidationContext = { isResearchParticipant: false };

    it('should validate surgery date against birth date', () => {
      const data: PatientData = {
        dateOfBirth: '1990-01-01',
        surgeryDate: '1980-01-01' // Before birth!
      };

      const validation = validateField('surgeryDate', data.surgeryDate, context, data);
      expect(validation.error).toContain('nascimento');
    });

    it('should allow surgery date after birth date', () => {
      const data: PatientData = {
        dateOfBirth: '1990-01-01',
        surgeryDate: '2024-01-01'
      };

      const validation = validateField('surgeryDate', data.surgeryDate, context, data);
      expect(validation.error).toBeUndefined();
    });
  });

  describe('Full Form Validation', () => {
    it('should validate standard patient correctly', () => {
      const context: ValidationContext = { isResearchParticipant: false };
      const data: PatientData = {
        name: 'João Silva',
        phone: '11999887766',
        surgeryType: 'Apendicectomia',
        surgeryDate: '2024-01-01'
      };

      const result = validateRegistrationData(data, context);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should fail validation when required fields are missing', () => {
      const context: ValidationContext = { isResearchParticipant: false };
      const data: PatientData = {
        name: 'João Silva'
        // Missing phone, surgeryType, surgeryDate
      };

      const result = validateRegistrationData(data, context);
      expect(result.isValid).toBe(false);
      expect(result.missingRequired.length).toBeGreaterThan(0);
    });

    it('should validate research participant with all required fields', () => {
      const context: ValidationContext = { isResearchParticipant: true };
      const data: PatientData = {
        name: 'João Silva',
        phone: '11999887766',
        email: 'joao@example.com',
        cpf: '52998224725',
        dateOfBirth: '1990-01-01',
        sex: 'M',
        surgeryType: 'Apendicectomia',
        surgeryDate: '2024-01-01'
      };

      const result = validateRegistrationData(data, context);
      expect(result.isValid).toBe(true);
    });

    it('should fail research validation when additional fields are missing', () => {
      const context: ValidationContext = { isResearchParticipant: true };
      const data: PatientData = {
        name: 'João Silva',
        phone: '11999887766',
        surgeryType: 'Apendicectomia',
        surgeryDate: '2024-01-01'
        // Missing email, cpf, dateOfBirth, sex (required for research)
      };

      const result = validateRegistrationData(data, context);
      expect(result.isValid).toBe(false);
      expect(result.missingRequired).toContain('email');
      expect(result.missingRequired).toContain('cpf');
      expect(result.missingRequired).toContain('dateOfBirth');
      expect(result.missingRequired).toContain('sex');
    });

    it('should include warnings for recommended fields', () => {
      const context: ValidationContext = { isResearchParticipant: true };
      const data: PatientData = {
        name: 'João Silva',
        phone: '11999887766',
        email: 'joao@example.com',
        cpf: '52998224725',
        dateOfBirth: '1990-01-01',
        sex: 'M',
        surgeryType: 'Apendicectomia',
        surgeryDate: '2024-01-01'
        // Missing recommended: surgeryDetails, comorbidities, medications
      };

      const result = validateRegistrationData(data, context);
      expect(result.isValid).toBe(true); // Still valid despite missing recommended
      expect(Object.keys(result.warnings).length).toBeGreaterThan(0);
    });
  });

  describe('Research Criteria Check', () => {
    it('should pass criteria when all requirements are met', () => {
      const context: ValidationContext = {
        isResearchParticipant: true,
        studyAgeRange: { min: 18, max: 65 }
      };

      const data: PatientData = {
        name: 'João Silva',
        phone: '11999887766',
        email: 'joao@example.com',
        cpf: '52998224725',
        dateOfBirth: '1990-01-01',
        sex: 'M',
        surgeryType: 'Apendicectomia',
        surgeryDate: '2024-01-01'
      };

      const check = meetsResearchCriteria(data, context);
      expect(check.meets).toBe(true);
      expect(check.reasons).toHaveLength(0);
    });

    it('should fail criteria when age is out of range', () => {
      const context: ValidationContext = {
        isResearchParticipant: true,
        studyAgeRange: { min: 18, max: 65 }
      };

      const data: PatientData = {
        name: 'João Silva',
        phone: '11999887766',
        email: 'joao@example.com',
        cpf: '52998224725',
        dateOfBirth: '2010-01-01', // Too young
        sex: 'M',
        surgeryType: 'Apendicectomia',
        surgeryDate: '2024-01-01'
      };

      const check = meetsResearchCriteria(data, context);
      expect(check.meets).toBe(false);
      expect(check.reasons.length).toBeGreaterThan(0);
      expect(check.reasons[0]).toContain('Idade');
    });

    it('should fail criteria when required fields are missing', () => {
      const context: ValidationContext = {
        isResearchParticipant: true,
        studyAgeRange: { min: 18, max: 65 }
      };

      const data: PatientData = {
        name: 'João Silva',
        phone: '11999887766'
        // Missing required fields
      };

      const check = meetsResearchCriteria(data, context);
      expect(check.meets).toBe(false);
      expect(check.reasons.length).toBeGreaterThan(0);
    });
  });

  describe('Validation Summary', () => {
    it('should group validation by section', () => {
      const context: ValidationContext = { isResearchParticipant: true };
      const data: PatientData = {
        name: '', // Error in Dados Pessoais
        surgeryType: '' // Error in Dados Cirúrgicos
      };

      const result = validateRegistrationData(data, context);
      const summary = getValidationSummary(result, context);

      expect(summary['Dados Pessoais']).toBeDefined();
      expect(summary['Dados Pessoais'].errors).toBeGreaterThan(0);
      expect(summary['Dados Cirúrgicos']).toBeDefined();
      expect(summary['Dados Cirúrgicos'].errors).toBeGreaterThan(0);
    });
  });

  describe('Helper Functions', () => {
    it('should format validation errors for display', () => {
      const errors = {
        name: 'Nome deve ter pelo menos 3 caracteres',
        email: 'Email inválido'
      };

      const formatted = formatValidationErrors(errors);
      expect(formatted).toHaveLength(2);
      expect(formatted[0]).toContain('Nome');
      expect(formatted[1]).toContain('Email');
    });

    it('should get user-friendly field labels', () => {
      expect(getFieldLabel('name')).toBe('Nome');
      expect(getFieldLabel('dateOfBirth')).toBe('Data de Nascimento');
      expect(getFieldLabel('surgeryType')).toBe('Tipo de Cirurgia');
    });
  });
});
