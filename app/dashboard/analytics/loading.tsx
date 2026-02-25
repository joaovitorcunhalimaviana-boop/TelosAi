import { Loader2, BarChart } from 'lucide-react';

/**
 * Loading Page for Analytics Route
 */
export default function AnalyticsLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0B0E14' }}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BarChart className="h-10 w-10" style={{ color: '#14BDAE' }} />
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: '#14BDAE' }} />
        </div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: '#F0EAD6' }}>
          Carregando analytics...
        </h2>
        <p className="text-sm" style={{ color: '#7A8299' }}>
          Processando dados estatísticos
        </p>
      </div>
    </div>
  );
}
