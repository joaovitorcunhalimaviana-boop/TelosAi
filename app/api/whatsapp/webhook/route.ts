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
  // Rate limiting: 100 req/min por IP
  const ip = getClientIP(request);
  const rateLimitResult = await rateLimit(ip, 100, 60);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.reset?.toString() || '',
        }
      }
    );
  }

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
    // Rate limiting: 100 req/min por IP
    const ip = getClientIP(request);
    const rateLimitResult = await rateLimit(ip, 100, 60);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset?.toString() || '',
          }
        }
      );
    }

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

    // Verificar se é início do questionário (resposta "sim" ao template)
    const textLower = text.toLowerCase().trim();

    logger.debug('📋 Checking if should start questionnaire', {
      textLower,
      isSimResponse: textLower === 'sim' || textLower === 's' || textLower === 'sim!',
      followUpStatus: pendingFollowUp.status
    });

    // Estado 1: Resposta "sim" ao template inicial
    if ((textLower === 'sim' || textLower === 's' || textLower === 'sim!') && pendingFollowUp.status === 'sent') {
      logger.debug('✅ Iniciando questionário interativo...', {
        patientName: patient.name,
        followUpId: pendingFollowUp.id
      });

      // Criar uma resposta vazia para tracking
      const response = await prisma.followUpResponse.create({
        data: {
          followUpId: pendingFollowUp.id,
          userId: patient.userId,
          questionnaireData: JSON.stringify({ answers: [], currentQuestion: 1 }),
          riskLevel: 'low',
        },
      });

      // Enviar primeira pergunta
      await sendQuestionByNumber(phone, patient, 1);

      // Atualizar follow-up para status "in_progress"
      await prisma.followUp.update({
        where: { id: pendingFollowUp.id },
        data: {
          status: 'in_progress', // NOVO STATUS
        },
      });

      // Invalidate dashboard cache (nova resposta de follow-up)
      invalidateDashboardStats();

      return;
    }

    // Estado 2: Respondendo questionário interativo
    if (pendingFollowUp.status === 'in_progress') {
      await processQuestionnaireAnswer(pendingFollowUp, patient, phone, text);
      return;
    }

    // Estado 3: Mensagem fora de contexto
    await sendEmpatheticResponse(
      phone,
      `Olá ${patient.name.split(' ')[0]}! Não entendi sua mensagem. ` +
      'Se você deseja iniciar o questionário, responda "sim".'
    );

  } catch (error) {
    logger.error('Error processing text message:', error);
  }
}

/**
 * Lista de perguntas do questionário
 */
const QUESTIONNAIRE_QUESTIONS = [
  {
    number: 1,
    question: 'Como está sua DOR hoje? (número de 0 a 10, onde 0 = sem dor e 10 = pior dor imaginável)',
    field: 'painLevel',
    type: 'number',
  },
  {
    number: 2,
    question: 'Você está com FEBRE? (responda sim ou não)',
    field: 'fever',
    type: 'boolean',
  },
  {
    number: 3,
    question: 'Está conseguindo URINAR normalmente? (responda sim ou não)',
    field: 'urination',
    type: 'boolean',
  },
  {
    number: 4,
    question: 'Já conseguiu EVACUAR (fazer cocô)? (responda sim ou não)',
    field: 'bowelMovement',
    type: 'boolean',
  },
  {
    number: 5,
    question: 'Tem algum SANGRAMENTO? (responda: nenhum, leve, moderado ou intenso)',
    field: 'bleeding',
    type: 'text',
  },
  {
    number: 6,
    question: 'Está conseguindo se ALIMENTAR bem? (responda sim ou não)',
    field: 'eating',
    type: 'boolean',
  },
  {
    number: 7,
    question: 'Tem alguma NÁUSEA ou VÔMITO? (responda sim ou não)',
    field: 'nausea',
    type: 'boolean',
  },
  {
    number: 8,
    question: 'Há algo mais que você gostaria de me contar sobre sua recuperação? (responda livremente ou "não")',
    field: 'concerns',
    type: 'text',
  },
];

/**
 * Envia pergunta específica por número
 */
async function sendQuestionByNumber(phone: string, patient: any, questionNumber: number) {
  const firstName = patient.name.split(' ')[0];
  const question = QUESTIONNAIRE_QUESTIONS.find(q => q.number === questionNumber);

  if (!question) {
    logger.error(`Pergunta ${questionNumber} não encontrada`);
    return;
  }

  const message = `📋 *Pergunta ${question.number} de ${QUESTIONNAIRE_QUESTIONS.length}*\n\n${question.question}`;

  await sendEmpatheticResponse(phone, message);
  logger.debug(`✅ Pergunta ${questionNumber} enviada para ${firstName}`);
}

/**
 * Processa resposta do questionário interativo
 */
