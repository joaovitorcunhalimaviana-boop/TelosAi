/**
 * WhatsApp Webhook Handler
 * Recebe mensagens e eventos do WhatsApp Business API
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { markAsRead } from '@/lib/whatsapp';
import { analyzeFollowUpResponse } from '@/lib/anthropic';
import { detectRedFlags, getRiskLevel } from '@/lib/red-flags';
import { sendEmpatheticResponse, sendDoctorAlert } from '@/lib/whatsapp';
import { sendPushNotification } from '@/app/api/notifications/send/route';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { invalidateDashboardStats } from '@/lib/cache-helpers';
import { logger } from "@/lib/logger";

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN!;

/**
 * GET - Webhook Verification (Meta requirement)
 * Meta envia uma requisição GET para verificar o webhook
 */
export async function GET(request: NextRequest) {
  // Rate limiting temporariamente desabilitado devido a erro no KV_REST_API_URL
  // const ip = getClientIP(request);
  // const rateLimitResult = await rateLimit(ip, 100, 60);

  // if (!rateLimitResult.success) {
  //   return NextResponse.json(
  //     { error: 'Too many requests' },
  //     {
  //       status: 429,
  //       headers: {
  //         'X-RateLimit-Remaining': '0',
  //         'X-RateLimit-Reset': rateLimitResult.reset?.toString() || '',
  //       }
  //     }
  //   );
  // }

  const searchParams = request.nextUrl.searchParams;

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  logger.debug('Webhook verification request', { mode, token, challenge });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    logger.debug('Webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  logger.error('Webhook verification failed');
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * POST - Receive Incoming Messages
 * Meta envia eventos de mensagens via POST
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting temporariamente desabilitado devido a erro no KV_REST_API_URL
    // const ip = getClientIP(request);
    // const rateLimitResult = await rateLimit(ip, 100, 60);

    // if (!rateLimitResult.success) {
    //   return NextResponse.json(
    //     { error: 'Too many requests' },
    //     {
    //       status: 429,
    //       headers: {
    //         'X-RateLimit-Remaining': '0',
    //         'X-RateLimit-Reset': rateLimitResult.reset?.toString() || '',
    //       }
    //     }
    //   );
    // }

    const body = await request.json();

    logger.debug('Webhook received', JSON.stringify(body, null, 2));

    // Validar estrutura do webhook
    if (!body.object || body.object !== 'whatsapp_business_account') {
      logger.debug('Not a WhatsApp webhook');
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    // Processar cada entrada
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          await processMessages(change.value);
        }
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    // Retornar 200 mesmo com erro para evitar retry infinito do Meta
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 200 });
  }
}

/**
 * Processa mensagens recebidas
 */
async function processMessages(value: any) {
  const messages = value.messages || [];
  const contacts = value.contacts || [];

  for (const message of messages) {
    // Ignorar mensagens enviadas por nós (apenas processar recebidas)
    if (message.from === value.metadata?.phone_number_id) {
      continue;
    }

    // Marcar como lida
    await markAsRead(message.id).catch(err =>
      logger.error('Error marking as read:', err)
    );

    // Processar baseado no tipo de mensagem
    if (message.type === 'text') {
      await processTextMessage(message, contacts);
    } else if (message.type === 'interactive') {
      await processInteractiveMessage(message, contacts);
    } else {
      logger.debug(`Message type ${message.type} not handled`);
    }
  }
}

/**
 * Processa mensagem de texto
 */
async function processTextMessage(message: any, contacts: any[]) {
  try {
    const phone = message.from;
    const text = message.text?.body || '';

    logger.debug(`Processing text message from ${phone}: ${text}`);

    // Encontrar paciente pelo telefone
    const patient = await findPatientByPhone(phone);

    if (!patient) {
      logger.error(`❌ Patient not found for phone`, {
        phone,
        phoneNormalized: phone.replace(/\D/g, '')
      });
      // Enviar mensagem padrão
      await sendEmpatheticResponse(
        phone,
        'Olá! Não encontrei seu cadastro em nosso sistema. ' +
        'Por favor, entre em contato com o consultório.'
      );
      return;
    }

    logger.debug('✅ Patient found', {
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
      userId: patient.userId
    });

    // Encontrar follow-up pendente ou enviado
    const pendingFollowUp = await findPendingFollowUp(patient.id);

    if (!pendingFollowUp) {
      logger.debug(`⚠️ No pending follow-up found for patient`, {
        patientId: patient.id,
        patientName: patient.name
      });
      // Enviar mensagem padrão
      await sendEmpatheticResponse(
        phone,
        `Olá ${patient.name.split(' ')[0]}! Recebi sua mensagem. ` +
        'No momento não há questionário pendente. ' +
        'Se tiver alguma urgência, por favor entre em contato com o consultório.'
      );
      return;
    }

    logger.debug('✅ Pending follow-up found', {
      followUpId: pendingFollowUp.id,
      status: pendingFollowUp.status,
      dayNumber: pendingFollowUp.dayNumber,
      surgeryType: pendingFollowUp.surgery?.type
    });

    // Verificação: Se já respondeu, não processar mais
    if (pendingFollowUp.status === 'responded') {
      await sendEmpatheticResponse(
        phone,
        `Você já completou o questionário. Obrigado!`
      );
      return;
    }

    // Verificar se é início do questionário (resposta "sim" ao template)
    const textLower = text.toLowerCase().trim();

    console.log('📋 ========== DEBUG ULTRA DETALHADO V4.0 FINAL ==========');
    console.log('HORA:', new Date().toISOString());
    console.log('Texto recebido RAW:', JSON.stringify(text));
    console.log('Texto após trim():', JSON.stringify(text.trim()));
    console.log('Texto após toLowerCase():', JSON.stringify(textLower));
    console.log('Length do texto:', textLower.length);
    console.log('Char codes:', Array.from(textLower as string).map(c => c.charCodeAt(0)));
    console.log('');
    console.log('COMPARAÇÕES:');
    console.log('textLower === "sim":', textLower === 'sim');
    console.log('textLower === "s":', textLower === 's');
    console.log('textLower === "sim!":', textLower === 'sim!');
    console.log('textLower.includes("sim"):', textLower.includes('sim'));
    console.log('');
    console.log('FOLLOW-UP:');
    console.log('ID:', pendingFollowUp.id);
    console.log('Status RAW:', JSON.stringify(pendingFollowUp.status));
    console.log('Status === "sent":', pendingFollowUp.status === 'sent');
    console.log('Status === "in_progress":', pendingFollowUp.status === 'in_progress');
    console.log('Day Number:', pendingFollowUp.dayNumber);
    console.log('');
    console.log('PACIENTE:');
    console.log('ID:', patient.id);
    console.log('Nome:', patient.name);
    console.log('');
    console.log('CONDIÇÃO FINAL:');
    const isSimResponse = (textLower === 'sim' || textLower === 's' || textLower === 'sim!');
    const isSentStatus = pendingFollowUp.status === 'sent';
    console.log('É resposta SIM?', isSimResponse);
    console.log('Status é SENT?', isSentStatus);
    console.log('VAI INICIAR QUESTIONÁRIO?', isSimResponse && isSentStatus);
    console.log('===========================================================');

    logger.debug('📋 Checking if should start questionnaire', {
      textLower,
      isSimResponse: textLower === 'sim' || textLower === 's' || textLower === 'sim!',
      followUpStatus: pendingFollowUp.status
    });

    // Estado 1: Resposta "sim" ao template inicial - INICIAR COM IA
    // Broaden check to include 'sim' anywhere or other positive confirmations
    const isPositiveResponse = textLower.includes('sim') ||
      textLower === 's' ||
      textLower.includes('ok') ||
      textLower.includes('pode') ||
      textLower.includes('claro') ||
      textLower.includes('iniciar') ||
      textLower.includes('começar');

    if (isPositiveResponse && pendingFollowUp.status === 'sent') {
      logger.debug('✅ Iniciando questionário com IA conversacional...', {
        patientName: patient.name,
        followUpId: pendingFollowUp.id
      });

      // Calcular dia pós-operatório CORRETAMENTE
      // Se a cirurgia foi ontem, hoje é D+1 (primeiro dia pós-op)
      // Usar o dayNumber do follow-up que já está correto no banco
      const daysPostOp = pendingFollowUp.dayNumber;
      const firstName = patient.name.split(' ')[0];

      // Verificar se paciente já teve primeira evacuação
      const hadFirstBowelMovement = pendingFollowUp.surgery.hadFirstBowelMovement || false;

      // Mensagem inicial de saudação + pergunta sobre dor EM REPOUSO
      const initialMessage = `Olá ${firstName}! 👋

Espero que esteja se recuperando bem da sua ${pendingFollowUp.surgery.type}.

Vamos conversar um pouquinho sobre como você está se sentindo hoje, no seu *${daysPostOp}º dia* após a cirurgia.

Para começar, gostaria de saber sobre sua *dor em repouso* (quando você está parado, sem evacuar):

*Em uma escala de 0 a 10*, qual o nível de dor que você está sentindo agora?

Leve em consideração a escala de dor abaixo:`;

      // 1. PRIMEIRO: Enviar mensagem de saudação + pergunta
      logger.debug('📝 Enviando saudação inicial...');
      await sendEmpatheticResponse(phone, initialMessage);

      // 2. SEGUNDO: Enviar imagem da escala de dor
      await new Promise(resolve => setTimeout(resolve, 500));
      logger.debug('📊 Enviando escala de dor...');
      await sendImageScale(phone, 'pain_scale');

      // 3. Criar registro de resposta com a conversa inicial
      await prisma.followUpResponse.create({
        data: {
          followUpId: pendingFollowUp.id,
          userId: patient.userId,
          questionnaireData: JSON.stringify({
            conversation: [
              { role: 'user', content: text },
              { role: 'assistant', content: initialMessage }
            ],
            extractedData: {},
            completed: false,
            conversationPhase: 'collecting_pain_at_rest',
            hadFirstBowelMovement: hadFirstBowelMovement
          }),
          riskLevel: 'low',
        },
      });

      // 4. Atualizar follow-up para status "in_progress"
      await prisma.followUp.update({
        where: { id: pendingFollowUp.id },
        data: {
          status: 'in_progress',
        },
      });

      // Invalidate dashboard cache
      invalidateDashboardStats();

      logger.debug('✅ Questionário iniciado - aguardando resposta do paciente sobre dor');

      return;
    }

    // Estado 2: Respondendo questionário interativo
    if (pendingFollowUp.status === 'in_progress') {
      await processQuestionnaireAnswer(pendingFollowUp, patient, phone, text);
      return;
    }

    // Estado 3: Mensagem fora de contexto (NÃO deveria chegar aqui se in_progress)
    console.log('⚠️ MENSAGEM FORA DE CONTEXTO - Enviando instrução para responder SIM');
    console.log('Status do follow-up:', pendingFollowUp.status);
    await sendEmpatheticResponse(
      phone,
      `Olá ${patient.name.split(' ')[0]}! 👋\n\n` +
      `Para iniciar o questionário pós-operatório, por favor responda com a palavra *"sim"*.\n\n` +
      `_(Versão do sistema: 3.0 - ${new Date().toLocaleTimeString('pt-BR')})_`
    );

  } catch (error) {
    logger.error('Error processing text message:', error);
  }
}

