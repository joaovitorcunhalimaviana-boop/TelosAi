"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { BarChart3, Download, Users, Activity, Heart, Pill, ThumbsUp, ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Link from "next/link";

interface DadosAgregadosClientProps {
  userName: string;
}

interface AggregatedData {
  overview: {
    totalPatients: number;
    totalSurgeries: number;
    responseRate: number;
    bySurgeryType: Array<{ surgeryType: string; count: number }>;
  };
  painAtRest: Array<{
    day: number;
    surgeryType: string;
    n: number;
    mean: number;
    sd: number;
    median: number;
    min: number;
    max: number;
  }>;
  painDuringBowel: Array<{
    day: number;
    surgeryType: string;
    n: number;
    mean: number;
    sd: number;
    median: number;
    min: number;
    max: number;
  }>;
  firstBowelMovement: Array<{
    surgeryType: string;
    n: number;
    meanDay: number;
    sd: number;
    medianDay: number;
    min: number;
    max: number;
  }>;
  extraMedication: Array<{
    day: number;
    surgeryType: string;
    percentUsed: number;
    used: number;
    n: number;
  }>;
  satisfaction: Array<{
    surgeryType: string;
    n: number;
    meanRating: number;
    sd: number;
    medianRating: number;
    wouldRecommendPercent: number;
  }>;
  complications: Array<{
    day: number;
    surgeryType: string;
    n: number;
    feverRate: number;
    bleedingRate: number;
    retentionRate: number;
  }>;
}

