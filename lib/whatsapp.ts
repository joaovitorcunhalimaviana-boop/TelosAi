/**
 * WhatsApp Business API Client
 * Integração com Meta Cloud API para envio de mensagens
 */

import { Patient, Surgery, FollowUp } from '@prisma/client';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;

export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'interactive';
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
 * Envia mensagem de texto simples
 */
export async function sendMessage(
  to: string,
  message: string
): Promise<WhatsAppResponse> {
  try {
    // Formatar número de telefone (remover caracteres especiais)
    const formattedPhone = formatPhoneNumber(to);

    console.log('📱 Sending WhatsApp message:', {
      originalPhone: to,
      formattedPhone,
      messagePreview: message.substring(0, 100) + '...',
      apiUrl: `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      hasToken: !!ACCESS_TOKEN,
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
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
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

    // Template "day1" usa idioma "en" (erro na criação), outros usam "pt_BR"
    const language = languageCode || (templateName === 'day1' ? 'en' : 'pt_BR');

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
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
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
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
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
    // Usar templates com parâmetros posicionais ({{1}}) que funcionam corretamente
    // Template "pos_op_dia1" para D+1, "acompanhamento_medico" para outros dias
    const templateName = followUp.dayNumber === 1 ? 'pos_op_dia1' : 'acompanhamento_medico';

    // Mapear tipo de cirurgia para texto amigável
    const surgeryTypeMap: Record<string, string> = {
      'hemorroidectomia': 'doença hemorroidária',
      'fistula': 'fístula anal',
      'fissura': 'fissura anal',
      'pilonidal': 'cisto pilonidal'
    };

    const surgeryTypeText = surgeryTypeMap[surgery.type] || surgery.type;
    const patientFirstName = patient.name.split(' ')[0] || 'Paciente';

    // Template "pos_op_dia1" usa parâmetro {{1}} (posicional)
    // Template "acompanhamento_medico" não tem parâmetros
    const components = followUp.dayNumber === 1 ? [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: patientFirstName
          }
        ]
      }
    ] : undefined; // Sem componentes para "acompanhamento_medico"

    console.log('📱 Sending template message:', {
      template: templateName,
      to: patient.phone,
      patientName: patientFirstName,
      surgeryType: surgeryTypeText
    });

    return await sendTemplate(patient.phone, templateName, components);
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
 * Envia alerta ao médico
 */
export async function sendDoctorAlert(
  patientName: string,
  dayNumber: number,
  riskLevel: string,
  redFlags: string[],
  doctorPhone?: string
): Promise<void> {
  // Número do médico (pode vir do banco de dados ou env var)
  const doctorPhoneNumber = doctorPhone || process.env.DOCTOR_PHONE_NUMBER;

  if (!doctorPhoneNumber) {
    console.warn('Doctor phone number not configured. Alert not sent.');
    return;
  }

  const message = `🚨 ALERTA - Paciente: ${patientName}\n\n` +
    `Dia: D+${dayNumber}\n` +
    `Nível de risco: ${riskLevel.toUpperCase()}\n\n` +
    `Red Flags detectados:\n` +
    redFlags.map(flag => `• ${flag}`).join('\n') +
    `\n\nAcesse o sistema para mais detalhes.`;

  try {
    await sendMessage(doctorPhoneNumber, message);
    console.log('Doctor alert sent successfully');
  } catch (error) {
    console.error('Error sending doctor alert:', error);
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
 * Retorna saudação apropriada baseada no horário
 */
function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'Bom dia';
  } else if (hour >= 12 && hour < 18) {
    return 'Boa tarde';
  } else {
    return 'Boa noite';
  }
}

/**
 * Marca mensagem como lida
 */
export async function markAsRead(messageId: string): Promise<void> {
  try {
    await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
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
export function isWhatsAppConfigured(): boolean {
  return !!(PHONE_NUMBER_ID && ACCESS_TOKEN);
}

/**
 * Testa a conexão com a API do WhatsApp
 */
export async function testWhatsAppConnection(): Promise<boolean> {
  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error('WhatsApp connection test failed:', error);
    return false;
  }
}
