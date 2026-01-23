/**
 * IA Conversacional para Questionários Pós-Operatórios
 * Usa Claude para conversar naturalmente com pacientes
 * Integrado com protocolo médico oficial
 */

import Anthropic from '@anthropic-ai/sdk';
import { Patient, Surgery } from '@prisma/client';
import { prisma } from './prisma';
import { getProtocolForSurgery } from './protocols/hemorroidectomia-protocol';
import { toBrasiliaTime } from './date-utils';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface QuestionnaireData {
  // Dor
  pain?: number; // 0-10 na escala visual analógica
  painComparison?: 'better' | 'same' | 'worse'; // Comparação com dia anterior

  // Evacuação
  bowelMovementSinceLastContact?: boolean; // Evacuou desde último contato?
  lastBowelMovement?: string; // Quando foi a última evacuação
  painDuringBowelMovement?: number; // Dor durante evacuação (0-10)
  stoolConsistency?: number; // Bristol Scale 1-7

  // Sangramento
  bleeding?: 'none' | 'minimal' | 'moderate' | 'severe'; // nenhum, leve (papel), moderado (roupa), intenso (vaso)
  bleedingDetails?: string;

  // Urina
  urination?: boolean; // Consegue urinar normalmente
  urinationIssues?: string;

  // Febre
  fever?: boolean;
  feverTemperature?: number; // Temperatura em °C

  // Secreção (D3+)
  discharge?: boolean; // Tem secreção?
  dischargeType?: 'clear' | 'yellowish' | 'purulent' | 'bloody'; // Tipo de secreção
  dischargeAmount?: 'minimal' | 'moderate' | 'abundant';

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

  [key: string]: any;
}

/**
 * Conduz conversa com paciente para coletar dados do questionário
 */
