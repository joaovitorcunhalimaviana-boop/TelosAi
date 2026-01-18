/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WEBHOOK COM MEMÓRIA DE CONVERSA
 * Mantém histórico para a IA saber o que já foi perguntado
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'meu_token_secreto_123';
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '866244236573219';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Verificação do webhook (GET)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const validTokens = ['meu_token_secreto_123', VERIFY_TOKEN];

  if (mode === 'subscribe' && token && validTokens.includes(token)) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// Processar mensagens (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📨 WEBHOOK - Recebido');

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

              await markAsRead(message.id);
              await processMessage(phone, text);
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

// Processar mensagem COM MEMÓRIA
async function processMessage(phone: string, text: string) {
  try {
    // 1. Buscar paciente
    const patient = await findPatient(phone);

    if (!patient) {
      await sendWhatsApp(phone, 'Olá! Não encontrei seu cadastro. Entre em contato com o consultório.');
      return;
    }

    console.log(`✅ Paciente: ${patient.name}`);

    // 2. Buscar cirurgia
    const surgery = await prisma.surgery.findFirst({
      where: { patientId: patient.id },
      orderBy: { date: 'desc' }
    });

    if (!surgery) {
      await sendWhatsApp(phone, `Olá ${patient.name.split(' ')[0]}! Não encontrei cirurgia. Entre em contato com o consultório.`);
      return;
    }

    const daysPostOp = Math.floor((Date.now() - surgery.date.getTime()) / (1000 * 60 * 60 * 24));

    // 3. Buscar ou criar conversa com histórico
    let conversation = await prisma.conversation.findFirst({
      where: { patientId: patient.id }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          phoneNumber: phone.replace(/\D/g, ''),
          patientId: patient.id,
          state: 'idle',
          context: {},
          messageHistory: []
        }
      });
    }

    // 4. Obter histórico de mensagens
    const history = (conversation.messageHistory as any[]) || [];

    // 5. Se "SIM" e conversa nova/idle, iniciar questionário
    const textLower = text.toLowerCase().trim();
    if ((textLower === 'sim' || textLower === 's') && (conversation.state === 'idle' || conversation.state === 'awaiting_consent')) {
      const greeting = getGreeting();
      const firstName = patient.name.split(' ')[0];

      const welcomeMsg = `${greeting}, ${firstName}! 👋

Você está no D+${daysPostOp} após a cirurgia. Vou fazer algumas perguntas rápidas.

Como está sua dor agora? De 0 a 10, onde 0 é sem dor e 10 é a pior dor da sua vida.`;

      // Salvar no histórico
      const newHistory = [
        { role: 'assistant', content: welcomeMsg, timestamp: new Date().toISOString() }
      ];

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          state: 'collecting_answers',
          messageHistory: newHistory,
          context: { startedAt: new Date().toISOString(), daysPostOp }
        }
      });

      await sendWhatsApp(phone, welcomeMsg);
      return;
    }

    // 6. Adicionar mensagem do usuário ao histórico
    history.push({ role: 'user', content: text, timestamp: new Date().toISOString() });

    // 7. Chamar IA com histórico completo
    console.log('🤖 Chamando IA com histórico de', history.length, 'mensagens');
    const aiResponse = await callAIWithHistory(history, patient.name, surgery.type, daysPostOp);

    // 8. Adicionar resposta da IA ao histórico
    history.push({ role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() });

    // 9. Verificar se questionário está completo (IA disse "obrigado" ou similar)
    const isComplete = aiResponse.toLowerCase().includes('obrigad') &&
                       aiResponse.toLowerCase().includes('dr.') ||
                       aiResponse.toLowerCase().includes('boa recuperação');

    // 10. Atualizar conversa no banco
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        messageHistory: history,
        state: isComplete ? 'completed' : 'collecting_answers',
        updatedAt: new Date()
      }
    });

    await sendWhatsApp(phone, aiResponse);

  } catch (error: any) {
    console.error('❌ Erro:', error?.message);
    await sendWhatsApp(phone, 'Recebi sua mensagem! Como está sua dor? Me diz de 0 a 10.');
  }
}

