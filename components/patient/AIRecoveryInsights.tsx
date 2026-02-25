"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, AlertTriangle, ArrowRight, BrainCircuit } from "lucide-react"
import { getPatientSummary } from "@/app/dashboard/actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface AIRecoveryInsightsProps {
    surgeryId: string
}

export function AIRecoveryInsights({ surgeryId }: AIRecoveryInsightsProps) {
    const [analysis, setAnalysis] = useState<string | null>(null)
    const [riskLevel, setRiskLevel] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadAnalysis() {
            if (!surgeryId) return
            setLoading(true)
            try {
                const surgery = await getPatientSummary(surgeryId)
                // Find latest response with analysis
                const latestResponse = surgery?.followUps
                    .flatMap(f => f.responses)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .find(r => r.aiAnalysis) // Get first one with analysis

                if (latestResponse) {
                    setAnalysis(latestResponse.aiAnalysis)
                    setRiskLevel(latestResponse.riskLevel)
                }
            } catch (error) {
                console.error("Failed to load AI analysis", error)
            } finally {
                setLoading(false)
            }
        }

        loadAnalysis()
    }, [surgeryId])

    if (loading) {
        return <Skeleton className="w-full h-40" />
    }

    if (!analysis) {
        return null
    }

    return (
        <Card className="shadow-sm relative overflow-hidden" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <BrainCircuit className="h-24 w-24" style={{ color: '#14BDAE' }} />
            </div>

            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" style={{ backgroundColor: '#1E2535', color: '#14BDAE', borderColor: '#0D7377' }}>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Análise Claude AI
                    </Badge>
                    {riskLevel === 'high' || riskLevel === 'critical' ? (
                        <Badge variant="destructive" className="animate-pulse">
                            Risco Elevado
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                            Recuperação Estável
                        </Badge>
                    )}
                </div>
                <CardTitle className="text-lg mt-2" style={{ color: '#F0EAD6' }}>
                    Insights de Recuperação
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="relative z-10">
                    <p className="leading-relaxed text-sm lg:text-base" style={{ color: '#D8DEEB' }}>
                        {analysis}
                    </p>

                    <div className="mt-4 flex items-center text-xs font-medium" style={{ color: '#0D7377' }}>
                        <BrainCircuit className="h-3 w-3 mr-1" />
                        Análise baseada nos relatos do paciente via WhatsApp
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