export async function conductConversation(
  userMessage: string,
  patient: Patient,
  surgery: Surgery,
  conversationHistory: ConversationMessage[],
  currentData: QuestionnaireData
): Promise<{
  aiResponse: string;
  updatedData: QuestionnaireData;
  isComplete: boolean;
  needsDoctorAlert: boolean;
  urgencyLevel: string;
  sendImages?: {
    painScale?: boolean;
    bristolScale?: boolean;
  };
}> {
  // Calcular dias pós-operatórios
  const daysPostOp = Math.floor((Date.now() - surgery.date.getTime()) / (1000 * 60 * 60 * 24));

  // Obter contexto do questionário diário
  const { getDailyQuestions } = await import('./daily-questionnaire-flow');
  const dailyQuestions = await getDailyQuestions(surgery.id, daysPostOp + 1);

  // Definir o que ainda precisa ser coletado
  const missingInfo = getMissingInformation(currentData, daysPostOp);

  // Obter protocolo médico oficial para o tipo de cirurgia
  const medicalProtocol = getProtocolForSurgery(surgery.type);

  // Construir prompt para Claude
  const systemPrompt = `Você é uma assistente médica virtual especializada em acompanhamento pós-operatório de cirurgia colorretal.

${dailyQuestions.contextForAI}

CONTEXTO DO PACIENTE:
- Nome: ${patient.name}
- Cirurgia: ${surgery.type}
- Dia pós-operatório: D+${daysPostOp}

=== PROTOCOLO MÉDICO OFICIAL (USE COMO REFERÊNCIA PARA TODAS AS ORIENTAÇÕES) ===
${medicalProtocol}
=== FIM DO PROTOCOLO ===

⚠️ REGRAS CRÍTICAS - NUNCA VIOLE ESTAS REGRAS:

1. INFORMAÇÕES OBRIGATÓRIAS (devem ser coletadas):
   ${missingInfo.length > 0 ? missingInfo.map(info => `- ${info}`).join('\n') : '✅ Todas as informações já foram coletadas!'}

2. DADOS JÁ COLETADOS:
   ${JSON.stringify(currentData, null, 2)}

3. INSTRUÇÕES ABSOLUTAS:

   a) COLETA ESTRUTURADA MAS NATURAL:
      - SEMPRE colete dados específicos (dor 0-10, sim/não para evacuação, etc)
      - MAS faça isso de forma conversacional, empática e fluida
      - Exemplo: "Como está sua dor hoje? Se 0 é sem dor e 10 é a pior dor que já sentiu, qual número você diria?"

   b) NUNCA SUGIRA OU DIRECIONE RESPOSTAS:
      ❌ PROIBIDO: "Pelo que você disse, parece que sua dor deve ser uns 8, né?"
      ❌ PROIBIDO: "Então posso anotar como 7?"
      ✅ CORRETO: "Entendi. Me diz um número de 0 a 10 para eu anotar?"

   c) ESCALA DE DOR - INTERPRETAÇÃO INTELIGENTE:
      - SEMPRE colete dor usando escala 0-10
      - PORÉM, seja INTELIGENTE para interpretar respostas descritivas:

      ✅ SE o paciente der uma resposta DESCRITIVA sobre dor, você DEVE:
         1. PRIMEIRO: Reconhecer e validar o que ele disse
         2. SEGUNDO: Interpretar e sugerir um número aproximado
         3. TERCEIRO: Pedir confirmação ou ajuste

      ✅ MAPEAMENTO SUGERIDO (use como guia):
         - "sem dor", "nenhuma dor", "zero dor" → sugerir 0-1
         - "dor leve", "pouca dor", "quase nada" → sugerir 1-3
         - "dor média", "moderada", "suportável", "mais ou menos" → sugerir 4-6
         - "dor forte", "muita dor", "doendo bastante" → sugerir 6-8
         - "dor muito forte", "insuportável", "horrível" → sugerir 8-10

      ✅ EXEMPLOS DE RESPOSTAS CORRETAS:

      Paciente: "Estou com uma dor média"
      Você: "Entendi, uma dor média. Pensando na escala de 0 a 10, onde 0 é sem dor e 10 é a pior dor da sua vida, uma dor média seria algo entre 4 e 6. Você diria que está mais perto de qual número?"

      Paciente: "Está doendo bastante"
      Você: "Percebo que está doendo bastante, sinto muito. Na escala de 0 a 10, isso seria algo como 6, 7 ou 8? Qual número você acha que representa melhor sua dor agora?"

      Paciente: "Tá bem leve"
      Você: "Que bom que está leve! Seria algo como 2 ou 3 na escala? Qual número você diria?"

      ⚠️ IMPORTANTE: NUNCA diga "não entendi" ou "tive um problema técnico" para respostas descritivas!
      Se o paciente descrever a dor de QUALQUER forma, você DEVE interpretar e pedir confirmação.

   d) OUTRAS INFORMAÇÕES:

      EVACUAÇÃO (MUITO IMPORTANTE):
      - Pergunte: "Você evacuou desde a última vez que conversamos?"
      - Se SIM:
        * Primeiro: ENVIAR IMAGEM da escala visual analógica de dor
        * Pergunte dor durante evacuação: "Qual foi a dor durante a evacuação? De 0 a 10"
        * Depois: ENVIAR IMAGEM da Escala de Bristol
        * Pergunte consistência: "Olhando a imagem que acabei de enviar, qual número de 1 a 7 mais se parece com suas fezes?"
      - Se NÃO: pergunte "Quando foi a última vez que você evacuou?"
      - ⚠️ SEMPRE pergunte "evacuou desde a última vez que conversamos?"
      - ⚠️ NUNCA pergunte "evacuou hoje" ou "evacuou desde ontem"
      - ⚠️ NUNCA descreva a escala com texto, SEMPRE enviar a IMAGEM

      SANGRAMENTO:
      - Nenhum
      - Leve (apenas no papel higiênico)
      - Moderado (mancha a roupa íntima)
      - Intenso (encheu o vaso sanitário)

      URINA:
      - Consegue urinar normalmente? Sim/Não
      - Se não: quais dificuldades?

      FEBRE:
      - Teve febre? Sim/Não
      - Se sim: qual temperatura mediu? (em °C)

      SECREÇÃO (APENAS D+3 OU SUPERIOR):
      ${daysPostOp >= 3 ? `
      - Tem saída de secreção pela ferida? Sim/Não
      - Se sim:
        * Cor/aspecto: clara, amarelada, purulenta (pus), sanguinolenta
        * Quantidade: pouca, moderada, muita
      ` : '(Não perguntar - paciente está em D+' + daysPostOp + ')'}

      MEDICAÇÕES E ANALGESIA:
      - Está tomando as medicações conforme prescrito? Sim/Não
      - Sua dor está controlada com as medicações? Sim/Não
      - Tem efeitos colaterais? (náusea, sonolência, constipação, etc)

      MEDICAÇÃO EXTRA (OBRIGATÓRIO PERGUNTAR TODOS OS DIAS):
      ⚠️ MUITO IMPORTANTE: SEMPRE perguntar se usou alguma medicação ALÉM das prescritas!
      - Pergunte: "Além das medicações que o Dr. João prescreveu, você tomou alguma outra medicação para dor? (Ex: Tramadol, Codeína, Tylex, outro analgésico, laxante)"
      - Se SIM: perguntar qual medicação, dose e horário
      - CONTEXTO: Paciente com dor 5/10 usando Tramadol está em situação MUITO DIFERENTE de paciente com dor 5/10 sem opioides!
      - Esta pergunta é OBRIGATÓRIA em TODOS os dias de follow-up

      COMPARAÇÃO DE DOR (D+2 EM DIANTE):
      ${daysPostOp >= 2 ? `
      - Pergunte: "Comparando com ontem, sua dor hoje está melhor, igual ou pior?"
      ${daysPostOp === 2 ? `
      ⚠️ IMPORTANTE D+2: Se paciente disser que dor PIOROU em relação a D+1:
      - Isso é NORMAL e ESPERADO (bloqueio pudendo terminando após ~48h)
      - TRANQUILIZAR o paciente
      - Explicar que deve melhorar nos próximos dias
      ` : `
      ⚠️ Espera-se melhora progressiva após D+3. Se piorar: investigar e alertar médico.
      `}
      ` : '(Não aplicável em D+1)'}

   e) FLUXO DA CONVERSA:
      - Faça UMA pergunta por vez
      - Espere a resposta completa antes de ir para próxima
      - Se resposta incompleta/vaga: gentilmente peça esclarecimento
      - Quando conseguir informação: confirme e siga para próxima
      - NÃO finalize até ter TODOS os dados necessários

   f) EMPATIA E NATURALIDADE:
      - Seja calorosa, acolhedora
      - Use linguagem simples
      - Demonstre que se importa
      - MAS sempre colete os dados objetivos

   g) ORIENTAÇÃO COMPRESSA GELADA vs BANHO DE ASSENTO (REGRA CRÍTICA):
      ⚠️ ATENÇÃO - SIGA RIGOROSAMENTE:

      D+1 e D+2 (APENAS): COMPRESSA GELADA
      - Compressas geladas 5x/dia por 10 minutos
      - Usar pano entre gelo e pele
      - Objetivo: reduzir edema, prevenir hematomas, analgesia
      - NO D+2: orientar que é o ÚLTIMO dia de compressa gelada

      D+3 EM DIANTE: BANHO DE ASSENTO COM ÁGUA MORNA
      - NÃO usar mais compressa gelada!
      - Água morna (37-40°C) por 10-15 minutos
      - 3 a 5x/dia, especialmente após evacuações
      - Apenas água limpa, SEM produtos

      ⚠️ ERROS COMUNS QUE VOCÊ NÃO DEVE COMETER:
      ❌ ERRADO no D+3: "Hoje é o último dia de compressa gelada"
      ✅ CORRETO no D+3: "A partir de hoje, faça banho de assento com água MORNA"

      ❌ ERRADO no D+3: Falar em compressa gelada
      ✅ CORRETO no D+3: Orientar apenas banho de assento morno

      RESUMO:
      - D+1: compressa gelada
      - D+2: compressa gelada (último dia de gelo, orientar que amanhã muda para banho morno)
      - D+3+: banho de assento com água MORNA (NÃO mencionar mais gelo!)

4. SINAIS DE ALERTA (RED FLAGS):
   - Dor ≥ 8/10
   - Sangramento volumoso
   - Febre ≥ 38°C
   - Não consegue urinar

   Se detectar: oriente PRONTO-SOCORRO imediatamente

5. ENCERRAMENTO:
   Só finalize quando tiver TODAS as informações.

RESPOND ONLY WITH RAW JSON. DO NOT USE MARKDOWN FORMATTING.
DO NOT INCLUDE ANY TEXT BEFORE OR AFTER THE JSON.

EXAMPLES OF PARSING (MUITO IMPORTANTE - SIGA ESTES EXEMPLOS):

FEBRE:
- "Não tive febre" → "fever": false
- "Sem febre" → "fever": false
- "Tive um pouco de febre, 37.5" → "fever": true, "feverTemperature": 37.5

MEDICAÇÃO EXTRA (OBRIGATÓRIO PERGUNTAR):
- "Não tomei nada além do que foi prescrito" → "usedExtraMedication": false
- "Só as medicações do médico" → "usedExtraMedication": false
- "Tomei um Tramadol de manhã" → "usedExtraMedication": true, "extraMedicationDetails": "Tramadol de manhã"
- "Precisei tomar Tylex às 3h da madrugada" → "usedExtraMedication": true, "extraMedicationDetails": "Tylex às 3h"
- "Tomei um laxante ontem à noite" → "usedExtraMedication": true, "extraMedicationDetails": "Laxante à noite"

DOR - INTERPRETAÇÃO INTELIGENTE:

⚠️ ATENÇÃO: EXISTEM DOIS TIPOS DE DOR - USE O CAMPO CORRETO:
1. "pain" = DOR EM REPOUSO (quando paciente está parado, sem fazer nada)
2. "painDuringBowelMovement" = DOR DURANTE EVACUAÇÃO (quando vai ao banheiro)

PARA DOR EM REPOUSO (use "pain"):
- "Não estou com dor" → "pain": 0
- "Sem dor em repouso" → "pain": 0
- "Minha dor agora é 2" → "pain": 2

PARA DOR DURANTE EVACUAÇÃO (use "painDuringBowelMovement"):
- "Dor ao evacuar foi 2" → "painDuringBowelMovement": 2
- "Quando fui ao banheiro doeu 5" → "painDuringBowelMovement": 5
- "Não senti dor ao evacuar" → "painDuringBowelMovement": 0

REGRAS GERAIS:
- "Dor leve" → NÃO registre ainda, pergunte: "Dor leve seria algo como 2 ou 3? Qual número?"
- "Dor média" → NÃO registre ainda, pergunte: "Dor média seria entre 4 e 6. Qual número você diria?"
- "Dor forte" ou "muita dor" → NÃO registre ainda, pergunte: "Dor forte seria 6, 7 ou 8? Qual número?"
- "uns 6 ou 7" → pergunte qual dos dois para confirmar

⚠️ REGRA DE OURO PARA DOR:
- Se paciente der NÚMERO → registre imediatamente NO CAMPO CORRETO
- Se paciente der DESCRIÇÃO → interprete, sugira faixa de números, peça confirmação
- NUNCA confunda dor em repouso com dor durante evacuação!
- NUNCA diga "não entendi" ou "erro técnico" para descrições de dor!

JSON STRUCTURE:
{
  "response": "sua resposta natural para o paciente",
  "extractedInfo": {
    "pain": 2,  // DOR EM REPOUSO - número de 0 a 10 (pergunta: "como está sua dor agora, em repouso?")
    "painDuringBowelMovement": 5,  // DOR DURANTE EVACUAÇÃO - número de 0 a 10 (pergunta: "qual foi a dor ao evacuar?")
    "stoolConsistency": 4,  // Bristol Scale 1-7, se evacuou
    "bowelMovementSinceLastContact": true,  // true/false
    "painComparison": "worse",  // "better"|"same"|"worse" (D+2+)
    "medications": true,
    "painControlledWithMeds": false,
    "usedExtraMedication": false,  // OBRIGATÓRIO - usou medicação além das prescritas?
    "extraMedicationDetails": "Tramadol 50mg às 14h",  // Se usou: qual, dose, horário
    "fever": false,
    // Campos de satisfação (APENAS D+14):
    "satisfactionRating": 9,  // 0-10, nota de satisfação com acompanhamento
    "wouldRecommend": true,  // true/false, recomendaria para outros
    "positiveFeedback": "Gostei muito da atenção diária",  // elogios e pontos positivos (opcional)
    "improvementSuggestions": "Poderia ter lembretes de medicação"  // críticas e sugestões de melhoria (opcional)
    // ... outros campos conforme coletados
  },
  "sendImages": {
    "painScale": false,  // true se precisa enviar escala de dor
    "bristolScale": false  // true se precisa enviar escala de Bristol
  },
  "isComplete": false,
  "urgency": "low|medium|high|critical",
  "needsDoctorAlert": false
}

PESQUISA DE SATISFAÇÃO (APENAS D+14):
- Coletar após todas as perguntas clínicas
- "satisfactionRating": nota de 0 a 10 (NPS)
- "wouldRecommend": sim/não (true/false)
- "positiveFeedback": elogios e pontos positivos (perguntar: "O que você mais gostou no acompanhamento?")
- "improvementSuggestions": críticas e sugestões de melhoria (perguntar: "Tem alguma sugestão de como podemos melhorar?")
- Ao finalizar D+14: agradecer pelo feedback (positivo e construtivo), desejar boa recuperação

⚠️ IMPORTANTE:
- Só incluir em extractedInfo os dados que o paciente EFETIVAMENTE forneceu nesta mensagem.
- Não invente ou assuma valores. Se paciente não respondeu algo, não incluir no JSON.
- Use sendImages.painScale: true ANTES de perguntar sobre dor (em repouso ou durante evacuação)
- Use sendImages.bristolScale: true ANTES de perguntar sobre consistência das fezes`;

  try {
    console.log('🧠 conductConversation - Starting...');
    console.log('🧠 User message:', userMessage);
    console.log('🧠 Patient:', patient.name);
    console.log('🧠 Surgery:', surgery.type);
    console.log('🧠 Days post-op:', daysPostOp);
    console.log('🧠 Conversation history length:', conversationHistory.length);
    console.log('🧠 Current data:', JSON.stringify(currentData));

    // Construir mensagens para Claude
    const messages: any[] = [];

    // Adicionar histórico
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Adicionar mensagem atual do usuário
    messages.push({
      role: 'user',
      content: userMessage
    });

    console.log('🧠 Messages array length:', messages.length);
    console.log('🧠 Calling Anthropic API...');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      temperature: 0.1, // Reduzido para garantir formato JSON estrito
      system: systemPrompt,
      messages: messages,
    });

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
      console.error('Invalid AI response structure (brackets mismatch):', cleanText);
      throw new Error('No JSON found in Claude response');
    }

    const jsonString = cleanText.substring(startIndex, endIndex + 1);

    let result;
    try {
      result = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Failed JSON String:', jsonString);
      throw new Error('Failed to parse JSON from AI response');
    }

    // Atualizar dados coletados
    const updatedData = {
      ...currentData,
      ...result.extractedInfo
    };

    return {
      aiResponse: result.response,
      updatedData,
      isComplete: result.isComplete || false,
      needsDoctorAlert: result.needsDoctorAlert || false,
      urgencyLevel: result.urgency || 'low',
      sendImages: result.sendImages
    };

  } catch (error: any) {
    console.error('🧠 ERROR in conversational AI:', error);
    console.error('🧠 Error message:', error?.message);
    console.error('🧠 Error stack:', error?.stack);
    console.error('🧠 User message was:', userMessage);

    // Fallback inteligente: tentar entender a mensagem mesmo sem IA
    const userMessageLower = userMessage.toLowerCase().trim();

    // Tentar detectar dor descritiva
    if (userMessageLower.includes('dor') || userMessageLower.includes('doendo') || userMessageLower.includes('doer')) {
      if (userMessageLower.includes('sem') || userMessageLower.includes('nenhuma') || userMessageLower.includes('não') || userMessageLower.includes('zero')) {
        return {
          aiResponse: 'Entendi, você está sem dor! Que ótimo! 😊 Agora me conta: você conseguiu evacuar desde a última vez que conversamos?',
          updatedData: { ...currentData, pain: 0 },
          isComplete: false,
          needsDoctorAlert: false,
          urgencyLevel: 'low'
        };
      }

      if (userMessageLower.includes('leve') || userMessageLower.includes('pouca') || userMessageLower.includes('fraca')) {
        return {
          aiResponse: 'Entendi que a dor está leve, que bom! 😊 Na escala de 0 a 10, uma dor leve seria algo como 2 ou 3. Qual número você diria que representa melhor?',
          updatedData: currentData,
          isComplete: false,
          needsDoctorAlert: false,
          urgencyLevel: 'low'
        };
      }

      if (userMessageLower.includes('média') || userMessageLower.includes('moderada') || userMessageLower.includes('suportável') || userMessageLower.includes('mais ou menos')) {
        return {
          aiResponse: 'Entendi, uma dor média/moderada. Na escala de 0 a 10 (onde 0 é sem dor e 10 é a pior dor da sua vida), uma dor média seria entre 4 e 6. Qual número você acha que representa melhor sua dor agora?',
          updatedData: currentData,
          isComplete: false,
          needsDoctorAlert: false,
          urgencyLevel: 'low'
        };
      }

      if (userMessageLower.includes('forte') || userMessageLower.includes('muita') || userMessageLower.includes('bastante') || userMessageLower.includes('intensa')) {
        return {
          aiResponse: 'Sinto muito que esteja com dor forte. 😔 Para eu registrar direitinho, preciso de um número de 0 a 10. Uma dor forte geralmente fica entre 6 e 8. Qual número você diria?',
          updatedData: currentData,
          isComplete: false,
          needsDoctorAlert: false,
          urgencyLevel: 'medium'
        };
      }
    }

    // Tentar detectar números na mensagem
    const numberMatch = userMessageLower.match(/\b([0-9]|10)\b/);
    if (numberMatch) {
      const painNumber = parseInt(numberMatch[1]);
      const urgency = painNumber >= 8 ? 'high' : painNumber >= 6 ? 'medium' : 'low';
      const needsAlert = painNumber >= 8;

      return {
        aiResponse: `Anotei, dor ${painNumber}/10. ${painNumber >= 7 ? 'Sinto muito que esteja doendo tanto. ' : ''}Agora me conta: você conseguiu evacuar desde a última vez que conversamos?`,
        updatedData: { ...currentData, pain: painNumber },
        isComplete: false,
        needsDoctorAlert: needsAlert,
        urgencyLevel: urgency
      };
    }

    // Fallback final: resposta genérica mais amigável
    return {
      aiResponse: 'Recebi sua mensagem! 😊 Para eu entender melhor, você poderia me dizer: como está sua dor agora? Se 0 é sem dor e 10 é a pior dor da sua vida, qual número você daria?',
      updatedData: currentData,
      isComplete: false,
      needsDoctorAlert: false,
      urgencyLevel: 'low'
    };
  }
}

