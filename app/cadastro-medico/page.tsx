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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const ESTADOS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
]

const registrationSchema = z.object({
  nomeCompleto: z.string().min(3, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  whatsapp: z.string().min(14, "WhatsApp inválido").regex(/^\+55 \(\d{2}\) \d{4,5}-\d{4}$/, "Formato: +55 (XX) XXXXX-XXXX"),
  crm: z.string().min(4, "CRM é obrigatório"),
  estado: z.string().min(2, "Selecione o estado"),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
  confirmarSenha: z.string(),
  aceitoTermos: z.boolean().refine(val => val === true, "Você deve aceitar os termos"),
  aceitoNovidades: z.boolean().optional(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
})

type RegistrationFormData = z.infer<typeof registrationSchema>

function CadastroMedicoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") || "professional"

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      aceitoTermos: false,
      aceitoNovidades: false,
    }
  })

  const watchEstado = watch("estado")
  const watchAceitoTermos = watch("aceitoTermos")
  const watchAceitoNovidades = watch("aceitoNovidades")
  const senha = watch("senha")

  // Format WhatsApp
  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "")

    if (numbers.length <= 2) {
      return `+55 ${numbers}`
    } else if (numbers.length <= 4) {
      return `+55 (${numbers.slice(2)})`
    } else if (numbers.length <= 6) {
      return `+55 (${numbers.slice(2, 4)}) ${numbers.slice(4)}`
    } else if (numbers.length <= 10) {
      return `+55 (${numbers.slice(2, 4)}) ${numbers.slice(4, 8)}-${numbers.slice(8)}`
    } else {
      return `+55 (${numbers.slice(2, 4)}) ${numbers.slice(4, 9)}-${numbers.slice(9, 13)}`
    }
  }

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" }

    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    if (strength <= 2) return { strength, label: "Fraca", color: "bg-red-500" }
    if (strength <= 4) return { strength, label: "Média", color: "bg-yellow-500" }
    return { strength, label: "Forte", color: "bg-green-500" }
  }

  const passwordStrength = getPasswordStrength(senha)

  const onSubmit = async (data: RegistrationFormData) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          plan,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar conta")
      }

      // Redirect to login with success message
      router.push(`/auth/login?message=Conta criada com sucesso! Faça login para continuar.&email=${encodeURIComponent(data.email)}`)
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const planInfo = {
    founding: {
      name: "Founding Members",
      price: "R$ 400",
      color: "text-telos-gold",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    professional: {
      name: "Profissional",
      price: "R$ 500",
      color: "text-telos-blue",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  }

  const selectedPlan = planInfo[plan as keyof typeof planInfo] || planInfo.professional

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F7FA]/30 to-white">
      <TelosHeader />

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Plan Badge */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center gap-2 px-6 py-3 ${plan === 'founding' ? 'bg-telos-gold' : 'bg-telos-blue'} text-white rounded-full shadow-lg mb-4`}>
              {selectedPlan.icon}
              <span className="font-bold text-lg">{selectedPlan.name}</span>
              <span className="text-lg">{selectedPlan.price}/mês</span>
            </div>
            <h1 className="text-3xl font-bold text-telos-blue mb-2">
              Cadastro de Médico
            </h1>
            <p className="text-gray-600">
              Preencha seus dados para começar a usar o Telos.AI
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nome Completo */}
              <div>
                <Label htmlFor="nomeCompleto" className="text-telos-blue font-semibold">
                  Nome Completo *
                </Label>
                <Input
                  id="nomeCompleto"
                  {...register("nomeCompleto")}
                  placeholder="Dr. João Silva"
                  className="mt-2"
                />
                {errors.nomeCompleto && (
                  <p className="text-red-500 text-sm mt-1">{errors.nomeCompleto.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-telos-blue font-semibold">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="seu@email.com"
                  className="mt-2"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <Label htmlFor="whatsapp" className="text-telos-blue font-semibold">
                  WhatsApp *
                </Label>
                <Input
                  id="whatsapp"
                  {...register("whatsapp")}
                  placeholder="+55 (11) 99999-9999"
                  className="mt-2"
                  onChange={(e) => {
                    const formatted = formatWhatsApp(e.target.value)
                    setValue("whatsapp", formatted)
                  }}
                />
                {errors.whatsapp && (
                  <p className="text-red-500 text-sm mt-1">{errors.whatsapp.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Usaremos este número para enviar questionários aos seus pacientes
                </p>
              </div>

              {/* CRM + Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="crm" className="text-telos-blue font-semibold">
                    CRM *
                  </Label>
                  <Input
                    id="crm"
                    {...register("crm")}
                    placeholder="123456"
                    className="mt-2"
                  />
                  {errors.crm && (
                    <p className="text-red-500 text-sm mt-1">{errors.crm.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="estado" className="text-telos-blue font-semibold">
                    Estado *
                  </Label>
                  <Select value={watchEstado} onValueChange={(value) => setValue("estado", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_BRASIL.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.estado && (
                    <p className="text-red-500 text-sm mt-1">{errors.estado.message}</p>
                  )}
                </div>
              </div>

              {/* Senha */}
              <div>
                <Label htmlFor="senha" className="text-telos-blue font-semibold">
                  Senha *
                </Label>
                <Input
                  id="senha"
                  type="password"
                  {...register("senha")}
                  placeholder="Mínimo 8 caracteres"
                  className="mt-2"
                />
                {senha && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all`}
                          style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{passwordStrength.label}</span>
                    </div>
                  </div>
                )}
                {errors.senha && (
                  <p className="text-red-500 text-sm mt-1">{errors.senha.message}</p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <Label htmlFor="confirmarSenha" className="text-telos-blue font-semibold">
                  Confirmar Senha *
                </Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  {...register("confirmarSenha")}
                  placeholder="Digite a senha novamente"
                  className="mt-2"
                />
                {errors.confirmarSenha && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmarSenha.message}</p>
                )}
              </div>

              {/* Checkboxes */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="aceitoTermos"
                    checked={watchAceitoTermos}
                    onCheckedChange={(checked) => setValue("aceitoTermos", checked as boolean)}
                  />
                  <Label htmlFor="aceitoTermos" className="text-sm cursor-pointer leading-relaxed">
                    Aceito os{" "}
                    <Link href="/termos" className="text-telos-blue font-semibold underline" target="_blank">
                      termos de uso
                    </Link>{" "}
                    e a{" "}
                    <Link href="/termos" className="text-telos-blue font-semibold underline" target="_blank">
                      política de privacidade
                    </Link>{" "}
                    do Telos.AI *
                  </Label>
                </div>
                {errors.aceitoTermos && (
                  <p className="text-red-500 text-sm">{errors.aceitoTermos.message}</p>
                )}

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="aceitoNovidades"
                    checked={watchAceitoNovidades}
                    onCheckedChange={(checked) => setValue("aceitoNovidades", checked as boolean)}
                  />
                  <Label htmlFor="aceitoNovidades" className="text-sm cursor-pointer leading-relaxed">
                    Aceito receber novidades e atualizações via WhatsApp e Email
                  </Label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-telos-blue hover:bg-blue-900 text-white py-6 text-lg font-bold"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Criando conta...
                  </div>
                ) : (
                  "Criar Conta e Começar"
                )}
              </Button>

              {/* Login Link */}
              <p className="text-center text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link href="/auth/login" className="text-telos-blue font-semibold hover:underline">
                  Fazer login
                </Link>
              </p>
            </form>
          </div>

          {/* Change Plan Link */}
          <div className="mt-6 text-center">
            <Link
              href="/pricing"
              className="text-sm text-gray-600 hover:text-telos-blue underline"
            >
              Quer mudar de plano? Ver todos os planos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CadastroMedicoPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#F5F7FA]/30 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-telos-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <CadastroMedicoPage />
    </Suspense>
  )
}
