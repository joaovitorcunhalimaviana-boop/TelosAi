import { Loader2, Shield } from 'lucide-react';

/**
 * Loading Page for Admin Route
 */
export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="h-10 w-10 text-orange-500" />
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Carregando painel administrativo...
        </h2>
        <p className="text-sm text-gray-500">
          Aguarde enquanto carregamos os dados do sistema
        </p>
      </div>
    </div>
  );
}
