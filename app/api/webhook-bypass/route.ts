/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * WEBHOOK BYPASS - ROBUSTO
 * Migrado com toda a lógica do webhook principal (/api/whatsapp/webhook)
 * URL ativa no Meta WhatsApp: /api/webhook-bypass
 *
 * Funcionalidades:
 * - conductConversation (IA conversacional com protocolo médico)
 * - Validação server-side de campos obrigatórios
 * - Forced questions (localCareAdherence, additionalSymptoms)
 * - Saves incrementais (FollowUpResponse atualizada a cada mensagem)
 * - Deduplicação de mensagens (memória + banco)
 * - Rate limiting
 * - Análise médica com IA (red flags, alerta ao médico)
 * - Suporte a mensagens interativas e não-texto
 */

// Vercel Hobby plan: default 10s timeout mata a função antes da IA responder.
// maxDuration=60 permite até 60 segundos (máximo do Hobby plan).
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { invalidateDashboardStats } from '@/lib/cache-helpers';
import { analyzeFollowUpResponse } from '@/lib/anthropic';
import { sendPushNotification } from '@/app/api/notifications/send/route';
import { logger } from '@/lib/logger';
import {
  markAsRead,
  sendEmpatheticResponse,
  sendImage,
  sendDoctorAlert
} from '@/lib/whatsapp';
import {
  validateQuestionnaireData,
  parseJSONSafely,
} from '@/lib/api-validation';
import { conductConversation } from '@/lib/conversational-ai';
import { startOfDayBrasilia, endOfDayBrasilia } from '@/lib/date-utils';

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'meu-token-super-secreto-2024';

// ============================================
// IN-MEMORY RATE LIMITER
// ============================================
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit: number = 100, windowSeconds: number = 60): boolean {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

// Clean old entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  }, 60000);
}

// ============================================
// IN-MEMORY DEDUPLICATION
// ============================================
const processedMessageIds = new Set<string>();

// ============================================
// GET - Webhook Verification (Meta requirement)
// ============================================
export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const validTokens = ['meu_token_secreto_123', 'meu-token-super-secreto-2024', VERIFY_TOKEN];

  if (mode === 'subscribe' && token && validTokens.includes(token)) {
    logger.debug('Webhook bypass verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  logger.error('Webhook bypass verification failed');
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// ============================================
// POST - Receive Incoming Messages
// ============================================
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    logger.debug('📨 Webhook bypass received');

    if (!body.object || body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          await processMessages(change.value);
        }
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    logger.error('❌ Erro no webhook bypass:', error);
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 200 });
  }
}

// ============================================
// PROCESS MESSAGES (with deduplication)
// ============================================
async function processMessages(value: any) {
  const messages = value.messages || [];

  for (const message of messages) {
    // Ignorar mensagens enviadas por nós
    if (message.from === value.metadata?.phone_number_id) {
      continue;
    }

    // DEDUPLICAÇÃO ROBUSTA (Banco de Dados + Memória)
    // Protege contra retries do Meta (Meta reenvia se resposta demora >20s)
    try {
      if (processedMessageIds.has(message.id)) {
        logger.debug(`Duplicate message ignored (memory): ${message.id}`);
        continue;
      }

      // Usar upsert para evitar race condition entre check e create
      // Se dois requests chegam ao mesmo tempo, o upsert garante que
      // apenas um cria o registro (o outro faz update sem efeito)
      const existing = await prisma.processedMessage.findUnique({
        where: { id: message.id }
      });

      if (existing) {
        logger.debug(`Duplicate message ignored (db): ${message.id}`);
        processedMessageIds.add(message.id);
        continue;
      }

      // Tentar criar - se falhar com unique constraint, é duplicado
      try {
        await prisma.processedMessage.create({
          data: { id: message.id }
        });
      } catch (createError: any) {
        // P2002 = Unique constraint violation = outra instância já criou
        if (createError?.code === 'P2002') {
          logger.debug(`Duplicate message caught by unique constraint: ${message.id}`);
          processedMessageIds.add(message.id);
          continue;
        }
        throw createError;
      }
      processedMessageIds.add(message.id);

      // Limpar IDs antigos da memória
      if (processedMessageIds.size > 1000) {
        const it = processedMessageIds.values();
        const oldestId = it.next().value;
        if (oldestId) {
          processedMessageIds.delete(oldestId);
        }
      }
    } catch (error) {
      logger.error('Error checking duplicate message:', error);
    }

    // Marcar como lida
    await markAsRead(message.id).catch(err =>
      logger.error('Error marking as read:', err)
    );

    // Processar baseado no tipo de mensagem
    if (message.type === 'text') {
      await processTextMessage(message);
    } else if (message.type === 'interactive') {
      await processInteractiveMessage(message);
    } else if (['audio', 'image', 'video', 'document', 'sticker', 'location', 'contacts'].includes(message.type)) {
      await processUnsupportedMessage(message);
    } else {
      logger.debug(`Message type ${message.type} not handled`);
    }
  }
}

