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
  validateClaudeResponse,
  validateQuestionnaireData,
  validatePostOpData,
  validatePostOpDataByDay,
  parseJSONSafely,
} from '@/lib/api-validation';
import { findApplicableProtocols, formatProtocolsForPrompt } from '@/lib/protocols';

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

    if (isPositiveResponse && pendingFollowUp.status === 'sent') {
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

Me diga um número de 0 a 10, olhando a imagem abaixo:`;

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
 * Chama Claude API para conversação inteligente
 */
/**
 * Chama Claude API para conversação inteligente com CHECKLIST DINÂMICO
 */
async function callClaudeAPI(
  conversationHistory: any[],
  userMessage: string,
  patient: any,
  surgeryType: string,
  dayNumber: number,
  savedPhase?: string,
  currentData: any = {},
  protocolText: string = '',
  doctorName: string = 'seu médico'
): Promise<ClaudeAIResponse> {
  try {
    const { anthropic } = await import('@/lib/anthropic');

    // =================================================================================
    // NOVA LÓGICA: CHECKLIST DINÂMICO (Substitui Fases Rígidas)
    // =================================================================================

    // 1. Definir o que precisamos saber (O "Checklist")
    const requiredFields = [
      'painAtRest',                   // Dor em repouso (0-10)
      'hadBowelMovementSinceLastContact', // Evacuou desde a última?
      'takingPrescribedMeds',         // Está tomando remédios?
      'bleeding'                      // Tem sangramento?
    ];

    // Regras Condicionais (Adicionadas dinamicamente)
    // Se dor > 5, investigar febre e secreção
    if (currentData.painAtRest !== undefined && Number(currentData.painAtRest) > 5) {
      if (!currentData.hasFever) requiredFields.push('hasFever');
      if (!currentData.hasPurulentDischarge) requiredFields.push('hasPurulentDischarge');
    }

    // Se tomou remédios extras, perguntar quais
    if (currentData.takingExtraMeds === true) {
      requiredFields.push('extraMedsDetails');
    }

    // Se teve sangramento, perguntar detalhes (exceto se for "none")
    if (currentData.bleeding && currentData.bleeding !== 'none') {
      requiredFields.push('bleedingDetails');
    }

    // 2. Identificar o que falta (Missing Fields)
    const missingFields = requiredFields.filter(field => {
      // Verifica se o campo já existe em currentData e não é null/undefined
      return currentData[field] === undefined || currentData[field] === null;
    });

    const isComplete = missingFields.length === 0;

    // 3. Montar o Prompt do Sistema (O "Cérebro")
    const SYSTEM_PROMPT = `Você é a Clara, assistente de IA da clínica do ${doctorName} (Telos.AI). Especialista em pós-operatório de cirurgia colorretal.

CONTEXTO ATUAL:
- Paciente: ${patient.name}
- Cirurgia: ${surgeryType}
- Dia: D+${dayNumber}

SEU OBJETIVO:
Preencher o checklist de saúde do paciente de forma natural, simpática e eficiente. 

CHECKLIST (O que precisamos saber):
${JSON.stringify(requiredFields)}

DADOS JÁ COLETADOS:
${JSON.stringify(currentData, null, 2)}

O QUE FALTA COLETAR (Sua Prioridade):
${JSON.stringify(missingFields)}

REGRAS DE COMPORTAMENTO:
1. **Prioridade**: Se houver campos faltando, faça A PRÓXIMA pergunta para preenchê-los.
2. **Uma coisa de cada vez**: Não faça todas as perguntas juntas. Pergunte uma ou duas coisas no máximo.
3. **Escala Visual de Dor**: Se for perguntar sobre nível de dor (0-10), VOCÊ DEVE solicitar a imagem marcando "needsImage": "pain_scale" no JSON.
4. **Naturalidade**: Fale como uma enfermeira humana. Use emojis moderados. Seja empática se o paciente relatar dor.
5. **Acolhimento**: Se o paciente disser algo fora do script, responda educadamente antes de voltar ao checklist.

INSTRUÇÕES DE EXTRAÇÃO (JSON):
- Analise a mensagem do usuário e extraia qualquer dado relevante para o checklist.
- Normalize: 'não', 'nunca' -> false/none. 'sim', 'muito' -> true/severe.
- Se o usuário disser "Dói 5", extraia "painAtRest": 5.

FORMATO DE RESPOSTA (Obrigatório JSON puro):
{
  "message": "Sua resposta textual para o paciente",
  "needsImage": "pain_scale" | null, // Use "pain_scale" SEMPRE que perguntar nota de dor
  "dataCollected": { "campo": valor }, // Dados extraídos desta interação
  "completed": boolean, // true SE missingFields estiver vazio
  "needsClarification": boolean // true se não entendeu nada
}
`;

    // Histórico de Conversa
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

    logger.debug('🤖 Chamando Claude 3.5 Sonnet (Dynamic Mode)', {
      missingFields,
      isComplete
    });

    // CHAMADA API - USANDO MODELO OFICIAL E CORRETO
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // O MELHOR MODELO (Supera GPT-4o em coding/reasoning)
      max_tokens: 1000,
      temperature: 0.2, // Baixa para garantir o JSON
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Extração de JSON Robustecida
    const startIndex = responseText.indexOf('{');
    const endIndex = responseText.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      throw new Error('JSON não encontrado na resposta da IA');
    }

    const jsonString = responseText.substring(startIndex, endIndex + 1);
    const parsedJson = JSON.parse(jsonString);

    // Validação final de segurança
    const aiResponse: ClaudeAIResponse = {
      message: parsedJson.message || 'Desculpe, não entendi. Pode repetir?',
      needsImage: parsedJson.needsImage || null,
      dataCollected: parsedJson.dataCollected || {},
      completed: parsedJson.completed || false,
      needsClarification: parsedJson.needsClarification || false,
      conversationPhase: isComplete ? 'completed' : 'collecting_data'
    };

    return aiResponse;

  } catch (error) {
    logger.error('❌ Erro crítico no cérebro da IA:', error);
    return {
      message: "Tive um pequeno lapso. Podemos continuar? Como você está se sentindo agora?",
      needsImage: null,
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_data'
    };
  }
}

/**
 * Determina a fase atual da conversa baseado no histórico
 * FASES ATUALIZADAS (sem alimentação):
 * 1. collecting_pain_at_rest - Dor em repouso
 * 2. collecting_fever - Febre
 * 3. collecting_fever_temp - Temperatura da febre
 * 4. collecting_urination - Urina
 * 5. collecting_urination_details - Detalhes da urina
 * 6. collecting_bowel - Evacuação desde última conversa
 * 7. collecting_bowel_time - Hora da evacuação
 * 8. collecting_pain_during_bm - Dor DURANTE evacuação
 * 9. collecting_bristol - Escala Bristol
 * 10. collecting_bleeding - Sangramento
 * 11. collecting_meds_prescribed - Medicações prescritas (dipirona, anti-inflamatório)
 * 12. collecting_meds_extra - Medicações extras além das prescritas
 * 13. collecting_purulent_discharge - Secreção purulenta (apenas D+3)
 * 14. collecting_concerns - Preocupações
 */
function determineCurrentPhase(conversationHistory: any[], dayNumber?: number): string {
  // Se não há histórico ou só tem mensagem inicial, estamos coletando dor em repouso
  if (conversationHistory.length === 0) return 'collecting_pain_at_rest';
  if (conversationHistory.length <= 2) return 'collecting_pain_at_rest';

  // Analisar as últimas mensagens do assistente para determinar fase
  const assistantMessages = conversationHistory
    .filter(m => m.role === 'assistant')
    .map(m => m.content.toLowerCase());

  if (assistantMessages.length === 0) return 'collecting_pain_at_rest';

  const lastAssistantMsg = assistantMessages[assistantMessages.length - 1];

  // Verificar qual foi a última pergunta feita pelo assistente
  // Ordem de verificação importa - mais específico primeiro

  // Preocupações finais
  if (lastAssistantMsg.includes('preocupação') || lastAssistantMsg.includes('sintoma') || lastAssistantMsg.includes('última pergunta')) {
    return 'collecting_concerns';
  }

  // Secreção purulenta (D+3)
  if (lastAssistantMsg.includes('secreção') || lastAssistantMsg.includes('pus') || lastAssistantMsg.includes('purulenta')) {
    return 'collecting_purulent_discharge';
  }

  // Medicações extras (além das prescritas)
  if (lastAssistantMsg.includes('além') || lastAssistantMsg.includes('outra medicação') || lastAssistantMsg.includes('qual medicação tomou')) {
    return 'collecting_meds_extra';
  }

  // Medicações prescritas
  if (lastAssistantMsg.includes('medicações') && lastAssistantMsg.includes('receitadas') || lastAssistantMsg.includes('tomando') && lastAssistantMsg.includes('medicações')) {
    return 'collecting_meds_prescribed';
  }

  // Sangramento
  if (lastAssistantMsg.includes('sangr')) {
    return 'collecting_bleeding';
  }

  // Bristol Scale (consistência das fezes)
  if (lastAssistantMsg.includes('bristol') || lastAssistantMsg.includes('1 a 7') || lastAssistantMsg.includes('consistência')) {
    return 'collecting_bristol';
  }

  // Dor DURANTE evacuação (diferente de dor em repouso)
  if (lastAssistantMsg.includes('dor durante') || lastAssistantMsg.includes('durante a evacuação')) {
    return 'collecting_pain_during_bm';
  }

  // Hora da evacuação
  if (lastAssistantMsg.includes('que horas') || lastAssistantMsg.includes('horas foi')) {
    return 'collecting_bowel_time';
  }

  // Evacuação (desde última conversa)
  if (lastAssistantMsg.includes('evacuou') || lastAssistantMsg.includes('evacu') && lastAssistantMsg.includes('última')) {
    return 'collecting_bowel';
  }

  // Detalhes da urina
  if (lastAssistantMsg.includes('dificuldade para urinar') || lastAssistantMsg.includes('o que está acontecendo')) {
    return 'collecting_urination_details';
  }

  // Urina
  if (lastAssistantMsg.includes('urin') || lastAssistantMsg.includes('xixi')) {
    return 'collecting_urination';
  }

  // Temperatura da febre
  if ((lastAssistantMsg.includes('qual foi') || lastAssistantMsg.includes('medir')) && lastAssistantMsg.includes('temperatura')) {
    return 'collecting_fever_temp';
  }

  // Febre
  if (lastAssistantMsg.includes('febre')) {
    return 'collecting_fever';
  }

  // Dor em repouso (fase inicial)
  if (lastAssistantMsg.includes('dor em repouso') || lastAssistantMsg.includes('dor') && lastAssistantMsg.includes('0 a 10')) {
    return 'collecting_pain_at_rest';
  }

  // Fallback: verificar progresso pelo número de trocas
  const exchanges = Math.floor(conversationHistory.length / 2);
  const phases = [
    'collecting_pain_at_rest',
    'collecting_fever',
    'collecting_urination',
    'collecting_bowel',
    'collecting_bowel_time',
    'collecting_pain_during_bm',
    'collecting_bristol',
    'collecting_bleeding',
    'collecting_meds_prescribed',
    'collecting_meds_extra',
    'collecting_purulent_discharge', // Só D+3, mas está no fallback
    'collecting_concerns'
  ];

  return phases[Math.min(exchanges, phases.length - 1)];
}

/**
 * Interpreta resposta localmente quando a API falha
 * IMPORTANTE: Esta função é CONSERVADORA - só avança quando TEM CERTEZA da resposta
 *
 * FLUXO COMPLETO (ATUALIZADO - sem alimentação):
 * 1. collecting_pain_at_rest - Dor em repouso (0-10)
 * 2. collecting_fever - Febre (sim/não)
 * 3. collecting_fever_temp - Temperatura (se teve febre)
 * 4. collecting_urination - Urina normal (sim/não)
 * 5. collecting_bowel - Evacuou (D+1: "após a cirurgia" / D+2+: "desde nossa última conversa")
 * 6. collecting_bowel_time - Hora da evacuação (se evacuou)
 * 7. collecting_pain_during_bm - Dor DURANTE evacuação (0-10) + IMAGEM
 * 8. collecting_bristol - Escala Bristol (1-7) + IMAGEM
 * 9. collecting_bleeding - Sangramento
 * 10. collecting_meds_prescribed - Medicações prescritas
 * 11. collecting_meds_extra - Medicações extras além das prescritas
 * 11b. collecting_meds_extra_details - Detalhes das medicações extras (qual medicação)
 * 12. collecting_purulent_discharge - Secreção purulenta (APENAS D+3 em diante)
 * 13. collecting_concerns - Preocupações finais
 */
function interpretResponseLocally(userMessage: string, conversationHistory: any[], dayNumber: number = 1): ClaudeAIResponse | null {
  const msg = userMessage.trim().toLowerCase();
  const currentPhase = determineCurrentPhase(conversationHistory);

  logger.debug('🔄 interpretResponseLocally:', { msg, currentPhase });

  // Mapeamento de números por extenso
  const numberWords: Record<string, number> = {
    'zero': 0, 'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3,
    'quatro': 4, 'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10
  };

  // Tentar extrair número
  let number: number | null = null;
  const numberMatch = msg.match(/\b(\d+)\b/);
  if (numberMatch) {
    number = parseInt(numberMatch[1]);
  } else {
    for (const [word, value] of Object.entries(numberWords)) {
      const regex = new RegExp(`\\b${word}\\b`);
      if (regex.test(msg)) {
        number = value;
        break;
      }
    }
  }

  // Detectar sim/não
  const isYes = /^(sim|s|yes|claro|ok|isso|positivo|afirmativo)$/i.test(msg.trim()) ||
    /\b(sim|yes|claro)\b/i.test(msg);
  const isNo = /^(não|nao|n|no|nope|negativo)$/i.test(msg.trim()) ||
    /\b(não|nao|nunca)\b/i.test(msg);

  // Tentar extrair hora (ex: "10h", "às 10", "10:30", "pela manhã")
  let timeExtracted: string | null = null;
  const timeMatch = msg.match(/(\d{1,2})[h:]?(\d{0,2})?/);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1]);
    if (hour >= 0 && hour <= 23) {
      timeExtracted = timeMatch[2] ? `${hour}:${timeMatch[2]}` : `${hour}h`;
    }
  }
  if (msg.includes('manhã') || msg.includes('manha')) timeExtracted = 'pela manhã';
  if (msg.includes('tarde')) timeExtracted = 'à tarde';
  if (msg.includes('noite')) timeExtracted = 'à noite';
  if (msg.includes('madrugada')) timeExtracted = 'de madrugada';

  // ========================================
  // FASE 1: DOR EM REPOUSO (0-10)
  // ========================================
  if (currentPhase === 'collecting_pain_at_rest' || currentPhase === 'collecting_pain' || currentPhase === 'greeting') {
    if (number !== null && number >= 0 && number <= 10) {
      // A IA agora decide dinamicamente se precisa perguntar sobre febre ou não (baseado na dor).
      // Se a IA decidir perguntar, ela gerenciará isso. 
      // Aqui apenas garantimos que se a IA perguntou sobre febre, a resposta seja processada pela própria IA.
      // Portanto, removemos o hardcoded state machine para febre e deixamos o fluxo seguir para a IA ou para o próximo passo lógico.

      return {
        message: `Entendi. Vamos continuar.`,
        needsImage: null,
        dataCollected: { painAtRest: number },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_bowel' // Pula direto para evacuação
      };
    }

    if (msg.includes('média') || msg.includes('moderada') || msg.includes('razoável') ||
      msg.includes('forte') || msg.includes('fraca') || msg.includes('leve') ||
      msg.includes('muita') || msg.includes('pouca') || msg.includes('bastante')) {
      return {
        message: `Entendo. Mas para eu registrar certinho, preciso de um número.\n\nOlhando a escala de dor, qual número de 0 a 10 representa sua dor em repouso agora?`,
        needsImage: 'pain_scale',
        dataCollected: {},
        completed: false,
        needsClarification: true,
        conversationPhase: 'collecting_pain_at_rest'
      };
    }

    return {
      message: `Desculpe, não entendi. Preciso que você me diga um número de 0 a 10 para sua dor em repouso (quando está parado).`,
      needsImage: 'pain_scale',
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_pain_at_rest'
    };
  }

  // FASE 2 & 3 (Febre) REMOVIDAS DA LÓGICA RÍGIDA - A IA GERENCIA DINAMICAMENTE

  // ========================================
  // FASE 3: EVACUAÇÃO (URINA FOI REMOVIDA DO FLUXO)
  // D+1: "Você já evacuou após a cirurgia?"
  // D+2+: "Você evacuou desde a nossa última conversa?"
  // ========================================
  if (currentPhase === 'collecting_bowel') {
    if (isYes) {
      return {
        message: `Certo. Mais ou menos que horas foi?`,
        needsImage: null,
        dataCollected: { hadBowelMovementSinceLastContact: true },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_bowel_time'
      };
    }
    if (isNo || msg.includes('ainda não') || msg.includes('ainda nao')) {
      return {
        message: `Entendi. Continue com os líquidos e laxantes. Teve sangramento?`,
        needsImage: null,
        dataCollected: { hadBowelMovementSinceLastContact: false },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_bleeding'
      };
    }

    // Clarificação também diferente para D+1 vs D+2+
    const clarification = dayNumber === 1
      ? `Não entendi. Você já foi ao banheiro (fazer cocô)? Responda sim ou não.`
      : `Não entendi. Você foi ao banheiro (fazer cocô) desde nossa última conversa? Responda sim ou não.`;

    return {
      message: clarification,
      needsImage: null,
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_bowel'
    };
  }

  // ========================================
  // FASE 6: HORA DA EVACUAÇÃO
  // ========================================
  if (currentPhase === 'collecting_bowel_time') {
    // Aceita qualquer indicação de hora
    const bowelTime = timeExtracted || userMessage;
    return {
      message: `Ok, por volta das ${bowelTime}. E *doeu muito na hora?*\n\nMe diga um número de 0 a 10:`,
      needsImage: 'pain_scale',
      dataCollected: { bowelMovementTime: bowelTime },
      completed: false,
      needsClarification: false,
      conversationPhase: 'collecting_pain_during_bm'
    };
  }

  // ========================================
  // FASE 7: DOR DURANTE EVACUAÇÃO (0-10)
  // ========================================
  if (currentPhase === 'collecting_pain_during_bm') {
    // Bristol APENAS em D+5 e D+10
    const shouldAskBristol = dayNumber === 5 || dayNumber === 10;

    if (number !== null && number >= 0 && number <= 10) {
      if (shouldAskBristol) {
        return {
          message: `Entendi, dor ${number}. Olhe a imagem abaixo: qual número (1 a 7) parece mais com o seu cocô?`,
          needsImage: 'bristol_scale',
          dataCollected: { painDuringBowelMovement: number },
          completed: false,
          needsClarification: false,
          conversationPhase: 'collecting_bristol'
        };
      } else {
        // Pular Bristol, ir direto para sangramento
        return {
          message: `Entendi, dor ${number}. Teve sangramento?`,
          needsImage: null,
          dataCollected: { painDuringBowelMovement: number },
          completed: false,
          needsClarification: false,
          conversationPhase: 'collecting_bleeding'
        };
      }
    }
    return {
      message: `Por favor, me diga apenas o número de 0 a 10 para a dor na hora de ir ao banheiro.`,
      needsImage: 'pain_scale',
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_pain_during_bm'
    };
  }

  // ========================================
  // FASE 8: BRISTOL (1-7)
  // ========================================
  if (currentPhase === 'collecting_bristol') {
    if (number !== null && number >= 1 && number <= 7) {
      const bristolComment = number <= 2 ? 'Fezes duras, beba mais água.'
        : number >= 6 ? 'Fezes líquidas. Fique atento.'
          : 'Consistência ok.';
      return {
        message: `Certo, tipo ${number}. ${bristolComment}\n\nTeve sangramento?`,
        needsImage: null,
        dataCollected: { bristolScale: number },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_bleeding'
      };
    }
    return {
      message: `Não entendi. Olhe a imagem e diga o número de 1 a 7.`,
      needsImage: 'bristol_scale',
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_bristol'
    };
  }

  // ========================================
  // FASE 9: SANGRAMENTO
  // ========================================
  if (currentPhase === 'collecting_bleeding') {
    if (isNo || msg.includes('nenhum') || msg.includes('zero')) {
      return {
        message: `Ok, sem sangramento. Está tomando os remédios nos horários certos?`,
        needsImage: null,
        dataCollected: { bleeding: 'none' },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_meds_prescribed'
      };
    }
    if (msg.includes('leve') || msg.includes('pouco') || msg.includes('papel') || msg.includes('gotas')) {
      return {
        message: `Certo, pouco sangue no papel é normal. Está tomando os remédios nos horários certos?`,
        needsImage: null,
        dataCollected: { bleeding: 'mild' },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_meds_prescribed'
      };
    }
    if (msg.includes('moderado') || msg.includes('roupa') || msg.includes('médio')) {
      return {
        message: `Entendi, sangramento moderado. Fique atento. Está tomando os remédios nos horários certos?`,
        needsImage: null,
        dataCollected: { bleeding: 'moderate' },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_meds_prescribed'
      };
    }
    if (msg.includes('intenso') || msg.includes('muito') || msg.includes('forte') || msg.includes('vaso')) {
      return {
        message: `⚠️ Sangramento intenso requer atenção. Se continuar, vá ao hospital. Está tomando os remédios nos horários certos?`,
        needsImage: null,
        dataCollected: { bleeding: 'severe' },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_meds_prescribed'
      };
    }
    if (isYes) {
      return {
        message: `Foi muito sangue?\n\n- *Leve*: só no papel\n- *Moderado*: manchou a roupa\n- *Intenso*: encheu o vaso`,
        needsImage: null,
        dataCollected: {},
        completed: false,
        needsClarification: true,
        conversationPhase: 'collecting_bleeding'
      };
    }
    return {
      message: `Teve sangramento? Responda sim ou não.`,
      needsImage: null,
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_bleeding'
    };
  }

  // ========================================
  // FASE 10: MEDICAÇÕES PRESCRITAS
  // ========================================
  if (currentPhase === 'collecting_meds_prescribed') {
    if (isYes || msg.includes('tomando') || msg.includes('tomo') || msg.includes('certinho') || msg.includes('horários')) {
      return {
        message: `Ótimo. Precisou tomar algum *outro* remédio para dor, além desses?`,
        needsImage: null,
        dataCollected: { takingPrescribedMeds: true, prescribedMedsDetails: msg.includes('certinho') ? 'tomando nos horários' : undefined },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_meds_extra'
      };
    }
    if (isNo || msg.includes('não estou') || msg.includes('esqueci') || msg.includes('parei')) {
      return {
        message: `Entendi. Tente tomar nos horários certos. Tomou algum *outro* remédio por conta própria?`,
        needsImage: null,
        dataCollected: { takingPrescribedMeds: false, prescribedMedsDetails: userMessage },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_meds_extra'
      };
    }
    if (msg.includes('algumas') || msg.includes('às vezes') || msg.includes('as vezes')) {
      return {
        message: `Entendi. Tente manter os horários. Precisou tomar algum *outro* remédio além desses?`,
        needsImage: null,
        dataCollected: { takingPrescribedMeds: true, prescribedMedsDetails: 'tomando irregularmente' },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_meds_extra'
      };
    }
    return {
      message: `Está tomando os remédios receitados direitinho? Responda sim ou não.`,
      needsImage: null,
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_meds_prescribed'
    };
  }

  // ========================================
  // FASE 11: MEDICAÇÕES EXTRAS (além das prescritas)
  // ========================================
  if (currentPhase === 'collecting_meds_extra') {
    if (isNo || msg.includes('não precisei') || msg.includes('só as receitadas') || msg.includes('apenas')) {
      // Verificar se precisa perguntar sobre secreção purulenta (D+3)
      // Como não temos acesso ao dayNumber aqui, vamos para concerns
      // A IA vai verificar se precisa perguntar sobre secreção
      return {
        message: `Ok. Tem mais alguma dúvida ou sintoma?`,
        needsImage: null,
        dataCollected: { takingExtraMeds: false },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_concerns'
      };
    }
    if (isYes || msg.includes('tomei') || msg.includes('comprei') || msg.includes('tramadol') || msg.includes('tylenol') || msg.includes('paracetamol') || msg.includes('morfina') || msg.includes('codeína')) {
      // Se já mencionou qual medicação, registrar
      const mentionedMeds = [];
      if (msg.includes('tramadol')) mentionedMeds.push('tramadol');
      if (msg.includes('tylenol') || msg.includes('paracetamol')) mentionedMeds.push('paracetamol');
      if (msg.includes('morfina')) mentionedMeds.push('morfina');
      if (msg.includes('codeína') || msg.includes('codeina')) mentionedMeds.push('codeína');

      if (mentionedMeds.length > 0) {
        return {
          message: `Certo, anotado (${mentionedMeds.join(', ')}). Tem mais alguma dúvida?`,
          needsImage: null,
          dataCollected: { takingExtraMeds: true, extraMedsDetails: mentionedMeds.join(', ') },
          completed: false,
          needsClarification: false,
          conversationPhase: 'collecting_concerns'
        };
      }

      return {
        message: `Qual remédio você tomou a mais?`,
        needsImage: null,
        dataCollected: { takingExtraMeds: true },
        completed: false,
        needsClarification: true,
        conversationPhase: 'collecting_meds_extra_details'
      };
    }
    return {
      message: `Precisou tomar algum outro remédio além dos receitados? Responda sim ou não.`,
      needsImage: null,
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_meds_extra'
    };
  }

  // ========================================
  // FASE 11b: DETALHES DAS MEDICAÇÕES EXTRAS
  // ========================================
  if (currentPhase === 'collecting_meds_extra_details') {
    return {
      message: `Entendi, vou registrar: ${userMessage}. Última pergunta: tem alguma outra preocupação ou sintoma que gostaria de me contar?`,
      needsImage: null,
      dataCollected: { takingExtraMeds: true, extraMedsDetails: userMessage },
      completed: false,
      needsClarification: false,
      conversationPhase: 'collecting_concerns'
    };
  }

  // ========================================
  // FASE 12: SECREÇÃO PURULENTA (apenas D+3 em diante)
  // NOTA: Esta fase só é ativada pela IA quando dayNumber >= 3
  // ========================================
  if (currentPhase === 'collecting_purulent_discharge') {
    if (isNo || msg.includes('não') || msg.includes('nenhuma') || msg.includes('limpo') || msg.includes('normal')) {
      return {
        message: `Ótimo, sem sinais de secreção anormal. Última pergunta: tem alguma outra preocupação ou sintoma que gostaria de me contar?`,
        needsImage: null,
        dataCollected: { hasPurulentDischarge: false },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_concerns'
      };
    }
    if (isYes || msg.includes('pus') || msg.includes('amarela') || msg.includes('verde') || msg.includes('cheiro') || msg.includes('fede')) {
      return {
        message: `⚠️ Secreção purulenta pode indicar infecção e precisa ser avaliada. Vou registrar isso e o Dr. João Vitor vai analisar. Tem alguma outra preocupação?`,
        needsImage: null,
        dataCollected: { hasPurulentDischarge: true, purulentDischargeDetails: userMessage },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_concerns'
      };
    }
    if (msg.includes('clara') || msg.includes('aquosa') || msg.includes('serosa') || msg.includes('transparente')) {
      return {
        message: `Secreção clara/aquosa é normal na cicatrização, faz parte do processo. Última pergunta: tem alguma outra preocupação ou sintoma?`,
        needsImage: null,
        dataCollected: { hasPurulentDischarge: false, purulentDischargeDetails: 'secreção serosa (normal)' },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_concerns'
      };
    }
    return {
      message: `Desculpe, não entendi. Você notou saída de secreção amarelada/esverdeada com mau cheiro (pus) no local da cirurgia? Responda sim ou não.\n\n_Obs: Secreção clara/aquosa é normal._`,
      needsImage: null,
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_purulent_discharge'
    };
  }

  // ========================================
  // FASE 13: PREOCUPAÇÕES
  // ========================================
  if (currentPhase === 'collecting_concerns') {
    const hasConcerns = !isNo && msg.length > 2 && msg !== 'nada' && msg !== 'não' && msg !== 'nao';

    // Se é D+14, ir para pesquisa de satisfação
    if (dayNumber === 14) {
      return {
        message: `Registrei suas informações. ${hasConcerns ? '' : ''}

Agora, vamos fazer algumas perguntas finais sobre sua experiência durante o acompanhamento.

*De 0 a 10, quão satisfeito você está com o controle da dor durante todo o período pós-operatório?*

(0 = Muito insatisfeito, 10 = Muito satisfeito)`,
        needsImage: null,
        dataCollected: { otherSymptoms: hasConcerns ? userMessage : undefined },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_satisfaction_pain'
      };
    }

    // Dias normais (não D+14): finalizar
    return {
      message: `Obrigado por compartilhar! Registrei todas as informações. Seu médico vai analisar e, se necessário, entrará em contato. Boa recuperação! 💙`,
      needsImage: null,
      dataCollected: { otherSymptoms: hasConcerns ? userMessage : undefined },
      completed: true,
      needsClarification: false,
      conversationPhase: 'completed'
    };
  }

  // ========================================
  // FASE 14: SATISFAÇÃO COM ANALGESIA (APENAS D+14)
  // ========================================
  if (currentPhase === 'collecting_satisfaction_pain') {
    if (number !== null && number >= 0 && number <= 10) {
      return {
        message: `Entendi, satisfação ${number}/10 com o controle da dor.

*De 0 a 10, como você avalia este acompanhamento pós-operatório por WhatsApp com inteligência artificial?*

(0 = Muito ruim, 10 = Excelente)`,
        needsImage: null,
        dataCollected: { painControlSatisfaction: number },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_satisfaction_ai'
      };
    }
    return {
      message: `Por favor, me diga um número de 0 a 10 para sua satisfação com o controle da dor.`,
      needsImage: null,
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_satisfaction_pain'
    };
  }

  // ========================================
  // FASE 15: SATISFAÇÃO COM ACOMPANHAMENTO IA (APENAS D+14)
  // ========================================
  if (currentPhase === 'collecting_satisfaction_ai') {
    if (number !== null && number >= 0 && number <= 10) {
      return {
        message: `Avaliação ${number}/10 para o acompanhamento por IA.

*De 0 a 10, qual a probabilidade de você recomendar este acompanhamento por WhatsApp a um amigo ou familiar que fosse fazer uma cirurgia similar?*

(0 = Não recomendaria, 10 = Recomendaria com certeza)`,
        needsImage: null,
        dataCollected: { aiFollowUpSatisfaction: number },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_nps'
      };
    }
    return {
      message: `Por favor, me diga um número de 0 a 10 para avaliar o acompanhamento por IA.`,
      needsImage: null,
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_satisfaction_ai'
    };
  }

  // ========================================
  // FASE 16: NPS - NET PROMOTER SCORE (APENAS D+14)
  // ========================================
  if (currentPhase === 'collecting_nps') {
    if (number !== null && number >= 0 && number <= 10) {
      return {
        message: `Probabilidade de recomendação: ${number}/10.

Por último, *gostaria de deixar algum comentário ou sugestão sobre o acompanhamento?*

(Pode escrever livremente ou responder "não" se preferir)`,
        needsImage: null,
        dataCollected: { npsScore: number },
        completed: false,
        needsClarification: false,
        conversationPhase: 'collecting_feedback'
      };
    }
    return {
      message: `Por favor, me diga um número de 0 a 10 para a probabilidade de recomendação.`,
      needsImage: null,
      dataCollected: {},
      completed: false,
      needsClarification: true,
      conversationPhase: 'collecting_nps'
    };
  }

  // ========================================
  // FASE 17: FEEDBACK ABERTO (APENAS D+14) - FINAL
  // ========================================
  if (currentPhase === 'collecting_feedback') {
    const hasFeedback = !isNo && msg.length > 2 && msg !== 'nada' && msg !== 'não' && msg !== 'nao';
    return {
      message: `*Muito obrigado por participar do acompanhamento pós-operatório!* 🎉

${hasFeedback ? 'Agradecemos seu feedback, ele é muito importante para melhorarmos o sistema.' : ''}

Todas as informações foram registradas. Seu médico receberá um relatório completo do seu acompanhamento.

Desejamos uma excelente recuperação! 💙`,
      needsImage: null,
      dataCollected: { feedback: hasFeedback ? userMessage : undefined },
      completed: true,
      needsClarification: false,
      conversationPhase: 'completed'
    };
  }

  // Fallback - não avança
  return {
    message: `Desculpe, não consegui entender sua resposta. Pode repetir de forma mais clara?`,
    needsImage: null,
    dataCollected: {},
    completed: false,
    needsClarification: true,
    conversationPhase: currentPhase
  };
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
      logger.debug('⚠️ Questionário já completado - respondendo contextualmente');
      await sendEmpatheticResponse(
        phone,
        `Olá ${patient.name.split(' ')[0]}! Você já completou o questionário de hoje. ` +
        'Se tiver alguma preocupação adicional, entre em contato diretamente com o consultório.'
      );
      return;
    }

    // 2. Obter fase atual salva no banco
    const savedPhase = questionnaireData.conversationPhase || 'collecting_data';

    // 3. Buscar protocolos aplicáveis
    const protocols = await findApplicableProtocols(
      patient.userId,
      followUp.surgery.type,
      followUp.dayNumber,
      patient.researchId
    );

    const protocolText = formatProtocolsForPrompt(protocols);

    // 4. Chamar Claude API com a fase atual e protocolos
    const aiResponse = await callClaudeAPI(
      conversationHistory,
      message,
      patient,
      followUp.surgery.type,
      followUp.dayNumber,
      savedPhase,
      questionnaireData.extractedData,
      protocolText,
      patient.doctorName || 'seu médico'
    );

    // 5. Enviar resposta da IA
    await sendEmpatheticResponse(phone, aiResponse.message);

    if (aiResponse.needsImage) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await sendImageScale(phone, aiResponse.needsImage);
    }

    // 6. Atualizar histórico
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse.message }
    );

    const mergedData = {
      ...questionnaireData.extractedData,
      ...aiResponse.dataCollected,
    };

    // 7. Atualizar banco
    const updatedQuestionnaireData = {
      conversation: conversationHistory,
      extractedData: mergedData,
      completed: aiResponse.completed,
      conversationPhase: aiResponse.conversationPhase,
    };

    if (response) {
      await prisma.followUpResponse.update({
        where: { id: response.id },
        data: { questionnaireData: JSON.stringify(updatedQuestionnaireData) },
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
    logger.error('❌ Erro ao processar resposta com IA:', error);
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
      scheduledDate: 'asc', // Priorizar o follow-up mais antigo (D1 antes de D2)
    },
  });

  return followUp;
}



