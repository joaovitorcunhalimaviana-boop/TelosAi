/**
 * Analisador Inteligente usando Claude AI
 * Analisa mensagens de pacientes e classifica urgência
 */

import Anthropic from '@anthropic-ai/sdk';
import { Patient, Surgery } from '@prisma/client';
import { prisma } from './prisma';
import { toBrasiliaTime } from './date-utils';
import { z } from 'zod';

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

// Schema Zod para validar resposta do Claude
const messageAnalysisSchema = z.object({
  urgency: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  category: z.string(),
  summary: z.string(),
  suggestedResponse: z.string(),
  shouldNotifyDoctor: z.boolean(),
  redFlags: z.array(z.string())
});

/**
 * Retorna expectativas específicas por tipo de cirurgia e dia pós-op
 */
function getSurgerySpecificContext(surgeryType: string, daysPostOp: number): string {
  const contexts: Record<string, string> = {
    'hemorroidectomia': `
EXPECTATIVAS HEMORROIDECTOMIA D+${daysPostOp}:
- Dor: Esperada 7-9/10 nos primeiros 3 dias, reduzindo para 4-6/10 em D+7
- Sangramento: Leve ao evacuar é NORMAL até D+7. Volumoso é RED FLAG
- Primeira evacuação: Muito dolorosa (D+1 a D+3), orientar analgesia prévia
- Retenção urinária: Comum em D+1 (bloqueio anestésico)
- Edema/inchaço: Normal até D+5
`,
    'fistula': `
EXPECTATIVAS FÍSTULA ANAL D+${daysPostOp}:
- Dor: Moderada 4-6/10, não deve ser insuportável
- Secreção: Leve secreção serosa/sanguinolenta é normal
- Sangramento: Mínimo, se moderado/volumoso é RED FLAG
- Cicatrização: Lenta (4-6 semanas para fechar completamente)
- Banho de assento: CRUCIAL para higiene local
`,
    'fissura': `
EXPECTATIVAS FISSURA ANAL D+${daysPostOp}:
- Dor: Intensa ao evacuar (D+1 a D+5), melhora progressiva
- Sangramento: Leve ao papel higiênico é esperado
- Espasmo anal: Comum, orientar relaxamento e banho de assento
- Dieta: Rica em fibras + hidratação para fezes macias
`,
    'pilonidal': `
EXPECTATIVAS DOENÇA PILONIDAL D+${daysPostOp}:
- Dor: Moderada 5-7/10 nos primeiros dias
- Secreção: Esperada (ferida deixada aberta para cicatrizar por segunda intenção)
- Curativos: Diários com soro fisiológico
- Sinais de infecção: Febre, secreção purulenta, odor fétido (RED FLAGS)
`
  };

  return contexts[surgeryType] || `CIRURGIA: ${surgeryType} - D+${daysPostOp}`;
}

/**
 * Few-shot examples para melhorar acurácia do Claude
 */
