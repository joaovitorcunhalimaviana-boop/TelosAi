/**
 * Gerenciador de Conversações WhatsApp
 * Controla o fluxo de diálogo com pacientes
 */

import { prisma } from './prisma';
import { Patient, Surgery, FollowUp } from '@prisma/client';
import { sendMessage } from './whatsapp';

export type ConversationState =
  | 'idle'
  | 'awaiting_consent'
  | 'collecting_answers'
  | 'completed';

export interface ConversationContext {
  followUpId?: string;
  currentQuestion?: number;
  answers?: Record<string, any>;
  templateSent?: boolean;
  templateSentAt?: string;
}

/**
 * Obtém ou cria uma conversa para um número de telefone
 */
export async function getOrCreateConversation(phoneNumber: string, patientId?: string) {
  // Formatar número (remover caracteres não numéricos)
  let formattedPhone = phoneNumber.replace(/\D/g, '');

  // Remover código do país (55) se presente para normalizar
  if (formattedPhone.startsWith('55') && formattedPhone.length > 11) {
    formattedPhone = formattedPhone.substring(2);
  }

  // Tentar encontrar conversa existente
  let conversation = await prisma.conversation.findUnique({
    where: { phoneNumber: formattedPhone }
  });

  // Se não encontrou, tentar com variações do número
  if (!conversation) {
    // Tentar com 55 na frente
    conversation = await prisma.conversation.findUnique({
      where: { phoneNumber: '55' + formattedPhone }
    });
  }

  if (!conversation) {
    // Tentar pelos últimos 9 dígitos (mais confiável)
    const last9 = formattedPhone.slice(-9);
    conversation = await prisma.conversation.findFirst({
      where: { phoneNumber: { endsWith: last9 } }
    });
  }

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        phoneNumber: formattedPhone,
        patientId,
        state: 'idle',
        context: {}
      }
    });
    console.log('📞 Nova conversa criada:', formattedPhone, 'patientId:', patientId);
  } else if (patientId && !conversation.patientId) {
    // Associar paciente se ainda não estava associado
    conversation = await prisma.conversation.update({
      where: { id: conversation.id },
      data: { patientId }
    });
    console.log('📞 PatientId associado à conversa existente:', conversation.phoneNumber);
  }

  return conversation;
}

/**
 * Atualiza o estado da conversa
 */
export async function updateConversationState(
  conversationId: string,
  state: ConversationState,
  context?: Partial<ConversationContext>
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const currentContext = (conversation.context as ConversationContext) || {};
  const newContext = { ...currentContext, ...context };

  return await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      state,
      context: newContext,
      updatedAt: new Date()
    }
  });
}

/**
 * Registra mensagem do usuário na conversa
 */
export async function recordUserMessage(
  conversationId: string,
  message: string
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const history = (conversation.messageHistory as any[]) || [];
  history.push({
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  });

  return await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastUserMessage: message,
      lastUserMessageAt: new Date(),
      messageHistory: history
    }
  });
}

/**
 * Registra mensagem do sistema na conversa
 */
export async function recordSystemMessage(
  conversationId: string,
  message: string
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const history = (conversation.messageHistory as any[]) || [];
  history.push({
    role: 'system',
    content: message,
    timestamp: new Date().toISOString()
  });

  return await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastSystemMessage: message,
      lastSystemMessageAt: new Date(),
      messageHistory: history
    }
  });
}

/**
 * Marca que um template foi enviado
 */
export async function markTemplateSent(
  phoneNumber: string,
  followUpId: string,
  patientId?: string
) {
  const conversation = await getOrCreateConversation(phoneNumber, patientId);

  return await updateConversationState(
    conversation.id,
    'awaiting_consent',
    {
      followUpId,
      templateSent: true,
      templateSentAt: new Date().toISOString()
    }
  );
}

/**
 * Verifica se paciente está aguardando para responder questionário
 */
