import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

// Schema for structured output validation
const geminiResponseSchema = z.object({
    reasoning: z.string(),
    message: z.string(),
    needsImage: z.enum(['pain_scale', 'bristol_scale']).nullable(),
    dataCollected: z.object({
        painAtRest: z.number().nullable().optional(),
        painDuringBowelMovement: z.number().nullable().optional(),
        bleeding: z.boolean().nullable().optional(),
        hasFever: z.boolean().nullable().optional(),
        worry: z.string().nullable().optional(),
        otherSymptoms: z.array(z.string()).optional()
    }),
    completed: z.boolean(),
    needsClarification: z.boolean()
});

export type GeminiResponse = z.infer<typeof geminiResponseSchema>;

/**
 * Analyzes patient message using Google Gemini Pro
 */
export async function analyzePatientMessageWithGemini(
    conversationHistory: any[],
    userMessage: string,
    patientContext: {
        name: string;
        surgeryType: string;
        dayNumber: number;
        doctorName?: string;
    },
    checklist: {
        required: string[];
        missing: string[];
        collected: any;
    },
    protocols: string = ''
): Promise<GeminiResponse> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

        const systemPrompt = `Você é a Clara, a assistente de IA da clínica do ${patientContext.doctorName || 'Dr. João'} (Telos.AI).
Sua missão é acompanhar a recuperação de pacientes pós-cirúrgicos com INTELIGÊNCIA HUMANIZADA e EMPATIA.

CONTEXTO DO PACIENTE:
- Nome: ${patientContext.name}
- Cirurgia: ${patientContext.surgeryType}
- Dia Pós-Op: D+${patientContext.dayNumber}

SEU CHECKLIST MÉDICO (Objetivos):
Itens Necessários: ${JSON.stringify(checklist.required)}
O Que Falta Descobrir: ${JSON.stringify(checklist.missing)}
Dados Já Coletados: ${JSON.stringify(checklist.collected)}

PROTOCOLOS MÉDICOS RELEVANTES:
${protocols}

DIRETRIZES DE PERSONALIDADE E FLUXO:
1. **EMPATIA PRIMEIRO**: Se o paciente expressar dor ou desconforto, ACOLHA antes de perguntar qualquer coisa.
2. **ZERO ROBÔ**: Fale como uma enfermeira cuidadosa. Use "nós", "vamos cuidar", etc.
3. **UMA COISA DE CADA VEZ**: Não faça várias perguntas na mesma mensagem.
4. **MEMÓRIA**: Use o histórico. Se ele já falou que não tem febre, não pergunte de novo.
5. **DOR (0-10)**: Sempre que pedir nota de dor, explique a escala (0=sem dor, 10=pior dor).
6. **FINALIZAÇÃO**: Só marque "completed": true quando TODOS os itens do checklist estiverem preenchidos E o paciente não tiver mais dúvidas.

FORMATO DE RESPOSTA (JSON ONLY):
Você deve responder EXCLUSIVAMENTE um objeto JSON com a seguinte estrutura:
{
  "reasoning": "Seu pensamento interno sobre o estado atual e decisão do próximo passo.",
  "message": "Sua resposta textual para o paciente.",
  "needsImage": "pain_scale" | "bristol_scale" | null, (Use null se não precisar enviar imagem AGORA)
  "dataCollected": {
    "painAtRest": number (0-10),
    "painDuringBowelMovement": number (0-10),
    "hasFever": boolean,
    "bleeding": boolean
  },
  "completed": boolean, (true se coletou tudo E tirou dúvidas)
  "needsClarification": boolean (true se a resposta do usuário foi confusa)
}
`;

        // Sliding Window: Keep only the last 20 messages to manage context window
        const recentHistory = conversationHistory.slice(-20);

        // Convert conversation history to Gemini format
        const history = recentHistory.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // Add current user message
        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
                responseMimeType: "application/json",
            },
        });

        const fullPrompt = `${systemPrompt}\n\nMENSAGEM DO PACIENTE: "${userMessage}"`;

        // For single-turn or last-turn context injection, we send the prompt as the message
        // In a real chat loop, system prompt is usually set on initialization, but here we inject context dynamically per turn.
        // The history is used for continuity.
        // NOTE: Gemini API handles system instructions differently in newer versions, but prepending context works reliably.

        const result = await chat.sendMessage(fullPrompt);
        const responseText = result.response.text();

        logger.debug('Gemini Raw Response:', responseText);

        try {
            const parsed = JSON.parse(responseText);
            const validated = geminiResponseSchema.parse(parsed);
            return validated;
        } catch (parseError) {
            logger.error('Error parsing Gemini response:', parseError);
            // Fallback for malformed JSON
            return {
                reasoning: "Error parsing JSON",
                message: "Desculpe, tive um pequeno erro técnico. Pode repetir, por favor?",
                needsImage: null,
                dataCollected: {},
                completed: false,
                needsClarification: true
            };
        }

    } catch (error) {
        logger.error('Gemini API Error:', error);
        throw error;
    }
}
