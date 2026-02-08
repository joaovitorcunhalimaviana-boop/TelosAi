/**
 * WhatsApp Business API Client
 * Integração com Meta Cloud API para envio de mensagens
 */

import { Patient, Surgery, FollowUp } from '@prisma/client';

import { prisma } from '@/lib/prisma';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

/**
 * Obtém o token do WhatsApp do banco de dados ou variável de ambiente
 */
async function getWhatsAppToken(): Promise<string> {
  try {
    // Tentar buscar do banco primeiro
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'WHATSAPP_ACCESS_TOKEN' }
    });

    if (config?.value) {
      return config.value;
    }
  } catch (error) {
    console.warn('⚠️ Failed to fetch WhatsApp token from DB, falling back to env var:', error);
  }

  // Fallback para variável de ambiente
  return process.env.WHATSAPP_ACCESS_TOKEN || '';
}

export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'interactive' | 'image';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  interactive?: {
    type: 'button' | 'list';
    body: {
      text: string;
    };
    action: any;
  };
  image?: {
    link: string;
    caption?: string;
  };
}

export interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

/**
 * Envia imagem via WhatsApp
 */
export async function sendImage(
  to: string,
  imageUrl: string,
  caption?: string
): Promise<WhatsAppResponse> {
  try {
    const formattedPhone = formatPhoneNumber(to);
    const token = await getWhatsAppToken();

    console.log('📸 Sending WhatsApp image:', {
      to: formattedPhone,
      imageUrl,
      hasCaption: !!caption,
    });

    const payload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'image',
      image: {
        link: imageUrl,
        ...(caption && { caption })
      }
    };

    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ WhatsApp Image API Error:', error);
      throw new Error(`WhatsApp Image API Error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    console.log('✅ WhatsApp image sent successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error sending WhatsApp image:', error);
    throw error;
  }
}

/**
 * Envia mensagem de texto simples
 */
export async function sendMessage(
  to: string,
  message: string
): Promise<WhatsAppResponse> {
  try {
    // Formatar número de telefone (remover caracteres especiais)
    const formattedPhone = formatPhoneNumber(to);
    const token = await getWhatsAppToken();

    console.log('📱 Sending WhatsApp message:', {
      originalPhone: to,
      formattedPhone,
      messagePreview: message.substring(0, 100) + '...',
      apiUrl: `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      hasToken: !!token,
      hasPhoneId: !!PHONE_NUMBER_ID,
    });

    const payload: WhatsAppMessage = {
      to: formattedPhone,
      type: 'text',
      text: {
        body: message,
      },
    };

    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          ...payload,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ WhatsApp API Error:', {
        status: response.status,
        statusText: response.statusText,
        error,
      });
      throw new Error(`WhatsApp API Error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    console.log('✅ WhatsApp message sent successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    throw error;
  }
}

/**
 * Envia template aprovado pela Meta
 */
export async function sendTemplate(
  to: string,
  templateName: string,
  components?: any[],
  languageCode?: string
): Promise<WhatsAppResponse> {
  try {
    const formattedPhone = formatPhoneNumber(to);
    const token = await getWhatsAppToken();

    // Template uses "pt_BR" for all cases now
    const language = languageCode || 'pt_BR';

    const payload: WhatsAppMessage = {
      to: formattedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language,
        },
        components,
      },
    };

    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          ...payload,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('WhatsApp Template API Error:', error);
      throw new Error(`WhatsApp Template API Error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    console.log('WhatsApp template sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending WhatsApp template:', error);
    throw error;
  }
}

/**
 * Envia mensagem interativa (botões ou lista)
 */
