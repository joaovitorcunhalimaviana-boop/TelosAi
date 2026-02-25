'use client';

import { useState, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ErrorBar,
  ReferenceLine,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CustomTooltip } from './CustomTooltip';
import { ChartControls, ChartSettings, getColorPalette } from './ChartControls';
import { ChartExportMenu } from './ChartExportMenu';
import { ArrowLeft, TrendingUp, Users } from 'lucide-react';

interface DataPoint {
  name: string;
  value: number;
  sd?: number;
  ci?: { lower: number; upper: number };
  pValue?: number;
  n?: number;
  color?: string;
  patients?: Array<{
    id: string;
    name: string;
    value: number;
    details?: Record<string, any>;
  }>;
}

interface SignificanceBracket {
  group1Index: number;
  group2Index: number;
  pValue: number;
  y: number;
}

interface InteractiveBarChartProps {
  data: DataPoint[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  enableDrillDown?: boolean;
  significanceBrackets?: SignificanceBracket[];
  referenceValue?: number;
  height?: number;
}

export function InteractiveBarChart({
  data,
  title,
  xAxisLabel,
  yAxisLabel,
  enableDrillDown = true,
  significanceBrackets = [],
  referenceValue,
  height = 400,
}: InteractiveBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<ChartSettings>({
    showConfidenceIntervals: true,
    showGridLines: true,
    showDataLabels: true,
    showLegend: false,
    colorScheme: 'vigia',
    axisScaleX: 'linear',
    axisScaleY: 'linear',
    opacity: 100,
    fontSize: 12,
  });

  const [selectedBar, setSelectedBar] = useState<DataPoint | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);

  const colors = getColorPalette(settings.colorScheme);

  const handleBarClick = (data: DataPoint) => {
    if (enableDrillDown && data.patients && data.patients.length > 0) {
      setSelectedBar(data);
      setIsDrillDownOpen(true);
    }
  };

  const getSignificanceLabel = (p: number): string => {
    if (p < 0.001) return '***';
    if (p < 0.01) return '**';
    if (p < 0.05) return '*';
    return 'ns';
  };

  const maxValue = Math.max(...data.map((d) => d.value));
  const bracketHeight = maxValue * 0.05;

  return (
    <div ref={chartRef} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
        </div>

        <div className="flex items-center gap-2">
          <ChartControls
            settings={settings}
            onSettingsChange={setSettings}
            showScaleControls={false}
          />

          <ChartExportMenu
            chartRef={chartRef}
            chartName={title?.toLowerCase().replace(/\s+/g, '-') || 'bar-chart'}
          />
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 40, right: 30, left: 20, bottom: 20 }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {settings.showGridLines && (
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" />
          )}

          <XAxis
            dataKey="name"
            stroke="#1E2535"
            tick={{ fill: '#7A8299', fontSize: settings.fontSize }}
            label={
              xAxisLabel
                ? { value: xAxisLabel, position: 'insideBottom', offset: -10, fill: '#7A8299' }
                : undefined
            }
          />

          <YAxis
            stroke="#1E2535"
            tick={{ fill: '#7A8299', fontSize: settings.fontSize }}
            label={
              yAxisLabel
                ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#7A8299' }
                : undefined
            }
          />

          <Tooltip
            content={<CustomTooltip type="comparison" />}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />

