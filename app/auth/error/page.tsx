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
    Configuration: "Erro de configuracao do servidor. Contate o suporte.",
    AccessDenied: "Acesso negado. Voce nao tem permissao.",
    Verification: "Token de verificacao invalido ou expirado.",
    Default: "Ocorreu um erro durante a autenticacao.",
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0E14' }}>
      <VigiaHeader />

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-baseline gap-0.5 mb-6">
              <span className="text-5xl font-bold" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#F0EAD6' }}>Vig</span>
              <span className="text-5xl italic" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#14BDAE' }}>IA</span>
            </div>
          </div>

          <div className="rounded-xl shadow-2xl p-8" style={{ backgroundColor: '#111520', border: '1px solid #1E2535' }}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(220, 38, 38, 0.15)' }}>
                <svg
                  className="w-8 h-8 text-red-400"
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
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#F0EAD6' }}>
                Erro de Autenticacao
              </h1>
              <p style={{ color: '#7A8299' }}>{errorMessage}</p>
            </div>

            <div className="space-y-4">
              <Link href="/auth/login">
                <Button
                  className="w-full font-bold"
                  style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}
                >
                  Voltar para Login
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full font-semibold"
                  style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}
                >
                  Ir para Pagina Inicial
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B0E14' }}><div style={{ color: '#F0EAD6' }}>Carregando...</div></div>}>
      <AuthErrorPage />
    </Suspense>
  );
}
