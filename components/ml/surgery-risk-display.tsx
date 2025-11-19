"use client"

/**
 * Componente de Visualização de Risco de Complicações
 *
 * Exibe a predição de risco do modelo de Machine Learning
 * com visualização intuitiva e informações sobre os fatores de risco.
 */

import React from 'react'
import {
  formatRiskPercentage,
  getRiskColor,
  getRiskLabel,
  getTopRiskFactors,
  type MLPredictionResult,
} from '@/lib/ml-prediction'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Info, TrendingUp, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// TIPOS
// ============================================

export interface SurgeryRiskDisplayProps {
  // Dados da predição
  risk: number // 0.0 a 1.0
  level: 'low' | 'medium' | 'high'
  features?: string | null // JSON string com features
  modelVersion?: string | null
  predictedAt?: Date | null

  // Configurações de exibição
  showDetails?: boolean // Mostrar detalhes completos
  showFactors?: boolean // Mostrar fatores de risco
  compact?: boolean // Versão compacta
  className?: string
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function SurgeryRiskDisplay({
  risk,
  level,
  features,
  modelVersion,
  predictedAt,
  showDetails = true,
  showFactors = true,
  compact = false,
  className,
}: SurgeryRiskDisplayProps) {
  // Parse features se existir
  const parsedFeatures = features ? JSON.parse(features) : null
  const topFactors = parsedFeatures ? getTopRiskFactors(parsedFeatures, 5) : []

  // Cores e estilos baseados no nível de risco
  const riskColor = getRiskColor(level)
  const riskLabel = getRiskLabel(level)
  const riskPercentage = formatRiskPercentage(risk)

  // Versão compacta (apenas badge)
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                'cursor-help',
                level === 'low' && 'border-green-500 bg-green-50 text-green-700',
                level === 'medium' && 'border-yellow-500 bg-yellow-50 text-yellow-700',
                level === 'high' && 'border-red-500 bg-red-50 text-red-700',
                className
              )}
            >
              <Brain className="mr-1 h-3 w-3" />
              {riskPercentage} de risco
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">{riskLabel}</p>
            <p className="text-xs text-muted-foreground">
              Predição por Machine Learning
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Versão completa
  return (
    <Card className={cn('border-l-4', className)} style={{ borderLeftColor: riskColor }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5" style={{ color: riskColor }} />
              Predição de Risco de Complicações
            </CardTitle>
            <CardDescription>
              Análise preditiva por Machine Learning
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'text-sm font-semibold',
              level === 'low' && 'border-green-500 bg-green-50 text-green-700',
              level === 'medium' && 'border-yellow-500 bg-yellow-50 text-yellow-700',
              level === 'high' && 'border-red-500 bg-red-50 text-red-700'
            )}
          >
            {riskLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Indicador visual de risco */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Probabilidade de Complicação
            </span>
            <span className="text-2xl font-bold" style={{ color: riskColor }}>
              {riskPercentage}
            </span>
          </div>

          {/* Barra de progresso */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${risk * 100}%`,
                backgroundColor: riskColor,
              }}
            />
          </div>

          {/* Escala de referência */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="text-green-600">30%</span>
            <span className="text-yellow-600">60%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Explicação do que significa */}
        <div className="rounded-md bg-blue-50 p-3">
          <div className="flex gap-2">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
            <div className="text-sm text-blue-900">
              <p className="font-medium">O que isso significa?</p>
              <p className="mt-1 text-blue-700">
                {level === 'low' && (
                  <>
                    Este paciente tem <strong>baixo risco</strong> de desenvolver
                    complicações pós-operatórias. Continue o acompanhamento padrão.
                  </>
                )}
                {level === 'medium' && (
                  <>
                    Este paciente apresenta <strong>risco moderado</strong> de
                    complicações. Considere monitoramento mais frequente e orientações
                    preventivas.
                  </>
                )}
                {level === 'high' && (
                  <>
                    <strong>Atenção:</strong> Este paciente tem <strong>alto risco</strong>{' '}
                    de complicações. Recomenda-se acompanhamento intensivo e medidas
                    preventivas adicionais.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Principais fatores de risco */}
        {showFactors && topFactors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Principais Fatores de Risco</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Estes fatores tiveram maior influência na predição do risco. A
                      importância é calculada pelo modelo de Machine Learning.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-1.5">
              {topFactors.map((factor, index) => (
                <div
                  key={factor.name}
                  className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-700">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium capitalize">
                      {factor.name.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {String(factor.value)}
                    </span>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${factor.importance * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações técnicas (metadata) */}
        {showDetails && (modelVersion || predictedAt) && (
          <div className="border-t pt-3 text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {modelVersion && (
                <span>
                  <strong>Modelo:</strong> v{modelVersion}
                </span>
              )}
              {predictedAt && (
                <span>
                  <strong>Calculado em:</strong>{' '}
                  {new Date(predictedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// COMPONENTE DE ALERTA (quando não há predição)
// ============================================

export function SurgeryRiskNotAvailable({ className }: { className?: string }) {
  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex items-center gap-3 py-4">
        <AlertCircle className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">Predição de risco não disponível</p>
          <p className="text-xs text-muted-foreground">
            Complete mais informações do paciente para gerar uma predição de risco.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
