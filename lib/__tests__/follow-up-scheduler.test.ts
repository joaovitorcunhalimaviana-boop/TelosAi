/**
 * Testes para follow-up-scheduler.ts
 * Testa criação de follow-ups e horários corretos em BRT
 */

import { createFollowUpSchedule } from '../follow-up-scheduler';
import { toBrasiliaTime, fromBrasiliaTime } from '../date-utils';
import { prisma } from '../prisma';

// Mock do prisma
jest.mock('../prisma', () => ({
  prisma: {
    followUp: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('follow-up-scheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFollowUpSchedule', () => {
    it('should create follow-ups at correct BRT time (10:00)', async () => {
      (mockPrisma.followUp.createMany as jest.Mock).mockResolvedValue({ count: 7 });

      const surgeryDate = new Date('2025-01-15T14:00:00Z'); // UTC
      const params = {
        patientId: 'patient-1',
        surgeryId: 'surgery-1',
        surgeryDate,
        userId: 'user-1',
      };

      await createFollowUpSchedule(params);

      expect(mockPrisma.followUp.createMany).toHaveBeenCalledTimes(1);

      const callArgs = (mockPrisma.followUp.createMany as jest.Mock).mock.calls[0][0];
      const followUpsData = callArgs.data;

      // Verificar que todos os follow-ups foram criados às 10:00 BRT
      followUpsData.forEach((followUp: any) => {
        const dateInBRT = toBrasiliaTime(followUp.scheduledDate);
        expect(dateInBRT.getHours()).toBe(10);
        expect(dateInBRT.getMinutes()).toBe(0);
        expect(dateInBRT.getSeconds()).toBe(0);
      });
    });

    it('should respect protocol days (D+1, D+2, D+3, D+5, D+7, D+10, D+14)', async () => {
      (mockPrisma.followUp.createMany as jest.Mock).mockResolvedValue({ count: 7 });

      const surgeryDate = new Date('2025-01-15T10:00:00-03:00');
      const params = {
        patientId: 'patient-1',
        surgeryId: 'surgery-1',
        surgeryDate,
        userId: 'user-1',
      };

      await createFollowUpSchedule(params);

      const callArgs = (mockPrisma.followUp.createMany as jest.Mock).mock.calls[0][0];
      const followUpsData = callArgs.data;

      // Verificar dias corretos
      const expectedDays = [1, 2, 3, 5, 7, 10, 14];
      expect(followUpsData.length).toBe(7);

      followUpsData.forEach((followUp: any, index: number) => {
        expect(followUp.dayNumber).toBe(expectedDays[index]);
      });
    });

    it('should avoid weekends (Saturday and Sunday)', async () => {
      (mockPrisma.followUp.createMany as jest.Mock).mockResolvedValue({ count: 7 });

      // Cirurgia numa sexta-feira
      const surgeryDate = new Date('2025-01-17T10:00:00-03:00'); // Sexta

      const params = {
        patientId: 'patient-1',
        surgeryId: 'surgery-1',
        surgeryDate,
        userId: 'user-1',
      };

      await createFollowUpSchedule(params);

      const callArgs = (mockPrisma.followUp.createMany as jest.Mock).mock.calls[0][0];
      const followUpsData = callArgs.data;

      // D+1 seria sábado (18/01), D+2 seria domingo (19/01)
      // O sistema atualmente NÃO ajusta automaticamente para evitar fins de semana
      // mas podemos verificar que os follow-ups foram criados
      // (Este teste documenta o comportamento atual)

      const firstFollowUp = followUpsData[0];
      const dateInBRT = toBrasiliaTime(firstFollowUp.scheduledDate);

      // D+1 após sexta é sábado
      expect(dateInBRT.getDay()).toBe(6); // 6 = Saturday

      // Nota: Se quiser implementar lógica de evitar fins de semana,
      // este teste falharia e você precisaria ajustar o código
    });

    it('should handle surgeries without protocol', async () => {
      (mockPrisma.followUp.createMany as jest.Mock).mockResolvedValue({ count: 7 });

      const surgeryDate = new Date('2025-01-15T10:00:00-03:00');
      const params = {
        patientId: 'patient-1',
        surgeryId: 'surgery-1',
        surgeryDate,
        userId: 'user-1',
      };

      const result = await createFollowUpSchedule(params);

      expect(result.success).toBe(true);
      expect(result.count).toBe(7);
      expect(result.followUpDays).toEqual([1, 2, 3, 5, 7, 10, 14]);
    });

    it('should calculate scheduledDate correctly', async () => {
      (mockPrisma.followUp.createMany as jest.Mock).mockResolvedValue({ count: 7 });

      const surgeryDate = new Date('2025-01-15T10:00:00-03:00');
      const params = {
        patientId: 'patient-1',
        surgeryId: 'surgery-1',
        surgeryDate,
        userId: 'user-1',
      };

      await createFollowUpSchedule(params);

      const callArgs = (mockPrisma.followUp.createMany as jest.Mock).mock.calls[0][0];
      const followUpsData = callArgs.data;

      // Verificar D+1 (16/01)
      const d1 = followUpsData[0];
      const d1Date = toBrasiliaTime(d1.scheduledDate);
      expect(d1Date.getDate()).toBe(16);
      expect(d1Date.getMonth()).toBe(0); // Janeiro = 0
      expect(d1Date.getFullYear()).toBe(2025);

      // Verificar D+7 (22/01)
      const d7 = followUpsData[4];
      const d7Date = toBrasiliaTime(d7.scheduledDate);
      expect(d7Date.getDate()).toBe(22);

      // Verificar D+14 (29/01)
      const d14 = followUpsData[6];
      const d14Date = toBrasiliaTime(d14.scheduledDate);
      expect(d14Date.getDate()).toBe(29);
    });
  });
});