export async function isAwaitingQuestionnaire(phoneNumber: string): Promise<boolean> {
  const formattedPhone = phoneNumber.replace(/\D/g, '');

  const conversation = await prisma.conversation.findUnique({
    where: { phoneNumber: formattedPhone }
  });

  if (!conversation) return false;

  // Considera "aguardando" se:
  // 1. Estado é 'awaiting_consent' (acabou de receber template)
  // 2. Template foi enviado há menos de 24 horas
  if (conversation.state === 'awaiting_consent') {
    const context = conversation.context as ConversationContext;
    if (context?.templateSentAt) {
      const sentAt = new Date(context.templateSentAt);
      const hoursSince = (Date.now() - sentAt.getTime()) / (1000 * 60 * 60);
      return hoursSince < 24; // Template válido por 24h
    }
  }

  return false;
}

/**
 * Obtém o follow-up associado à conversa atual
 */
export async function getConversationFollowUp(phoneNumber: string): Promise<string | null> {
  const formattedPhone = phoneNumber.replace(/\D/g, '');

  const conversation = await prisma.conversation.findUnique({
    where: { phoneNumber: formattedPhone }
  });

  if (!conversation) return null;

  const context = conversation.context as ConversationContext;
  return context?.followUpId || null;
}

/**
 * Inicia coleta de respostas do questionário
 */
export async function startQuestionnaireCollection(
  phoneNumber: string,
  patient: Patient,
  surgery: Surgery
) {
  const conversation = await getOrCreateConversation(phoneNumber, patient.id);
  const context = conversation.context as ConversationContext;

  // Calcular dias pós-operatórios usando timezone de Brasília (evita off-by-one)
  const { toBrasiliaTime } = await import('./date-utils');
  const nowBrasilia = toBrasiliaTime(new Date());
  const surgeryBrasilia = toBrasiliaTime(surgery.date);
  const nowDayStart = new Date(nowBrasilia.getFullYear(), nowBrasilia.getMonth(), nowBrasilia.getDate());
  const surgeryDayStart = new Date(surgeryBrasilia.getFullYear(), surgeryBrasilia.getMonth(), surgeryBrasilia.getDate());
  const daysPostOp = Math.round((nowDayStart.getTime() - surgeryDayStart.getTime()) / (1000 * 60 * 60 * 24));

  // Atualizar estado para coleta de respostas
  await updateConversationState(
    conversation.id,
    'collecting_answers',
    {
      followUpId: context.followUpId,
      answers: {}
    }
  );

  // Enviar saudação inicial usando IA conversacional
  const { getInitialGreeting } = await import('./conversational-ai');
  const greeting = await getInitialGreeting(patient, surgery, daysPostOp + 1, phoneNumber);

  await sendMessage(phoneNumber, greeting);
  await recordSystemMessage(conversation.id, greeting);
}

/**
 * Define as perguntas do questionário baseado no tipo de cirurgia
 */
function getQuestions(surgeryType: string) {
  const baseQuestions = [
    {
      id: 'pain',
      text: '📊 Como está sua dor agora? Por favor, responda de 0 a 10:\n\n0 = Sem dor\n10 = Dor insuportável'
    },
    {
      id: 'bowel',
      text: '💩 Você conseguiu evacuar hoje?'
    },
    {
      id: 'bleeding',
      text: '🩸 Está tendo sangramento? Se sim, quanto?\n\n1 = Nenhum\n2 = Leve (gotas no papel)\n3 = Moderado (mancha a roupa)\n4 = Intenso (encheu vaso)'
    },
    {
      id: 'urination',
      text: '🚽 Conseguiu urinar normalmente?'
    },
    {
      id: 'fever',
      text: '🌡️ Teve febre? Se sim, qual foi a temperatura?'
    },
    {
      id: 'meds',
      text: '💊 Está tomando as medicações conforme prescrito?'
    },
    {
      id: 'concerns',
      text: '❓ Tem alguma dúvida ou preocupação que gostaria de compartilhar?'
    }
  ];

  return baseQuestions;
}

/**
 * Processa resposta do paciente durante questionário usando IA conversacional
 */
