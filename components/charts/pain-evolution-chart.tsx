"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PainEvolutionChartProps {
  data: Array<{
    day: string;
    [key: string]: number | string | null;
  }>;
}

const SURGERY_COLORS: Record<string, string> = {
  hemorroidectomia: '#DC2626', // Vermelho
  fistula: '#2563EB', // Azul
  fissura: '#16A34A', // Verde
  pilonidal: '#D97706', // Laranja
};

const SURGERY_LABELS: Record<string, string> = {
  hemorroidectomia: 'Hemorroidectomia',
  fistula: 'Fístula Anal',
  fissura: 'Fissura Anal',
  pilonidal: 'Doença Pilonidal',
};

export function PainEvolutionChart({ data }: PainEvolutionChartProps) {
  // Extrair tipos de cirurgia dos dados
  const surgeryTypes = data.length > 0
    ? Object.keys(data[0]).filter(key => key !== 'day')
    : [];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {SURGERY_LABELS[entry.dataKey] || entry.dataKey}: {entry.value?.toFixed(1)} / 10
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-2 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Evolução da Dor Média
        </CardTitle>
        <CardDescription>
          Nível médio de dor reportado pelos pacientes ao longo dos dias pós-operatórios (escala 0-10)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="day"
              stroke="#6b7280"
              style={{ fontSize: '14px', fontWeight: 600 }}
            />
            <YAxis
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              stroke="#6b7280"
              style={{ fontSize: '14px', fontWeight: 600 }}
              label={{ value: 'Dor (0-10)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => SURGERY_LABELS[value] || value}
            />
            {surgeryTypes.map((type) => (
              <Line
                key={type}
                type="monotone"
                dataKey={type}
                stroke={SURGERY_COLORS[type] || '#6b7280'}
                strokeWidth={3}
                dot={{ fill: SURGERY_COLORS[type] || '#6b7280', r: 5 }}
                activeDot={{ r: 8 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Legenda adicional */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            <strong>Interpretação:</strong> Valores mais altos indicam maior intensidade de dor.
            Uma diminuição gradual é esperada ao longo dos dias.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