/**
 * URLs das Imagens Médicas
 */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sistema-pos-operatorio-ajknwy9u3-joao-vitor-vianas-projects.vercel.app';

const MEDICAL_IMAGES = {
  painScale: `${APP_URL}/escala-dor.png`,
  bristolScale: `${APP_URL}/escala-bristol.png`,
};

/**
 * Estrutura de dados pós-operatórios a serem coletados
 * IMPORTANTE: Diferenciamos dor em repouso vs dor durante evacuação
 */
interface PostOpData {
  // DOR - separada em repouso e durante evacuação
  painAtRest?: number; // 0-10 - Dor em REPOUSO (antes de evacuar)
  painDuringBowelMovement?: number; // 0-10 - Dor DURANTE a evacuação

  // FEBRE
  hasFever?: boolean;
  feverDetails?: string;

  // URINA
  canUrinate?: boolean;
  urinationDetails?: string;

  // EVACUAÇÃO - dados detalhados
  hadBowelMovementSinceLastContact?: boolean; // Evacuou desde última conversa?
  bowelMovementTime?: string; // Hora aproximada da evacuação (para primeira evacuação)
  bristolScale?: number; // 1-7 - Escala de Bristol
  isFirstBowelMovement?: boolean; // Flag se é a primeira evacuação pós-op

  // SANGRAMENTO
  bleeding?: 'none' | 'mild' | 'moderate' | 'severe';
  bleedingDetails?: string;

  // ALIMENTAÇÃO
  canEat?: boolean;
  dietDetails?: string;

  // OUTROS
  otherSymptoms?: string;

  // Campos legados (manter para compatibilidade)
  painLevel?: number; // Mapeado para painAtRest
  hadBowelMovement?: boolean; // Mapeado para hadBowelMovementSinceLastContact
}

/**
 * Resposta da IA Claude
 */
interface ClaudeAIResponse {
  message: string;
  needsImage?: 'pain_scale' | 'bristol_scale' | null;
  dataCollected: Partial<PostOpData>;
  completed: boolean;
  needsClarification: boolean;
  conversationPhase?: string;
}

/**
 * Envia imagem de escala médica (dor ou Bristol)
 */
async function sendImageScale(phone: string, scaleType: 'pain_scale' | 'bristol_scale') {
  try {
    const { sendImage } = await import('@/lib/whatsapp');

    const captions = {
      pain_scale: '📊 *Escala de Dor*\n\nUse esta escala para avaliar sua dor de 0 a 10.',
      bristol_scale: '📊 *Escala de Bristol*\n\nUse esta escala para classificar suas fezes de 1 a 7.',
    };

    const imageUrl = scaleType === 'pain_scale'
      ? MEDICAL_IMAGES.painScale
      : MEDICAL_IMAGES.bristolScale;

    await sendImage(phone, imageUrl, captions[scaleType]);

    logger.debug(`✅ Imagem ${scaleType} enviada para ${phone}`);
  } catch (error) {
    logger.error(`❌ Erro ao enviar imagem ${scaleType}:`, error);
  }
}

/**
 * Chama Claude API para conversação inteligente
 */