export async function processQuestionnaireAnswer(
  phoneNumber: string,
  answer: string
): Promise<{ completed: boolean; nextQuestion?: string; needsDoctorAlert?: boolean }> {
  const conversation = await getOrCreateConversation(phoneNumber);
  const context = conversation.context as ConversationContext;

  // Registrar resposta
  await recordUserMessage(conversation.id, answer);

  // Obter paciente e cirurgia
  const patient = await prisma.patient.findUnique({
    where: { id: conversation.patientId! },
    include: {
      surgeries: {
        orderBy: { date: 'desc' },
        take: 1
      }
    }
  });

  if (!patient || !patient.surgeries[0]) {
    throw new Error('Paciente ou cirurgia não encontrado');
  }

  const surgery = patient.surgeries[0];
  const currentData = context.answers || {};

  // Obter histórico de conversação
  const messageHistory = (conversation.messageHistory as any[]) || [];
  const conversationMessages = messageHistory
    .slice(-20) // Últimas 20 mensagens para contexto (10 turnos de conversa)
    .map(msg => ({
      role: msg.role === 'system' ? 'assistant' : msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    }));

  // Buscar dayNumber do follow-up para evitar erro de cálculo por relógio (respostas após meia-noite)
  let followUpDayNumber: number | undefined;
  if (context.followUpId) {
    const followUp = await prisma.followUp.findUnique({
      where: { id: context.followUpId },
      select: { dayNumber: true }
    });
    followUpDayNumber = followUp?.dayNumber;
  }

  // Usar IA conversacional para processar resposta
  const { conductConversation } = await import('./conversational-ai');
  const result = await conductConversation(
    answer,
    patient,
    surgery,
    conversationMessages,
    currentData,
    followUpDayNumber
  );

  // Enviar imagens se a IA solicitou
  if (result.sendImages) {
    const { sendImage } = await import('./whatsapp');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proactive-rejoicing-production.up.railway.app';

    try {
      if (result.sendImages.painScale) {
        await sendImage(
          phoneNumber,
          `${baseUrl}/escala-dor.png`,
          'Escala Numérica de Dor (0-10)'
        );
        console.log('✅ Pain scale image sent');
      }

    } catch (error) {
      console.error('❌ Error sending images:', error);
      // Continuar mesmo se falhar
    }
  }

  // Atualizar dados coletados
  await updateConversationState(
    conversation.id,
    result.isComplete ? 'completed' : 'collecting_answers',
    {
      followUpId: context.followUpId,
      answers: result.updatedData
    }
  );

  // Enviar resposta da IA
  await sendMessage(phoneNumber, result.aiResponse);
  await recordSystemMessage(conversation.id, result.aiResponse);

  if (result.isComplete) {
    // Salvar respostas no FollowUp
    if (context.followUpId) {
      // Buscar conversa atualizada para salvar o histórico completo
      const updatedConversation = await prisma.conversation.findUnique({
        where: { id: conversation.id }
      });
      const fullMessageHistory = (updatedConversation?.messageHistory as any[]) || [];

      // Formatar conversa para exibição
      const conversationForSave = fullMessageHistory.map(msg => ({
        role: msg.role === 'system' ? 'assistant' : msg.role,
        content: msg.content
      }));

      await saveQuestionnaireResponse(
        context.followUpId,
        result.updatedData,
        patient.userId,
        result.urgencyLevel,
        conversationForSave
      );
    }

    // Enviar mensagem de agradecimento
    const doctorName = (patient as any).doctorName || (patient as any).user?.nomeCompleto || 'seu médico';
    const thankYouMessage =
      '✅ Perfeito! Muito obrigada por compartilhar essas informações comigo.\n\n' +
      `Vou passar tudo para ${doctorName}. Tudo será analisado com atenção e, se necessário, entrarão em contato com você.\n\n` +
      'Lembre-se: se sentir qualquer sintoma que te preocupe, pode me mandar mensagem a qualquer momento. Estou aqui para ajudar! 😊\n\n' +
      'Boa recuperação! 💙';

    await sendMessage(phoneNumber, thankYouMessage);
    await recordSystemMessage(conversation.id, thankYouMessage);

    // Resetar conversa para idle após 1 minuto
    setTimeout(async () => {
      await updateConversationState(conversation.id, 'idle', {
        followUpId: undefined,
        answers: undefined,
        templateSent: false
      });
    }, 60000);

    return {
      completed: true,
      needsDoctorAlert: result.needsDoctorAlert
    };
  }

  return {
    completed: false,
    nextQuestion: result.aiResponse,
    needsDoctorAlert: result.needsDoctorAlert
  };
}

