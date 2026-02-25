'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

/**
 * Error Page for Dashboard Route
 *
 * Next.js convention: error.tsx handles errors in route segments.
 * This specific error page catches errors in /dashboard and its nested routes.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to centralized logger
    logger.error('Dashboard error:', error);

    // Report to Sentry if available
    if (typeof window !== 'undefined') {
      try {
        import('@sentry/nextjs').then((Sentry) => {
          Sentry.captureException(error, {
            tags: {
              route: 'dashboard',
              digest: error.digest
            }
          });
        }).catch(() => {
          // Silently fail if Sentry not available
        });
      } catch {
        // Ignore Sentry errors
      }
    }
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-8"
      style={{ background: 'linear-gradient(135deg, #0B0E14, #111520, #0B0E14)' }}
    >
      <div
        className="max-w-md w-full rounded-lg shadow-lg p-8"
        style={{ backgroundColor: '#161B27', border: '2px solid #C0392B' }}
      >
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="h-16 w-16 mb-4" style={{ color: '#C0392B' }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#C0392B' }}>Erro no Dashboard</h1>
          <p className="mb-4" style={{ color: '#D8DEEB' }}>
            {error.message || 'Ocorreu um erro ao carregar o dashboard'}
          </p>

          {error.digest && (
            <p className="text-xs mb-4" style={{ color: '#7A8299' }}>
              Código do erro: {error.digest}
            </p>
          )}

          <div className="flex gap-3 w-full">
            <Button
              onClick={reset}
              className="flex-1"
              style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}
            >
              Tentar Novamente
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              className="flex-1"
              variant="outline"
              style={{ borderColor: '#2A3147', color: '#D8DEEB' }}
            >
              Voltar ao Início
            </Button>
          </div>

          <p className="text-xs mt-6" style={{ color: '#7A8299' }}>
            Se o problema persistir, entre em contato com o suporte.
          </p>
        </div>
      </div>
    </div>
  );
}
