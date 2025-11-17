import { NextRequest } from 'next/server';

/**
 * Extrai o IP real do cliente a partir dos headers da requisição
 * Suporta proxies e load balancers (Vercel, Cloudflare, etc)
 *
 * @param req - NextRequest object
 * @returns IP do cliente ou 'unknown' se não for possível determinar
 */
export function getClientIP(req: NextRequest): string {
  // Tenta x-forwarded-for (usado por proxies e load balancers)
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for pode conter múltiplos IPs separados por vírgula
    // O primeiro é o IP real do cliente
    return forwardedFor.split(',')[0].trim();
  }

  // Tenta x-real-ip (usado por alguns proxies como nginx)
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Tenta cf-connecting-ip (Cloudflare)
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp.trim();
  }

  // Tenta x-client-ip
  const clientIp = req.headers.get('x-client-ip');
  if (clientIp) {
    return clientIp.trim();
  }

  // Se nenhum header estiver disponível, retorna unknown
  return 'unknown';
}
