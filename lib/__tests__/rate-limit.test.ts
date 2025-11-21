/**
 * Testes para rate-limit.ts
 * Testa rate limiting com sliding window
 */

import { rateLimit } from '../rate-limit';
import { kv } from '@vercel/kv';

// Mock do Vercel KV
jest.mock('@vercel/kv', () => ({
  kv: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

const mockKV = kv as jest.Mocked<typeof kv>;

describe('rate-limit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset do Date.now para testes consistentes
    jest.spyOn(Date, 'now').mockReturnValue(1000000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('rateLimit', () => {
    it('should allow requests within limit', async () => {
      // Primeira requisição - sem registro anterior
      mockKV.get.mockResolvedValue(null);
      mockKV.set.mockResolvedValue('OK');

      const result = await rateLimit('test-ip', 10, 60);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
      expect(mockKV.set).toHaveBeenCalledWith(
        'rate_limit:test-ip',
        {
          count: 1,
          resetTime: 1000000000 + 60 * 1000,
        },
        { ex: 60 }
      );
    });

    it('should block after exceeding limit', async () => {
      const now = Date.now();

      // Simular que já atingiu o limite
      mockKV.get.mockResolvedValue({
        count: 10,
        resetTime: now + 30000, // Ainda dentro da janela
      });

      const result = await rateLimit('test-ip', 10, 60);

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.reset).toBe(now + 30000);
      // Não deve chamar set quando limite excedido
      expect(mockKV.set).not.toHaveBeenCalled();
    });

    it('should reset after window expires', async () => {
      const now = Date.now();

      // Simular que a janela expirou
      mockKV.get.mockResolvedValue({
        count: 10,
        resetTime: now - 1000, // Janela expirada
      });
      mockKV.set.mockResolvedValue('OK');

      const result = await rateLimit('test-ip', 10, 60);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
      expect(mockKV.set).toHaveBeenCalledWith(
        'rate_limit:test-ip',
        {
          count: 1,
          resetTime: now + 60 * 1000,
        },
        { ex: 60 }
      );
    });

    it('should return remaining correctly', async () => {
      const now = Date.now();

      // Simular 3 requisições já feitas
      mockKV.get.mockResolvedValue({
        count: 3,
        resetTime: now + 30000,
      });
      mockKV.set.mockResolvedValue('OK');

      const result = await rateLimit('test-ip', 10, 60);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(6); // 10 - 4 = 6
      expect(mockKV.set).toHaveBeenCalledWith(
        'rate_limit:test-ip',
        {
          count: 4,
          resetTime: now + 30000,
        },
        expect.any(Object)
      );
    });

    it('should fail open when KV is unavailable', async () => {
      // Simular erro no KV
      mockKV.get.mockRejectedValue(new Error('KV unavailable'));

      const result = await rateLimit('test-ip', 10, 60);

      // Deve permitir a requisição (fail open)
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(10);
    });

    it('should handle multiple identifiers independently', async () => {
      mockKV.get.mockResolvedValue(null);
      mockKV.set.mockResolvedValue('OK');

      const result1 = await rateLimit('ip-1', 10, 60);
      const result2 = await rateLimit('ip-2', 10, 60);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // Verificar que usou keys diferentes
      expect(mockKV.set).toHaveBeenNthCalledWith(
        1,
        'rate_limit:ip-1',
        expect.any(Object),
        expect.any(Object)
      );
      expect(mockKV.set).toHaveBeenNthCalledWith(
        2,
        'rate_limit:ip-2',
        expect.any(Object),
        expect.any(Object)
      );
    });
  });
});
