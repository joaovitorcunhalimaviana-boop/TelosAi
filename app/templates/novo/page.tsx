"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, FileText } from "lucide-react"
import { SURGERY_TYPE_LABELS } from "@/lib/template-utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function NewTemplatePage() {
  const router = useRouter()
  const { toast } = useToast()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E2E8F0] p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/templates")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Templates
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Criar Novo Template
          </h1>
          <p className="text-gray-600">
            A melhor forma de criar um template é a partir de um paciente existente
          </p>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Como Criar Templates
            </CardTitle>
            <CardDescription>
              Siga estas etapas para criar templates dos seus procedimentos padrão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Preencha um Cadastro Completo
                </h3>
                <p className="text-gray-600 mb-3">
                  Vá até a página de edição de qualquer paciente e preencha todos os campos com suas configurações padrão:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                  <li>Tipo de anestesia e bloqueios</li>
                  <li>Detalhes da técnica cirúrgica</li>
                  <li>Prescrição pós-operatória (pomadas e medicamentos)</li>
                  <li>Preparo pré-operatório</li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Clique em &quot;Salvar como Template&quot;
                </h3>
                <p className="text-gray-600 mb-3">
                  Na página de edição do paciente, você verá um botão &quot;Salvar como Template&quot; ao lado dos botões de salvar.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    <strong>Nota:</strong> Apenas as configurações clínicas serão salvas. Dados pessoais do paciente (nome, CPF, etc) não fazem parte do template.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Aplique em Novos Pacientes
                </h3>
                <p className="text-gray-600 mb-3">
                  Ao editar outros pacientes do mesmo tipo de cirurgia, clique em &quot;Aplicar Template&quot; para preencher automaticamente com suas configurações padrão.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-gray-900 mb-3">Ações Rápidas</h3>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => router.push("/dashboard")}>
                  Ir para Dashboard
                </Button>
                <Button variant="outline" onClick={() => router.push("/templates")}>
                  Ver Templates Existentes
                </Button>
              </div>
            </div>

            {/* Example */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Exemplo de Uso</h4>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Cenário:</strong> Dr. João sempre usa a mesma combinação para hemorroidectomia:
                </p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Anestesia raquiana + bloqueio pudendo bilateral com ultrassom</li>
                  <li>Técnica Ferguson modificada com Ligasure</li>
                  <li>Pomada especial: Diltiazem 2% + Lidocaína 2% + Vit E 5% + Metronidazol 10%</li>
                  <li>Prescrição: Dipirona + Lactulose + Orientações padrão</li>
                </ul>
                <p className="pt-2">
                  <strong>Solução:</strong> Ele preenche um paciente com todas essas configurações e salva como &quot;Minha hemorroidectomia padrão do Dr. João&quot;. Agora, para cada novo paciente, basta clicar em &quot;Aplicar Template&quot; e tudo é preenchido automaticamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
