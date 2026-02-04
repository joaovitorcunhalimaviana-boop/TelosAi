"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Activity,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { parseQuestionnaireData } from "@/lib/questionnaire-parser"

interface PainData {
  day: number
  label: string
  date: string
  painAtRest: number | null
  painDuringEvacuation: number | null
  hasRedFlag: boolean
}

interface PainEvolutionChartProps {
  patientId: string
  baselinePain?: number | null
}

export function PainEvolutionChart({ patientId, baselinePain }: PainEvolutionChartProps) {
  const [data, setData] = useState<PainData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEvacuation, setShowEvacuation] = useState(true)

  const fetchPainData = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/paciente/${patientId}`)

      if (!response.ok) {
        throw new Error('Falha ao carregar dados de dor')
      }

      const result = await response.json()

      if (result.success && result.data) {
        const painDataMap = new Map<number, PainData>()

        // Dias padrão de follow-up
        const followUpDays = [1, 2, 3, 5, 7, 10, 14]
        followUpDays.forEach(day => {
          painDataMap.set(day, {
            day,
            label: `D+${day}`,
            date: '',
            painAtRest: null,
            painDuringEvacuation: null,
            hasRedFlag: false,
          })
        })

        // Processar followUps usando parser centralizado
        const followUps = result.data.followUps || []
        followUps
          .filter((f: any) => f.responses && f.responses.length > 0)
          .forEach((f: any) => {
            const resp = f.responses[f.responses.length - 1]
            const parsed = parseQuestionnaireData(resp.questionnaireData, {
              painAtRest: resp.painAtRest,
              painDuringBowel: resp.painDuringBowel,
              redFlags: resp.redFlags,
              riskLevel: resp.riskLevel,
            })

            const day = f.dayNumber

            if (followUpDays.includes(day) || painDataMap.has(day)) {
              painDataMap.set(day, {
                day,
                label: `D+${day}`,
                date: resp.createdAt ? new Date(resp.createdAt).toLocaleDateString('pt-BR') : '',
                painAtRest: parsed.painAtRest ?? 0,
                painDuringEvacuation: parsed.painDuringEvacuation,
                hasRedFlag: parsed.hasRedFlags,
              })
            }
          })

        const sortedData = Array.from(painDataMap.values()).sort((a, b) => a.day - b.day)
        setData(sortedData)
      } else {
        throw new Error(result.error?.message || 'Erro desconhecido')
      }
    } catch (err) {
      console.error('Erro ao carregar dados de dor:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPainData()
  }, [patientId])

  // Calcular tendência
  const calculateTrend = () => {
    const validData = data.filter(d => d.painAtRest !== null)
    if (validData.length < 2) return 'neutral'

    const firstHalf = validData.slice(0, Math.ceil(validData.length / 2))
    const secondHalf = validData.slice(Math.floor(validData.length / 2))

    const avgFirst = firstHalf.reduce((sum, d) => sum + (d.painAtRest || 0), 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((sum, d) => sum + (d.painAtRest || 0), 0) / secondHalf.length

    if (avgSecond < avgFirst - 0.5) return 'improving'
    if (avgSecond > avgFirst + 0.5) return 'worsening'
    return 'stable'
  }

  const trend = calculateTrend()

  // Calcular média de dor
  const avgPain = () => {
    const validData = data.filter(d => d.painAtRest !== null)
    if (validData.length === 0) return null
    return (validData.reduce((sum, d) => sum + (d.painAtRest || 0), 0) / validData.length).toFixed(1)
  }

  // Custom dot para colorir baseado no nível de dor
  const renderDot = (props: any) => {
    const { cx, cy, payload, dataKey } = props
    const value = payload[dataKey]
    if (value === null || value === undefined || cx === undefined || cy === undefined) return null

    const isRedFlag = payload.hasRedFlag
    const radius = isRedFlag ? 6 : 4
    let fill = '#10B981' // verde
    if (value >= 7) fill = '#DC2626' // vermelho
    else if (value >= 4) fill = '#F59E0B' // amarelo

    return (
      <circle
        key={`dot-${cx}-${cy}`}
        cx={cx}
        cy={cy}
        r={radius}
        fill={fill}
        stroke={isRedFlag ? '#DC2626' : dataKey === 'painAtRest' ? '#0A2647' : '#D4AF37'}
        strokeWidth={isRedFlag ? 3 : 2}
      />
    )
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
        <CardContent>
          <Skeleton className="h-64 w-full" />
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
          <Button onClick={fetchPainData} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  const hasData = data.some(d => d.painAtRest !== null)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <Activity className="h-4 w-4 md:h-5 md:w-5 text-[#0A2647]" />
            <div>
              <CardTitle className="text-base md:text-lg text-[#0A2647]">Evolução da Dor</CardTitle>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">
                Escala Visual Analógica (0-10)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Tendência */}
            {hasData && (
              <Badge
                variant="outline"
                className={`
                  ${trend === 'improving' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                  ${trend === 'worsening' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                  ${trend === 'stable' ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
                `}
              >
                {trend === 'improving' && <TrendingDown className="h-3 w-3 mr-1" />}
                {trend === 'worsening' && <TrendingUp className="h-3 w-3 mr-1" />}
                {trend === 'stable' && <Minus className="h-3 w-3 mr-1" />}
                {trend === 'improving' ? 'Melhorando' : trend === 'worsening' ? 'Piorando' : 'Estável'}
              </Badge>
            )}

            {/* Média */}
            {avgPain() && (
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                Média: {avgPain()}/10
              </Badge>
            )}

            {/* Toggle evacuação */}
            <Button
              variant={showEvacuation ? "default" : "outline"}
              size="sm"
              onClick={() => setShowEvacuation(!showEvacuation)}
              style={showEvacuation ? { backgroundColor: '#D4AF37' } : {}}
            >
              Evacuação
            </Button>
          </div>
        </div>

        {/* Legenda de cores */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Dor leve (0-3)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Dor moderada (4-6)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Dor intensa (7-10)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-full border-2 border-red-500 bg-white" />
            <span>Com alerta</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 md:p-4">
        {!hasData ? (
          <div className="text-center py-8 md:py-12">
            <Activity className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-700 mb-2">
              Sem dados de dor ainda
            </h3>
            <p className="text-gray-500 text-xs md:text-sm">
              Os dados aparecerão quando o paciente responder.
            </p>
          </div>
        ) : (
          <div className="h-56 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontFamily: 'Inter, sans-serif', fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                  tick={{ fontFamily: 'Inter, sans-serif', fontSize: 12 }}
                  label={{
                    value: 'Nível de dor (EVA)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontFamily: 'Inter, sans-serif', fontSize: 12 },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 38, 71, 0.95)',
                    borderRadius: 8,
                    border: 'none',
                    color: '#fff',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}
                  itemStyle={{ color: '#fff', fontSize: 13 }}
                  formatter={(value: any, name: string, props: any) => {
                    if (value === null) return [null, null]
                    const label = name === 'painAtRest' ? 'Dor em repouso' : 'Dor durante evacuação'
                    const suffix = props.payload.hasRedFlag && name === 'painAtRest' ? ' ⚠️ ALERTA' : ''
                    return [`${value}/10${suffix}`, label]
                  }}
                  labelFormatter={(label: string, payload: readonly any[]) => {
                    const item = payload?.[0]?.payload
                    return item?.date ? `${label} — ${item.date}` : label
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value: string) =>
                    value === 'painAtRest' ? 'Dor em repouso' : 'Dor durante evacuação'
                  }
                />
                <Line
                  type="monotone"
                  dataKey="painAtRest"
                  stroke="#0A2647"
                  strokeWidth={3}
                  dot={(props: any) => renderDot({ ...props, dataKey: 'painAtRest' })}
                  connectNulls
                  name="painAtRest"
                />
                {showEvacuation && (
                  <Line
                    type="monotone"
                    dataKey="painDuringEvacuation"
                    stroke="#D4AF37"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={(props: any) => renderDot({ ...props, dataKey: 'painDuringEvacuation' })}
                    connectNulls
                    name="painDuringEvacuation"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Cards de resumo */}
        {hasData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-3 md:mt-4">
            {/* Pico de dor */}
            <div className="bg-red-50 rounded-lg p-2 md:p-3 border border-red-100">
              <p className="text-[10px] md:text-xs text-red-600 font-medium">Pico de dor</p>
              <p className="text-lg md:text-2xl font-bold text-red-700">
                {Math.max(...data.filter(d => d.painAtRest !== null).map(d => d.painAtRest || 0))}/10
              </p>
              <p className="text-[10px] md:text-xs text-red-500">
                D+{data.find(d => d.painAtRest === Math.max(...data.filter(d => d.painAtRest !== null).map(d => d.painAtRest || 0)))?.day || '-'}
              </p>
            </div>

            {/* Última dor */}
            <div className="bg-blue-50 rounded-lg p-2 md:p-3 border border-blue-100">
              <p className="text-[10px] md:text-xs text-blue-600 font-medium">Última</p>
              <p className="text-lg md:text-2xl font-bold text-blue-700">
                {data.filter(d => d.painAtRest !== null).slice(-1)[0]?.painAtRest ?? '-'}/10
              </p>
              <p className="text-[10px] md:text-xs text-blue-500">
                D+{data.filter(d => d.painAtRest !== null).slice(-1)[0]?.day || '-'}
              </p>
            </div>

            {/* Medições */}
            <div className="bg-gray-50 rounded-lg p-2 md:p-3 border border-gray-100">
              <p className="text-[10px] md:text-xs text-gray-600 font-medium">Medições</p>
              <p className="text-lg md:text-2xl font-bold text-gray-700">
                {data.filter(d => d.painAtRest !== null).length}
              </p>
              <p className="text-[10px] md:text-xs text-gray-500">de {data.length} dias</p>
            </div>

            {/* Alertas */}
            <div className="bg-orange-50 rounded-lg p-2 md:p-3 border border-orange-100">
              <p className="text-[10px] md:text-xs text-orange-600 font-medium">Alertas</p>
              <p className="text-lg md:text-2xl font-bold text-orange-700">
                {data.filter(d => d.hasRedFlag).length}
              </p>
              <p className="text-[10px] md:text-xs text-orange-500">dias</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
