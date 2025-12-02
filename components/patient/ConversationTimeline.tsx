"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FollowUpResponseCard } from "./FollowUpResponseCard"
import {
  MessageCircle,
  RefreshCw,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FollowUpResponse {
  id: string
  followUpId: string
  dayNumber: number
  createdAt: string | Date
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  redFlags: string[]
  questionnaireData?: any
  aiAnalysis?: string
}

interface FollowUpSummary {
  id: string
  dayNumber: number
  scheduledDate: string | Date
  status: 'pending' | 'sent' | 'responded' | 'overdue'
  sentAt?: string | Date
  respondedAt?: string | Date
  responseCount: number
  latestRiskLevel?: string
  hasRedFlags: boolean
}

interface TimelineData {
  responses: FollowUpResponse[]
  summary: FollowUpSummary[]
  stats: {
    totalFollowUps: number
    completedFollowUps: number
    pendingFollowUps: number
    overdueFollowUps: number
    highRiskResponses: number
  }
}

interface ConversationTimelineProps {
  patientId: string
}

type FilterType = 'all' | 'alerts' | 'pending'

export function ConversationTimeline({ patientId }: ConversationTimelineProps) {
  const [data, setData] = useState<TimelineData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [refreshing, setRefreshing] = useState(false)

  const fetchTimeline = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/paciente/${patientId}/timeline`)

      if (!response.ok) {
        throw new Error('Falha ao carregar timeline')
      }

      const result = await response.json()

      if (result.success) {
        // Transformar dados do timeline para o formato esperado
        const responses: FollowUpResponse[] = result.data.timeline
          .filter((event: any) => event.type === 'followup' && event.metadata?.riskLevel)
          .map((event: any) => ({
            id: event.id,
            followUpId: event.metadata?.followUpId || event.id,
            dayNumber: parseInt(event.title.replace(/\D/g, '')) || 0,
            createdAt: event.date,
            riskLevel: event.metadata?.riskLevel || 'low',
            redFlags: event.metadata?.redFlags || [],
            questionnaireData: event.metadata?.questionnaireData,
            aiAnalysis: event.metadata?.aiAnalysis,
          }))
          .sort((a: FollowUpResponse, b: FollowUpResponse) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )

        setData({
          responses,
          summary: result.data.followUpSummary || [],
          stats: result.data.stats || {
            totalFollowUps: 0,
            completedFollowUps: 0,
            pendingFollowUps: 0,
            overdueFollowUps: 0,
            highRiskResponses: 0,
          },
        })
      } else {
        throw new Error(result.error?.message || 'Erro desconhecido')
      }
    } catch (err) {
      console.error('Erro ao carregar timeline:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTimeline()
  }, [patientId])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchTimeline()
  }

  const filteredResponses = data?.responses.filter(response => {
    if (filter === 'alerts') {
      return response.riskLevel === 'high' || response.riskLevel === 'critical'
    }
    return true
  }) || []

  const pendingFollowUps = data?.summary.filter(s => s.status === 'pending' || s.status === 'sent') || []

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'responded': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'sent': return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'responded': return 'Respondido'
      case 'pending': return 'Pendente'
      case 'sent': return 'Enviado'
      case 'overdue': return 'Atrasado'
      default: return status
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-medium">{error}</p>
          <Button onClick={handleRefresh} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: '#0A2647' }}
            >
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Acompanhamento via WhatsApp</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {data?.stats.completedFollowUps || 0} de {data?.stats.totalFollowUps || 0} follow-ups respondidos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filtro */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {filter === 'all' ? 'Todos' : filter === 'alerts' ? 'Alertas' : 'Pendentes'}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  Todos ({data?.responses.length || 0})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('alerts')}>
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                  Com alertas ({data?.stats.highRiskResponses || 0})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Stats rápidos */}
        {data && (
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {data.stats.completedFollowUps} respondidos
            </Badge>
            {data.stats.pendingFollowUps > 0 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Clock className="h-3 w-3 mr-1" />
                {data.stats.pendingFollowUps} pendentes
              </Badge>
            )}
            {data.stats.overdueFollowUps > 0 && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {data.stats.overdueFollowUps} atrasados
              </Badge>
            )}
            {data.stats.highRiskResponses > 0 && (
              <Badge variant="destructive">
                {data.stats.highRiskResponses} alertas
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4">
        {/* Pendentes */}
        {pendingFollowUps.length > 0 && filter !== 'alerts' && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Aguardando resposta
            </h4>
            <div className="flex flex-wrap gap-2">
              {pendingFollowUps.map((followUp) => (
                <Badge
                  key={followUp.id}
                  variant="outline"
                  className={`
                    ${followUp.status === 'sent' ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
                    ${followUp.status === 'pending' ? 'bg-gray-50 border-gray-200 text-gray-700' : ''}
                  `}
                >
                  {getStatusIcon(followUp.status)}
                  <span className="ml-1">D+{followUp.dayNumber}</span>
                  <span className="ml-1 text-xs opacity-70">({getStatusLabel(followUp.status)})</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Lista de respostas */}
        {filteredResponses.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {filter === 'alerts' ? 'Nenhum alerta encontrado' : 'Nenhuma resposta ainda'}
            </h3>
            <p className="text-gray-500 text-sm">
              {filter === 'alerts'
                ? 'Não há respostas com alertas de alto risco.'
                : 'As respostas dos follow-ups aparecerão aqui quando o paciente responder.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">
              {filter === 'alerts' ? 'Respostas com alertas' : 'Histórico de respostas'}
            </h4>
            <AnimatePresence mode="popLayout">
              {filteredResponses.map((response, index) => (
                <FollowUpResponseCard
                  key={response.id}
                  response={response}
                  isLatest={index === 0}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
