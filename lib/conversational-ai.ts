/**
 * IA Conversacional para Questionários Pós-Operatórios
 * Usa Claude para conversar naturalmente com pacientes
 */

import Anthropic from '@anthropic-ai/sdk';
import { Patient, Surgery } from '@prisma/client';
import { prisma } from './prisma';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface QuestionnaireData {
  pain?: number | string;
  bowelMovement?: boolean | string;
  bleeding?: string;
  urination?: boolean | string;
  fever?: boolean | string | number;
  medications?: boolean | string;
  concerns?: string;
  [key: string]: any;
}

/**
 * Conduz conversa com paciente para coletar dados do questionário
 */
export async function conductConversation(
  userMessage: string,
  patient: Patient,
  surgery: Surgery,
  conversationHistory: ConversationMessage[],
  currentData: QuestionnaireData
): Promise<{
  aiResponse: string;
  updatedData: QuestionnaireData;
  isComplete: boolean;
  needsDoctorAlert: boolean;
  urgencyLevel: string;
}> {
  // Calcular dias pós-operatórios
  const daysPostOp = Math.floor((Date.now() - surgery.date.getTime()) / (1000 * 60 * 60 * 24));

  // Definir o que ainda precisa ser coletado
  const missingInfo = getMissingInformation(currentData);

  // Construir prompt para Claude
  const systemPrompt = `Você é uma assistente médica virtual especializada em acompanhamento pós-operatório de cirurgia colorretal.

CONTEXTO DO PACIENTE:
- Nome: ${patient.name}
- Cirurgia: ${surgery.type}
- Dia pós-operatório: D+${daysPostOp}

⚠️ REGRAS CRÍTICAS - NUNCA VIOLE ESTAS REGRAS:

1. INFORMAÇÕES OBRIGATÓRIAS (devem ser coletadas):
   ${missingInfo.length > 0 ? missingInfo.map(info => `- ${info}`).join('\n') : '✅ Todas as informações já foram coletadas!'}

2. DADOS JÁ COLETADOS:
   ${JSON.stringify(currentData, null, 2)}

3. INSTRUÇÕES ABSOLUTAS:

   a) COLETA ESTRUTURADA MAS NATURAL:
      - SEMPRE colete dados específicos (dor 0-10, sim/não para evacuação, etc)
      - MAS faça isso de forma conversacional, empática e fluida
      - Exemplo: "Como está sua dor hoje? Se 0 é sem dor e 10 é a pior dor que já sentiu, qual número você diria?"

   b) NUNCA SUGIRA OU DIRECIONE RESPOSTAS:
      ❌ PROIBIDO: "Pelo que você disse, parece que sua dor deve ser uns 8, né?"
      ❌ PROIBIDO: "Então posso anotar como 7?"
      ✅ CORRETO: "Entendi. Me diz um número de 0 a 10 para eu anotar?"

   c) ESCALA DE DOR (MUITO IMPORTANTE):
      - SEMPRE pergunte a dor usando escala 0-10
      - Se paciente responder vago ("muita dor", "doendo bastante"):
        * NÃO aceite como resposta final
        * EXPLIQUE a escala novamente
        * INSISTA gentilmente: "Preciso que você me diga um número de 0 a 10 para eu registrar certinho"

      ✅ Exemplo correto:
      Paciente: "Estou com muita dor"
      Você: "Entendo que está com bastante dor. Para eu poder registrar direitinho, preciso que você me diga um número. Se 0 é sem dor nenhuma e 10 é a pior dor que você já sentiu na vida, qual número você diria que está agora?"

      Paciente: "Muito forte mesmo"
      Você: "Sim, percebo que está bem forte. Me ajuda com um número de 0 a 10? Isso é importante para o Dr. João acompanhar sua recuperação."

   d) OUTRAS INFORMAÇÕES:
      - Evacuação: sim ou não (+ detalhes se necessário)
      - Sangramento: nenhum, leve, moderado ou intenso
      - Urina: sim ou não
      - Febre: sim (com temperatura) ou não
      - Medicações: está tomando ou não

   e) FLUXO DA CONVERSA:
      - Faça UMA pergunta por vez
      - Espere a resposta completa antes de ir para próxima
      - Se resposta incompleta/vaga: gentilmente peça esclarecimento
      - Quando conseguir informação: confirme e siga para próxima
      - NÃO finalize até ter TODOS os dados necessários

   f) EMPATIA E NATURALIDADE:
      - Seja calorosa, acolhedora
      - Use linguagem simples
      - Demonstre que se importa
      - MAS sempre colete os dados objetivos

4. SINAIS DE ALERTA (RED FLAGS):
   - Dor ≥ 8/10
   - Sangramento volumoso
   - Febre ≥ 38°C
   - Não consegue urinar

   Se detectar: oriente PRONTO-SOCORRO imediatamente

5. ENCERRAMENTO:
   Só finalize quando tiver TODAS as informações.

RESPONDA APENAS COM JSON:
{
  "response": "sua resposta natural para o paciente",
  "extractedInfo": {
    "pain": 7  // APENAS se paciente deu número específico
  },
  "isComplete": false,
  "urgency": "low|medium|high|critical",
  "needsDoctorAlert": false
}`;

  try {
    // Construir mensagens para Claude
    const messages: any[] = [];

    // Adicionar histórico
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Adicionar mensagem atual do usuário
    messages.push({
      role: 'user',
      content: userMessage
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      temperature: 0.7, // Mais criativa para conversação natural
      system: systemPrompt,
      messages: messages,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extrair JSON da resposta
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Atualizar dados coletados
    const updatedData = {
      ...currentData,
      ...result.extractedInfo
    };

    return {
      aiResponse: result.response,
      updatedData,
      isComplete: result.isComplete || false,
      needsDoctorAlert: result.needsDoctorAlert || false,
      urgencyLevel: result.urgency || 'low'
    };

  } catch (error) {
    console.error('Error in conversational AI:', error);

    // Fallback: resposta genérica
    return {
      aiResponse: 'Desculpe, tive um problema técnico. Pode repetir sua resposta, por favor?',
      updatedData: currentData,
      isComplete: false,
      needsDoctorAlert: false,
      urgencyLevel: 'low'
    };
  }
}

/**
 * Determina quais informações ainda faltam coletar
 */
function getMissingInformation(data: QuestionnaireData): string[] {
  const missing: string[] = [];

  if (!data.pain && data.pain !== 0) {
    missing.push('Nível de dor (0-10)');
  }

  if (data.bowelMovement === undefined) {
    missing.push('Se conseguiu evacuar');
  }

  if (!data.bleeding) {
    missing.push('Informações sobre sangramento');
  }

  if (data.urination === undefined) {
    missing.push('Se conseguiu urinar normalmente');
  }

  if (data.fever === undefined) {
    missing.push('Se teve febre');
  }

  if (data.medications === undefined) {
    missing.push('Se está tomando as medicações');
  }

  // Concerns é opcional, não adiciona como "missing"

  return missing;
}

/**
 * Inicia conversa com saudação personalizada
 */
export function getInitialGreeting(patient: Patient, surgery: Surgery, dayNumber: number): string {
  const greeting = getGreeting();
  const firstName = patient.name.split(' ')[0];

  return `${greeting}, ${firstName}! 👋

Aqui é a assistente de acompanhamento pós-operatório do Dr. João Vitor.

Vi que você está no ${dayNumber}º dia após sua cirurgia de ${surgery.type}. Como você está se sentindo hoje?

Pode me contar livremente como está sua recuperação, e vou fazer algumas perguntas para entender melhor como você está. 😊`;
}

/**
 * Retorna saudação apropriada baseada no horário
 */
function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'Bom dia';
  } else if (hour >= 12 && hour < 18) {
    return 'Boa tarde';
  } else {
    return 'Boa noite';
  }
}
