import { kv } from '@vercel/kv';

/**
 * Rate Limiting usando Vercel KV (Redis)
 * Implementa algoritmo de Sliding Window para controle de taxa de requisições
 */

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset?: number;
}

/**
 * Implementa rate limiting com sliding window
 *
 * @param identifier - Identificador único (ex: IP address)
 * @param limit - Número máximo de requisições permitidas
 * @param window - Janela de tempo em segundos
 * @returns Resultado do rate limit check
 */
export async function rateLimit(
  identifier: string,
  limit: number = 100,
  window: number = 60
): Promise<RateLimitResult> {
  try {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowMs = window * 1000;

    // Buscar tentativas existentes
    const record = await kv.get<{ count: number; resetTime: number }>(key);

    if (!record) {
      // Primeira requisição - criar registro
      const resetTime = now + windowMs;
      await kv.set(key, { count: 1, resetTime }, { ex: window });

      return {
        success: true,
        remaining: limit - 1,
        reset: resetTime,
      };
    }

    // Verificar se a janela expirou
    if (now >= record.resetTime) {
      // Janela expirou - resetar contador
      const resetTime = now + windowMs;
      await kv.set(key, { count: 1, resetTime }, { ex: window });

      return {
        success: true,
        remaining: limit - 1,
        reset: resetTime,
      };
    }

    // Janela ainda válida - verificar se excedeu o limite
    if (record.count >= limit) {
      return {
        success: false,
        remaining: 0,
        reset: record.resetTime,
      };
    }

    // Incrementar contador
    const newCount = record.count + 1;
    await kv.set(
      key,
      { count: newCount, resetTime: record.resetTime },
      { ex: Math.ceil((record.resetTime - now) / 1000) }
    );

    return {
      success: true,
      remaining: limit - newCount,
      reset: record.resetTime,
    };
  } catch (error) {
    console.error('Rate limit error:', error);

    // Em caso de erro no Redis, permitir a requisição (fail open)
    // Isso evita que problemas no KV bloqueiem o sistema inteiro
    return {
      success: true,
      remaining: limit,
    };
  }
}

/**
 * Helper para extrair IP do cliente considerando proxies
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp.trim();
  }

  return 'unknown';
}
