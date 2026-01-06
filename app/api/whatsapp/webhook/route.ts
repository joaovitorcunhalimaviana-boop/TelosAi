/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { invalidateDashboardStats } from '@/lib/cache-helpers';
import { detectRedFlags, getRiskLevel } from '@/lib/red-flags';
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
  validatePostOpData,
  validatePostOpDataByDay,
  parseJSONSafely,
} from '@/lib/api-validation';
import { findApplicableProtocols, formatProtocolsForPrompt } from '@/lib/protocols';
import { analyzePatientMessageWithGemini } from '@/lib/gemini';

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

// Simple in-memory deduplication for the same serverless instance
const processedMessageIds = new Set<string>();

/**
 * Processa mensagens recebidas
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processMessages(value: any) {
  const messages = value.messages || [];

  for (const message of messages) {
    // Ignorar mensagens enviadas por nós (apenas processar recebidas)
    if (message.from === value.metadata?.phone_number_id) {
      continue;
    }

    // DEDUPLICAÇÃO ROBUSTA (Banco de Dados + Memória)
    try {
      // 1. Verificar memória (rápido)
      if (processedMessageIds.has(message.id)) {
        logger.debug(`Duplicate message ignored (memory): ${message.id}`);
        continue;
      }

      // 2. Verificar banco de dados (persistente entre retries)
      const existing = await prisma.processedMessage.findUnique({
        where: { id: message.id }
      });

      if (existing) {
        logger.debug(`Duplicate message ignored (db): ${message.id}`);
        processedMessageIds.add(message.id); // Atualizar memória
        continue;
      }

      // 3. Registrar processamento
      await prisma.processedMessage.create({
        data: { id: message.id }
      });
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
      // Em caso de erro no banco, continuar processamento mas logar
    }

    // Marcar como lida
    await markAsRead(message.id).catch(err =>
      logger.error('Error marking as read:', err)
    );

    // Processar baseado no tipo de mensagem
    // Processar baseado no tipo de mensagem
    if (message.type === 'text') {
      await processTextMessage(message);
    } else if (message.type === 'interactive') {
      await processInteractiveMessage(message);
    } else if (['audio', 'image', 'video', 'document', 'sticker', 'location', 'contacts'].includes(message.type)) {
      // Mensagens não-texto: orientar paciente a escrever
      await processUnsupportedMessage(message);
    } else {
      logger.debug(`Message type ${message.type} not handled`);
    }
  }
}

/**
 * Processa mensagens não suportadas (áudio, imagem, vídeo, etc.)
 * Orienta o paciente a enviar mensagem de texto escrito
 */
async function processUnsupportedMessage(message: any) {
  try {
    const phone = message.from;
    const messageType = message.type;

    logger.debug(`Processing unsupported message type from ${phone}: ${messageType}`);

    // Encontrar paciente pelo telefone
    const patient = await findPatientByPhone(phone);

    // Mensagem personalizada baseada no tipo
    let typeDescription = '';
    switch (messageType) {
      case 'audio':
        typeDescription = 'áudio';
        break;
      case 'image':
        typeDescription = 'imagem';
        break;
      case 'video':
        typeDescription = 'vídeo';
        break;
      case 'document':
        typeDescription = 'documento';
        break;
      case 'sticker':
        typeDescription = 'figurinha';
        break;
      case 'location':
        typeDescription = 'localização';
        break;
      case 'contacts':
        typeDescription = 'contato';
        break;
      default:
        typeDescription = 'este tipo de mensagem';
    }

    const firstName = patient ? patient.name.split(' ')[0] : '';
    const greeting = firstName ? `${firstName}, ` : '';

    const orientationMessage = `${greeting}recebi seu ${typeDescription}, mas infelizmente não consigo processar esse tipo de mensagem.

Por favor, *escreva sua resposta em texto* para que eu possa registrar corretamente.

Se precisar informar algo sobre sua recuperação, digite a resposta por escrito.`;

    await sendEmpatheticResponse(phone, orientationMessage);

    logger.debug(`✅ Orientação enviada para ${phone} sobre mensagem tipo ${messageType}`);

  } catch (error) {
    logger.error('Error processing unsupported message:', error);
  }
}

/**
 * Processa mensagem de texto
 */
