"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ExternalLink, MessageCircle, Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { RedFlag } from "@/hooks/useRedFlags"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface RedFlagsCardProps {
  redFlags: RedFlag[]
  count: number
  onView: (followUpResponseId: string) => Promise<void>
}

export function RedFlagsCard({ redFlags, count, onView }: RedFlagsCardProps) {
  const router = useRouter()

  // Se não houver red flags, não renderiza nada
  if (count === 0 || redFlags.length === 0) {
    return null
  }

  const getSurgeryTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      hemorroidectomia: "Hemorroidectomia",
      fistula: "Fístula",
      fissura: "Fissura",
      pilonidal: "Pilonidal"
    }
    return labels[type] || type
  }

  const getRiskColor = (riskLevel: 'critical' | 'high') => {
    return riskLevel === 'critical'
      ? 'bg-red-500 text-white'
      : 'bg-orange-500 text-white'
  }

  const getRiskLabel = (riskLevel: 'critical' | 'high') => {
    return riskLevel === 'critical' ? 'CRÍTICO' : 'ALTO'
  }

  const getRedFlagLabel = (flag: string): string => {
    const labels: Record<string, string> = {
      febre_alta: "Febre alta (>38°C)",
      dor_intensa: "Dor intensa não controlada",
      sangramento_ativo: "Sangramento ativo",
      retencao_urinaria: "Retenção urinária",
      sem_evacuacao: "Sem evacuação prolongada",
      incontinencia_fecal: "Incontinência fecal",
      secrecao_purulenta: "Secreção purulenta",
      edema_importante: "Edema importante",
      nausea_vomito: "Náusea/vômito persistente",
      dispneia: "Dificuldade respiratória",
      alteracao_consciencia: "Alteração de consciência"
    }
    return labels[flag] || flag
  }

  const handleViewPatient = async (patientId: string, followUpResponseId: string) => {
    try {
      // Marca como visualizado
      await onView(followUpResponseId)

      // Redireciona para a página do paciente
      router.push(`/paciente/${patientId}/editar`)
    } catch (error) {
      console.error('Erro ao marcar como visualizado:', error)
      toast.error('Erro ao processar visualização')

      // Mesmo com erro, redireciona
      router.push(`/paciente/${patientId}/editar`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <Card className="border-4 border-red-500 shadow-2xl" style={{ backgroundColor: 'rgba(192, 57, 43, 0.1)' }} role="region" aria-label="Alertas urgentes de pacientes" aria-live="polite">
        <CardHeader className="pb-4 bg-red-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                aria-hidden="true"
              >
                <AlertCircle className="h-8 w-8" aria-hidden="true" />
              </motion.div>
              <span>
                ALERTAS URGENTES
              </span>
            </CardTitle>
            <Badge
              className="text-lg px-4 py-2 bg-white text-red-600 font-bold"
            >
              {count} {count === 1 ? 'paciente' : 'pacientes'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {redFlags.map((redFlag, index) => (
                <motion.div
                  key={redFlag.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="border-2 transition-all hover:shadow-lg" style={{ backgroundColor: '#161B27', borderColor: 'rgba(192, 57, 43, 0.4)' }} role="article" aria-label={`Alerta urgente: ${redFlag.patient.name}, ${getRiskLabel(redFlag.response.riskLevel)}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            {/* Header com nome e risco */}
                            <div className="flex items-start gap-3 flex-wrap">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold" style={{ color: '#F0EAD6' }}>
                                  {redFlag.patient.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge variant="outline" className="text-xs">
                                    {getSurgeryTypeLabel(redFlag.surgery.type)}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    D+{redFlag.followUp.dayNumber}
                                  </Badge>
                                  <span className="text-xs" style={{ color: '#7A8299' }}>
                                    {format(
                                      new Date(redFlag.response.createdAt),
                                      "dd/MM/yyyy 'às' HH:mm",
                                      { locale: ptBR }
                                    )}
                                  </span>
                                </div>
                              </div>
                              <Badge
                                className={`${getRiskColor(redFlag.response.riskLevel)} text-sm font-bold px-3 py-1 shrink-0`}
                              >
                                {getRiskLabel(redFlag.response.riskLevel)}
                              </Badge>
                            </div>

                            {/* Red Flags */}
                            {redFlag.response.redFlags.length > 0 && (
                              <div className="rounded-lg p-3" style={{ backgroundColor: '#0B0E14', border: '1px solid rgba(192, 57, 43, 0.3)' }}>
                                <p className="text-sm font-semibold mb-2" style={{ color: '#F0EAD6' }}>
                                  Sintomas Preocupantes:
                                </p>
                                <ul className="space-y-1">
                                  {redFlag.response.redFlags.slice(0, 3).map((flag, idx) => (
                                    <li
                                      key={idx}
                                      className="text-sm flex items-start gap-2"
                                      style={{ color: '#D8DEEB' }}
                                    >
                                      <span className="mt-0.5" style={{ color: '#C0392B' }}>•</span>
                                      <span>{getRedFlagLabel(flag)}</span>
                                    </li>
                                  ))}
                                  {redFlag.response.redFlags.length > 3 && (
                                    <li className="text-sm font-medium" style={{ color: '#C0392B' }}>
                                      + {redFlag.response.redFlags.length - 3} outros sintomas
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}

                            {/* Visualizado badge */}
                            {redFlag.isViewed && redFlag.lastViewedAt && (
                              <div className="text-xs" style={{ color: '#7A8299' }}>
                                Visualizado em{' '}
                                {format(
                                  new Date(redFlag.lastViewedAt),
                                  "dd/MM/yyyy 'às' HH:mm",
                                  { locale: ptBR }
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Botões de ação */}
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <Button
                            onClick={() => handleViewPatient(redFlag.patient.id, redFlag.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold gap-2"
                            size="sm"
                            aria-label={`Ver detalhes urgentes de ${redFlag.patient.name}`}
                          >
                            VER AGORA
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          {redFlag.patient.phone && (
                            <>
                              <a
                                href={`https://wa.me/${redFlag.patient.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                                style={{ backgroundColor: 'rgba(26, 140, 106, 0.15)', color: '#1A8C6A' }}
                                aria-label={`Enviar WhatsApp para ${redFlag.patient.name}`}
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                WhatsApp
                              </a>
                              <a
                                href={`tel:${redFlag.patient.phone}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                                style={{ backgroundColor: 'rgba(13, 115, 119, 0.15)', color: '#14BDAE' }}
                                aria-label={`Ligar para ${redFlag.patient.name}`}
                              >
                                <Phone className="h-3.5 w-3.5" />
                                Ligar
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {/* Informação adicional */}
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)' }} role="note">
            <p className="text-sm" style={{ color: '#D4AF37' }}>
              <strong>Atenção:</strong> Estes pacientes apresentam sintomas que requerem avaliação urgente.
              Os alertas permanecem visíveis por 24 horas após a primeira visualização.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