          {/* Reference Line */}
          {referenceValue !== undefined && (
            <ReferenceLine
              y={referenceValue}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{
                value: `Referência: ${referenceValue}`,
                position: 'right',
                fontSize: settings.fontSize - 2,
              }}
            />
          )}

          <Bar
            dataKey="value"
            radius={[8, 8, 0, 0]}
            opacity={settings.opacity / 100}
            onClick={(data) => handleBarClick(data as DataPoint)}
            onMouseEnter={(_, index) => setHoveredIndex(index)}
            label={
              settings.showDataLabels
                ? {
                    position: 'top',
                    fontSize: settings.fontSize,
                    formatter: (value: any) => typeof value === 'number' ? value.toFixed(1) : '',
                  }
                : false
            }
            className={enableDrillDown ? 'cursor-pointer' : ''}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
                opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.5}
              />
            ))}

            {/* Error bars for confidence intervals */}
            {settings.showConfidenceIntervals && (
              <ErrorBar
                dataKey="ci"
                width={4}
                strokeWidth={2}
                stroke="#374151"
              />
            )}
          </Bar>

          {/* Significance Brackets */}
          {significanceBrackets.map((bracket, index) => {
            const x1 = bracket.group1Index;
            const x2 = bracket.group2Index;
            const y = bracket.y || maxValue + bracketHeight * (index + 1);
            const significance = getSignificanceLabel(bracket.pValue);

            return (
              <g key={`bracket-${index}`}>
                {/* Left vertical line */}
                <line
                  x1={`${(x1 + 0.5) * (100 / data.length)}%`}
                  y1={`${100 - (y / maxValue) * 80}%`}
                  x2={`${(x1 + 0.5) * (100 / data.length)}%`}
                  y2={`${100 - ((y - bracketHeight * 0.3) / maxValue) * 80}%`}
                  stroke="#374151"
                  strokeWidth="2"
                />

                {/* Horizontal line */}
                <line
                  x1={`${(x1 + 0.5) * (100 / data.length)}%`}
                  y1={`${100 - (y / maxValue) * 80}%`}
                  x2={`${(x2 + 0.5) * (100 / data.length)}%`}
                  y2={`${100 - (y / maxValue) * 80}%`}
                  stroke="#374151"
                  strokeWidth="2"
                />

                {/* Right vertical line */}
                <line
                  x1={`${(x2 + 0.5) * (100 / data.length)}%`}
                  y1={`${100 - (y / maxValue) * 80}%`}
                  x2={`${(x2 + 0.5) * (100 / data.length)}%`}
                  y2={`${100 - ((y - bracketHeight * 0.3) / maxValue) * 80}%`}
                  stroke="#374151"
                  strokeWidth="2"
                />

                {/* Significance label */}
                <text
                  x={`${((x1 + x2 + 1) / 2) * (100 / data.length)}%`}
                  y={`${100 - ((y + bracketHeight * 0.2) / maxValue) * 80}%`}
                  textAnchor="middle"
                  fontSize={settings.fontSize}
                  fontWeight="bold"
                  fill={bracket.pValue < 0.05 ? '#16a34a' : '#6b7280'}
                >
                  {significance}
                </text>
              </g>
            );
          })}
        </BarChart>
      </ResponsiveContainer>

      {/* Drill-down hint */}
      {enableDrillDown && (
        <div className="text-xs text-center" style={{ color: '#7A8299' }}>
          Clique nas barras para ver dados individuais dos pacientes
        </div>
      )}

      {/* Drill-Down Modal */}
      <Dialog open={isDrillDownOpen} onOpenChange={setIsDrillDownOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Dados Individuais: {selectedBar?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedBar?.n || selectedBar?.patients?.length || 0} pacientes neste grupo
            </DialogDescription>
          </DialogHeader>

          {selectedBar?.patients && (
            <div className="space-y-4">
              {/* Summary Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Estatísticas do Grupo</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4 text-sm" style={{ color: '#D8DEEB' }}>
                  <div>
                    <div style={{ color: '#7A8299' }}>Média</div>
                    <div className="text-2xl font-bold">{selectedBar.value.toFixed(1)}</div>
                  </div>
                  {selectedBar.sd && (
                    <div>
                      <div style={{ color: '#7A8299' }}>Desvio Padrão</div>
                      <div className="text-2xl font-bold">{selectedBar.sd.toFixed(1)}</div>
                    </div>
                  )}
                  {selectedBar.ci && (
                    <div>
                      <div style={{ color: '#7A8299' }}>IC 95%</div>
                      <div className="text-sm font-semibold">
                        [{selectedBar.ci.lower.toFixed(1)}, {selectedBar.ci.upper.toFixed(1)}]
                      </div>
                    </div>
                  )}
                  <div>
                    <div style={{ color: '#7A8299' }}>N</div>
                    <div className="text-2xl font-bold">{selectedBar.patients.length}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Patient Data */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead style={{ backgroundColor: '#0B0E14' }}>
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold">Paciente</th>
                      <th className="text-center p-3 text-sm font-semibold">Valor</th>
                      <th className="text-center p-3 text-sm font-semibold">Desvio da Média</th>
                      <th className="text-right p-3 text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBar.patients
                      .sort((a, b) => b.value - a.value)
                      .map((patient) => {
                        const deviation = patient.value - selectedBar.value;
                        const isOutlier = Math.abs(deviation) > (selectedBar.sd || 0) * 2;

                        return (
                          <tr
                            key={patient.id}
                            className="border-t hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-3">
                              <div className="font-medium">{patient.id}</div>
                              {patient.name && (
                                <div className="text-xs text-gray-500">{patient.name}</div>
                              )}
                            </td>
                            <td className="text-center p-3">
                              <span className="font-semibold">{patient.value.toFixed(1)}</span>
                            </td>
                            <td className="text-center p-3">
                              <span
                                className={`font-medium ${
                                  deviation > 0 ? 'text-red-600' : 'text-green-600'
                                }`}
                              >
                                {deviation > 0 ? '+' : ''}
                                {deviation.toFixed(1)}
                              </span>
                            </td>
                            <td className="text-right p-3">
                              {isOutlier && (
                                <Badge variant="destructive" className="text-xs">
                                  Outlier
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Distribution Visualization */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#0B0E14' }}>
                <h4 className="text-sm font-semibold mb-3" style={{ color: '#F0EAD6' }}>Distribuição dos Valores</h4>
                <div className="flex items-end gap-1 h-32">
                  {selectedBar.patients.map((patient, index) => {
                    const maxPatientValue = Math.max(
                      ...selectedBar.patients!.map((p) => p.value)
                    );
                    const height = (patient.value / maxPatientValue) * 100;

                    return (
                      <div
                        key={patient.id}
                        className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative group"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {patient.id}: {patient.value.toFixed(1)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
