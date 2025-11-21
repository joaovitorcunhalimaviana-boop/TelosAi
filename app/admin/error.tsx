'use client';

import { useEffect } from 'react';
import { AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

/**
 * Error Page for Admin Route
 *
 * Handles errors in /admin and its nested routes.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Admin panel error:', error);

    if (typeof window !== 'undefined') {
      try {
        import('@sentry/nextjs').then((Sentry) => {
          Sentry.captureException(error, {
            tags: {
              route: 'admin',
              digest: error.digest
            }
          });
        }).catch(() => {});
      } catch {}
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-md w-full bg-white border-2 border-orange-200 rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-12 w-12 text-orange-500" />
            <AlertTriangle className="h-12 w-12 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-orange-900">Erro no Painel Admin</h1>
          <p className="text-gray-600 mb-4">
            {error.message || 'Ocorreu um erro ao carregar o painel administrativo'}
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
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1"
              variant="outline"
            >
              Voltar ao Dashboard
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Se o problema persistir, contate o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
