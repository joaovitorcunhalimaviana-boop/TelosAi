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

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN!;

/**
 * GET - Webhook Verification (Meta requirement)
 * Meta envia uma requisição GET para verificar o webhook
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('Webhook verification request:', { mode, token, challenge });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  console.error('Webhook verification failed');
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * POST - Receive Incoming Messages
 * Meta envia eventos de mensagens via POST
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Validar estrutura do webhook
    if (!body.object || body.object !== 'whatsapp_business_account') {
      console.log('Not a WhatsApp webhook');
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
    console.error('Error processing webhook:', error);
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
      console.error('Error marking as read:', err)
    );

    // Processar baseado no tipo de mensagem
    if (message.type === 'text') {
      await processTextMessage(message, contacts);
    } else if (message.type === 'interactive') {
      await processInteractiveMessage(message, contacts);
    } else {
      console.log(`Message type ${message.type} not handled`);
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

    console.log(`Processing text message from ${phone}: ${text}`);

    // Encontrar paciente pelo telefone
    const patient = await findPatientByPhone(phone);

    if (!patient) {
      console.log(`Patient not found for phone ${phone}`);
      // Enviar mensagem padrão
      await sendEmpatheticResponse(
        phone,
        'Olá! Não encontrei seu cadastro em nosso sistema. ' +
        'Por favor, entre em contato com o consultório.'
      );
      return;
    }

    // Encontrar follow-up pendente ou enviado
    const pendingFollowUp = await findPendingFollowUp(patient.id);

    if (!pendingFollowUp) {
      console.log(`No pending follow-up found for patient ${patient.id}`);
      // Enviar mensagem padrão
      await sendEmpatheticResponse(
        phone,
        `Olá ${patient.name.split(' ')[0]}! Recebi sua mensagem. ` +
        'No momento não há questionário pendente. ' +
        'Se tiver alguma urgência, por favor entre em contato com o consultório.'
      );
      return;
    }

    // Processar resposta ao questionário
    await processFollowUpResponse(pendingFollowUp, patient, text);

  } catch (error) {
    console.error('Error processing text message:', error);
  }
}

/**
 * Processa mensagem interativa (botões/listas)
 */
async function processInteractiveMessage(message: any, contacts: any[]) {
  try {
    const phone = message.from;
    const interactive = message.interactive;

    console.log(`Processing interactive message from ${phone}:`, interactive);

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
    console.error('Error processing interactive message:', error);
  }
}

/**
 * Processa resposta ao questionário de follow-up
 */
async function processFollowUpResponse(
  followUp: any,
  patient: any,
  responseText: string
) {
  try {
    // Parse da resposta (simplificado - em produção usar NLP)
    const questionnaireData = parseResponseText(responseText);

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
        comorbidities: [], // TODO: buscar do banco
        medications: [], // TODO: buscar do banco
      },
      questionnaireData,
      detectedRedFlags: detectedRedFlagMessages,
    });

    // Combinar red flags
    const allRedFlags = [
      ...detectedRedFlagMessages,
      ...aiAnalysis.additionalRedFlags,
    ];

    // Determinar nível de risco final (o maior entre determinístico e IA)
    const riskLevels = ['low', 'medium', 'high', 'critical'];
    const finalRiskLevel = riskLevels.indexOf(aiAnalysis.riskLevel) > riskLevels.indexOf(deterministicRiskLevel)
      ? aiAnalysis.riskLevel
      : deterministicRiskLevel;

    // Salvar resposta no banco
    const followUpResponse = await prisma.followUpResponse.create({
      data: {
        followUpId: followUp.id,
        userId: patient.userId,
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

    // Enviar resposta empática ao paciente
    let responseMessage = aiAnalysis.empatheticResponse;
    if (aiAnalysis.seekCareAdvice) {
      responseMessage += `\n\n${aiAnalysis.seekCareAdvice}`;
    }

    await sendEmpatheticResponse(patient.phone, responseMessage);

    // Enviar notificação push informando que paciente respondeu
    await sendPushNotification(patient.userId, {
      title: 'Paciente Respondeu',
      body: `${patient.name} respondeu ao questionário D+${followUp.dayNumber}`,
      url: `/paciente/${patient.id}`,
      tag: `patient-response-${followUpResponse.id}`,
      requireInteraction: false,
    }).catch(err => console.error('Error sending response push notification:', err));


    // Alertar médico se risco alto ou crítico
    if (finalRiskLevel === 'high' || finalRiskLevel === 'critical') {
      await sendDoctorAlert(
        patient.name,
        followUp.dayNumber,
        finalRiskLevel,
        allRedFlags
      );

      await prisma.followUpResponse.update({
        where: { id: followUpResponse.id },
        data: {
          doctorAlerted: true,
          alertSentAt: new Date(),
        },
      });

      // Enviar notificação push para o médico
      await sendPushNotification(patient.userId, {
        title: `Red Flag: ${patient.name}`,
        body: `Nível de risco ${finalRiskLevel} detectado em D+${followUp.dayNumber}. ${allRedFlags.length} alerta(s).`,
        url: `/paciente/${patient.id}`,
        tag: `red-flag-${followUpResponse.id}`,
        requireInteraction: true,
      }).catch(err => console.error('Error sending push notification:', err));
    }

    console.log(`Follow-up response processed successfully for patient ${patient.id}`);

  } catch (error) {
    console.error('Error processing follow-up response:', error);

    // Enviar mensagem de erro ao paciente
    await sendEmpatheticResponse(
      patient.phone,
      'Desculpe, houve um erro ao processar sua resposta. ' +
      'Por favor, tente novamente ou entre em contato com o consultório.'
    ).catch(err => console.error('Error sending error message:', err));
  }
}

/**
 * Encontra paciente pelo telefone
 */
async function findPatientByPhone(phone: string): Promise<any | null> {
  // Normalizar número de telefone (remover tudo exceto dígitos)
  const normalizedPhone = phone.replace(/\D/g, '');

  // WhatsApp envia formato: 5583998663089 (país + DDD + número)
  // Banco pode ter: (83) 99866-3089, 83998663089, 5583998663089, etc
  // Estratégia: buscar pelos últimos 8 dígitos (mais confiável)
  const last8 = normalizedPhone.slice(-8); // Últimos 8 dígitos do número

  let patient = await prisma.patient.findFirst({
    where: {
      phone: {
        contains: last8,
      },
    },
  });

  // Se não encontrou, tentar com últimos 9 (inclui primeiro dígito do celular)
  if (!patient) {
    const last9 = normalizedPhone.slice(-9);
    patient = await prisma.patient.findFirst({
      where: {
        phone: {
          contains: last9,
        },
      },
    });
  }

  // Log para debug
  console.log(`🔍 Buscando telefone: ${phone}`);
  console.log(`   Normalizado: ${normalizedPhone}`);
  console.log(`   Últimos 8: ${last8}`);
  console.log(`   Paciente ${patient ? 'ENCONTRADO ✅' : 'NÃO encontrado ❌'}`);

  return patient;
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