// Chamar IA COM HISTÓRICO
async function callAIWithHistory(
  history: any[],
  patientName: string,
  surgeryType: string,
  daysPostOp: number
): Promise<string> {
  const firstName = patientName.split(' ')[0];

  const systemPrompt = `Você é uma assistente médica virtual empática que acompanha pacientes pós-operatórios.

CONTEXTO:
- Paciente: ${firstName}
- Cirurgia: ${surgeryType}
- Dia pós-operatório: D+${daysPostOp}

PERGUNTAS A COLETAR (na ordem):
1. Dor em repouso (0-10) ✓ já perguntei na primeira mensagem
2. Se evacuou desde a última conversa
3. Se evacuou: dor durante evacuação (0-10)
4. Sangramento (nenhum/leve/moderado/intenso)
5. Febre (sim/não, se sim qual temperatura)
6. Está tomando medicações conforme prescrito

REGRAS IMPORTANTES:
1. NUNCA repita uma pergunta que já foi respondida
2. Olhe o histórico para ver o que já foi perguntado e respondido
3. Faça UMA pergunta por vez
4. Se o paciente der resposta vaga, peça esclarecimento específico
5. Se dor >= 8, sangramento intenso ou febre >= 38°C: alerte para procurar emergência
6. Quando tiver TODAS as informações, agradeça e diga que vai passar para o Dr. João Vitor
7. Seja empática e use português brasileiro informal

FLUXO:
- Se já tem dor → pergunte sobre evacuação
- Se já tem evacuação → pergunte sobre sangramento (ou dor na evacuação se evacuou)
- Se já tem sangramento → pergunte sobre febre
- Se já tem febre → pergunte sobre medicações
- Se tem tudo → agradeça e finalize

Responda APENAS com o texto da mensagem. Sem JSON, sem formatação especial.`;

  try {
    // Converter histórico para formato Anthropic
    const messages = history.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 500,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages as any
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Resposta inesperada');
  } catch (error: any) {
    console.error('❌ Erro na IA:', error?.message);

    // Fallback: analisar histórico manualmente
    const lastAssistantMsg = [...history].reverse().find(m => m.role === 'assistant')?.content || '';

    if (lastAssistantMsg.includes('dor') && lastAssistantMsg.includes('0 a 10')) {
      return `Entendi! Agora me conta: você conseguiu evacuar desde ontem?`;
    }
    if (lastAssistantMsg.includes('evacu')) {
      return `Ok! E sobre sangramento: está tendo algum? (nenhum, leve no papel, moderado, ou intenso)`;
    }
    if (lastAssistantMsg.includes('sangramento')) {
      return `Certo! Teve febre? Se sim, qual foi a temperatura?`;
    }
    if (lastAssistantMsg.includes('febre')) {
      return `E as medicações: está tomando conforme o prescrito?`;
    }
    if (lastAssistantMsg.includes('medicaç')) {
      return `Perfeito, ${firstName}! Muito obrigada pelas informações. Vou passar tudo para o Dr. João Vitor. Boa recuperação! 💙`;
    }

    return `Recebi! Me conta: você conseguiu evacuar?`;
  }
}

// Buscar paciente
async function findPatient(phone: string) {
  const digits = phone.replace(/\D/g, '');
  const last8 = digits.slice(-8);
  const last9 = digits.slice(-9);

  const patients = await prisma.patient.findMany({
    where: { isActive: true }
  });

  for (const p of patients) {
    const pDigits = p.phone.replace(/\D/g, '');
    if (pDigits.slice(-8) === last8 || pDigits.slice(-9) === last9) {
      return p;
    }
  }
  return null;
}

// Enviar WhatsApp
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
    console.log('📤 Enviado:', result.messages?.[0]?.id || 'erro');
    return result;
  } catch (error: any) {
    console.error('❌ Erro WhatsApp:', error?.message);
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
  } catch (error) {}
}

// Saudação
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
