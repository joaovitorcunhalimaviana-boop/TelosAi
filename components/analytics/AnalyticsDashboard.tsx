"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useState, useMemo } from "react"
import { TrendingUp, TrendingDown, Activity, Users, AlertTriangle, CheckCircle } from "lucide-react"
import { ExportPatientPDFButton } from "@/components/ExportPatientPDFButton"

interface AnalyticsData {
  totalPatients: number
  patients: {
    id: string
    name: string
    age: number | null
    sex: string | null
    surgeries: {
      id: string
      type: string
      date: string
      followUps: {
        dayNumber: number
        status: string
        responses: {
          questionnaireData: string
          riskLevel: string
          redFlags: string | null
        }[]
      }[]
    }[]
  }[]
}

interface AnalyticsDashboardProps {
  data: AnalyticsData
  userName: string
}

const COLORS = {
  primary: "#0A2647",
  secondary: "#D4AF37",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  purple: "#8B5CF6",
  pink: "#EC4899",
}

export function AnalyticsDashboard({ data, userName }: AnalyticsDashboardProps) {
  const [surgeryFilter, setSurgeryFilter] = useState<string>("all")
  const [periodFilter, setPeriodFilter] = useState<string>("30")

  // ========== PROCESSA DADOS ==========

  const processedData = useMemo(() => {
    let filtered = data.patients

    // Filtra por tipo de cirurgia
    if (surgeryFilter !== "all") {
      filtered = filtered.filter((p) => p.surgeries.some((s) => s.type === surgeryFilter))
    }

    // Filtra por período
    const periodDays = parseInt(periodFilter)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - periodDays)
    filtered = filtered.filter((p) =>
      p.surgeries.some((s) => new Date(s.date) >= cutoffDate)
    )

    // 1. Curva de Dor ao Longo do Tempo
    const painOverTime: Record<number, number[]> = {}
    filtered.forEach((patient) => {
      patient.surgeries.forEach((surgery) => {
        surgery.followUps.forEach((fu) => {
          if (fu.responses[0]) {
            try {
              const data = JSON.parse(fu.responses[0].questionnaireData)
              if (data.painLevel) {
                if (!painOverTime[fu.dayNumber]) painOverTime[fu.dayNumber] = []
                painOverTime[fu.dayNumber].push(Number(data.painLevel))
              }
            } catch {}
          }
        })
      })
    })

    const painChartData = Object.entries(painOverTime)
      .map(([day, values]) => ({
        day: `D+${day}`,
        dayNumber: Number(day),
        média: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
        n: values.length,
      }))
      .sort((a, b) => a.dayNumber - b.dayNumber)

    // 2. Distribuição de Tipos de Cirurgia
    const surgeryTypes: Record<string, number> = {}
    filtered.forEach((patient) => {
      patient.surgeries.forEach((surgery) => {
        surgeryTypes[surgery.type] = (surgeryTypes[surgery.type] || 0) + 1
      })
    })

    const surgeryDistribution = Object.entries(surgeryTypes).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))

    // 3. Níveis de Risco
    const riskLevels = { low: 0, medium: 0, high: 0, critical: 0 }
    filtered.forEach((patient) => {
      patient.surgeries.forEach((surgery) => {
        surgery.followUps.forEach((fu) => {
          if (fu.responses[0]) {
            const level = fu.responses[0].riskLevel as keyof typeof riskLevels
            if (level in riskLevels) {
              riskLevels[level]++
            }
          }
        })
      })
    })

    const riskDistribution = [
      { name: "Baixo", value: riskLevels.low, color: COLORS.success },
      { name: "Médio", value: riskLevels.medium, color: COLORS.warning },
      { name: "Alto", value: riskLevels.high, color: COLORS.error },
      { name: "Crítico", value: riskLevels.critical, color: "#991B1B" },
    ]

    // 4. Taxa de Resposta por Dia
    const responseRates: Record<number, { total: number; responded: number }> = {}
    filtered.forEach((patient) => {
      patient.surgeries.forEach((surgery) => {
        surgery.followUps.forEach((fu) => {
          if (!responseRates[fu.dayNumber]) {
            responseRates[fu.dayNumber] = { total: 0, responded: 0 }
          }
          responseRates[fu.dayNumber].total++
          if (fu.status === "responded") {
            responseRates[fu.dayNumber].responded++
          }
        })
      })
    })

    const responseRateData = Object.entries(responseRates)
      .map(([day, stats]) => ({
        day: `D+${day}`,
        dayNumber: Number(day),
        taxa: ((stats.responded / stats.total) * 100).toFixed(1),
      }))
      .sort((a, b) => a.dayNumber - b.dayNumber)

    // 5. Correlação Idade vs Dor
    const ageVsPain: { idade: number; dor: number }[] = []
    filtered.forEach((patient) => {
      if (patient.age) {
        patient.surgeries.forEach((surgery) => {
          const d1 = surgery.followUps.find((fu) => fu.dayNumber === 1)
          if (d1?.responses[0]) {
            try {
              const data = JSON.parse(d1.responses[0].questionnaireData)
              if (data.painLevel && patient.age !== null) {
                ageVsPain.push({
                  idade: patient.age,
                  dor: Number(data.painLevel),
                })
              }
            } catch {}
          }
        })
      }
    })

    // 6. Distribuição por Sexo
    const sexDistribution = [
      {
        name: "Masculino",
        value: filtered.filter((p) => p.sex === "Masculino").length,
        color: COLORS.info,
      },
      {
        name: "Feminino",
        value: filtered.filter((p) => p.sex === "Feminino").length,
        color: COLORS.pink,
      },
    ]

    // 7. KPIs
    const totalFollowUps = filtered.reduce(
      (acc, p) => acc + p.surgeries.reduce((a, s) => a + s.followUps.length, 0),
      0
    )
    const respondedFollowUps = filtered.reduce(
      (acc, p) =>
        acc +
        p.surgeries.reduce(
          (a, s) => a + s.followUps.filter((fu) => fu.status === "responded").length,
          0
        ),
      0
    )
    const responseRate = totalFollowUps > 0 ? ((respondedFollowUps / totalFollowUps) * 100).toFixed(1) : "0"

    const criticalAlerts = filtered.reduce(
      (acc, p) =>
        acc +
        p.surgeries.reduce(
          (a, s) =>
            a +
            s.followUps.filter((fu) => fu.responses[0]?.riskLevel === "critical").length,
          0
        ),
      0
    )

    return {
      painChartData,
      surgeryDistribution,
      riskDistribution,
      responseRateData,
      ageVsPain,
      sexDistribution,
      kpis: {
        totalPatients: filtered.length,
        totalFollowUps,
        responseRate,
        criticalAlerts,
      },
    }
  }, [data, surgeryFilter, periodFilter])

  // Tipos de cirurgia disponíveis
  const availableSurgeryTypes = Array.from(
    new Set(data.patients.flatMap((p) => p.surgeries.map((s) => s.type)))
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Avançado</h1>
          <p className="text-muted-foreground">
            Análises e insights dos seus pacientes, Dr. {userName}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Tipo de Cirurgia</label>
            <Select value={surgeryFilter} onValueChange={setSurgeryFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {availableSurgeryTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Período</label>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
                <SelectItem value="9999">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedData.kpis.totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">pacientes ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedData.kpis.responseRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {processedData.kpis.totalFollowUps} follow-ups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">{processedData.kpis.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">requerem atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dor Média D+1</CardTitle>
            <TrendingDown className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedData.painChartData[0]?.média || "-"}/10
            </div>
            <p className="text-xs text-muted-foreground mt-1">primeiro dia pós-op</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="pain" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="pain">Curva de Dor</TabsTrigger>
          <TabsTrigger value="surgery">Tipos de Cirurgia</TabsTrigger>
          <TabsTrigger value="risk">Níveis de Risco</TabsTrigger>
          <TabsTrigger value="response">Taxa de Resposta</TabsTrigger>
          <TabsTrigger value="correlation">Idade vs Dor</TabsTrigger>
        </TabsList>

        {/* 1. Curva de Dor ao Longo do Tempo */}
        <TabsContent value="pain">
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Dor Pós-Operatória</CardTitle>
              <CardDescription>
                Média de dor (escala 0-10) ao longo dos dias de acompanhamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={processedData.painChartData}>
                  <defs>
                    <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.error} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={COLORS.error} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="média"
                    stroke={COLORS.error}
                    fillOpacity={1}
                    fill="url(#colorPain)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Distribuição de Tipos de Cirurgia */}
        <TabsContent value="surgery">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Tipo de Cirurgia</CardTitle>
              <CardDescription>Quantidade de procedimentos realizados por tipo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={processedData.surgeryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {processedData.surgeryDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={Object.values(COLORS)[index % Object.values(COLORS).length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Níveis de Risco */}
        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Níveis de Risco</CardTitle>
              <CardDescription>
                Quantidade de follow-ups por nível de risco detectado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={processedData.riskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Quantidade">
                    {processedData.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Taxa de Resposta */}
        <TabsContent value="response">
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Resposta aos Follow-ups</CardTitle>
              <CardDescription>
                Percentual de pacientes que responderam por dia pós-operatório
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={processedData.responseRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="taxa"
                    name="Taxa de Resposta (%)"
                    stroke={COLORS.success}
                    strokeWidth={2}
                    dot={{ fill: COLORS.success, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Correlação Idade vs Dor */}
        <TabsContent value="correlation">
          <Card>
            <CardHeader>
              <CardTitle>Correlação Idade vs Dor (D+1)</CardTitle>
              <CardDescription>
                Relação entre idade do paciente e nível de dor no primeiro dia pós-operatório
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="idade" name="Idade" unit=" anos" />
                  <YAxis type="number" dataKey="dor" name="Dor" domain={[0, 10]} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Legend />
                  <Scatter
                    name="Pacientes"
                    data={processedData.ageVsPain}
                    fill={COLORS.primary}
                    opacity={0.6}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