export async function sendInteractiveMessage(
  to: string,
  body: string,
  action: any,
  type: 'button' | 'list' = 'button'
): Promise<WhatsAppResponse> {
  try {
    const formattedPhone = formatPhoneNumber(to);
    const token = await getWhatsAppToken();

    const payload: WhatsAppMessage = {
      to: formattedPhone,
      type: 'interactive',
      interactive: {
        type,
        body: {
          text: body,
        },
        action,
      },
    };

    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          ...payload,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('WhatsApp Interactive API Error:', error);
      throw new Error(`WhatsApp Interactive API Error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    console.log('WhatsApp interactive message sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending WhatsApp interactive message:', error);
    throw error;
  }
}

/**
 * Envia questionário de follow-up usando template aprovado
 */
export async function sendFollowUpQuestionnaire(
  followUp: FollowUp,
  patient: Patient,
  surgery: Surgery
): Promise<WhatsAppResponse> {
  try {
    // Usar template baseado no dia
    // D1: usar 'day1' (mais completo e empático)
    // D2+: usar 'otherdays' (continuação)
    const templateName = followUp.dayNumber === 1 ? 'day1' : 'otherdays';
    const patientFirstName = patient.name.split(' ')[0] || 'Paciente';

    // Componentes usando formato NAMED
    let components: any[] = [];

    // Ambos os templates (day1 e otherdays) usam formato NAMED com {{customer_name}}
    components = [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            parameter_name: 'customer_name',
            text: patientFirstName
          }
        ]
      }
    ];

    // day1 uses 'en' (legacy template issue), others use 'pt_BR'
    // This fixes the encoding/question marks issue
    const language = templateName === 'day1' ? 'en' : 'pt_BR';

    console.log('📱 Sending template message:', {
      template: templateName,
      language,
      to: patient.phone,
      patientName: patientFirstName,
      dayNumber: followUp.dayNumber
    });

    const response = await sendTemplate(patient.phone, templateName, components, language);

    // Marcar que o template foi enviado (para gestão de conversa)
    const { markTemplateSent, recordSystemMessage, getOrCreateConversation } = await import('./conversation-manager');
    await markTemplateSent(patient.phone, followUp.id, patient.id);

    // Salvar mensagem do template no histórico para aparecer na visualização
    const conversation = await getOrCreateConversation(patient.phone, patient.id);
    // Nome do médico dinâmico
    const doctorName = (patient as any).doctorName || (patient as any).user?.nomeCompleto || 'seu médico';
    const templateMessage = templateName === 'day1'
      ? `[Template D+1] Olá ${patientFirstName}! Sou a assistente virtual de ${doctorName}. Tudo bem com você? 😊 Hoje é seu primeiro dia após a cirurgia e gostaria de saber como está se sentindo. Posso fazer algumas perguntas rápidas? Responda SIM para começarmos!`
      : `[Template D+${followUp.dayNumber}] Olá ${patientFirstName}! Tudo bem? 😊 Estou passando para acompanhar sua recuperação. Posso fazer algumas perguntas rápidas? Responda SIM para começarmos!`;

    await recordSystemMessage(conversation.id, templateMessage);

    console.log('✅ Template marked as sent in conversation manager with patientId:', patient.id);
    console.log('✅ Template message saved to conversation history');

    return response;
  } catch (error) {
    console.error('Error sending follow-up questionnaire:', error);
    throw error;
  }
}

/**
 * Envia resposta empática ao paciente
 */
export async function sendEmpatheticResponse(
  phone: string,
  message: string
): Promise<WhatsAppResponse> {
  return await sendMessage(phone, message);
}

/**
 * Envia alerta ao médico via notificação no dashboard
 * Cria uma notificação no banco de dados que aparece no painel do médico
 */
export async function sendDoctorAlert(
  patientName: string,
  dayNumber: number,
  riskLevel: string,
  redFlags: string[],
  doctorId?: string
): Promise<void> {
  if (!doctorId) {
    console.warn('Doctor ID not provided. Alert notification not created.');
    return;
  }

  const message = `Paciente: ${patientName}\n` +
    `Dia: D+${dayNumber}\n` +
    `Nível de risco: ${riskLevel.toUpperCase()}\n\n` +
    `Red Flags detectados:\n` +
    redFlags.map(flag => `• ${flag}`).join('\n');

  try {
    await prisma.notification.create({
      data: {
        userId: doctorId,
        type: 'red_flag',
        title: 'Alerta de Paciente',
        message: message,
        priority: riskLevel === 'critical' ? 'critical' : 'high',
        read: false,
        data: {
          patientName,
          dayNumber,
          riskLevel,
          redFlags,
        },
      },
    });
    console.log('Doctor alert notification created successfully');
  } catch (error) {
    console.error('Error creating doctor alert notification:', error);
    // Não lançar erro para não quebrar o fluxo principal
  }
}

/**
 * Formata número de telefone para formato WhatsApp
 * Remove caracteres especiais e adiciona código do país se necessário
 */
export function formatPhoneNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '');

  // Se começar com 0, remove
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Se não tiver código do país (55 para Brasil), adiciona
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }

  return cleaned;
}

/**
 * Valida se um número de telefone é válido para WhatsApp
 */
export function isValidWhatsAppNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);

  // Número brasileiro deve ter 13 dígitos (55 + 11 dígitos ou 55 + 10 dígitos)
  return formatted.length >= 12 && formatted.length <= 13;
}



/**
 * Marca mensagem como lida
 */
export async function markAsRead(messageId: string): Promise<void> {
  try {
    const token = await getWhatsAppToken();
    await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      }
    );
  } catch (error) {
    console.error('Error marking message as read:', error);
    // Não lançar erro, isso é apenas uma cortesia
  }
}

/**
 * Verifica se o WhatsApp API está configurado corretamente
 */
/**
 * Verifica se o WhatsApp API está configurado corretamente
 * Nota: Verifica apenas variáveis de ambiente, não o banco
 */
export function isWhatsAppConfigured(): boolean {
  return !!(PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);
}

/**
 * Testa a conexão com a API do WhatsApp
 */
export async function testWhatsAppConnection(): Promise<boolean> {
  try {
    const token = await getWhatsAppToken();
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error('WhatsApp connection test failed:', error);
    return false;
  }
}

/**
 * Envia mensagem genérica para o médico via WhatsApp
 * Usa o campo User.whatsapp para enviar
 */
export async function sendWhatsAppToDoctor(
  doctorPhone: string,
  message: string
): Promise<boolean> {
  if (!doctorPhone) {
    console.warn('⚠️ Doctor phone number not provided. Message not sent.');
    return false;
  }

  try {
    await sendMessage(doctorPhone, message);
    console.log('✅ Message sent to doctor successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending message to doctor:', error);
    return false;
  }
}

/**
 * Envia lembrete ao paciente que não respondeu o follow-up
 */
export async function sendPatientReminder(
  patientPhone: string,
  patientName: string
): Promise<boolean> {
  const firstName = patientName.split(' ')[0] || 'Paciente';

  const message = `Olá, ${firstName}! 👋\n\n` +
    `Ainda não recebi sua resposta sobre o acompanhamento de hoje.\n\n` +
    `Poderia responder quando tiver um momento? Suas respostas são muito importantes para acompanharmos sua recuperação. 🙏`;

  try {
    await sendMessage(patientPhone, message);
    console.log(`✅ Reminder sent to patient: ${patientName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending reminder to patient ${patientName}:`, error);
    return false;
  }
}

/**
 * Notifica o médico que o paciente não respondeu o follow-up
 */
export async function notifyDoctorUnanswered(
  doctorPhone: string,
  patientName: string,
  dayNumber: number
): Promise<boolean> {
  const message = `⚠️ *PACIENTE NÃO RESPONDEU*\n\n` +
    `Paciente: ${patientName}\n` +
    `Dia: D+${dayNumber}\n\n` +
    `O paciente não respondeu o acompanhamento de hoje após 6 horas.\n` +
    `Recomendamos entrar em contato para verificar se está tudo bem.`;

  return await sendWhatsAppToDoctor(doctorPhone, message);
}

/**
 * Envia relatório final do acompanhamento D+14 para o médico
 */
export async function sendFinalReport(
  doctorPhone: string,
  reportData: {
    patientName: string;
    surgeryType: string;
    surgeryDate: Date;
    researchGroup?: string;
    painTrajectory: Array<{
      day: number;
      painAtRest: number | null;
      painDuringBowel: number | null;
    }>;
    firstBowelMovementDay: number | null;
    firstBowelMovementTime?: string;
    maxPainAtRest: number;
    avgPainAtRest: number;
    peakPainDay: number;
    complications: string[];
    adherenceRate: number;
    completedFollowUps: number;
    totalFollowUps: number;
    // Dados de satisfação D+14
    satisfaction?: {
      painControlSatisfaction?: number | null;
      aiFollowUpSatisfaction?: number | null;
      npsScore?: number | null;
      feedback?: string | null;
    };
  }
): Promise<boolean> {
  const {
    patientName, surgeryType, surgeryDate, researchGroup,
    painTrajectory, firstBowelMovementDay, firstBowelMovementTime,
    maxPainAtRest, avgPainAtRest, peakPainDay, complications,
    adherenceRate, completedFollowUps, totalFollowUps, satisfaction
  } = reportData;

  // Formatar data da cirurgia
  const formattedDate = surgeryDate.toLocaleDateString('pt-BR');

  // Construir trajetória de dor
  let painTable = '';
  for (const entry of painTrajectory) {
    const restPain = entry.painAtRest !== null ? `${entry.painAtRest}/10` : '-';
    const bowelPain = entry.painDuringBowel !== null ? `${entry.painDuringBowel}/10` : '-';
    painTable += `D+${entry.day}: ${restPain} | ${bowelPain}\n`;
  }

  // Construir mensagem
  let message = `📋 *RELATÓRIO FINAL - ${patientName}*\n\n`;
  message += `🏥 ${surgeryType} - ${formattedDate}\n`;

  if (researchGroup) {
    message += `📊 Grupo: ${researchGroup}\n`;
  }

  message += `\n📈 *TRAJETÓRIA DE DOR:*\n`;
  message += `       Repouso | Evacuação\n`;
  message += painTable;

  message += `\n📊 *RESUMO:*\n`;

  if (firstBowelMovementDay !== null) {
    message += `• Primeira evacuação: D+${firstBowelMovementDay}`;
    if (firstBowelMovementTime) {
      message += ` às ${firstBowelMovementTime}`;
    }
    message += `\n`;
  }

  message += `• Pico de dor: D+${peakPainDay} (${maxPainAtRest}/10)\n`;
  message += `• Dor média: ${avgPainAtRest.toFixed(1)}/10\n`;

  if (complications.length > 0) {
    message += `\n⚠️ *INTERCORRÊNCIAS:*\n`;
    complications.forEach(comp => {
      message += `• ${comp}\n`;
    });
  }

  message += `\n✅ Adesão: ${adherenceRate.toFixed(0)}% (${completedFollowUps}/${totalFollowUps} follow-ups)\n`;

  // Adicionar dados de satisfação se disponíveis
  if (satisfaction) {
    message += `\n📝 *SATISFAÇÃO:*\n`;
    if (satisfaction.painControlSatisfaction != null) {
      message += `• Controle da dor: ${satisfaction.painControlSatisfaction}/10\n`;
    }
    if (satisfaction.aiFollowUpSatisfaction != null) {
      message += `• Acompanhamento IA: ${satisfaction.aiFollowUpSatisfaction}/10\n`;
    }
    if (satisfaction.npsScore != null) {
      const npsCategory = satisfaction.npsScore >= 9 ? 'Promotor' :
        satisfaction.npsScore >= 7 ? 'Passivo' : 'Detrator';
      message += `• NPS: ${satisfaction.npsScore}/10 (${npsCategory})\n`;
    }
    if (satisfaction.feedback) {
      message += `• Feedback: "${satisfaction.feedback}"\n`;
    }
  }

  return await sendWhatsAppToDoctor(doctorPhone, message);
}