async function callClaudeAPI(
  conversationHistory: any[],
  userMessage: string,
  patient: any,
  surgeryType: string,
  dayNumber: number,
  savedPhase?: string // Fase salva no banco (mais confiável)
): Promise<ClaudeAIResponse> {
  try {
    const { anthropic } = await import('@/lib/anthropic');

    // Usar fase salva no banco se disponível, senão determinar pelo histórico
    const currentPhase = savedPhase || determineCurrentPhase(conversationHistory);
    logger.debug('🎯 Fase para IA:', currentPhase);

    const SYSTEM_PROMPT = `Você é um assistente médico especializado em acompanhamento pós-operatório de cirurgia colorretal (hemorroidectomia, fístula, etc) via WhatsApp.

OBJETIVO: Coletar informações sobre a recuperação do paciente de forma NATURAL e EMPÁTICA.

CONTEXTO DO PACIENTE:
- Nome: ${patient.name}
- Cirurgia: ${surgeryType}
- Dia pós-operatório: D+${dayNumber}
- Fase atual da conversa: ${currentPhase}

=== FLUXO DE COLETA (ORDEM IMPORTANTE) ===

1. **DOR EM REPOUSO** (0-10)
   - Perguntar: "qual sua dor em repouso, quando está parado?"
   - Campo: painAtRest

2. **FEBRE** (sim/não + temperatura)
   - Campo: hasFever, feverDetails

3. **URINA** (conseguindo urinar?)
   - Campo: canUrinate

4. **EVACUAÇÃO** (desde última conversa)
   - Perguntar: "Você evacuou desde a última vez que conversamos?"
   - Se SIM:
     a) Perguntar HORA aproximada: "Mais ou menos que horas foi?"
     b) Perguntar DOR DURANTE EVACUAÇÃO (0-10): "Qual foi sua dor durante a evacuação?"
        -> ENVIAR IMAGEM DA ESCALA DE DOR (needsImage: "pain_scale")
     c) Perguntar BRISTOL (1-7): "Como estava a consistência das fezes?"
        -> ENVIAR IMAGEM DA ESCALA DE BRISTOL (needsImage: "bristol_scale")
   - Campos: hadBowelMovementSinceLastContact, bowelMovementTime, painDuringBowelMovement, bristolScale

5. **SANGRAMENTO** (nenhum/leve/moderado/intenso)
   - Campo: bleeding

6. **ALIMENTAÇÃO**
   - Campo: canEat

7. **OUTRAS PREOCUPAÇÕES**
   - Campo: otherSymptoms

=== REGRAS CRÍTICAS ===

1. SEMPRE diferencie DOR EM REPOUSO vs DOR DURANTE EVACUAÇÃO
   - painAtRest: dor quando está parado, sem evacuar
   - painDuringBowelMovement: dor durante/após evacuar

2. Quando perguntar sobre EVACUAÇÃO:
   - Use "desde a última vez que conversamos" ou "desde nossa última conversa"
   - Se evacuou, pergunte a HORA ("mais ou menos que horas?")
   - Se evacuou, pergunte a DOR DURANTE a evacuação E ENVIE A ESCALA DE DOR
   - Se evacuou, pergunte BRISTOL E ENVIE A ESCALA DE BRISTOL

3. SEMPRE envie imagem quando:
   - Perguntar sobre dor: needsImage: "pain_scale"
   - Perguntar sobre Bristol/fezes: needsImage: "bristol_scale"

4. NUNCA REPITA pergunta já respondida

=== FORMATO DE RESPOSTA (JSON) ===
{
  "message": "sua resposta empática",
  "needsImage": "pain_scale" | "bristol_scale" | null,
  "dataCollected": {
    "painAtRest": null,
    "painDuringBowelMovement": null,
    "hasFever": null,
    "feverDetails": null,
    "canUrinate": null,
    "hadBowelMovementSinceLastContact": null,
    "bowelMovementTime": null,
    "bristolScale": null,
    "bleeding": null,
    "canEat": null,
    "otherSymptoms": null
  },
  "completed": false,
  "needsClarification": false,
  "conversationPhase": "collecting_pain_at_rest"
}

FASES VÁLIDAS:
- collecting_pain_at_rest (dor em repouso)
- collecting_fever
- collecting_urination
- collecting_bowel (se evacuou desde última conversa)
- collecting_bowel_time (hora da evacuação)
- collecting_pain_during_bm (dor durante evacuação)
- collecting_bristol
- collecting_bleeding
- collecting_diet
- collecting_concerns
- completed`;

    // Construir mensagens para Claude
    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: userMessage,
      },
    ];

    logger.debug('🤖 Chamando Claude API', {
      historyLength: conversationHistory.length,
      userMessage: userMessage.substring(0, 100),
      currentPhase,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      temperature: 0.5, // Mais consistente para seguir instruções
      system: SYSTEM_PROMPT,
      messages,
    });

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    logger.debug('🤖 Claude raw response:', responseText);

    // Tentar extrair JSON da resposta (pode ter texto antes/depois)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const aiResponse: ClaudeAIResponse = JSON.parse(jsonMatch[0]);

    logger.debug('✅ Claude response parsed:', {
      completed: aiResponse.completed,
      needsImage: aiResponse.needsImage,
      phase: aiResponse.conversationPhase,
      dataCollected: aiResponse.dataCollected,
    });

    return aiResponse;
  } catch (error) {
    logger.error('❌ Erro ao chamar Claude API:', error);

    // Log detalhado do erro
    if (error instanceof Error) {
      logger.error('Error name:', error.name);
      logger.error('Error message:', error.message);
      logger.error('Error stack:', error.stack);
    }

    // FALLBACK INTELIGENTE: Tentar interpretar a resposta localmente
    const localInterpretation = interpretResponseLocally(userMessage, conversationHistory);

    if (localInterpretation) {
      logger.debug('🔄 Usando interpretação local:', localInterpretation);
      return localInterpretation;
    }

    // Último recurso: pedir para repetir (mas NÃO reiniciar questionário)
    return {
      message: `Desculpe, não consegui processar sua resposta. Pode repetir de forma mais direta?\n\nPor exemplo, se for sobre dor, me diga apenas o número de 0 a 10.`,
      needsImage: null,
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: determineCurrentPhase(conversationHistory)
    };
  }
}

/**
 * Determina a fase atual da conversa baseado no histórico
 * FASES:
 * 1. collecting_pain_at_rest - Dor em repouso
 * 2. collecting_fever - Febre
 * 3. collecting_fever_temp - Temperatura da febre
 * 4. collecting_urination - Urina
 * 5. collecting_urination_details - Detalhes da urina
 * 6. collecting_bowel - Evacuação desde última conversa
 * 7. collecting_bowel_time - Hora da evacuação
 * 8. collecting_pain_during_bm - Dor DURANTE evacuação
 * 9. collecting_bristol - Escala Bristol
 * 10. collecting_bleeding - Sangramento
 * 11. collecting_diet - Alimentação
 * 12. collecting_concerns - Preocupações
 */
