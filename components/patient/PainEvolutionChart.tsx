"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ComposedChart,
  Line,
  Scatter,
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

interface EvacuationPoint {
  day: number
  dayLabel: string
  pain: number
  time?: string
  source: string // follow-up de onde veio o relato (ex: "D+3")
}

interface PainData {
  day: number
  label: string
  date: string
  painAtRest: number | null
  painDuringEvacuation: number | null // representativo para a linha de tendência
  evacuations: EvacuationPoint[]      // todas as evacuações individuais deste dia
  hasRedFlag: boolean
  usedExtraMedication: boolean
  extraMedicationDetails: string | null
}

interface PainEvolutionChartProps {
  patientId: string
  baselinePain?: number | null
}

// Tooltip customizado que mostra evacuações individuais com horários
function CustomPainTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null

  const item = payload[0]?.payload as PainData | undefined
  if (!item) return null

  const dayLabel = `D+${item.day}`
  const dateStr = item.date ? ` — ${item.date}` : ''

  return (
    <div
      style={{
        backgroundColor: 'rgba(10, 38, 71, 0.95)',
        borderRadius: 8,
        border: 'none',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        padding: '10px 14px',
        maxWidth: 280,
      }}
    >
      <p style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 6 }}>
        {dayLabel}{dateStr}
      </p>

      {item.painAtRest !== null && (
        <p style={{ fontSize: 13, marginBottom: 2 }}>
          <span style={{ color: '#14BDAE' }}>Dor em repouso:</span>{' '}
          {item.painAtRest}/10
          {item.hasRedFlag ? ' \u26A0\uFE0F ALERTA' : ''}
          {item.usedExtraMedication
            ? ` \uD83D\uDC8A ${item.extraMedicationDetails || 'Medicação extra'}`
            : ''}
        </p>
      )}

      {item.evacuations && item.evacuations.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <p style={{ fontSize: 12, color: '#F0EAD6', fontWeight: 600, marginBottom: 3 }}>
            Evacuações:
          </p>
          {item.evacuations.map((evac, i) => (
            <p key={i} style={{ fontSize: 12, marginLeft: 8, marginBottom: 1, color: '#e5e5e5' }}>
              {evac.time ? `${evac.time} → ` : '• '}dor {evac.pain}/10
              {evac.source !== dayLabel && (
                <span style={{ color: '#7A8299', fontSize: 11 }}> (relatado em {evac.source})</span>
              )}
            </p>
          ))}
        </div>
      )}

      {item.painDuringEvacuation !== null && (!item.evacuations || item.evacuations.length === 0) && (
        <p style={{ fontSize: 13, marginTop: 2 }}>
          <span style={{ color: '#F0EAD6' }}>Dor durante evacuação:</span>{' '}
          {item.painDuringEvacuation}/10
        </p>
      )}
    </div>
  )
}

