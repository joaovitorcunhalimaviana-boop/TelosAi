"use client";

import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOff className="w-10 h-10 text-orange-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Você está offline
          </h1>

          <p className="text-gray-600 mb-6">
            Não há conexão com a internet no momento. Alguns recursos podem não estar disponíveis.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h2 className="text-sm font-semibold text-blue-900 mb-2">
              O que você ainda pode fazer:
            </h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Cadastrar novos pacientes (serão salvos localmente)</li>
              <li>✓ Visualizar páginas já carregadas</li>
              <li>✓ Acessar informações em cache</li>
            </ul>
          </div>

          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>

          <p className="text-xs text-gray-500 mt-4">
            Quando a conexão for restaurada, seus dados pendentes serão sincronizados automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
