"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPatientSummary, getPatientConversationHistory } from "@/app/dashboard/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, History } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Interfaces para tipagem
interface ConversationMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string | null;
}

interface QuestionnaireData {
    pain?: string | number;
    painAtRest?: string | number;
    dor?: string | number;
    nivel_dor?: string | number;
    painDuringBowel?: string | number;
    painDuringBowelMovement?: string | number;
    painDuringEvacuation?: string | number;
    evacuationPain?: string | number;
    dor_evacuar?: string | number;
    evacuated?: boolean;
    bowelMovement?: boolean;
    fever?: boolean;
    temperature?: number | string;
    bleeding?: string | boolean;
    medications?: boolean;
    urinated?: boolean;
    conversation?: ConversationMessage[];
}

interface FollowUpResponse {
    id: string;
    questionnaireData: string;
    createdAt: Date;
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
    evacuar: number;
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

                    // Processar dados para o gráfico
                    const chartData = typedData.followUps
                        .filter((f) => f.responses.length > 0)
                        .map((f) => {
                            const resp = f.responses[0];
                            const qData = JSON.parse(resp.questionnaireData || '{}') as QuestionnaireData;
                            return {
                                day: `D+${f.dayNumber}`,
                                // Compatibilidade: IA salva como 'pain', interface usa vários nomes
                                repouso: Number(qData.painAtRest || qData.pain || qData.dor || qData.nivel_dor || 0),
                                // Compatibilidade: IA salva como 'painDuringBowel'
                                evacuar: Number(qData.painDuringBowel || qData.painDuringBowelMovement || qData.painDuringEvacuation || qData.evacuationPain || qData.dor_evacuar || 0),
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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-blue-900">{patientData.patient.name}</h1>
                        <p className="text-gray-500">{patientData.type} - {new Date(patientData.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Coluna Esquerda: Gráfico e Lista de Dias */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Gráfico de Evolução */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Evolução da Dor</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={graphData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis domain={[0, 10]} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="repouso" name="Dor em Repouso" stroke="#0A2647" strokeWidth={2} />
                                        <Line type="monotone" dataKey="evacuar" name="Dor ao Evacuar" stroke="#D4AF37" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Lista de Follow-ups */}
                        <div className="grid grid-cols-4 gap-2">
                            {patientData.followUps.map((f) => {
                                const hasResponse = f.responses.length > 0;
                                return (
                                    <div
                                        key={f.id}
                                        onClick={() => hasResponse && setSelectedFollowUp(f)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all text-center
                                ${selectedFollowUp?.id === f.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 bg-white hover:border-blue-300'}
                                ${!hasResponse ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                                    >
                                        <div className="text-sm font-bold text-gray-700">D+{f.dayNumber}</div>
                                        <div className="text-xs text-gray-500">
                                            {hasResponse ? 'Respondido' : 'Pendente'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Coluna Direita: Chat */}
                    <div className="lg:col-span-1">
                        <Card className="h-[600px] flex flex-col">
                            <CardHeader className="border-b bg-gray-50">
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
                                            const qData = JSON.parse(selectedFollowUp.responses[0].questionnaireData || '{}') as QuestionnaireData;
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
