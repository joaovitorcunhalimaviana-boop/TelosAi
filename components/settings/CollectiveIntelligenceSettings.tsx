"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Brain, Shield, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function CollectiveIntelligenceSettings() {
  const [optIn, setOptIn] = useState(false)
  const [joinDate, setJoinDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/collective-intelligence/opt-in")
      if (!res.ok) throw new Error("Erro ao buscar status")

      const data = await res.json()
      setOptIn(data.optIn)
      setJoinDate(data.date ? new Date(data.date) : null)
    } catch (error) {
      console.error("Erro:", error)
      toast.error("Erro ao carregar status")
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (newValue: boolean) => {
    if (newValue) {
      // Ativar - mostra diálogo de confirmação
      setShowConfirmDialog(true)
    } else {
      // Desativar
      await updateOptIn(false)
    }
  }

  const updateOptIn = async (value: boolean) => {
    setUpdating(true)

    try {
      const res = await fetch("/api/collective-intelligence/opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optIn: value }),
      })

      if (!res.ok) throw new Error("Erro ao atualizar")

      const data = await res.json()
      setOptIn(data.optIn)

      if (value) {
        setJoinDate(new Date())
        toast.success("Você agora faz parte da Inteligência Coletiva!")
      } else {
        setJoinDate(null)
        toast.success("Você saiu do programa de Inteligência Coletiva")
      }

      setShowConfirmDialog(false)
    } catch (error) {
      console.error("Erro:", error)
      toast.error("Erro ao atualizar configuração")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Inteligência Coletiva
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Inteligência Coletiva
          </CardTitle>
          <CardDescription>
            Compartilhe dados anonimizados para melhorar o modelo de IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Atual */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-accent">
            <div className="space-y-1">
              <Label htmlFor="opt-in-toggle" className="text-base font-medium cursor-pointer">
                Participar do Programa
              </Label>
              <p className="text-sm text-muted-foreground">
                {optIn ? (
                  <>
                    <CheckCircle className="inline h-4 w-4 text-green-600 mr-1" />
                    Ativo desde {joinDate?.toLocaleDateString("pt-BR")}
                  </>
                ) : (
                  <>
                    <AlertCircle className="inline h-4 w-4 text-gray-400 mr-1" />
                    Você não está participando
                  </>
                )}
              </p>
            </div>
            <Switch
              id="opt-in-toggle"
              checked={optIn}
              onCheckedChange={handleToggle}
              disabled={updating}
            />
          </div>

          {/* Benefícios */}
          <div className="space-y-3">
            <h4 className="font-medium">O que você ganha ao participar:</h4>
            <div className="space-y-2">
              <div className="flex gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Modelo de IA <strong>mais preciso</strong> para predizer complicações</span>
              </div>
              <div className="flex gap-2 text-sm">
                <Brain className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Aprendizado contínuo com casos de diferentes perfis de pacientes</span>
              </div>
            </div>
          </div>

          {/* Privacidade */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              Privacidade e Segurança
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Dados completamente anonimizados (SHA-256)</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Apenas pacientes com consentimento assinado</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Conforme LGPD (Art. 7º, IV e Art. 11)</span>
              </li>
            </ul>
          </div>

          {/* Nota Importante */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Importante:</strong> Você NÃO terá acesso às estatísticas agregadas de outros médicos.
              Seu benefício é ter um modelo de IA melhorado que ajuda a prever complicações nos seus próprios pacientes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de Confirmação para Ativar */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Participar da Inteligência Coletiva?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Ao ativar, você autoriza o compartilhamento de dados <strong>anonimizados</strong> dos seus pacientes
                (apenas aqueles com termo de consentimento assinado) para:
              </p>
              <ul className="space-y-1 text-sm">
                <li>✓ Melhorar o modelo de IA de predição de complicações</li>
                <li>✓ Gerar insights científicos agregados</li>
                <li>✓ Contribuir para pesquisas em cirurgia colorretal</li>
              </ul>
              <p className="text-sm font-medium">
                Você pode cancelar a qualquer momento.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => updateOptIn(true)} disabled={updating}>
              {updating ? "Ativando..." : "Confirmar e Participar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
