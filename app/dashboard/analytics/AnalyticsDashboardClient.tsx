"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnalyticsFilters } from '@/components/dashboard/analytics-filters';
import { PainEvolutionChart } from '@/components/charts/pain-evolution-chart';
import { ComplicationsChart } from '@/components/charts/complications-chart';
import { FollowUpsStatusChart } from '@/components/charts/followups-status-chart';
import { RedFlagsChart } from '@/components/charts/red-flags-chart';
import { toast } from 'sonner';
import { BarChart3, Download, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface AnalyticsDashboardClientProps {
  userName: string;
}

interface AnalyticsData {
  painEvolution: Array<{
    day: string;
    [key: string]: number | string | null;
  }>;
  complicationsRate: {
    overall: {
      withComplications: number;
      withoutComplications: number;
      total: number;
      rate: number;
    };
    bySurgeryType: Array<{
      surgeryType: string;
      withComplications: number;
      withoutComplications: number;
      total: number;
      rate: number;
    }>;
  };
  followUpsByStatus: Array<{
    status: string;
    count: number;
  }>;
  redFlagsByCategory: Array<{
    category: string;
    count: number;
  }>;
}

export function AnalyticsDashboardClient({ userName }: AnalyticsDashboardClientProps) {
  const [filters, setFilters] = useState({
    dateRange: '30',
    surgeryType: 'all',
  });
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        dateRange: filters.dateRange,
        surgeryType: filters.surgeryType,
      });

      const response = await fetch(`/api/analytics?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Erro ao carregar dados de analytics');
      }
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
      toast.error('Erro ao carregar dados de analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []); // Carregar apenas uma vez inicialmente

  const handleApplyFilters = () => {
    fetchAnalytics();
  };

  const handleExportData = () => {
    toast.info('Funcionalidade de exportação em desenvolvimento');
    // TODO: Implementar exportação para PDF/Excel
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-white to-[#F5F7FA] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-white to-[#F5F7FA] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#0A2647' }}>
              Analytics Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Análise avançada dos dados pós-operatórios - Dr. {userName}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                Voltar ao Dashboard
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={handleExportData}
            >
              <Download className="h-5 w-5" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <AnalyticsFilters
          filters={filters}
          onFiltersChange={setFilters}
          onApply={handleApplyFilters}
          isLoading={loading}
        />

        {/* Estatísticas Rápidas */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Total de Follow-ups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: '#0A2647' }}>
                  {data.followUpsByStatus.reduce((sum, item) => sum + item.count, 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Taxa de Complicações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: data.complicationsRate.overall.rate > 10 ? '#DC2626' : '#16A34A' }}>
                  {data.complicationsRate.overall.rate}%
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Red Flags Totais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {data.redFlagsByCategory.reduce((sum, item) => sum + item.count, 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  Total de Pacientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: '#0A2647' }}>
                  {data.complicationsRate.overall.total}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráficos em Grid 2x2 */}
        {data ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Evolução da Dor */}
            <PainEvolutionChart data={data.painEvolution} />

            {/* Taxa de Complicações */}
            <ComplicationsChart data={data.complicationsRate} />

            {/* Follow-ups por Status */}
            <FollowUpsStatusChart
              data={data.followUpsByStatus}
              onStatusClick={(status) => {
                toast.info(`Filtrar por status: ${status} (em desenvolvimento)`);
                // TODO: Implementar filtro por status
              }}
            />

            {/* Red Flags */}
            <RedFlagsChart data={data.redFlagsByCategory} />
          </div>
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Nenhum dado encontrado
              </h3>
              <p className="text-muted-foreground mb-6">
                Não há dados suficientes para gerar analytics no período selecionado.
                <br />
                Tente ajustar os filtros ou aguarde mais follow-ups serem completados.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer com informações adicionais */}
        <Card className="mt-6 border-2">
          <CardHeader>
            <CardTitle className="text-lg">Sobre os Dados</CardTitle>
            <CardDescription>
              Informações importantes sobre a interpretação dos gráficos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Evolução da Dor:</strong> Mostra a tendência média de dor reportada pelos pacientes.
              Valores devem diminuir progressivamente ao longo dos dias.
            </p>
            <p>
              <strong>Taxa de Complicações:</strong> Percentual calculado com base em intercorrências
              registradas nos detalhes cirúrgicos e red flags críticos.
            </p>
            <p>
              <strong>Follow-ups por Status:</strong> Distribuição dos acompanhamentos programados.
              Follow-ups atrasados requerem atenção imediata.
            </p>
            <p>
              <strong>Red Flags:</strong> Alertas identificados automaticamente pela IA ao analisar
              respostas dos pacientes. Alertas críticos (febre, sangramento) requerem ação imediata.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
