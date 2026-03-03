/**
 * IA Conversacional para Questionários Pós-Operatórios
 * Usa Claude para conversar naturalmente com pacientes
 * Integrado com protocolo médico oficial
 */

import Anthropic from '@anthropic-ai/sdk';
import { Patient, Surgery } from '@prisma/client';
import { prisma } from './prisma';
import { getProtocolsForAI } from './protocols';
import { toBrasiliaTime, getBrasiliaHour } from './date-utils';

const anthropic = new Anthropic({
  apiKey: (process.env.ANTHROPIC_API_KEY || '').trim(),
});

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface QuestionnaireData {
  // Dor
  pain?: number; // 0-10 na escala numérica

  // Evacuação
  bowelMovementSinceLastContact?: boolean; // Evacuou desde último contato?
  lastBowelMovement?: string; // Quando foi a última evacuação (se não evacuou)
  painDuringBowelMovement?: number; // Dor durante evacuação (0-10)
  bowelMovementTime?: string; // Horário aproximado da PRIMEIRA evacuação pós-cirurgia (ex: "de manhã", "às 14h")
  firstBowelMovementActualDay?: number; // Dia real da primeira evacuação (ex: se paciente disse "ontem" no D3 → dia 2)
  bowelMovementCount?: number; // Quantas vezes evacuou desde o último contato (diário pós-1ª evacuação)

  // Sangramento
  bleeding?: 'none' | 'minimal' | 'moderate' | 'severe'; // nenhum, leve (papel), moderado (roupa), intenso (vaso)
  bleedingDetails?: string;

  // Urina
  urination?: boolean; // Consegue urinar normalmente
  urinationIssues?: string;

  // Febre
  fever?: boolean;
  feverTemperature?: number; // Temperatura em °C

  // Medicações / Analgesia
  medications?: boolean; // Está tomando conforme prescrito
  medicationIssues?: string;
  painControlledWithMeds?: boolean;
  medicationSideEffects?: string;

  // Medicação extra (OBRIGATÓRIO TODOS OS DIAS)
  usedExtraMedication?: boolean; // Usou alguma medicação além das prescritas?
  extraMedicationDetails?: string; // Se sim: qual, dose, horário (ex: Tramadol, Codeína, laxativo)

  // Atividade (D7+)
  activityLevel?: string;

  // Preocupações gerais
  concerns?: string;

  // Pesquisa de Satisfação (D+14)
  satisfactionRating?: number; // 0-10 (NPS style)
  wouldRecommend?: boolean; // Recomendaria o acompanhamento?
  positiveFeedback?: string; // Elogios e pontos positivos
  improvementSuggestions?: string; // Críticas e sugestões de melhoria
  satisfactionComments?: string; // Comentários livres (legado, manter compatibilidade)

  // Aderência a cuidados locais (genérico - depende do protocolo do médico)
  localCareAdherence?: boolean; // Está seguindo os cuidados locais orientados pelo médico?

  // Sintomas adicionais (TODOS OS DIAS - pergunta final)
  additionalSymptoms?: string | null; // "Deseja relatar mais alguma coisa?"

  [key: string]: any;
}

/**
 * Busca resumo dos dias anteriores para dar memória à IA
 * Inclui: dados coletados, preocupações do paciente, menções a orientações médicas
 */
