/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { VigiaHeader } from "@/components/VigiaHeader"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isValidatingToken, setIsValidatingToken] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("Token inválido ou expirado")
      setIsValidatingToken(false)
      return
    }

    // Valida token
    async function validateToken() {
      try {
        const response = await fetch(`/api/auth/validate-reset-token?token=${token}`)
        const data = await response.json()

        if (!response.ok || !data.valid) {
          setError("Token inválido ou expirado")
          setTokenValid(false)
        } else {
          setTokenValid(true)
        }
      } catch (err) {
        setError("Erro ao validar token")
        setTokenValid(false)
      } finally {
        setIsValidatingToken(false)
      }
    }

    validateToken()
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao redefinir senha")
      }

      setSuccess(true)

      // Redireciona para login após 3 segundos
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Erro ao redefinir senha")
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidatingToken) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0B0E14' }}>
        <VigiaHeader />
        <div className="container mx-auto px-6 py-16 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl p-12 text-center" style={{ backgroundColor: '#111520', border: '1px solid #1E2535' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0D7377' }}></div>
            <p style={{ color: '#7A8299' }}>Validando token...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0B0E14' }}>
        <VigiaHeader />
        <div className="container mx-auto px-6 py-16 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl p-8" style={{ backgroundColor: '#111520', border: '1px solid #1E2535' }}>
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(220, 38, 38, 0.15)' }}>
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#F0EAD6' }}>Link Inválido ou Expirado</h2>
              <p style={{ color: '#7A8299' }}>
                Este link de recuperação de senha é inválido ou já foi utilizado.
              </p>
            </div>

            <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button asChild className="w-full font-bold" style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}>
                <Link href="/auth/forgot-password">Solicitar Novo Link</Link>
              </Button>
              <Button asChild variant="outline" className="w-full font-semibold" style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}>
                <Link href="/auth/login">Voltar para Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0B0E14' }}>
        <VigiaHeader />
        <div className="container mx-auto px-6 py-16 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl p-8" style={{ backgroundColor: '#111520', border: '1px solid #1E2535' }}>
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(13, 115, 119, 0.2)' }}>
                <CheckCircle className="h-8 w-8" style={{ color: '#14BDAE' }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#F0EAD6' }}>Senha Redefinida!</h2>
              <p style={{ color: '#7A8299' }}>
                Sua senha foi alterada com sucesso. Você será redirecionado para o login.
              </p>
            </div>
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full font-bold"
              style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}
            >
              Ir para Login
            </Button>
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
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#F0EAD6' }}>Criar Nova Senha</h2>
            <p style={{ color: '#7A8299' }}>Digite sua nova senha abaixo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium" style={{ color: '#7A8299' }}>
                Nova Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoFocus
                  disabled={isLoading}
                  className="focus:ring-[#0D7377] focus:border-[#0D7377]"
                  style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#7A8299' }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium" style={{ color: '#7A8299' }}>
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="focus:ring-[#0D7377] focus:border-[#0D7377]"
                  style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#7A8299' }}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="rounded-lg p-3" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
              <p className="text-sm font-medium mb-1" style={{ color: '#D8DEEB' }}>Requisitos da senha:</p>
              <ul className="text-xs space-y-1" style={{ color: '#7A8299' }}>
                <li className={password.length >= 8 ? "text-[#14BDAE]" : ""}>
                  - Mínimo de 8 caracteres
                </li>
                <li className={password === confirmPassword && password !== "" ? "text-[#14BDAE]" : ""}>
                  - Senhas devem coincidir
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full font-bold"
              disabled={isLoading}
              style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}
            >
              {isLoading ? "Redefinindo..." : "Redefinir Senha"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B0E14' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#0D7377' }}></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
