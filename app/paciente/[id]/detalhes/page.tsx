"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPatientSummary, getPatientConversationHistory } from "@/app/dashboard/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PostOpDayBadge } from "@/components/ui/badge-variants";
import { ArrowLeft, MessageCircle, History } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { parseQuestionnaireData } from "@/lib/questionnaire-parser";

// Interfaces para tipagem
interface ConversationMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string | null;
}

interface FollowUpResponse {
    id: string;
    questionnaireData: string;
    createdAt: Date;
    painAtRest?: number | null;
    painDuringBowel?: number | null;
    bleeding?: boolean | null;
    fever?: boolean | null;
}

interface FollowUp {
    id: string;
    dayNumber: number;
    responses: FollowUpResponse[];
}

interface PatientSummary {
    patient: {
        id: string;
        name: string;
    };
    patientId: string;
    type: string;
    date: Date;
    followUps: FollowUp[];
}

interface GraphData {
    day: string;
    repouso: number;
    evacuar: number | null;
    fullData: FollowUp;
}

export default function PatientDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [patientData, setPatientData] = useState<PatientSummary | null>(null);
    const [graphData, setGraphData] = useState<GraphData[]>([]);
    const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);
    const [fullConversation, setFullConversation] = useState<ConversationMessage[]>([]);
    const [showFullHistory, setShowFullHistory] = useState(true); // Por padrão mostra histórico completo

    useEffect(() => {
        async function loadData() {
            if (!params || !params.id) return;
            try {
                const data = await getPatientSummary(params.id as string);
                if (data) {
                    // Casting seguro pois sabemos a estrutura do retorno
                    const typedData = data as unknown as PatientSummary;
                    setPatientData(typedData);

                    // Processar dados para o gráfico usando parser centralizado
                    const chartData = typedData.followUps
                        .filter((f) => f.responses.length > 0)
                        .map((f) => {
                            const resp = f.responses[0];
                            const parsed = parseQuestionnaireData(resp.questionnaireData, {
                                painAtRest: resp.painAtRest,
                                painDuringBowel: resp.painDuringBowel,
                            });

                            return {
                                day: `D+${f.dayNumber}`,
                                repouso: parsed.painAtRest ?? 0,
                                evacuar: parsed.painDuringEvacuation,
                                fullData: f
                            };
                        });
                    setGraphData(chartData);

                    // Selecionar o último follow-up por padrão
                    if (typedData.followUps.length > 0) {
                        setSelectedFollowUp(typedData.followUps[typedData.followUps.length - 1]);
                    }

                    // Carregar histórico completo de conversas
                    const patientId = typedData.patientId || typedData.patient?.id;
                    if (patientId) {
                        const conversationHistory = await getPatientConversationHistory(patientId);
                        setFullConversation(conversationHistory as ConversationMessage[]);
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar paciente:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [params]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Carregando...</div>;
    }

    if (!patientData) {
        return <div className="p-8">Paciente não encontrado.</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-white to-[#F5F7FA] px-4 py-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mb-2 md:mb-4">
                    <Button variant="outline" onClick={() => router.back()} className="w-fit hover:scale-105 transition-transform" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold text-[#0A2647]">
                            {patientData.patient.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1 text-sm md:text-base">
                            <span className="text-gray-600">{patientData.type}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">
                                {new Date(patientData.date).toLocaleDateString("pt-BR", {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>
                            {patientData.followUps.length > 0 && (
                                <>
                                    <span className="text-gray-400 hidden sm:inline">•</span>
                                    <PostOpDayBadge day={patientData.followUps[patientData.followUps.length - 1]?.dayNumber || 0} />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Coluna Esquerda: Gráfico e Lista de Dias */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Gráfico de Evolução */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#0A2647]">
                                    Evolução da Dor
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[250px] md:h-[300px] pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={graphData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                        <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} />
                                        <YAxis domain={[0, 10]} tick={{ fill: '#64748B', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255,255,255,0.95)',
                                                borderRadius: '12px',
                                                border: '1px solid #E2E8F0',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="repouso" name="Dor em Repouso" stroke="#0A2647" strokeWidth={3} dot={{ fill: '#0A2647', strokeWidth: 2, r: 4 }} connectNulls={false} />
                                        <Line type="monotone" dataKey="evacuar" name="Dor ao Evacuar" stroke="#D4AF37" strokeWidth={3} dot={{ fill: '#D4AF37', strokeWidth: 2, r: 4 }} connectNulls={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Lista de Follow-ups */}
                        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
                            {patientData.followUps.map((f) => {
                                const hasResponse = f.responses.length > 0;
                                const isSelected = selectedFollowUp?.id === f.id;
                                return (
                                    <div
                                        key={f.id}
                                        onClick={() => hasResponse && setSelectedFollowUp(f)}
                                        className={`p-2 md:p-3 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all duration-200 text-center
                                ${isSelected
                                    ? 'border-[#0A2647] bg-gradient-to-br from-[#0A2647] to-[#144272] text-white shadow-lg'
                                    : hasResponse
                                        ? 'border-gray-200 bg-white hover:border-blue-400 hover:shadow-md'
                                        : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                }
                            `}
                                    >
                                        <div className={`text-sm md:text-base font-bold ${isSelected ? 'text-white' : 'text-[#0A2647]'}`}>
                                            D+{f.dayNumber}
                                        </div>
                                        <div className={`text-[9px] md:text-[10px] font-medium ${isSelected ? 'text-blue-200' : hasResponse ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            {hasResponse ? '✓' : '—'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Coluna Direita: Chat */}
                    <div className="lg:col-span-1">
                        <Card className="h-[400px] md:h-[600px] flex flex-col">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        {showFullHistory ? <History className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
                                        {showFullHistory ? 'Histórico Completo' : 'Chat com IA'}
                                        {!showFullHistory && selectedFollowUp && <Badge variant="outline">Dia {selectedFollowUp.dayNumber}</Badge>}
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowFullHistory(!showFullHistory)}
                                        className="text-xs"
                                    >
                                        {showFullHistory ? 'Ver por dia' : 'Ver tudo'}
                                    </Button>
                                </div>
                                {showFullHistory && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {fullConversation.length} mensagens no total
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                                {showFullHistory ? (
                                    // Mostrar histórico completo de todas as conversas
                                    fullConversation.length > 0 ? (
                                        fullConversation.map((msg, idx) => (
                                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] rounded-lg p-3 text-sm
                                                    ${msg.role === 'user'
                                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                                        : 'bg-gray-100 text-gray-800 rounded-tl-none border'
                                                    }`}>
                                                    {msg.content}
                                                    {msg.timestamp && (
                                                        <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                                                            {new Date(msg.timestamp).toLocaleString('pt-BR')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-gray-400 mt-10">
                                            Nenhuma conversa registrada ainda.
                                        </div>
                                    )
                                ) : (
                                    // Mostrar conversa do dia selecionado (comportamento antigo)
                                    selectedFollowUp && selectedFollowUp.responses[0] ? (
                                        (() => {
                                            const qData = JSON.parse(selectedFollowUp.responses[0].questionnaireData || '{}') as { conversation?: ConversationMessage[] };
                                            const conversation = qData.conversation || [];

                                            if (conversation.length === 0) {
                                                return <div className="text-center text-gray-400 mt-10">Nenhuma conversa registrada para este dia.</div>;
                                            }

                                            return conversation.map((msg, idx) => (
                                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] rounded-lg p-3 text-sm
                                                        ${msg.role === 'user'
                                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                                            : 'bg-gray-100 text-gray-800 rounded-tl-none border'
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            ));
                                        })()
                                    ) : (
                                        <div className="text-center text-gray-400 mt-10">
                                            Selecione um dia respondido para ver a conversa.
                                        </div>
                                    )
                                )}
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
