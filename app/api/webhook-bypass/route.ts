/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WEBHOOK SIMPLIFICADO - VERSÃO ULTRA SIMPLES
 * Remove toda complexidade e chama IA diretamente
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'meu_token_secreto_123';
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '866244236573219';

// Cliente Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Verificação do webhook (GET)
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

// Processar mensagens (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📨 WEBHOOK SIMPLES - Recebido');

    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ok' });
    }

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          const messages = change.value.messages || [];

          for (const message of messages) {
            if (message.type === 'text') {
              const phone = message.from;
              const text = message.text?.body || '';

              console.log(`📱 Mensagem de ${phone}: "${text}"`);

              // Marcar como lida
              await markAsRead(message.id);

              // Processar mensagem de forma SIMPLES
              await processMessageSimple(phone, text);
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('❌ Erro no webhook:', error?.message);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}

// Função principal simplificada
async function processMessageSimple(phone: string, text: string) {
  try {
    console.log('🔍 Buscando paciente...');

    // 1. Buscar paciente
    const patient = await findPatient(phone);

    if (!patient) {
      console.log('❌ Paciente não encontrado');
      await sendWhatsApp(phone, 'Olá! Não encontrei seu cadastro em nosso sistema. Por favor, entre em contato com o consultório.');
      return;
    }

    console.log(`✅ Paciente: ${patient.name}`);

    // 2. Buscar cirurgia mais recente
    const surgery = await prisma.surgery.findFirst({
      where: { patientId: patient.id },
      orderBy: { date: 'desc' }
    });

    if (!surgery) {
      await sendWhatsApp(phone, `Olá ${patient.name.split(' ')[0]}! Não encontrei registro de cirurgia. Entre em contato com o consultório.`);
      return;
    }

    console.log(`✅ Cirurgia: ${surgery.type}`);

    // 3. Calcular dias pós-op
    const daysPostOp = Math.floor((Date.now() - surgery.date.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`📅 Dias pós-op: D+${daysPostOp}`);

    // 4. Verificar se é resposta "SIM" para iniciar questionário
    const textLower = text.toLowerCase().trim();
    if (textLower === 'sim' || textLower === 's') {
      const greeting = getGreeting();
      const firstName = patient.name.split(' ')[0];

      const welcomeMsg = `${greeting}, ${firstName}! 👋

Aqui é a assistente de acompanhamento pós-operatório do Dr. João Vitor.

Você está no D+${daysPostOp} após a cirurgia. Vou te fazer algumas perguntas rápidas sobre como você está.

Como está sua dor agora? De 0 a 10, onde 0 é sem dor e 10 é a pior dor da sua vida.`;

      await sendWhatsApp(phone, welcomeMsg);
      return;
    }

    // 5. Para qualquer outra resposta, usar IA
    console.log('🤖 Chamando IA...');
    const aiResponse = await callAI(text, patient.name, surgery.type, daysPostOp);
    console.log(`🤖 Resposta da IA: ${aiResponse.substring(0, 100)}...`);

    await sendWhatsApp(phone, aiResponse);

  } catch (error: any) {
    console.error('❌ Erro processando mensagem:', error?.message);
    console.error('Stack:', error?.stack);

    // Mensagem de fallback amigável
    await sendWhatsApp(phone, 'Recebi sua mensagem! 😊 Como está sua dor agora? Me diz um número de 0 a 10.');
  }
}

// Chamar IA de forma SIMPLES
async function callAI(userMessage: string, patientName: string, surgeryType: string, daysPostOp: number): Promise<string> {
  const firstName = patientName.split(' ')[0];

  const systemPrompt = `Você é uma assistente médica virtual empática que acompanha pacientes pós-operatórios.

CONTEXTO:
- Paciente: ${firstName}
- Cirurgia: ${surgeryType}
- Dia pós-operatório: D+${daysPostOp}

REGRAS SIMPLES:
1. Seja empática e acolhedora
2. Faça UMA pergunta por vez
3. Colete: dor (0-10), se evacuou, sangramento, febre
4. Se dor >= 8, sangramento intenso ou febre alta: orientar buscar emergência
5. Responda em português brasileiro informal

Se o paciente disser "dor média", "dor leve", etc., peça um número de 0 a 10.
Se disser um número, agradeça e pergunte sobre evacuação.

Responda APENAS com o texto da mensagem para o paciente. Sem JSON, sem formatação especial.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 500,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Resposta inesperada da IA');
  } catch (error: any) {
    console.error('❌ Erro na IA:', error?.message);

    // Fallback inteligente baseado na mensagem
    const msgLower = userMessage.toLowerCase();

    if (msgLower.includes('dor')) {
      if (msgLower.includes('sem') || msgLower.includes('não')) {
        return `Que bom que está sem dor, ${firstName}! 😊 Você conseguiu evacuar hoje?`;
      }
      if (msgLower.includes('leve') || msgLower.includes('pouca')) {
        return `Entendi, dor leve. Na escala de 0 a 10, seria algo como 2 ou 3? Me confirma o número.`;
      }
      if (msgLower.includes('média') || msgLower.includes('moderada')) {
        return `Entendi, dor média. Na escala de 0 a 10, seria entre 4 e 6. Qual número você diria?`;
      }
      if (msgLower.includes('forte') || msgLower.includes('muita')) {
        return `Sinto muito pela dor forte. Na escala de 0 a 10, seria 7, 8 ou 9? Me diz o número.`;
      }
    }

    // Tentar extrair número
    const numMatch = msgLower.match(/\b([0-9]|10)\b/);
    if (numMatch) {
      const num = parseInt(numMatch[1]);
      if (num >= 8) {
        return `Anotei dor ${num}/10. Isso é bastante! Se a dor não melhorar com a medicação, procure o pronto-socorro. Você conseguiu evacuar hoje?`;
      }
      return `Anotei dor ${num}/10. Você conseguiu evacuar hoje?`;
    }

    return `Recebi sua mensagem! Como está sua dor agora? Me diz um número de 0 a 10.`;
  }
}

// Buscar paciente (simplificado)
async function findPatient(phone: string) {
  const digits = phone.replace(/\D/g, '');
  const last8 = digits.slice(-8);
  const last9 = digits.slice(-9);

  console.log(`🔍 Buscando: last8=${last8}, last9=${last9}`);

  const patients = await prisma.patient.findMany({
    where: { isActive: true }
  });

  for (const p of patients) {
    const pDigits = p.phone.replace(/\D/g, '');
    const pLast8 = pDigits.slice(-8);
    const pLast9 = pDigits.slice(-9);

    if (pLast8 === last8 || pLast9 === last9) {
      console.log(`✅ Match: ${p.name}`);
      return p;
    }
  }

  return null;
}

// Enviar mensagem WhatsApp
async function sendWhatsApp(to: string, message: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        }),
      }
    );

    const result = await response.json();
    console.log('📤 WhatsApp enviado:', result.messages?.[0]?.id || 'erro');
    return result;
  } catch (error: any) {
    console.error('❌ Erro enviando WhatsApp:', error?.message);
    throw error;
  }
}

// Marcar como lida
async function markAsRead(messageId: string) {
  try {
    await fetch(
      `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        }),
      }
    );
  } catch (error) {
    // Ignorar erro de marcar como lida
  }
}

// Saudação por horário
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
