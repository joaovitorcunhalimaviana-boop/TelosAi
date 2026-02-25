'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChartControls, ChartSettings, getColorPalette } from './ChartControls';
import { ChartExportMenu } from './ChartExportMenu';
import { Info } from 'lucide-react';

interface BoxPlotData {
  name: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  outliers?: number[];
  rawData?: number[];
  n: number;
}

interface InteractiveBoxPlotProps {
  data: BoxPlotData[];
  title?: string;
  yAxisLabel?: string;
  showOutliers?: boolean;
  showJitteredPoints?: boolean;
  height?: number;
}

export function InteractiveBoxPlot({
  data,
  title,
  yAxisLabel,
  showOutliers: defaultShowOutliers = true,
  showJitteredPoints: defaultShowJitteredPoints = false,
  height = 400,
}: InteractiveBoxPlotProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<ChartSettings>({
    showConfidenceIntervals: false,
    showGridLines: true,
    showDataLabels: true,
    showLegend: false,
    colorScheme: 'vigia',
    axisScaleX: 'linear',
    axisScaleY: 'linear',
    opacity: 100,
    fontSize: 12,
  });

  const [showOutliers, setShowOutliers] = useState(defaultShowOutliers);
  const [showJitteredPoints, setShowJitteredPoints] = useState(defaultShowJitteredPoints);
  const [selectedBox, setSelectedBox] = useState<BoxPlotData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [hoveredBox, setHoveredBox] = useState<string | null>(null);

  const colors = getColorPalette(settings.colorScheme);

  // Calculate scale
  const allValues = data.flatMap((d) => [
    d.min,
    d.q1,
    d.median,
    d.q3,
    d.max,
    ...(showOutliers && d.outliers ? d.outliers : []),
  ]);
  const minY = Math.min(...allValues);
  const maxY = Math.max(...allValues);
  const rangeY = maxY - minY;
  const paddingY = rangeY * 0.1;

  const scaleY = (value: number) => {
    return ((maxY + paddingY - value) / (rangeY + paddingY * 2)) * 100;
  };

  const handleBoxClick = (box: BoxPlotData) => {
    setSelectedBox(box);
    setIsDetailOpen(true);
  };

  // Jitter calculation for overlapping points
  const getJitteredX = (index: number, total: number, boxWidth: number = 60) => {
    const jitterRange = boxWidth * 0.4;
    const spacing = total > 1 ? jitterRange / (total - 1) : 0;
    return -jitterRange / 2 + spacing * index;
  };

  return (
    <div ref={chartRef} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle controls */}
          <div className="flex items-center gap-4 px-3 py-2 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <Switch
                id="outliers"
                checked={showOutliers}
                onCheckedChange={setShowOutliers}
              />
              <Label htmlFor="outliers" className="text-xs cursor-pointer">
                Outliers
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="jittered"
                checked={showJitteredPoints}
                onCheckedChange={setShowJitteredPoints}
              />
              <Label htmlFor="jittered" className="text-xs cursor-pointer">
                Pontos
              </Label>
            </div>
          </div>

          <ChartControls
            settings={settings}
            onSettingsChange={setSettings}
            showScaleControls={false}
            showColorControls={true}
          />

          <ChartExportMenu
            chartRef={chartRef}
            chartName={title?.toLowerCase().replace(/\s+/g, '-') || 'box-plot'}
          />
        </div>
      </div>

      {/* Chart */}
      <div
        className="relative bg-white border rounded-lg p-6"
        style={{ height: `${height}px` }}
      >
        {/* Y-axis */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-6 pr-12 text-xs text-gray-600">
          {Array.from({ length: 6 }, (_, i) => {
            const value = maxY + paddingY - (i * (rangeY + paddingY * 2)) / 5;
            return (
              <div key={i} className="text-right">
                {value.toFixed(1)}
              </div>
            );
          })}
        </div>

        {/* Y-axis label */}
        {yAxisLabel && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-semibold text-gray-700 whitespace-nowrap">
            {yAxisLabel}
          </div>
        )}

        {/* Grid lines */}
        {settings.showGridLines && (
          <div className="absolute left-12 right-0 top-0 h-full py-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="absolute w-full border-t border-gray-200"
                style={{ top: `${(i * 100) / 5}%` }}
              />
            ))}
          </div>
        )}

        {/* Box plots */}
        <div className="absolute left-12 right-0 top-0 h-full py-6 flex items-stretch justify-around">
          {data.map((box, index) => {
            const color = colors[index % colors.length];
            const isHovered = hoveredBox === box.name;
            const boxWidth = Math.min(80, (100 / data.length) * 0.6);

            return (
              <div
                key={box.name}
                className="relative flex-1 flex flex-col items-center cursor-pointer"
                onMouseEnter={() => setHoveredBox(box.name)}
                onMouseLeave={() => setHoveredBox(null)}
                onClick={() => handleBoxClick(box)}
              >
                {/* Whisker top */}
                <div
                  className="absolute w-0.5 bg-gray-700"
                  style={{
                    top: `${scaleY(box.max)}%`,
                    height: `${scaleY(box.q3) - scaleY(box.max)}%`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                />
                <div
                  className="absolute h-0.5 bg-gray-700"
                  style={{
                    top: `${scaleY(box.max)}%`,
                    width: `${boxWidth / 3}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                />

                {/* Box */}
                <div
                  className={`absolute border-2 rounded transition-all ${
                    isHovered ? 'shadow-lg scale-105' : ''
                  }`}
                  style={{
                    top: `${scaleY(box.q3)}%`,
                    height: `${scaleY(box.q1) - scaleY(box.q3)}%`,
                    width: `${boxWidth}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderColor: color,
                    backgroundColor: `${color}40`,
                    opacity: settings.opacity / 100,
                  }}
                >
                  {/* Median line */}
                  <div
                    className="absolute w-full h-0.5"
                    style={{
                      backgroundColor: color,
                      top: `${((box.median - box.q1) / (box.q3 - box.q1)) * 100}%`,
                    }}
                  />

                  {/* Mean marker */}
                  <div
                    className="absolute w-2 h-2 rounded-full border-2"
                    style={{
                      backgroundColor: 'white',
                      borderColor: color,
                      left: '50%',
                      top: `${((box.mean - box.q1) / (box.q3 - box.q1)) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>

                {/* Whisker bottom */}
                <div
                  className="absolute w-0.5 bg-gray-700"
                  style={{
                    top: `${scaleY(box.q1)}%`,
                    height: `${scaleY(box.min) - scaleY(box.q1)}%`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                />
                <div
                  className="absolute h-0.5 bg-gray-700"
                  style={{
                    top: `${scaleY(box.min)}%`,
                    width: `${boxWidth / 3}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                />

                {/* Outliers */}
                {showOutliers &&
                  box.outliers &&
                  box.outliers.map((outlier, oIndex) => (
                    <div
                      key={oIndex}
                      className="absolute w-2 h-2 rounded-full border-2 hover:scale-150 transition-transform"
                      style={{
                        backgroundColor: '#ef4444',
                        borderColor: '#991b1b',
                        left: '50%',
                        top: `${scaleY(outlier)}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ))}

                {/* Jittered points */}
                {showJitteredPoints &&
                  box.rawData &&
                  box.rawData.map((value, pIndex) => {
                    const jitterX = getJitteredX(pIndex, box.rawData!.length, boxWidth);
                    return (
                      <div
                        key={pIndex}
                        className="absolute w-1.5 h-1.5 rounded-full opacity-60 hover:opacity-100 transition-opacity"
                        style={{
                          backgroundColor: color,
                          left: `calc(50% + ${jitterX}px)`,
                          top: `${scaleY(value)}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    );
                  })}

                {/* Value labels */}
                {settings.showDataLabels && isHovered && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    <div>Max: {box.max.toFixed(1)}</div>
                    <div>Q3: {box.q3.toFixed(1)}</div>
                    <div>Med: {box.median.toFixed(1)}</div>
                    <div>Q1: {box.q1.toFixed(1)}</div>
                    <div>Min: {box.min.toFixed(1)}</div>
                  </div>
                )}

                {/* Group name */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
                  <div className="text-sm font-medium whitespace-nowrap">{box.name}</div>
                  <div className="text-xs text-gray-500">n={box.n}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-gray-700" />
          <span>Min/Max</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-6 border-2 border-blue-500 bg-blue-100" />
          <span>IQR (Q1-Q3)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-blue-700" />
          <span>Mediana</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full border-2 border-blue-500 bg-white" />
          <span>Média</span>
        </div>
        {showOutliers && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Outliers</span>
          </div>
        )}
      </div>

      {/* Hint */}
      <div className="text-xs text-center text-gray-500">
        Clique nas caixas para ver estatísticas detalhadas
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Estatísticas Detalhadas: {selectedBox?.name}
            </DialogTitle>
            <DialogDescription>
              Análise descritiva completa do grupo (n={selectedBox?.n})
            </DialogDescription>
          </DialogHeader>

          {selectedBox && (
            <div className="space-y-4">
              {/* Five-number summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 border rounded-lg bg-red-50">
                  <div className="text-xs text-gray-600 mb-1">Mínimo</div>
                  <div className="text-xl font-bold text-red-900">
                    {selectedBox.min.toFixed(2)}
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Q1 (25%)</div>
                  <div className="text-xl font-bold">{selectedBox.q1.toFixed(2)}</div>
                </div>

                <div className="p-3 border rounded-lg bg-blue-50">
                  <div className="text-xs text-gray-600 mb-1">Mediana</div>
                  <div className="text-xl font-bold text-blue-900">
                    {selectedBox.median.toFixed(2)}
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Q3 (75%)</div>
                  <div className="text-xl font-bold">{selectedBox.q3.toFixed(2)}</div>
                </div>

                <div className="p-3 border rounded-lg bg-red-50">
                  <div className="text-xs text-gray-600 mb-1">Máximo</div>
                  <div className="text-xl font-bold text-red-900">
                    {selectedBox.max.toFixed(2)}
                  </div>
                </div>

                <div className="p-3 border rounded-lg bg-green-50">
                  <div className="text-xs text-gray-600 mb-1">Média</div>
                  <div className="text-xl font-bold text-green-900">
                    {selectedBox.mean.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Additional statistics */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Amplitude Interquartil (IQR):</span>
                  <span className="font-semibold">
                    {(selectedBox.q3 - selectedBox.q1).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Amplitude Total:</span>
                  <span className="font-semibold">
                    {(selectedBox.max - selectedBox.min).toFixed(2)}
                  </span>
                </div>

                {selectedBox.outliers && selectedBox.outliers.length > 0 && (
                  <div className="p-2 bg-orange-50 rounded border border-orange-200">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Outliers detectados:</span>
                      <Badge variant="destructive">{selectedBox.outliers.length}</Badge>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      Valores: {selectedBox.outliers.map((o) => o.toFixed(2)).join(', ')}
                    </div>
                  </div>
                )}
              </div>

              {/* Raw data distribution */}
              {selectedBox.rawData && selectedBox.rawData.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3">
                    Distribuição dos Dados (n={selectedBox.rawData.length})
                  </h4>
                  <div className="flex items-end gap-0.5 h-24">
                    {selectedBox.rawData
                      .sort((a, b) => a - b)
                      .map((value, index) => {
                        const height = ((value - selectedBox.min) / (selectedBox.max - selectedBox.min)) * 100;
                        return (
                          <div
                            key={index}
                            className="flex-1 bg-blue-400 rounded-t hover:bg-blue-600 transition-colors relative group"
                            style={{ height: `${height}%`, minHeight: '2px' }}
                          >
                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              {value.toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
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
