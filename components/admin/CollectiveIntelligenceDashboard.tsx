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

const COLORS = ["#14BDAE", "#0D7377", "#D4AF37", "#EF4444", "#8b5cf6", "#ec4899"]

export function CollectiveIntelligenceDashboard({ stats }: Props) {
  const handleExportCSV = () => {
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
        {[
          { title: 'Médicos na Plataforma', value: stats.overview.totalDoctors, icon: Users, desc: 'Aceitaram Termos de Uso' },
          { title: 'Pacientes', value: stats.overview.totalPatients, icon: Activity, desc: 'Dados anonimizados (LGPD Art. 12)' },
          { title: 'Cirurgias', value: stats.overview.totalSurgeries, icon: Database, desc: 'Na base coletiva' },
          { title: 'Follow-ups', value: stats.overview.totalFollowUps, icon: BarChart3, desc: 'Completos' },
        ].map(({ title, value, icon: Icon, desc }) => (
          <Card key={title} style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: '#D8DEEB' }}>{title}</CardTitle>
              <Icon className="h-4 w-4" style={{ color: '#7A8299' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#F0EAD6' }}>{value}</div>
              <p className="text-xs" style={{ color: '#7A8299' }}>{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Métricas Chave */}
      <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#F0EAD6' }}>
            <Brain className="h-5 w-5" style={{ color: '#14BDAE' }} />
            Métricas Agregadas
          </CardTitle>
          <CardDescription style={{ color: '#7A8299' }}>
            Estatísticas globais de TODOS os médicos da plataforma (dados anonimizados conforme LGPD Art. 12)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: '#D8DEEB' }}>Taxa de Complicações</span>
                {stats.metrics.complicationRate < 15 ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                )}
              </div>
              <div className="text-3xl font-bold" style={{ color: '#F0EAD6' }}>
                {stats.metrics.complicationRate}%
              </div>
              <p className="text-xs" style={{ color: '#7A8299' }}>
                Literatura reporta 15-20% em cirurgia colorretal
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: '#D8DEEB' }}>Dor Média D+1</span>
                {stats.metrics.avgPainD1 < 5 ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                )}
              </div>
              <div className="text-3xl font-bold" style={{ color: '#F0EAD6' }}>
                {stats.metrics.avgPainD1}/10
              </div>
              <p className="text-xs" style={{ color: '#7A8299' }}>
                Escala visual analógica de dor
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: '#D8DEEB' }}>Taxa Bloqueio Pudendo</span>
                <Info className="h-4 w-4" style={{ color: '#14BDAE' }} />
              </div>
              <div className="text-3xl font-bold" style={{ color: '#F0EAD6' }}>
                {stats.metrics.pudendalBlockRate}%
              </div>
              <p className="text-xs" style={{ color: '#7A8299' }}>
                Das cirurgias utilizam esta técnica
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights de IA */}
      <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
        <CardHeader>
          <CardTitle style={{ color: '#F0EAD6' }}>Insights Baseados em IA</CardTitle>
          <CardDescription style={{ color: '#7A8299' }}>
            Padrões e descobertas identificados automaticamente nos dados coletivos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.insights.map((insight, idx) => (
            <div
              key={idx}
              className="flex gap-3 p-4 rounded-lg"
              style={{
                backgroundColor: insight.type === "success" ? '#0D73771A' : insight.type === "warning" ? '#1A1A0E' : '#161B27',
                border: `1px solid ${insight.type === "success" ? '#0D7377' : insight.type === "warning" ? '#3A3A1E' : '#1E2535'}`
              }}
            >
              <div className="flex-shrink-0">
                {insight.type === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : insight.type === "warning" ? (
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Info className="h-5 w-5" style={{ color: '#14BDAE' }} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium" style={{ color: '#F0EAD6' }}>{insight.title}</h4>
                  <Badge variant={insight.impact === "high" ? "destructive" : "secondary"} className="text-xs">
                    {insight.impact === "high" ? "Alto Impacto" : insight.impact === "medium" ? "Médio Impacto" : "Baixo Impacto"}
                  </Badge>
                </div>
                <p className="text-sm" style={{ color: '#7A8299' }}>{insight.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CURVA DE DOR PÓS-OPERATÓRIA */}
      <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#0D7377' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#F0EAD6' }}>
            <Activity className="h-6 w-6" style={{ color: '#14BDAE' }} />
            Curva de Dor Pós-Operatória (Machine Learning)
          </CardTitle>
          <CardDescription style={{ color: '#7A8299' }}>
            Evolução da dor média em todos os dias de acompanhamento - Dados agregados de {stats.overview.totalPatients} pacientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stats.painCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" />
              <XAxis dataKey="day" stroke="#7A8299" label={{ value: 'Dia Pós-Operatório', position: 'insideBottom', offset: -5, fill: '#7A8299' }} />
              <YAxis domain={[0, 10]} stroke="#7A8299" label={{ value: 'Dor Média (0-10)', angle: -90, position: 'insideLeft', fill: '#7A8299' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload
                    return (
                      <div className="p-3 rounded shadow-lg" style={{ backgroundColor: '#111520', border: '1px solid #1E2535' }}>
                        <p className="font-bold" style={{ color: '#14BDAE' }}>{data.day}</p>
                        <p className="text-sm" style={{ color: '#D8DEEB' }}>Dor Média: <span className="font-bold text-red-400">{data.avgPain}/10</span></p>
                        <p className="text-xs" style={{ color: '#7A8299' }}>{data.responses} respostas</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend wrapperStyle={{ color: '#D8DEEB' }} />
              <Bar dataKey="avgPain" fill="#14BDAE" name="Dor Média (0-10)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#0D73771A', border: '1px solid #0D7377' }}>
            <p className="text-sm" style={{ color: '#D8DEEB' }}>
              <strong style={{ color: '#14BDAE' }}>Insight de ML:</strong> A curva de dor mostra a evolução típica do pós-operatório.
              Picos de dor em D1-D3 são esperados. Dor persistente após D7 pode indicar complicações.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
          <CardHeader>
            <CardTitle style={{ color: '#F0EAD6' }}>Distribuição por Tipo de Cirurgia</CardTitle>
            <CardDescription style={{ color: '#7A8299' }}>Volume de procedimentos na base coletiva</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.surgeryDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" />
                <XAxis dataKey="type" stroke="#7A8299" />
                <YAxis stroke="#7A8299" />
                <Tooltip contentStyle={{ backgroundColor: '#111520', border: '1px solid #1E2535', color: '#D8DEEB' }} />
                <Legend wrapperStyle={{ color: '#D8DEEB' }} />
                <Bar dataKey="count" fill="#14BDAE" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
          <CardHeader>
            <CardTitle style={{ color: '#F0EAD6' }}>Comorbidades Mais Frequentes</CardTitle>
            <CardDescription style={{ color: '#7A8299' }}>Top 5 comorbidades na população estudada</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.topComorbidities} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {stats.topComorbidities.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111520', border: '1px solid #1E2535', color: '#D8DEEB' }} />
                <Legend wrapperStyle={{ color: '#D8DEEB' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Todos os Médicos */}
      <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
        <CardHeader>
          <CardTitle style={{ color: '#F0EAD6' }}>Médicos da Plataforma</CardTitle>
          <CardDescription style={{ color: '#7A8299' }}>
            Todos os médicos que aceitaram os Termos de Uso (compartilhamento obrigatório de dados anonimizados)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.allDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#1E2535] transition-colors"
                style={{ border: '1px solid #1E2535' }}
              >
                <div>
                  <p className="font-medium" style={{ color: '#F0EAD6' }}>{doctor.name}</p>
                  <p className="text-sm" style={{ color: '#7A8299' }}>
                    {doctor.crm ? `CRM ${doctor.crm}${doctor.estado ? `/${doctor.estado}` : ""}` : "CRM não informado"}
                  </p>
                </div>
                <div className="text-right text-sm" style={{ color: '#7A8299' }}>
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
      <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
        <CardHeader>
          <CardTitle style={{ color: '#F0EAD6' }}>Exportar Dados para Publicação</CardTitle>
          <CardDescription style={{ color: '#7A8299' }}>
            Baixe os dados agregados em formatos prontos para análise e publicação científica
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={handleExportCSV} variant="outline" style={{ borderColor: '#1E2535', color: '#D8DEEB' }}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={handleExportForPublication} style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}>
            <Download className="mr-2 h-4 w-4" />
            Exportar para Publicação (JSON)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
