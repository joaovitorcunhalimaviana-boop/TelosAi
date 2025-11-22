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
    if ((textLower === 'sim' || textLower === 's' || textLower === 'sim!') && pendingFollowUp.status === 'sent') {
      logger.debug('✅ Iniciando questionário com IA conversacional...', {
        patientName: patient.name,
        followUpId: pendingFollowUp.id
      });

      // Criar uma resposta vazia para tracking
      await prisma.followUpResponse.create({
        data: {
          followUpId: pendingFollowUp.id,
          userId: patient.userId,
          questionnaireData: JSON.stringify({
            conversation: [],
            extractedData: {},
            completed: false
          }),
          riskLevel: 'low',
        },
      });

      // Atualizar follow-up para status "in_progress"
      await prisma.followUp.update({
        where: { id: pendingFollowUp.id },
        data: {
          status: 'in_progress',
        },
      });

      // Invalidate dashboard cache
      invalidateDashboardStats();

      // Iniciar conversa com IA (primeira mensagem do paciente é "sim")
      await processQuestionnaireAnswer(pendingFollowUp, patient, phone, text);

      return;
    }

    // Estado 2: Respondendo questionário interativo
    if (pendingFollowUp.status === 'in_progress') {
      await processQuestionnaireAnswer(pendingFollowUp, patient, phone, text);
      return;
    }

    // Estado 3: Mensagem fora de contexto
    console.log('⚠️ MENSAGEM FORA DE CONTEXTO - Enviando instrução para responder SIM');
    await sendEmpatheticResponse(
      phone,
      `Olá ${patient.name.split(' ')[0]}! 👋\n\n` +
      `Para iniciar o questionário pós-operatório, por favor responda com a palavra *"sim"*.\n\n` +
      `_(Versão do sistema: 2.0 - ${new Date().toLocaleTimeString('pt-BR')})_`
    );

  } catch (error) {
    logger.error('Error processing text message:', error);
  }
}

/**
 * URLs das Imagens Médicas
 */
const MEDICAL_IMAGES = {
  painScale: 'https://cdn.shopify.com/s/files/1/0679/5721/2746/files/escala-dor.jpg',
  bristolScale: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYj8vKBnZMOYxL5TZzLQwZQwZQwZQwZQw',
};

/**
 * Estrutura de dados pós-operatórios a serem coletados
 */
interface PostOpData {
  painLevel?: number; // 0-10
  hasFever?: boolean;
  feverDetails?: string;
  canUrinate?: boolean;
  urinationDetails?: string;
  hadBowelMovement?: boolean;
  bristolScale?: number; // 1-7
  bleeding?: 'none' | 'mild' | 'moderate' | 'severe';
  bleedingDetails?: string;
  canEat?: boolean;
  dietDetails?: string;
  otherSymptoms?: string;
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
  dayNumber: number
): Promise<ClaudeAIResponse> {
  try {
    const { anthropic } = await import('@/lib/anthropic');

    const SYSTEM_PROMPT = `Você é um assistente médico especializado em acompanhamento pós-operatório via WhatsApp.

OBJETIVO: Coletar informações sobre a recuperação do paciente de forma NATURAL e EMPÁTICA.

INFORMAÇÕES A COLETAR:
1. Nível de dor (0-10) - ENVIAR imagem da escala ANTES de perguntar
2. Presença de febre (sim/não + detalhes se sim)
3. Capacidade de urinar normalmente (sim/não + detalhes se não)
4. Evacuação (sim/não + escala Bristol de 1-7 se sim) - ENVIAR imagem da escala Bristol ANTES
5. Sangramento (nenhum/leve/moderado/intenso + detalhes)
6. Alimentação (conseguindo comer? + detalhes)
7. Outros sintomas preocupantes

REGRAS IMPORTANTES:
- Seja CONVERSACIONAL e EMPÁTICO, não robótico
- Explique termos médicos se o paciente perguntar (ex: "sangramento leve é apenas manchas")
- Peça esclarecimentos se a resposta for ambígua
- NÃO repita perguntas já respondidas
- Sinalize quando precisa enviar imagens (needsImage: "pain_scale" ou "bristol_scale")
- Ao coletar todas as informações, agradeça e finalize (completed: true)
- Se o paciente tem dúvida, responda ANTES de avançar (needsClarification: true)

CONTEXTO DO PACIENTE:
- Nome: ${patient.name}
- Cirurgia: ${surgeryType}
- Dia pós-operatório: D+${dayNumber}

FORMATO DE RESPOSTA (RETORNE APENAS JSON VÁLIDO):
{
  "message": "mensagem empática para o paciente",
  "needsImage": "pain_scale" | "bristol_scale" | null,
  "dataCollected": {
    "painLevel": number ou null,
    "hasFever": boolean ou null,
    "feverDetails": string ou null,
    "canUrinate": boolean ou null,
    "urinationDetails": string ou null,
    "hadBowelMovement": boolean ou null,
    "bristolScale": number ou null,
    "bleeding": "none" | "mild" | "moderate" | "severe" ou null,
    "bleedingDetails": string ou null,
    "canEat": boolean ou null,
    "dietDetails": string ou null,
    "otherSymptoms": string ou null
  },
  "completed": boolean,
  "needsClarification": boolean,
  "conversationPhase": "greeting | collecting_pain | collecting_fever | ... | completed"
}`;

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
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      temperature: 0.7, // Mais conversacional
      system: SYSTEM_PROMPT,
      messages,
    });

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    logger.debug('🤖 Claude raw response:', responseText);

    // Parse JSON response
    const aiResponse: ClaudeAIResponse = JSON.parse(responseText);

    logger.debug('✅ Claude response parsed:', {
      completed: aiResponse.completed,
      needsImage: aiResponse.needsImage,
      phase: aiResponse.conversationPhase,
    });

    return aiResponse;
  } catch (error) {
    logger.error('❌ Erro ao chamar Claude API:', error);

    // Fallback response
    return {
      message: 'Desculpe, tive um problema técnico. Pode repetir sua última resposta?',
      needsImage: null,
      dataCollected: {},
      completed: false,
      needsClarification: false,
    };
  }
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

    // 2. Chamar Claude API
    const aiResponse = await callClaudeAPI(
      conversationHistory,
      message,
      patient,
      followUp.surgery.type,
      followUp.dayNumber
    );

    // 3. Se precisa enviar imagem, enviar ANTES da resposta
    if (aiResponse.needsImage) {
      await sendImageScale(phone, aiResponse.needsImage);
      // Pequeno delay para garantir ordem das mensagens
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 4. Enviar resposta da IA
    await sendEmpatheticResponse(phone, aiResponse.message);

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

    // Converter PostOpData para QuestionnaireData (formato esperado pela análise)
    // Mapear 'mild' para 'light' para compatibilidade com red-flags
    const bleedingMap: Record<string, 'none' | 'light' | 'moderate' | 'severe'> = {
      'none': 'none',
      'mild': 'light',
      'moderate': 'moderate',
      'severe': 'severe',
    };

    const questionnaireData = {
      painLevel: extractedData.painLevel,
      fever: extractedData.hasFever,
      urinaryRetention: extractedData.canUrinate === false,
      bowelMovement: extractedData.hadBowelMovement,
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
      scheduledDate: 'desc',
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
