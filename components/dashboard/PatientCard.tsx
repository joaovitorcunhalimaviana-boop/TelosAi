"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  Calendar,
  FlaskConical,
  MessageCircle,
  Phone,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion } from "framer-motion"
import { ScaleOnHover } from "@/components/animations"
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts"
import type { PatientCard as PatientCardType, SurgeryType } from "@/app/dashboard/actions"
import { getSurgeryTypeLabel } from "@/lib/constants/surgery-types"

interface PatientCardProps {
  patient: PatientCardType
  userName: string
  onAddToResearch?: (patientId: string) => void
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
    critical: 'border-red-600 hover:border-red-700 bg-red-50/50 dark:bg-red-950/20',
  }
  return borders[riskLevel]
}

export function PatientCard({ patient, userName, onAddToResearch, showResearchButton = false }: PatientCardProps) {
  const router = useRouter()
  const riskLevel = getPatientRiskLevel(patient)
  const isCritical = patient.latestResponse?.riskLevel === 'critical' || patient.latestResponse?.riskLevel === 'high'

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(`Olá ${patient.patientName}, aqui é ${userName}. Como está o seu pós-operatório?`)
    window.open(`https://wa.me/55${patient.phone.replace(/\D/g, '')}?text=${message}`, '_blank')
  }

  const handlePhoneClick = () => {
    window.open(`tel:${patient.phone.replace(/\D/g, '')}`, '_self')
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
          className={`glass-card border-none hover-lift-tech transition-all ${getRiskBorderClass(riskLevel)} relative ${isCritical ? 'bg-red-50/90 border-l-4 border-l-red-600' : 'bg-white/80'}`}
          role="article"
          aria-label={`Paciente ${patient.patientName}, ${getSurgeryTypeLabel(patient.surgeryType)}, ${patient.followUpDay}`}
          data-tutorial="patient-card"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-1">
                  <CardTitle className="text-lg flex-1">
                    {patient.patientName}
                  </CardTitle>
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
              <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4" role="status" aria-live="polite">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900 text-sm mb-1">
                      Dados de Pesquisa Incompletos
                    </p>
                    <p className="text-xs text-red-800">
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span>
                  {format(new Date(patient.surgeryDate), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </div>

              {/* Completude de dados - Gamificada */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border" data-tutorial="patient-completeness">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${getCompletenessMessage(patient.dataCompleteness).color} font-semibold`}>
                      {getCompletenessMessage(patient.dataCompleteness).icon}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">
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
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative overflow-hidden">
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
                <div className="bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-800 rounded-lg p-3" role="alert">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-red-900 dark:text-red-100 text-sm mb-1">
                        ALERTA
                      </p>
                      {patient.redFlags.length > 0 && (
                        <ul className="text-xs text-red-800 dark:text-red-200 space-y-0.5">
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
                    <span className="text-xs font-medium text-gray-500">Dor Recente</span>
                    <span className="text-xs font-bold text-[#0A2647] bg-gray-100 px-1.5 py-0.5 rounded">
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
                          stroke="#0A2647"
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

              {/* Quick Action Buttons - WhatsApp & Phone */}
              <div className="flex gap-2 pb-2 border-b border-gray-200" data-tutorial="quick-actions">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2 border-green-500 text-green-700 hover:bg-green-50"
                  onClick={handleWhatsAppClick}
                  aria-label={`Enviar mensagem no WhatsApp para ${patient.patientName}`}
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2 border-blue-500 text-blue-700 hover:bg-blue-50"
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
                {showResearchButton && onAddToResearch && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={() => onAddToResearch(patient.id)}
                    aria-label={`Adicionar ${patient.patientName} à pesquisa`}
                  >
                    <FlaskConical className="mr-2 h-4 w-4" aria-hidden="true" />
                    Adicionar à Pesquisa
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </ScaleOnHover>
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
