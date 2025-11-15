/**
 * Analisador Inteligente usando Claude AI
 * Analisa mensagens de pacientes e classifica urgência
 */

import Anthropic from '@anthropic-ai/sdk';
import { Patient, Surgery } from '@prisma/client';
import { prisma } from './prisma';

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
  surgery?: Surgery,
  userId?: string
): Promise<MessageAnalysis> {

  // Calcular dias pós-operatórios
  const daysPostOp = surgery
    ? Math.floor((Date.now() - surgery.date.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Buscar protocolos do médico (se userId fornecido e há cirurgia)
  // PRIORIDADE: Se paciente está em pesquisa, usar protocolos da pesquisa
  // Caso contrário, usar protocolos normais do médico
  let relevantProtocols: any[] = [];
  if (userId && surgery && daysPostOp !== null) {
    // Se paciente está em pesquisa, buscar APENAS protocolos da pesquisa
    if (patient.researchId) {
      relevantProtocols = await prisma.protocol.findMany({
        where: {
          userId,
          researchId: patient.researchId, // APENAS protocolos desta pesquisa
          isActive: true,
          OR: [
            { surgeryType: surgery.type },
            { surgeryType: 'geral' }
          ],
          dayRangeStart: { lte: daysPostOp },
          AND: [
            {
              OR: [
                { dayRangeEnd: null },
                { dayRangeEnd: { gte: daysPostOp } }
              ]
            }
          ]
        },
        orderBy: [
          { priority: 'desc' },
          { category: 'asc' }
        ]
      });
    } else {
      // Paciente NÃO está em pesquisa - usar protocolos normais do médico
      relevantProtocols = await prisma.protocol.findMany({
        where: {
          userId,
          researchId: null, // APENAS protocolos normais (não de pesquisa)
          isActive: true,
          OR: [
            { surgeryType: surgery.type },
            { surgeryType: 'geral' }
          ],
          dayRangeStart: { lte: daysPostOp },
          AND: [
            {
              OR: [
                { dayRangeEnd: null },
                { dayRangeEnd: { gte: daysPostOp } }
              ]
            }
          ]
        },
        orderBy: [
          { priority: 'desc' },
          { category: 'asc' }
        ]
      });
    }
  }

  // Formatar protocolos para o prompt
  let protocolsSection = '';
  if (relevantProtocols.length > 0) {
    if (patient.researchId) {
      protocolsSection = '\n\n⚠️ PROTOCOLOS DE PESQUISA CIENTÍFICA:\n';
      protocolsSection += '🔬 IMPORTANTE: Este paciente está em um estudo de pesquisa. Use APENAS estes protocolos específicos da pesquisa (NÃO os protocolos da prática normal):\n\n';
    } else {
      protocolsSection = '\n\nPROTOCOLOS DO MÉDICO:\n';
      protocolsSection += 'Use estes protocolos personalizados do médico para responder ao paciente:\n\n';
    }

    const groupedProtocols = relevantProtocols.reduce((acc: any, p: any) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    }, {});

    for (const [category, protocols] of Object.entries(groupedProtocols)) {
      const categoryNames: any = {
        'banho': 'BANHO/HIGIENE LOCAL',
        'medicacao': 'MEDICAÇÃO',
        'alimentacao': 'ALIMENTAÇÃO',
        'atividade_fisica': 'ATIVIDADE FÍSICA',
        'higiene': 'HIGIENE GERAL',
        'sintomas_normais': 'SINTOMAS NORMAIS'
      };

      protocolsSection += `${categoryNames[category] || category.toUpperCase()}:\n`;
      (protocols as any[]).forEach((p: any) => {
        protocolsSection += `• ${p.title}: ${p.content}\n`;
      });
      protocolsSection += '\n';
    }
  }

  const prompt = `Você é um assistente médico especializado em cirurgia colorretal analisando mensagem de paciente pós-operatório.

PACIENTE:
- Nome: ${patient.name}
- Cirurgia: ${surgery?.type || 'Não especificada'}
- Dias pós-op: ${daysPostOp !== null ? `D+${daysPostOp}` : 'N/A'}
${protocolsSection}
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
   - LOW: Use os PROTOCOLOS DO MÉDICO acima (se fornecidos) para responder. Seja específico e cite o protocolo.

IMPORTANTE:
- SEMPRE use os protocolos personalizados do médico quando disponíveis
- NUNCA prescrever medicamento novo
- NUNCA mudar dosagem ou duração de medicamentos
- NUNCA dar diagnóstico definitivo
- Ser conservador: na dúvida, orientar contato com médico
- Respostas DEVEM ser empáticas, claras e em português Brasil
- Quando usar um protocolo, seja específico (ex: "banho de assento com água morna 2-3x ao dia")

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
  originalMessage: string,
  surgery?: Surgery
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
