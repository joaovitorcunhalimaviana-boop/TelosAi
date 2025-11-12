'use client';

/**
 * FollowUpAnalysis Component
 * Visualiza análise de IA dos follow-ups de pacientes
 *
 * Features:
 * - Badge colorido por nível de risco
 * - Lista de red flags
 * - Recomendações clínicas
 * - Resposta empática ao paciente
 * - Ações rápidas (enviar WhatsApp, marcar como lido, etc)
 */

import { useState } from 'react';
import type { AnalysisResult } from '@/lib/follow-up-analyzer';
import { getStatusEmoji, getRiskLevelColor } from '@/lib/follow-up-analyzer';

// ============================================
// TYPES
// ============================================

interface FollowUpAnalysisProps {
  analysis: AnalysisResult;
  patientName: string;
  dayNumber: number;
  surgeryType: string;
  onSendWhatsApp?: () => void;
  onMarkAsRead?: () => void;
  onAlert?: () => void;
  showActions?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export default function FollowUpAnalysis({
  analysis,
  patientName,
  dayNumber,
  surgeryType,
  onSendWhatsApp,
  onMarkAsRead,
  onAlert,
  showActions = true,
}: FollowUpAnalysisProps) {
  const [expanded, setExpanded] = useState(true);

  // Cores baseadas no nível de risco
  const riskColors = {
    low: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-800',
      icon: 'text-green-600',
    },
    medium: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      badge: 'bg-amber-100 text-amber-800',
      icon: 'text-amber-600',
    },
    high: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-800',
      icon: 'text-red-600',
    },
    critical: {
      bg: 'bg-red-100',
      border: 'border-red-300',
      text: 'text-red-900',
      badge: 'bg-red-200 text-red-900',
      icon: 'text-red-700',
    },
  };

  const colors = riskColors[analysis.riskLevel];

  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-4 shadow-sm`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getStatusEmoji(analysis.status)}</span>
            <h3 className={`text-lg font-semibold ${colors.text}`}>
              {analysis.status}
            </h3>
            <span className={`ml-2 rounded-full px-3 py-1 text-xs font-medium ${colors.badge}`}>
              Risco: {getRiskLevelLabel(analysis.riskLevel)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {patientName} • {surgeryType} • D+{dayNumber}
          </p>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-4 text-gray-500 hover:text-gray-700"
          aria-label={expanded ? 'Recolher' : 'Expandir'}
        >
          <svg
            className={`h-5 w-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      {expanded && (
        <div className="space-y-4">
          {/* Red Flags */}
          {analysis.redFlags.length > 0 && (
            <div className="rounded-md bg-white p-3 shadow-sm">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <span className="text-red-500">🚩</span>
                Red Flags Detectados ({analysis.redFlags.length})
              </h4>
              <ul className="space-y-1">
                {analysis.redFlags.map((flag, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1 text-red-500">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Análise Clínica */}
          <div className="rounded-md bg-white p-3 shadow-sm">
            <h4 className="mb-2 text-sm font-semibold text-gray-900">📊 Análise Clínica</h4>
            <p className="text-sm leading-relaxed text-gray-700">{analysis.analise}</p>
            {analysis.raciocinioClinico && (
              <div className="mt-2 border-t pt-2">
                <p className="text-xs text-gray-600">
                  <strong>Raciocínio:</strong> {analysis.raciocinioClinico}
                </p>
              </div>
            )}
          </div>

          {/* Recomendações */}
          {analysis.recomendacoes.length > 0 && (
            <div className="rounded-md bg-white p-3 shadow-sm">
              <h4 className="mb-2 text-sm font-semibold text-gray-900">💡 Recomendações</h4>
              <ul className="space-y-2">
                {analysis.recomendacoes.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1 text-blue-500">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Resposta Empática */}
          <div className="rounded-md bg-white p-3 shadow-sm">
            <h4 className="mb-2 text-sm font-semibold text-gray-900">
              💬 Resposta ao Paciente
            </h4>
            <div className="rounded-md bg-gray-50 p-3 text-sm leading-relaxed text-gray-700">
              {analysis.respostaEmpática}
            </div>
          </div>

          {/* Alerta ao Médico */}
          {analysis.alertarMedico && (
            <div className="rounded-md border-2 border-red-300 bg-red-50 p-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-semibold text-red-900">Alerta ao Médico</p>
                  <p className="text-sm text-red-700">
                    Este caso requer atenção médica. Urgência: {analysis.urgencia}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex flex-wrap gap-2 border-t pt-3">
              {onSendWhatsApp && (
                <button
                  onClick={onSendWhatsApp}
                  className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Enviar WhatsApp
                </button>
              )}

              {onMarkAsRead && (
                <button
                  onClick={onMarkAsRead}
                  className="flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  ✓ Marcar como Lido
                </button>
              )}

              {onAlert && analysis.alertarMedico && (
                <button
                  onClick={onAlert}
                  className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  🚨 Alertar Médico
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getRiskLevelLabel(level: AnalysisResult['riskLevel']): string {
  const labels: Record<AnalysisResult['riskLevel'], string> = {
    low: 'Baixo',
    medium: 'Médio',
    high: 'Alto',
    critical: 'Crítico',
  };
  return labels[level];
}
