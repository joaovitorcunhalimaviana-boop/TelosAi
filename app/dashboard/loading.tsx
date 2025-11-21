import { Loader2 } from 'lucide-react';

/**
 * Loading Page for Dashboard Route
 *
 * Next.js convention: loading.tsx shows loading UI while route is being loaded.
 * Supports React Suspense boundaries.
 */
export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F5F7FA] via-white to-[#F5F7FA] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Carregando dashboard...
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aguarde enquanto carregamos seus dados
        </p>
      </div>
    </div>
  );
}