async function getPreviousDaysSummary(surgeryId: string, currentDayNumber: number): Promise<string> {
  try {
    const previousFollowUps = await prisma.followUp.findMany({
      where: {
        surgeryId,
        status: 'responded',
        dayNumber: { lt: currentDayNumber },
      },
      include: { responses: true },
      orderBy: { dayNumber: 'desc' }, // Mais recentes primeiro
    });

    if (previousFollowUps.length === 0) return '';

    // Separar: 3 últimos acompanhamentos (detalhados) + anteriores (resumo compacto)
    const recentFollowUps = previousFollowUps.slice(0, 3); // Ex: D10, D7, D5
    const olderFollowUps = previousFollowUps.slice(3);       // Ex: D3, D2, D1

    let summary = `
═══════════════════════════
MEMÓRIA: DIAS ANTERIORES
═══════════════════════════
⚠️ Se o paciente mencionou orientação do médico diferente do protocolo, RESPEITE a do médico.

`;

    // Helper para extrair dados de um follow-up
    const extractData = (resp: any): any => {
      try {
        const parsed = typeof resp.questionnaireData === 'string'
          ? JSON.parse(resp.questionnaireData)
          : resp.questionnaireData;
        return parsed.extractedData || parsed;
      } catch { return {}; }
    };

    // Helper para extrair menções ao médico
    const extractDoctorMentions = (resp: any): string[] => {
      const mentions: string[] = [];
      try {
        const parsed = typeof resp.questionnaireData === 'string'
          ? JSON.parse(resp.questionnaireData)
          : resp.questionnaireData;
        const conversation = parsed.conversation || [];
        for (const msg of conversation) {
          if (msg.role === 'user' && typeof msg.content === 'string') {
            const c = msg.content.toLowerCase();
            if (c.includes('doutor') || c.includes('médico') || c.includes('dr.') ||
                c.includes('dr ') || c.includes('consultório') || c.includes('ele mandou') ||
                c.includes('ele pediu')) {
              mentions.push(msg.content);
            }
          }
        }
      } catch { /* ignore */ }
      return mentions;
    };

    // RESUMO COMPACTO dos dias mais antigos (uma linha por dia)
    if (olderFollowUps.length > 0) {
      summary += `RESUMO GERAL (${olderFollowUps.map(f => `D+${f.dayNumber}`).join(', ')}):\n`;
      for (const followUp of olderFollowUps.reverse()) { // Cronológico
        if (!followUp.responses?.length) continue;
        const data = extractData(followUp.responses[0]);
        const parts: string[] = [];
        if (data.pain !== undefined) parts.push(`dor ${data.pain}/10`);
        if (data.bowelMovementSinceLastContact !== undefined) parts.push(data.bowelMovementSinceLastContact ? 'evacuou' : 'não evacuou');
        if (data.bleeding) parts.push(`sangr: ${data.bleeding}`);
        if (data.fever === true) parts.push(`febre${data.feverTemperature ? ` ${data.feverTemperature}°C` : ''}`);
        if (data.usedExtraMedication === true) parts.push(`med extra: ${data.extraMedicationDetails || 'sim'}`);
        if (parts.length > 0) summary += `  D+${followUp.dayNumber}: ${parts.join(' | ')}\n`;
      }
      summary += '\n';
    }

    // DETALHES dos 3 últimos acompanhamentos
    for (const followUp of recentFollowUps.reverse()) { // Cronológico
      if (!followUp.responses?.length) continue;
      const data = extractData(followUp.responses[0]);

      summary += `D+${followUp.dayNumber}:\n`;
      if (data.pain !== undefined) summary += `  - Dor repouso: ${data.pain}/10\n`;
      if (data.painDuringBowelMovement !== undefined) summary += `  - Dor ao evacuar: ${data.painDuringBowelMovement}/10\n`;
      if (data.bowelMovementSinceLastContact !== undefined) summary += `  - Evacuou: ${data.bowelMovementSinceLastContact ? 'Sim' : 'Não'}\n`;
      if (data.bowelMovementCount) summary += `  - Vezes que evacuou: ${data.bowelMovementCount}\n`;
      if (data.bleeding) summary += `  - Sangramento: ${data.bleeding}\n`;
      if (data.fever === true) summary += `  - Febre: ${data.feverTemperature ? `${data.feverTemperature}°C` : 'Sim'}\n`;
      if (data.usedExtraMedication === true) summary += `  - Med. extra: ${data.extraMedicationDetails || 'Sim'}\n`;
      if (data.concerns) summary += `  - Preocupação: "${data.concerns}"\n`;

      const mentions = extractDoctorMentions(followUp.responses[0]);
      for (const m of mentions) {
        summary += `  - Orientação médica mencionada: "${m}"\n`;
      }
      summary += '\n';
    }

    return summary;
  } catch (error) {
    console.error('Error building previous days summary:', error);
    return '';
  }
}

/**
 * Conduz conversa com paciente para coletar dados do questionário
 */
