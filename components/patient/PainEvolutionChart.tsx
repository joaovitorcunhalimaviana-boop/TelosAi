"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import {
  Activity,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface PainData {
  day: number
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
      const response = await fetch(`/api/paciente/${patientId}/timeline`)

      if (!response.ok) {
        throw new Error('Falha ao carregar dados de dor')
      }

      const result = await response.json()

      if (result.success) {
        // Extrair dados de dor do timeline
        const painDataMap = new Map<number, PainData>()

        // Dias padrão de follow-up
        const followUpDays = [1, 2, 3, 5, 7, 10, 14]
        followUpDays.forEach(day => {
          painDataMap.set(day, {
            day,
            date: '',
            painAtRest: null,
            painDuringEvacuation: null,
            hasRedFlag: false,
          })
        })

        // Preencher com dados reais
        result.data.timeline
          .filter((event: any) => event.type === 'followup' && event.metadata?.riskLevel)
          .forEach((event: any) => {
            const dayMatch = event.title.match(/D\+(\d+)/)
            if (dayMatch) {
              const day = parseInt(dayMatch[1])
              const questionnaireData = event.metadata?.questionnaireData
              const hasRedFlags = (event.metadata?.redFlags || []).length > 0

              // Verificar se o paciente evacuou neste dia
              // Compatibilidade: IA pode salvar como 'bowelMovement', 'evacuated', ou 'evacuation'
              const didEvacuate = questionnaireData?.bowelMovement === true ||
                                  questionnaireData?.evacuated === true ||
                                  questionnaireData?.evacuation === true

              // Só mostrar dor durante evacuação se o paciente realmente evacuou
              // Se não evacuou, omitir o ponto (null) em vez de mostrar 0
              let painDuringEvacuation: number | null = null
              if (didEvacuate) {
                painDuringEvacuation = questionnaireData?.painDuringEvacuation ??
                                       questionnaireData?.painDuringBowelMovement ??
                                       questionnaireData?.painDuringBowel ?? null
              }

              if (painDataMap.has(day) || followUpDays.includes(day)) {
                // Usar EXATAMENTE a mesma lógica do gráfico "Ver Detalhes" que funciona corretamente
                // Ordem de prioridade: painAtRest > pain > dor > nivel_dor
                const painAtRestValue = questionnaireData?.painAtRest !== undefined && questionnaireData?.painAtRest !== null
                  ? Number(questionnaireData.painAtRest)
                  : questionnaireData?.pain !== undefined && questionnaireData?.pain !== null
                    ? Number(questionnaireData.pain)
                    : questionnaireData?.dor !== undefined && questionnaireData?.dor !== null
                      ? Number(questionnaireData.dor)
                      : questionnaireData?.nivel_dor !== undefined && questionnaireData?.nivel_dor !== null
                        ? Number(questionnaireData.nivel_dor)
                        : null

                painDataMap.set(day, {
                  day,
                  date: new Date(event.date).toLocaleDateString('pt-BR'),
                  painAtRest: painAtRestValue,
                  // Dor durante evacuação - só mostrar se paciente realmente evacuou
                  painDuringEvacuation: painDuringEvacuation,
                  hasRedFlag: hasRedFlags || event.metadata?.riskLevel === 'critical' || event.metadata?.riskLevel === 'high',
                })
              }
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

  // Dados para o gráfico
  const chartData: ChartData<'line'> = {
    labels: data.map(d => `D+${d.day}`),
    datasets: [
      {
        label: 'Dor em repouso',
        data: data.map(d => d.painAtRest),
        borderColor: '#0A2647',
        backgroundColor: 'rgba(10, 38, 71, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: data.map(d => d.hasRedFlag ? 8 : 5),
        pointBackgroundColor: data.map(d =>
          d.painAtRest === null ? 'transparent' :
          d.hasRedFlag ? '#DC2626' :
          (d.painAtRest || 0) >= 7 ? '#DC2626' :
          (d.painAtRest || 0) >= 4 ? '#F59E0B' :
          '#10B981'
        ),
        pointBorderColor: data.map(d =>
          d.painAtRest === null ? 'transparent' :
          d.hasRedFlag ? '#DC2626' :
          '#0A2647'
        ),
        pointBorderWidth: data.map(d => d.hasRedFlag ? 3 : 2),
        pointHoverRadius: 8,
        spanGaps: true,
      },
      ...(showEvacuation ? [{
        label: 'Dor durante evacuação',
        data: data.map(d => d.painDuringEvacuation),
        borderColor: '#D4AF37',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        fill: false,
        tension: 0.3,
        borderDash: [5, 5],
        pointRadius: 4,
        pointBackgroundColor: data.map(d =>
          d.painDuringEvacuation === null ? 'transparent' :
          (d.painDuringEvacuation || 0) >= 7 ? '#DC2626' :
          (d.painDuringEvacuation || 0) >= 4 ? '#F59E0B' :
          '#10B981'
        ),
        pointBorderColor: '#D4AF37',
        spanGaps: true,
      }] : []),
    ],
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(10, 38, 71, 0.95)',
        titleFont: {
          family: 'Inter, sans-serif',
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const dataIndex = context.dataIndex
            const painData = data[dataIndex]
            const value = context.parsed.y

            if (value === null) return ''

            let label = `${context.dataset.label}: ${value}/10`

            if (painData?.hasRedFlag) {
              label += ' ⚠️ ALERTA'
            }

            return label
          },
          afterBody: function(context) {
            const dataIndex = context[0].dataIndex
            const painData = data[dataIndex]

            if (painData?.date) {
              return [`Data: ${painData.date}`]
            }
            return []
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          font: {
            family: 'Inter, sans-serif',
          },
          callback: function(value) {
            return `${value}`
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Nível de dor (EVA)',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      line: {
        borderWidth: 3,
      },
    },
  }

  // Nota: Baseline de dor é exibido nos cards de resumo abaixo do gráfico

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
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: '#0A2647' }}
            >
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Evolução da Dor</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Escala Visual Analógica (0-10)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

      <CardContent className="p-4">
        {!hasData ? (
          <div className="text-center py-12">
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Sem dados de dor ainda
            </h3>
            <p className="text-gray-500 text-sm">
              Os dados de dor aparecerão aqui quando o paciente responder aos follow-ups.
            </p>
          </div>
        ) : (
          <div className="h-72 md:h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

        {/* Cards de resumo */}
        {hasData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {/* Pico de dor */}
            <div className="bg-red-50 rounded-lg p-3 border border-red-100">
              <p className="text-xs text-red-600 font-medium">Pico de dor</p>
              <p className="text-2xl font-bold text-red-700">
                {Math.max(...data.filter(d => d.painAtRest !== null).map(d => d.painAtRest || 0))}/10
              </p>
              <p className="text-xs text-red-500">
                D+{data.find(d => d.painAtRest === Math.max(...data.filter(d => d.painAtRest !== null).map(d => d.painAtRest || 0)))?.day || '-'}
              </p>
            </div>

            {/* Última dor */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium">Última medição</p>
              <p className="text-2xl font-bold text-blue-700">
                {data.filter(d => d.painAtRest !== null).slice(-1)[0]?.painAtRest ?? '-'}/10
              </p>
              <p className="text-xs text-blue-500">
                D+{data.filter(d => d.painAtRest !== null).slice(-1)[0]?.day || '-'}
              </p>
            </div>

            {/* Medições */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-xs text-gray-600 font-medium">Medições</p>
              <p className="text-2xl font-bold text-gray-700">
                {data.filter(d => d.painAtRest !== null).length}
              </p>
              <p className="text-xs text-gray-500">de {data.length} dias</p>
            </div>

            {/* Alertas */}
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
              <p className="text-xs text-orange-600 font-medium">Alertas</p>
              <p className="text-2xl font-bold text-orange-700">
                {data.filter(d => d.hasRedFlag).length}
              </p>
              <p className="text-xs text-orange-500">dias com alerta</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
