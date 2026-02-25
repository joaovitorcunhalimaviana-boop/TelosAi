"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  // Nome do médico vem da sessão de autenticação
  const doctorName = session?.user?.name || "Doutor(a)"

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      finishOnboarding()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTour = () => {
    finishOnboarding()
  }

  const finishOnboarding = () => {
    // Mark onboarding as completed in backend/session
    router.push("/dashboard")
  }

  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-telos-blue to-blue-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-200">
              Passo {currentStep} de {totalSteps}
            </span>
            <button
              onClick={skipTour}
              className="text-sm text-blue-200 hover:text-white underline"
            >
              Pular tour
            </button>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-blue-800" />
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="p-12 text-center space-y-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-telos-blue rounded-full mb-4">
                <svg className="w-12 h-12 text-telos-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>

              <div>
                <h1 className="text-4xl font-bold text-telos-blue mb-4">
                  Bem-vindo ao VigIA, {doctorName}!
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Estamos felizes em tê-lo conosco. Vamos fazer um tour rápido
                  para você começar a usar a plataforma.
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 pt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5 text-telos-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-telos-blue">
                    Apenas 2 minutos
                  </span>
                </div>
              </div>

              <div className="pt-8">
                <Button
                  onClick={nextStep}
                  className="px-10 py-6 bg-telos-blue hover:bg-blue-900 text-white text-lg font-bold rounded-xl"
                >
                  Começar Tour
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: WhatsApp Connection */}
          {currentStep === 2 && (
            <div className="p-12">
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-telos-blue mb-4">
                    Conecte seu WhatsApp
                  </h2>
                  <p className="text-lg text-gray-600">
                    Para enviar questionários automáticos aos seus pacientes,
                    conecte seu número de WhatsApp
                  </p>
                </div>

                {/* Twilio Embedded Signup Placeholder */}
                <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-2xl p-8">
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-600 text-white rounded-full font-semibold">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Powered by Twilio
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3 text-left">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Configuração em 1 clique</span>
                      </div>
                      <div className="flex items-start gap-3 text-left">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">100% seguro e conforme LGPD</span>
                      </div>
                      <div className="flex items-start gap-3 text-left">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Seu número permanece privado</span>
                      </div>
                    </div>

                    {/* Placeholder for Twilio Embedded Signup */}
                    <div className="p-6 bg-white border-2 border-dashed border-green-300 rounded-xl">
                      <p className="text-sm text-gray-500 mb-4">
                        [Twilio Embedded Signup será integrado aqui]
                      </p>
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        Conectar WhatsApp
                      </Button>
                    </div>

                    <p className="text-xs text-gray-500">
                      Você pode configurar isso mais tarde nas configurações
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Dashboard Tour */}
          {currentStep === 3 && (
            <div className="p-12">
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                    <svg className="w-10 h-10 text-telos-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-telos-blue mb-4">
                    Tour Rápido do Dashboard
                  </h2>
                  <p className="text-lg text-gray-600">
                    Conheça as principais funcionalidades da plataforma
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
                      title: "Cadastro Express",
                      description: "Adicione pacientes em segundos"
                    },
                    {
                      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                      title: "Dashboard",
                      description: "Visão geral dos pacientes"
                    },
                    {
                      icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
                      title: "Alertas",
                      description: "Red flags detectados pela IA"
                    },
                    {
                      icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
                      title: "Exportação",
                      description: "Dados para pesquisa (LGPD)"
                    }
                  ].map((feature, idx) => (
                    <div key={idx} className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-xl hover:border-telos-blue transition-colors">
                      <div className="w-12 h-12 bg-telos-blue rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                        </svg>
                      </div>
                      <h3 className="font-bold text-telos-blue mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-gradient-to-r from-telos-blue to-blue-900 text-white rounded-xl">
                  <div className="flex items-start gap-4">
                    <svg className="w-8 h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Análise com IA</h3>
                      <p className="text-blue-100 text-sm">
                        Nossa Inteligência Artificial analisa todas as respostas dos pacientes em tempo real,
                        detectando red flags e fornecendo insights valiosos
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: First Patient CTA */}
          {currentStep === 4 && (
            <div className="p-12 text-center space-y-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-telos-gold rounded-full mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>

              <div>
                <h1 className="text-4xl font-bold text-telos-blue mb-4">
                  Tudo Pronto!
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                  Você está pronto para começar a usar o VigIA.
                  Que tal cadastrar seu primeiro paciente?
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-2xl p-8 max-w-md mx-auto">
                <h3 className="font-bold text-telos-blue text-lg mb-4">
                  Próximos passos:
                </h3>
                <div className="space-y-3 text-left">
                  {[
                    "Cadastrar seu primeiro paciente",
                    "Sistema enviará questionários automáticos",
                    "IA analisará as respostas",
                    "Você receberá alertas se necessário"
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-telos-blue text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        {idx + 1}
                      </div>
                      <span className="text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Link href="/cadastro">
                  <Button className="px-10 py-6 bg-telos-blue hover:bg-blue-900 text-white text-lg font-bold rounded-xl">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Cadastrar Primeiro Paciente
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="px-10 py-6 text-lg font-bold rounded-xl border-2 border-telos-blue text-telos-blue hover:bg-blue-50">
                    Ir para Dashboard
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep !== 4 && (
            <div className="border-t border-gray-200 p-6 flex items-center justify-between">
              <Button
                onClick={prevStep}
                variant="outline"
                disabled={currentStep === 1}
                className="px-6 py-3"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </Button>

              <div className="flex gap-2">
                {[...Array(totalSteps)].map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx + 1 === currentStep
                        ? "bg-telos-blue w-8"
                        : idx + 1 < currentStep
                        ? "bg-telos-gold"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={nextStep}
                className="px-6 py-3 bg-telos-blue hover:bg-blue-900 text-white"
              >
                {currentStep === totalSteps - 1 ? "Finalizar" : "Próximo"}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
