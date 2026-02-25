'use client';

import { useState, useRef, useMemo } from 'react';
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
  Cell,
  ZAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomTooltip } from './CustomTooltip';
import { ChartControls, ChartSettings, getColorPalette } from './ChartControls';
import { ChartExportMenu } from './ChartExportMenu';
import { ZoomIn, ZoomOut, Maximize2, Eye, EyeOff, TrendingUp } from 'lucide-react';

interface DataPoint {
  x: number;
  y: number;
  z?: number; // For bubble size
  group?: string;
  patientId?: string;
  predicted?: number;
  outlier?: boolean;
  cooksDistance?: number;
  [key: string]: any;
}

interface SeriesConfig {
  data: DataPoint[];
  name: string;
  color?: string;
  shape?: 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';
}

interface RegressionLine {
  slope: number;
  intercept: number;
  rSquared: number;
  color?: string;
  label?: string;
}

interface InteractiveScatterChartProps {
  series: SeriesConfig[];
  xAxisKey?: string;
  yAxisKey?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  regressionLine?: RegressionLine;
  referenceLines?: Array<{ x?: number; y?: number; label: string; color?: string }>;
  enableZoom?: boolean;
  height?: number;
  showOutliers?: boolean;
}

export function InteractiveScatterChart({
  series,
  xAxisKey = 'x',
  yAxisKey = 'y',
  xAxisLabel,
  yAxisLabel,
  title,
  regressionLine,
  referenceLines = [],
  enableZoom = true,
  height = 400,
  showOutliers = true,
}: InteractiveScatterChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<ChartSettings>({
    showConfidenceIntervals: true,
    showGridLines: true,
    showDataLabels: false,
    showLegend: true,
    colorScheme: 'vigia',
    axisScaleX: 'linear',
    axisScaleY: 'linear',
    opacity: 100,
    fontSize: 12,
  });

  const [zoomDomain, setZoomDomain] = useState<{ x?: [number, number]; y?: [number, number] } | null>(null);
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(
    new Set(series.map((s) => s.name))
  );
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  const colors = getColorPalette(settings.colorScheme);

  // Calculate regression line points
  const regressionPoints = useMemo(() => {
    if (!regressionLine) return [];

    const allPoints = series.flatMap((s) => s.data);
    if (allPoints.length === 0) return [];

    const xValues = allPoints.map((p) => p.x);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);

    return [
      { x: minX, y: regressionLine.slope * minX + regressionLine.intercept },
      { x: maxX, y: regressionLine.slope * maxX + regressionLine.intercept },
    ];
  }, [regressionLine, series]);

  const handleZoomIn = () => {
    const allPoints = series.flatMap((s) => s.data);
    const xValues = allPoints.map((p) => p.x);
    const yValues = allPoints.map((p) => p.y);

    if (!zoomDomain) {
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      const minY = Math.min(...yValues);
      const maxY = Math.max(...yValues);
      const rangeX = maxX - minX;
      const rangeY = maxY - minY;

      setZoomDomain({
        x: [minX + rangeX * 0.25, maxX - rangeX * 0.25],
        y: [minY + rangeY * 0.25, maxY - rangeY * 0.25],
      });
    } else {
      const [minX, maxX] = zoomDomain.x || [0, 100];
      const [minY, maxY] = zoomDomain.y || [0, 100];
      const rangeX = maxX - minX;
      const rangeY = maxY - minY;

      setZoomDomain({
        x: [minX + rangeX * 0.125, maxX - rangeX * 0.125],
        y: [minY + rangeY * 0.125, maxY - rangeY * 0.125],
      });
    }
  };

  const handleZoomOut = () => {
    if (zoomDomain) {
      const allPoints = series.flatMap((s) => s.data);
      const xValues = allPoints.map((p) => p.x);
      const yValues = allPoints.map((p) => p.y);
      const dataMinX = Math.min(...xValues);
      const dataMaxX = Math.max(...xValues);
      const dataMinY = Math.min(...yValues);
      const dataMaxY = Math.max(...yValues);

      if (zoomDomain.x && zoomDomain.y) {
        const [minX, maxX] = zoomDomain.x;
        const [minY, maxY] = zoomDomain.y;
        const rangeX = maxX - minX;
        const rangeY = maxY - minY;

        const newMinX = Math.max(dataMinX, minX - rangeX * 0.25);
        const newMaxX = Math.min(dataMaxX, maxX + rangeX * 0.25);
        const newMinY = Math.max(dataMinY, minY - rangeY * 0.25);
        const newMaxY = Math.min(dataMaxY, maxY + rangeY * 0.25);

        if (
          newMinX <= dataMinX &&
          newMaxX >= dataMaxX &&
          newMinY <= dataMinY &&
          newMaxY >= dataMaxY
        ) {
          setZoomDomain(null);
        } else {
          setZoomDomain({
            x: [newMinX, newMaxX],
            y: [newMinY, newMaxY],
          });
        }
      }
    }
  };

  const handleResetZoom = () => {
    setZoomDomain(null);
  };

  const toggleSeries = (name: string) => {
    const newVisible = new Set(visibleSeries);
    if (newVisible.has(name)) {
      if (newVisible.size > 1) {
        newVisible.delete(name);
      }
    } else {
      newVisible.add(name);
    }
    setVisibleSeries(newVisible);
  };

  return (
    <div ref={chartRef} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {regressionLine && (
            <div className="flex items-center gap-3 mt-1 text-sm">
              <Badge variant="secondary" className="font-mono">
                y = {regressionLine.slope.toFixed(3)}x + {regressionLine.intercept.toFixed(2)}
              </Badge>
              <Badge variant="outline">
                R² = {regressionLine.rSquared.toFixed(3)}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {enableZoom && (
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={!zoomDomain}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                disabled={!zoomDomain}
                className="h-8 w-8 p-0"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          <ChartControls
            settings={settings}
            onSettingsChange={setSettings}
            onReset={handleResetZoom}
          />

          <ChartExportMenu
            chartRef={chartRef}
            chartName={title?.toLowerCase().replace(/\s+/g, '-') || 'scatter-chart'}
          />
        </div>
      </div>

      {/* Interactive Legend */}
      {settings.showLegend && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#0B0E14' }}>
          {series.map((s, index) => {
            const color = s.color || colors[index % colors.length];
            const isVisible = visibleSeries.has(s.name);

            return (
              <button
                key={s.name}
                onClick={() => toggleSeries(s.name)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all hover:opacity-80 ${
                  isVisible ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium" style={{ color: '#D8DEEB' }}>{s.name}</span>
                <span className="text-xs" style={{ color: '#7A8299' }}>
                  (n={s.data.length})
                </span>
                {isVisible ? (
                  <Eye className="h-3.5 w-3.5 text-gray-500" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                )}
              </button>
            );
          })}

          {regressionLine && (
            <div className="flex items-center gap-2 px-3 py-1.5 ml-auto">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Linha de Regressão</span>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          {settings.showGridLines && (
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" />
          )}

          <XAxis
            type="number"
            dataKey={xAxisKey}
            name={xAxisLabel}
            stroke="#1E2535"
            tick={{ fill: '#7A8299', fontSize: settings.fontSize }}
            label={
              xAxisLabel
                ? { value: xAxisLabel, position: 'insideBottom', offset: -10, fill: '#7A8299' }
                : undefined
            }
            domain={zoomDomain?.x || ['auto', 'auto']}
            scale={settings.axisScaleX}
          />

          <YAxis
            type="number"
            dataKey={yAxisKey}
            name={yAxisLabel}
            stroke="#1E2535"
            tick={{ fill: '#7A8299', fontSize: settings.fontSize }}
            label={
              yAxisLabel
                ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#7A8299' }
                : undefined
            }
            domain={zoomDomain?.y || ['auto', 'auto']}
            scale={settings.axisScaleY}
          />

          <ZAxis type="number" dataKey="z" range={[50, 400]} />

          <Tooltip
            content={<CustomTooltip type="regression" />}
            cursor={{ strokeDasharray: '3 3' }}
          />

          {/* Reference Lines */}
          {referenceLines.map((refLine, index) => (
            <ReferenceLine
              key={index}
              y={refLine.y}
              x={refLine.x}
              stroke={refLine.color || '#ef4444'}
              strokeDasharray="5 5"
              label={{
                value: refLine.label,
                position: 'top',
                fontSize: settings.fontSize,
              }}
            />
          ))}

          {/* Regression Line */}
          {regressionLine && regressionPoints.length > 0 && (
            <Scatter
              name="Regressão"
              data={regressionPoints}
              fill="none"
              line={{ stroke: regressionLine.color || '#3b82f6', strokeWidth: 2 }}
              shape={() => <></>}
              isAnimationActive={false}
            />
          )}

          {/* Data Series */}
          {series.map((s, index) => {
            const color = s.color || colors[index % colors.length];
            const isVisible = visibleSeries.has(s.name);

            if (!isVisible) return null;

            return (
              <Scatter
                key={s.name}
                name={s.name}
                data={s.data}
                fill={color}
                opacity={settings.opacity / 100}
                shape={s.shape || 'circle'}
                onMouseEnter={(data) => setHoveredPoint(data)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {s.data.map((entry, i) => {
                  const isHovered = hoveredPoint === entry;
                  const isOutlier = showOutliers && entry.outlier;

                  return (
                    <Cell
                      key={`cell-${i}`}
                      fill={isOutlier ? '#ef4444' : color}
                      stroke={isHovered ? '#000' : isOutlier ? '#b91c1c' : 'none'}
                      strokeWidth={isHovered ? 2 : isOutlier ? 1.5 : 0}
                      opacity={isHovered ? 1 : settings.opacity / 100}
                      r={isHovered ? 8 : isOutlier ? 6 : 5}
                    />
                  );
                })}
              </Scatter>
            );
          })}
        </ScatterChart>
      </ResponsiveContainer>

      {/* Status Info */}
      {zoomDomain && (
        <div className="text-xs text-center" style={{ color: '#7A8299' }}>
          Visualização com zoom ativo. Clique no botão de maximizar para resetar.
        </div>
      )}

      {showOutliers && (
        <div className="flex items-center justify-center gap-2 text-xs" style={{ color: '#7A8299' }}>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Outliers identificados</span>
          </div>
        </div>
      )}
    </div>
  );
}
