"use client"

import Link from "next/link"
import { TelosHeader } from "@/components/TelosHeader"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-telos-blue to-[#144272]">
      <TelosHeader />

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <svg className="w-8 h-8 text-telos-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-telos-blue mb-4">
              Esqueceu sua senha?
            </h1>

            <p className="text-gray-600 mb-8">
              Entre em contato com nosso suporte para redefinir sua senha.
            </p>

            <div className="space-y-4">
              <a
                href="mailto:suporte@telos.ai"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-telos-blue text-white rounded-lg font-semibold hover:bg-blue-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Enviar Email
              </a>

              <Link
                href="/auth/login"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-telos-blue border-2 border-telos-blue rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar para Login
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-blue-200">
              Responderemos em até 24 horas
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
