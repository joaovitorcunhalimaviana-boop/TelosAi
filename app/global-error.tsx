'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Global Error Handler
 *
 * Next.js convention: global-error.tsx handles errors in the root layout.
 * This is the last line of defense for unhandled errors.
 * Must define its own <html> and <body> tags.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console
    console.error('Global error:', error);

    // Report to Sentry if available
    if (typeof window !== 'undefined') {
      try {
        import('@sentry/nextjs').then((Sentry) => {
          Sentry.captureException(error, {
            tags: {
              location: 'global-error',
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
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-red-50 via-white to-red-50">
          <div className="max-w-md w-full bg-white border-2 border-red-300 rounded-lg shadow-xl p-8">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="h-20 w-20 text-red-600 mb-4" />
              <h1 className="text-3xl font-bold mb-2 text-red-900">Erro Fatal</h1>
              <p className="text-gray-700 mb-4 text-lg">
                {error.message || 'Ocorreu um erro inesperado no sistema'}
              </p>

              {error.digest && (
                <p className="text-xs text-gray-500 mb-6 bg-gray-100 px-3 py-2 rounded">
                  Código de erro: {error.digest}
                </p>
              )}

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={reset}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Tentar Novamente
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Voltar à Página Inicial
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-8">
                Se o problema persistir, entre em contato com o suporte técnico.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
