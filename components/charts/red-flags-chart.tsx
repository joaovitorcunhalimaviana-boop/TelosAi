"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Droplet, Zap, AlertTriangle, AlertCircle } from 'lucide-react';

interface RedFlagsData {
  category: string;
  count: number;
}

interface RedFlagsChartProps {
  data: RedFlagsData[];
}

const RED_FLAG_CONFIG: Record<string, { label: string; color: string; icon: any; severity: 'critical' | 'high' | 'medium' }> = {
  febre: {
    label: 'Febre',
    color: '#DC2626',
    icon: Thermometer,
    severity: 'critical',
  },
  sangramento: {
    label: 'Sangramento',
    color: '#DC2626',
    icon: Droplet,
    severity: 'critical',
  },
  dor_intensa: {
    label: 'Dor Intensa',
    color: '#F59E0B',
    icon: Zap,
    severity: 'high',
  },
  retencao_urinaria: {
    label: 'Retenção Urinária',
    color: '#F59E0B',
    icon: AlertTriangle,
    severity: 'high',
  },
  outros: {
    label: 'Outros',
    color: '#6B7280',
    icon: AlertCircle,
    severity: 'medium',
  },
};

export function RedFlagsChart({ data }: RedFlagsChartProps) {
  // Preparar dados para o gráfico
  const chartData = data
    .map(item => ({
      category: RED_FLAG_CONFIG[item.category]?.label || item.category,
      count: item.count,
      color: RED_FLAG_CONFIG[item.category]?.color || '#6B7280',
      severity: RED_FLAG_CONFIG[item.category]?.severity || 'medium',
      originalCategory: item.category,
    }))
    .filter(item => item.count > 0) // Filtrar categorias com 0 ocorrências
    .sort((a, b) => b.count - a.count); // Ordenar por frequência

  // Calcular total
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Identificar os mais comuns
  const mostCommon = chartData.slice(0, 3);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = total > 0 ? ((data.count / total) * 100).toFixed(1) : '0.0';

      return (
        <div className="p-3 shadow-lg" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', color: '#D8DEEB' }}>
          <p className="font-semibold mb-2" style={{ color: '#F0EAD6' }}>{data.category}</p>
          <p className="text-sm">
            <span className="font-semibold">{data.count}</span> ocorrências
          </p>
          <p className="text-sm text-muted-foreground">
            {percentage}% do total
          </p>
          <Badge
            variant={data.severity === 'critical' ? 'destructive' : data.severity === 'high' ? 'default' : 'secondary'}
            className="mt-2 text-xs"
          >
            Severidade: {data.severity === 'critical' ? 'Crítica' : data.severity === 'high' ? 'Alta' : 'Média'}
          </Badge>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-2 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#F0EAD6' }}>
          <span className="text-2xl">🚨</span>
          Red Flags Detectados
        </CardTitle>
        <CardDescription style={{ color: '#7A8299' }}>
          Frequência de alertas críticos identificados pela IA nos follow-ups
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Alertas principais em destaque */}
        {total > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {mostCommon.map((item) => {
                const config = RED_FLAG_CONFIG[item.originalCategory];
                if (!config) return null;

                const Icon = config.icon;
                const percentage = total > 0 ? ((item.count / total) * 100).toFixed(0) : '0';

                return (
                  <div
                    key={item.originalCategory}
                    className={`p-4 rounded-lg border-2 ${
                      item.severity === 'critical'
                        ? 'bg-red-50 border-red-300'
                        : item.severity === 'high'
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5" style={{ color: item.color }} />
                      <span className="text-sm font-semibold" style={{ color: item.color }}>
                        {item.category}
                      </span>
                    </div>
                    <div className="text-3xl font-bold" style={{ color: item.color }}>
                      {item.count}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {percentage}% dos alertas
                    </div>
                    <Badge
                      variant={item.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="mt-2 text-xs"
                    >
                      {item.severity === 'critical' ? 'Crítico' : item.severity === 'high' ? 'Alta' : 'Média'}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {/* Gráfico de Barras */}
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" />
                <XAxis
                  dataKey="category"
                  stroke="#1E2535"
                  tick={{ fill: '#7A8299' }}
                  style={{ fontSize: '14px', fontWeight: 600 }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke="#1E2535"
                  tick={{ fill: '#7A8299' }}
                  style={{ fontSize: '14px', fontWeight: 600 }}
                  label={{ value: 'Número de Ocorrências', angle: -90, position: 'insideLeft', fill: '#7A8299' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Resumo e Insights */}
            <div className="mt-6 pt-4 space-y-3" style={{ borderTopColor: '#1E2535', borderTopWidth: '1px', borderTopStyle: 'solid' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: '#D8DEEB' }}>
                  Total de Red Flags
                </span>
                <Badge variant="destructive" className="text-lg px-3 py-1">
                  {total}
                </Badge>
              </div>

              {/* Alerta se houver muitos red flags críticos */}
              {chartData.filter(d => d.severity === 'critical').reduce((sum, d) => sum + d.count, 0) > 0 && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-300 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900 dark:text-red-100 text-sm">
                        Atenção: Alertas Críticos Detectados
                      </p>
                      <p className="text-xs text-red-800 dark:text-red-200 mt-1">
                        {chartData.filter(d => d.severity === 'critical').reduce((sum, d) => sum + d.count, 0)} pacientes
                        reportaram sintomas críticos (febre ou sangramento). Verifique imediatamente.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Insights */}
              {mostCommon.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-300 rounded-lg p-3">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Insight:</strong> O red flag mais comum é <strong>{mostCommon[0].category}</strong> ({mostCommon[0].count} ocorrências).
                    {mostCommon[0].severity === 'critical' && ' Este é um alerta crítico que requer ação imediata.'}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhum Red Flag Detectado
            </h3>
            <p className="text-muted-foreground">
              Parabéns! Não há alertas críticos no período selecionado.
              Seus pacientes estão se recuperando bem.
            </p>
          </div>
        )}

        <div className="mt-4 pt-4" style={{ borderTopColor: '#1E2535', borderTopWidth: '1px', borderTopStyle: 'solid' }}>
          <p className="text-sm" style={{ color: '#7A8299' }}>
            <strong>Nota:</strong> Red flags são identificados automaticamente pela IA ao analisar
            as respostas dos pacientes nos follow-ups. Alertas críticos requerem atenção imediata.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
