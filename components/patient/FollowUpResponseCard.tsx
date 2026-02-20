"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Thermometer,
  Droplets,
  Activity,
  Pill,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface QuestionnaireData {
  // Formato padrão do dashboard
  painAtRest?: number
  painDuringEvacuation?: number
  hadBowelMovement?: boolean
  bowelMovementTime?: string
  bleeding?: string | boolean
  hasFever?: boolean
  temperature?: number
  usedPrescribedMeds?: boolean
  usedExtraMeds?: boolean
  extraMedsDetails?: string
  hasPurulentDischarge?: boolean
  // Formato da IA (compatibilidade)
  pain?: number
  painDuringBowel?: number
  painDuringBowelMovement?: number
  evacuated?: boolean
  bowelMovementSinceLastContact?: boolean
  fever?: boolean
  medications?: boolean
  urinated?: boolean
  usedExtraMedication?: boolean
  extraMedicationDetails?: string
  localCareAdherence?: boolean
  additionalSymptoms?: string | null
  discharge?: boolean
  dischargeType?: string
  dischargeAmount?: string
  satisfactionRating?: number
  wouldRecommend?: boolean
  positiveFeedback?: string
  improvementSuggestions?: string
  concerns?: string
  [key: string]: any
}

interface FollowUpResponse {
  id: string
  followUpId: string
  dayNumber: number
  createdAt: string | Date
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  redFlags: string[]
  questionnaireData?: QuestionnaireData
  aiAnalysis?: string
}

interface FollowUpResponseCardProps {
  response: FollowUpResponse
  isLatest?: boolean
}

