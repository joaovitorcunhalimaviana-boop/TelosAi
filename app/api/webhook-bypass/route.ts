/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WEBHOOK COM MEMÓRIA, PROTOCOLO MÉDICO E SALVAMENTO DE RESPOSTAS
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import { getProtocolForSurgery } from '@/lib/protocols/hemorroidectomia-protocol';
import { sendCriticalRedFlagAlert } from '@/lib/red-flag-alerts';
import { toBrasiliaTime, getBrasiliaHour } from '@/lib/date-utils';

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

    // Calcular dias pós-operatórios usando timezone de Brasília (evita off-by-one)
    const { toBrasiliaTime } = await import('@/lib/date-utils');
    const nowBrt = toBrasiliaTime(new Date());
    const surgeryBrt = toBrasiliaTime(surgery.date);
    const nowDayStart = new Date(nowBrt.getFullYear(), nowBrt.getMonth(), nowBrt.getDate());
    const surgeryDayStart = new Date(surgeryBrt.getFullYear(), surgeryBrt.getMonth(), surgeryBrt.getDate());
    const daysPostOp = Math.round((nowDayStart.getTime() - surgeryDayStart.getTime()) / (1000 * 60 * 60 * 24));

    // 4. Buscar ou criar conversa com histórico (ANTES de buscar follow-up!)
    let conversation = await prisma.conversation.findFirst({
      where: { patientId: patient.id }
    });

    // 3. Buscar follow-up - USAR O DO CONTEXTO SE JÁ EXISTE!
    let followUp = null;
    const existingContext = (conversation?.context as any) || {};

    // Se a conversa está em andamento e tem um followUpId, usar esse!
    if (conversation?.state === 'collecting_answers' && existingContext.followUpId) {
      followUp = await prisma.followUp.findUnique({
        where: { id: existingContext.followUpId }
      });
      console.log('📋 Usando follow-up do contexto:', followUp?.id, 'D+' + followUp?.dayNumber);
    }

    // Se não tem no contexto, buscar baseado no DIA PÓS-OPERATÓRIO ATUAL
    if (!followUp) {
      // Calcular qual é o day number correto para hoje
      const expectedDayNumber = daysPostOp;

      // Primeiro: tentar buscar o follow-up do dia atual (independente do status)
      followUp = await prisma.followUp.findFirst({
        where: {
          patientId: patient.id,
          dayNumber: expectedDayNumber
        }
      });

      if (followUp) {
        console.log('📋 Follow-up do dia atual (D+' + expectedDayNumber + '):', followUp.id, 'status:', followUp.status);
      }

      // Se não encontrou para o dia atual, tentar com status 'sent' (foi enviado e aguarda resposta)
      if (!followUp) {
        followUp = await prisma.followUp.findFirst({
          where: {
            patientId: patient.id,
            status: 'sent'
          },
          orderBy: { sentAt: 'desc' }
        });
      }

      // Se ainda não encontrou, buscar 'pending' APENAS se for do dia atual ou anterior
      // (não pegar follow-up de dias futuros!)
      if (!followUp) {
        followUp = await prisma.followUp.findFirst({
          where: {
            patientId: patient.id,
            status: 'pending',
            dayNumber: { lte: expectedDayNumber } // Somente dias até hoje!
          },
          orderBy: { dayNumber: 'desc' } // Pegar o mais recente (mais próximo de hoje)
        });
      }

      console.log('📋 Follow-up buscado:', followUp?.id, 'D+' + followUp?.dayNumber, 'status:', followUp?.status);
    }

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

    // 5. Obter histórico de mensagens
    const history = (conversation.messageHistory as any[]) || [];

    // 6. Se "SIM" e conversa nova/idle, iniciar questionário
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
          context: {
            startedAt: new Date().toISOString(),
            daysPostOp,
            followUpId: followUp?.id,
            collectedData: {}
          }
        }
      });

      await sendWhatsApp(phone, welcomeMsg);
      return;
    }

    // 7. Adicionar mensagem do usuário ao histórico
    history.push({ role: 'user', content: text, timestamp: new Date().toISOString() });

    // 7.5. Buscar dor do dia anterior para mensagens de incentivo
    const previousPain = await getPreviousDayPain(patient.id, surgery.id);

    // 7.6. Obter dados já coletados do contexto
    const currentContext = (conversation.context as any) || {};
    const currentCollectedData = currentContext.collectedData || {};

    // 8. Chamar IA com histórico completo e protocolo médico
    console.log('🤖 Chamando IA com histórico de', history.length, 'mensagens, dor anterior:', previousPain, 'dados coletados:', currentCollectedData);
    const doctorName = (patient as any).doctorName || 'seu médico';
    const { response: aiResponse, extractedData, isComplete } = await callAIWithHistory(
      history,
      patient.name,
      surgery.type,
      daysPostOp,
      previousPain,
      currentCollectedData,
      doctorName
    );

    // 9. Adicionar resposta da IA ao histórico
    history.push({ role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() });

    // 10. Atualizar dados coletados no contexto (acumular com dados anteriores)
    const collectedData = { ...currentCollectedData, ...extractedData };
    console.log('📊 Dados coletados atualizados:', collectedData);

    // 11. Atualizar conversa no banco
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        messageHistory: history,
        state: isComplete ? 'completed' : 'collecting_answers',
        context: {
          ...currentContext,
          collectedData,
          lastUpdated: new Date().toISOString()
        },
        updatedAt: new Date()
      }
    });

    // 12. Se questionário completo, salvar respostas
    if (isComplete && followUp) {
      await saveQuestionnaireResponse(followUp.id, collectedData, patient.userId, history);
      console.log('✅ Respostas salvas no banco!');
    }

    await sendWhatsApp(phone, aiResponse);

  } catch (error: any) {
    console.error('❌ Erro:', error?.message);
    await sendWhatsApp(phone, 'Recebi sua mensagem! Como está sua dor? Me diz de 0 a 10.');
  }
}