function determineCurrentPhase(conversationHistory: any[]): string {
  // Se não há histórico ou só tem mensagem inicial, estamos coletando dor em repouso
  if (conversationHistory.length === 0) return 'collecting_pain_at_rest';
  if (conversationHistory.length <= 2) return 'collecting_pain_at_rest';

  // Analisar as últimas mensagens do assistente para determinar fase
  const assistantMessages = conversationHistory
    .filter(m => m.role === 'assistant')
    .map(m => m.content.toLowerCase());

  if (assistantMessages.length === 0) return 'collecting_pain_at_rest';

  const lastAssistantMsg = assistantMessages[assistantMessages.length - 1];

  // Verificar qual foi a última pergunta feita pelo assistente
  // Ordem de verificação importa - mais específico primeiro

  // Preocupações finais
  if (lastAssistantMsg.includes('preocupação') || lastAssistantMsg.includes('sintoma') || lastAssistantMsg.includes('última pergunta')) {
    return 'collecting_concerns';
  }

  // Alimentação
  if (lastAssistantMsg.includes('alimentação') || lastAssistantMsg.includes('comer') || lastAssistantMsg.includes('comendo')) {
    return 'collecting_diet';
  }

  // Sangramento
  if (lastAssistantMsg.includes('sangr')) {
    return 'collecting_bleeding';
  }

  // Bristol Scale (consistência das fezes)
  if (lastAssistantMsg.includes('bristol') || lastAssistantMsg.includes('1 a 7') || lastAssistantMsg.includes('consistência')) {
    return 'collecting_bristol';
  }

  // Dor DURANTE evacuação (diferente de dor em repouso)
  if (lastAssistantMsg.includes('dor durante') || lastAssistantMsg.includes('durante a evacuação')) {
    return 'collecting_pain_during_bm';
  }

  // Hora da evacuação
  if (lastAssistantMsg.includes('que horas') || lastAssistantMsg.includes('horas foi')) {
    return 'collecting_bowel_time';
  }

  // Evacuação (desde última conversa)
  if (lastAssistantMsg.includes('evacuou') || lastAssistantMsg.includes('evacu') && lastAssistantMsg.includes('última')) {
    return 'collecting_bowel';
  }

  // Detalhes da urina
  if (lastAssistantMsg.includes('dificuldade para urinar') || lastAssistantMsg.includes('o que está acontecendo')) {
    return 'collecting_urination_details';
  }

  // Urina
  if (lastAssistantMsg.includes('urin') || lastAssistantMsg.includes('xixi')) {
    return 'collecting_urination';
  }

  // Temperatura da febre
  if ((lastAssistantMsg.includes('qual foi') || lastAssistantMsg.includes('medir')) && lastAssistantMsg.includes('temperatura')) {
    return 'collecting_fever_temp';
  }

  // Febre
  if (lastAssistantMsg.includes('febre')) {
    return 'collecting_fever';
  }

  // Dor em repouso (fase inicial)
  if (lastAssistantMsg.includes('dor em repouso') || lastAssistantMsg.includes('dor') && lastAssistantMsg.includes('0 a 10')) {
    return 'collecting_pain_at_rest';
  }

  // Fallback: verificar progresso pelo número de trocas
  const exchanges = Math.floor(conversationHistory.length / 2);
  const phases = [
    'collecting_pain_at_rest',
    'collecting_fever',
    'collecting_urination',
    'collecting_bowel',
    'collecting_bowel_time',
    'collecting_pain_during_bm',
    'collecting_bristol',
    'collecting_bleeding',
    'collecting_diet',
    'collecting_concerns'
  ];

  return phases[Math.min(exchanges, phases.length - 1)];
}

/**
 * Interpreta resposta localmente quando a API falha
 * IMPORTANTE: Esta função é CONSERVADORA - só avança quando TEM CERTEZA da resposta
 *
 * FLUXO COMPLETO:
 * 1. collecting_pain_at_rest - Dor em repouso (0-10)
 * 2. collecting_fever - Febre (sim/não)
 * 3. collecting_fever_temp - Temperatura (se teve febre)
 * 4. collecting_urination - Urina normal (sim/não)
 * 5. collecting_bowel - Evacuou desde última conversa (sim/não)
 * 6. collecting_bowel_time - Hora da evacuação (se evacuou)
 * 7. collecting_pain_during_bm - Dor DURANTE evacuação (0-10) + IMAGEM
 * 8. collecting_bristol - Escala Bristol (1-7) + IMAGEM
 * 9. collecting_bleeding - Sangramento
 * 10. collecting_diet - Alimentação
 * 11. collecting_concerns - Preocupações finais
 */