// ============================================
// PROCESS UNSUPPORTED MESSAGES
// ============================================
async function processUnsupportedMessage(message: any) {
  try {
    const phone = message.from;
    const messageType = message.type;

    const patient = await findPatientByPhone(phone);

    const typeDescriptions: Record<string, string> = {
      audio: 'áudio', image: 'imagem', video: 'vídeo',
      document: 'documento', sticker: 'figurinha',
      location: 'localização', contacts: 'contato'
    };
    const typeDescription = typeDescriptions[messageType] || 'este tipo de mensagem';

    const firstName = patient ? patient.name.split(' ')[0] : '';
    const greeting = firstName ? `${firstName}, ` : '';

    await sendEmpatheticResponse(phone,
      `${greeting}recebi seu ${typeDescription}, mas infelizmente não consigo processar esse tipo de mensagem.\n\n` +
      `Por favor, *escreva sua resposta em texto* para que eu possa registrar corretamente.\n\n` +
      `Se precisar informar algo sobre sua recuperação, digite a resposta por escrito.`
    );
  } catch (error) {
    logger.error('Error processing unsupported message:', error);
  }
}

// ============================================
// PROCESS INTERACTIVE MESSAGE
// ============================================
async function processInteractiveMessage(message: any) {
  try {
    const phone = message.from;
    const interactive = message.interactive;

    let response = '';
    if (interactive.type === 'button_reply') {
      response = interactive.button_reply.title;
    } else if (interactive.type === 'list_reply') {
      response = interactive.list_reply.title;
    }

    await processTextMessage({ from: phone, text: { body: response } });
  } catch (error) {
    logger.error('Error processing interactive message:', error);
  }
}

