'use client';

import { useEffect } from 'react';
import { AlertTriangle, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

/**
 * Error Page for Analytics Route
 */
export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Analytics error:', error);

    if (typeof window !== 'undefined') {
      try {
        import('@sentry/nextjs').then((Sentry) => {
          Sentry.captureException(error, {
            tags: {
              route: 'analytics',
              digest: error.digest
            }
          });
        }).catch(() => {});
      } catch {}
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full bg-white border-2 border-blue-200 rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <BarChart className="h-12 w-12 text-blue-500" />
            <AlertTriangle className="h-12 w-12 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-blue-900">Erro em Analytics</h1>
          <p className="text-gray-600 mb-4">
            {error.message || 'Não foi possível carregar os dados analíticos'}
          </p>

          {error.digest && (
            <p className="text-xs text-gray-500 mb-4">
              Código: {error.digest}
            </p>
          )}

          <div className="flex gap-3 w-full">
            <Button onClick={reset} className="flex-1">
              Tentar Novamente
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1"
              variant="outline"
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
