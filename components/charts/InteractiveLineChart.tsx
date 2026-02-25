'use client';

import { useState, useRef, useMemo, useCallback, memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Brush,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomTooltip } from './CustomTooltip';
import { ChartControls, ChartSettings, getColorPalette } from './ChartControls';
import { ChartExportMenu } from './ChartExportMenu';
import { ZoomIn, ZoomOut, Maximize2, Eye, EyeOff } from 'lucide-react';

interface DataPoint {
  [key: string]: number | string | any;
}

interface SeriesConfig {
  dataKey: string;
  name: string;
  color?: string;
  showCI?: boolean;
  ciLower?: string;
  ciUpper?: string;
}

interface ReferenceLineConfig {
  y?: number;
  x?: number;
  label: string;
  color?: string;
  strokeDasharray?: string;
}

interface InteractiveLineChartProps {
  data: DataPoint[];
  series: SeriesConfig[];
  xAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  referenceLines?: ReferenceLineConfig[];
  tooltipType?: 'default' | 'km-curve' | 'comparison' | 'regression';
  enableZoom?: boolean;
  enableBrush?: boolean;
  height?: number;
}

// Memoized chart component for better performance
const MemoizedLineChart = memo(LineChart);
const MemoizedLine = memo(Line);

export function InteractiveLineChart({
  data,
  series,
  xAxisKey,
  xAxisLabel,
  yAxisLabel,
  title,
  referenceLines = [],
  tooltipType = 'default',
  enableZoom = true,
  enableBrush = false,
  height = 400,
}: InteractiveLineChartProps) {
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
    new Set(series.map((s) => s.dataKey))
  );

  const colors = useMemo(() => getColorPalette(settings.colorScheme), [settings.colorScheme]);

  // Memoize display data for performance
  const displayData = useMemo(() => {
    if (!zoomDomain?.x) return data;

    return data.filter((d) => {
      const xVal = Number(d[xAxisKey]);
      return xVal >= zoomDomain.x![0] && xVal <= zoomDomain.x![1];
    });
  }, [data, zoomDomain, xAxisKey]);

  const handleZoomIn = useCallback(() => {
    if (!zoomDomain) {
      const xValues = data.map((d) => Number(d[xAxisKey]));
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      const rangeX = maxX - minX;

      setZoomDomain({
        x: [minX + rangeX * 0.25, maxX - rangeX * 0.25],
      });
    } else if (zoomDomain.x) {
      const [minX, maxX] = zoomDomain.x;
      const rangeX = maxX - minX;
      setZoomDomain({
        ...zoomDomain,
        x: [minX + rangeX * 0.125, maxX - rangeX * 0.125],
      });
    }
  }, [zoomDomain, data, xAxisKey]);

  const handleZoomOut = useCallback(() => {
    if (zoomDomain?.x) {
      const [minX, maxX] = zoomDomain.x;
      const rangeX = maxX - minX;
      const xValues = data.map((d) => Number(d[xAxisKey]));
      const dataMinX = Math.min(...xValues);
      const dataMaxX = Math.max(...xValues);

      const newMinX = Math.max(dataMinX, minX - rangeX * 0.25);
      const newMaxX = Math.min(dataMaxX, maxX + rangeX * 0.25);

      if (newMinX <= dataMinX && newMaxX >= dataMaxX) {
        setZoomDomain(null);
      } else {
        setZoomDomain({
          ...zoomDomain,
          x: [newMinX, newMaxX],
        });
      }
    }
  }, [zoomDomain, data, xAxisKey]);

  const handleResetZoom = useCallback(() => {
    setZoomDomain(null);
  }, []);

  const toggleSeries = useCallback((dataKey: string) => {
    const newVisible = new Set(visibleSeries);
    if (newVisible.has(dataKey)) {
      if (newVisible.size > 1) {
        newVisible.delete(dataKey);
      }
    } else {
      newVisible.add(dataKey);
    }
    setVisibleSeries(newVisible);
  }, [visibleSeries]);

  const toggleAllSeries = useCallback(() => {
    if (visibleSeries.size === series.length) {
      setVisibleSeries(new Set([series[0].dataKey]));
    } else {
      setVisibleSeries(new Set(series.map((s) => s.dataKey)));
    }
  }, [visibleSeries, series]);

  return (
    <div ref={chartRef} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
        </div>

        <div className="flex items-center gap-2">
          {enableZoom && (
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={!data || data.length === 0}
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
            chartName={title?.toLowerCase().replace(/\s+/g, '-') || 'line-chart'}
          />
        </div>
      </div>

      {/* Interactive Legend */}
      {settings.showLegend && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#0B0E14' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAllSeries}
            className="h-8 text-xs"
            style={{ color: '#D8DEEB' }}
          >
            {visibleSeries.size === series.length ? 'Ocultar Todos' : 'Mostrar Todos'}
          </Button>

          <div className="h-4 w-px" style={{ backgroundColor: '#1E2535' }} />

          {series.map((s, index) => {
            const color = s.color || colors[index % colors.length];
            const isVisible = visibleSeries.has(s.dataKey);

            return (
              <button
                key={s.dataKey}
                onClick={() => toggleSeries(s.dataKey)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all hover:opacity-80 ${
                  isVisible ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div
                  className="w-4 h-1 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium" style={{ color: '#D8DEEB' }}>{s.name}</span>
                {isVisible ? (
                  <Eye className="h-3.5 w-3.5 text-gray-500" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                )}
              </button>
            );
          })}

          {zoomDomain && (
            <Badge variant="secondary" className="ml-auto">
              Zoom ativo
            </Badge>
          )}
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={displayData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          {settings.showGridLines && (
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" />
          )}

          <XAxis
            dataKey={xAxisKey}
            stroke="#1E2535"
            tick={{ fill: '#7A8299', fontSize: settings.fontSize }}
            label={
              xAxisLabel
                ? { value: xAxisLabel, position: 'insideBottom', offset: -10, fill: '#7A8299' }
                : undefined
            }
            scale={settings.axisScaleX}
            domain={settings.axisScaleX === 'log' ? [0.1, 'auto'] : ['auto', 'auto']}
          />

          <YAxis
            stroke="#1E2535"
            tick={{ fill: '#7A8299', fontSize: settings.fontSize }}
            label={
              yAxisLabel
                ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#7A8299' }
                : undefined
            }
            scale={settings.axisScaleY}
            domain={settings.axisScaleY === 'log' ? [0.1, 'auto'] : [0, 'auto']}
          />

          <Tooltip
            content={<CustomTooltip type={tooltipType} />}
            cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }}
          />

          {/* Reference Lines */}
          {referenceLines.map((refLine, index) => (
            <ReferenceLine
              key={index}
              y={refLine.y}
              x={refLine.x}
              stroke={refLine.color || '#ef4444'}
              strokeDasharray={refLine.strokeDasharray || '5 5'}
              label={{
                value: refLine.label,
                position: 'top',
                fontSize: settings.fontSize,
              }}
            />
          ))}

          {/* Data Series with Confidence Intervals */}
          {series.map((s, index) => {
            const color = s.color || colors[index % colors.length];
            const isVisible = visibleSeries.has(s.dataKey);

            if (!isVisible) return null;

            return (
              <g key={s.dataKey}>
                {/* Confidence Interval Area */}
                {settings.showConfidenceIntervals && s.showCI && s.ciLower && s.ciUpper && (
                  <Area
                    dataKey={s.ciUpper}
                    fill={color}
                    fillOpacity={0.2}
                    stroke="none"
                    isAnimationActive={false}
                  />
                )}

                {/* Main Line */}
                <Line
                  type="monotone"
                  dataKey={s.dataKey}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 4, fill: color }}
                  activeDot={{ r: 6, fill: color }}
                  opacity={settings.opacity / 100}
                  name={s.name}
                  label={
                    settings.showDataLabels
                      ? { position: 'top', fontSize: settings.fontSize - 2 }
                      : false
                  }
                />
              </g>
            );
          })}

          {/* Brush for panning */}
          {enableBrush && (
            <Brush
              dataKey={xAxisKey}
              height={30}
              stroke="#0A2647"
              fill="#0B0E14"
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Status Info */}
      {displayData.length < data.length && (
        <div className="text-xs text-center" style={{ color: '#7A8299' }}>
          Mostrando {displayData.length} de {data.length} pontos de dados
        </div>
      )}
    </div>
  );
}