function interpretResponseLocally(userMessage: string, conversationHistory: any[]): ClaudeAIResponse | null {
  const msg = userMessage.trim().toLowerCase();
  const currentPhase = determineCurrentPhase(conversationHistory);

  logger.debug('🔄 interpretResponseLocally:', { msg, currentPhase });

  // Mapeamento de números por extenso
  const numberWords: Record<string, number> = {
    'zero': 0, 'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3,
    'quatro': 4, 'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10
  };

  // Tentar extrair número
  let number: number | null = null;
  const numberMatch = msg.match(/\b(\d+)\b/);
  if (numberMatch) {
    number = parseInt(numberMatch[1]);
  } else {
    for (const [word, value] of Object.entries(numberWords)) {
      const regex = new RegExp(`\\b${word}\\b`);
      if (regex.test(msg)) {
        number = value;
        break;
      }
    }
  }

  // Detectar sim/não
  const isYes = /^(sim|s|yes|claro|ok|isso|positivo|afirmativo)$/i.test(msg.trim()) ||
                /\b(sim|yes|claro)\b/i.test(msg);
  const isNo = /^(não|nao|n|no|nope|negativo)$/i.test(msg.trim()) ||
               /\b(não|nao|nunca)\b/i.test(msg);

  // Tentar extrair hora (ex: "10h", "às 10", "10:30", "pela manhã")
  let timeExtracted: string | null = null;
  const timeMatch = msg.match(/(\d{1,2})[h:]?(\d{0,2})?/);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1]);
    if (hour >= 0 && hour <= 23) {
      timeExtracted = timeMatch[2] ? `${hour}:${timeMatch[2]}` : `${hour}h`;
    }
  }
  if (msg.includes('manhã') || msg.includes('manha')) timeExtracted = 'pela manhã';
  if (msg.includes('tarde')) timeExtracted = 'à tarde';
  if (msg.includes('noite')) timeExtracted = 'à noite';
  if (msg.includes('madrugada')) timeExtracted = 'de madrugada';

  // ========================================
  // FASE 1: DOR EM REPOUSO (0-10)
  // ========================================
  if (currentPhase === 'collecting_pain_at_rest' || currentPhase === 'collecting_pain' || currentPhase === 'greeting') {
    if (number !== null && number >= 0 && number <= 10) {
      return {
        message: `Entendi, sua dor em repouso está em ${number}/10. ${number >= 7 ? 'Percebo que está com bastante desconforto. ' : ''}Agora me conta: você teve febre?`,
        needsImage: null,
        dataCollected: { painAtRest: number },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_fever'
      };
    }

    if (msg.includes('média') || msg.includes('moderada') || msg.includes('razoável') ||
        msg.includes('forte') || msg.includes('fraca') || msg.includes('leve') ||
        msg.includes('muita') || msg.includes('pouca') || msg.includes('bastante')) {
      return {
        message: `Entendo. Mas para eu registrar certinho, preciso de um número.\n\nOlhando a escala de dor, qual número de 0 a 10 representa sua dor em repouso agora?`,
        needsImage: 'pain_scale',
        dataCollected: {},
        completed: false,
        needsClarification: true,
        conversationPhase: 'collecting_pain_at_rest'
      };
    }

    return {
      message: `Desculpe, não entendi. Preciso que você me diga um número de 0 a 10 para sua dor em repouso (quando está parado).`,
      needsImage: 'pain_scale',
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_pain_at_rest'
    };
  }

  // ========================================
  // FASE 2: FEBRE (sim/não)
  // ========================================
  if (currentPhase === 'collecting_fever') {
    if (isNo) {
      return {
        message: `Ótimo, sem febre. E você está conseguindo urinar normalmente?`,
        needsImage: null,
        dataCollected: { hasFever: false },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_urination'
      };
    }
    if (isYes) {
      return {
        message: `Você conseguiu medir a temperatura? Qual foi?`,
        needsImage: null,
        dataCollected: { hasFever: true },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_fever_temp'
      };
    }
    return {
      message: `Desculpe, não entendi. Você teve febre? Responda sim ou não.`,
      needsImage: null,
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_fever'
    };
  }

  // ========================================
  // FASE 3: TEMPERATURA DA FEBRE
  // ========================================
  if (currentPhase === 'collecting_fever_temp') {
    const tempMatch = msg.match(/(\d+)[,.]?(\d*)/);
    if (tempMatch) {
      const temp = parseFloat(tempMatch[1] + (tempMatch[2] ? '.' + tempMatch[2] : ''));
      if (temp >= 35 && temp <= 42) {
        const isHighFever = temp >= 38;
        return {
          message: isHighFever
            ? `${temp}°C é febre alta. ${temp >= 39 ? '⚠️ Por favor, procure atendimento médico se persistir.' : ''} E você está conseguindo urinar normalmente?`
            : `Entendi, ${temp}°C. E você está conseguindo urinar normalmente?`,
          needsImage: null,
          dataCollected: { hasFever: true, feverDetails: `${temp}°C` },
          completed: false,
          needsClarification: false,
          conversationPhase: 'collecting_urination'
        };
      }
    }
    if (msg.includes('não medi') || msg.includes('nao medi') || msg.includes('não sei') || msg.includes('nao sei')) {
      return {
        message: `Tudo bem. Fique atento e meça se possível. E você está conseguindo urinar normalmente?`,
        needsImage: null,
        dataCollected: { hasFever: true, feverDetails: 'não mediu' },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_urination'
      };
    }
    return {
      message: `Não entendi a temperatura. Por favor, me diga o valor em graus (ex: 37.5 ou 38).`,
      needsImage: null,
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_fever_temp'
    };
  }

  // ========================================
  // FASE 4: URINA
  // ========================================
  if (currentPhase === 'collecting_urination') {
    if (isYes || msg.includes('normal') || msg.includes('normalmente') || msg.includes('tranquilo')) {
      return {
        message: `Perfeito! E você evacuou desde a última vez que conversamos?`,
        needsImage: null,
        dataCollected: { canUrinate: true },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_bowel'
      };
    }
    if (isNo || msg.includes('dificuldade') || msg.includes('difícil') || msg.includes('problema')) {
      return {
        message: `Entendo. Está tendo dificuldade para urinar? Me conta o que está acontecendo.`,
        needsImage: null,
        dataCollected: { canUrinate: false },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_urination_details'
      };
    }
    return {
      message: `Desculpe, não entendi. Você está conseguindo urinar normalmente? Responda sim ou não.`,
      needsImage: null,
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_urination'
    };
  }

  // ========================================
  // FASE 4b: DETALHES DA URINA
  // ========================================
  if (currentPhase === 'collecting_urination_details') {
    return {
      message: `Entendi, vou registrar isso. E você evacuou desde a última vez que conversamos?`,
      needsImage: null,
      dataCollected: { canUrinate: false, urinationDetails: userMessage },
      completed: false,
      needsClarification: false,
      conversationPhase: 'collecting_bowel'
    };
  }

  // ========================================
  // FASE 5: EVACUAÇÃO (desde última conversa)
  // ========================================
  if (currentPhase === 'collecting_bowel') {
    if (isYes) {
      return {
        message: `Que bom que evacuou! Mais ou menos que horas foi a evacuação?`,
        needsImage: null,
        dataCollected: { hadBowelMovementSinceLastContact: true },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_bowel_time'
      };
    }
    if (isNo || msg.includes('ainda não') || msg.includes('ainda nao')) {
      return {
        message: `Tudo bem, é comum nos primeiros dias. Continue tomando bastante líquido e os laxantes prescritos. Você está tendo sangramento?`,
        needsImage: null,
        dataCollected: { hadBowelMovementSinceLastContact: false },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_bleeding'
      };
    }
    return {
      message: `Desculpe, não entendi. Você evacuou desde a última vez que conversamos? Responda sim ou não.`,
      needsImage: null,
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_bowel'
    };
  }

  // ========================================
  // FASE 6: HORA DA EVACUAÇÃO
  // ========================================
  if (currentPhase === 'collecting_bowel_time') {
    // Aceita qualquer indicação de hora
    const bowelTime = timeExtracted || userMessage;
    return {
      message: `Entendi, por volta das ${bowelTime}. Agora preciso saber: *qual foi sua dor DURANTE a evacuação?*\n\nMe diz um número de 0 a 10, olhando a escala abaixo:`,
      needsImage: 'pain_scale',
      dataCollected: { bowelMovementTime: bowelTime },
      completed: false,
      needsClarification: false,
      conversationPhase: 'collecting_pain_during_bm'
    };
  }

  // ========================================
  // FASE 7: DOR DURANTE EVACUAÇÃO (0-10)
  // ========================================
  if (currentPhase === 'collecting_pain_during_bm') {
    if (number !== null && number >= 0 && number <= 10) {
      return {
        message: `Entendi, dor ${number}/10 durante a evacuação. ${number >= 7 ? 'Sei que está sendo difícil. ' : ''}Agora me conta: como estava a consistência das fezes?\n\nOlhe a escala de Bristol abaixo e me diga qual número (1 a 7) mais se parece:`,
        needsImage: 'bristol_scale',
        dataCollected: { painDuringBowelMovement: number },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_bristol'
      };
    }
    return {
      message: `Preciso que você me diga um número de 0 a 10 para a dor DURANTE a evacuação.\n\nOlhe a escala de dor:`,
      needsImage: 'pain_scale',
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_pain_during_bm'
    };
  }

  // ========================================
  // FASE 8: BRISTOL (1-7)
  // ========================================
  if (currentPhase === 'collecting_bristol') {
    if (number !== null && number >= 1 && number <= 7) {
      const bristolComment = number <= 2 ? 'Fezes mais duras podem indicar constipação. Continue tomando bastante líquido.'
        : number >= 6 ? 'Fezes mais líquidas. Fique atento se persistir.'
        : 'Consistência adequada.';
      return {
        message: `Entendi, tipo ${number} na escala de Bristol. ${bristolComment}\n\nVocê está tendo sangramento?`,
        needsImage: null,
        dataCollected: { bristolScale: number },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_bleeding'
      };
    }
    return {
      message: `Não entendi. Por favor, olhe a imagem da Escala de Bristol e me diga qual número de 1 a 7 mais se parece com suas fezes.`,
      needsImage: 'bristol_scale',
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_bristol'
    };
  }

  // ========================================
  // FASE 9: SANGRAMENTO
  // ========================================
  if (currentPhase === 'collecting_bleeding') {
    if (isNo || msg.includes('nenhum') || msg.includes('zero')) {
      return {
        message: `Ótimo, sem sangramento. E como está sua alimentação? Está conseguindo comer normalmente?`,
        needsImage: null,
        dataCollected: { bleeding: 'none' },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_diet'
      };
    }
    if (msg.includes('leve') || msg.includes('pouco') || msg.includes('papel') || msg.includes('gotas')) {
      return {
        message: `Entendi, sangramento leve no papel é normal nos primeiros dias. E como está sua alimentação?`,
        needsImage: null,
        dataCollected: { bleeding: 'mild' },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_diet'
      };
    }
    if (msg.includes('moderado') || msg.includes('roupa') || msg.includes('médio')) {
      return {
        message: `Entendi, sangramento moderado. Fique atento se aumentar. E como está sua alimentação?`,
        needsImage: null,
        dataCollected: { bleeding: 'moderate' },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_diet'
      };
    }
    if (msg.includes('intenso') || msg.includes('muito') || msg.includes('forte') || msg.includes('vaso')) {
      return {
        message: `⚠️ Sangramento intenso requer atenção! Se continuar ou piorar, procure atendimento médico de urgência. E como está sua alimentação?`,
        needsImage: null,
        dataCollected: { bleeding: 'severe' },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_diet'
      };
    }
    if (isYes) {
      return {
        message: `Entendi que está tendo sangramento. Pode me dizer a intensidade?\n\n- *Leve*: só no papel higiênico\n- *Moderado*: mancha a roupa\n- *Intenso*: encheu o vaso`,
        needsImage: null,
        dataCollected: {},
        completed: false,
        needsClarification: true,
        conversationPhase: 'collecting_bleeding'
      };
    }
    return {
      message: `Desculpe, não entendi. Você está tendo sangramento? Responda sim ou não.`,
      needsImage: null,
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_bleeding'
    };
  }

  // ========================================
  // FASE 10: ALIMENTAÇÃO
  // ========================================
  if (currentPhase === 'collecting_diet') {
    if (isYes || msg.includes('normal') || msg.includes('bem') || msg.includes('tranquilo')) {
      return {
        message: `Perfeito! Última pergunta: tem alguma outra preocupação ou sintoma que gostaria de me contar?`,
        needsImage: null,
        dataCollected: { canEat: true },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_concerns'
      };
    }
    if (isNo || msg.includes('dificuldade') || msg.includes('náusea') || msg.includes('vômito')) {
      return {
        message: `Entendo que está com dificuldade para comer. Tem alguma outra preocupação ou sintoma que gostaria de me contar?`,
        needsImage: null,
        dataCollected: { canEat: false, dietDetails: userMessage },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_concerns'
      };
    }
    return {
      message: `Desculpe, não entendi. Você está conseguindo comer normalmente? Responda sim ou não.`,
      needsImage: null,
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_diet'
    };
  }

  // ========================================
  // FASE 11: PREOCUPAÇÕES (final)
  // ========================================
  if (currentPhase === 'collecting_concerns') {
    const hasConcerns = !isNo && msg.length > 2 && msg !== 'nada' && msg !== 'não' && msg !== 'nao';
    return {
      message: `Obrigada por compartilhar! Registrei todas as informações. O Dr. João Vitor vai analisar e, se necessário, entrará em contato. Boa recuperação! 💙`,
      needsImage: null,
      dataCollected: { otherSymptoms: hasConcerns ? userMessage : undefined },
      completed: true,
      needsClarification: false,
      conversationPhase: 'completed'
    };
  }

  // Fallback - não avança
  return {
    message: `Desculpe, não consegui entender sua resposta. Pode repetir de forma mais clara?`,
    needsImage: null,
    dataCollected: {},
    completed: false,
    needsClarification: true,
    conversationPhase: currentPhase
  };
}

