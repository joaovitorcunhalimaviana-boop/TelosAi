"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  TestTube2,
  MessageCircle,
  Phone,
  Trash2,
  Zap,
  Send,
  RefreshCw,
  FileText,
  CheckCheck,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion } from "framer-motion"
import { ScaleOnHover } from "@/components/animations"
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts"
import type { PatientCard as PatientCardType, SurgeryType } from "@/app/dashboard/actions"
import { completeSurgery, deletePatient, toggleTestPatient } from "@/app/dashboard/actions"
import { getSurgeryTypeLabel } from "@/lib/constants/surgery-types"

interface PatientCardProps {
  patient: PatientCardType
  userName: string
  onAddToResearch?: (patientId: string) => void
  onPatientChanged?: () => void
  showResearchButton?: boolean
}

// Helper functions
const getCompletenessColor = (completeness: number) => {
  if (completeness >= 80) return "bg-green-500"
  if (completeness >= 40) return "bg-yellow-500"
  return "bg-red-500"
}

const getCompletenessVariant = (completeness: number): "default" | "secondary" | "destructive" => {
  if (completeness >= 80) return "default"
  if (completeness >= 40) return "secondary"
  return "destructive"
}

const getCompletenessMessage = (completeness: number) => {
  if (completeness === 100) return { text: "Perfeito!", icon: "🎉", color: "text-green-700" }
  if (completeness >= 80) return { text: "Quase lá!", icon: "⭐", color: "text-green-600" }
  if (completeness >= 60) return { text: "Bom progresso", icon: "📈", color: "text-blue-600" }
  if (completeness >= 40) return { text: "Continue!", icon: "💪", color: "text-yellow-600" }
  if (completeness >= 20) return { text: "Preencha mais", icon: "📝", color: "text-orange-600" }
  return { text: "Precisa completar", icon: "⚠️", color: "text-red-600" }
}

const isPatientNew = (createdAt: Date): boolean => {
  const now = new Date()
  const patientCreated = new Date(createdAt)
  const hoursDiff = (now.getTime() - patientCreated.getTime()) / (1000 * 60 * 60)
  return hoursDiff <= 24
}


const getPatientRiskLevel = (patient: PatientCardType): 'low' | 'medium' | 'high' | 'critical' => {
  if (patient.hasRedFlags && patient.redFlags.length > 0) return 'critical'
  if (patient.dataCompleteness < 40) return 'high'
  if (patient.dataCompleteness < 80) return 'medium'
  return 'low'
}

const getRiskBorderClass = (riskLevel: 'low' | 'medium' | 'high' | 'critical') => {
  const borders = {
    low: 'border-green-600 hover:border-green-700',
    medium: 'border-yellow-500 hover:border-yellow-600',
    high: 'border-orange-500 hover:border-orange-600',
    critical: 'border-red-600 hover:border-red-700',
  }
  return borders[riskLevel]
}

