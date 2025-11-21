'use client';

import { useEffect } from 'react';
import { AlertTriangle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

/**
 * Error Page for Patient Details/Edit Route
 */
export default function PatientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Patient page error:', error);

    if (typeof window !== 'undefined') {
      try {
        import('@sentry/nextjs').then((Sentry) => {
          Sentry.captureException(error, {
            tags: {
              route: 'paciente',
              digest: error.digest
            }
          });
        }).catch(() => {});
      } catch {}
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full bg-white border-2 border-red-200 rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-12 w-12 text-red-500" />
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-red-900">Erro ao Carregar Paciente</h1>
          <p className="text-gray-600 mb-4">
            {error.message || 'Não foi possível carregar os dados do paciente'}
          </p>

          {error.digest && (
            <p className="text-xs text-gray-500 mb-4">
              Código: {error.digest}
            </p>
          )}

          <div className="flex flex-col gap-3 w-full">
            <Button onClick={reset} className="w-full">
              Tentar Novamente
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full"
              variant="outline"
            >
              Voltar ao Dashboard
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Se o problema persistir, verifique se o paciente existe.
          </p>
        </div>
      </div>
    </div>
  );
}
