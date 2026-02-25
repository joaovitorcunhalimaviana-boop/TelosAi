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
    <div className="min-h-screen p-4" style={{ backgroundColor: '#0B0E14' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/templates")}
            className="mb-4 hover:bg-[#1E2535]"
            style={{ color: '#D8DEEB' }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Templates
          </Button>

          <h1 className="text-3xl font-bold mb-2" style={{ color: '#F0EAD6' }}>
            Criar Novo Template
          </h1>
          <p style={{ color: '#7A8299' }}>
            A melhor forma de criar um template é a partir de um paciente existente
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-0" style={{ backgroundColor: '#111520', boxShadow: '0 0 0 1px #1E2535' }}>
          <CardHeader style={{ borderBottom: '1px solid #1E2535' }}>
            <CardTitle className="flex items-center gap-2" style={{ color: '#F0EAD6' }}>
              <FileText className="h-5 w-5" style={{ color: '#14BDAE' }} />
              Como Criar Templates
            </CardTitle>
            <CardDescription style={{ color: '#7A8299' }}>
              Siga estas etapas para criar templates dos seus procedimentos padrão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#0D7377] to-[#0A5A5E] text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2" style={{ color: '#F0EAD6' }}>
                  Preencha um Cadastro Completo
                </h3>
                <p className="mb-3" style={{ color: '#7A8299' }}>
                  Vá até a página de edição de qualquer paciente e preencha todos os campos com suas configurações padrão:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2" style={{ color: '#7A8299' }}>
                  <li>Tipo de anestesia e bloqueios</li>
                  <li>Detalhes da técnica cirúrgica</li>
                  <li>Prescrição pós-operatória (pomadas e medicamentos)</li>
                  <li>Preparo pré-operatório</li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#0D7377] to-[#0A5A5E] text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2" style={{ color: '#F0EAD6' }}>
                  Clique em &quot;Salvar como Template&quot;
                </h3>
                <p className="mb-3" style={{ color: '#7A8299' }}>
                  Na página de edição do paciente, você verá um botão &quot;Salvar como Template&quot; ao lado dos botões de salvar.
                </p>
                <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(13, 115, 119, 0.08)', border: '1px solid rgba(13, 115, 119, 0.2)' }}>
                  <p className="text-sm" style={{ color: '#14BDAE' }}>
                    <strong>Nota:</strong> Apenas as configurações clínicas serão salvas. Dados pessoais do paciente (nome, CPF, etc) não fazem parte do template.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#0D7377] to-[#0A5A5E] text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2" style={{ color: '#F0EAD6' }}>
                  Aplique em Novos Pacientes
                </h3>
                <p className="mb-3" style={{ color: '#7A8299' }}>
                  Ao editar outros pacientes do mesmo tipo de cirurgia, clique em &quot;Aplicar Template&quot; para preencher automaticamente com suas configurações padrão.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4" style={{ borderTop: '1px solid #1E2535' }}>
              <h3 className="font-semibold mb-3" style={{ color: '#F0EAD6' }}>Ações Rápidas</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => router.push("/dashboard")}
                  style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}
                >
                  Ir para Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/templates")}
                  style={{ backgroundColor: '#1E2535', borderColor: '#2A3147', color: '#D8DEEB' }}
                >
                  Ver Templates Existentes
                </Button>
              </div>
            </div>

            {/* Example */}
            <div className="rounded-lg p-4" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
              <h4 className="font-semibold mb-2" style={{ color: '#F0EAD6' }}>Exemplo de Uso</h4>
              <div className="text-sm space-y-2" style={{ color: '#7A8299' }}>
                <p>
                  <strong style={{ color: '#D8DEEB' }}>Cenário:</strong> Dr. João sempre usa a mesma combinação para hemorroidectomia:
                </p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Anestesia raquiana + bloqueio pudendo bilateral com ultrassom</li>
                  <li>Técnica Ferguson modificada com Ligasure</li>
                  <li>Pomada especial: Diltiazem 2% + Lidocaína 2% + Vit E 5% + Metronidazol 10%</li>
                  <li>Prescrição: Dipirona + Lactulose + Orientações padrão</li>
                </ul>
                <p className="pt-2">
                  <strong style={{ color: '#D8DEEB' }}>Solução:</strong> Ele preenche um paciente com todas essas configurações e salva como &quot;Minha hemorroidectomia padrão do Dr. João&quot;. Agora, para cada novo paciente, basta clicar em &quot;Aplicar Template&quot; e tudo é preenchido automaticamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