export function PatientCard({ patient, userName, onAddToResearch, onPatientChanged, showResearchButton = false }: PatientCardProps) {
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmComplete, setConfirmComplete] = useState(false)
  const [loading, setLoading] = useState<'delete' | 'complete' | 'test' | null>(null)
  const [isTest, setIsTest] = useState(patient.isTest || false)
  const riskLevel = getPatientRiskLevel(patient)
  const isCritical = patient.latestResponse?.riskLevel === 'critical' || patient.latestResponse?.riskLevel === 'high'

  // Quick Actions Modal state
  const [showActionsModal, setShowActionsModal] = useState(false)
  const [customMessage, setCustomMessage] = useState("")
  const [observation, setObservation] = useState("")
  const [actionLoading, setActionLoading] = useState<'resend' | 'message' | 'observation' | null>(null)
  const [actionSuccess, setActionSuccess] = useState<'resend' | 'observation' | null>(null)

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(`Olá ${patient.patientName}, aqui é ${userName}. Como está o seu pós-operatório?`)
    window.open(`https://wa.me/55${patient.phone.replace(/\D/g, '')}?text=${message}`, '_blank')
  }

  const handlePhoneClick = () => {
    window.open(`tel:${patient.phone.replace(/\D/g, '')}`, '_self')
  }

  // Quick Actions handlers
  const handleResendFollowUp = async () => {
    setActionLoading('resend')
    setActionSuccess(null)
    try {
      const res = await fetch(`/api/surgery/${patient.id}/resend-followup`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao reenviar')
      setActionSuccess('resend')
      setTimeout(() => setActionSuccess(null), 3000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao reenviar questionário')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSendCustomMessage = () => {
    if (!customMessage.trim()) return
    const encoded = encodeURIComponent(customMessage.trim())
    window.open(`https://wa.me/55${patient.phone.replace(/\D/g, '')}?text=${encoded}`, '_blank')
    setCustomMessage("")
  }

  const handleSaveObservation = async () => {
    if (!observation.trim()) return
    setActionLoading('observation')
    setActionSuccess(null)
    try {
      const res = await fetch(`/api/surgery/${patient.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorNotes: observation }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar')
      setActionSuccess('observation')
      setTimeout(() => setActionSuccess(null), 3000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar observação')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCompleteSurgery = async () => {
    if (!confirmComplete) {
      setConfirmComplete(true)
      return
    }
    setLoading('complete')
    const result = await completeSurgery(patient.id)
    setLoading(null)
    setConfirmComplete(false)
    if (result.success) {
      onPatientChanged?.()
    } else {
      alert(result.error || 'Erro ao concluir acompanhamento')
    }
  }

  const handleToggleTest = async () => {
    setLoading('test')
    const result = await toggleTestPatient(patient.patientId)
    setLoading(null)
    if (result.success) {
      setIsTest(result.isTest ?? false)
    }
  }

  const handleDeletePatient = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setLoading('delete')
    const result = await deletePatient(patient.patientId)
    setLoading(null)
    setConfirmDelete(false)
    if (result.success) {
      onPatientChanged?.()
    } else {
      alert(result.error || 'Erro ao excluir paciente')
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <ScaleOnHover scale={1.02}>
        <Card
          className={`glass-card border-none hover-lift-tech transition-all ${getRiskBorderClass(riskLevel)} relative ${isCritical ? 'border-l-4 border-l-red-600' : ''}`}
          style={{ backgroundColor: isCritical ? 'rgba(192, 57, 43, 0.15)' : '#161B27' }}
          role="article"
          aria-label={`Paciente ${patient.patientName}, ${getSurgeryTypeLabel(patient.surgeryType)}, ${patient.followUpDay}`}
          data-tutorial="patient-card"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-1">
                  <CardTitle className="text-lg flex-1" style={{ color: '#F0EAD6' }}>
                    {patient.patientName}
                  </CardTitle>
                  {isTest && (
                    <Badge
                      className="font-semibold text-xs px-2 py-1 shrink-0"
                      style={{
                        backgroundColor: '#FEF3C7',
                        color: '#92400E',
                        border: '1px solid #F59E0B',
                      }}
                    >
                      TESTE
                    </Badge>
                  )}
                  {isPatientNew(patient.patientCreatedAt) && (
                    <Badge
                      className="badge-pulse font-semibold text-xs px-2 py-1 shrink-0"
                      style={{
                        backgroundColor: '#D4AF37',
                        color: '#0A2647',
                        border: '2px solid #B8941F',
                        boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)'
                      }}
                    >
                      NOVO
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {getSurgeryTypeLabel(patient.surgeryType)}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {patient.followUpDay}
                  </Badge>
                  <Badge
                    variant={patient.status === "active" ? "default" : "secondary"}
                    className={patient.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {patient.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                  {patient.isResearchParticipant && patient.researchGroup && (
                    <Badge
                      className="text-xs font-semibold gap-1.5 px-2.5 py-1"
                      style={{
                        backgroundColor: '#7C3AED',
                        color: 'white',
                        border: '1px solid #6D28D9'
                      }}
                    >
                      <FlaskConical className="h-3 w-3" />
                      Grupo {patient.researchGroup}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Research Data Warning */}
            {patient.isResearchParticipant && !patient.researchDataComplete && (
              <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: 'rgba(192, 57, 43, 0.15)', border: '1px solid rgba(192, 57, 43, 0.4)' }} role="status" aria-live="polite">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#C0392B' }} aria-hidden="true" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-1" style={{ color: '#F0EAD6' }}>
                      Dados de Pesquisa Incompletos
                    </p>
                    <p className="text-xs" style={{ color: '#D8DEEB' }}>
                      Faltam {patient.researchMissingFieldsCount} campo{patient.researchMissingFieldsCount > 1 ? 's' : ''} obrigatório{patient.researchMissingFieldsCount > 1 ? 's' : ''} para pesquisa
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-xs shrink-0">
                    {patient.researchMissingFieldsCount}
                  </Badge>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {/* Data da cirurgia */}
              <div className="flex items-center gap-2 text-sm" style={{ color: '#7A8299' }}>
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span>
                  {format(new Date(patient.surgeryDate), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </div>

              {/* Completude de dados - Gamificada */}
              <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(to right, #0B0E14, #111520)', border: '1px solid #1E2535' }} data-tutorial="patient-completeness">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${getCompletenessMessage(patient.dataCompleteness).color} font-semibold`}>
                      {getCompletenessMessage(patient.dataCompleteness).icon}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: '#D8DEEB' }}>
                      Completude de dados
                    </span>
                  </div>
                  <Badge
                    variant={getCompletenessVariant(patient.dataCompleteness)}
                    className="text-sm font-bold"
                  >
                    {patient.dataCompleteness}%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="w-full rounded-full h-3 relative overflow-hidden" style={{ backgroundColor: '#2A3147' }}>
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getCompletenessColor(patient.dataCompleteness)} relative`}
                      style={{ width: `${patient.dataCompleteness}%` }}
                    >
                      {patient.dataCompleteness > 10 && (
                        <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                      )}
                    </div>
                  </div>
                  <p className={`text-xs font-medium ${getCompletenessMessage(patient.dataCompleteness).color}`}>
                    {getCompletenessMessage(patient.dataCompleteness).text}
                    {patient.dataCompleteness < 100 && ` • ${100 - patient.dataCompleteness}% restante`}
                  </p>
                </div>
              </div>

              {/* Red flags */}
              {patient.hasRedFlags && (
                <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(192, 57, 43, 0.15)', border: '1px solid rgba(192, 57, 43, 0.4)' }} role="alert">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#C0392B' }} aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-sm mb-1" style={{ color: '#F0EAD6' }}>
                        ALERTA
                      </p>
                      {patient.redFlags.length > 0 && (
                        <ul className="text-xs space-y-0.5" style={{ color: '#D8DEEB' }}>
                          {patient.redFlags.slice(0, 2).map((flag, idx) => (
                            <li key={idx}>• {flag}</li>
                          ))}
                          {patient.redFlags.length > 2 && (
                            <li>• +{patient.redFlags.length - 2} mais</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sparkline de Dor */}
              {patient.painHistory && patient.painHistory.length > 0 && (
                <div className="mt-4 mb-2">
                  <div className="flex justify-between items-center mb-1 px-1">
                    <span className="text-xs font-medium" style={{ color: '#7A8299' }}>Dor Recente</span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ color: '#14BDAE', backgroundColor: '#1E2535' }}>
                      {patient.painHistory[patient.painHistory.length - 1]?.value ?? 0}/10
                    </span>
                  </div>
                  <div className="h-12 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={patient.painHistory}>
                        <YAxis domain={[0, 10]} hide />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#14BDAE"
                          strokeWidth={2}
                          dot={{ r: 2, fill: "#D4AF37", strokeWidth: 0 }}
                          activeDot={{ r: 4 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Clinical indicators */}
              {(patient.latestResponse?.usedExtraMedication || patient.latestResponse?.localCareAdherence === false) && (
                <div className="flex flex-wrap gap-1.5">
                  {patient.latestResponse?.usedExtraMedication && (
                    <Badge variant="outline" className="text-xs" style={{ backgroundColor: 'rgba(124, 58, 237, 0.15)', color: '#A78BFA', borderColor: '#7C3AED' }}>
                      Med. extra{patient.latestResponse.extraMedicationDetails ? `: ${patient.latestResponse.extraMedicationDetails}` : ''}
                    </Badge>
                  )}
                  {patient.latestResponse?.localCareAdherence === false && (
                    <Badge variant="outline" className="text-xs" style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37', borderColor: '#D4AF37' }}>
                      Cuidados locais
                    </Badge>
                  )}
                </div>
              )}

              {/* Quick Action Buttons - WhatsApp & Phone */}
              <div className="flex gap-2 pb-2" style={{ borderBottom: '1px solid #1E2535' }} data-tutorial="quick-actions">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  style={{ borderColor: '#1A8C6A', color: '#1A8C6A' }}
                  onClick={handleWhatsAppClick}
                  aria-label={`Enviar mensagem no WhatsApp para ${patient.patientName}`}
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  style={{ borderColor: '#0D7377', color: '#14BDAE' }}
                  onClick={handlePhoneClick}
                  aria-label={`Ligar para ${patient.patientName}`}
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Ligar
                </Button>
              </div>

              {/* Botões de ação */}
              <div className="space-y-2 pt-2" data-tutorial="patient-actions">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation(); // Previne eventos de clique no card pai
                      if (patient.id) {
                        router.push(`/paciente/${patient.id}/detalhes`);
                      } else {
                        console.error('ID do paciente inválido', patient);
                      }
                    }}
                    aria-label={`Ver detalhes de ${patient.patientName}`}
                  >
                    Ver Detalhes
                  </Button>
                  {patient.dataCompleteness < 100 && (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/paciente/${patient.patientId}/editar`)}
                      aria-label={`Completar cadastro de ${patient.patientName}`}
                    >
                      Completar Cadastro
                    </Button>
                  )}
                </div>
                {(patient.status === 'completed' || patient.daysSinceSurgery >= 14) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    style={{ borderColor: '#0D7377', color: '#14BDAE' }}
                    onClick={() => window.open(`/api/export/discharge-pdf?surgeryId=${patient.id}`, '_blank')}
                    aria-label={`Gerar relatorio de alta de ${patient.patientName}`}
                  >
                    <ClipboardList className="h-4 w-4" aria-hidden="true" />
                    Relatorio de Alta
                  </Button>
                )}
                {showResearchButton && onAddToResearch && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    style={{ borderColor: '#7C3AED', color: '#A78BFA' }}
                    onClick={() => onAddToResearch(patient.id)}
                    aria-label={`Adicionar ${patient.patientName} à pesquisa`}
                  >
                    <FlaskConical className="mr-2 h-4 w-4" aria-hidden="true" />
                    Adicionar à Pesquisa
                  </Button>
                )}

                {/* Ações Rápidas */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 font-semibold"
                  style={{ borderColor: '#14BDAE', color: '#14BDAE', backgroundColor: 'rgba(20, 189, 174, 0.08)' }}
                  onClick={() => { setShowActionsModal(true); setActionSuccess(null) }}
                >
                  <Zap className="h-4 w-4" />
                  Ações Rápidas
                </Button>

                {/* Concluir / Teste / Excluir */}
                <div className="flex gap-2">
                  {patient.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs"
                      style={confirmComplete
                        ? { borderColor: '#1A8C6A', backgroundColor: 'rgba(26, 140, 106, 0.15)', color: '#1A8C6A' }
                        : { borderColor: '#2A3147', color: '#7A8299' }
                      }
                      onClick={handleCompleteSurgery}
                      onBlur={() => setConfirmComplete(false)}
                      disabled={loading === 'complete'}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {loading === 'complete' ? 'Concluindo...' : confirmComplete ? 'Confirmar?' : 'Concluir'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    style={isTest
                      ? { borderColor: '#D4AF37', backgroundColor: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37' }
                      : { borderColor: '#2A3147', color: '#7A8299' }
                    }
                    onClick={handleToggleTest}
                    disabled={loading === 'test'}
                  >
                    <TestTube2 className="h-3.5 w-3.5" />
                    {loading === 'test' ? '...' : isTest ? 'Teste' : 'Teste'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    style={confirmDelete
                      ? { borderColor: '#C0392B', backgroundColor: 'rgba(192, 57, 43, 0.15)', color: '#C0392B' }
                      : { borderColor: '#2A3147', color: '#7A8299' }
                    }
                    onClick={handleDeletePatient}
                    onBlur={() => setConfirmDelete(false)}
                    disabled={loading === 'delete'}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {loading === 'delete' ? 'Excluindo...' : confirmDelete ? 'Confirmar exclusão?' : 'Excluir'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScaleOnHover>

      {/* Quick Actions Modal */}
      <Dialog open={showActionsModal} onOpenChange={setShowActionsModal}>
        <DialogContent
          className="max-w-md"
          style={{ backgroundColor: '#161B27', border: '1px solid #1E2535', color: '#F0EAD6' }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg" style={{ color: '#F0EAD6' }}>
              <Zap className="h-5 w-5" style={{ color: '#14BDAE' }} />
              Ações Rápidas
              <span className="text-sm font-normal ml-1" style={{ color: '#7A8299' }}>
                — {patient.patientName}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">

            {/* 1. Reenviar questionário */}
            <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: '#0B0E14', border: '1px solid #1E2535' }}>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" style={{ color: '#14BDAE' }} />
                <span className="font-semibold text-sm" style={{ color: '#D8DEEB' }}>
                  Reenviar Questionário
                </span>
              </div>
              <p className="text-xs" style={{ color: '#7A8299' }}>
                Reenvia o questionário de acompanhamento mais recente pendente para o paciente via WhatsApp.
              </p>
              <Button
                size="sm"
                className="w-full gap-2"
                style={{
                  backgroundColor: actionSuccess === 'resend' ? '#1A8C6A' : '#0D7377',
                  color: '#F0EAD6',
                  border: 'none',
                }}
                onClick={handleResendFollowUp}
                disabled={actionLoading === 'resend'}
              >
                {actionLoading === 'resend' ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : actionSuccess === 'resend' ? (
                  <>
                    <CheckCheck className="h-4 w-4" />
                    Enviado!
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Reenviar Questionário
                  </>
                )}
              </Button>
            </div>

            {/* 2. Mensagem personalizada */}
            <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: '#0B0E14', border: '1px solid #1E2535' }}>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" style={{ color: '#1A8C6A' }} />
                <span className="font-semibold text-sm" style={{ color: '#D8DEEB' }}>
                  Mensagem Personalizada
                </span>
              </div>
              <Textarea
                placeholder={`Olá ${patient.patientName}, tudo bem?`}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className="resize-none text-sm"
                style={{
                  backgroundColor: '#1E2535',
                  border: '1px solid #2A3147',
                  color: '#F0EAD6',
                }}
              />
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-2"
                style={{ borderColor: '#1A8C6A', color: '#1A8C6A' }}
                onClick={handleSendCustomMessage}
                disabled={!customMessage.trim()}
              >
                <MessageCircle className="h-4 w-4" />
                Abrir no WhatsApp
              </Button>
            </div>

            {/* 3. Adicionar observação */}
            <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: '#0B0E14', border: '1px solid #1E2535' }}>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" style={{ color: '#D4AF37' }} />
                <span className="font-semibold text-sm" style={{ color: '#D8DEEB' }}>
                  Adicionar Observação
                </span>
              </div>
              <p className="text-xs" style={{ color: '#7A8299' }}>
                Salva uma anotação clínica nos registros da cirurgia (visível nos detalhes do paciente).
              </p>
              <Textarea
                placeholder="Ex: Paciente relatou dor leve ao sentar. Orientado sobre banhos de assento..."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={3}
                className="resize-none text-sm"
                style={{
                  backgroundColor: '#1E2535',
                  border: '1px solid #2A3147',
                  color: '#F0EAD6',
                }}
              />
              <Button
                size="sm"
                className="w-full gap-2"
                style={{
                  backgroundColor: actionSuccess === 'observation' ? '#1A8C6A' : '#D4AF37',
                  color: actionSuccess === 'observation' ? '#F0EAD6' : '#0A2647',
                  border: 'none',
                  fontWeight: 600,
                }}
                onClick={handleSaveObservation}
                disabled={actionLoading === 'observation' || !observation.trim()}
              >
                {actionLoading === 'observation' ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : actionSuccess === 'observation' ? (
                  <>
                    <CheckCheck className="h-4 w-4" />
                    Salvo!
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Salvar Observação
                  </>
                )}
              </Button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// Export helper functions for use in other components
export {
  getCompletenessColor,
  getCompletenessVariant,
  getCompletenessMessage,
  isPatientNew,
  getPatientRiskLevel,
  getRiskBorderClass,
}

// Re-export getSurgeryTypeLabel for backward compatibility
export { getSurgeryTypeLabel } from "@/lib/constants/surgery-types"