export async function conductConversation(
  userMessage: string,
  patient: Patient & { doctorName?: string; user?: { nomeCompleto: string } },
  surgery: Surgery,
  conversationHistory: ConversationMessage[],
  currentData: QuestionnaireData,
  followUpDayNumber?: number
): Promise<{
  aiResponse: string;
  updatedData: QuestionnaireData;
  isComplete: boolean;
  needsDoctorAlert: boolean;
  urgencyLevel: string;
  sendImages?: {
    painScale?: boolean;
  };
}> {
  // Nome do médico: patient.doctorName (webhook) > patient.user (Prisma) > fallback
  const nomeMedico = patient.doctorName || patient.user?.nomeCompleto || 'seu médico';

  // Usar o dayNumber do follow-up (fonte confiável) em vez de calcular pelo relógio.
  // Isso evita que respostas após meia-noite sejam contadas como dia seguinte.
  let daysPostOp: number;
  if (followUpDayNumber !== undefined) {
    daysPostOp = followUpDayNumber;
  } else {
    // Fallback: calcular pelo relógio (para chamadas que não passam dayNumber)
    const nowBrasilia = toBrasiliaTime(new Date());
    const surgeryBrasilia = toBrasiliaTime(surgery.date);
    const nowDayStart = new Date(nowBrasilia.getFullYear(), nowBrasilia.getMonth(), nowBrasilia.getDate());
    const surgeryDayStart = new Date(surgeryBrasilia.getFullYear(), surgeryBrasilia.getMonth(), surgeryBrasilia.getDate());
    daysPostOp = Math.round((nowDayStart.getTime() - surgeryDayStart.getTime()) / (1000 * 60 * 60 * 24));
  }

    const dailyQuestions = { contextForAI: '' };

  // Definir o que ainda precisa ser coletado
  const hadFirstBowelMovement = surgery.hadFirstBowelMovement || false;
  const missingInfo = getMissingInformation(currentData, daysPostOp, hadFirstBowelMovement);

  // Buscar protocolos: primeiro tenta banco de dados, fallback para hardcoded
  console.log('🧠 [STEP 2] Loading medical protocols...');
  let medicalProtocol: string;
  try {
    medicalProtocol = await getProtocolsForAI(
      patient.userId,       // ID do médico responsável
      surgery.type,         // Tipo de cirurgia
      daysPostOp,           // Dia pós-operatório
      patient.researchId    // ID da pesquisa (opcional - está no Patient)
    );
    console.log('🧠 [STEP 2] Protocols loaded OK, length:', medicalProtocol.length);
  } catch (err: any) {
    console.error('🧠 [STEP 2] FAILED:', err.message);
    medicalProtocol = 'Protocolo padrão de acompanhamento pós-operatório.';
  }

  // Buscar resumo dos dias anteriores (memória entre dias)
  console.log('🧠 [STEP 3] Loading previous days summary...');
  let previousDaysSummary: string;
  try {
    previousDaysSummary = await getPreviousDaysSummary(surgery.id, daysPostOp);
    console.log('🧠 [STEP 3] Summary loaded OK, length:', previousDaysSummary.length);
  } catch (err: any) {
    console.error('🧠 [STEP 3] FAILED:', err.message);
    previousDaysSummary = '';
  }

  // Buscar notas do médico (orientações específicas para este paciente)
  const doctorNotes = (surgery as any).doctorNotes || '';

  // Construir prompt para Claude
  const systemPrompt = `
═══════════════════════════
1. IDENTIDADE
═══════════════════════════
Você é a VigIA, assistente virtual de acompanhamento pós-operatório colorretal.
Tom: empática, calorosa, linguagem simples. Sem termos médicos complexos.

═══════════════════════════
2. CONTEXTO DO PACIENTE
═══════════════════════════
Paciente: ${patient.name}
Cirurgia: ${surgery.type}
Dia pós-operatório: D+${daysPostOp}
${doctorNotes ? `Notas do médico (PRIORIDADE sobre protocolo): ${doctorNotes}` : ''}
${medicalProtocol ? `\nProtocolo médico:\n${medicalProtocol}` : ''}
${previousDaysSummary}

═══════════════════════════
3. ESTADO DA COLETA
═══════════════════════════
Dados já coletados hoje: ${JSON.stringify(currentData)}

Campos que FALTAM coletar:
${missingInfo.length > 0 ? missingInfo.map(info => `- ${info}`).join('\n') : '✅ Tudo coletado!'}

═══════════════════════════
4. ORDEM DE COLETA
═══════════════════════════
Siga esta ordem. Faça UMA pergunta por mensagem. Espere a resposta antes de prosseguir.

1. DOR EM REPOUSO (campo: pain, 0-10)
   Perguntar: "Como está sua dor agora, parado(a)? De 0 a 10."
   Se resposta verbal: sem dor=0, leve=1-3, média=4-6, forte=7-8, insuportável=9-10

2. MEDICAÇÃO EXTRA (campo: usedExtraMedication + extraMedicationDetails)
   Perguntar: "Usou alguma medicação além das prescritas?"
   Se sim: pedir qual, dose e horário. Pode citar nomes que o paciente mencionar.

3. EVACUAÇÃO
${!hadFirstBowelMovement ? `   [PRIMEIRA EVACUAÇÃO PÓS-CIRURGIA AINDA NÃO REGISTRADA]
   a) Perguntar: "Evacuou desde a última vez que conversamos?"
   b) Se SIM:
      → "Quando foi? Hoje ou ontem? Que horas mais ou menos?"
        Se "ontem" no D+${daysPostOp} → dia real = D+${daysPostOp - 1}
        Extrair: firstBowelMovementActualDay (dia real), bowelMovementTime (horário)
      → "Qual foi a dor ao evacuar? De 0 a 10." (campo: painDuringBowelMovement)
      NÃO perguntar "se foi a primeira do dia" — é a PRIMEIRA DESDE A CIRURGIA
   c) Se NÃO: registrar e seguir adiante` : `   [DIÁRIO EVACUATÓRIO — primeira evacuação já registrada]
   a) Perguntar: "Desde a última vez que conversamos, você evacuou?"
   b) Se SIM:
      → "Quantas vezes?" (campo: bowelMovementCount)
      → "Qual foi a dor na última evacuação? De 0 a 10." (campo: painDuringBowelMovement)
   c) Se NÃO: registrar e seguir adiante`}

4. SANGRAMENTO (campo: bleeding)
   Perguntar: "Teve algum sangramento?"
   Classificar: nenhum (none) | leve/papel (minimal) | mancha roupa (moderate) | encheu vaso (severe)

${daysPostOp === 1 ? `5. URINA (campo: urination) — OBRIGATÓRIO D+1
   Perguntar: "Está conseguindo urinar normalmente?"
   Retenção urinária >6h = RED FLAG\n` : ''}6. FEBRE (campos: fever + feverTemperature)
   Perguntar: "Teve febre?"
   Se sim: "Qual foi a temperatura?"

7. MEDICAÇÕES PRESCRITAS (campo: medications)
   Perguntar: "Está tomando as medicações conforme prescrito?"

8. CUIDADOS LOCAIS (campo: localCareAdherence)
   Perguntar: "Está seguindo os cuidados orientados pelo médico? Pomadas, banho de assento, compressas..."

9. PERGUNTA FINAL (campo: additionalSymptoms — SEMPRE por último)
   Perguntar: "Tem mais alguma coisa que gostaria de me contar?"
${daysPostOp >= 14 ? `
10. SATISFAÇÃO (D+14) — campos: satisfactionRating, wouldRecommend, improvementSuggestions
    "De 0 a 10, qual sua nota para o acompanhamento?"
    "Recomendaria para outros pacientes?"
    "Alguma sugestão de melhoria?"` : ''}
${daysPostOp === 2 ? `
NOTA D+2: Aumento de dor é NORMAL (bloqueio pudendo terminando). Tranquilizar o paciente.` : ''}

═══════════════════════════
5. REGRAS
═══════════════════════════
- UMA pergunta por mensagem. Espere a resposta.
- NUNCA sugira respostas. Nunca diga "posso anotar como X?".
- NUNCA prescreva medicamentos ou orientações médicas fora do protocolo.
- Se resposta não faz sentido, repita gentilmente. NUNCA invente dados.
- NUNCA copie dados de dias anteriores para hoje. Cada dia é independente.
- NÃO pergunte se dor melhorou/piorou. O sistema calcula automaticamente.
- NÃO marque isComplete:true até TODOS os campos faltantes serem coletados.
- RED FLAGS → orientar PRONTO-SOCORRO: dor ≥8, sangramento volumoso, febre ≥38°C, retenção urinária.
- PROGRESSO: Se a dor de hoje for menor que a do dia anterior (veja MEMÓRIA), faça um breve comentário positivo ("Que bom que a dor diminuiu!"). Não exagere — uma frase curta basta.
- MARCO — PRIMEIRA EVACUAÇÃO: Se o paciente relatar a primeira evacuação pós-cirurgia, celebre brevemente ("Ótima notícia! Esse é um marco importante da recuperação.") antes de continuar com as perguntas.

═══════════════════════════
6. FORMATO DE RESPOSTA
═══════════════════════════
Retorne JSON puro, sem markdown:
{
  "response": "sua mensagem para o paciente",
  "extractedInfo": { /* só dados coletados NESTA mensagem */ },
  "isComplete": false,
  "urgency": "low",
  "needsDoctorAlert": false
}

Exemplos de extração:
- "Dor 3" → "pain": 3
- "Doeu 5 ao evacuar" → "painDuringBowelMovement": 5 (campo DIFERENTE de pain)
- "Sem febre" → "fever": false
- "Tive febre, 37.8" → "fever": true, "feverTemperature": 37.8
- "Não tomei nada extra" → "usedExtraMedication": false
- "Tomei Tramadol" → "usedExtraMedication": true, "extraMedicationDetails": "Tramadol"
- "Estou fazendo os cuidados" → "localCareAdherence": true
- "Só isso" / "Nada mais" → "additionalSymptoms": null
- "Tive coceira" → "additionalSymptoms": "Coceira"
- "Evacuei hoje de manhã" → "bowelMovementSinceLastContact": true, "firstBowelMovementActualDay": ${daysPostOp}, "bowelMovementTime": "de manhã"
- "Evacuei ontem às 8h" → "bowelMovementSinceLastContact": true, "firstBowelMovementActualDay": ${daysPostOp - 1}, "bowelMovementTime": "20:00"
- "Fui ao banheiro 2 vezes" → "bowelMovementSinceLastContact": true, "bowelMovementCount": 2
- "Não evacuei" → "bowelMovementSinceLastContact": false
${daysPostOp >= 14 ? `- "Nota 9" → "satisfactionRating": 9\n- "Recomendo sim" → "wouldRecommend": true\n- "Poderia melhorar X" → "improvementSuggestions": "Poderia melhorar X"` : ''}`;

  try {
    console.log('🧠 conductConversation - Starting...');
    console.log('🧠 User message:', userMessage);
    console.log('🧠 Patient:', patient?.name);
    console.log('🧠 Surgery type:', surgery?.type);
    console.log('🧠 Surgery ID:', surgery?.id);
    console.log('🧠 Days post-op:', daysPostOp);
    console.log('🧠 Conversation history length:', conversationHistory.length);
    console.log('🧠 Current data:', JSON.stringify(currentData));
    console.log('🧠 Patient has userId:', !!patient?.userId);
    console.log('🧠 Surgery has date:', !!surgery?.date);

    // Construir mensagens para Claude
    // CRÍTICO: Anthropic API exige alternância estrita user/assistant
    // Nunca pode ter duas mensagens do mesmo role consecutivas
    const messages: any[] = [];

    // Adicionar histórico COM SANITIZAÇÃO de roles consecutivos
    conversationHistory.forEach(msg => {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === msg.role) {
        // Merge com a mensagem anterior do mesmo role (evita erro 400)
        lastMsg.content = lastMsg.content + '\n\n' + msg.content;
        console.log(`🧠 MERGED consecutive ${msg.role} messages to avoid API error`);
      } else {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    });

    // Adicionar mensagem atual do usuário
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'user') {
      // Se a última mensagem já é user, merge (evita user/user)
      lastMsg.content = lastMsg.content + '\n\n' + userMessage;
      console.log('🧠 MERGED user message with previous user message');
    } else {
      messages.push({
        role: 'user',
        content: userMessage
      });
    }

    console.log('🧠 [STEP 4] Messages array length:', messages.length);
    console.log('🧠 [STEP 4] Messages roles:', messages.map((m: any) => m.role).join(', '));
    console.log('🧠 [STEP 4] System prompt length:', systemPrompt.length, 'chars');
    console.log('🧠 [STEP 4] Total messages content:', messages.reduce((sum: number, m: any) => sum + (m.content?.length || 0), 0), 'chars');
    console.log('🧠 [STEP 4] Calling Anthropic API...');

    // Chamada à API com retry rápido (máximo 1 retry, timeout 45s)
    // Vercel Hobby permite até 60s com maxDuration=60
    let response;
    let retries = 0;
    const maxRetries = 1; // Apenas 1 retry para não desperdiçar tempo
    while (retries <= maxRetries) {
      try {
        response = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          temperature: 0.1,
          system: systemPrompt,
          messages: messages,
        }, {
          timeout: 45000, // 45 seconds - leaves 15s for DB + WhatsApp within Vercel's 60s limit
        });
        break; // Sucesso, sair do loop
      } catch (retryError: any) {
        retries++;
        console.error(`🧠 Anthropic API attempt ${retries} failed:`, retryError?.message);
        if (retries > maxRetries) throw retryError;
        // Espera curta antes do retry
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!response) {
      throw new Error('Anthropic API falhou após todas as tentativas');
    }

    console.log('🧠 Anthropic API response received!');
    console.log('🧠 Response content length:', response.content.length);

    const content = response.content[0];
    if (content.type !== 'text') {
      console.error('🧠 ERROR: Unexpected response type:', content.type);
      throw new Error('Unexpected response type from Claude');
    }

    console.log('🧠 Raw response text (first 500 chars):', content.text.substring(0, 500));

    // Limpar markdown formatting se presente
    let cleanText = content.text.trim();

    // Remove markdown code blocks if explicitly wrapped
    if (cleanText.includes('```')) {
      cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '');
    }

    // Encontrar o primeiro '{' e o último '}' para isolar o objeto JSON
    const startIndex = cleanText.indexOf('{');
    const endIndex = cleanText.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      // AI respondeu com texto puro sem JSON — usar texto como resposta diretamente
      // NÃO fazer throw! Isso causava fallback desnecessário
      console.warn('⚠️ AI respondeu sem JSON. Usando texto como aiResponse diretamente.');
      console.warn('⚠️ Texto recebido:', cleanText.substring(0, 300));
      return {
        aiResponse: cleanText,
        updatedData: currentData, // NÃO modifica dados
        isComplete: false,
        needsDoctorAlert: false,
        urgencyLevel: 'low' as const,
      };
    }

    const jsonString = cleanText.substring(startIndex, endIndex + 1);

    let result;
    try {
      result = JSON.parse(jsonString);
    } catch (parseError) {
      // JSON malformado — usar texto original como resposta
      console.warn('⚠️ JSON parse falhou. Usando texto como aiResponse.');
      console.warn('⚠️ JSON tentado:', jsonString.substring(0, 300));
      return {
        aiResponse: cleanText,
        updatedData: currentData, // NÃO modifica dados
        isComplete: false,
        needsDoctorAlert: false,
        urgencyLevel: 'low' as const,
      };
    }

    // NORMALIZAÇÃO: A IA às vezes usa nomes de campos diferentes dos esperados.
    // Mapear variações para os nomes canônicos que getMissingInformation() espera.
    const rawInfo = result.extractedInfo || {};
    const extractedInfo: Record<string, any> = {};

    const fieldAliases: Record<string, string> = {
      // Evacuação
      bowelMovement: 'bowelMovementSinceLastContact',
      hadBowelMovement: 'bowelMovementSinceLastContact',
      evacuated: 'bowelMovementSinceLastContact',
      hadBowelMovementSinceLastContact: 'bowelMovementSinceLastContact',
      // Medicações prescritas
      prescribedMedicationAdherence: 'medications',
      takingPrescribedMeds: 'medications',
      takingMedications: 'medications',
      medicationAdherence: 'medications',
      // Febre
      hasFever: 'fever',
      temperature: 'feverTemperature',
      // Dor
      painAtRest: 'pain',
      painLevel: 'pain',
      painDuringEvacuation: 'painDuringBowelMovement',
      painDuringBowel: 'painDuringBowelMovement',
      // Sangramento
      bleedingLevel: 'bleeding',
      // Urina
      canUrinate: 'urination',
      urinaryRetention: 'urination', // inverter valor
      // Medicação extra
      takingExtraMeds: 'usedExtraMedication',
      extraMeds: 'usedExtraMedication',
      extraMedsDetails: 'extraMedicationDetails',
      // Outros
      otherSymptoms: 'additionalSymptoms',
      concerns: 'additionalSymptoms',
    };

    for (const [key, value] of Object.entries(rawInfo)) {
      const canonicalKey = fieldAliases[key] || key;
      // Não sobrescrever se já tem valor canônico definido nesta mesma extração
      if (extractedInfo[canonicalKey] === undefined) {
        extractedInfo[canonicalKey] = value;
      }
    }

    const userMsgLower = userMessage.toLowerCase();
    const mentionedPain = userMsgLower.match(/\b([0-9]|10)\b/) ||
      userMsgLower.includes('dor') ||
      userMsgLower.includes('doendo') ||
      userMsgLower.includes('doer') ||
      userMsgLower.includes('doi') ||
      userMsgLower.includes('incômodo') ||
      userMsgLower.includes('desconforto');

    // Proteger campo 'pain' (dor em repouso) contra sobrescrita
    if (currentData.pain !== undefined && currentData.pain !== null &&
        extractedInfo.pain !== undefined && extractedInfo.pain !== currentData.pain) {
      if (!mentionedPain) {
        console.log(`⚠️ PROTEÇÃO: Claude tentou sobrescrever pain ${currentData.pain} → ${extractedInfo.pain} sem paciente mencionar dor. Mantendo valor original.`);
        delete extractedInfo.pain;
      } else {
        console.log(`✅ Pain atualizado: ${currentData.pain} → ${extractedInfo.pain} (paciente mencionou dor)`);
      }
    }

    // Proteger campo 'painDuringBowelMovement' contra sobrescrita
    if (currentData.painDuringBowelMovement !== undefined && currentData.painDuringBowelMovement !== null &&
        extractedInfo.painDuringBowelMovement !== undefined && extractedInfo.painDuringBowelMovement !== currentData.painDuringBowelMovement) {
      if (!mentionedPain) {
        console.log(`⚠️ PROTEÇÃO: Claude tentou sobrescrever painDuringBowelMovement ${currentData.painDuringBowelMovement} → ${extractedInfo.painDuringBowelMovement} sem paciente mencionar dor. Mantendo valor original.`);
        delete extractedInfo.painDuringBowelMovement;
      } else {
        console.log(`✅ PainDuringBowelMovement atualizado: ${currentData.painDuringBowelMovement} → ${extractedInfo.painDuringBowelMovement} (paciente mencionou dor)`);
      }
    }

    const updatedData = {
      ...currentData,
      ...extractedInfo
    };

    // Validação server-side: não aceitar isComplete se ainda faltam dados obrigatórios
    let isComplete = result.isComplete || false;
    let aiResponse = result.response;
    if (isComplete) {
      const stillMissing = getMissingInformation(updatedData, daysPostOp, hadFirstBowelMovement);
      if (stillMissing.length > 0) {
        console.log('⚠️ IA marcou isComplete=true mas ainda faltam dados:', stillMissing);
        isComplete = false;
        // Substituir a despedida da IA por uma pergunta amigável sobre o que falta
        // Usar perguntas prontas para campos comuns, caso contrário usar a descrição técnica
        const friendlyQuestions: Record<string, string> = {
          'Se está seguindo os cuidados locais orientados pelo médico (pomadas, banhos de assento, compressas)':
            'Ah, antes de encerrar, preciso te perguntar uma coisa importante: você está seguindo os cuidados locais orientados pelo médico? Como uso de pomadas, banhos de assento, compressas... Está conseguindo fazer direitinho?',
          'Deseja relatar mais alguma coisa ao médico':
            'E para finalizar: tem mais alguma coisa que você gostaria de me contar? Qualquer sintoma, dúvida ou preocupação — pode falar livremente! 😊',
        };
        // Priorizar: additionalSymptoms deve ser o ÚLTIMO. Se há outros campos faltando, perguntar eles primeiro.
        const missingExceptAdditional = stillMissing.filter(
          m => m !== 'Deseja relatar mais alguma coisa ao médico'
        );
        const nextMissing = missingExceptAdditional.length > 0 ? missingExceptAdditional[0] : stillMissing[0];
        aiResponse = friendlyQuestions[nextMissing] || `Antes de encerrar, preciso perguntar mais uma coisa: ${nextMissing}`;
      }
    }

    return {
      aiResponse,
      updatedData,
      isComplete,
      needsDoctorAlert: result.needsDoctorAlert || false,
      urgencyLevel: result.urgency || 'low',
      sendImages: result.sendImages
    };

  } catch (error: any) {
    // ⚠️ FALLBACK SEGURO: NUNCA grava dados, NUNCA assume respostas
    // Apenas pede para o paciente repetir a resposta
    console.error('🚨🚨🚨 FALLBACK ATIVADO - Claude API FALHOU!');
    console.error('🚨 Error type:', error?.constructor?.name);
    console.error('🚨 Error message:', error?.message);
    console.error('🚨 Error status:', error?.status);
    console.error('🚨 Error code:', error?.error?.type || error?.code);
    console.error('🚨 Error headers:', JSON.stringify(error?.headers));
    console.error('🚨 Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error || {})));
    console.error('🚨 User message was:', userMessage);
    console.error('🚨 Current data state:', JSON.stringify(currentData));
    console.error('🚨 Conversation history length:', conversationHistory?.length || 0);
    console.error('🚨 Conversation roles:', conversationHistory?.map((m: any) => m.role)?.join(', '));

    // SALVAR ERRO COMPLETO NO BANCO para diagnóstico
    const errorData = {
      timestamp: new Date().toISOString(),
      errorType: error?.constructor?.name,
      errorMessage: error?.message?.substring(0, 500),
      errorStatus: error?.status,
      errorCode: error?.error?.type || error?.code,
      errorStack: error?.stack?.substring(0, 300),
      fullError: (() => {
        try { return JSON.stringify(error, Object.getOwnPropertyNames(error || {})).substring(0, 1000); }
        catch { return 'Could not serialize'; }
      })(),
      userMessage: userMessage?.substring(0, 200),
      historyLength: conversationHistory?.length || 0,
      roles: conversationHistory?.map((m: any) => m.role),
      currentDataKeys: Object.keys(currentData || {}),
      patientName: patient?.name,
      surgeryType: surgery?.type,
      daysPostOp,
    };
    console.error('🚨 ERROR DATA TO SAVE:', JSON.stringify(errorData));
    try {
      await prisma.systemConfig.upsert({
        where: { key: 'LAST_AI_ERROR' },
        update: { value: JSON.stringify(errorData) },
        create: { key: 'LAST_AI_ERROR', value: JSON.stringify(errorData) },
      });
      console.error('🚨 Error saved to DB successfully');
    } catch (dbErr) {
      console.error('🚨 Failed to save error to DB:', dbErr);
    }

    // REGRA DE OURO: O fallback NUNCA modifica dados (updatedData = currentData)
    // Apenas pede ao paciente para repetir, para que na próxima tentativa a IA funcione
    return {
      aiResponse: 'Desculpe, tive uma dificuldade técnica momentânea. 😔 Poderia repetir sua última resposta, por favor? Preciso garantir que registrei tudo direitinho.',
      updatedData: currentData, // NUNCA modificar dados no fallback
      isComplete: false,
      needsDoctorAlert: false,
      urgencyLevel: 'low'
    };
  }
}