/**
 * Processa resposta do questionário com IA conversacional
 */
async function processQuestionnaireAnswer(
  followUp: any,
  patient: any,
  phone: string,
  message: string
) {
  try {
    logger.debug('🔄 Processando resposta com IA conversacional...', {
      patientId: patient.id,
      followUpId: followUp.id,
      message: message.substring(0, 100),
    });

    // 1. Buscar histórico de conversas
    const response = await prisma.followUpResponse.findFirst({
      where: { followUpId: followUp.id },
      orderBy: { createdAt: 'desc' },
    });

    const questionnaireData = response?.questionnaireData
      ? JSON.parse(response.questionnaireData)
      : { conversation: [], extractedData: {}, completed: false };

    const conversationHistory = questionnaireData.conversation || [];

    // Se já completou, NÃO reiniciar questionário
    if (questionnaireData.completed) {
      logger.debug('⚠️ Questionário já completado - respondendo contextualmente');
      await sendEmpatheticResponse(
        phone,
        `Olá ${patient.name.split(' ')[0]}! Você já completou o questionário de hoje. ` +
        'Se tiver alguma preocupação adicional, entre em contato diretamente com o consultório.'
      );
      return;
    }

    // Detectar perguntas do paciente (linha ~500)
    const looksLikeQuestion = message.includes('?') ||
      message.toLowerCase().includes('o que') ||
      message.toLowerCase().includes('como');

    if (looksLikeQuestion && conversationHistory.length < 2) {
      // IA vai responder a dúvida
      logger.debug('Pergunta detectada - IA vai responder');
    }

    // 2. Obter fase atual salva no banco (mais confiável)
    const savedPhase = questionnaireData.conversationPhase || 'collecting_pain';
    logger.debug('📍 Fase atual:', savedPhase);

    // 3. Chamar Claude API com a fase atual
    const aiResponse = await callClaudeAPI(
      conversationHistory,
      message,
      patient,
      followUp.surgery.type,
      followUp.dayNumber,
      savedPhase // Passar fase salva para a IA
    );

    // 4. PRIMEIRO: Enviar resposta da IA (texto)
    await sendEmpatheticResponse(phone, aiResponse.message);

    // 5. SEGUNDO: Se precisa enviar imagem, enviar DEPOIS do texto
    if (aiResponse.needsImage) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await sendImageScale(phone, aiResponse.needsImage);
    }

    // 5. Atualizar histórico de conversação
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse.message }
    );

    // Merge dados extraídos (preservar dados anteriores)
    const mergedData = {
      ...questionnaireData.extractedData,
      ...aiResponse.dataCollected,
    };

    // 6. Atualizar banco de dados
    const updatedQuestionnaireData = {
      conversation: conversationHistory,
      extractedData: mergedData,
      completed: aiResponse.completed,
      conversationPhase: aiResponse.conversationPhase,
    };

    if (response) {
      await prisma.followUpResponse.update({
        where: { id: response.id },
        data: {
          questionnaireData: JSON.stringify(updatedQuestionnaireData),
        },
      });
    } else {
      await prisma.followUpResponse.create({
        data: {
          followUpId: followUp.id,
          userId: patient.userId,
          questionnaireData: JSON.stringify(updatedQuestionnaireData),
          riskLevel: 'low', // Será atualizado na finalização
        },
      });
    }

    // 7. Se completou, finalizar follow-up
    if (aiResponse.completed) {
      logger.debug('✅ Questionário completado via IA - finalizando...');
      await finalizeQuestionnaireWithAI(followUp, patient, phone, mergedData, response?.id || '');
    }

  } catch (error) {
    logger.error('❌ Erro ao processar resposta com IA:', error);
    await sendEmpatheticResponse(
      phone,
      'Desculpe, tive um problema ao processar sua resposta. Pode tentar novamente?'
    );
  }
}

/**
 * Finaliza questionário com análise via IA
 */
