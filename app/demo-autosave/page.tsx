"use client"

import { useState } from "react"
import { MultiStepWizardWithAutoSave } from "@/components/MultiStepWizardWithAutoSave"
import { QuickPatientFormWithAutoSave } from "@/components/QuickPatientFormWithAutoSave"
import { PrivateLayout } from "@/components/PrivateLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Save, RefreshCw, Zap } from "lucide-react"

export default function AutoSaveDemoPage() {
  const [quickFormResult, setQuickFormResult] = useState<any>(null)
  const [wizardResult, setWizardResult] = useState<any>(null)

  const handleQuickFormSubmit = async (data: any) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setQuickFormResult(data)
    console.log("Quick Form Data:", data)
  }

  const handleWizardComplete = async (data: any) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setWizardResult(data)
    console.log("Wizard Data:", data)
  }

  return (
    <PrivateLayout>
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-4">
            <Save className="w-4 h-4 text-telos-blue" />
            <span className="text-sm font-medium text-telos-blue">
              Sistema de Auto-Save
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-telos-blue mb-3">
            Demonstração de Auto-Save
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Sistema completo de salvamento automático para formulários e wizards.
            Nunca perca seus dados novamente!
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {[
            {
              icon: <Zap className="w-6 h-6 text-yellow-600" />,
              title: "Auto-Save Inteligente",
              description: "Salva automaticamente a cada 2 segundos",
            },
            {
              icon: <Save className="w-6 h-6 text-blue-600" />,
              title: "Save on Blur",
              description: "Salva ao sair de cada campo",
            },
            {
              icon: <RefreshCw className="w-6 h-6 text-green-600" />,
              title: "Recuperação Automática",
              description: "Recupera dados ao recarregar a página",
            },
            {
              icon: <CheckCircle2 className="w-6 h-6 text-purple-600" />,
              title: "Feedback Visual",
              description: "Indicador de status em tempo real",
            },
          ].map((feature, idx) => (
            <Card key={idx} className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-sm mb-2">{feature.title}</h3>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Tabs */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="quick" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="quick" className="gap-2">
                <Badge variant="secondary">Simples</Badge>
                Formulário Rápido
              </TabsTrigger>
              <TabsTrigger value="wizard" className="gap-2">
                <Badge variant="secondary">Avançado</Badge>
                Wizard Multi-Step
              </TabsTrigger>
            </TabsList>

            {/* Quick Form Demo */}
            <TabsContent value="quick" className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100">
                <CardHeader>
                  <CardTitle className="text-xl text-telos-blue">
                    Formulário Rápido com Auto-Save
                  </CardTitle>
                  <CardDescription>
                    Demonstração de auto-save em um formulário simples de cadastro de paciente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-sm text-telos-blue mb-3">
                        Como testar:
                      </h4>
                      <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                        <li>Preencha alguns campos do formulário</li>
                        <li>
                          Observe o indicador "Salvando..." aparecer no canto superior direito
                        </li>
                        <li>Após 2 segundos, verá "Salvo há X segundos"</li>
                        <li>
                          Recarregue a página (F5) - seus dados serão recuperados automaticamente
                        </li>
                        <li>Ao submeter com sucesso, os dados salvos são limpos</li>
                      </ol>
                    </div>

                    <QuickPatientFormWithAutoSave
                      onSubmit={handleQuickFormSubmit}
                      autoSaveKey="demo-quick-form"
                    />

                    {quickFormResult && (
                      <Card className="bg-green-50 border-green-200">
                        <CardHeader>
                          <CardTitle className="text-lg text-green-800">
                            Formulário Enviado com Sucesso!
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-xs bg-white p-4 rounded border overflow-auto">
                            {JSON.stringify(quickFormResult, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Multi-Step Wizard Demo */}
            <TabsContent value="wizard" className="space-y-6">
              <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-100">
                <CardHeader>
                  <CardTitle className="text-xl text-purple-800">
                    Wizard Multi-Step com Auto-Save
                  </CardTitle>
                  <CardDescription>
                    Demonstração de auto-save em um wizard de 3 etapas com navegação entre passos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <h4 className="font-semibold text-sm text-purple-800 mb-3">
                        Como testar:
                      </h4>
                      <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                        <li>Preencha os campos da Etapa 1</li>
                        <li>Navegue para a Etapa 2 - dados são salvos automaticamente</li>
                        <li>Preencha alguns campos da Etapa 2</li>
                        <li>
                          Recarregue a página (F5) - você voltará exatamente onde estava
                        </li>
                        <li>Continue preenchendo e complete o wizard</li>
                        <li>Ao concluir, os dados salvos são limpos</li>
                      </ol>
                    </div>

                    <MultiStepWizardWithAutoSave
                      onComplete={handleWizardComplete}
                      autoSaveKey="demo-wizard"
                    />

                    {wizardResult && (
                      <Card className="bg-green-50 border-green-200">
                        <CardHeader>
                          <CardTitle className="text-lg text-green-800">
                            Wizard Concluído com Sucesso!
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-xs bg-white p-4 rounded border overflow-auto">
                            {JSON.stringify(wizardResult, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Technical Details */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl text-telos-blue">
              Detalhes Técnicos da Implementação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-telos-blue">
                  Recursos Implementados
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Debounced auto-save (2000ms padrão)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Save on blur de campos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Save on step change (wizards)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Recuperação automática ao recarregar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Limpeza após submissão bem-sucedida</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Versionamento de dados salvos</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-telos-blue">
                  Tratamento de Erros
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>QuotaExceededError (localStorage cheio)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Incompatibilidade de versão</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Erros de parsing JSON</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Feedback via toast notifications</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="font-semibold text-sm text-telos-blue mb-2">
                Formato dos Dados Salvos
              </h4>
              <pre className="text-xs bg-white p-3 rounded border overflow-auto">
{`{
  "version": "1.0.0",
  "timestamp": "2025-11-11T10:30:45.123Z",
  "data": {
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 98765-4321",
    ...
  }
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </PrivateLayout>
  )
}