export function FollowUpResponseCard({ response, isLatest = false }: FollowUpResponseCardProps) {
  const [expanded, setExpanded] = useState(isLatest)
  const rawData = response.questionnaireData || {}

  // Normalizar dados - aceitar ambos os formatos (IA e formulário)
  const data = {
    ...rawData,
    // Dor em repouso: aceitar painAtRest ou pain
    painAtRest: rawData.painAtRest ?? rawData.pain,
    // Dor durante evacuação: also check painDuringBowelMovement
    painDuringEvacuation: rawData.painDuringEvacuation ?? rawData.painDuringBowel ?? rawData.painDuringBowelMovement,
    // Evacuação: aceitar hadBowelMovement ou evacuated
    hadBowelMovement: rawData.hadBowelMovement ?? rawData.evacuated,
    // Febre: aceitar hasFever ou fever
    hasFever: rawData.hasFever ?? rawData.fever,
    // Medicações: aceitar usedPrescribedMeds ou medications
    usedPrescribedMeds: rawData.usedPrescribedMeds ?? rawData.medications,
    // Medicação extra: aceitar usedExtraMeds ou usedExtraMedication
    usedExtraMeds: rawData.usedExtraMeds ?? rawData.usedExtraMedication,
    // Detalhes da medicação extra
    extraMedsDetails: rawData.extraMedsDetails ?? rawData.extraMedicationDetails,
    // Sangramento: converter boolean para string se necessário
    bleeding: typeof rawData.bleeding === 'boolean'
      ? (rawData.bleeding ? 'leve' : 'none')
      : (rawData.bleeding || 'none'),
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      default: return 'bg-green-500 text-white'
    }
  }

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical': return 'CRÍTICO'
      case 'high': return 'ALTO'
      case 'medium': return 'MÉDIO'
      default: return 'BAIXO'
    }
  }

  const getBleedingLabel = (bleeding?: string) => {
    if (!bleeding || bleeding === 'none' || bleeding === 'nenhum') return { text: "Sem sangramento", color: "text-green-600" }
    const labels: Record<string, { text: string; color: string }> = {
      // Formato do formulário
      none: { text: "Sem sangramento", color: "text-green-600" },
      paper: { text: "Só no papel", color: "text-yellow-600" },
      bowl: { text: "No vaso", color: "text-orange-600" },
      clots: { text: "Com coágulos", color: "text-red-600" },
      // Formato da IA
      nenhum: { text: "Sem sangramento", color: "text-green-600" },
      leve: { text: "Sangramento leve", color: "text-yellow-600" },
      moderado: { text: "Sangramento moderado", color: "text-orange-600" },
      intenso: { text: "Sangramento intenso", color: "text-red-600" },
    }
    return labels[bleeding] || { text: bleeding, color: "text-gray-600" }
  }

  const getRedFlagLabel = (flag: string): string => {
    const labels: Record<string, string> = {
      febre_alta: "Febre alta",
      dor_intensa: "Dor intensa",
      sangramento_ativo: "Sangramento ativo",
      retencao_urinaria: "Retenção urinária",
      sem_evacuacao: "Sem evacuação",
      incontinencia_fecal: "Incontinência fecal",
      secrecao_purulenta: "Secreção purulenta",
      edema_importante: "Edema importante",
      nausea_vomito: "Náusea/vômito",
      dispneia: "Dispneia",
      alteracao_consciencia: "Alteração consciência",
    }
    return labels[flag] || flag
  }

  const responseDate = new Date(response.createdAt)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`
          border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer
          ${response.riskLevel === 'critical' ? 'border-l-red-500 bg-red-50/50' : ''}
          ${response.riskLevel === 'high' ? 'border-l-orange-500 bg-orange-50/50' : ''}
          ${response.riskLevel === 'medium' ? 'border-l-yellow-500 bg-yellow-50/30' : ''}
          ${response.riskLevel === 'low' ? 'border-l-green-500' : ''}
          ${isLatest ? 'ring-2 ring-blue-200' : ''}
        `}
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent className="p-4">
          {/* Header sempre visível */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="text-sm font-bold px-3 py-1"
                style={{ backgroundColor: '#0A2647', color: 'white' }}
              >
                D+{response.dayNumber}
              </Badge>

              <Badge className={`${getRiskColor(response.riskLevel)} font-semibold`}>
                {getRiskLabel(response.riskLevel)}
              </Badge>

              {isLatest && (
                <Badge className="bg-blue-500 text-white">
                  Mais recente
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span title={format(responseDate, "dd/MM/yyyy HH:mm", { locale: ptBR })}>
                {formatDistanceToNow(responseDate, { locale: ptBR, addSuffix: true })}
              </span>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>

          {/* Resumo rápido sempre visível */}
          <div className="flex flex-wrap gap-4 mt-3">
            {data.painAtRest !== undefined && (
              <div className="flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  Dor repouso: <strong className={data.painAtRest >= 7 ? 'text-red-600' : ''}>{data.painAtRest}/10</strong>
                </span>
              </div>
            )}

            {data.hasFever && data.temperature && (
              <div className="flex items-center gap-1.5">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 font-semibold">
                  {data.temperature}°C
                </span>
              </div>
            )}

            {response.redFlags.length > 0 && (
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 font-semibold">
                  {response.redFlags.length} alerta{response.redFlags.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Conteúdo expandido */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Dados de Dor */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Dor em repouso */}
                    <div className="bg-white rounded-lg p-3 border shadow-sm">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Activity className="h-4 w-4" />
                        <span className="text-xs font-medium">Dor em repouso</span>
                      </div>
                      <div className={`text-2xl font-bold ${(data.painAtRest || 0) >= 7 ? 'text-red-600' : (data.painAtRest || 0) >= 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {data.painAtRest ?? '-'}/10
                      </div>
                    </div>

                    {/* Dor durante evacuação */}
                    {data.hadBowelMovement && (
                      <div className="bg-white rounded-lg p-3 border shadow-sm">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Activity className="h-4 w-4" />
                          <span className="text-xs font-medium">Dor evacuação</span>
                        </div>
                        <div className={`text-2xl font-bold ${(data.painDuringEvacuation || 0) >= 7 ? 'text-red-600' : (data.painDuringEvacuation || 0) >= 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {data.painDuringEvacuation ?? '-'}/10
                        </div>
                      </div>
                    )}

                    {/* Temperatura */}
                    <div className="bg-white rounded-lg p-3 border shadow-sm">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Thermometer className="h-4 w-4" />
                        <span className="text-xs font-medium">Temperatura</span>
                      </div>
                      {data.hasFever ? (
                        <div className="text-2xl font-bold text-red-600">
                          {data.temperature}°C
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-green-600">
                          Normal
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Evacuação */}
                  <div className="bg-white rounded-lg p-3 border shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      {data.hadBowelMovement ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                      <span className="font-medium">
                        {data.hadBowelMovement ? 'Evacuou' : 'Não evacuou'}
                      </span>
                      {data.bowelMovementTime && (
                        <span className="text-gray-500 text-sm">
                          às {data.bowelMovementTime}
                        </span>
                      )}
                    </div>

                    {data.bleeding && (
                      <div className="flex items-center gap-2 mt-2">
                        <Droplets className="h-4 w-4" />
                        <span className={`text-sm ${getBleedingLabel(data.bleeding)?.color}`}>
                          {getBleedingLabel(data.bleeding)?.text}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Medicações */}
                  <div className="bg-white rounded-lg p-3 border shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">Medicações</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.usedPrescribedMeds && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Usou prescritas
                        </Badge>
                      )}
                      {data.usedExtraMeds && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Usou extras
                        </Badge>
                      )}
                      {!data.usedPrescribedMeds && !data.usedExtraMeds && (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          Não usou analgésicos
                        </Badge>
                      )}
                    </div>
                    {data.extraMedsDetails && (
                      <p className="text-sm text-gray-600 mt-2">
                        Detalhes: {data.extraMedsDetails}
                      </p>
                    )}
                  </div>

                  {/* Secreção */}
                  {(data.discharge === true || data.hasPurulentDischarge) && (
                    <div className="bg-white rounded-lg p-3 border shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Secreção pela ferida</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.dischargeType && (
                          <Badge variant="outline" className={`${data.dischargeType === 'purulent' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                            {data.dischargeType === 'clear' ? 'Clara' : data.dischargeType === 'yellowish' ? 'Amarelada' : data.dischargeType === 'purulent' ? 'Purulenta' : data.dischargeType === 'bloody' ? 'Sanguinolenta' : data.dischargeType}
                          </Badge>
                        )}
                        {data.dischargeAmount && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            {data.dischargeAmount === 'minimal' ? 'Pouca' : data.dischargeAmount === 'moderate' ? 'Moderada' : data.dischargeAmount === 'abundant' ? 'Muita' : data.dischargeAmount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cuidados Locais */}
                  {data.localCareAdherence !== undefined && (
                    <div className="bg-white rounded-lg p-3 border shadow-sm">
                      <div className="flex items-center gap-2">
                        {data.localCareAdherence ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        )}
                        <span className="font-medium">
                          Cuidados locais: {data.localCareAdherence ? 'Seguindo orientações' : 'Não está seguindo'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Sintomas Adicionais */}
                  {data.additionalSymptoms && (
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium text-yellow-900">Sintomas Adicionais</span>
                      </div>
                      <p className="text-sm text-yellow-800">{data.additionalSymptoms}</p>
                    </div>
                  )}

                  {/* Preocupações */}
                  {data.concerns && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-purple-900">Preocupações do Paciente</span>
                      </div>
                      <p className="text-sm text-purple-800">{data.concerns}</p>
                    </div>
                  )}

                  {/* Pesquisa de Satisfação */}
                  {data.satisfactionRating !== undefined && (
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-indigo-900">Pesquisa de Satisfação (D+14)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-xs text-indigo-600">Nota</span>
                          <div className={`text-2xl font-bold ${(data.satisfactionRating ?? 0) >= 9 ? 'text-green-600' : (data.satisfactionRating ?? 0) >= 7 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {data.satisfactionRating}/10
                          </div>
                        </div>
                        {data.wouldRecommend !== undefined && (
                          <div>
                            <span className="text-xs text-indigo-600">Recomendaria?</span>
                            <div className={`text-lg font-bold ${data.wouldRecommend ? 'text-green-600' : 'text-red-600'}`}>
                              {data.wouldRecommend ? 'Sim' : 'Não'}
                            </div>
                          </div>
                        )}
                      </div>
                      {data.positiveFeedback && (
                        <p className="text-sm text-indigo-800 mt-2">
                          <strong>Elogios:</strong> {data.positiveFeedback}
                        </p>
                      )}
                      {data.improvementSuggestions && (
                        <p className="text-sm text-indigo-800 mt-1">
                          <strong>Sugestões:</strong> {data.improvementSuggestions}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Red Flags */}
                  {response.redFlags.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <span className="font-medium text-red-900">Alertas Detectados</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {response.redFlags.map((flag, idx) => (
                          <Badge key={idx} variant="destructive" className="bg-red-500">
                            {getRedFlagLabel(flag)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Análise da IA */}
                  {response.aiAnalysis && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-blue-900">Análise da IA</span>
                      </div>
                      <p className="text-sm text-blue-800 whitespace-pre-wrap">
                        {response.aiAnalysis}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
