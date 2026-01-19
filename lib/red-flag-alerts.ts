/**
 * Sistema de Notificação Imediata de Red Flags Críticos
 * Envia alertas in-app ao médico quando red flags críticos são detectados
 */

import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/create-notification';

export interface RedFlagData {
  pain?: number;
  painDuringBowel?: number;
  fever?: boolean;
  feverTemperature?: number;
  bleeding?: string;
  [key: string]: any;
}

export interface CriticalRedFlag {
  type: string;
  severity: 'critical' | 'high';
  description: string;
}

/**
 * Identifica red flags críticos nos dados coletados
 */
export function identifyCriticalRedFlags(data: RedFlagData): CriticalRedFlag[] {
  const redFlags: CriticalRedFlag[] = [];

  // Dor >= 9 (escala 0-10)
  if (data.pain !== undefined && data.pain >= 9) {
    redFlags.push({
      type: 'pain_extreme',
      severity: 'critical',
      description: `Dor intensa: ${data.pain}/10`
    });
  }

  // Dor durante evacuação >= 9
  if (data.painDuringBowel !== undefined && data.painDuringBowel >= 9) {
    redFlags.push({
      type: 'bowel_pain_extreme',
      severity: 'critical',
      description: `Dor durante evacuação: ${data.painDuringBowel}/10`
    });
  }

  // Febre >= 39°C
  if (data.fever && data.feverTemperature !== undefined && data.feverTemperature >= 39) {
    redFlags.push({
      type: 'fever_high',
      severity: 'critical',
      description: `Febre alta: ${data.feverTemperature}°C`
    });
  }

  // Sangramento intenso
  if (data.bleeding &&
      (data.bleeding.toLowerCase().includes('intenso') ||
       data.bleeding.toLowerCase().includes('grave') ||
       data.bleeding.toLowerCase().includes('abundante'))) {
    redFlags.push({
      type: 'bleeding_severe',
      severity: 'critical',
      description: 'Sangramento intenso'
    });
  }

  return redFlags;
}

/**
 * Formata o título e mensagem do alerta para notificação in-app
 */
function formatAlertContent(
  patientName: string,
  surgeryType: string,
  daysPostOp: number,
  redFlags: CriticalRedFlag[]
): { title: string; message: string } {
  const firstName = patientName.split(' ')[0] || patientName;

  const title = `🚨 ALERTA CRÍTICO - ${firstName}`;

  let message = `Paciente: ${patientName}\n`;
  message += `Dia: D+${daysPostOp} pós ${surgeryType}\n\n`;
  message += `Red Flags detectados:\n`;

  redFlags.forEach(flag => {
    message += `• ${flag.description}\n`;
  });

  message += `\nRecomendação: Entrar em contato IMEDIATAMENTE`;

  return { title, message };
}

/**
 * Envia notificação crítica ao médico via WhatsApp
 *
 * @param followUpId - ID do follow-up que gerou o alerta
 * @param data - Dados coletados do questionário
 * @returns boolean - true se alerta foi enviado com sucesso
 */
export async function sendCriticalRedFlagAlert(
  followUpId: string,
  data: RedFlagData
): Promise<boolean> {
  try {
    console.log('🔍 Verificando red flags críticos...');

    // Identificar red flags críticos
    const criticalRedFlags = identifyCriticalRedFlags(data);

    if (criticalRedFlags.length === 0) {
      console.log('✅ Nenhum red flag crítico detectado');
      return false;
    }

    console.log(`🚨 ${criticalRedFlags.length} red flag(s) crítico(s) detectado(s):`,
                criticalRedFlags.map(f => f.description));

    // Buscar informações do follow-up, paciente e médico
    const followUp = await prisma.followUp.findUnique({
      where: { id: followUpId },
      include: {
        patient: {
          include: {
            user: {
              select: {
                whatsapp: true,
                nomeCompleto: true
              }
            }
          }
        },
        surgery: {
          select: {
            type: true,
            date: true
          }
        }
      }
    });

    if (!followUp) {
      console.error('❌ Follow-up não encontrado:', followUpId);
      return false;
    }

    // Calcular dias pós-operatório
    const daysPostOp = Math.floor(
      (Date.now() - followUp.surgery.date.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Formatar conteúdo da notificação
    const { title, message } = formatAlertContent(
      followUp.patient.name,
      followUp.surgery.type,
      daysPostOp,
      criticalRedFlags
    );

    // Enviar notificação in-app ao médico
    console.log(`📱 Enviando alerta in-app ao médico: ${followUp.patient.userId}`);
    await createNotification({
      userId: followUp.patient.userId,
      type: 'red_flag_critical',
      title,
      message,
      priority: 'critical',
      actionUrl: `/patients/${followUp.patientId}`,
      data: {
        patientId: followUp.patientId,
        patientName: followUp.patient.name,
        surgeryId: followUp.surgeryId,
        followUpId: followUp.id,
        dayNumber: daysPostOp,
        redFlags: criticalRedFlags.map(f => f.description),
        riskLevel: 'critical',
      },
    });

    console.log('✅ Alerta crítico enviado com sucesso!');

    // Atualizar o follow-up response para marcar que o alerta foi enviado
    // (isso será feito na função saveQuestionnaireResponse)

    return true;
  } catch (error: any) {
    console.error('❌ Erro ao enviar alerta crítico:', error?.message);
    // Não lançar erro para não quebrar o fluxo principal
    return false;
  }
}

/**
 * Verifica se há red flags críticos nos dados
 * Função auxiliar para uso em outros módulos
 */
export function hasCriticalRedFlags(data: RedFlagData): boolean {
  const redFlags = identifyCriticalRedFlags(data);
  return redFlags.length > 0;
}
