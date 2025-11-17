"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Brain, Lock, TrendingUp, Users, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface Props {
  open: boolean
  onClose: (optedIn: boolean) => void
}

export function CollectiveIntelligenceModal({ open, onClose }: Props) {
  const [understood, setUnderstood] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleOptIn = async (optIn: boolean) => {
    setLoading(true)

    try {
      const res = await fetch("/api/collective-intelligence/opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optIn }),
      })

      if (!res.ok) {
        throw new Error("Erro ao processar opt-in")
      }

      toast.success(
        optIn
          ? "Você agora faz parte da Inteligência Coletiva!"
          : "Você optou por não participar no momento"
      )

      onClose(optIn)
    } catch (error) {
      console.error("Erro:", error)
      toast.error("Erro ao processar sua escolha. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => !loading && onClose(false)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Brain className="h-6 w-6 text-blue-600" />
            Participe da Inteligência Coletiva
          </DialogTitle>
          <DialogDescription>
            Melhore seu próprio atendimento enquanto contribui para o avanço da medicina
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* O que é */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">O que é Inteligência Coletiva?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              É um programa opcional onde médicos compartilham dados <strong>completamente anonimizados</strong> de
              seus pacientes para melhorar o modelo de Machine Learning que prevê complicações pós-operatórias.
            </p>
          </div>

          {/* Benefícios */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              O que VOCÊ ganha ao participar
            </h3>
            <div className="grid gap-3">
              <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Predições Mais Precisas</p>
                  <p className="text-xs text-muted-foreground">
                    Quanto mais dados, melhor o modelo identifica pacientes de risco
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Brain className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Melhoria Contínua do Sistema</p>
                  <p className="text-xs text-muted-foreground">
                    O modelo aprende com casos de diferentes médicos e perfis de pacientes
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Users className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Contribuição para a Ciência</p>
                  <p className="text-xs text-muted-foreground">
                    Ajude a gerar insights que podem melhorar outcomes em cirurgia colorretal
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* O que você NÃO ganha */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Importante entender
            </h3>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <p className="text-sm">
                <strong>Você NÃO terá acesso</strong> às estatísticas agregadas de outros médicos (ex: taxa média
                de complicações, técnicas mais usadas, etc).
              </p>
              <p className="text-sm">
                Esses dados pertencem ao administrador do sistema e podem ser usados para pesquisas e publicações científicas.
              </p>
              <p className="text-sm font-medium text-blue-700">
                Seu benefício é ter um modelo de IA MELHOR que ajuda a prever complicações nos SEUS pacientes.
              </p>
            </div>
          </div>

          {/* Privacidade e Segurança */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              Privacidade e Segurança (LGPD)
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Todos os dados são <strong>pseudonimizados</strong> (hash SHA-256 com salt secreto)</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>CPF, nome, telefone e outros dados identificadores são <strong>removidos</strong></span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Apenas pacientes com <strong>termo de consentimento assinado</strong> são incluídos</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Conforme <strong>Lei Geral de Proteção de Dados (LGPD)</strong> Art. 7º, IV e Art. 11</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Você pode <strong>sair do programa a qualquer momento</strong> nas configurações</span>
              </li>
            </ul>
          </div>

          {/* Confirmação de entendimento */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-accent">
            <Checkbox
              id="understood"
              checked={understood}
              onCheckedChange={(checked) => setUnderstood(checked as boolean)}
            />
            <Label htmlFor="understood" className="text-sm font-normal cursor-pointer leading-relaxed">
              Li e compreendi que ao participar:<br />
              1. Meus dados serão anonimizados e compartilhados<br />
              2. Receberei um modelo de IA melhorado<br />
              3. NÃO terei acesso às estatísticas agregadas<br />
              4. Posso sair a qualquer momento
            </Label>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleOptIn(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Não Participar Agora
          </Button>
          <Button
            onClick={() => handleOptIn(true)}
            disabled={!understood || loading}
            className="w-full sm:w-auto"
          >
            {loading ? "Processando..." : "Participar da Inteligência Coletiva"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
