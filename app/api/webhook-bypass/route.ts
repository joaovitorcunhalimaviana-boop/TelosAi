/**
 * WEBHOOK BYPASS - EMERGÊNCIA
 * Este endpoint substitui temporariamente o webhook principal
 * Use este URL no Meta: /api/webhook-bypass
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { markAsRead, sendEmpatheticResponse } from '@/lib/whatsapp';

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

      // LÓGICA CORRETA: Detectar "sim" e enviar perguntas
      const textLower = text.toLowerCase().trim();

      if (textLower === 'sim' || textLower === 's') {
        console.log('🎯 DETECTADO "SIM" - Enviando perguntas do questionário...');

        const firstName = patient.name.split(' ')[0];
        const questions = `Olá ${firstName}! 👋

Vou fazer algumas perguntas sobre sua recuperação após ${followUp.surgery.type}.

Por favor, responda TODAS em UMA ÚNICA mensagem:

1️⃣ Como está sua DOR? (0 a 10)
2️⃣ Teve FEBRE? (Sim/Não)
3️⃣ Teve SANGRAMENTO? (Nenhum/Leve/Moderado/Intenso)
4️⃣ Conseguiu URINAR? (Sim/Não)
5️⃣ Conseguiu EVACUAR? (Sim/Não)
6️⃣ Náuseas ou VÔMITOS? (Sim/Não)
7️⃣ SECREÇÃO na ferida? (Nenhuma/Clara/Purulenta)
8️⃣ Outras preocupações ou dúvidas?

Exemplo de resposta:
"Dor 3, sem febre, sangramento leve, urinou sim, não evacuou, sem náuseas, sem secreção, nenhuma preocupação"`;

        await sendEmpatheticResponse(phone, questions);

        console.log('✅ Perguntas enviadas com sucesso!');
        return;
      }

      // Se não é "sim", processar como resposta ao questionário
      console.log('📝 Processando resposta ao questionário...');
      await sendEmpatheticResponse(
        phone,
        `Recebi suas respostas! Obrigado por compartilhar essas informações. O Dr. ${patient.name.split(' ')[0]} foi notificado e entrará em contato se necessário. Continue seguindo as orientações pós-operatórias. 🏥`
      );

      // Atualizar status
      await prisma.followUp.update({
        where: { id: followUp.id },
        data: {
          status: 'responded',
          respondedAt: new Date(),
        },
      });

      console.log('✅ Follow-up marcado como respondido');
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
