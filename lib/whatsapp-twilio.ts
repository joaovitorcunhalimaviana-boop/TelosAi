/**
 * WhatsApp Client usando Twilio API
 * Muito mais simples que Meta Cloud API - sem templates necessários!
 */

import { Patient, Surgery, FollowUp } from '@prisma/client';
import twilio from 'twilio';

// Credenciais do Twilio (configurar no .env)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER!; // Ex: whatsapp:+14155238886

// Cliente Twilio
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export interface WhatsAppResponse {
  sid: string;
  status: string;
  to: string;
  from: string;
  body: string;
}

/**
 * Envia mensagem de texto simples via Twilio
 */
export async function sendMessage(
  to: string,
  message: string
): Promise<WhatsAppResponse> {
  try {
    // Formatar número de telefone
    const formattedPhone = formatPhoneNumber(to);

    console.log('📱 Sending WhatsApp message via Twilio:', {
      to: formattedPhone,
      messagePreview: message.substring(0, 100) + '...',
      from: TWILIO_WHATSAPP_NUMBER,
    });

    const twilioMessage = await client.messages.create({
      body: message,
      from: TWILIO_WHATSAPP_NUMBER,
      to: formattedPhone,
    });

    console.log('✅ WhatsApp message sent successfully:', {
      sid: twilioMessage.sid,
      status: twilioMessage.status,
    });

    return {
      sid: twilioMessage.sid,
      status: twilioMessage.status,
      to: twilioMessage.to,
      from: twilioMessage.from,
      body: twilioMessage.body,
    };
  } catch (error) {
    console.error('❌ Error sending WhatsApp message via Twilio:', error);
    throw error;
  }
}

/**
 * Envia questionário de follow-up
 */
export async function sendFollowUpQuestionnaire(
  followUp: FollowUp,
  patient: Patient,
  surgery: Surgery
): Promise<WhatsAppResponse> {
  try {
    // Importar dinamicamente para evitar circular dependency
    const { getQuestionnaireForDay } = await import('./questionnaires');

    const questionnaire = getQuestionnaireForDay(
      followUp.dayNumber,
      surgery.type as 'hemorroidectomia' | 'fistula' | 'fissura' | 'pilonidal'
    );

    // Construir mensagem
    const greeting = getGreeting();
    const message = `${greeting} ${patient.name.split(' ')[0]}!\n\n` +
      `Este é o questionário de acompanhamento do dia ${followUp.dayNumber} após sua cirurgia.\n\n` +
      `${questionnaire.introduction}\n\n` +
      `Por favor, responda as seguintes perguntas:\n\n` +
      questionnaire.questions.map((q, i) => {
        let questionText = `${i + 1}. ${q.question}\n`;

        // Adicionar opções se houver
        if (q.options && q.options.length > 0) {
          q.options.forEach((option, idx) => {
            questionText += `   ${String.fromCharCode(97 + idx)}) ${option}\n`;
          });
        }

        return questionText;
      }).join('\n') +
      `\n\nResponda cada pergunta separadamente. Estou aqui para ajudar!`;

    return await sendMessage(patient.phone, message);
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
 * Formata número de telefone para formato WhatsApp do Twilio
 * Formato: whatsapp:+5583999999999
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

  // Formato Twilio: whatsapp:+numero
  return `whatsapp:+${cleaned}`;
}

/**
 * Valida se um número de telefone é válido
 */
export function isValidWhatsAppNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');

  // Número brasileiro deve ter 13 dígitos (55 + 11 dígitos ou 55 + 10 dígitos)
  return cleaned.length >= 12 && cleaned.length <= 13;
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
 * Verifica se o Twilio está configurado corretamente
 */
export function isWhatsAppConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_NUMBER);
}

/**
 * Testa a conexão com a API do Twilio
 */
export async function testWhatsAppConnection(): Promise<boolean> {
  try {
    // Buscar informações da conta para verificar se as credenciais estão corretas
    const account = await client.api.accounts(TWILIO_ACCOUNT_SID).fetch();
    console.log('✅ Twilio account verified:', account.friendlyName);
    return true;
  } catch (error) {
    console.error('❌ Twilio connection test failed:', error);
    return false;
  }
}

// NOTA: Twilio não precisa de templates ou marcação de mensagens como lidas
// Essas funções foram removidas porque não são necessárias