async function processQuestionnaireAnswer(
  followUp: any,
  patient: any,
  phone: string,
  answer: string
) {
  try {
    // Buscar a resposta em andamento
    const existingResponse = await prisma.followUpResponse.findFirst({
      where: {
        followUpId: followUp.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!existingResponse) {
      logger.error('Resposta não encontrada');
      return;
    }

    // Parse dos dados atuais
    const data = JSON.parse(existingResponse.questionnaireData);
    const currentQuestion = data.currentQuestion || 1;

    // Validar e salvar resposta
    const question = QUESTIONNAIRE_QUESTIONS.find(q => q.number === currentQuestion);
    if (!question) {
      logger.error(`Pergunta ${currentQuestion} não encontrada`);
      return;
    }

    // Adicionar resposta
    data.answers.push({
      question: question.number,
      field: question.field,
      answer: answer,
    });

    logger.debug(`✅ Resposta ${currentQuestion} salva: ${answer}`);

    // Verificar se é a última pergunta
    if (currentQuestion >= QUESTIONNAIRE_QUESTIONS.length) {
      logger.debug('📊 Questionário completo! Finalizando...');
      await finalizeQuestionnaire(followUp, patient, phone, data.answers, existingResponse.id);
      return;
    }

    // Incrementar pergunta e salvar
    data.currentQuestion = currentQuestion + 1;

    await prisma.followUpResponse.update({
      where: { id: existingResponse.id },
      data: {
        questionnaireData: JSON.stringify(data),
      },
    });

    // Enviar próxima pergunta
    await sendQuestionByNumber(phone, patient, data.currentQuestion);

  } catch (error) {
    logger.error('Error processing questionnaire answer:', error);
    await sendEmpatheticResponse(
      phone,
      'Desculpe, houve um erro ao processar sua resposta. Por favor, tente novamente.'
    );
  }
}

/**
 * Finaliza o questionário e processa todas as respostas
 */
async function finalizeQuestionnaire(
  followUp: any,
  patient: any,
  phone: string,
  answers: any[],
  responseId: string
) {
  try {
    logger.debug('🔄 Finalizando questionário e analisando respostas...');

    // Converter respostas em formato estruturado
    const questionnaireData = convertAnswersToStructuredData(answers);

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
    await prisma.followUpResponse.update({
      where: { id: responseId },
      data: {
        questionnaireData: JSON.stringify(questionnaireData),
        aiAnalysis: JSON.stringify(aiAnalysis),
        aiResponse: aiAnalysis.empatheticResponse,
        riskLevel: finalRiskLevel,
        redFlags: JSON.stringify(allRedFlags),
      },
    });

    // Atualizar status do follow-up
    await prisma.followUp.update({
      where: { id: followUp.id },
      data: {
        status: 'responded',
        respondedAt: new Date(),
      },
    });

    // Invalidate dashboard cache (follow-up completado com análise de risco)
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
    logger.error('Error finalizing questionnaire:', error);
    await sendEmpatheticResponse(
      phone,
      'Obrigado por responder! Recebi suas informações e vou analisá-las com cuidado. ' +
      'Em caso de qualquer sintoma que te preocupe, não hesite em entrar em contato.'
    );
  }
}

/**
 * Converte array de respostas em dados estruturados
 */
function convertAnswersToStructuredData(answers: any[]): any {
  const data: any = {};

  for (const ans of answers) {
    const question = QUESTIONNAIRE_QUESTIONS.find(q => q.field === ans.field);
    if (!question) continue;

    const answerLower = ans.answer.toLowerCase().trim();

    // Converter baseado no tipo
    if (question.type === 'number') {
      const num = parseInt(ans.answer);
      if (!isNaN(num)) {
        data[ans.field] = num;
      }
    } else if (question.type === 'boolean') {
      data[ans.field] = answerLower.includes('sim') || answerLower === 's' || answerLower === 'yes';
    } else {
      data[ans.field] = ans.answer;
    }
  }

  return data;
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

    // Log detalhado de falha
    logger.error('❌ Paciente NÃO encontrado após todas as estratégias', {
      phoneOriginal: phone,
      phoneNormalized: normalizedPhone,
      last11,
      last9,
      last8
    })

    // Buscar amostra para debug
    const allPatients = await prisma.$queryRaw`
      SELECT id, name, phone, REGEXP_REPLACE(phone, '[^0-9]', '', 'g') as phone_normalized
      FROM "Patient"
      WHERE "isActive" = true
      LIMIT 5
    ` as any[];

    logger.debug('📋 Amostra de telefones no banco:', allPatients)

    return null

  } catch (error) {
    logger.error('❌ Erro na busca SQL:', error)

    // Fallback: buscar todos e filtrar manualmente
    logger.debug('🔄 Tentando fallback com busca manual...')
    const allPatients = await prisma.patient.findMany({
      where: { isActive: true },
      select: { id: true, name: true, phone: true, userId: true }
    })

    for (const patient of allPatients) {
      const patientPhoneNormalized = patient.phone.replace(/\D/g, '')
      if (patientPhoneNormalized.includes(last11) ||
          patientPhoneNormalized.includes(last9) ||
          patientPhoneNormalized.includes(last8)) {
        logger.debug('✅ Paciente encontrado via fallback')
        return patient
      }
    }

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
        in: ['sent', 'pending'],
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