export function DadosAgregadosClient({ userName }: DadosAgregadosClientProps) {
  const [data, setData] = useState<AggregatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [surgeryTypeFilter, setSurgeryTypeFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        dateRange: "99999",
        aggregated: "true",
      });
      const response = await fetch(`/api/analytics?${params}`);
      const result = await response.json();
      if (result.success && result.data.aggregatedData) {
        setData(result.data.aggregatedData);
      } else {
        toast.error("Erro ao carregar dados agregados");
      }
    } catch {
      toast.error("Erro ao carregar dados agregados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filterByType = <T extends { surgeryType: string }>(arr: T[]): T[] => {
    if (surgeryTypeFilter === "all") return arr;
    return arr.filter((item) => item.surgeryType === surgeryTypeFilter);
  };

  const surgeryTypes = data?.overview.bySurgeryType.map((s) => s.surgeryType) || [];

  // Build chart data for pain evolution
  const buildChartData = () => {
    if (!data) return [];
    const filtered = filterByType(data.painAtRest);
    const days = [...new Set(filtered.map((d) => d.day))].sort((a, b) => a - b);
    const types = [...new Set(filtered.map((d) => d.surgeryType))];

    return days.map((day) => {
      const point: Record<string, any> = { day: `D+${day}` };
      types.forEach((type) => {
        const entry = filtered.find((d) => d.day === day && d.surgeryType === type);
        point[type] = entry ? entry.mean : null;
      });
      return point;
    });
  };

  const chartColors = ["#2563EB", "#DC2626", "#16A34A", "#F59E0B", "#8B5CF6", "#EC4899"];

  const exportCSV = () => {
    if (!data) return;

    let csv = "DADOS AGREGADOS PARA PUBLICACAO CIENTIFICA\n";
    csv += `Gerado em: ${new Date().toLocaleDateString("pt-BR")}\n`;
    csv += `Total de pacientes: ${data.overview.totalPatients}\n`;
    csv += `Total de cirurgias: ${data.overview.totalSurgeries}\n`;
    csv += `Taxa de resposta: ${data.overview.responseRate}%\n\n`;

    // Pain at rest
    csv += "DOR EM REPOUSO (EVA 0-10)\n";
    csv += "Tipo de Cirurgia,Dia,N,Media,DP,Mediana,Min,Max\n";
    filterByType(data.painAtRest).forEach((row) => {
      csv += `${row.surgeryType},D+${row.day},${row.n},${row.mean},${row.sd},${row.median},${row.min},${row.max}\n`;
    });

    csv += "\nDOR DURANTE EVACUACAO (EVA 0-10)\n";
    csv += "Tipo de Cirurgia,Dia,N,Media,DP,Mediana,Min,Max\n";
    filterByType(data.painDuringBowel).forEach((row) => {
      csv += `${row.surgeryType},D+${row.day},${row.n},${row.mean},${row.sd},${row.median},${row.min},${row.max}\n`;
    });

    csv += "\nPRIMEIRA EVACUACAO\n";
    csv += "Tipo de Cirurgia,N,Dia Medio,DP,Dia Mediano,Min,Max\n";
    filterByType(data.firstBowelMovement).forEach((row) => {
      csv += `${row.surgeryType},${row.n},${row.meanDay},${row.sd},${row.medianDay},${row.min},${row.max}\n`;
    });

    csv += "\nMEDICACAO EXTRA\n";
    csv += "Tipo de Cirurgia,Dia,N,% Usou\n";
    filterByType(data.extraMedication).forEach((row) => {
      csv += `${row.surgeryType},D+${row.day},${row.n},${row.percentUsed}\n`;
    });

    csv += "\nSATISFACAO (D+14)\n";
    csv += "Tipo de Cirurgia,N,Nota Media,DP,Nota Mediana,% Recomendaria\n";
    filterByType(data.satisfaction).forEach((row) => {
      csv += `${row.surgeryType},${row.n},${row.meanRating},${row.sd},${row.medianRating},${row.wouldRecommendPercent}\n`;
    });

    csv += "\nCOMPLICACOES\n";
    csv += "Tipo de Cirurgia,Dia,N,% Febre,% Sangramento,% Retencao Urinaria\n";
    filterByType(data.complications).forEach((row) => {
      csv += `${row.surgeryType},D+${row.day},${row.n},${row.feverRate},${row.bleedingRate},${row.retentionRate}\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dados-agregados-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado com sucesso!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-white to-[#F5F7FA] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados agregados...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-white to-[#F5F7FA] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="border-2 border-dashed max-w-md">
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Nenhum dado encontrado</h3>
            <p className="text-muted-foreground">Ainda não há dados suficientes para gerar estatísticas.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = buildChartData();
  const chartTypes = [...new Set(filterByType(data.painAtRest).map((d) => d.surgeryType))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-white to-[#F5F7FA] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: "#0A2647" }}>
              Dados Agregados
            </h1>
            <p className="text-lg text-muted-foreground">
              Dados para publicação científica - Dr. {userName}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Button size="lg" className="gap-2" onClick={exportCSV}>
              <Download className="h-5 w-5" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Filter */}
        <Card className="mb-6 border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Filtrar por tipo de cirurgia:</label>
              <Select value={surgeryTypeFilter} onValueChange={setSurgeryTypeFilter}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {surgeryTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total de Pacientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: "#0A2647" }}>
                {data.overview.totalPatients}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Total de Cirurgias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: "#0A2647" }}>
                {data.overview.totalSurgeries}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {data.overview.bySurgeryType.map((s) => `${s.surgeryType}: ${s.count}`).join(" | ")}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Taxa de Resposta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {data.overview.responseRate}%
              </div>
            </CardContent>
          </Card>

          {/* Satisfaction Card */}
          {filterByType(data.satisfaction).length > 0 && (
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  Satisfação com IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {(filterByType(data.satisfaction).reduce((sum, s) => sum + s.meanRating * s.n, 0) /
                    Math.max(1, filterByType(data.satisfaction).reduce((sum, s) => sum + s.n, 0))).toFixed(1)}
                  /10
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {(filterByType(data.satisfaction).reduce((sum, s) => sum + s.wouldRecommendPercent * s.n, 0) /
                    Math.max(1, filterByType(data.satisfaction).reduce((sum, s) => sum + s.n, 0))).toFixed(0)}
                  % recomendariam
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pain Evolution Chart */}
        {chartData.length > 0 && (
          <Card className="mb-6 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Evolução da Dor em Repouso (Média ± IC)
              </CardTitle>
              <CardDescription>
                Escala Visual Analógica (EVA) 0-10, por tipo de cirurgia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  {chartTypes.map((type, i) => (
                    <Line
                      key={type}
                      type="monotone"
                      dataKey={type}
                      stroke={chartColors[i % chartColors.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Pain at Rest Table */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle>Dor em Repouso por Dia (EVA 0-10)</CardTitle>
            <CardDescription>Formato publicável: Média ± DP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-semibold">Tipo</th>
                    <th className="text-left py-2 px-3 font-semibold">Dia</th>
                    <th className="text-center py-2 px-3 font-semibold">N</th>
                    <th className="text-center py-2 px-3 font-semibold">Média ± DP</th>
                    <th className="text-center py-2 px-3 font-semibold">Mediana</th>
                    <th className="text-center py-2 px-3 font-semibold">Min-Max</th>
                  </tr>
                </thead>
                <tbody>
                  {filterByType(data.painAtRest).map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-2 px-3">{row.surgeryType}</td>
                      <td className="py-2 px-3">D+{row.day}</td>
                      <td className="text-center py-2 px-3">{row.n}</td>
                      <td className="text-center py-2 px-3 font-mono">
                        {row.mean} ± {row.sd}
                      </td>
                      <td className="text-center py-2 px-3">{row.median}</td>
                      <td className="text-center py-2 px-3">
                        {row.min}-{row.max}
                      </td>
                    </tr>
                  ))}
                  {filterByType(data.painAtRest).length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted-foreground">
                        Sem dados disponíveis
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pain During Bowel Movement Table */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle>Dor ao Evacuar por Dia (EVA 0-10)</CardTitle>
            <CardDescription>Formato publicável: Média ± DP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-semibold">Tipo</th>
                    <th className="text-left py-2 px-3 font-semibold">Dia</th>
                    <th className="text-center py-2 px-3 font-semibold">N</th>
                    <th className="text-center py-2 px-3 font-semibold">Média ± DP</th>
                    <th className="text-center py-2 px-3 font-semibold">Mediana</th>
                    <th className="text-center py-2 px-3 font-semibold">Min-Max</th>
                  </tr>
                </thead>
                <tbody>
                  {filterByType(data.painDuringBowel).map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-2 px-3">{row.surgeryType}</td>
                      <td className="py-2 px-3">D+{row.day}</td>
                      <td className="text-center py-2 px-3">{row.n}</td>
                      <td className="text-center py-2 px-3 font-mono">
                        {row.mean} ± {row.sd}
                      </td>
                      <td className="text-center py-2 px-3">{row.median}</td>
                      <td className="text-center py-2 px-3">
                        {row.min}-{row.max}
                      </td>
                    </tr>
                  ))}
                  {filterByType(data.painDuringBowel).length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted-foreground">
                        Sem dados disponíveis
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* First Bowel Movement + Satisfaction Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* First Bowel Movement */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-500" />
                Primeira Evacuação Pós-Operatória
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filterByType(data.firstBowelMovement).length > 0 ? (
                <div className="space-y-4">
                  {filterByType(data.firstBowelMovement).map((row, i) => (
                    <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="font-semibold text-sm text-muted-foreground mb-2">
                        {row.surgeryType}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold" style={{ color: "#0A2647" }}>
                            D+{row.meanDay} ± {row.sd}
                          </div>
                          <div className="text-xs text-muted-foreground">Dia médio ± DP</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold" style={{ color: "#0A2647" }}>
                            D+{row.medianDay}
                          </div>
                          <div className="text-xs text-muted-foreground">Mediana</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        N={row.n} | Range: D+{row.min} a D+{row.max}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Sem dados disponíveis</p>
              )}
            </CardContent>
          </Card>

          {/* Satisfaction Detail */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-blue-500" />
                Satisfação com Acompanhamento por IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filterByType(data.satisfaction).length > 0 ? (
                <div className="space-y-4">
                  {filterByType(data.satisfaction).map((row, i) => (
                    <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="font-semibold text-sm text-muted-foreground mb-2">
                        {row.surgeryType}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {row.meanRating} ± {row.sd}
                          </div>
                          <div className="text-xs text-muted-foreground">Nota média ± DP (0-10)</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {row.wouldRecommendPercent}%
                          </div>
                          <div className="text-xs text-muted-foreground">Recomendariam</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        N={row.n} | Mediana: {row.medianRating}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Sem dados de satisfação disponíveis</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Extra Medication Table */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-purple-500" />
              Uso de Medicação Extra por Dia
            </CardTitle>
            <CardDescription>
              Percentual de pacientes que usaram medicação além da prescrita
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-semibold">Tipo</th>
                    <th className="text-left py-2 px-3 font-semibold">Dia</th>
                    <th className="text-center py-2 px-3 font-semibold">N</th>
                    <th className="text-center py-2 px-3 font-semibold">Usaram (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {filterByType(data.extraMedication).map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-2 px-3">{row.surgeryType}</td>
                      <td className="py-2 px-3">D+{row.day}</td>
                      <td className="text-center py-2 px-3">{row.n}</td>
                      <td className="text-center py-2 px-3 font-mono">
                        {row.percentUsed}% ({row.used}/{row.n})
                      </td>
                    </tr>
                  ))}
                  {filterByType(data.extraMedication).length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted-foreground">
                        Sem dados disponíveis
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Complications Table */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle>Complicações por Dia</CardTitle>
            <CardDescription>Taxas de febre, sangramento e retenção urinária</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-semibold">Tipo</th>
                    <th className="text-left py-2 px-3 font-semibold">Dia</th>
                    <th className="text-center py-2 px-3 font-semibold">N</th>
                    <th className="text-center py-2 px-3 font-semibold">Febre (%)</th>
                    <th className="text-center py-2 px-3 font-semibold">Sangramento (%)</th>
                    <th className="text-center py-2 px-3 font-semibold">Ret. Urinária (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {filterByType(data.complications).map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-2 px-3">{row.surgeryType}</td>
                      <td className="py-2 px-3">D+{row.day}</td>
                      <td className="text-center py-2 px-3">{row.n}</td>
                      <td className="text-center py-2 px-3 font-mono">{row.feverRate}%</td>
                      <td className="text-center py-2 px-3 font-mono">{row.bleedingRate}%</td>
                      <td className="text-center py-2 px-3 font-mono">{row.retentionRate}%</td>
                    </tr>
                  ))}
                  {filterByType(data.complications).length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted-foreground">
                        Sem dados disponíveis
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">Sobre os Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Pacientes marcados como teste são automaticamente excluídos de todos os cálculos.
            </p>
            <p>
              A dor é medida pela Escala Visual Analógica (EVA) de 0 a 10 pontos, coletada diariamente via WhatsApp por IA conversacional.
            </p>
            <p>
              Dados de satisfação são coletados no D+14 pós-operatório.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