export function PainEvolutionChart({ patientId, baselinePain }: PainEvolutionChartProps) {
  const [data, setData] = useState<PainData[]>([])
  const [scatterData, setScatterData] = useState<EvacuationPoint[]>([])
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
        const allEvacuations: EvacuationPoint[] = []

        // Dias padrão de follow-up
        const followUpDays = [1, 2, 3, 4, 5, 6, 7, 10, 14]
        followUpDays.forEach(day => {
          painDataMap.set(day, {
            day,
            label: `D+${day}`,
            date: '',
            painAtRest: null,
            painDuringEvacuation: null,
            evacuations: [],
            hasRedFlag: false,
            usedExtraMedication: false,
            extraMedicationDetails: null,
          })
        })

        // Helper para garantir que um dia existe no mapa
        const ensureDay = (d: number) => {
          if (!painDataMap.has(d)) {
            painDataMap.set(d, {
              day: d, label: `D+${d}`, date: '',
              painAtRest: null, painDuringEvacuation: null,
              evacuations: [],
              hasRedFlag: false, usedExtraMedication: false, extraMedicationDetails: null,
            })
          }
        }

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
            ensureDay(day)

            // Dor em repouso sempre no dia do follow-up
            const dayEntry = painDataMap.get(day)!
            dayEntry.painAtRest = parsed.painAtRest
            dayEntry.date = resp.createdAt ? new Date(resp.createdAt).toLocaleDateString('pt-BR') : ''
            dayEntry.hasRedFlag = parsed.hasRedFlags
            dayEntry.usedExtraMedication = parsed.usedExtraMedication
            dayEntry.extraMedicationDetails = parsed.extraMedicationDetails

            // Dor durante evacuação: coletar TODAS as evacuações individuais
            if (parsed.evacuationDetails && parsed.evacuationDetails.length > 0) {
              for (const evac of parsed.evacuationDetails) {
                const evacPoint: EvacuationPoint = {
                  day: evac.actualDay,
                  dayLabel: `D+${evac.actualDay}`,
                  pain: evac.pain,
                  time: evac.time,
                  source: `D+${day}`,
                }
                allEvacuations.push(evacPoint)

                // Adicionar ao array de evacuações do dia real
                ensureDay(evac.actualDay)
                painDataMap.get(evac.actualDay)!.evacuations.push(evacPoint)
              }

              // Para a linha de tendência: usar a evacuação do próprio dia do follow-up,
              // ou a mais recente se não houver uma do dia atual
              const todayEvac = parsed.evacuationDetails.find(e => e.actualDay === day)
              const representativeEvac = todayEvac || parsed.evacuationDetails[parsed.evacuationDetails.length - 1]
              ensureDay(representativeEvac.actualDay)
              painDataMap.get(representativeEvac.actualDay)!.painDuringEvacuation = representativeEvac.pain
            } else if (parsed.painDuringEvacuation !== null) {
              // Fallback: dados legados sem evacuationDetails
              const evacDay = parsed.evacuationActualDay ?? day
              ensureDay(evacDay)
              painDataMap.get(evacDay)!.painDuringEvacuation = parsed.painDuringEvacuation

              // Criar ponto de evacuação a partir dos dados legados
              const legacyPoint: EvacuationPoint = {
                day: evacDay,
                dayLabel: `D+${evacDay}`,
                pain: parsed.painDuringEvacuation,
                source: `D+${day}`,
              }
              painDataMap.get(evacDay)!.evacuations.push(legacyPoint)
              allEvacuations.push(legacyPoint)
            }
          })

        const sortedData = Array.from(painDataMap.values()).sort((a, b) => a.day - b.day)
        setData(sortedData)
        setScatterData(allEvacuations)
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

  // Cor baseada no nível de dor
  const getPainColor = (value: number) => {
    if (value >= 7) return '#DC2626' // vermelho
    if (value >= 4) return '#F59E0B' // amarelo
    return '#10B981' // verde
  }

  // Custom dot para colorir baseado no nível de dor (linhas)
  const renderDot = (props: any) => {
    const { cx, cy, payload, dataKey } = props
    const value = payload[dataKey]
    if (value === null || value === undefined || cx === undefined || cy === undefined) return null

    const isRedFlag = payload.hasRedFlag
    const usedMeds = payload.usedExtraMedication
    const radius = isRedFlag ? 6 : 4
    const fill = getPainColor(value)

    if (usedMeds) {
      return (
        <g key={`dot-med-${cx}-${cy}`}>
          <circle
            cx={cx}
            cy={cy}
            r={radius + 1}
            fill={fill}
            stroke="#8B5CF6"
            strokeWidth={2.5}
          />
          <text
            x={cx}
            y={cy - 12}
            textAnchor="middle"
            fontSize={11}
          >
            💊
          </text>
        </g>
      )
    }

    return (
      <circle
        key={`dot-${cx}-${cy}`}
        cx={cx}
        cy={cy}
        r={radius}
        fill={fill}
        stroke={isRedFlag ? '#DC2626' : dataKey === 'painAtRest' ? '#14BDAE' : '#F0EAD6'}
        strokeWidth={isRedFlag ? 3 : 2}
      />
    )
  }

  // Dot customizado para Scatter de evacuações individuais
  const renderEvacScatterDot = (props: any) => {
    const { cx, cy, payload } = props
    if (cx === undefined || cy === undefined || !payload) return <g />

    const pain = payload.pain as number
    const time = payload.time as string | undefined
    const fill = getPainColor(pain)

    return (
      <g key={`evac-${cx}-${cy}-${payload.time || ''}`}>
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill={fill}
          stroke="#F0EAD6"
          strokeWidth={2}
        />
        {time && (
          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            fontSize={9}
            fill="#F0EAD6"
            fontFamily="Inter, sans-serif"
          >
            {time}
          </text>
        )}
      </g>
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
      <Card style={{ backgroundColor: '#111520', borderColor: 'rgba(220,38,38,0.3)' }}>
        <CardContent className="py-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 font-medium">{error}</p>
          <Button onClick={fetchPainData} variant="outline" className="mt-4" style={{ borderColor: '#1E2535', color: '#D8DEEB' }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  const hasData = data.some(d => d.painAtRest !== null)

  // Ticks do eixo X: todos os dias que existem nos dados
  const xTicks = data.map(d => d.day)

  return (
    <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <Activity className="h-4 w-4 md:h-5 md:w-5" style={{ color: '#14BDAE' }} />
            <div>
              <CardTitle className="text-base md:text-lg" style={{ color: '#F0EAD6' }}>Evolução da Dor</CardTitle>
              <p className="text-xs md:text-sm mt-0.5 md:mt-1" style={{ color: '#7A8299' }}>
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
              style={showEvacuation ? { backgroundColor: '#F0EAD6', color: '#0B0E14' } : {}}
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
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-full border-2 border-purple-500 bg-purple-100 flex items-center justify-center text-[6px] leading-none">💊</div>
            <span>Usou medicação extra (Tramadol, Codeína, etc.)</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 md:p-4">
        {!hasData ? (
          <div className="text-center py-8 md:py-12">
            <Activity className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4" style={{ color: '#2A3147' }} />
            <h3 className="text-base md:text-lg font-medium mb-2" style={{ color: '#D8DEEB' }}>
              Sem dados de dor ainda
            </h3>
            <p className="text-xs md:text-sm" style={{ color: '#7A8299' }}>
              Os dados aparecerão quando o paciente responder.
            </p>
          </div>
        ) : (
          <div className="h-56 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" />
                <XAxis
                  dataKey="day"
                  type="number"
                  domain={[0.5, Math.max(14.5, (data[data.length - 1]?.day || 14) + 0.5)]}
                  ticks={xTicks}
                  tickFormatter={(day: number) => `D+${day}`}
                  tick={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fill: '#7A8299' }}
                />
                <YAxis
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                  tick={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fill: '#7A8299' }}
                  label={{
                    value: 'Nível de dor (EVA)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontFamily: 'Inter, sans-serif', fontSize: 12, fill: '#7A8299' },
                  }}
                />
                <Tooltip
                  content={<CustomPainTooltip />}
                />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ color: '#D8DEEB' }}
                  formatter={(value: string) => {
                    if (value === 'painAtRest') return 'Dor em repouso'
                    if (value === 'painDuringEvacuation') return 'Dor evacuação (tendência)'
                    if (value === 'pain') return 'Evacuações individuais'
                    return value
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="painAtRest"
                  stroke="#14BDAE"
                  strokeWidth={3}
                  dot={(props: any) => renderDot({ ...props, dataKey: 'painAtRest' })}
                  connectNulls
                  name="painAtRest"
                />
                {showEvacuation && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="painDuringEvacuation"
                      stroke="#F0EAD6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      connectNulls
                      name="painDuringEvacuation"
                    />
                    <Scatter
                      dataKey="pain"
                      data={scatterData}
                      fill="#F0EAD6"
                      name="pain"
                      shape={renderEvacScatterDot}
                      legendType="diamond"
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Cards de resumo */}
        {hasData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-3 md:mt-4">
            {/* Pico de dor */}
            <div className="rounded-lg p-2 md:p-3" style={{ backgroundColor: '#1E2535', border: '1px solid rgba(220,38,38,0.3)' }}>
              <p className="text-[10px] md:text-xs text-red-400 font-medium">Pico de dor</p>
              <p className="text-lg md:text-2xl font-bold text-red-400">
                {Math.max(...data.filter(d => d.painAtRest !== null).map(d => d.painAtRest || 0))}/10
              </p>
              <p className="text-[10px] md:text-xs text-red-400/70">
                D+{data.find(d => d.painAtRest === Math.max(...data.filter(d => d.painAtRest !== null).map(d => d.painAtRest || 0)))?.day || '-'}
              </p>
            </div>

            {/* Última dor */}
            <div className="rounded-lg p-2 md:p-3" style={{ backgroundColor: '#1E2535', border: '1px solid rgba(13,115,119,0.3)' }}>
              <p className="text-[10px] md:text-xs font-medium" style={{ color: '#14BDAE' }}>Última</p>
              <p className="text-lg md:text-2xl font-bold" style={{ color: '#14BDAE' }}>
                {data.filter(d => d.painAtRest !== null).slice(-1)[0]?.painAtRest ?? '-'}/10
              </p>
              <p className="text-[10px] md:text-xs" style={{ color: '#0D7377' }}>
                D+{data.filter(d => d.painAtRest !== null).slice(-1)[0]?.day || '-'}
              </p>
            </div>

            {/* Medições */}
            <div className="rounded-lg p-2 md:p-3" style={{ backgroundColor: '#1E2535', border: '1px solid #2A3147' }}>
              <p className="text-[10px] md:text-xs font-medium" style={{ color: '#7A8299' }}>Medições</p>
              <p className="text-lg md:text-2xl font-bold" style={{ color: '#D8DEEB' }}>
                {data.filter(d => d.painAtRest !== null).length}
              </p>
              <p className="text-[10px] md:text-xs" style={{ color: '#7A8299' }}>de {data.length} dias</p>
            </div>

            {/* Alertas */}
            <div className="rounded-lg p-2 md:p-3" style={{ backgroundColor: '#1E2535', border: '1px solid rgba(249,115,22,0.3)' }}>
              <p className="text-[10px] md:text-xs text-orange-400 font-medium">Alertas</p>
              <p className="text-lg md:text-2xl font-bold text-orange-400">
                {data.filter(d => d.hasRedFlag).length}
              </p>
              <p className="text-[10px] md:text-xs text-orange-400/70">dias</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
