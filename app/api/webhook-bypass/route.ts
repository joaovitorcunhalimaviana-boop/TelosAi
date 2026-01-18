/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WEBHOOK BYPASS - COM IA CONVERSACIONAL
 * Usa a arquitetura completa: conversational-ai + conversation-manager
 * Use este URL no Meta: /api/webhook-bypass
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { markAsRead, sendEmpatheticResponse } from '@/lib/whatsapp';
import {
  processQuestionnaireAnswer,
  startQuestionnaireCollection,
  getOrCreateConversation,
  isAwaitingQuestionnaire
} from '@/lib/conversation-manager';

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN!;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🚨 WEBHOOK BYPASS - Received:', JSON.stringify(body, null, 2));

    if (!body.object || body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          await processMessagesBypass(change.value);
        }
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Error in bypass webhook:', error);
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 200 });
  }
}

async function processMessagesBypass(value: any) {
  const messages = value.messages || [];

  for (const message of messages) {
    if (message.from === value.metadata?.phone_number_id) continue;

    await markAsRead(message.id).catch(err =>
      console.error('Error marking as read:', err)
    );

    if (message.type === 'text') {
      const phone = message.from;
      const text = message.text?.body || '';

      console.log(`📱 Processing: ${phone} - "${text}"`);

      // Buscar paciente
      const patient = await findPatientByPhone(phone);

      if (!patient) {
        console.log('❌ Paciente não encontrado:', phone);
        await sendEmpatheticResponse(
          phone,
          'Olá! Não encontrei seu cadastro em nosso sistema. Por favor, entre em contato com o consultório.'
        );
        return;
      }

      console.log('✅ Paciente encontrado:', patient.name);

      // Buscar follow-up pendente
      const followUp = await prisma.followUp.findFirst({
        where: {
          patientId: patient.id,
          status: { in: ['sent', 'pending'] },
        },
        include: { surgery: true },
        orderBy: { scheduledDate: 'desc' },
      });

      if (!followUp) {
        console.log('❌ Nenhum follow-up pendente');
        await sendEmpatheticResponse(
          phone,
          `Olá ${patient.name.split(' ')[0]}! Recebi sua mensagem. No momento não há questionário pendente. Se tiver alguma urgência, entre em contato com o consultório.`
        );
        return;
      }

      console.log('✅ Follow-up encontrado:', followUp.id, '- Status:', followUp.status);

      // LÓGICA COM IA CONVERSACIONAL
      const textLower = text.toLowerCase().trim();

      // Verificar estado atual da conversa
      const conversation = await getOrCreateConversation(phone, patient.id);
      const conversationState = conversation.state;

      console.log('🤖 Estado da conversa:', conversationState);

      // Se paciente respondeu "sim" e está aguardando consentimento, iniciar questionário com IA
      if ((textLower === 'sim' || textLower === 's') &&
          (conversationState === 'awaiting_consent' || conversationState === 'idle')) {
        console.log('🎯 DETECTADO "SIM" - Iniciando questionário com IA conversacional...');

        try {
          // Usar a IA conversacional para iniciar o questionário
          await startQuestionnaireCollection(phone, patient, followUp.surgery);
          console.log('✅ Questionário iniciado com IA conversacional!');
        } catch (error) {
          console.error('❌ Erro ao iniciar questionário com IA:', error);
          // Fallback: enviar mensagem simples
          const firstName = patient.name.split(' ')[0];
          await sendEmpatheticResponse(
            phone,
            `Olá ${firstName}! 👋 Vou fazer algumas perguntas sobre sua recuperação. Como você está se sentindo hoje? Tem alguma dor?`
          );
        }
        return;
      }

      // Para QUALQUER OUTRA resposta, usar a IA conversacional para processar
      console.log('📝 Processando resposta com IA conversacional...');

      try {
        const result = await processQuestionnaireAnswer(phone, text);

        console.log('🤖 Resultado da IA:', {
          completed: result.completed,
          needsDoctorAlert: result.needsDoctorAlert
        });

        // Se precisa alertar médico (red flag detectada)
        if (result.needsDoctorAlert) {
          console.log('🚨 RED FLAG DETECTADA - Médico será alertado!');
          // TODO: Implementar notificação push/email para o médico
        }

        if (result.completed) {
          console.log('✅ Questionário completado via IA!');

          // Atualizar status do follow-up
          await prisma.followUp.update({
            where: { id: followUp.id },
            data: {
              status: 'responded',
              respondedAt: new Date(),
            },
          });
        }
      } catch (error) {
        console.error('❌ Erro ao processar com IA:', error);

        // Fallback em caso de erro na IA
        await sendEmpatheticResponse(
          phone,
          `Recebi sua mensagem! Se você está tendo algum sintoma preocupante, por favor entre em contato diretamente com o consultório. Estamos aqui para ajudar! 🏥`
        );
      }
    }
  }
}

async function findPatientByPhone(phone: string): Promise<any | null> {
  const normalizedPhone = phone.replace(/\D/g, '');
  const last8 = normalizedPhone.slice(-8);

  console.log(`🔍 Buscando telefone:`);
  console.log(`   Original: ${phone}`);
  console.log(`   Normalizado: ${normalizedPhone}`);
  console.log(`   Últimos 8: ${last8}`);

  let patient = await prisma.patient.findFirst({
    where: { phone: { contains: last8 } },
  });

  if (!patient) {
    const last9 = normalizedPhone.slice(-9);
    console.log(`   Tentando últimos 9: ${last9}`);
    patient = await prisma.patient.findFirst({
      where: { phone: { contains: last9 } },
    });
  }

  console.log(`   Resultado: ${patient ? 'ENCONTRADO ✅' : 'NÃO encontrado ❌'}`);
  return patient;
}
