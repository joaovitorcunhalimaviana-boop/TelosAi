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
  const formattedPhone = phoneNumber.replace(/\D/g, '');

  let conversation = await prisma.conversation.findUnique({
    where: { phoneNumber: formattedPhone }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        phoneNumber: formattedPhone,
        patientId,
        state: 'idle',
        context: {}
      }
    });
  } else if (patientId && !conversation.patientId) {
    // Associar paciente se ainda não estava associado
    conversation = await prisma.conversation.update({
      where: { id: conversation.id },
      data: { patientId }
    });
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
  followUpId: string
) {
  const conversation = await getOrCreateConversation(phoneNumber);

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

  // Calcular dias pós-operatórios
  const daysPostOp = Math.floor((Date.now() - surgery.date.getTime()) / (1000 * 60 * 60 * 24));

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
    .slice(-10) // Últimas 10 mensagens para contexto
    .map(msg => ({
      role: msg.role === 'system' ? 'assistant' : msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    }));

  // Usar IA conversacional para processar resposta
  const { conductConversation } = await import('./conversational-ai');
  const result = await conductConversation(
    answer,
    patient,
    surgery,
    conversationMessages,
    currentData
  );

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
      await saveQuestionnaireResponse(
        context.followUpId,
        result.updatedData,
        patient.userId,
        result.urgencyLevel
      );
    }

    // Enviar mensagem de agradecimento
    const thankYouMessage =
      '✅ Perfeito! Muito obrigada por compartilhar essas informações comigo.\n\n' +
      'Vou passar tudo para o Dr. João Vitor. Ele vai analisar com atenção e, se necessário, entrará em contato com você.\n\n' +
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
  urgencyLevel: string = 'low'
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
      answers.stoolConsistency || 4
    );
    console.log('✅ First bowel movement recorded:', {
      dayNumber: followUp.dayNumber,
      painDuringBM: answers.painDuringBowelMovement,
      stoolConsistency: answers.stoolConsistency
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

  // Criar resposta de follow-up
  await prisma.followUpResponse.create({
    data: {
      userId,
      followUpId,
      questionnaireData: JSON.stringify(answers),
      riskLevel
    }
  });

  console.log('✅ Questionário salvo no banco de dados');
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