/**
 * Determina quais informações ainda faltam coletar
 */
function getMissingInformation(data: QuestionnaireData, daysPostOp: number, hadFirstBowelMovement: boolean = false): string[] {
  const missing: string[] = [];

  // 1. DOR (sempre obrigatório)
  if (data.pain === undefined || data.pain === null) {
    missing.push('🚨 Nível de dor ATUAL (0-10 na escala numérica)');
  }

  // 2. MEDICAÇÃO EXTRA (OBRIGATÓRIO TODOS OS DIAS - PERGUNTAR CEDO!)
  // Movido para cima para garantir que seja perguntado
  if (data.usedExtraMedication === undefined) {
    missing.push('🚨 MEDICAÇÃO EXTRA: Usou Tramadol, Codeína, Tylex, ou outro analgésico além dos prescritos?');
  } else if (data.usedExtraMedication === true && !data.extraMedicationDetails) {
    missing.push('🚨 Qual medicação extra usou, dose e horário');
  }

  // 3. EVACUAÇÃO
  if (data.bowelMovementSinceLastContact === undefined) {
    missing.push('Se evacuou desde o último contato');
  } else if (data.bowelMovementSinceLastContact === false) {
    // Não evacuou — não perguntar nada a mais (contexto: paciente simplesmente não evacuou desde o último contato)
    // Apenas registrar ausência. Não perguntar "quando foi a última" pois é desnecessário para o diário.
  } else if (data.bowelMovementSinceLastContact === true) {
    // Evacuou!
    if (!hadFirstBowelMovement) {
      // ---- PRIMEIRA EVACUAÇÃO PÓS-CIRURGIA ----
      // Perguntar dor durante evacuação
      if (data.painDuringBowelMovement === undefined || data.painDuringBowelMovement === null) {
        missing.push('Dor durante a evacuação (0-10) — primeira evacuação pós-cirurgia');
      }
      // Perguntar horário aproximado — para registrar a PRIMEIRA EVACUAÇÃO PÓS-CIRURGIA
      // A IA deve entender referências como "ontem às 8h" e extrair o dia correto
      if (!data.bowelMovementTime) {
        missing.push('Horário aproximado dessa evacuação (ex: "de manhã", "às 14h", "à noite"). IMPORTANTE: perguntar QUANDO ocorreu (ex: hoje, ontem) para registrar o dia correto da primeira evacuação após a cirurgia');
      }
    } else {
      // ---- DIÁRIO EVACUATÓRIO (após 1ª evacuação já registrada) ----
      // Perguntar quantas vezes evacuou desde o último contato
      if (data.bowelMovementCount === undefined || data.bowelMovementCount === null) {
        missing.push('Quantas vezes evacuou desde a última vez que conversamos');
      }
      // Perguntar dor na última evacuação
      if (data.painDuringBowelMovement === undefined || data.painDuringBowelMovement === null) {
        missing.push('Dor na última evacuação (0-10 na escala numérica)');
      }
    }
  }

  // 4. SANGRAMENTO
  if (!data.bleeding) {
    missing.push('Informações sobre sangramento (nenhum, leve, moderado, intenso)');
  }

  // 5. URINA (apenas D+1 - retenção pós-anestesia imediata)
  if (daysPostOp === 1) {
    if (data.urination === undefined) {
      missing.push('Se está conseguindo urinar normalmente');
    }
  }

  // 6. FEBRE
  if (data.fever === undefined) {
    missing.push('Se teve febre');
  } else if (data.fever === true && !data.feverTemperature) {
    missing.push('Qual foi a temperatura da febre (em °C)');
  }

  // 7. MEDICAÇÕES PRESCRITAS
  if (data.medications === undefined) {
    missing.push('Se está tomando as medicações conforme prescrito');
  }

  // 9. ADERÊNCIA A CUIDADOS LOCAIS (todos os dias)
  if (data.localCareAdherence === undefined) {
    missing.push('Se está seguindo os cuidados locais orientados pelo médico (pomadas, banhos de assento, compressas)');
  }

  // 11. PESQUISA DE SATISFAÇÃO (apenas D+14)
  if (daysPostOp >= 14) {
    if (data.satisfactionRating === undefined || data.satisfactionRating === null) {
      missing.push('Nota de satisfação com o acompanhamento (0-10)');
    }
    if (data.wouldRecommend === undefined) {
      missing.push('Se recomendaria o acompanhamento para outros pacientes');
    }
    if (data.improvementSuggestions === undefined) {
      missing.push('Sugestões ou críticas de melhoria');
    }
  }

  // 10. SINTOMAS ADICIONAIS (todos os dias - pergunta final)
  if (data.additionalSymptoms === undefined) {
    missing.push('Deseja relatar mais alguma coisa ao médico');
  }

  return missing;
}

