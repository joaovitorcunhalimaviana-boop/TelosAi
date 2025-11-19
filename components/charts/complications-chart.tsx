"use client";

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ComplicationsData {
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
}

interface ComplicationsChartProps {
  data: ComplicationsData;
}

const COLORS = {
  withComplications: '#DC2626', // Vermelho
  withoutComplications: '#16A34A', // Verde
};

const SURGERY_LABELS: Record<string, string> = {
  hemorroidectomia: 'Hemorroidectomia',
  fistula: 'Fístula Anal',
  fissura: 'Fissura Anal',
  pilonidal: 'Doença Pilonidal',
};

export function ComplicationsChart({ data }: ComplicationsChartProps) {
  const [selectedSurgeryType, setSelectedSurgeryType] = useState<string | null>(null);

  // Dados para o gráfico de pizza (geral)
  const pieData = [
    {
      name: 'Sem Complicações',
      value: data.overall.withoutComplications,
      color: COLORS.withoutComplications,
    },
    {
      name: 'Com Complicações',
      value: data.overall.withComplications,
      color: COLORS.withComplications,
    },
  ];

  // Dados para o gráfico de barras (por tipo de cirurgia)
  const barData = data.bySurgeryType.map(item => ({
    name: SURGERY_LABELS[item.surgeryType] || item.surgeryType,
    'Com Complicações': item.withComplications,
    'Sem Complicações': item.withoutComplications,
    rate: item.rate,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.fill }} className="text-sm">
              {entry.name}: {entry.value} pacientes
            </p>
          ))}
          {payload[0].payload.rate !== undefined && (
            <p className="text-sm font-semibold mt-1 pt-1 border-t">
              Taxa: {payload[0].payload.rate}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <Card className="border-2 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">⚕️</span>
          Taxa de Complicações
        </CardTitle>
        <CardDescription>
          Percentual de pacientes com e sem complicações pós-operatórias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="by-type">Por Tipo de Cirurgia</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Estatísticas principais */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border-2 border-blue-200">
                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
                  Total de Pacientes
                </div>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {data.overall.total}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border-2 border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                    Sem Complicações
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
                  {data.overall.withoutComplications}
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border-2 border-red-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <div className="text-sm text-red-700 dark:text-red-300 font-medium">
                    Com Complicações
                  </div>
                </div>
                <div className="text-3xl font-bold text-red-900 dark:text-red-100 mt-1">
                  {data.overall.withComplications}
                  <span className="text-lg ml-2">({data.overall.rate}%)</span>
                </div>
              </div>
            </div>

            {/* Gráfico de Pizza */}
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="by-type" className="space-y-4">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  style={{ fontSize: '12px', fontWeight: 600 }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                  label={{ value: 'Número de Pacientes', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="Sem Complicações"
                  stackId="a"
                  fill={COLORS.withoutComplications}
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="Com Complicações"
                  stackId="a"
                  fill={COLORS.withComplications}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Tabela de detalhes */}
            <div className="mt-4 border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tipo de Cirurgia</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Total</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Com Complicações</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Taxa</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.bySurgeryType.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm font-medium">
                        {SURGERY_LABELS[item.surgeryType] || item.surgeryType}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">{item.total}</td>
                      <td className="px-4 py-3 text-center text-sm">
                        <span className="font-semibold text-red-600">
                          {item.withComplications}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        <span className={`font-bold ${item.rate > 10 ? 'text-red-600' : 'text-green-600'}`}>
                          {item.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> Complicações incluem qualquer intercorrência reportada no campo
            de descrição cirúrgica ou detectada via follow-ups.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