const FEW_SHOT_EXAMPLES = `
EXEMPLOS DE CLASSIFICAÇÃO:

Exemplo 1:
Mensagem: "Tô com dor 9/10 e sangrando muito, encheu o vaso sanitário"
Urgência: CRITICAL
Categoria: "sangramento"
Red Flags: ["sangramento_volumoso", "dor_intensa"]
Resposta: "🚨 ATENÇÃO - PROCURE O PRONTO-SOCORRO IMEDIATAMENTE. Sangramento volumoso em pós-operatório é emergência. Vá agora ou ligue 192 (SAMU)."

Exemplo 2:
Mensagem: "Dor 7/10, tomei dipirona mas não aliviou. É D+2 da hemorroidectomia"
Urgência: HIGH
Categoria: "dor"
Red Flags: ["dor_refrataria_analgesia"]
Resposta: "Dor 7/10 que não melhora com dipirona em D+2 precisa avaliação. Dr. João foi notificado e entrará em contato. Se piorar, procure pronto-socorro."

Exemplo 3:
Mensagem: "Posso tomar banho hoje? É D+3"
Urgência: LOW
Categoria: "higiene"
Red Flags: []
Resposta: "Sim! Pode tomar banho normalmente. A partir de D+3, faça também banho de assento com água MORNA 2-3x ao dia por 10-15 minutos após evacuações. Nos dois primeiros dias (D+1 e D+2), use compressas GELADAS 5x/dia por 10 min para reduzir edema e dor."

Exemplo 4:
Mensagem: "Febre 38.8°C e dor forte no local da cirurgia"
Urgência: CRITICAL
Categoria: "infecção"
Red Flags: ["febre_alta", "dor_intensa", "possível_infecção"]
Resposta: "🚨 Febre alta com dor forte pode indicar infecção. PROCURE PRONTO-SOCORRO AGORA. Dr. João foi notificado."
`;

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
  // Calcular dias pós-operatórios usando timezone de Brasília (evita off-by-one)
  const daysPostOp = surgery
    ? (() => {
        // toBrasiliaTime importado no topo do arquivo
        const nowBrt = toBrasiliaTime(new Date());
        const surgeryBrt = toBrasiliaTime(surgery.date);
        const nowDay = new Date(nowBrt.getFullYear(), nowBrt.getMonth(), nowBrt.getDate());
        const surgeryDay = new Date(surgeryBrt.getFullYear(), surgeryBrt.getMonth(), surgeryBrt.getDate());
        return Math.round((nowDay.getTime() - surgeryDay.getTime()) / (1000 * 60 * 60 * 24));
      })()
    : null;

  // Buscar protocolos do médico (se userId fornecido e há cirurgia)
  // PRIORIDADE: Se paciente está em pesquisa, usar protocolos da pesquisa
  // Se paciente está em grupo específico, usar protocolos daquele grupo
  // Caso contrário, usar protocolos normais do médico
  let relevantProtocols: any[] = [];
  if (userId && surgery && daysPostOp !== null) {
    // Se paciente está em pesquisa, buscar APENAS protocolos da pesquisa
    if (patient.researchId) {
      relevantProtocols = await prisma.protocol.findMany({
        where: {
          userId,
          researchId: patient.researchId, // APENAS protocolos desta pesquisa
          // Se paciente tem grupo específico, buscar protocolos do grupo OU protocolos gerais da pesquisa
          OR: patient.researchGroup ? [
            { researchGroupCode: patient.researchGroup }, // Protocolo específico do grupo do paciente
            { researchGroupCode: null } // OU protocolos para todos os grupos
          ] : [
            { researchGroupCode: null } // Se não tem grupo, apenas protocolos gerais
          ],
          isActive: true,
          AND: [
            {
              OR: [
                { surgeryType: surgery.type },
                { surgeryType: 'geral' }
              ]
            },
            { dayRangeStart: { lte: daysPostOp } },
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
      protocolsSection += '🔬 IMPORTANTE: Este paciente está em um estudo de pesquisa. Use APENAS estes protocolos específicos da pesquisa (NÃO os protocolos da prática normal).\n';
      protocolsSection += '⚠️ NUNCA mencione ao paciente que ele está em um grupo específico (A, B, C, etc). Isso deve ser mantido em sigilo.\n\n';
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (protocols as any[]).forEach((p: any) => {
        protocolsSection += `• ${p.title}: ${p.content}\n`;
      });
      protocolsSection += '\n';
    }
  }

  try {
    // 💰 PROMPT CACHING: Reduz custo em até 90%
    // Separa prompt em partes estáticas (cacheable) e dinâmicas

    // Adicionar contexto específico da cirurgia
    const surgeryContext = surgery
      ? getSurgerySpecificContext(surgery.type, daysPostOp!)
      : '';

    const systemPrompt = `Você é um assistente médico especializado em cirurgia colorretal analisando mensagem de paciente pós-operatório.

${surgeryContext}

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
- Quando usar um protocolo, seja específico e RESPEITE O DIA DO PÓS-OPERATÓRIO:
  * D+1 e D+2: compressas GELADAS 5x/dia por 10 min (NÃO banho de assento com água morna!)
  * A partir de D+3: banho de assento com água MORNA 2-3x ao dia
  * Pomada: SEMPRE APÓS evacuar, de 8/8h (nunca antes de evacuar!)

${FEW_SHOT_EXAMPLES}

Responda APENAS com JSON válido neste formato:
{
  "urgency": "CRITICAL|HIGH|MEDIUM|LOW",
  "category": "categoria",
  "summary": "resumo breve do problema",
  "suggestedResponse": "resposta completa para o paciente",
  "shouldNotifyDoctor": true|false,
  "redFlags": ["flag1", "flag2"]
}`;

    // Mensagem do usuário (parte dinâmica)
    const userMessage = `PACIENTE:
- Nome: ${patient.name}
- Cirurgia: ${surgery?.type || 'Não especificada'}
- Dias pós-op: ${daysPostOp !== null ? `D+${daysPostOp}` : 'N/A'}
${protocolsSection}
MENSAGEM DO PACIENTE:
"${message}"`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      temperature: 0.3,
      // 🎯 SYSTEM PROMPT com cache control
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' } // Cache por 5 minutos
        }
      ],
      messages: [
        {
          role: 'user',
          content: userMessage,
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

    // Validar JSON com Zod
    const parsedJson = JSON.parse(jsonMatch[0]);
    const analysis = messageAnalysisSchema.parse(parsedJson);

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

  } catch (error: unknown) {
    console.error('Error analyzing message with Claude:', error);

    // Fallback inteligente: analisar palavras-chave para urgência
    const messageLower = message.toLowerCase();
    const criticalKeywords = ['sangramento volumoso', 'encheu', 'febre alta', 'febre 39', 'febre 40', 'dor insuportável', 'dor 10', 'não consigo urinar', 'retenção urinária'];
    const highKeywords = ['sangrando', 'sangue', 'febre', 'dor forte', 'dor 8', 'dor 9'];

    const isCritical = criticalKeywords.some(keyword => messageLower.includes(keyword));
    const isHigh = highKeywords.some(keyword => messageLower.includes(keyword));

    const urgency: UrgencyLevel = isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : 'MEDIUM';

    // Fallback com melhor experiência
    return {
      urgency,
      category: 'não classificado',
      summary: message.substring(0, 100),
      suggestedResponse: urgency === 'CRITICAL'
        ? `🚨 ATENÇÃO - Sua mensagem indica sintomas graves. PROCURE O PRONTO-SOCORRO IMEDIATAMENTE ou ligue 192 (SAMU).\n\n` +
        `Dr. João Vitor foi notificado, mas não espere! Procure atendimento médico AGORA.`
        : `Recebemos sua mensagem e Dr. João Vitor foi notificado.\n\n` +
        `Se você está com sintomas graves (sangramento volumoso, febre alta com dor, dor insuportável), ` +
        `procure o pronto-socorro IMEDIATAMENTE ou ligue 192 (SAMU).\n\n` +
        `Caso contrário, aguarde o retorno do Dr. João.`,
      shouldNotifyDoctor: true,
      redFlags: isCritical ? ['erro_analise_claude'] : [],
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
  // Calcular dias pós-operatórios usando timezone de Brasília (evita off-by-one)
  const daysPostOp = surgery
    ? (() => {
        // toBrasiliaTime importado no topo do arquivo
        const nowBrt = toBrasiliaTime(new Date());
        const surgeryBrt = toBrasiliaTime(surgery.date);
        const nowDay = new Date(nowBrt.getFullYear(), nowBrt.getMonth(), nowBrt.getDate());
        const surgeryDay = new Date(surgeryBrt.getFullYear(), surgeryBrt.getMonth(), surgeryBrt.getDate());
        return Math.round((nowDay.getTime() - surgeryDay.getTime()) / (1000 * 60 * 60 * 24));
      })()
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