async function processTextMessage(message: any) {
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

    if (isPositiveResponse && (pendingFollowUp.status === 'sent' || pendingFollowUp.status === 'pending')) {
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
      // Mensagem inicial de saudação + pergunta sobre dor EM REPOUSO
      const initialMessage = `Olá ${firstName}! 👋
      
Vamos atualizar como você está hoje, no seu *${daysPostOp}º dia* pós-cirurgia.

Para começar: *quanto está doendo agora, quando você está parado(a)?*

Por favor, me diga um número de 0 a 10, onde:
0️⃣ = **Zero dor** (totalmente sem dor)
🔟 = **Pior dor da vida** (insuportável)`;

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

  // EVACUAÇÃO - dados detalhados
  hadBowelMovementSinceLastContact?: boolean; // Evacuou desde última conversa?
  bowelMovementTime?: string; // Hora aproximada da evacuação (para primeira evacuação)
  bristolScale?: number; // 1-7 - Escala de Bristol (APENAS D+5 e D+10)
  isFirstBowelMovement?: boolean; // Flag se é a primeira evacuação pós-op

  // SANGRAMENTO
  bleeding?: 'none' | 'mild' | 'moderate' | 'severe';
  bleedingDetails?: string;

  // ANALGÉSICOS - esquema de medicação para dor
  takingPrescribedMeds?: boolean; // Está tomando as medicações prescritas?
  prescribedMedsDetails?: string; // Detalhes sobre as medicações prescritas
  takingExtraMeds?: boolean; // Precisou tomar algo ALÉM do prescrito?
  extraMedsDetails?: string; // Quais medicações extras está tomando

  // SECREÇÃO PURULENTA (apenas D+3 em diante)
  hasPurulentDischarge?: boolean; // Tem saída de secreção purulenta?
  purulentDischargeDetails?: string;

  // OUTROS
  otherSymptoms?: string;

  // PESQUISA DE SATISFAÇÃO (apenas D+14)
  painControlSatisfaction?: number; // 0-10 - Satisfação com controle da dor
  aiFollowUpSatisfaction?: number; // 0-10 - Satisfação com acompanhamento IA
  npsScore?: number; // 0-10 - Net Promoter Score (recomendaria?)
  feedback?: string; // Feedback aberto opcional

  // Campos legados (manter para compatibilidade)
  painLevel?: number; // Mapeado para painAtRest
  hadBowelMovement?: boolean; // Mapeado para hadBowelMovementSinceLastContact
  canEat?: boolean; // Legado - não usar mais
  dietDetails?: string; // Legado - não usar mais
  canUrinate?: boolean; // Legado - removido do fluxo
  urinationDetails?: string; // Legado - removido do fluxo
}

/**
 * Resposta da IA Claude
 */
interface ClaudeAIResponse {
  reasoning?: string; // NOVO: Raciocínio (Chain of Thought)
  message: string;
  needsImage?: 'pain_scale' | 'bristol_scale' | null;
  dataCollected: Partial<PostOpData>;
  completed: boolean;
  needsClarification: boolean;
  conversationPhase?: string;
}

/**
 * Envia imagem de escala (Dor ou Bristol)
 */
async function sendImageScale(phone: string, scaleType: 'pain_scale' | 'bristol_scale') {
  try {
    const captions = {
      pain_scale: '📊 *Escala de Dor*\n\nPor favor, indique um número de 0 a 10.',
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
 * Chama Claude API para conversação inteligente com CHECKLIST DINÂMICO
 */
// Função legada callClaudeAPI removida.

// Funções legadas (determineCurrentPhase, interpretResponseLocally) removidas em favor da integração com Gemini 100%.

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
    logger.debug('🔄 Processando resposta com IA Gemini...', {
      patientId: patient.id,
      followUpId: followUp.id,
      message: message.substring(0, 100),
    });

    // 1. Buscar histórico de conversas
    const response = await prisma.followUpResponse.findFirst({
      where: { followUpId: followUp.id },
      orderBy: { createdAt: 'desc' },
    });

    // Validar dados do questionário do banco
    const rawQuestionnaireData = parseJSONSafely(response?.questionnaireData, {
      conversation: [],
      extractedData: {},
      completed: false,
    });
    const questionnaireData = validateQuestionnaireData(rawQuestionnaireData);

    const conversationHistory = questionnaireData.conversation || [];

    // Se já completou, NÃO reiniciar questionário
    if (questionnaireData.completed) {
      await sendEmpatheticResponse(
        phone,
        `Olá ${patient.name.split(' ')[0]}! Você já completou o questionário de hoje. ` +
        'Se tiver alguma preocupação adicional, entre em contato diretamente com o consultório.'
      );
      return;
    }

    // 2. Definir Checklist Dinâmico
    const currentData = questionnaireData.extractedData || {};
    const requiredFields = [
      'painAtRest',
      'hadBowelMovementSinceLastContact',
      'takingPrescribedMeds',
      'bleeding'
    ];

    // Regras condicionais para o checklist
    if (currentData.painAtRest !== undefined && Number(currentData.painAtRest) > 5) {
      if (currentData.hasFever === undefined) requiredFields.push('hasFever');
    }
    if (currentData.takingExtraMeds === true) {
      if (!currentData.extraMedsDetails) requiredFields.push('extraMedsDetails');
    }
    if (currentData.bleeding && currentData.bleeding !== 'none') {
      if (!currentData.bleedingDetails) requiredFields.push('bleedingDetails');
    }

    // Identificar campos faltantes
    const missingFields = requiredFields.filter(f => currentData[f] === undefined || currentData[f] === null);

    // 3. Buscar protocolos aplicáveis
    const protocols = await findApplicableProtocols(
      patient.userId,
      followUp.surgery.type,
      followUp.dayNumber,
      patient.researchId
    );
    const protocolText = formatProtocolsForPrompt(protocols);

    // 4. CHAMAR GEMINI
    const aiResponse = await analyzePatientMessageWithGemini(
      conversationHistory,
      message,
      {
        name: patient.name,
        surgeryType: followUp.surgery.type,
        dayNumber: followUp.dayNumber,
        doctorName: patient.doctorName
      },
      {
        required: requiredFields,
        missing: missingFields,
        collected: currentData
      },
      protocolText
    );

    // 5. Enviar resposta da IA
    await sendEmpatheticResponse(phone, aiResponse.message);

    if (aiResponse.needsImage) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await sendImageScale(phone, aiResponse.needsImage);
    }

    // 6. Atualizar histórico e dados
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse.message }
    );

    const mergedData = {
      ...currentData,
      ...aiResponse.dataCollected,
    };

    const updatedQuestionnaireData = {
      conversation: conversationHistory,
      extractedData: mergedData,
      completed: aiResponse.completed,
      conversationPhase: aiResponse.completed ? 'completed' : 'in_progress', // Simplificado
    };

    // 7. Salvar no banco
    if (response) {
      await prisma.followUpResponse.update({
        where: { id: response.id },
        data: { questionnaireData: JSON.stringify(updatedQuestionnaireData) },
      });

      // Atualizar timestamp do FollowUp para indicar atividade (para o Nudge)
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
        },
      });
    }

    // 8. Se completou, finalizar
    if (aiResponse.completed) {
      await finalizeQuestionnaireWithAI(followUp, patient, phone, mergedData, response?.id || '');
    }

  } catch (error) {
    logger.error('❌ Erro ao processar resposta com Gemini:', error);
    await sendEmpatheticResponse(phone, 'Tive um erro ao processar. Pode responder novamente?');
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
        extractedData.bristolScale || 4, // Default Bristol 4 (normal)
        new Date(),
        extractedData.bowelMovementTime || undefined
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

    // Analisar com Claude AI (Substituindo lógica determinística por IA completa)
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
      detectedRedFlags: [], // IA fará a detecção completa
    });

    // Red flags agora vêm exclusivamente da análise da IA
    const allRedFlags = aiAnalysis.additionalRedFlags;

    // Nível de risco determinado pela IA
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

    // ============================================
    // ENVIAR RELATÓRIO FINAL NO D+14
    // ============================================
    if (followUp.dayNumber === 14) {
      try {
        logger.debug('📋 D+14 concluído - gerando relatório final...');

        // Buscar dados do médico
        const doctor = await prisma.user.findUnique({
          where: { id: patient.userId },
          select: { whatsapp: true, nomeCompleto: true }
        });

        if (doctor?.whatsapp) {
          // Buscar dados completos do paciente (incluindo researchGroup)
          const fullPatient = await prisma.patient.findUnique({
            where: { id: patient.id },
            select: { researchGroup: true }
          });

          // Buscar todos os follow-ups do paciente para trajetória de dor
          const allFollowUps = await prisma.followUp.findMany({
            where: {
              surgeryId: followUp.surgeryId,
              status: 'responded'
            },
            include: {
              responses: true
            },
            orderBy: { dayNumber: 'asc' }
          });

          // Construir trajetória de dor
          const painTrajectory: Array<{ day: number; painAtRest: number | null; painDuringBowel: number | null }> = [];
          let maxPainAtRest = 0;
          let totalPainAtRest = 0;
          let countPainAtRest = 0;
          let peakPainDay = 1;
          const complications: string[] = [];

          for (const fu of allFollowUps) {
            const response = fu.responses[0];
            if (response) {
              const data = response.questionnaireData ? JSON.parse(response.questionnaireData) : {};
              const extracted = data.extractedData || data;

              const painAtRest = extracted.painAtRest ?? extracted.painLevel ?? null;
              const painDuringBowel = extracted.painDuringBowelMovement ?? null;

              painTrajectory.push({
                day: fu.dayNumber,
                painAtRest,
                painDuringBowel
              });

              if (painAtRest !== null) {
                totalPainAtRest += painAtRest;
                countPainAtRest++;
                if (painAtRest > maxPainAtRest) {
                  maxPainAtRest = painAtRest;
                  peakPainDay = fu.dayNumber;
                }
              }

              // Verificar complicações
              if (extracted.hasFever) complications.push(`Febre D+${fu.dayNumber}`);
              if (extracted.bleeding === 'severe' || extracted.bleeding === 'moderate') {
                complications.push(`Sangramento ${extracted.bleeding} D+${fu.dayNumber}`);
              }
              if (extracted.hasPurulentDischarge) {
                complications.push(`Secreção purulenta D+${fu.dayNumber}`);
              }
            }
          }

          // Dados de satisfação do D+14
          const satisfaction = {
            painControlSatisfaction: extractedData.painControlSatisfaction,
            aiFollowUpSatisfaction: extractedData.aiFollowUpSatisfaction,
            npsScore: extractedData.npsScore,
            feedback: extractedData.feedback
          };

          // Importar e chamar sendFinalReport
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
            adherenceRate: (allFollowUps.length / 7) * 100, // 7 follow-ups esperados
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

/**
 * Processa mensagem interativa (botões/listas)
 */
async function processInteractiveMessage(message: any) {
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
    // Processar como mensagem de texto
    await processTextMessage({ from: phone, text: { body: response } });

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      const patient = result[0];
      logger.debug('✅ Paciente encontrado via SQL', {
        patientId: patient.id,
        patientName: patient.name,
        patientPhone: patient.phone,
        userId: patient.userId,
        researchId: patient.researchId,
        doctorName: patient.doctorName
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
      select: {
        id: true,
        name: true,
        phone: true,
        userId: true,
        researchId: true,
        researchGroup: true,
        user: {
          select: { nomeCompleto: true }
        }
      }
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
          userId: patient.userId,
          doctorName: patient.user?.nomeCompleto
        })

        return {
          ...patient,
          doctorName: patient.user?.nomeCompleto
        }
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findPendingFollowUp(patientId: string): Promise<any | null> {
  // 1. Prioridade: Buscar follow-up ATIVO (sent ou in_progress)
  const activeFollowUp = await prisma.followUp.findFirst({
    where: {
      patientId,
      status: {
        in: ['sent', 'in_progress'],
      },
    },
    include: {
      surgery: true,
    },
    orderBy: {
      scheduledDate: 'desc', // Se houver múltiplos ativos (erro?), pega o mais recente
    },
  });

  if (activeFollowUp) {
    return activeFollowUp;
  }

  // 2. Fallback: Buscar follow-up PENDENTE (se houver, mas não deveria bloquear o fluxo)
  // Se retornarmos um pending aqui, ele vai cair no "No pending follow-up found" lá em cima se não tratarmos?
  // Na verdade, o código chamador verifica o status.
  const pendingFollowUp = await prisma.followUp.findFirst({
    where: {
      patientId,
      status: 'pending',
    },
    include: {
      surgery: true,
    },
    orderBy: {
      scheduledDate: 'asc', // Priorizar o mais antigo não respondido
    },
  });

  return pendingFollowUp;
}