// Salvar respostas do questionário
async function saveQuestionnaireResponse(
  followUpId: string,
  data: any,
  userId: string,
  conversationHistory: any[]
) {
  try {
    // Determinar nível de risco
    let riskLevel = 'low';
    if (data.pain >= 8 || data.bleeding === 'intenso' || data.fever === true) {
      riskLevel = 'high';
    } else if (data.pain >= 6 || data.bleeding === 'moderado') {
      riskLevel = 'medium';
    }

    // Formatar conversa para incluir no questionnaireData
    const formattedConversation = conversationHistory.map(msg => ({
      role: msg.role === 'system' ? 'assistant' : msg.role,
      content: msg.content
    }));

    // Incluir conversa no questionnaireData para exibição no dashboard
    const dataWithConversation = {
      ...data,
      conversation: formattedConversation
    };

    // Criar resposta no banco
    // bleeding no banco é Boolean (tem ou não tem sangramento)
    const hasBleeding = data.bleeding && data.bleeding !== 'nenhum' && data.bleeding !== 'none';

    const response = await prisma.followUpResponse.create({
      data: {
        followUpId,
        userId,
        questionnaireData: JSON.stringify(dataWithConversation),
        riskLevel,
        painAtRest: data.pain || null,
        painDuringBowel: data.painDuringBowel || null,
        bleeding: hasBleeding,
        fever: data.fever || false,
        aiResponse: conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n\n')
      }
    });

    // Atualizar status do follow-up
    await prisma.followUp.update({
      where: { id: followUpId },
      data: {
        status: 'responded',
        respondedAt: new Date()
      }
    });

    console.log('✅ FollowUpResponse criado com riskLevel:', riskLevel);

    // Se risco alto, enviar alerta crítico ao médico
    if (riskLevel === 'high') {
      console.log('🚨 Risco alto detectado! Enviando alerta ao médico...');
      const alertSent = await sendCriticalRedFlagAlert(followUpId, data);

      if (alertSent) {
        // Marcar que o alerta foi enviado
        await prisma.followUpResponse.update({
          where: { id: response.id },
          data: {
            doctorAlerted: true,
            alertSentAt: new Date()
          }
        });
        console.log('✅ Médico alertado com sucesso!');
      }
    }
  } catch (error: any) {
    console.error('❌ Erro ao salvar resposta:', error?.message);
  }
}

