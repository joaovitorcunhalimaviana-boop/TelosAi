"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { CadastroPacienteSimplificado } from "@/components/CadastroPacienteSimplificado"
import { CadastroPacienteCompleto } from "@/components/CadastroPacienteCompleto"
import { createSimplifiedPatient, createCompletePatient } from "./actions-dual"
import { TelosHeader } from "@/components/TelosHeader"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Tipos para os dados dos formulários
interface SimplifiedPatientData {
  name: string
  dateOfBirth: string
  phone: string
  email?: string
  surgeryType: "hemorroidectomia" | "fistula" | "fissura" | "pilonidal"
  surgeryDate: string
  notes?: string
  age: number
}

interface CompletePatientData extends SimplifiedPatientData {
  sex: "Masculino" | "Feminino" | "Outro"
  cpf?: string
  hospital?: string
}

export default function CadastroPageDual() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false) // TODO: Substituir por session real

  // Toggle temporário para testar (remover quando autenticação estiver implementada)
  const toggleMode = () => setIsAdmin(!isAdmin)

  const handleSimplifiedSubmit = async (data: SimplifiedPatientData) => {
    const result = await createSimplifiedPatient(data)

    if (result.success) {
      router.push(
        `/dashboard?success=true&message=${encodeURIComponent(result.message || 'Paciente cadastrado com sucesso')}`
      )
    } else {
      alert(result.error || 'Erro ao cadastrar paciente')
    }
  }

  const handleCompleteSubmit = async (data: CompletePatientData) => {
    const result = await createCompletePatient(data)

    if (result.success) {
      router.push(
        `/dashboard?success=true&message=${encodeURIComponent(result.message || 'Paciente cadastrado com sucesso')}`
      )
    } else {
      alert(result.error || 'Erro ao cadastrar paciente')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <TelosHeader />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-4">
            <svg
              className="w-4 h-4 text-telos-gold"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-telos-blue">
              {isAdmin ? "Cadastro Completo com IA" : "Cadastro Express com IA"}
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-telos-blue mb-3">
            {isAdmin ? "Cadastro Completo" : "Cadastro Express"}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isAdmin
              ? "Cadastro completo com todos os campos para pesquisa científica"
              : "Ative o acompanhamento pós-operatório em 30 segundos"}
          </p>

          {/* Toggle temporário para desenvolvimento */}
          <button
            onClick={toggleMode}
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
          >
            [DEV] Alternar para {isAdmin ? "Simplificado" : "Completo"}
          </button>
        </div>

        {/* Card principal centralizado */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-2 border-gray-100">
            <CardHeader className="border-b bg-gradient-to-r from-[#F5F7FA] to-white">
              <CardTitle className="text-2xl text-telos-blue">Dados do Paciente</CardTitle>
              <CardDescription className="text-base text-gray-600">
                {isAdmin
                  ? "Preencha todos os dados do paciente, incluindo informações para pesquisa"
                  : "Preencha os dados essenciais para iniciar o acompanhamento automatizado"}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {isAdmin ? (
                <CadastroPacienteCompleto onSubmit={handleCompleteSubmit} />
              ) : (
                <CadastroPacienteSimplificado onSubmit={handleSimplifiedSubmit} />
              )}
            </CardContent>
          </Card>

          {/* Informações adicionais */}
          <div className="mt-8 text-center space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                O que acontece após o cadastro?
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 text-left max-w-lg mx-auto">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                  <span>
                    Paciente é cadastrado no sistema
                    {isAdmin ? " com dados completos" : " com 20% de completude de dados"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                  <span>7 follow-ups automáticos são agendados (D+1, D+2, D+3, D+5, D+7, D+10, D+14)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                  <span>WhatsApp será usado para enviar questionários e receber respostas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                  <span>IA analisa as respostas e alerta sobre red flags</span>
                </li>
                {!isAdmin && (
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                    <span>Você poderá completar os dados restantes (80%) posteriormente no dashboard</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