/**
 * Salva as respostas do questionário no banco
 */
async function saveQuestionnaireResponse(
  followUpId: string,
  answers: Record<string, any>,
  userId: string,
  urgencyLevel: string = 'low',
  conversation: Array<{ role: string; content: string }> = []
) {
  // Buscar follow-up para obter surgeryId e dayNumber
  const followUp = await prisma.followUp.findUnique({
    where: { id: followUpId },
    include: { surgery: true }
  });

  if (!followUp) {
    throw new Error('FollowUp not found');
  }

  // Atualizar status do follow-up
  await prisma.followUp.update({
    where: { id: followUpId },
    data: {
      status: 'responded',
      respondedAt: new Date()
    }
  });

  // Se evacuou e ainda não havia registrado primeira evacuação, registrar
  if (
    answers.bowelMovementSinceLastContact === true &&
    !followUp.surgery.hadFirstBowelMovement
  ) {
    const { recordFirstBowelMovement } = await import('./bowel-movement-tracker');
    await recordFirstBowelMovement(
      followUp.surgeryId,
      followUp.dayNumber,
      answers.painDuringBowelMovement || 0,
      new Date(),
      answers.bowelMovementTime || undefined
    );
    console.log('✅ First bowel movement recorded:', {
      dayNumber: followUp.dayNumber,
      painDuringBM: answers.painDuringBowelMovement
    });
  }

  // Mapear níveis de urgência
  const riskLevelMap: Record<string, string> = {
    'low': 'low',
    'medium': 'medium',
    'high': 'high',
    'critical': 'critical'
  };

  const riskLevel = riskLevelMap[urgencyLevel] || 'low';

  // Criar ou atualizar resposta de follow-up com conversa incluída
  const dataToSave = {
    ...answers,
    conversation: conversation
  };

  // Verificar se já existe resposta para este follow-up
  const existingResponse = await prisma.followUpResponse.findFirst({
    where: { followUpId }
  });

  if (existingResponse) {
    // Atualizar resposta existente
    await prisma.followUpResponse.update({
      where: { id: existingResponse.id },
      data: {
        questionnaireData: JSON.stringify(dataToSave),
        riskLevel,
        painAtRest: answers.pain ?? null,
        painDuringBowel: answers.painDuringBowelMovement ?? null,
        bleeding: answers.bleeding === 'severe' || answers.bleeding === 'moderate' ? true : false,
        fever: answers.fever ?? false
      }
    });
    console.log('✅ Questionário ATUALIZADO no banco de dados (resposta existente)');
  } else {
    // Criar nova resposta
    await prisma.followUpResponse.create({
      data: {
        userId,
        followUpId,
        questionnaireData: JSON.stringify(dataToSave),
        riskLevel,
        painAtRest: answers.pain ?? null,
        painDuringBowel: answers.painDuringBowelMovement ?? null,
        bleeding: answers.bleeding === 'severe' || answers.bleeding === 'moderate' ? true : false,
        fever: answers.fever ?? false
      }
    });
    console.log('✅ Questionário CRIADO no banco de dados (nova resposta)');
  }
}

/**
 * Reseta conversa para estado inicial
 */
export async function resetConversation(phoneNumber: string) {
  const formattedPhone = phoneNumber.replace(/\D/g, '');

  const conversation = await prisma.conversation.findUnique({
    where: { phoneNumber: formattedPhone }
  });

  if (conversation) {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        state: 'idle',
        context: {},
        lastSystemMessage: null,
        lastUserMessage: null
      }
    });
  }
}
