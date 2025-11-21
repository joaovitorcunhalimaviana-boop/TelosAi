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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="max-w-md w-full bg-white border-2 border-red-200 rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-red-900">Erro no Dashboard</h1>
          <p className="text-gray-600 mb-4">
            {error.message || 'Ocorreu um erro ao carregar o dashboard'}
          </p>

          {error.digest && (
            <p className="text-xs text-gray-500 mb-4">
              Código do erro: {error.digest}
            </p>
          )}

          <div className="flex gap-3 w-full">
            <Button
              onClick={reset}
              className="flex-1"
              variant="default"
            >
              Tentar Novamente
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              className="flex-1"
              variant="outline"
            >
              Voltar ao Início
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Se o problema persistir, entre em contato com o suporte.
          </p>
        </div>
      </div>
    </div>
  );
}
