/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { VigiaHeader } from "@/components/VigiaHeader"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar email")
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Erro ao enviar email de recuperacao")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0B0E14' }}>
        <VigiaHeader />
        <div className="container mx-auto px-6 py-16 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl p-8" style={{ backgroundColor: '#111520', border: '1px solid #1E2535' }}>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(13, 115, 119, 0.2)' }}>
                <CheckCircle className="h-8 w-8" style={{ color: '#14BDAE' }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#F0EAD6' }}>Email Enviado!</h2>
              <p className="mb-6" style={{ color: '#7A8299' }}>
                Enviamos instrucoes de recuperacao de senha para <strong style={{ color: '#D8DEEB' }}>{email}</strong>
              </p>
            </div>
            <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#14BDAE' }} />
                <p className="text-sm" style={{ color: '#D8DEEB' }}>
                  Verifique sua caixa de entrada e tambem a pasta de spam. O link expira em 1 hora.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full font-bold"
                style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}
              >
                Voltar para Login
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(false)
                  setEmail("")
                }}
                className="w-full font-semibold"
                style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}
              >
                Enviar para outro email
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0E14' }}>
      <VigiaHeader />
      <div className="container mx-auto px-6 py-16 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl p-8" style={{ backgroundColor: '#111520', border: '1px solid #1E2535' }}>
          <div className="mb-6">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm mb-4 transition-colors"
              style={{ color: '#14BDAE' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#C9A84C'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#14BDAE'}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para login
            </Link>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#F0EAD6' }}>Esqueceu sua senha?</h2>
            <p style={{ color: '#7A8299' }}>
              Digite seu email e enviaremos instrucoes para recuperar sua senha
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium" style={{ color: '#7A8299' }}>
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={isLoading}
                className="focus:ring-[#0D7377] focus:border-[#0D7377]"
                style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}
              />
            </div>

            <Button
              type="submit"
              className="w-full font-bold"
              disabled={isLoading}
              style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}
            >
              {isLoading ? "Enviando..." : "Enviar Link de Recuperacao"}
            </Button>

            <div className="text-center text-sm" style={{ color: '#7A8299' }}>
              Lembrou sua senha?{" "}
              <Link
                href="/auth/login"
                className="underline transition-colors"
                style={{ color: '#14BDAE' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#C9A84C'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#14BDAE'}
              >
                Fazer login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
