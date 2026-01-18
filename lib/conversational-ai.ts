/**
 * IA Conversacional para Questionários Pós-Operatórios
 * Usa Claude para conversar naturalmente com pacientes
 * Integrado com protocolo médico oficial
 */

import Anthropic from '@anthropic-ai/sdk';
import { Patient, Surgery } from '@prisma/client';
import { prisma } from './prisma';
import { getProtocolForSurgery } from './protocols/hemorroidectomia-protocol';

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

  // Atividade (D7+)
  activityLevel?: string;

  // Preocupações gerais
  concerns?: string;

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

   c) ESCALA DE DOR (MUITO IMPORTANTE):
      - SEMPRE pergunte a dor usando escala 0-10
      - Se paciente responder vago ("muita dor", "doendo bastante"):
        * NÃO aceite como resposta final
        * EXPLIQUE a escala novamente
        * INSISTA gentilmente: "Preciso que você me diga um número de 0 a 10 para eu registrar certinho"

      ✅ Exemplo correto:
      Paciente: "Estou com muita dor"
      Você: "Entendo que está com bastante dor. Para eu poder registrar direitinho, preciso que você me diga um número. Se 0 é sem dor nenhuma e 10 é a pior dor que você já sentiu na vida, qual número você diria que está agora?"

      Paciente: "Muito forte mesmo"
      Você: "Sim, percebo que está bem forte. Me ajuda com um número de 0 a 10? Isso é importante para o Dr. João acompanhar sua recuperação."

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

EXAMPLES OF PARSING:
- User: "Não tive febre" -> "fever": false
- User: "Sem febre" -> "fever": false
- User: "Tive um pouco de febre, 37.5" -> "fever": true, "feverTemperature": 37.5
- User: "Não estou com dor" -> "pain": 0
- User: "Dor suportável" -> DO NOT GUESS NUMBER, ASK 0-10

JSON STRUCTURE:
{
  "response": "sua resposta natural para o paciente",
  "extractedInfo": {
    "pain": 7,  // APENAS se paciente deu número específico
    "painDuringBowelMovement": 5,  // Se evacuou e respondeu
    "stoolConsistency": 4,  // Bristol Scale 1-7, se evacuou
    "bowelMovementSinceLastContact": true,  // true/false
    "painComparison": "worse",  // "better"|"same"|"worse" (D+2+)
    "medications": true,
    "painControlledWithMeds": false,
    "fever": false,
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

⚠️ IMPORTANTE:
- Só incluir em extractedInfo os dados que o paciente EFETIVAMENTE forneceu nesta mensagem.
- Não invente ou assuma valores. Se paciente não respondeu algo, não incluir no JSON.
- Use sendImages.painScale: true ANTES de perguntar sobre dor (em repouso ou durante evacuação)
- Use sendImages.bristolScale: true ANTES de perguntar sobre consistência das fezes`;

  try {
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

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      temperature: 0.1, // Reduzido para garantir formato JSON estrito
      system: systemPrompt,
      messages: messages,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

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

  } catch (error) {
    console.error('Error in conversational AI:', error);

    // Fallback: resposta genérica
    return {
      aiResponse: 'Desculpe, tive uma pequena falha de conexão. Poderia repetir sua última resposta, por favor?',
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

  // 7. MEDICAÇÕES
  if (data.medications === undefined) {
    missing.push('Se está tomando as medicações conforme prescrito');
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