// Buscar dor do dia anterior
async function getPreviousDayPain(patientId: string, surgeryId: string): Promise<number | null> {
  try {
    // Buscar o follow-up respondido mais recente (que não seja de hoje)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const previousResponse = await prisma.followUpResponse.findFirst({
      where: {
        followUp: {
          patientId,
          surgeryId,
          status: 'responded'
        },
        createdAt: {
          lt: today // Antes de hoje
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        painAtRest: true
      }
    });

    return previousResponse?.painAtRest ?? null;
  } catch (error) {
    console.error('❌ Erro ao buscar dor anterior:', error);
    return null;
  }
}

// Chamar IA COM HISTÓRICO E PROTOCOLO
async function callAIWithHistory(
  history: any[],
  patientName: string,
  surgeryType: string,
  daysPostOp: number,
  previousPain: number | null = null,
  currentCollectedData: any = {},
  doctorName: string = 'seu médico'
): Promise<{ response: string; extractedData: any; isComplete: boolean }> {
  const firstName = patientName.split(' ')[0];

  // Obter protocolo médico
  const protocol = getProtocolForSurgery(surgeryType);

  // Informação sobre dor anterior para mensagens de incentivo
  const painComparisonInfo = previousPain !== null
    ? `\n- Dor do dia anterior: ${previousPain}/10 (use para comparar e dar mensagens de incentivo se melhorou)`
    : '';

  // Informar o que já foi coletado
  const collectedInfo = Object.keys(currentCollectedData).length > 0
    ? `\n\nDADOS JÁ COLETADOS NESTA CONVERSA:\n${JSON.stringify(currentCollectedData, null, 2)}\nNÃO pergunte novamente sobre esses dados!`
    : '';

  const systemPrompt = `Você é uma assistente médica virtual empática que acompanha pacientes pós-operatórios de ${doctorName}.

CONTEXTO:
- Paciente: ${firstName}
- Cirurgia: ${surgeryType}
- Dia pós-operatório: D+${daysPostOp}${painComparisonInfo}${collectedInfo}

=== PROTOCOLO MÉDICO OFICIAL (SIGA ESTAS ORIENTAÇÕES) ===
${protocol}
=== FIM DO PROTOCOLO ===

PERGUNTAS A COLETAR (na ordem):
1. Dor em repouso (0-10) - campo: pain
2. Se evacuou desde a última conversa - campo: evacuated (true/false)
3. Se evacuou: dor durante evacuação (0-10) - campo: painDuringBowel
4. Sangramento (nenhum/leve/moderado/intenso) - campo: bleeding
5. Febre (sim/não, se sim qual temperatura) - campo: fever (true/false)
6. Está tomando medicações conforme prescrito - campo: medications (true/false)

REGRAS CRÍTICAS:
1. NUNCA repita uma pergunta sobre dado que já está em "DADOS JÁ COLETADOS"
2. Olhe o histórico E os dados coletados antes de perguntar
3. Faça UMA pergunta por vez
4. Se o paciente der resposta vaga, peça esclarecimento específico
5. Se dor >= 8, sangramento intenso ou febre >= 38°C: alerte para procurar emergência
6. Quando tiver TODAS as 6 informações, agradeça e diga que vai passar para ${doctorName}
7. Seja empática e use português brasileiro informal
8. SE o paciente perguntar sobre cuidados, USE O PROTOCOLO para responder

MENSAGENS DE INCENTIVO (IMPORTANTE):
- Se a dor atual for MENOR que a dor do dia anterior, elogie: "Que bom que melhorou! 🎉"

ORIENTAÇÕES DO PROTOCOLO POR DIA:
- D+0, D+1, D+2: Crioterapia (compressa GELADA/GELO) 5x ao dia
- D+3 em diante: Banho de assento com água MORNA (não usar mais gelo)
- Banho de assento: APENAS ÁGUA LIMPA, sem nenhum produto

REGRA CRÍTICA SOBRE GELO:
- D+0: Diga "continue com compressa gelada"
- D+1: Diga "continue com compressa gelada, ainda faltam 2 dias de gelo (hoje e amanhã)"
- D+2: Diga "HOJE É O ÚLTIMO DIA de compressa gelada! A partir de amanhã (D+3), troque para banho de assento com água morna"
- D+3 em diante: NÃO mencione gelo! Apenas banho de assento morno

NUNCA diga "último dia de gelo" se estiver no D+0 ou D+1!

RESPONDA SEMPRE em formato JSON puro (sem markdown):
{"response":"sua resposta para o paciente","extractedData":{"pain":5},"isComplete":false}

REGRAS DO JSON:
- extractedData deve conter APENAS dados NOVOS confirmados pelo paciente NESTA mensagem
- Não repita dados que já estão em "DADOS JÁ COLETADOS"
- isComplete = true SOMENTE quando tiver TODOS os 6 campos coletados`;

  try {
    const messages = history.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      temperature: 0.5,
      system: systemPrompt,
      messages: messages as any
    });

    const content = response.content[0];
    if (content.type === 'text') {
      // Tentar parsear JSON
      try {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            response: parsed.response || content.text,
            extractedData: parsed.extractedData || {},
            isComplete: parsed.isComplete || false
          };
        }
      } catch (e) {
        // Se não for JSON, retornar texto direto
      }

      // Verificar se está completo pelo texto
      const isComplete = content.text.toLowerCase().includes('obrigad') &&
                        (content.text.toLowerCase().includes('dr.') ||
                         content.text.toLowerCase().includes('boa recuperação'));

      return {
        response: content.text,
        extractedData: {},
        isComplete
      };
    }

    throw new Error('Resposta inesperada');
  } catch (error: any) {
    console.error('❌ Erro na IA:', error?.message);

    // Fallback inteligente
    const lastAssistantMsg = [...history].reverse().find(m => m.role === 'assistant')?.content || '';

    if (lastAssistantMsg.includes('dor') && lastAssistantMsg.includes('0 a 10')) {
      return { response: `Entendi! Agora me conta: você conseguiu evacuar desde ontem?`, extractedData: {}, isComplete: false };
    }
    if (lastAssistantMsg.includes('evacu')) {
      return { response: `Ok! E sobre sangramento: está tendo algum? (nenhum, leve no papel, moderado, ou intenso)`, extractedData: {}, isComplete: false };
    }
    if (lastAssistantMsg.includes('sangramento')) {
      return { response: `Certo! Teve febre? Se sim, qual foi a temperatura?`, extractedData: {}, isComplete: false };
    }
    if (lastAssistantMsg.includes('febre')) {
      return { response: `E as medicações: está tomando conforme o prescrito?`, extractedData: {}, isComplete: false };
    }
    if (lastAssistantMsg.includes('medicaç')) {
      return {
        response: `Perfeito, ${firstName}! Muito obrigada pelas informações. Vou passar tudo para ${doctorName}. Boa recuperação! 💙`,
        extractedData: {},
        isComplete: true
      };
    }

    return { response: `Recebi! Me conta: você conseguiu evacuar?`, extractedData: {}, isComplete: false };
  }
}

// Buscar paciente (com nome do médico)
async function findPatient(phone: string) {
  const digits = phone.replace(/\D/g, '');
  const last8 = digits.slice(-8);
  const last9 = digits.slice(-9);

  const patients = await prisma.patient.findMany({
    where: { isActive: true },
    include: {
      user: { select: { nomeCompleto: true } }
    }
  });

  for (const p of patients) {
    const pDigits = p.phone.replace(/\D/g, '');
    if (pDigits.slice(-8) === last8 || pDigits.slice(-9) === last9) {
      return { ...p, doctorName: p.user?.nomeCompleto || 'seu médico' };
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

// Saudação baseada no horário de Brasília
function getGreeting(): string {
  const hour = getBrasiliaHour();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
