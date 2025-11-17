"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Brain, AlertTriangle, CheckCircle, Activity, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ComplicationRiskPredictorProps {
  patientData: {
    idade: number
    sexo: string
    comorbidades: string
    tipo_cirurgia: string
    duracao_minutos?: number
    bloqueio_pudendo?: number
    dor_d1: number
    retencao_urinaria?: number
    febre?: number
    sangramento_intenso?: number
  }
}

interface PredictionResult {
  probability: number
  prediction: number
  risk_level: "low" | "medium" | "high" | "critical"
  risk_label: string
  recommendation: string
  top_risk_factors: {
    name: string
    contribution: number
  }[]
}

export function ComplicationRiskPredictor({ patientData }: ComplicationRiskPredictorProps) {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handlePredict() {
    setIsLoading(true)
    setError("")
    setPrediction(null)

    try {
      const response = await fetch("/api/ml/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao fazer predição")
      }

      const data = await response.json()
      setPrediction(data)
    } catch (err: any) {
      setError(err.message || "Erro ao fazer predição")
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-600"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-5 w-5" />
      case "medium":
        return <Activity className="h-5 w-5" />
      case "low":
        return <CheckCircle className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Predição de Complicações (ML)</CardTitle>
            <CardDescription>
              Modelo de Machine Learning prevê risco de complicações pós-operatórias
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!prediction && !isLoading && (
          <Button onClick={handlePredict} className="w-full" disabled={isLoading}>
            <Brain className="mr-2 h-4 w-4" />
            Analisar Risco com IA
          </Button>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Analisando dados com IA...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {prediction && (
          <div className="space-y-4">
            {/* Probabilidade */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Probabilidade de Complicação</span>
                <span className="text-2xl font-bold">{(prediction.probability * 100).toFixed(1)}%</span>
              </div>
              <Progress value={prediction.probability * 100} className="h-3" />
            </div>

            {/* Nível de Risco */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
              <div className={`p-2 rounded-full ${getRiskColor(prediction.risk_level)} text-white`}>
                {getRiskIcon(prediction.risk_level)}
              </div>
              <div className="flex-1">
                <div className="font-semibold">Nível de Risco: {prediction.risk_label}</div>
                <div className="text-sm text-muted-foreground">{prediction.recommendation}</div>
              </div>
            </div>

            {/* Principais Fatores de Risco */}
            <div className="space-y-2">
              <div className="font-semibold text-sm">Principais Fatores Contribuintes:</div>
              {prediction.top_risk_factors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {index + 1}. {factor.name.replace(/_/g, " ")}
                  </span>
                  <Badge variant="outline">{(factor.contribution * 100).toFixed(1)}%</Badge>
                </div>
              ))}
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePredict}
                className="flex-1"
              >
                Recalcular
              </Button>
              <Button
                variant="default"
                onClick={() => window.print()}
                className="flex-1"
              >
                Imprimir Relatório
              </Button>
            </div>

            {/* Disclaimer */}
            <Alert>
              <AlertDescription className="text-xs">
                ⚠️ <strong>Importante:</strong> Esta predição é baseada em modelos estatísticos e deve ser
                usada como ferramenta auxiliar na tomada de decisão clínica. Sempre considere o julgamento
                clínico e as diretrizes médicas estabelecidas.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