async function finalizeQuestionnaireWithAI(
  followUp: any,
  patient: any,
  phone: string,
  extractedData: Partial<PostOpData>,
  responseId: string
) {
  try {
    logger.debug('🔄 Finalizando questionário com IA e analisando respostas...');

    // ============================================
    // REGISTRAR PRIMEIRA EVACUAÇÃO SE APLICÁVEL
    // ============================================
    if (extractedData.hadBowelMovementSinceLastContact && !followUp.surgery.hadFirstBowelMovement) {
      const { recordFirstBowelMovement } = await import('@/lib/bowel-movement-tracker');
      await recordFirstBowelMovement(
        followUp.surgeryId,
        followUp.dayNumber,
        extractedData.painDuringBowelMovement || 0,
        extractedData.bristolScale || 4 // Default Bristol 4 (normal)
      );
      logger.debug('✅ Primeira evacuação registrada!', {
        dayNumber: followUp.dayNumber,
        painDuringBM: extractedData.painDuringBowelMovement,
        bristolScale: extractedData.bristolScale,
        bowelMovementTime: extractedData.bowelMovementTime
      });
    }

    // Converter PostOpData para QuestionnaireData (formato esperado pela análise)
    // Mapear 'mild' para 'light' para compatibilidade com red-flags
    const bleedingMap: Record<string, 'none' | 'light' | 'moderate' | 'severe'> = {
      'none': 'none',
      'mild': 'light',
      'moderate': 'moderate',
      'severe': 'severe',
    };

    // Usar painAtRest como painLevel principal (compatibilidade)
    const questionnaireData = {
      painLevel: extractedData.painAtRest || extractedData.painLevel,
      painAtRest: extractedData.painAtRest,
      painDuringBowelMovement: extractedData.painDuringBowelMovement,
      fever: extractedData.hasFever,
      urinaryRetention: extractedData.canUrinate === false,
      bowelMovement: extractedData.hadBowelMovementSinceLastContact || extractedData.hadBowelMovement,
      bowelMovementTime: extractedData.bowelMovementTime,
      bristolScale: extractedData.bristolScale,
      bleeding: extractedData.bleeding ? bleedingMap[extractedData.bleeding] : 'none',
      concerns: extractedData.otherSymptoms || '',
    };

    // Detectar red flags deterministicamente
    const redFlags = detectRedFlags({
      surgeryType: followUp.surgery.type,
      dayNumber: followUp.dayNumber,
      ...questionnaireData,
    });

    const detectedRedFlagMessages = redFlags.map(rf => rf.message);
    const deterministicRiskLevel = getRiskLevel(redFlags);

    // Analisar com Claude AI
    const aiAnalysis = await analyzeFollowUpResponse({
      surgeryType: followUp.surgery.type,
      dayNumber: followUp.dayNumber,
      patientData: {
        name: patient.name,
        age: patient.age,
        sex: patient.sex,
        comorbidities: [],
        medications: [],
      },
      questionnaireData,
      detectedRedFlags: detectedRedFlagMessages,
    });

    // Combinar red flags
    const allRedFlags = [
      ...detectedRedFlagMessages,
      ...aiAnalysis.additionalRedFlags,
    ];

    // Determinar nível de risco final
    const riskLevels = ['low', 'medium', 'high', 'critical'];
    const finalRiskLevel = riskLevels.indexOf(aiAnalysis.riskLevel) > riskLevels.indexOf(deterministicRiskLevel)
      ? aiAnalysis.riskLevel
      : deterministicRiskLevel;

    // Atualizar resposta no banco
    if (responseId) {
      await prisma.followUpResponse.update({
        where: { id: responseId },
        data: {
          aiAnalysis: JSON.stringify(aiAnalysis),
          aiResponse: aiAnalysis.empatheticResponse,
          riskLevel: finalRiskLevel,
          redFlags: JSON.stringify(allRedFlags),
        },
      });
    } else {
      // Criar nova resposta se não existir
      const newResponse = await prisma.followUpResponse.create({
        data: {
          followUpId: followUp.id,
          userId: patient.userId,
          questionnaireData: JSON.stringify(extractedData),
          aiAnalysis: JSON.stringify(aiAnalysis),
          aiResponse: aiAnalysis.empatheticResponse,
          riskLevel: finalRiskLevel,
          redFlags: JSON.stringify(allRedFlags),
        },
      });
      responseId = newResponse.id;
    }

    // Atualizar status do follow-up
    await prisma.followUp.update({
      where: { id: followUp.id },
      data: {
        status: 'responded',
        respondedAt: new Date(),
      },
    });

    // Invalidate dashboard cache
    invalidateDashboardStats();

    // Enviar resposta empática ao paciente
    let responseMessage = `✅ *Questionário concluído!*\n\n${aiAnalysis.empatheticResponse}`;
    if (aiAnalysis.seekCareAdvice) {
      responseMessage += `\n\n⚠️ ${aiAnalysis.seekCareAdvice}`;
    }

    await sendEmpatheticResponse(phone, responseMessage);

    // Enviar notificação push
    await sendPushNotification(patient.userId, {
      title: 'Paciente Respondeu',
      body: `${patient.name} respondeu ao questionário D+${followUp.dayNumber}`,
      url: `/paciente/${patient.id}`,
      tag: `patient-response-${responseId}`,
      requireInteraction: false,
    }).catch(err => logger.error('Error sending response push notification:', err));

    // Alertar médico se risco alto ou crítico
    if (finalRiskLevel === 'high' || finalRiskLevel === 'critical') {
      await sendDoctorAlert(
        patient.name,
        followUp.dayNumber,
        finalRiskLevel,
        allRedFlags
      );

      await prisma.followUpResponse.update({
        where: { id: responseId },
        data: {
          doctorAlerted: true,
          alertSentAt: new Date(),
        },
      });

      await sendPushNotification(patient.userId, {
        title: `Red Flag: ${patient.name}`,
        body: `Nível de risco ${finalRiskLevel} detectado em D+${followUp.dayNumber}. ${allRedFlags.length} alerta(s).`,
        url: `/paciente/${patient.id}`,
        tag: `red-flag-${responseId}`,
        requireInteraction: true,
      }).catch(err => logger.error('Error sending push notification:', err));
    }

    logger.debug(`✅ Questionário finalizado com sucesso para ${patient.name}`);

  } catch (error) {
    logger.error('Error finalizing questionnaire with AI:', error);
    await sendEmpatheticResponse(
      phone,
      'Obrigado por responder! Recebi suas informações e vou analisá-las com cuidado. ' +
      'Em caso de qualquer sintoma que te preocupe, não hesite em entrar em contato.'
    );
  }
}

/**
 * Calcula nível de risco baseado nos dados coletados (helper function)
 */
function calculateRiskLevel(data: Partial<PostOpData>): 'low' | 'medium' | 'high' | 'critical' {
  // Lógica simples de risco - será refinada pela IA depois
  if (data.painLevel && data.painLevel >= 8) return 'high';
  if (data.bleeding === 'severe') return 'critical';
  if (data.hasFever) return 'medium';
  if (!data.canUrinate) return 'high';
  return 'low';
}

/**
 * Processa mensagem interativa (botões/listas)
 */
async function processInteractiveMessage(message: any, contacts: any[]) {
  try {
    const phone = message.from;
    const interactive = message.interactive;

    logger.debug(`Processing interactive message from ${phone}:`, interactive);

    // Extrair resposta baseada no tipo
    let response = '';
    if (interactive.type === 'button_reply') {
      response = interactive.button_reply.title;
    } else if (interactive.type === 'list_reply') {
      response = interactive.list_reply.title;
    }

    // Processar como mensagem de texto
    await processTextMessage({ from: phone, text: { body: response } }, contacts);

  } catch (error) {
    logger.error('Error processing interactive message:', error);
  }
}

