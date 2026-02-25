import { Loader2 } from 'lucide-react';

/**
 * Loading Page for Dashboard Route
 *
 * Next.js convention: loading.tsx shows loading UI while route is being loaded.
 * Supports React Suspense boundaries.
 */
export default function DashboardLoading() {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: 'linear-gradient(135deg, #0B0E14, #111520, #0B0E14)' }}
    >
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: '#14BDAE' }} />
        <h2 className="text-xl font-semibold mb-2" style={{ color: '#D8DEEB' }}>
          Carregando dashboard...
        </h2>
        <p className="text-sm" style={{ color: '#7A8299' }}>
          Aguarde enquanto carregamos seus dados
        </p>
      </div>
    </div>
  );
}
