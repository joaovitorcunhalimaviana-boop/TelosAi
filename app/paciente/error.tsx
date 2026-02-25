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
    <div className="flex flex-col items-center justify-center min-h-screen p-8" style={{ backgroundColor: '#0B0E14' }}>
      <div className="max-w-md w-full border-2 border-red-900/50 rounded-lg shadow-lg p-8" style={{ backgroundColor: '#111520' }}>
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-12 w-12 text-red-500" />
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-red-400">Erro ao Carregar Paciente</h1>
          <p className="mb-4" style={{ color: '#D8DEEB' }}>
            {error.message || 'Não foi possível carregar os dados do paciente'}
          </p>

          {error.digest && (
            <p className="text-xs mb-4" style={{ color: '#7A8299' }}>
              Código: {error.digest}
            </p>
          )}

          <div className="flex flex-col gap-3 w-full">
            <Button onClick={reset} className="w-full" style={{ backgroundColor: '#0D7377', color: '#fff' }}>
              Tentar Novamente
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full"
              variant="outline"
              style={{ borderColor: '#1E2535', color: '#D8DEEB' }}
            >
              Voltar ao Dashboard
            </Button>
          </div>

          <p className="text-xs mt-6" style={{ color: '#7A8299' }}>
            Se o problema persistir, verifique se o paciente existe.
          </p>
        </div>
      </div>
    </div>
  );
}