// Função processFollowUpResponse removida - agora usamos fluxo interativo (processQuestionnaireAnswer + finalizeQuestionnaire)

/**
 * Encontra paciente pelo telefone usando SQL raw para normalizar e buscar
 * SOLUÇÃO DEFINITIVA: Usa REGEXP_REPLACE do PostgreSQL para normalizar telefone na query
 */
async function findPatientByPhone(phone: string): Promise<any | null> {
  // Normalizar número de telefone (remover tudo exceto dígitos)
  const normalizedPhone = phone.replace(/\D/g, '')

  logger.debug('🔍 Buscando paciente', {
    phoneOriginal: phone,
    phoneNormalized: normalizedPhone,
    length: normalizedPhone.length
  })

  // WhatsApp envia formato: 5583998663089 (país + DDD + número)
  // Banco pode ter: (83) 99866-3089, 83998663089, 5583998663089, etc

  const last11 = normalizedPhone.slice(-11) // 83998663089
  const last9 = normalizedPhone.slice(-9)   // 998663089
  const last8 = normalizedPhone.slice(-8)   // 98663089

  logger.debug('🔍 Termos de busca', {
    last11,
    last9,
    last8
  })

  try {
    // SOLUÇÃO: Usar raw SQL para normalizar telefone no banco e comparar
    // REGEXP_REPLACE remove todos os caracteres não-numéricos
    const result = await prisma.$queryRaw`
      SELECT id, name, phone, "userId"
      FROM "Patient"
      WHERE "isActive" = true
      AND (
        REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE ${`%${last11}%`}
        OR REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE ${`%${last9}%`}
        OR REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE ${`%${last8}%`}
      )
      LIMIT 1
    ` as any[];

    if (result && result.length > 0) {
      const patient = result[0];
      logger.debug('✅ Paciente encontrado via SQL', {
        patientId: patient.id,
        patientName: patient.name,
        patientPhone: patient.phone,
        userId: patient.userId
      })
      return patient
    }

    // SQL não encontrou - tentar fallback JavaScript
    logger.warn('⚠️ SQL não encontrou paciente, tentando fallback JavaScript...')

  } catch (error) {
    logger.error('❌ Erro na busca SQL:', error)
    logger.debug('🔄 Tentando fallback com busca manual...')
  }

  // FALLBACK: buscar todos e filtrar manualmente (sempre executa se SQL falhar ou não encontrar)
  try {
    const allPatients = await prisma.patient.findMany({
      where: { isActive: true },
      select: { id: true, name: true, phone: true, userId: true }
    })

    logger.debug(`📋 Buscando entre ${allPatients.length} pacientes ativos via fallback`)

    for (const patient of allPatients) {
      const patientPhoneNormalized = patient.phone.replace(/\D/g, '')
      if (patientPhoneNormalized.includes(last11) ||
        patientPhoneNormalized.includes(last9) ||
        patientPhoneNormalized.includes(last8)) {
        logger.debug('✅ Paciente encontrado via fallback JavaScript', {
          patientId: patient.id,
          patientName: patient.name,
          patientPhone: patient.phone,
          userId: patient.userId
        })
        return patient
      }
    }

    // Não encontrou nem com fallback - log detalhado
    logger.error('❌ Paciente NÃO encontrado após SQL + fallback', {
      phoneOriginal: phone,
      phoneNormalized: normalizedPhone,
      last11,
      last9,
      last8,
      totalPatientsChecked: allPatients.length
    })

    // Mostrar amostra para debug
    logger.debug('📋 Amostra de telefones (primeiros 5):',
      allPatients.slice(0, 5).map(p => ({
        name: p.name,
        phone: p.phone,
        normalized: p.phone.replace(/\D/g, '')
      }))
    )

    return null

  } catch (fallbackError) {
    logger.error('❌ Erro fatal no fallback JavaScript:', fallbackError)
    return null
  }
}

/**
 * Encontra follow-up pendente ou enviado para o paciente
 */
async function findPendingFollowUp(patientId: string): Promise<any | null> {
  const followUp = await prisma.followUp.findFirst({
    where: {
      patientId,
      status: {
        in: ['sent', 'pending', 'in_progress'],  // CRITICAL FIX: incluir in_progress
      },
    },
    include: {
      surgery: true,
    },
    orderBy: {
      scheduledDate: 'asc', // Priorizar o follow-up mais antigo (D1 antes de D2)
    },
  });

  return followUp;
}

/**
 * Parse resposta de texto em dados estruturados
 * Implementação simplificada - em produção usar NLP
 */
function parseResponseText(text: string): any {
  const data: any = {};

  // Tentar extrair nível de dor (0-10)
  const painMatch = text.match(/dor[:\s]*(\d+)/i);
  if (painMatch) {
    data.painLevel = parseInt(painMatch[1]);
  }

  // Tentar extrair temperatura
  const tempMatch = text.match(/(\d+)[.,]?\d*\s*[°º]?\s*c/i);
  if (tempMatch) {
    data.temperature = parseFloat(tempMatch[1].replace(',', '.'));
  }

  // Detectar palavras-chave para booleanos
  const textLower = text.toLowerCase();

  // Febre
  if (textLower.includes('febre') || textLower.includes('fever')) {
    data.fever = !textLower.includes('sem febre') && !textLower.includes('não');
  }

  // Sangramento
  if (textLower.includes('sangr')) {
    if (textLower.includes('intenso') || textLower.includes('muito')) {
      data.bleeding = 'severe';
    } else if (textLower.includes('moderado')) {
      data.bleeding = 'moderate';
    } else if (textLower.includes('leve') || textLower.includes('pouco')) {
      data.bleeding = 'light';
    } else if (textLower.includes('não') || textLower.includes('sem')) {
      data.bleeding = 'none';
    }
  }

  // Retenção urinária
  if (textLower.includes('urina') || textLower.includes('xixi')) {
    data.urinaryRetention = textLower.includes('não consigo') ||
      textLower.includes('dificuldade') ||
      textLower.includes('retenção');

    // Tentar extrair horas
    const hoursMatch = text.match(/(\d+)\s*h/i);
    if (hoursMatch && data.urinaryRetention) {
      data.urinaryRetentionHours = parseInt(hoursMatch[1]);
    }
  }

  // Evacuação
  if (textLower.includes('evac') || textLower.includes('cocô')) {
    data.bowelMovement = !textLower.includes('não') &&
      !textLower.includes('ainda não');
  }

  // Náuseas/vômitos
  if (textLower.includes('náusea') || textLower.includes('vômit')) {
    data.nausea = true;
  }

  // Secreção
  if (textLower.includes('secreção') || textLower.includes('pus')) {
    if (textLower.includes('pus') || textLower.includes('purulent')) {
      data.discharge = 'purulent';
    } else if (textLower.includes('abundante')) {
      data.discharge = 'abundant';
    } else if (textLower.includes('clara') || textLower.includes('serosa')) {
      data.discharge = 'serous';
    }
  }

  // Adicionar texto original como preocupação
  data.concerns = text;

  return data;
}

/**
 * Valida assinatura do webhook (opcional - para segurança adicional)
 */
function validateWebhookSignature(
  payload: string,
  signature: string
): boolean {
  // Implementar validação HMAC se necessário
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac('sha256', process.env.WHATSAPP_APP_SECRET!)
  //   .update(payload)
  //   .digest('hex');
  // return signature === expectedSignature;
  return true;
}
