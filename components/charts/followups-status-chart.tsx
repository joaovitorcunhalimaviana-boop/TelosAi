"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Send, AlertTriangle, XCircle } from 'lucide-react';

interface FollowUpsStatusData {
  status: string;
  count: number;
}

interface FollowUpsStatusChartProps {
  data: FollowUpsStatusData[];
  onStatusClick?: (status: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
  pending: {
    label: 'Pendente',
    color: '#F59E0B',
    icon: Clock,
    bgColor: '#FEF3C7',
  },
  sent: {
    label: 'Enviado',
    color: '#3B82F6',
    icon: Send,
    bgColor: '#DBEAFE',
  },
  responded: {
    label: 'Respondido',
    color: '#16A34A',
    icon: CheckCircle,
    bgColor: '#D1FAE5',
  },
  overdue: {
    label: 'Atrasado',
    color: '#DC2626',
    icon: AlertTriangle,
    bgColor: '#FEE2E2',
  },
  skipped: {
    label: 'Ignorado',
    color: '#6B7280',
    icon: XCircle,
    bgColor: '#F3F4F6',
  },
};

export function FollowUpsStatusChart({ data, onStatusClick }: FollowUpsStatusChartProps) {
  // Preparar dados para o gráfico
  const chartData = data.map(item => ({
    status: STATUS_CONFIG[item.status]?.label || item.status,
    count: item.count,
    color: STATUS_CONFIG[item.status]?.color || '#6B7280',
    originalStatus: item.status,
  }));

  // Calcular total
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = total > 0 ? ((data.count / total) * 100).toFixed(1) : '0.0';

      return (
        <div className="bg-white dark:bg-gray-800 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{data.status}</p>
          <p className="text-sm">
            <span className="font-semibold">{data.count}</span> follow-ups
          </p>
          <p className="text-sm text-muted-foreground">
            {percentage}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any) => {
    if (onStatusClick) {
      onStatusClick(data.originalStatus);
    }
  };

  return (
    <Card className="border-2 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📨</span>
          Follow-ups por Status
        </CardTitle>
        <CardDescription>
          Distribuição dos follow-ups de acordo com seu status atual
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Estatísticas em Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {data.map((item) => {
            const config = STATUS_CONFIG[item.status];
            if (!config) return null;

            const Icon = config.icon;
            const percentage = total > 0 ? ((item.count / total) * 100).toFixed(0) : '0';

            return (
              <div
                key={item.status}
                className="p-4 rounded-lg border-2 hover:shadow-md transition-all cursor-pointer"
                style={{ backgroundColor: config.bgColor, borderColor: config.color }}
                onClick={() => onStatusClick && onStatusClick(item.status)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4" style={{ color: config.color }} />
                  <span className="text-xs font-semibold" style={{ color: config.color }}>
                    {config.label}
                  </span>
                </div>
                <div className="text-2xl font-bold" style={{ color: config.color }}>
                  {item.count}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {percentage}% do total
                </div>
              </div>
            );
          })}
        </div>

        {/* Gráfico de Barras Horizontal */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
            <XAxis
              type="number"
              stroke="#6b7280"
              style={{ fontSize: '14px', fontWeight: 600 }}
            />
            <YAxis
              dataKey="status"
              type="category"
              stroke="#6b7280"
              style={{ fontSize: '14px', fontWeight: 600 }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              radius={[0, 8, 8, 0]}
              onClick={handleBarClick}
              cursor="pointer"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Resumo */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Total de Follow-ups
            </span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {total}
            </Badge>
          </div>

          {/* Alertas */}
          {data.find(d => d.status === 'overdue') && data.find(d => d.status === 'overdue')!.count > 0 && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-300 rounded-lg p-3 mt-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100 text-sm">
                    Atenção: Follow-ups Atrasados
                  </p>
                  <p className="text-xs text-red-800 dark:text-red-200 mt-1">
                    Existem {data.find(d => d.status === 'overdue')!.count} follow-ups que passaram
                    da data programada e ainda não foram enviados.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            <strong>Dica:</strong> Clique em qualquer barra ou card para filtrar o dashboard
            por esse status.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
