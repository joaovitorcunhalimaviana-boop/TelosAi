import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
// import { logger } from '@/lib/logger';
import { z } from 'zod';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

// Schema for structured output validation
export const geminiResponseSchema = z.object({
    reasoning: z.string(),
    message: z.string(),
    needsImage: z.enum(['pain_scale', 'bristol_scale']).nullable(),
    dataCollected: z.object({
        painAtRest: z.union([z.number(), z.string(), z.null()]).optional(),
        painDuringBowelMovement: z.union([z.number(), z.string(), z.null()]).optional(),
        hadBowelMovementSinceLastContact: z.union([z.boolean(), z.null()]).optional(),
        bleeding: z.union([z.boolean(), z.string(), z.null()]).optional(),
        hasFever: z.union([z.boolean(), z.string(), z.null()]).optional(),
        takingPrescribedMeds: z.union([z.boolean(), z.null()]).optional(),
        urinated: z.union([z.boolean(), z.null()]).optional(),
        usedExtraMedication: z.union([z.boolean(), z.null()]).optional(),
        worry: z.string().nullable().optional(),
        otherSymptoms: z.array(z.string()).optional()
    }),
    completed: z.boolean(),
    needsClarification: z.boolean()
});

export type GeminiResponse = z.infer<typeof geminiResponseSchema>;

/**
 * Creates a fallback response in case of API errors or critical issues.
 */
function createFallbackResponse(errorMessage: string): GeminiResponse {
    console.error(`Creating fallback response: ${errorMessage}`);
    return {
        reasoning: `Fallback: ${errorMessage}`,
        message: "Desculpe, tive um problema técnico. Por favor, tente novamente mais tarde.",
        needsImage: null,
        dataCollected: {},
        completed: false,
        needsClarification: true
    };
}

/**
 * Análise de mensagem mais robusta que nunca falha (retorna fallback se API cair)
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
    // 1. Verificação de Chave de API
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.error('CRITICAL: GOOGLE_GENERATIVE_AI_API_KEY is missing');
        return createFallbackResponse("Erro de configuração interna (API Key).");
    }

    try {
        // 2. Modelo Estável (Pro)
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-pro',
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
        });

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
6. **RESPOSTAS QUALITATIVAS**: Se o paciente disser "dor média", "muita dor", "um pouco", PEÇA UM NÚMERO. Não tente adivinhar. Explique: "Entendo. Para eu registrar certinho, de 0 a 10, quanto seria essa dor?"
7. **DUAS DORES SEPARADAS**: Dor em REPOUSO e dor ao EVACUAR são coisas DIFERENTES. SEMPRE pergunte as duas separadamente. Se o paciente disser "dor 5 ao evacuar", registre painDuringBowelMovement=5 e AINDA PERGUNTE a dor em repouso separadamente.
8. **NUNCA PULE PERGUNTAS**: Você DEVE percorrer TODOS os itens da lista "O Que Falta Descobrir". Se faltam 5 itens, faça 5 perguntas (uma de cada vez). NUNCA marque completed=true enquanto houver itens em "O Que Falta Descobrir".

⚠️ REGRA CRÍTICA DE FINALIZAÇÃO:
- Olhe o campo "O Que Falta Descobrir" acima.
- Se essa lista tiver QUALQUER item, completed DEVE ser false.
- Só marque completed=true quando "O Que Falta Descobrir" estiver VAZIO (todos os itens coletados).
- Se você marcar completed=true com itens faltando, o sistema vai REJEITAR e continuar perguntando.

FORMATO DE RESPOSTA (JSON ONLY):
Você deve responder EXCLUSIVAMENTE um objeto JSON com a seguinte estrutura:
{
  "reasoning": "Seu pensamento interno: liste quais itens já foram coletados e quais FALTAM.",
  "message": "Sua resposta textual para o paciente.",
  "needsImage": "pain_scale" | "bristol_scale" | null,
  "dataCollected": {
    "painAtRest": number (0-10) ou null (NÃO COLOCAR STRING),
    "painDuringBowelMovement": number (0-10) ou null,
    "hadBowelMovementSinceLastContact": boolean ou null,
    "hasFever": boolean ou null,
    "bleeding": boolean ou null,
    "takingPrescribedMeds": boolean ou null,
    "urinated": boolean ou null,
    "usedExtraMedication": boolean ou null
  },
  "completed": boolean, (SOMENTE true quando TODOS os itens do checklist estiverem preenchidos)
  "needsClarification": boolean (true se a resposta do usuário foi confusa ou qualitativa demais)
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

        const result = await chat.sendMessage(fullPrompt);
        let responseText = '';
        try {
            responseText = result.response.text();
        } catch (textError) {
            console.warn('Gemini response blocked or empty:', textError);
            return {
                reasoning: "Safety block triggered",
                message: "Entendo. Por favor, poderia reformular sua resposta?",
                needsImage: null,
                dataCollected: {},
                completed: false,
                needsClarification: true
            };
        }

        console.log('Gemini Raw Response:', responseText);

        try {
            const parsed = JSON.parse(responseText);
            const validated = geminiResponseSchema.parse(parsed);

            // Sanitização Completa de Dados
            if (validated.dataCollected) {
                // Pain At Rest (Number)
                if (typeof validated.dataCollected.painAtRest === 'string') {
                    const num = parseInt(validated.dataCollected.painAtRest);
                    validated.dataCollected.painAtRest = !isNaN(num) ? num : null;
                    if (isNaN(num)) validated.needsClarification = true;
                }

                // Pain During Bowel (Number)
                if (typeof validated.dataCollected.painDuringBowelMovement === 'string') {
                    const num = parseInt(validated.dataCollected.painDuringBowelMovement);
                    validated.dataCollected.painDuringBowelMovement = !isNaN(num) ? num : null;
                    if (isNaN(num)) validated.needsClarification = true;
                }

                // Fever (Boolean)
                if (typeof validated.dataCollected.hasFever === 'string') {
                    const val = (validated.dataCollected.hasFever as string).toLowerCase();
                    if (['sim', 'yes', 'true'].includes(val)) validated.dataCollected.hasFever = true;
                    else if (['não', 'nao', 'no', 'false'].includes(val)) validated.dataCollected.hasFever = false;
                    else {
                        validated.dataCollected.hasFever = null;
                        validated.needsClarification = true;
                    }
                }

                // Bleeding (Boolean/String)
                if (typeof validated.dataCollected.bleeding === 'string') {
                    const val = (validated.dataCollected.bleeding as string).toLowerCase();
                    if (['sim', 'yes', 'true'].includes(val)) validated.dataCollected.bleeding = true;
                    else if (['não', 'nao', 'no', 'false', 'none'].includes(val)) validated.dataCollected.bleeding = false;
                }
            }

            return validated as GeminiResponse;
        } catch (parseError) {
            console.error('Error parsing Gemini response:', parseError);
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
        console.error('Gemini API Fatal Error:', error);

        // Tenta extrair número básico da mensagem do usuário como "backup de emergência"
        let fallbackMessage = "Estou com uma instabilidade técnica momentânea. Por favor, tente responder com palavras simples ou apenas números.";
        const extractedNum = userMessage.match(/\d+/);

        if (extractedNum) {
            fallbackMessage = "Recebi seu número, mas tive um erro de conexão. Vou tentar registrar.";
            // Em um mundo ideal, retornaríamos o dado, mas para segurança, pedimos confirmação.
        }

        return createFallbackResponse(fallbackMessage);
    }
}


