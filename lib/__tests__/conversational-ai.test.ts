/**
 * Testes para conversational-ai.ts
 * Testa a função conductConversation() e validações críticas
 */

import { conductConversation, QuestionnaireData } from '../conversational-ai';
import { Patient, Surgery } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

// Mock do Anthropic SDK
jest.mock('@anthropic-ai/sdk');

// Mock do prisma
jest.mock('../prisma', () => ({
  prisma: {
    patient: {},
    surgery: {},
  },
}));

// Mock do daily-questionnaire-flow
jest.mock('../daily-questionnaire-flow', () => ({
  getDailyQuestions: jest.fn().mockResolvedValue({
    contextForAI: 'Contexto do questionário',
  }),
  getIntroductionMessage: jest.fn().mockReturnValue('Mensagem de introdução'),
}));

// Mock do whatsapp
jest.mock('../whatsapp', () => ({
  sendImage: jest.fn().mockResolvedValue(true),
}));

describe('conversational-ai', () => {
  let mockAnthropicCreate: jest.Mock;
  let mockPatient: Patient;
  let mockSurgery: Surgery;

  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();

    // Setup do mock do Anthropic
    mockAnthropicCreate = jest.fn();
    (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(
      () =>
      ({
        messages: {
          create: mockAnthropicCreate,
        },
      } as any)
    );

    // Mock de paciente
    mockPatient = {
      id: 'patient-1',
      name: 'João Silva',
      phone: '5511999999999',
      email: 'joao@example.com',
      cpf: '12345678900',
      birthDate: new Date('1990-01-01'),
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      consentGiven: true,
      consentDate: new Date(),
      dataSharingConsent: false,
    } as unknown as Patient;

    // Mock de cirurgia
    mockSurgery = {
      id: 'surgery-1',
      patientId: 'patient-1',
      userId: 'user-1',
      type: 'hemorrhoidectomy',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      hospital: 'Hospital Test',
      protocol: 'standard',
      anesthesiaType: 'spinal',
      complications: null,
      duration: null,
    } as unknown as Surgery;
  });

  describe('conductConversation', () => {
    it('should extract valid pain score from conversation', async () => {
      // Mock da resposta da API do Claude
      mockAnthropicCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              response: 'Entendi. Sua dor está em nível 7.',
              extractedInfo: {
                pain: 7,
              },
              sendImages: {
                painScale: false,
                bristolScale: false,
              },
              isComplete: false,
              urgency: 'medium',
              needsDoctorAlert: false,
            }),
          },
        ],
      });

      const result = await conductConversation(
        'Minha dor está em 7',
        mockPatient,
        mockSurgery,
        [],
        {}
      );

      expect(result.updatedData.pain).toBe(7);
      expect(result.aiResponse).toContain('dor');
      expect(result.isComplete).toBe(false);
    });

    it('should validate pain score range (0-10)', async () => {
      mockAnthropicCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              response: 'Por favor, me diga um número entre 0 e 10.',
              extractedInfo: {},
              sendImages: {
                painScale: false,
                bristolScale: false,
              },
              isComplete: false,
              urgency: 'low',
              needsDoctorAlert: false,
            }),
          },
        ],
      });

      const result = await conductConversation(
        'Minha dor está em 15',
        mockPatient,
        mockSurgery,
        [],
        {}
      );

      // A IA deve não aceitar valores fora do range
      expect(result.updatedData.pain).toBeUndefined();
    });

    it('should reject vague pain responses', async () => {
      mockAnthropicCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              response:
                'Entendo que está com bastante dor. Preciso que você me diga um número de 0 a 10 para eu registrar certinho.',
              extractedInfo: {},
              sendImages: {
                painScale: true,
                bristolScale: false,
              },
              isComplete: false,
              urgency: 'low',
              needsDoctorAlert: false,
            }),
          },
        ],
      });

      const result = await conductConversation(
        'Estou com muita dor',
        mockPatient,
        mockSurgery,
        [],
        {}
      );

      // Resposta vaga não deve ser extraída
      expect(result.updatedData.pain).toBeUndefined();
      expect(result.sendImages?.painScale).toBe(true);
    });

    it('should validate stool consistency (Bristol Scale 1-7)', async () => {
      mockAnthropicCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              response: 'Obrigado, registrei que foi tipo 4 da escala.',
              extractedInfo: {
                bowelMovementSinceLastContact: true,
                painDuringBowelMovement: 3,
                stoolConsistency: 4,
              },
              sendImages: {
                painScale: false,
                bristolScale: false,
              },
              isComplete: false,
              urgency: 'low',
              needsDoctorAlert: false,
            }),
          },
        ],
      });

      const result = await conductConversation(
        'Evacuei sim, dor foi 3 e consistência tipo 4',
        mockPatient,
        mockSurgery,
        [],
        { bowelMovementSinceLastContact: true }
      );

      expect(result.updatedData.stoolConsistency).toBe(4);
      expect(result.updatedData.stoolConsistency).toBeGreaterThanOrEqual(1);
      expect(result.updatedData.stoolConsistency).toBeLessThanOrEqual(7);
    });

    it('should handle API errors gracefully', async () => {
      mockAnthropicCreate.mockRejectedValue(new Error('API Error'));

      const result = await conductConversation(
        'Teste',
        mockPatient,
        mockSurgery,
        [],
        {}
      );

      // Deve retornar fallback response
      expect(result.aiResponse).toContain('problema técnico');
      expect(result.isComplete).toBe(false);
      expect(result.needsDoctorAlert).toBe(false);
    });

    it('should apply Zod schema validation (structured data)', async () => {
      mockAnthropicCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              response: 'Registrado!',
              extractedInfo: {
                pain: 5,
                bowelMovementSinceLastContact: true,
                painDuringBowelMovement: 4,
                stoolConsistency: 3,
                bleeding: 'minimal',
                urination: true,
                fever: false,
                medications: true,
              },
              sendImages: {
                painScale: false,
                bristolScale: false,
              },
              isComplete: true,
              urgency: 'low',
              needsDoctorAlert: false,
            }),
          },
        ],
      });

      const result = await conductConversation(
        'Resposta completa',
        mockPatient,
        mockSurgery,
        [],
        {}
      );

      // Validar estrutura dos dados
      expect(result.updatedData).toHaveProperty('pain');
      expect(result.updatedData).toHaveProperty('bowelMovementSinceLastContact');
      expect(result.updatedData).toHaveProperty('bleeding');
      expect(typeof result.updatedData.pain).toBe('number');
      expect(typeof result.updatedData.bowelMovementSinceLastContact).toBe(
        'boolean'
      );
    });

    it('should return nextQuestion correctly', async () => {
      mockAnthropicCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              response: 'Você evacuou desde a última vez que conversamos?',
              extractedInfo: {
                pain: 5,
              },
              sendImages: {
                painScale: false,
                bristolScale: false,
              },
              isComplete: false,
              urgency: 'low',
              needsDoctorAlert: false,
            }),
          },
        ],
      });

      const result = await conductConversation(
        'Minha dor está 5',
        mockPatient,
        mockSurgery,
        [],
        {}
      );

      expect(result.aiResponse).toBeTruthy();
      expect(result.isComplete).toBe(false);
      expect(result.aiResponse).toContain('?');
    });

    it('should identify when conversation is complete', async () => {
      mockAnthropicCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              response:
                'Perfeito! Tenho todas as informações. Obrigada e melhoras!',
              extractedInfo: {
                pain: 3,
                bowelMovementSinceLastContact: true,
                painDuringBowelMovement: 2,
                stoolConsistency: 4,
                bleeding: 'none',
                urination: true,
                fever: false,
                medications: true,
                painControlledWithMeds: true,
              },
              sendImages: {
                painScale: false,
                bristolScale: false,
              },
              isComplete: true,
              urgency: 'low',
              needsDoctorAlert: false,
            }),
          },
        ],
      });

      const result = await conductConversation(
        'Sim, está tudo bem',
        mockPatient,
        mockSurgery,
        [],
        {
          pain: 3,
          bowelMovementSinceLastContact: true,
          painDuringBowelMovement: 2,
          stoolConsistency: 4,
          bleeding: 'none',
          urination: true,
          fever: false,
        }
      );

      expect(result.isComplete).toBe(true);
      expect(result.updatedData.pain).toBe(3);
      expect(result.updatedData.medications).toBe(true);
    });
  });
});
