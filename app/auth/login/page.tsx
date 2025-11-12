"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { TelosHeader } from "@/components/TelosHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")
  const email = searchParams.get("email")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: email || "",
    }
  })

  useEffect(() => {
    if (message) {
      setSuccessMessage(message)
    }
  }, [message])

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      const { signIn } = await import("next-auth/react")

      const result = await signIn("credentials", {
        email: data.email,
        password: data.senha,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (result?.ok) {
        // Redirecionar para dashboard ou onboarding
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login. Verifique suas credenciais.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-telos-blue to-[#144272]">
      <TelosHeader />

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-baseline gap-0.5 mb-6">
              <span className="telos-brand text-5xl text-white">Telos</span>
              <span className="telos-ai text-5xl text-telos-gold">.AI</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Bem-vindo de volta
            </h1>
            <p className="text-blue-200">
              Faça login para acessar sua conta
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-700 text-sm">{successMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-telos-blue font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="seu@email.com"
                  className="mt-2"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Senha */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="senha" className="text-telos-blue font-semibold">
                    Senha
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-telos-blue hover:text-telos-gold font-medium underline"
                  >
                    Esqueceu?
                  </Link>
                </div>
                <Input
                  id="senha"
                  type="password"
                  {...register("senha")}
                  placeholder="Sua senha"
                  className="mt-2"
                  autoComplete="current-password"
                />
                {errors.senha && (
                  <p className="text-red-500 text-sm mt-1">{errors.senha.message}</p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-telos-blue hover:bg-blue-900 text-white py-6 text-lg font-bold shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Entrando...
                  </div>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Ainda não tem conta?</span>
              </div>
            </div>

            {/* Sign Up Links */}
            <div className="space-y-3">
              <Link
                href="/cadastro-medico?plan=founding"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-telos-gold text-white rounded-lg font-bold hover-lift transition-smooth shadow-md"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Criar conta - Founding Members
              </Link>
              <Link
                href="/cadastro-medico?plan=professional"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-telos-blue border-2 border-telos-blue rounded-lg font-bold hover:bg-blue-50 transition-smooth"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Criar conta - Profissional
              </Link>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-blue-200 hover:text-white underline"
            >
              ← Voltar para página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-telos-blue to-[#144272] flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
