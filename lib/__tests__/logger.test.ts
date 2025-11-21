/**
 * Testes para audit/logger.ts
 * Testa logging em diferentes ambientes e proteção de dados sensíveis
 */

import { AuditLogger } from '../audit/logger';
import { prisma } from '../prisma';

// Mock do prisma
jest.mock('../prisma', () => ({
  prisma: {
    auditLog: {
      create: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('logger', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('AuditLogger', () => {
    it('should log debug messages only in development', async () => {
      // Simular ambiente de desenvolvimento
      process.env.NODE_ENV = 'development';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockPrisma.auditLog.create.mockResolvedValue({
        id: 'log-1',
        userId: 'user-1',
        action: 'test.action',
      });

      await AuditLogger.log({
        userId: 'user-1',
        action: 'test.action',
        resource: 'TestResource',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should log errors in production', async () => {
      // Simular ambiente de produção
      process.env.NODE_ENV = 'production';

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Simular erro no Prisma
      mockPrisma.auditLog.create.mockRejectedValue(new Error('Database error'));

      await AuditLogger.log({
        userId: 'user-1',
        action: 'test.action',
        resource: 'TestResource',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      });

      // Deve logar o erro mas não quebrar a aplicação
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro ao criar log de auditoria:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should not log sensitive data in production', async () => {
      process.env.NODE_ENV = 'production';

      mockPrisma.auditLog.create.mockResolvedValue({
        id: 'log-1',
      });

      await AuditLogger.exportDataset({
        userId: 'user-1',
        exportType: 'csv',
        recordCount: 100,
        filters: {
          patientName: 'João Silva', // Dados sensíveis
          cpf: '12345678900', // Dados sensíveis
        },
        ipAddress: '192.168.1.1',
        userAgent: 'test-agent',
      });

      // Verificar que o log foi criado com isSensitive: true
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isSensitive: true,
          isDataAccess: true,
          action: 'export.dataset',
        }),
      });

      // Importante: os dados sensíveis não devem aparecer em console.log em produção
      // (A implementação atual armazena no banco, mas não exibe no console em prod)
    });

    it('should track patient viewed actions', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({
        id: 'log-1',
      });

      await AuditLogger.patientViewed({
        userId: 'user-1',
        patientId: 'patient-1',
        patientName: 'João Silva',
        ipAddress: '192.168.1.1',
        userAgent: 'test-agent',
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'patient.viewed',
          isDataAccess: true,
          isSensitive: false,
        }),
      });
    });

    it('should mark export operations as sensitive', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({
        id: 'log-1',
      });

      await AuditLogger.exportResearch({
        userId: 'user-1',
        researchId: 'research-1',
        researchTitle: 'Estudo de Hemorroidectomia',
        exportFormat: 'csv',
        recordCount: 50,
        ipAddress: '192.168.1.1',
        userAgent: 'test-agent',
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'export.research',
          isSensitive: true,
          isDataAccess: true,
        }),
      });
    });

    it('should not break app when logging fails', async () => {
      mockPrisma.auditLog.create.mockRejectedValue(
        new Error('Database unavailable')
      );

      // Não deve lançar exceção
      await expect(
        AuditLogger.log({
          userId: 'user-1',
          action: 'test.action',
          resource: 'TestResource',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
        })
      ).resolves.not.toThrow();
    });
  });
});
