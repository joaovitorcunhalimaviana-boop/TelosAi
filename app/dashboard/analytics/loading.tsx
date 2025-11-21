import { Loader2, BarChart } from 'lucide-react';

/**
 * Loading Page for Analytics Route
 */
export default function AnalyticsLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BarChart className="h-10 w-10 text-blue-500" />
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Carregando analytics...
        </h2>
        <p className="text-sm text-gray-500">
          Processando dados estatísticos
        </p>
      </div>
    </div>
  );
}