// ============================================
// PROCESS TEXT MESSAGE (main logic)
// ============================================
async function processTextMessage(message: any) {
  try {
    const phone = message.from;
    const text = message.text?.body || '';

    logger.debug(`📱 Mensagem de ${phone}: "${text.substring(0, 100)}"`);

    // Encontrar paciente
    const patient = await findPatientByPhone(phone);

    if (!patient) {
      logger.error('❌ Patient not found for phone', { phone });
      await sendEmpatheticResponse(
        phone,
        'Olá! Não encontrei seu cadastro em nosso sistema. Por favor, entre em contato com o consultório.'
      );
      return;
    }

    logger.debug('✅ Patient found', {
      patientId: patient.id,
      patientName: patient.name,
      userId: patient.userId
    });

    // Encontrar follow-up pendente ou enviado
    const pendingFollowUp = await findPendingFollowUp(patient.id);

    if (!pendingFollowUp) {
      logger.debug('⚠️ No follow-up scheduled for TODAY', { patientId: patient.id });

      // Buscar próximo follow-up programado
      const nextFollowUp = await prisma.followUp.findFirst({
        where: {
          patientId: patient.id,
          status: 'pending',
          scheduledDate: { gt: new Date() },
        },
        orderBy: { scheduledDate: 'asc' },
        include: { surgery: true },
      });

      const surgery = await prisma.surgery.findFirst({
        where: { patientId: patient.id },
        orderBy: { date: 'desc' },
      });

      const firstName = patient.name.split(' ')[0];
      let responseMsg = '';

      if (surgery) {
        const { toBrasiliaTime } = await import('@/lib/date-utils');
        const nowBrt = toBrasiliaTime(new Date());
        const surgeryBrt = toBrasiliaTime(surgery.date);
        const nowDayStart = new Date(nowBrt.getFullYear(), nowBrt.getMonth(), nowBrt.getDate());
        const surgeryDayStart = new Date(surgeryBrt.getFullYear(), surgeryBrt.getMonth(), surgeryBrt.getDate());
        const daysPostOp = Math.round((nowDayStart.getTime() - surgeryDayStart.getTime()) / (1000 * 60 * 60 * 24));

        if (nextFollowUp) {
          responseMsg = `Olá ${firstName}! 👋\n\nHoje é o *D+${daysPostOp}* do seu pós-operatório. Não temos questionário programado para hoje.\n\nSeu próximo acompanhamento será no *D+${nextFollowUp.dayNumber}*.\n\nSe tiver alguma dúvida ou preocupação, pode me perguntar! 😊`;
        } else {
          responseMsg = `Olá ${firstName}! 👋\n\nHoje é o *D+${daysPostOp}* do seu pós-operatório. No momento não há mais questionários programados.\n\nSe tiver alguma dúvida ou preocupação, estou à disposição!`;
        }
      } else {
        responseMsg = `Olá ${firstName}! Recebi sua mensagem. No momento não há questionário pendente. Se tiver alguma urgência, por favor entre em contato com o consultório.`;
      }

      await sendEmpatheticResponse(phone, responseMsg);
      return;
    }

    logger.debug('✅ Pending follow-up found', {
      followUpId: pendingFollowUp.id,
      status: pendingFollowUp.status,
      dayNumber: pendingFollowUp.dayNumber,
    });

    // Se já respondeu, não processar mais
    if (pendingFollowUp.status === 'responded') {
      await sendEmpatheticResponse(phone, `Você já completou o questionário. Obrigado!`);
      return;
    }

    const textLower = text.toLowerCase().trim();

    // Verificar se é resposta positiva
    const isPositiveResponse = textLower.includes('sim') ||
      textLower === 's' ||
      textLower.includes('ok') ||
      textLower.includes('pode') ||
      textLower.includes('claro') ||
      textLower.includes('iniciar') ||
      textLower.includes('começar');

    // Estado 1: Iniciar questionário (status sent ou pending)
    if (pendingFollowUp.status === 'sent' || pendingFollowUp.status === 'pending') {
      logger.debug('✅ Iniciando questionário com IA conversacional...', {
        patientName: patient.name,
        followUpId: pendingFollowUp.id
      });

      const daysPostOp = pendingFollowUp.dayNumber;
      const firstName = patient.name.split(' ')[0];
      const hadFirstBowelMovement = pendingFollowUp.surgery.hadFirstBowelMovement || false;

      const initialMessage = `Olá ${firstName}! 👋

Aqui é a *VigIA*, assistente virtual de acompanhamento pós-operatório.

Vamos atualizar como você está hoje, no seu *${daysPostOp}º dia* pós-cirurgia.

Para começar: *quanto está doendo agora, quando você está parado(a)?*

Por favor, me diga um número de 0 a 10, onde:
0️⃣ = **Zero dor** (totalmente sem dor)
🔟 = **Pior dor da vida** (insuportável)`;

      // NUNCA processar a primeira mensagem com IA — sempre deixar o paciente
      // responder à pergunta da dor antes de chamar processQuestionnaireAnswer.
      // Antes, `shouldProcessFirstMessage = !isPositiveResponse` causava
      // uma SEGUNDA saudação (a IA gerava outra mensagem de boas-vindas).
      const shouldProcessFirstMessage = false;

      // PRIMEIRO: Criar FollowUpResponse + atualizar status em transação
      // Isso PRECISA vir ANTES de enviar mensagens para evitar duplicação
      // Se o Meta reenvia o webhook (retry por timeout >20s), a transaction
      // detecta ALREADY_STARTED e não envia o greeting de novo
      try {
        await prisma.$transaction(async (tx) => {
          const currentFollowUp = await tx.followUp.findUnique({
            where: { id: pendingFollowUp.id },
            select: { status: true },
          });

          if (currentFollowUp?.status !== 'sent' && currentFollowUp?.status !== 'pending') {
            throw new Error('ALREADY_STARTED');
          }

          await tx.followUpResponse.create({
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

          await tx.followUp.update({
            where: { id: pendingFollowUp.id },
            data: { status: 'in_progress' },
          });
        });
      } catch (txError: any) {
        if (txError?.message === 'ALREADY_STARTED') {
          logger.warn('⚠️ Questionário já foi iniciado (race condition prevenida) - NÃO reenviando greeting');
          // NÃO envia nada - o greeting já foi enviado pela primeira instância
          return;
        }
        throw txError;
      }

      // SÓ AGORA envia o greeting (após transaction confirmar que somos a primeira instância)
      await sendEmpatheticResponse(phone, initialMessage);

      // Enviar escala de dor
      await new Promise(resolve => setTimeout(resolve, 500));
      await sendImageScale(phone, 'pain_scale');

      invalidateDashboardStats();

      // Se mensagem não-sim, processar com IA imediatamente
      if (shouldProcessFirstMessage) {
        logger.debug('🔄 Processando primeira mensagem não-sim com IA:', text);
        const updatedFollowUp = await prisma.followUp.findUnique({
          where: { id: pendingFollowUp.id },
          include: { surgery: true }
        });
        if (updatedFollowUp) {
          await processQuestionnaireAnswer(updatedFollowUp, patient, phone, text);
        }
      }

      return;
    }

    // Estado 2: Respondendo questionário (status in_progress)
    if (pendingFollowUp.status === 'in_progress') {
      await processQuestionnaireAnswer(pendingFollowUp, patient, phone, text);
      return;
    }

    // Estado 3: Status inesperado
    await sendEmpatheticResponse(
      phone,
      `Olá ${patient.name.split(' ')[0]}! 👋\n\nAqui é a VigIA. No momento não há questionário pendente para responder.\n\nSe tiver alguma dúvida ou preocupação, entre em contato com o consultório.`
    );

  } catch (error) {
    logger.error('Error processing text message:', error);
    try {
      const phone = message?.from;
      if (phone) {
        await sendEmpatheticResponse(
          phone,
          'Oi! Aqui é a VigIA. Tive um probleminha técnico, mas já estou de volta. Pode repetir o que disse? 😊'
        );
      }
    } catch (sendError) {
      logger.error('❌ ERRO CRÍTICO: Falha total ao responder paciente:', sendError);
    }
  }
}

// ============================================
// URLs das Imagens Médicas
// ============================================
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sistema-pos-operatorio-ajknwy9u3-joao-vitor-vianas-projects.vercel.app';
const MEDICAL_IMAGES = {
  painScale: `${APP_URL}/escala-dor.png`,
};

// ============================================
// PostOpData Interface
// ============================================
interface PostOpData {
  painAtRest?: number | null;
  painDuringBowelMovement?: number | null;
  hasFever?: boolean | null;
  feverDetails?: string | null;
  hadBowelMovementSinceLastContact?: boolean | null;
  bowelMovementTime?: string | null;
  isFirstBowelMovement?: boolean | null;
  bleeding?: boolean | 'none' | 'mild' | 'moderate' | 'severe' | null;
  bleedingDetails?: string | null;
  takingPrescribedMeds?: boolean | null;
  prescribedMedsDetails?: string | null;
  takingExtraMeds?: boolean | null;
  extraMedsDetails?: string | null;
  hasPurulentDischarge?: boolean | null;
  purulentDischargeDetails?: string | null;
  otherSymptoms?: string | null;
  painControlSatisfaction?: number | null;
  aiFollowUpSatisfaction?: number | null;
  npsScore?: number | null;
  feedback?: string | null;
  painLevel?: number | null;
  hadBowelMovement?: boolean | null;
  canEat?: boolean | null;
  dietDetails?: string | null;
  canUrinate?: boolean | null;
  urinationDetails?: string | null;
}

// ============================================
// SEND IMAGE SCALE
// ============================================
async function sendImageScale(phone: string, scaleType: 'pain_scale') {
  try {
    const caption = '📊 *Escala de Dor*\n\nPor favor, indique um número de 0 a 10.';
    await sendImage(phone, MEDICAL_IMAGES.painScale, caption);
    logger.debug(`✅ Imagem ${scaleType} enviada para ${phone}`);
  } catch (error) {
    logger.error(`❌ Erro ao enviar imagem ${scaleType}:`, error);
  }
}

// ============================================
// SERVER-SIDE FORCED QUESTIONS
// ============================================
function getServerSideForcedQuestion(fieldName: string): string | null {
  const questions: Record<string, string> = {
    localCareAdherence:
      'Ah, antes de encerrar, preciso te perguntar uma coisa importante: você está seguindo os cuidados locais orientados pelo médico? Como uso de pomadas, banhos de assento, compressas... Está conseguindo fazer direitinho?',
    additionalSymptoms:
      'E para finalizar: tem mais alguma coisa que você gostaria de me contar? Qualquer sintoma, dúvida ou preocupação — pode falar livremente! 😊',
    pain:
      'Preciso saber: como está sua dor agora, em repouso? Me diz um número de 0 a 10.',
    bowelMovementSinceLastContact:
      'Me conta: você evacuou desde a última vez que conversamos?',
    bleeding:
      'E sobre sangramento: está tendo algum sangramento? (nenhum, leve, moderado ou intenso)',
    fever:
      'Você teve febre?',
    medications:
      'Está tomando as medicações conforme o médico prescreveu?',
    usedExtraMedication:
      'Além das medicações prescritas, você tomou alguma outra medicação por conta própria?',
    urination:
      'Está conseguindo urinar normalmente?',
    discharge:
      'Você tem saída de secreção (líquido) pela ferida operatória?',
    painDuringBowelMovement:
      'E a dor durante a evacuação, de 0 a 10, quanto foi?',
    satisfactionRating:
      'De 0 a 10, qual nota você daria para o acompanhamento que recebeu durante sua recuperação?',
    wouldRecommend:
      'Você recomendaria este tipo de acompanhamento pós-operatório para outros pacientes?',
    improvementSuggestions:
      'Você tem alguma sugestão de como podemos melhorar o acompanhamento para futuros pacientes?',
  };

  return questions[fieldName] || null;
}

// ============================================
// PROCESS QUESTIONNAIRE ANSWER (with conductConversation)
// ============================================
async function processQuestionnaireAnswer(
  followUp: any,
  patient: any,
  phone: string,
  message: string
) {
  try {
    logger.debug('🔄 Processando resposta com IA Claude...', {
      patientId: patient.id,
      followUpId: followUp.id,
      message: message.substring(0, 100),
    });

    // 1. Buscar histórico de conversas
    const response = await prisma.followUpResponse.findFirst({
      where: { followUpId: followUp.id },
      orderBy: { createdAt: 'desc' },
    });

    const rawQuestionnaireData = parseJSONSafely(response?.questionnaireData, {
      conversation: [],
      extractedData: {},
      completed: false,
    });
    const questionnaireData = validateQuestionnaireData(rawQuestionnaireData);

    const conversationHistory = questionnaireData.conversation || [];

    // Se já completou, não reiniciar
    if (questionnaireData.completed) {
      await sendEmpatheticResponse(
        phone,
        `Olá ${patient.name.split(' ')[0]}! Você já completou o questionário de hoje. ` +
        'Se tiver alguma preocupação adicional, entre em contato diretamente com o consultório.'
      );
      return;
    }

    // 2. Dados já coletados
    const currentData = questionnaireData.extractedData || {};

    // Campos obrigatórios para validação server-side
    const requiredFields = [
      'pain',
      'bowelMovementSinceLastContact',
      'bleeding',
      'fever',
      'medications',
      'usedExtraMedication',
      'additionalSymptoms',
      'localCareAdherence',
    ];

    const dayNumber = followUp.dayNumber || 1;

    // Campos condicionais por dia
    if (dayNumber === 1) {
      requiredFields.push('urination');
    }
    if (dayNumber >= 3) {
      requiredFields.push('discharge');
    }
    if (dayNumber >= 14) {
      requiredFields.push('satisfactionRating');
      requiredFields.push('wouldRecommend');
      requiredFields.push('improvementSuggestions');
    }
    if (currentData.bowelMovementSinceLastContact === true) {
      requiredFields.push('painDuringBowelMovement');
    }

    // 3. Formatar histórico para Claude
    const claudeHistory = conversationHistory.map((msg: any) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.timestamp || new Date().toISOString(),
    }));

    // 4. CHAMAR CLAUDE (conductConversation)
    logger.debug('🧠 Chamando Claude para análise da mensagem...');
    const aiResult = await conductConversation(
      message,
      patient,
      followUp.surgery,
      claudeHistory,
      currentData,
      followUp.dayNumber
    );

    // 5. Enviar imagens se necessário
    if (aiResult.sendImages?.painScale) {
      await sendImageScale(phone, 'pain_scale');
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 6. Enviar resposta da IA
    await sendEmpatheticResponse(phone, aiResult.aiResponse);

    // 7. Atualizar histórico e dados
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: aiResult.aiResponse }
    );

    const mergedData = aiResult.updatedData;

    // PROTEÇÃO: Verificar se additionalSymptoms foi realmente PERGUNTADO
    if (mergedData.additionalSymptoms !== undefined) {
      const allMessages = [...conversationHistory, { role: 'assistant', content: aiResult.aiResponse }];
      const assistantMessages = allMessages
        .filter((m: any) => m.role === 'assistant' || m.role === 'system')
        .map((m: any) => (m.content || '').toLowerCase());
      const questionWasAsked = assistantMessages.some((msg: string) =>
        msg.includes('mais alguma coisa') ||
        msg.includes('algo mais') ||
        msg.includes('relatar mais') ||
        msg.includes('alguma queixa') ||
        msg.includes('algum sintoma') ||
        msg.includes('mais alguma') ||
        msg.includes('gostaria de me contar') ||
        msg.includes('deseja relatar') ||
        msg.includes('antes de encerrar')
      );
      if (!questionWasAsked) {
        logger.warn('⚠️ Claude setou additionalSymptoms sem perguntar - removendo valor prematuro');
        delete mergedData.additionalSymptoms;
      }
    }

    // VALIDAÇÃO SERVER-SIDE: Nunca confiar cegamente no isComplete do Claude
    const nullableFields = ['additionalSymptoms', 'concerns'];
    const updatedMissingFields = requiredFields.filter(f => {
      if (nullableFields.includes(f)) {
        return mergedData[f] === undefined;
      }
      return mergedData[f] === undefined || mergedData[f] === null;
    });
    const isActuallyComplete = aiResult.isComplete && updatedMissingFields.length === 0;

    // PROACTIVE FORCE: Se conversa longa e faltam apenas campos críticos
    const conversationLength = conversationHistory.length;
    const criticalMissing = updatedMissingFields.filter(
      f => f === 'localCareAdherence' || f === 'additionalSymptoms'
    );
    const otherMissing = updatedMissingFields.filter(
      f => f !== 'localCareAdherence' && f !== 'additionalSymptoms'
    );

    if (!aiResult.isComplete && criticalMissing.length > 0 && otherMissing.length === 0 && conversationLength >= 6) {
      const fieldToForce = criticalMissing.includes('localCareAdherence')
        ? 'localCareAdherence'
        : 'additionalSymptoms';

      const proactiveQuestion = getServerSideForcedQuestion(fieldToForce);
      if (proactiveQuestion) {
        const aiResponseLower = aiResult.aiResponse.toLowerCase();
        const alreadyAsked =
          (fieldToForce === 'localCareAdherence' &&
            (aiResponseLower.includes('cuidados locais') || aiResponseLower.includes('banho de assento') || aiResponseLower.includes('pomada'))) ||
          (fieldToForce === 'additionalSymptoms' &&
            (aiResponseLower.includes('mais alguma coisa') || aiResponseLower.includes('algo mais') || aiResponseLower.includes('relatar mais')));

        if (!alreadyAsked) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await sendEmpatheticResponse(phone, proactiveQuestion);
          // FIX: Merge com a última mensagem assistant ao invés de criar
          // duas assistant consecutivas (causa erro 400 na Anthropic API)
          const lastEntry = conversationHistory[conversationHistory.length - 1];
          if (lastEntry && lastEntry.role === 'assistant') {
            lastEntry.content = lastEntry.content + '\n\n' + proactiveQuestion;
          } else {
            conversationHistory.push({ role: 'assistant', content: proactiveQuestion });
          }
          logger.info('🔄 Pergunta PROATIVA forçada para campo crítico:', fieldToForce);
        }
      }
    }

    // SERVER-SIDE FORCE: Se IA marcou completo mas faltam campos
    if (aiResult.isComplete && updatedMissingFields.length > 0) {
      logger.warn('⚠️ Claude marcou isComplete=true mas ainda faltam campos:', updatedMissingFields);

      const fieldToAsk = updatedMissingFields.includes('additionalSymptoms') && updatedMissingFields.length === 1
        ? 'additionalSymptoms'
        : updatedMissingFields.find(f => f !== 'additionalSymptoms') || updatedMissingFields[0];

      const forcedQuestion = getServerSideForcedQuestion(fieldToAsk);
      if (forcedQuestion) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await sendEmpatheticResponse(phone, forcedQuestion);
        // FIX: Merge com a última mensagem assistant ao invés de criar
        // duas assistant consecutivas (causa erro 400 na Anthropic API)
        const lastEntry = conversationHistory[conversationHistory.length - 1];
        if (lastEntry && lastEntry.role === 'assistant') {
          lastEntry.content = lastEntry.content + '\n\n' + forcedQuestion;
        } else {
          conversationHistory.push({ role: 'assistant', content: forcedQuestion });
        }
        logger.info('🔄 Pergunta forçada enviada para campo:', fieldToAsk);
      }
    }

    const updatedQuestionnaireData = {
      conversation: conversationHistory,
      extractedData: mergedData,
      completed: isActuallyComplete,
      conversationPhase: isActuallyComplete ? 'completed' : 'in_progress',
    };

    // 8. Salvar no banco (incluindo campos dedicados de dor para gráficos)
    // USAR ?? ao invés de || para aceitar valor 0
    const painAtRestValue = mergedData.pain ?? mergedData.painAtRest ?? null;
    const painDuringBowelValue = mergedData.painDuringBowelMovement ?? null;
    const bleedingValue = mergedData.bleeding && mergedData.bleeding !== 'none' ? true : (mergedData.bleeding === 'none' ? false : undefined);
    const feverValue = mergedData.fever ?? mergedData.hasFever ?? undefined;

    if (response) {
      await prisma.followUpResponse.update({
        where: { id: response.id },
        data: {
          questionnaireData: JSON.stringify(updatedQuestionnaireData),
          ...(painAtRestValue !== null && painAtRestValue !== undefined ? { painAtRest: painAtRestValue } : {}),
          ...(painDuringBowelValue !== null && painDuringBowelValue !== undefined ? { painDuringBowel: painDuringBowelValue } : {}),
          ...(bleedingValue !== undefined ? { bleeding: bleedingValue } : {}),
          ...(feverValue !== undefined ? { fever: feverValue } : {}),
        },
      });

      await prisma.followUp.update({
        where: { id: followUp.id },
        data: { updatedAt: new Date() }
      });
    } else {
      await prisma.followUpResponse.create({
        data: {
          followUpId: followUp.id,
          userId: patient.userId,
          questionnaireData: JSON.stringify(updatedQuestionnaireData),
          riskLevel: 'low',
          ...(painAtRestValue !== null && painAtRestValue !== undefined ? { painAtRest: painAtRestValue } : {}),
          ...(painDuringBowelValue !== null && painDuringBowelValue !== undefined ? { painDuringBowel: painDuringBowelValue } : {}),
          ...(bleedingValue !== undefined ? { bleeding: bleedingValue } : {}),
          ...(feverValue !== undefined ? { fever: feverValue } : {}),
        },
      });
    }

    // 9. Se REALMENTE completou (validado server-side), finalizar
    if (isActuallyComplete) {
      await finalizeQuestionnaireWithAI(followUp, patient, phone, mergedData as any, response?.id || '');
    } else if (aiResult.isComplete && updatedMissingFields.length > 0) {
      logger.info('🔄 Forçando continuação: faltam campos', updatedMissingFields);
    }

    // 10. Alertar médico se urgência alta
    if (aiResult.needsDoctorAlert) {
      logger.warn('🚨 Alerta de urgência detectado!', { urgencyLevel: aiResult.urgencyLevel });
    }

  } catch (error) {
    logger.error('❌ Erro ao processar resposta com Claude:', error);
    try {
      await sendEmpatheticResponse(
        phone,
        `Desculpe, ${patient.name.split(' ')[0]}, tive um probleminha técnico. 😅\n\nPode repetir sua última resposta? Estou pronta para continuar!`
      );
    } catch (sendError) {
      logger.error('❌ ERRO CRÍTICO: Falha ao enviar mensagem de erro para paciente:', sendError);
      try {
        await sendEmpatheticResponse(phone, 'Desculpe, tive um erro. Pode repetir sua resposta?');
      } catch {
        logger.error('❌ ERRO FATAL: Impossível enviar qualquer mensagem para', phone);
      }
    }
  }
}

