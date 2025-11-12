'use client';

import { useState, useRef } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ZAxis,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { TrendingUp, AlertTriangle, Info } from 'lucide-react';

interface DataPoint {
  x: number;
  y: number;
  patientId?: string;
  group?: string;
  outlier?: boolean;
  cooksDistance?: number;
  predicted?: number;
  residual?: number;
  [key: string]: any;
}

interface RegressionLine {
  slope: number;
  intercept: number;
  r2: number;
  pValue: number;
  ciUpper?: Array<{ x: number; y: number }>;
  ciLower?: Array<{ x: number; y: number }>;
}

interface QuadrantLabel {
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  label: string;
}

interface InteractiveScatterPlotProps {
  data: DataPoint[];
  xAxisKey: string;
  yAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  regressionLine?: RegressionLine;
  quadrantLabels?: QuadrantLabel[];
  groupBy?: string;
  highlightOutliers?: boolean;
  outlierThreshold?: number;
  height?: number;
}

export function InteractiveScatterPlot({
  data,
  xAxisKey,
  yAxisKey,
  xAxisLabel,
  yAxisLabel,
  title,
  regressionLine,
  quadrantLabels,
  groupBy,
  highlightOutliers = true,
  outlierThreshold = 0.5,
  height = 400,
}: InteractiveScatterPlotProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<ChartSettings>({
    showConfidenceIntervals: true,
    showGridLines: true,
    showDataLabels: false,
    showLegend: true,
    colorScheme: 'telos',
    axisScaleX: 'linear',
    axisScaleY: 'linear',
    opacity: 80,
    fontSize: 12,
  });

  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

  const colors = getColorPalette(settings.colorScheme);

  // Group data if groupBy is specified
  const groupedData = groupBy
    ? data.reduce((acc, point) => {
        const groupKey = point[groupBy] as string;
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(point);
        return acc;
      }, {} as Record<string, DataPoint[]>)
    : { all: data };

  const handlePointClick = (point: DataPoint) => {
    setSelectedPoint(point);
    setIsDetailOpen(true);
  };

  // Calculate regression line points
  const regressionLineData =
    regressionLine && data.length > 0
      ? (() => {
          const xValues = data.map((d) => d[xAxisKey]);
          const minX = Math.min(...xValues);
          const maxX = Math.max(...xValues);
          const points = 100;
          const step = (maxX - minX) / points;

          return Array.from({ length: points }, (_, i) => {
            const x = minX + step * i;
            return {
              x,
              y: regressionLine.slope * x + regressionLine.intercept,
              predicted: true,
            };
          });
        })()
      : [];

  // Calculate confidence band
  const ciUpperData = regressionLine?.ciUpper || [];
  const ciLowerData = regressionLine?.ciLower || [];

  // Identify outliers based on Cook's distance
  const outliers = highlightOutliers
    ? data.filter(
        (d) => d.cooksDistance && d.cooksDistance > outlierThreshold
      )
    : [];

  return (
    <div ref={chartRef} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {regressionLine && (
            <div className="flex items-center gap-3 mt-2 text-sm">
              <Badge variant="secondary">
                R² = {regressionLine.r2.toFixed(3)}
              </Badge>
              <Badge
                variant={regressionLine.pValue < 0.05 ? 'default' : 'outline'}
              >
                p = {regressionLine.pValue < 0.001 ? '<0.001' : regressionLine.pValue.toFixed(3)}
              </Badge>
              <span className="text-gray-600">
                y = {regressionLine.slope.toFixed(3)}x +{' '}
                {regressionLine.intercept.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ChartControls
            settings={settings}
            onSettingsChange={setSettings}
          />

          <ChartExportMenu
            chartRef={chartRef}
            chartName={title?.toLowerCase().replace(/\s+/g, '-') || 'scatter-plot'}
          />
        </div>
      </div>

      {/* Outlier Alert */}
      {outliers.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-orange-900 text-sm">
              {outliers.length} Outlier{outliers.length > 1 ? 's' : ''} Detectado{outliers.length > 1 ? 's' : ''}
            </div>
            <div className="text-xs text-orange-800 mt-1">
              Pontos com alta influência (Cook's D {'>'} {outlierThreshold}) destacados em vermelho
            </div>
          </div>
        </div>
      )}

      {/* Legend for groups */}
      {settings.showLegend && groupBy && Object.keys(groupedData).length > 1 && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg">
          {Object.keys(groupedData).map((groupKey, index) => {
            const color = colors[index % colors.length];
            const isHovered = hoveredGroup === groupKey;

            return (
              <button
                key={groupKey}
                onMouseEnter={() => setHoveredGroup(groupKey)}
                onMouseLeave={() => setHoveredGroup(null)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all hover:bg-white ${
                  isHovered || hoveredGroup === null ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium">{groupKey}</span>
                <Badge variant="secondary" className="text-xs">
                  n={groupedData[groupKey].length}
                </Badge>
              </button>
            );
          })}
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          {settings.showGridLines && (
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          )}

          <XAxis
            type="number"
            dataKey="x"
            name={xAxisKey}
            label={
              xAxisLabel
                ? { value: xAxisLabel, position: 'insideBottom', offset: -10 }
                : undefined
            }
            tick={{ fontSize: settings.fontSize }}
          />

          <YAxis
            type="number"
            dataKey="y"
            name={yAxisKey}
            label={
              yAxisLabel
                ? { value: yAxisLabel, angle: -90, position: 'insideLeft' }
                : undefined
            }
            tick={{ fontSize: settings.fontSize }}
          />

          <ZAxis range={[50, 200]} />

          <Tooltip
            content={<CustomTooltip type="regression" />}
            cursor={{ strokeDasharray: '3 3' }}
          />

          {/* Quadrant dividers */}
          {quadrantLabels && (
            <>
              <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="5 5" />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="5 5" />
            </>
          )}

          {/* Confidence interval band */}
          {settings.showConfidenceIntervals &&
            ciUpperData.length > 0 &&
            ciLowerData.length > 0 && (
              <>
                <Scatter
                  data={ciUpperData}
                  fill={colors[0]}
                  fillOpacity={0.1}
                  shape={() => <></>}
                  line={{ stroke: colors[0], strokeWidth: 1, strokeDasharray: '5 5' }}
                  isAnimationActive={false}
                />
                <Scatter
                  data={ciLowerData}
                  fill={colors[0]}
                  fillOpacity={0.1}
                  shape={() => <></>}
                  line={{ stroke: colors[0], strokeWidth: 1, strokeDasharray: '5 5' }}
                  isAnimationActive={false}
                />
              </>
            )}

          {/* Regression line */}
          {regressionLine && regressionLineData.length > 0 && (
            <Scatter
              data={regressionLineData}
              fill="none"
              line={{ stroke: colors[0], strokeWidth: 2 }}
              shape={() => <></>}
              isAnimationActive={false}
            />
          )}

          {/* Data points by group */}
          {Object.entries(groupedData).map(([groupKey, points], groupIndex) => {
            const color = colors[groupIndex % colors.length];
            const isGroupHovered = hoveredGroup === groupKey || hoveredGroup === null;

            return (
              <Scatter
                key={groupKey}
                name={groupKey}
                data={points.map((p) => ({ ...p, x: p[xAxisKey], y: p[yAxisKey] }))}
                fill={color}
                opacity={(settings.opacity / 100) * (isGroupHovered ? 1 : 0.3)}
                onClick={(data) => handlePointClick(data)}
                className="cursor-pointer"
              >
                {points.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.outlier || (entry.cooksDistance && entry.cooksDistance > outlierThreshold)
                        ? '#ef4444'
                        : color
                    }
                    stroke={
                      entry.outlier || (entry.cooksDistance && entry.cooksDistance > outlierThreshold)
                        ? '#991b1b'
                        : 'white'
                    }
                    strokeWidth={
                      entry.outlier || (entry.cooksDistance && entry.cooksDistance > outlierThreshold)
                        ? 2
                        : 1
                    }
                  />
                ))}
              </Scatter>
            );
          })}
        </ScatterChart>
      </ResponsiveContainer>

      {/* Hint */}
      <div className="text-xs text-center text-gray-500">
        Clique nos pontos para ver detalhes do paciente
      </div>

      {/* Point Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Detalhes do Ponto de Dados
            </DialogTitle>
            <DialogDescription>
              {selectedPoint?.patientId || 'Informações do paciente'}
            </DialogDescription>
          </DialogHeader>

          {selectedPoint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 border rounded-lg">
                  <div className="text-gray-600 mb-1">{xAxisLabel || xAxisKey}</div>
                  <div className="text-2xl font-bold">{selectedPoint[xAxisKey]}</div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="text-gray-600 mb-1">{yAxisLabel || yAxisKey}</div>
                  <div className="text-2xl font-bold">{selectedPoint[yAxisKey]}</div>
                </div>

                {selectedPoint.predicted !== undefined && (
                  <>
                    <div className="p-3 border rounded-lg bg-blue-50">
                      <div className="text-gray-600 mb-1">Valor Predito</div>
                      <div className="text-2xl font-bold text-blue-700">
                        {selectedPoint.predicted.toFixed(2)}
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="text-gray-600 mb-1">Resíduo</div>
                      <div
                        className={`text-2xl font-bold ${
                          Math.abs(selectedPoint[yAxisKey] - selectedPoint.predicted) > 2
                            ? 'text-red-600'
                            : 'text-gray-700'
                        }`}
                      >
                        {(selectedPoint[yAxisKey] - selectedPoint.predicted).toFixed(2)}
                      </div>
                    </div>
                  </>
                )}

                {selectedPoint.cooksDistance !== undefined && (
                  <div className="col-span-2 p-3 border rounded-lg">
                    <div className="text-gray-600 mb-1">Cook's Distance</div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {selectedPoint.cooksDistance.toFixed(4)}
                      </div>
                      {selectedPoint.cooksDistance > outlierThreshold && (
                        <Badge variant="destructive">Outlier</Badge>
                      )}
                    </div>
                  </div>
                )}

                {selectedPoint.group && (
                  <div className="col-span-2 p-3 border rounded-lg bg-gray-50">
                    <div className="text-gray-600 mb-1">Grupo</div>
                    <Badge variant="secondary">{selectedPoint.group}</Badge>
                  </div>
                )}
              </div>

              {/* Additional details */}
              {Object.entries(selectedPoint)
                .filter(
                  ([key]) =>
                    !['x', 'y', xAxisKey, yAxisKey, 'predicted', 'residual', 'cooksDistance', 'group', 'patientId', 'outlier'].includes(key)
                )
                .length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-2">Informações Adicionais</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedPoint)
                      .filter(
                        ([key]) =>
                          !['x', 'y', xAxisKey, yAxisKey, 'predicted', 'residual', 'cooksDistance', 'group', 'patientId', 'outlier'].includes(key)
                      )
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
