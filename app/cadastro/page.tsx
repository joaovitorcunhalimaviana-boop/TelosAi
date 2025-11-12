"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { QuickPatientForm } from "@/components/QuickPatientForm"
import { PostRegistrationModal } from "@/components/PostRegistrationModal"
import { createQuickPatient } from "./actions"
import { PrivateLayout } from "@/components/PrivateLayout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Types
interface PatientData {
  id: string
  name: string
}

export default function CadastroPage() {
  const router = useRouter()
  const { data: session } = useSession()

  // State for modal control
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [patientData, setPatientData] = useState<PatientData | null>(null)

  const handleSubmit = async (data: {
    name: string
    phone: string
    surgeryType: "hemorroidectomia" | "fistula" | "fissura" | "pilonidal"
    surgeryDate: string
  }) => {
    // Get userId from session
    if (!session?.user?.id) {
      alert('Erro: Usuário não autenticado')
      return
    }

    // Call the Server Action
    const result = await createQuickPatient({
      ...data,
      userId: session.user.id
    })

    if (result.success && result.patientId) {
      // Store patient data and open modal
      setPatientData({
        id: result.patientId,
        name: data.name,
      })
      setIsModalOpen(true)
    } else {
      // Show error
      alert(result.error || 'Erro ao cadastrar paciente')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    // Redirect to dashboard after modal closes
    router.push('/dashboard')
  }

  const handleAssignSuccess = () => {
    // Optional callback when patient is assigned to research
    // Can be used for additional tracking or analytics
    console.log('Patient successfully assigned to research')
  }

  return (
    <PrivateLayout>
      <div className="w-full">
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
              Cadastro Express com IA
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-telos-blue mb-3">
            Cadastro Express
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ative o acompanhamento pós-operatório em{" "}
            <span className="text-telos-gold font-semibold">30 segundos</span>
          </p>
        </div>

        {/* Card principal centralizado */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-2 border-gray-100">
            <CardHeader className="border-b bg-gradient-to-r from-[#F5F7FA] to-white">
              <CardTitle className="text-2xl text-telos-blue">Dados do Paciente</CardTitle>
              <CardDescription className="text-base text-gray-600">
                Preencha os dados essenciais para iniciar o acompanhamento automatizado
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <QuickPatientForm onSubmit={handleSubmit} />
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
                  <span>Paciente é cadastrado no sistema com 20% de completude de dados</span>
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
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              Você poderá completar os dados restantes (80%) posteriormente no dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Post Registration Modal */}
      {patientData && (
        <PostRegistrationModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          patientId={patientData.id}
          patientName={patientData.name}
          onAssignSuccess={handleAssignSuccess}
        />
      )}
    </PrivateLayout>
  )
}