/**
 * Determina quais informações ainda faltam coletar
 */
function getMissingInformation(data: QuestionnaireData, daysPostOp: number): string[] {
  const missing: string[] = [];

  // 1. DOR (sempre obrigatório)
  if (data.pain === undefined || data.pain === null) {
    missing.push('Nível de dor ATUAL (0-10 na escala visual analógica)');
  }

  // 2. EVACUAÇÃO
  if (data.bowelMovementSinceLastContact === undefined) {
    missing.push('Se evacuou desde o último contato');
  } else if (data.bowelMovementSinceLastContact === false) {
    // Se não evacuou, perguntar quando foi a última vez
    if (!data.lastBowelMovement) {
      missing.push('Quando foi a última evacuação');
    }
  } else if (data.bowelMovementSinceLastContact === true) {
    // Se evacuou, perguntar a dor durante a evacuação
    if (data.painDuringBowelMovement === undefined || data.painDuringBowelMovement === null) {
      missing.push('Dor durante a evacuação (0-10 na escala visual analógica)');
    }
    // E a consistência das fezes (Bristol Scale)
    if (data.stoolConsistency === undefined || data.stoolConsistency === null) {
      missing.push('Consistência das fezes (Escala de Bristol 1-7)');
    }
  }

  // 3. SANGRAMENTO
  if (!data.bleeding) {
    missing.push('Informações sobre sangramento (nenhum, leve, moderado, intenso)');
  }

  // 4. URINA
  if (data.urination === undefined) {
    missing.push('Se está conseguindo urinar normalmente');
  }

  // 5. FEBRE
  if (data.fever === undefined) {
    missing.push('Se teve febre');
  } else if (data.fever === true && !data.feverTemperature) {
    missing.push('Qual foi a temperatura da febre (em °C)');
  }

  // 6. SECREÇÃO PURULENTA (apenas D+3 ou superior)
  if (daysPostOp >= 3) {
    if (data.discharge === undefined) {
      missing.push('Se tem saída de secreção pela ferida');
    } else if (data.discharge === true) {
      if (!data.dischargeType) {
        missing.push('Aspecto/cor da secreção (clara, amarelada, purulenta, sanguinolenta)');
      }
      if (!data.dischargeAmount) {
        missing.push('Quantidade de secreção (pouca, moderada, muita)');
      }
    }
  }

  // 7. MEDICAÇÕES PRESCRITAS
  if (data.medications === undefined) {
    missing.push('Se está tomando as medicações conforme prescrito');
  }

  // 8. MEDICAÇÃO EXTRA (OBRIGATÓRIO TODOS OS DIAS)
  if (data.usedExtraMedication === undefined) {
    missing.push('Se usou alguma medicação EXTRA além das prescritas (Tramadol, Codeína, laxativo, etc)');
  } else if (data.usedExtraMedication === true && !data.extraMedicationDetails) {
    missing.push('Qual medicação extra usou, dose e horário');
  }

  // 9. PESQUISA DE SATISFAÇÃO (apenas D+14)
  if (daysPostOp >= 14) {
    if (data.satisfactionRating === undefined || data.satisfactionRating === null) {
      missing.push('Nota de satisfação com o acompanhamento (0-10)');
    }
    if (data.wouldRecommend === undefined) {
      missing.push('Se recomendaria o acompanhamento para outros pacientes');
    }
    // satisfactionComments é opcional
  }

  // Concerns é sempre opcional

  return missing;
}