// ============================================
// FINALIZE QUESTIONNAIRE WITH AI ANALYSIS
// ============================================
async function finalizeQuestionnaireWithAI(
  followUp: any,
  patient: any,
  phone: string,
  extractedData: Partial<PostOpData>,
  responseId: string
) {
  try {
    logger.debug('🔄 Finalizando questionário com IA e analisando respostas...');

    // Registrar primeira evacuação se aplicável
    const hadBowelMovement = extractedData.hadBowelMovementSinceLastContact ?? (extractedData as any).bowelMovementSinceLastContact;
    if (hadBowelMovement && !followUp.surgery.hadFirstBowelMovement) {
      const { recordFirstBowelMovement } = await import('@/lib/bowel-movement-tracker');
      await recordFirstBowelMovement(
        followUp.surgeryId,
        followUp.dayNumber,
        extractedData.painDuringBowelMovement || 0,
        new Date(),
        extractedData.bowelMovementTime || undefined
      );
      logger.debug('✅ Primeira evacuação registrada!');
    }

    // Converter PostOpData para QuestionnaireData
    const bleedingMap: Record<string, 'none' | 'light' | 'moderate' | 'severe'> = {
      'none': 'none', 'mild': 'light', 'moderate': 'moderate', 'severe': 'severe',
    };

    // USAR ?? ao invés de || para aceitar valor 0
    const questionnaireData = {
      painLevel: extractedData.painAtRest ?? extractedData.painLevel ?? (extractedData as any).pain,
      painAtRest: extractedData.painAtRest ?? (extractedData as any).pain,
      painDuringBowelMovement: extractedData.painDuringBowelMovement ?? (extractedData as any).painDuringBowelMovement,
      fever: extractedData.hasFever ?? (extractedData as any).fever,
      urinaryRetention: extractedData.canUrinate === false,
      bowelMovement: extractedData.hadBowelMovementSinceLastContact ?? (extractedData as any).bowelMovementSinceLastContact ?? extractedData.hadBowelMovement,
      bowelMovementTime: extractedData.bowelMovementTime,
      bleeding: typeof extractedData.bleeding === 'string'
        ? bleedingMap[extractedData.bleeding]
        : (extractedData.bleeding ? 'light' : 'none'),
      concerns: extractedData.otherSymptoms || '',
    };

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
      detectedRedFlags: [],
    });

    const allRedFlags = aiAnalysis.additionalRedFlags;
    const finalRiskLevel = aiAnalysis.riskLevel;

    // Atualizar resposta no banco
    if (responseId) {
      await prisma.followUpResponse.update({
        where: { id: responseId },
        data: {
          aiAnalysis: JSON.stringify(aiAnalysis),
          aiResponse: aiAnalysis.empatheticResponse,
          riskLevel: finalRiskLevel,
          redFlags: JSON.stringify(allRedFlags),
          painAtRest: extractedData.painAtRest ?? (extractedData as any).pain ?? null,
          painDuringBowel: extractedData.painDuringBowelMovement ?? (extractedData as any).painDuringBowelMovement ?? null,
          bleeding: extractedData.bleeding && extractedData.bleeding !== 'none' ? true : false,
          fever: extractedData.hasFever,
        },
      });
    } else {
      const newResponse = await prisma.followUpResponse.create({
        data: {
          followUpId: followUp.id,
          userId: patient.userId,
          questionnaireData: JSON.stringify(extractedData),
          aiAnalysis: JSON.stringify(aiAnalysis),
          aiResponse: aiAnalysis.empatheticResponse,
          riskLevel: finalRiskLevel,
          redFlags: JSON.stringify(allRedFlags),
          painAtRest: extractedData.painAtRest ?? (extractedData as any).pain ?? null,
          painDuringBowel: extractedData.painDuringBowelMovement ?? (extractedData as any).painDuringBowelMovement ?? null,
          bleeding: extractedData.bleeding && extractedData.bleeding !== 'none' ? true : false,
          fever: extractedData.hasFever,
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

    // Auto-complete surgery quando D+14 é respondido
    if (followUp.dayNumber >= 14) {
      await prisma.surgery.update({
        where: { id: followUp.surgeryId },
        data: { status: 'completed' }
      });
      logger.info(`✅ Surgery ${followUp.surgeryId} marked as completed (D+${followUp.dayNumber} responded)`);
    }

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
        allRedFlags,
        patient.userId
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

    // Relatório final no D+14
    if (followUp.dayNumber === 14) {
      try {
        logger.debug('📋 D+14 concluído - gerando relatório final...');

        const doctor = await prisma.user.findUnique({
          where: { id: patient.userId },
          select: { whatsapp: true, nomeCompleto: true }
        });

        if (doctor?.whatsapp) {
          const fullPatient = await prisma.patient.findUnique({
            where: { id: patient.id },
            select: { researchGroup: true }
          });

          const allFollowUps = await prisma.followUp.findMany({
            where: { surgeryId: followUp.surgeryId, status: 'responded' },
            include: { responses: true },
            orderBy: { dayNumber: 'asc' }
          });

          const painTrajectory: Array<{ day: number; painAtRest: number | null; painDuringBowel: number | null }> = [];
          let maxPainAtRest = 0;
          let totalPainAtRest = 0;
          let countPainAtRest = 0;
          let peakPainDay = 1;
          const complications: string[] = [];

          for (const fu of allFollowUps) {
            const resp = fu.responses[0];
            if (resp) {
              const data = resp.questionnaireData ? JSON.parse(resp.questionnaireData) : {};
              const extracted = data.extractedData || data;
              const painAtRest = extracted.painAtRest ?? extracted.painLevel ?? null;
              const painDuringBowel = extracted.painDuringBowelMovement ?? null;

              painTrajectory.push({ day: fu.dayNumber, painAtRest, painDuringBowel });

              if (painAtRest !== null) {
                totalPainAtRest += painAtRest;
                countPainAtRest++;
                if (painAtRest > maxPainAtRest) {
                  maxPainAtRest = painAtRest;
                  peakPainDay = fu.dayNumber;
                }
              }

              if (extracted.hasFever) complications.push(`Febre D+${fu.dayNumber}`);
              if (extracted.bleeding === 'severe' || extracted.bleeding === 'moderate') {
                complications.push(`Sangramento ${extracted.bleeding} D+${fu.dayNumber}`);
              }
              if (extracted.hasPurulentDischarge) {
                complications.push(`Secreção purulenta D+${fu.dayNumber}`);
              }
            }
          }

          const satisfaction = {
            painControlSatisfaction: extractedData.painControlSatisfaction,
            aiFollowUpSatisfaction: extractedData.aiFollowUpSatisfaction,
            npsScore: extractedData.npsScore,
            feedback: extractedData.feedback
          };

          const { sendFinalReport } = await import('@/lib/whatsapp');
          await sendFinalReport(doctor.whatsapp, {
            patientName: patient.name,
            surgeryType: followUp.surgery.type,
            surgeryDate: followUp.surgery.date,
            researchGroup: fullPatient?.researchGroup || undefined,
            painTrajectory,
            firstBowelMovementDay: followUp.surgery.firstBowelMovementDay,
            firstBowelMovementTime: followUp.surgery.firstBowelMovementTime || undefined,
            maxPainAtRest,
            avgPainAtRest: countPainAtRest > 0 ? totalPainAtRest / countPainAtRest : 0,
            peakPainDay,
            complications,
            adherenceRate: (allFollowUps.length / 7) * 100,
            completedFollowUps: allFollowUps.length,
            totalFollowUps: 7,
            satisfaction
          });

          logger.debug('✅ Relatório final enviado para o médico');
        } else {
          logger.warn('⚠️ Médico sem WhatsApp cadastrado - relatório final não enviado');
        }
      } catch (reportError) {
        logger.error('❌ Erro ao enviar relatório final:', reportError);
      }
    }

    logger.debug(`✅ Questionário finalizado com sucesso para ${patient.name}`);

  } catch (error) {
    logger.error('Error finalizing questionnaire with AI:', error);
    await sendEmpatheticResponse(
      phone,
      'Obrigado. Registrei suas informações. Se tiver alguma dúvida ou sintoma forte, entre em contato.'
    );
  }
}

// ============================================
// FIND PATIENT BY PHONE (SQL + fallback)
// ============================================
async function findPatientByPhone(phone: string): Promise<any | null> {
  const normalizedPhone = phone.replace(/\D/g, '');

  logger.debug('🔍 Buscando paciente', {
    phoneOriginal: phone,
    phoneNormalized: normalizedPhone,
  });

  const last11 = normalizedPhone.slice(-11);
  const last9 = normalizedPhone.slice(-9);
  const last8 = normalizedPhone.slice(-8);

  try {
    const result = await prisma.$queryRaw`
      SELECT p.id, p.name, p.phone, p."userId", p."researchId", p."researchGroup", u."nomeCompleto" as "doctorName"
      FROM "Patient" p
      JOIN "User" u ON p."userId" = u.id
      WHERE p."isActive" = true
      AND (
        REGEXP_REPLACE(p.phone, '[^0-9]', '', 'g') LIKE ${`%${last11}%`}
        OR REGEXP_REPLACE(p.phone, '[^0-9]', '', 'g') LIKE ${`%${last9}%`}
        OR REGEXP_REPLACE(p.phone, '[^0-9]', '', 'g') LIKE ${`%${last8}%`}
      )
      LIMIT 1
    ` as any[];

    if (result && result.length > 0) {
      logger.debug('✅ Paciente encontrado via SQL', {
        patientId: result[0].id,
        patientName: result[0].name,
      });
      return result[0];
    }

    logger.warn('⚠️ SQL não encontrou paciente, tentando fallback JavaScript...');
  } catch (error) {
    logger.error('❌ Erro na busca SQL:', error);
  }

  // Fallback: buscar todos e filtrar manualmente
  try {
    const allPatients = await prisma.patient.findMany({
      where: { isActive: true },
      select: {
        id: true, name: true, phone: true, userId: true,
        researchId: true, researchGroup: true,
        user: { select: { nomeCompleto: true } }
      }
    });

    for (const p of allPatients) {
      const pDigits = p.phone.replace(/\D/g, '');
      if (pDigits.includes(last11) || pDigits.includes(last9) || pDigits.includes(last8)) {
        logger.debug('✅ Paciente encontrado via fallback', { patientId: p.id, patientName: p.name });
        return { ...p, doctorName: p.user?.nomeCompleto };
      }
    }

    logger.error('❌ Paciente NÃO encontrado após SQL + fallback', { phone: normalizedPhone });
    return null;
  } catch (fallbackError) {
    logger.error('❌ Erro fatal no fallback:', fallbackError);
    return null;
  }
}

// ============================================
// FIND PENDING FOLLOW-UP (with Brasília timezone)
// ============================================
async function findPendingFollowUp(patientId: string): Promise<any | null> {
  const todayStart = startOfDayBrasilia();
  const todayEnd = endOfDayBrasilia();

  logger.debug('🔍 Buscando follow-up para HOJE', {
    patientId,
    todayStart: todayStart.toISOString(),
    todayEnd: todayEnd.toISOString(),
  });

  // 1. MÁXIMA PRIORIDADE: Follow-up já enviado (sent/in_progress)
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const activeFollowUp = await prisma.followUp.findFirst({
    where: {
      patientId,
      status: { in: ['sent', 'in_progress'] },
      scheduledDate: {
        gte: yesterdayStart,
        lte: todayEnd,
      },
    },
    include: { surgery: true },
    orderBy: { scheduledDate: 'desc' },
  });

  if (activeFollowUp) {
    logger.debug('✅ Follow-up ativo encontrado', {
      followUpId: activeFollowUp.id,
      dayNumber: activeFollowUp.dayNumber,
    });
    return activeFollowUp;
  }

  // 2. Fallback: pendente programado para hoje
  const pendingFollowUp = await prisma.followUp.findFirst({
    where: {
      patientId,
      status: 'pending',
      scheduledDate: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    include: { surgery: true },
    orderBy: { scheduledDate: 'asc' },
  });

  if (pendingFollowUp) {
    logger.debug('✅ Follow-up pendente encontrado para HOJE', {
      followUpId: pendingFollowUp.id,
      dayNumber: pendingFollowUp.dayNumber,
    });
    return pendingFollowUp;
  }

  logger.debug('⚠️ Nenhum follow-up programado para HOJE nem ONTEM', { patientId });
  return null;
}
