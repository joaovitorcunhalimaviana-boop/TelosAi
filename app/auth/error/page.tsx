"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { VigiaHeader } from "@/components/VigiaHeader";
import { Button } from "@/components/ui/button";

function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "Erro de configuração do servidor. Contate o suporte.",
    AccessDenied: "Acesso negado. Você não tem permissão.",
    Verification: "Token de verificação inválido ou expirado.",
    Default: "Ocorreu um erro durante a autenticação.",
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-telos-blue to-[#144272]">
      <VigiaHeader />

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-baseline gap-0.5 mb-6">
              <span className="telos-brand text-5xl font-bold text-white">Vig</span>
              <span className="telos-ai text-5xl text-telos-gold">IA</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Erro de Autenticação
              </h1>
              <p className="text-gray-600">{errorMessage}</p>
            </div>

            <div className="space-y-4">
              <Link href="/auth/login">
                <Button className="w-full">
                  Voltar para Login
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Ir para Página Inicial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-telos-blue to-[#144272] flex items-center justify-center"><div className="text-white">Carregando...</div></div>}>
      <AuthErrorPage />
    </Suspense>
  );
}
