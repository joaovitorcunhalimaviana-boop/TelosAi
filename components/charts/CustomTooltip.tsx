'use client';

import { Badge } from '@/components/ui/badge';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TooltipData {
  name: string;
  value: number;
  unit?: string;
  color?: string;
  ci?: { lower: number; upper: number };
  pValue?: number;
  n?: number;
  additionalInfo?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
    color?: string;
    payload?: any;
  }>;
  label?: string;
  type?: 'default' | 'km-curve' | 'comparison' | 'regression';
  formatter?: (value: number) => string;
}

export function CustomTooltip({ active, payload, label, type = 'default', formatter }: CustomTooltipProps) {
  // Debounce tooltip display for better performance
  const [shouldShow, setShouldShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (active && payload && payload.length > 0) {
      // Show immediately on hover
      setShouldShow(true);
    } else {
      // Debounce hide to prevent flickering
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setShouldShow(false);
      }, 50);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [active, payload]);

  const formatValue = (value: number): string => {
    if (formatter) return formatter(value);
    return typeof value === 'number' ? value.toFixed(2) : String(value);
  };

  const getSignificanceStars = (p: number): string => {
    if (p < 0.001) return '***';
    if (p < 0.01) return '**';
    if (p < 0.05) return '*';
    return 'ns';
  };

  if (!shouldShow) {
    return null;
  }

  const tooltipVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.15 }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  // Kaplan-Meier curve tooltip
  if (type === 'km-curve') {
    const data = payload?.[0]?.payload;
    return (
      <AnimatePresence mode="wait">
        <motion.div
          variants={tooltipVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-lg shadow-lg p-4 min-w-[280px] touch-none"
        >
        <div className="font-semibold text-sm mb-3" style={{ color: '#0A2647' }}>
          {label || `Tempo: ${data?.time || 0} dias`}
        </div>

        {payload?.map((entry, index) => (
          <div key={index} className="mb-3 pb-3 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium">{entry.name}</span>
            </div>

            <div className="ml-5 space-y-1 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Sobrevida:</span>
                <span className="font-semibold">{(entry.value * 100).toFixed(1)}%</span>
              </div>

              {entry.payload?.ciLower !== undefined && entry.payload?.ciUpper !== undefined && (
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">IC 95%:</span>
                  <span className="text-gray-700">
                    [{(entry.payload.ciLower * 100).toFixed(1)}%, {(entry.payload.ciUpper * 100).toFixed(1)}%]
                  </span>
                </div>
              )}

              {entry.payload?.atRisk !== undefined && (
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">N em risco:</span>
                  <span className="font-medium text-blue-600">{entry.payload.atRisk}</span>
                </div>
              )}

              {entry.payload?.events !== undefined && entry.payload.events > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Eventos:</span>
                  <span className="font-medium text-red-600">{entry.payload.events}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Group comparison tooltip
  if (type === 'comparison') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          variants={tooltipVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-lg shadow-lg p-4 min-w-[260px] touch-none"
        >
        <div className="font-semibold text-sm mb-3" style={{ color: '#0A2647' }}>
          {label}
        </div>

        {payload?.map((entry, index) => {
          const data = entry.payload;
          return (
            <div key={index} className="mb-3 pb-3 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium">{entry.name}</span>
                </div>
                <span className="text-lg font-bold" style={{ color: entry.color }}>
                  {formatValue(entry.value)}
                </span>
              </div>

              {data?.sd !== undefined && (
                <div className="ml-5 text-xs text-gray-600">
                  ± {formatValue(data.sd)} (DP)
                </div>
              )}

              {data?.ci && (
                <div className="ml-5 text-xs text-gray-600">
                  IC 95%: [{formatValue(data.ci.lower)}, {formatValue(data.ci.upper)}]
                </div>
              )}

              {data?.n !== undefined && (
                <div className="ml-5 text-xs text-gray-500">
                  n = {data.n}
                </div>
              )}

              {data?.pValue !== undefined && (
                <div className="ml-5 mt-1">
                  <Badge
                    variant={data.pValue < 0.05 ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    p = {data.pValue < 0.001 ? '<0.001' : data.pValue.toFixed(3)} {getSignificanceStars(data.pValue)}
                  </Badge>
                </div>
              )}
            </div>
          );
        })}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Regression scatter plot tooltip
  if (type === 'regression') {
    const data = payload?.[0]?.payload;
    return (
      <AnimatePresence mode="wait">
        <motion.div
          variants={tooltipVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-lg shadow-lg p-4 min-w-[240px] touch-none"
        >
        <div className="space-y-2">
          {data?.patientId && (
            <div className="font-semibold text-sm pb-2 border-b" style={{ color: '#0A2647' }}>
              Paciente: {data.patientId}
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Idade:</span>
            <span className="font-semibold">{data?.age || label} anos</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Dor observada:</span>
            <span className="font-bold text-red-600">{formatValue(payload?.[0]?.value ?? 0)}/10</span>
          </div>

          {data?.predicted !== undefined && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dor predita:</span>
                <span className="font-bold text-blue-600">{formatValue(data.predicted)}/10</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Resíduo:</span>
                <span className={`font-medium ${Math.abs((payload?.[0]?.value ?? 0) - data.predicted) > 2 ? 'text-orange-600' : 'text-gray-700'}`}>
                  {formatValue((payload?.[0]?.value ?? 0) - data.predicted)}
                </span>
              </div>
            </>
          )}

          {data?.group && (
            <div className="mt-2 pt-2 border-t">
              <Badge variant="secondary" className="text-xs">
                {data.group}
              </Badge>
            </div>
          )}

          {data?.outlier && (
            <div className="mt-2 pt-2 border-t">
              <Badge variant="destructive" className="text-xs">
                Outlier (Cook's D: {formatValue(data.cooksDistance)})
              </Badge>
            </div>
          )}
        </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Default tooltip
  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={tooltipVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px] touch-none"
      >
      {label && (
        <div className="font-semibold text-sm mb-2 pb-2 border-b" style={{ color: '#0A2647' }}>
          {label}
        </div>
      )}

      {payload?.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4 py-1">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">{entry.name}:</span>
          </div>
          <span className="text-sm font-semibold" style={{ color: entry.color }}>
            {formatValue(entry.value)}
          </span>
        </div>
      ))}
      </motion.div>
    </AnimatePresence>
  );
}