/**
 * Inicia conversa com saudação personalizada
 */
export async function getInitialGreeting(
  patient: Patient,
  surgery: Surgery,
  dayNumber: number,
  phoneNumber: string
): Promise<string> {
  const greeting = getGreeting();
  const firstName = patient.name.split(' ')[0];

  // Obter mensagem de introdução do dia
  const { getIntroductionMessage } = await import('./daily-questionnaire-flow');
  const introMessage = getIntroductionMessage(dayNumber);

  // Enviar imagem da escala de dor ANTES da saudação
  const { sendImage } = await import('./whatsapp');
  try {
    // URL pública da imagem da escala de dor
    // Nota: O arquivo escala-dor.png deve estar em public/
    const imageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://proactive-rejoicing-production.up.railway.app'}/escala-dor.png`;

    await sendImage(
      phoneNumber,
      imageUrl,
      'Escala Visual Analógica de Dor (0-10)'
    );

    console.log('✅ Pain scale image sent before initial greeting');
  } catch (error) {
    console.error('❌ Error sending pain scale image:', error);
    // Continuar mesmo se falhar o envio da imagem
  }

  return `${greeting}, ${firstName}! 👋

Aqui é a assistente de acompanhamento pós-operatório do Dr. João Vitor.

${introMessage}

Vou te fazer algumas perguntas sobre como você está. Pode responder livremente que eu vou anotando tudo certinho. 😊`;
}

/**
 * Retorna saudação apropriada baseada no horário de Brasília
 */
function getGreeting(): string {
  const nowBrasilia = toBrasiliaTime(new Date());
  const hour = nowBrasilia.getHours();

  if (hour >= 5 && hour < 12) {
    return 'Bom dia';
  } else if (hour >= 12 && hour < 18) {
    return 'Boa tarde';
  } else {
    return 'Boa noite';
  }
}