/**
 * Inicia conversa com saudação personalizada
 * @param patient - Paciente (com user ou doctorName opcional para nome do médico)
 * @param doctorName - Nome do médico (opcional, fallback para patient.doctorName ou patient.user?.nomeCompleto)
 */
export async function getInitialGreeting(
  patient: Patient & { user?: { nomeCompleto: string }; doctorName?: string },
  surgery: Surgery,
  dayNumber: number,
  phoneNumber: string,
  doctorName?: string
): Promise<string> {
  const greeting = getGreeting();
  const firstName = patient.name.split(' ')[0];

  // Nome do médico: parâmetro > patient.doctorName (webhook) > patient.user (Prisma) > fallback
  const nomeMedico = doctorName || patient.doctorName || patient.user?.nomeCompleto || 'seu médico';

  // Buscar progresso do dia anterior para personalizar a saudação
  let progressMessage = '';
  if (dayNumber > 1) {
    try {
      const lastFollowUp = await prisma.followUp.findFirst({
        where: {
          surgeryId: surgery.id,
          status: 'responded',
          dayNumber: { lt: dayNumber },
        },
        include: { responses: true },
        orderBy: { dayNumber: 'desc' },
      });

      if (lastFollowUp?.responses?.length) {
        const resp = lastFollowUp.responses[0];
        let data: any = {};
        try {
          const parsed = typeof resp.questionnaireData === 'string'
            ? JSON.parse(resp.questionnaireData)
            : resp.questionnaireData;
          data = parsed.extractedData || parsed;
        } catch { /* ignore */ }

        const parts: string[] = [];

        // Celebrar primeira evacuação
        if (surgery.hadFirstBowelMovement && lastFollowUp.dayNumber === dayNumber - 1) {
          // Verificar se a primeira evacuação foi registrada no dia anterior
          if (data.bowelMovementSinceLastContact === true && !data.bowelMovementCount) {
            parts.push('🎉 Parabéns pela primeira evacuação — isso é um marco importante na recuperação!');
          }
        }

        // Mostrar tendência de dor
        if (data.pain !== undefined) {
          const painYesterday = data.pain;
          if (painYesterday <= 3) {
            parts.push(`Sua dor no D+${lastFollowUp.dayNumber} estava em ${painYesterday}/10 — ótimo!`);
          } else if (painYesterday <= 6) {
            parts.push(`Sua dor no D+${lastFollowUp.dayNumber} estava em ${painYesterday}/10.`);
          } else {
            parts.push(`Sua dor no D+${lastFollowUp.dayNumber} estava em ${painYesterday}/10. Vamos acompanhar de perto hoje.`);
          }
        }

        // Celebrar D+14 (último dia)
        if (dayNumber >= 14) {
          parts.push('Hoje é seu último dia de acompanhamento! 🎉');
        }

        if (parts.length > 0) {
          progressMessage = '\n' + parts.join('\n') + '\n';
        }
      }
    } catch (error) {
      console.error('Error fetching progress for greeting:', error);
    }
  }

  // Enviar imagem da escala de dor ANTES da saudação
  const { sendImage } = await import('./whatsapp');
  try {
    const imageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://proactive-rejoicing-production.up.railway.app'}/escala-dor.png`;

    await sendImage(
      phoneNumber,
      imageUrl,
      'Escala Numérica de Dor (0-10)'
    );

    console.log('✅ Pain scale image sent before initial greeting');
  } catch (error) {
    console.error('❌ Error sending pain scale image:', error);
  }

  // D+1: apresentação completa
  if (dayNumber === 1) {
    return `${greeting}, ${firstName}! 👋

Aqui é a VigIA, assistente virtual de acompanhamento pós-operatório do(a) ${nomeMedico}.

⚠️ *Importante:* Sou uma assistente virtual — não sou médica e não prescrevo medicamentos. Meu papel é coletar informações sobre como você está e repassar tudo certinho para o(a) ${nomeMedico}. 😊

Vou te fazer algumas perguntas. Pode responder livremente!`;
  }

  // D+2 em diante: saudação mais curta + progresso
  return `${greeting}, ${firstName}! 👋

Aqui é a VigIA — D+${dayNumber} do seu pós-operatório.${progressMessage}

Vamos ao acompanhamento de hoje?`;
}

/**
 * Retorna saudação apropriada baseada no horário de Brasília
 */
function getGreeting(): string {
  const hour = getBrasiliaHour();

  if (hour >= 5 && hour < 12) {
    return 'Bom dia';
  } else if (hour >= 12 && hour < 18) {
    return 'Boa tarde';
  } else {
    return 'Boa noite';
  }
}
