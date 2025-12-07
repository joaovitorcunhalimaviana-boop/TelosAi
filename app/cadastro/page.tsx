"use client"

import { useRouter } from "next/navigation"
import { CadastroPacienteSimplificado } from "@/components/CadastroPacienteSimplificado"
import { createSimplifiedPatient } from "./actions"
import { TelosHeader } from "@/components/TelosHeader"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { motion } from "framer-motion"

// Tipo para os dados do formulário simplificado
interface SimplifiedPatientData {
  name: string
  dateOfBirth?: string
  phone: string
  email?: string
  surgeryType: string
  surgeryDate: string
  notes?: string
  age?: number
  hospital?: string
}

export default function CadastroPage() {
  const router = useRouter()

  const handleSimplifiedSubmit = async (data: SimplifiedPatientData) => {
    try {
      const result = await createSimplifiedPatient(data)

      if (result.success) {
        toast.success("Paciente cadastrado com sucesso!", {
          description: "Acompanhamento ativado."
        })

        // Redireciona para o dashboard com mensagem de sucesso
        router.push(
          `/dashboard?success=true&message=${encodeURIComponent(
            result.message || 'Paciente cadastrado com sucesso'
          )}`
        )
      } else {
        toast.error("Erro ao cadastrar", {
          description: result.error || 'Erro desconhecido'
        })
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro inesperado", {
        description: "Não foi possível completar o cadastro."
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <TelosHeader />

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header Section with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0A2647]/5 border border-[#0A2647]/10 rounded-full mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-telos-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-telos-gold"></span>
            </span>
            <span className="text-xs font-semibold text-[#0A2647] tracking-wide uppercase">
              Concierge Digital
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-[#0A2647] tracking-tight">
            Novo Paciente
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto font-light">
            Inicie o acompanhamento automatizado em menos de 1 minuto.
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="shadow-xl shadow-gray-200/50 border-0 overflow-hidden ring-1 ring-gray-100">
            <CardHeader className="bg-white border-b border-gray-100 pb-6 pt-8 px-8">
              <CardTitle className="text-xl text-[#0A2647] font-semibold flex items-center gap-2">
                Dados Essenciais
              </CardTitle>
              <CardDescription className="text-gray-500 text-sm">
                A IA cuidará do resto. Preencha apenas o básico agora.
              </CardDescription>
            </CardHeader>

            <CardContent className="bg-white p-8">
              <CadastroPacienteSimplificado onSubmit={handleSimplifiedSubmit} />
            </CardContent>
          </Card>

          {/* Additional Info Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center"
          >
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="text-2xl mb-1">🤖</div>
              <h3 className="font-semibold text-[#0A2647] text-sm">Cadastro Instantâneo</h3>
              <p className="text-xs text-gray-500 mt-1">Dados básicos ativam o sistema imediatamente</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="text-2xl mb-1">📅</div>
              <h3 className="font-semibold text-[#0A2647] text-sm">Agenda Automática</h3>
              <p className="text-xs text-gray-500 mt-1">7 follow-ups agendados automaticamente</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="text-2xl mb-1">🔍</div>
              <h3 className="font-semibold text-[#0A2647] text-sm">Monitoramento 24/7</h3>
              <p className="text-xs text-gray-500 mt-1">Red flags detectados pela IA em tempo real</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
