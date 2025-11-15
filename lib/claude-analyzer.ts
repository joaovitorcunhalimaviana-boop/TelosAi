/**
 * Analisador Inteligente usando Claude AI
 * Analisa mensagens de pacientes e classifica urgência
 */

import Anthropic from '@anthropic-ai/sdk';
import { Patient, Surgery } from '@prisma/client';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface MessageAnalysis {
  urgency: UrgencyLevel;
  category: string;
  summary: string;
  suggestedResponse: string;
  shouldNotifyDoctor: boolean;
  redFlags: string[];
}

/**
 * Analisa mensagem do paciente e retorna classificação
 */
export async function analyzePatientMessage(
  message: string,
  patient: Patient,
  surgery?: Surgery
): Promise<MessageAnalysis> {

  // Calcular dias pós-operatórios
  const daysPostOp = surgery
    ? Math.floor((Date.now() - surgery.date.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const prompt = `Você é um assistente médico especializado em cirurgia colorretal analisando mensagem de paciente pós-operatório.

PACIENTE:
- Nome: ${patient.name}
- Cirurgia: ${surgery?.type || 'Não especificada'}
- Dias pós-op: ${daysPostOp !== null ? `D+${daysPostOp}` : 'N/A'}

MENSAGEM DO PACIENTE:
"${message}"

ANALISE E CLASSIFIQUE:

1. URGÊNCIA (escolha UMA):
   - CRITICAL: Sangramento volumoso, febre alta (>38.5°C) + dor intensa, dor insuportável, sinais de infecção grave, retenção urinária → PRONTO-SOCORRO IMEDIATO
   - HIGH: Sangramento moderado, febre moderada, dor forte mas controlável, sinais inflamatórios importantes
   - MEDIUM: Dúvidas sobre medicamentos prescritos, sintomas leves mas preocupantes
   - LOW: Dúvidas rotineiras (banho, alimentação, atividades)

2. CATEGORIA: Ex: "sangramento", "dor", "medicação", "alimentação", "higiene", "atividade física"

3. RED FLAGS (se houver): Liste sintomas graves detectados

4. RESPOSTA SUGERIDA:
   - CRITICAL: SEMPRE orientar PRONTO-SOCORRO IMEDIATO ou SAMU 192
   - HIGH/MEDIUM: Orientação inicial + "Dr. João foi notificado e entrará em contato"
   - LOW: Orientação baseada em protocolos padrão pós-operatórios

IMPORTANTE:
- NUNCA prescrever medicamento novo
- NUNCA mudar dosagem ou duração de medicamentos
- NUNCA dar diagnóstico definitivo
- Ser conservador: na dúvida, orientar contato com médico
- Respostas DEVEM ser empáticas, claras e em português Brasil

Responda APENAS com JSON válido neste formato:
{
  "urgency": "CRITICAL|HIGH|MEDIUM|LOW",
  "category": "categoria",
  "summary": "resumo breve do problema",
  "suggestedResponse": "resposta completa para o paciente",
  "shouldNotifyDoctor": true|false,
  "redFlags": ["flag1", "flag2"]
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extrair JSON da resposta
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const analysis: MessageAnalysis = JSON.parse(jsonMatch[0]);

    // Validações de segurança
    if (analysis.urgency === 'CRITICAL') {
      analysis.shouldNotifyDoctor = true;
      // Garantir que resposta crítica sempre orienta pronto-socorro
      if (!analysis.suggestedResponse.toLowerCase().includes('pronto-socorro') &&
          !analysis.suggestedResponse.includes('192')) {
        analysis.suggestedResponse =
          `🚨 ATENÇÃO - PROCURE O PRONTO-SOCORRO IMEDIATAMENTE ou ligue 192 (SAMU).\n\n` +
          `${analysis.suggestedResponse}\n\n` +
          `Dr. João Vitor foi notificado, mas não espere! Procure atendimento médico AGORA.`;
      }
    }

    // Adicionar disclaimer em todas as respostas
    if (analysis.urgency !== 'CRITICAL') {
      analysis.suggestedResponse +=
        `\n\n⚕️ Dr. João Vitor foi notificado sobre sua mensagem e entrará em contato se necessário.` +
        `\n\nSe os sintomas piorarem, procure atendimento médico imediatamente.`;
    }

    return analysis;

  } catch (error) {
    console.error('Error analyzing message with Claude:', error);

    // Fallback seguro: tratar como alta urgência
    return {
      urgency: 'HIGH',
      category: 'não classificado',
      summary: message.substring(0, 100),
      suggestedResponse:
        `Recebemos sua mensagem e Dr. João Vitor foi notificado.\n\n` +
        `Se você está com sintomas graves (sangramento volumoso, febre alta com dor, dor insuportável), ` +
        `procure o pronto-socorro IMEDIATAMENTE ou ligue 192 (SAMU).\n\n` +
        `Caso contrário, aguarde o retorno do Dr. João.`,
      shouldNotifyDoctor: true,
      redFlags: [],
    };
  }
}

/**
 * Formata mensagem de alerta para o médico
 */
export function formatDoctorAlert(
  analysis: MessageAnalysis,
  patient: Patient,
  surgery?: Surgery,
  originalMessage: string
): string {
  const daysPostOp = surgery
    ? Math.floor((Date.now() - surgery.date.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  let urgencyEmoji = '⚠️';
  if (analysis.urgency === 'CRITICAL') urgencyEmoji = '🚨';
  if (analysis.urgency === 'LOW') urgencyEmoji = 'ℹ️';

  let alert = `${urgencyEmoji} MENSAGEM DE PACIENTE\n\n`;
  alert += `📋 **Paciente:** ${patient.name}\n`;
  alert += `📞 **Telefone:** ${patient.phone}\n`;

  if (surgery) {
    alert += `🔪 **Cirurgia:** ${surgery.type}\n`;
    alert += `📅 **Pós-op:** D+${daysPostOp}\n`;
  }

  alert += `\n🎯 **Urgência:** ${analysis.urgency}\n`;
  alert += `📌 **Categoria:** ${analysis.category}\n`;

  if (analysis.redFlags.length > 0) {
    alert += `\n🚩 **Red Flags:**\n`;
    analysis.redFlags.forEach(flag => {
      alert += `• ${flag}\n`;
    });
  }

  alert += `\n💬 **Mensagem do paciente:**\n"${originalMessage}"\n`;
  alert += `\n📝 **Resumo:** ${analysis.summary}\n`;
  alert += `\n✅ **Resposta enviada ao paciente:**\n"${analysis.suggestedResponse}"`;

  if (analysis.urgency === 'CRITICAL') {
    alert += `\n\n⚠️ **AÇÃO NECESSÁRIA:** Paciente foi orientado a procurar pronto-socorro. Considere contato direto.`;
  }

  return alert;
}
