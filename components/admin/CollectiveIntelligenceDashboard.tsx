"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Download,
  AlertCircle,
  CheckCircle,
  Info,
  BarChart3,
  Brain,
  Database
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface CollectiveIntelligenceStats {
  overview: {
    totalDoctors: number
    totalPatients: number
    totalSurgeries: number
    totalFollowUps: number
  }
  metrics: {
    complicationRate: number
    avgPainD1: number
    pudendalBlockRate: number
  }
  painCurve: Array<{
    day: string
    dayNumber: number
    avgPain: number
    responses: number
  }>
  surgeryDistribution: Array<{
    type: string
    count: number
  }>
  topComorbidities: Array<{
    name: string
    count: number
  }>
  insights: Array<{
    type: "success" | "warning" | "info"
    title: string
    description: string
    impact: "high" | "medium" | "low"
  }>
  allDoctors: Array<{
    id: string
    name: string
    crm: string | null
    estado: string | null
    joinedAt: Date | null
  }>
}

interface Props {
  stats: CollectiveIntelligenceStats
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export function CollectiveIntelligenceDashboard({ stats }: Props) {
  const handleExportCSV = () => {
    // Exporta dados agregados para CSV
    const csvData = [
      ["Métrica", "Valor"],
      ["Total de Médicos Participantes", stats.overview.totalDoctors],
      ["Total de Pacientes", stats.overview.totalPatients],
      ["Total de Cirurgias", stats.overview.totalSurgeries],
      ["Total de Follow-ups Completos", stats.overview.totalFollowUps],
      ["Taxa de Complicações (%)", stats.metrics.complicationRate],
      ["Dor Média D+1", stats.metrics.avgPainD1],
      ["Taxa de Bloqueio Pudendo (%)", stats.metrics.pudendalBlockRate],
    ]

    const csv = csvData.map(row => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `collective-intelligence-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportForPublication = () => {
    // Exporta dados formatados para publicação científica
    const publicationData = {
      overview: stats.overview,
      metrics: stats.metrics,
      surgeryDistribution: stats.surgeryDistribution,
      topComorbidities: stats.topComorbidities,
      exportedAt: new Date().toISOString(),
      note: "Dados anonimizados e agregados de médicos participantes do programa de Inteligência Coletiva",
    }

    const json = JSON.stringify(publicationData, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `publication-data-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Médicos na Plataforma</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalDoctors}</div>
            <p className="text-xs text-muted-foreground">
              Aceitaram Termos de Uso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Dados anonimizados (LGPD Art. 12)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cirurgias</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalSurgeries}</div>
            <p className="text-xs text-muted-foreground">
              Na base coletiva
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalFollowUps}</div>
            <p className="text-xs text-muted-foreground">
              Completos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Chave */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Métricas Agregadas
          </CardTitle>
          <CardDescription>
            Estatísticas globais de TODOS os médicos da plataforma (dados anonimizados conforme LGPD Art. 12)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxa de Complicações</span>
                {stats.metrics.complicationRate < 15 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <div className="text-3xl font-bold">
                {stats.metrics.complicationRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                Literatura reporta 15-20% em cirurgia colorretal
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dor Média D+1</span>
                {stats.metrics.avgPainD1 < 5 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <div className="text-3xl font-bold">
                {stats.metrics.avgPainD1}/10
              </div>
              <p className="text-xs text-muted-foreground">
                Escala visual analógica de dor
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxa Bloqueio Pudendo</span>
                <Info className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-3xl font-bold">
                {stats.metrics.pudendalBlockRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                Das cirurgias utilizam esta técnica
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights de IA */}
      <Card>
        <CardHeader>
          <CardTitle>Insights Baseados em IA</CardTitle>
          <CardDescription>
            Padrões e descobertas identificados automaticamente nos dados coletivos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.insights.map((insight, idx) => (
            <div
              key={idx}
              className={`flex gap-3 p-4 rounded-lg border ${
                insight.type === "success"
                  ? "bg-green-50 border-green-200"
                  : insight.type === "warning"
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex-shrink-0">
                {insight.type === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : insight.type === "warning" ? (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                ) : (
                  <Info className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{insight.title}</h4>
                  <Badge variant={insight.impact === "high" ? "destructive" : "secondary"} className="text-xs">
                    {insight.impact === "high" ? "Alto Impacto" : insight.impact === "medium" ? "Médio Impacto" : "Baixo Impacto"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CURVA DE DOR PÓS-OPERATÓRIA - DESTAQUE */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Activity className="h-6 w-6 text-blue-600" />
            Curva de Dor Pós-Operatória (Machine Learning)
          </CardTitle>
          <CardDescription>
            Evolução da dor média em todos os dias de acompanhamento - Dados agregados de {stats.overview.totalPatients} pacientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stats.painCurve}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                label={{ value: 'Dia Pós-Operatório', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                domain={[0, 10]}
                label={{ value: 'Dor Média (0-10)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                        <p className="font-bold text-blue-900">{data.day}</p>
                        <p className="text-sm">Dor Média: <span className="font-bold text-red-600">{data.avgPain}/10</span></p>
                        <p className="text-xs text-gray-600">{data.responses} respostas</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Bar
                dataKey="avgPain"
                fill="#3b82f6"
                name="Dor Média (0-10)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Insight de ML:</strong> A curva de dor mostra a evolução típica do pós-operatório.
              Picos de dor em D1-D3 são esperados. Dor persistente após D7 pode indicar complicações.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Cirurgias */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo de Cirurgia</CardTitle>
            <CardDescription>Volume de procedimentos na base coletiva</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.surgeryDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Comorbidades */}
        <Card>
          <CardHeader>
            <CardTitle>Comorbidades Mais Frequentes</CardTitle>
            <CardDescription>Top 5 comorbidades na população estudada</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.topComorbidities}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {stats.topComorbidities.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Todos os Médicos */}
      <Card>
        <CardHeader>
          <CardTitle>Médicos da Plataforma</CardTitle>
          <CardDescription>
            Todos os médicos que aceitaram os Termos de Uso (compartilhamento obrigatório de dados anonimizados)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.allDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
              >
                <div>
                  <p className="font-medium">{doctor.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {doctor.crm ? `CRM ${doctor.crm}${doctor.estado ? `/${doctor.estado}` : ""}` : "CRM não informado"}
                  </p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {doctor.joinedAt ? (
                    <span>Desde {new Date(doctor.joinedAt).toLocaleDateString("pt-BR")}</span>
                  ) : (
                    <span>Data não informada</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações de Export */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Dados para Publicação</CardTitle>
          <CardDescription>
            Baixe os dados agregados em formatos prontos para análise e publicação científica
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={handleExportForPublication}>
            <Download className="mr-2 h-4 w-4" />
            Exportar para Publicação (JSON)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
