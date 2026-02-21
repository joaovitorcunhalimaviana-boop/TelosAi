/**
 * IA Conversacional para Questionários Pós-Operatórios
 * Usa Claude para conversar naturalmente com pacientes
 * Integrado com protocolo médico oficial
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Patient, Surgery } from '@prisma/client';
import { prisma } from './prisma';
import { getProtocolsForAI } from './protocols';
import { toBrasiliaTime, getBrasiliaHour } from './date-utils';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface QuestionnaireData {
  // Dor
  pain?: number; // 0-10 na escala visual analógica

  // Evacuação
  bowelMovementSinceLastContact?: boolean; // Evacuou desde último contato?
  lastBowelMovement?: string; // Quando foi a última evacuação
  painDuringBowelMovement?: number; // Dor durante evacuação (0-10)

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
      orderBy: { dayNumber: 'asc' },
    });

    if (previousFollowUps.length === 0) return '';

    let summary = `
═══════════════════════════════════════════════════════════════
MEMÓRIA: RESUMO DOS DIAS ANTERIORES
═══════════════════════════════════════════════════════════════
⚠️ IMPORTANTE: Use estas informações para NÃO repetir orientações que o paciente já
contestou ou que o médico já modificou. Se o paciente disse que o médico deu uma
orientação diferente do protocolo, RESPEITE a orientação do médico.

`;

    for (const followUp of previousFollowUps) {
      if (!followUp.responses || followUp.responses.length === 0) continue;

      const resp = followUp.responses[0];
      let data: any = {};
      try {
        const parsed = typeof resp.questionnaireData === 'string'
          ? JSON.parse(resp.questionnaireData)
          : resp.questionnaireData;
        data = parsed.extractedData || parsed;
      } catch { continue; }

      summary += `📅 D+${followUp.dayNumber}:\n`;

      // Dados objetivos
      if (data.pain !== undefined) summary += `  - Dor em repouso: ${data.pain}/10\n`;
      if (data.painDuringBowelMovement !== undefined) summary += `  - Dor durante evacuação: ${data.painDuringBowelMovement}/10\n`;
      if (data.bowelMovementSinceLastContact !== undefined) summary += `  - Evacuou: ${data.bowelMovementSinceLastContact ? 'Sim' : 'Não'}\n`;
      if (data.bleeding) summary += `  - Sangramento: ${data.bleeding}\n`;
      if (data.fever === true) summary += `  - Febre: Sim${data.feverTemperature ? ` (${data.feverTemperature}°C)` : ''}\n`;
      if (data.usedExtraMedication === true) summary += `  - Medicação extra: ${data.extraMedicationDetails || 'Sim'}\n`;

      // Preocupações e menções importantes do paciente
      if (data.concerns) summary += `  - ⚠️ Preocupação do paciente: "${data.concerns}"\n`;

      // Buscar na conversa menções a orientações do médico ou informações importantes
      try {
        const parsed = typeof resp.questionnaireData === 'string'
          ? JSON.parse(resp.questionnaireData)
          : resp.questionnaireData;
        const conversation = parsed.conversation || [];
        for (const msg of conversation) {
          if (msg.role === 'user' && typeof msg.content === 'string') {
            const content = msg.content.toLowerCase();
            // Detectar menções a orientações médicas diferentes do protocolo
            if (content.includes('doutor orient') || content.includes('médico orient') ||
                content.includes('doutor ped') || content.includes('médico ped') ||
                content.includes('doutor fal') || content.includes('médico fal') ||
                content.includes('dr.') || content.includes('dr ') ||
                content.includes('consultório') || content.includes('consulta') ||
                content.includes('ele mandou') || content.includes('ele pediu')) {
              summary += `  - 🩺 ORIENTAÇÃO MÉDICA MENCIONADA: "${msg.content}"\n`;
            }
          }
        }
      } catch { /* ignore parse errors */ }

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
  currentData: QuestionnaireData
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

  // Calcular dias pós-operatórios usando timezone de Brasília (evita off-by-one)
  const nowBrasilia = toBrasiliaTime(new Date());
  const surgeryBrasilia = toBrasiliaTime(surgery.date);
  const nowDayStart = new Date(nowBrasilia.getFullYear(), nowBrasilia.getMonth(), nowBrasilia.getDate());
  const surgeryDayStart = new Date(surgeryBrasilia.getFullYear(), surgeryBrasilia.getMonth(), surgeryBrasilia.getDate());
  const daysPostOp = Math.round((nowDayStart.getTime() - surgeryDayStart.getTime()) / (1000 * 60 * 60 * 24));

  // Obter contexto do questionário diário
  const { getDailyQuestions } = await import('./daily-questionnaire-flow');
  const dailyQuestions = await getDailyQuestions(surgery.id, daysPostOp + 1);

  // Definir o que ainda precisa ser coletado
  const missingInfo = getMissingInformation(currentData, daysPostOp);

  // Buscar protocolos: primeiro tenta banco de dados, fallback para hardcoded
  const medicalProtocol = await getProtocolsForAI(
    patient.userId,       // ID do médico responsável
    surgery.type,         // Tipo de cirurgia
    daysPostOp,           // Dia pós-operatório
    patient.researchId    // ID da pesquisa (opcional - está no Patient)
  );

  // Buscar resumo dos dias anteriores (memória entre dias)
  const previousDaysSummary = await getPreviousDaysSummary(surgery.id, daysPostOp);

  // Buscar notas do médico (orientações específicas para este paciente)
  const doctorNotes = (surgery as any).doctorNotes || '';

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
${doctorNotes ? `
═══════════════════════════════════════════════════════════════
🩺 NOTAS DO MÉDICO (ORIENTAÇÕES ESPECÍFICAS PARA ESTE PACIENTE)
═══════════════════════════════════════════════════════════════
${doctorNotes}

⚠️ ESTAS ORIENTAÇÕES DO MÉDICO TÊM PRIORIDADE SOBRE O PROTOCOLO PADRÃO.
Se houver conflito entre o protocolo e as notas do médico, SIGA AS NOTAS DO MÉDICO.
O médico avaliou este paciente pessoalmente e sabe o que é melhor para o caso.
═══════════════════════════════════════════════════════════════
` : ''}
${previousDaysSummary}
🚨 REGRA SOBRE ORIENTAÇÕES DO MÉDICO:
Se em dias anteriores o paciente mencionou que o médico deu uma orientação diferente
do protocolo padrão (ex: trocar água morna por água gelada, mudar medicação, etc.),
RESPEITE essa orientação. O médico viu o paciente pessoalmente e pode ter adaptado o
protocolo ao caso específico. NÃO corrija o paciente nem insista no protocolo padrão
se o médico já orientou diferente.

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

   c) ESCALA DE DOR - INTERPRETAÇÃO:
      - Número direto → registrar imediatamente
      - Descrição verbal → sugerir faixa e pedir confirmação:
        sem dor→0-1, leve→1-3, média→4-6, forte→6-8, insuportável→8-10
      - NUNCA diga "não entendi" para descrições de dor
      - Dois tipos: "pain" (repouso) e "painDuringBowelMovement" (evacuação) — coletar AMBOS separadamente

   d) OUTRAS INFORMAÇÕES:

      EVACUAÇÃO:
      - Perguntar: "Evacuou desde a última vez que conversamos?" (NUNCA "evacuou hoje")
      - Se SIM: perguntar dor durante evacuação (0-10). NÃO perguntar Bristol.
      - Se NÃO: perguntar quando foi a última vez

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

      MEDICAÇÃO EXTRA (⚠️ OBRIGATÓRIO - 2ª PERGUNTA, LOGO APÓS DOR):
      Perguntar: "Além das medicações que ${nomeMedico} prescreveu, você tomou alguma outra? (Tramadol, Codeína, Tylex, laxante)"
      - Se SIM: qual, dose e horário
      - Se NÃO: registrar que não usou
      Contexto clínico: Dor 5/10 com opioide ≠ dor 5/10 sem opioide.

      COMPARAÇÃO DE DOR (NÃO PERGUNTAR - CALCULAR AUTOMATICAMENTE):
      ⚠️ NÃO pergunte ao paciente se a dor melhorou/piorou. O sistema calcula isso automaticamente
      comparando a nota de dor de hoje com a de ontem.

      Quando for comentar sobre a evolução da dor, use a LÓGICA CORRETA:
      - Se dor HOJE > dor ONTEM → dor PIOROU (ex: ontem 0, hoje 1 = PIOROU um pouco)
      - Se dor HOJE < dor ONTEM → dor MELHOROU (ex: ontem 5, hoje 3 = MELHOROU)
      - Se dor HOJE = dor ONTEM → dor está IGUAL

      ❌ ERRO GRAVE: Dizer "melhorou" quando a dor AUMENTOU
      ❌ EXEMPLO DE ERRO: "Dor ontem era 0, hoje é 1, que maravilha melhorou!" (ERRADO!)
      ✅ CORRETO: "Dor ontem era 0, hoje é 1 - aumentou um pouquinho, mas ainda está bem baixa"

      ${daysPostOp === 2 ? '⚠️ D+2: Aumento de dor é NORMAL (bloqueio terminando). Tranquilizar.' : daysPostOp >= 3 ? '⚠️ D+3+: Espera-se melhora progressiva.' : ''}

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

   g) CUIDADOS LOCAIS (ORIENTAÇÕES DO PROTOCOLO):
      - Consulte o PROTOCOLO MÉDICO OFICIAL acima para orientar sobre cuidados locais
      - Se o protocolo menciona compressas, banhos de assento, pomadas, etc., pergunte ao paciente se está seguindo
      - NÃO invente orientações de cuidados locais — use APENAS o que está no protocolo do médico
      - Se não há protocolo registrado (modo coleta), NÃO oriente sobre cuidados locais

4. SINAIS DE ALERTA (RED FLAGS):
   - Dor ≥ 8/10
   - Sangramento volumoso
   - Febre ≥ 38°C
   - Não consegue urinar

   Se detectar: oriente PRONTO-SOCORRO imediatamente

5. ENCERRAMENTO:
   ⚠️ NÃO finalize (isComplete: true) até coletar TODAS as informações listadas em "INFORMAÇÕES OBRIGATÓRIAS" acima.
   Ordem: 1)Dor → 2)Medicação extra → 3)Evacuação → 4)Sangramento → 5)Urina(D+1) → 6)Febre → 7)Medicações → 8)Cuidados locais → 9)Secreção(D+3+) → 10)Satisfação(D+14) → 11)Sintomas adicionais(ÚLTIMO)

6. SECREÇÃO DE FERIDA (A PARTIR DE D+3):
   ⚠️ IMPORTANTE: Secreção é COMUM no pós-operatório de feridas!

   SECREÇÃO NORMAL (não preocupa):
   - Clara, serosa (tipo água)
   - Serossanguinolenta (rosada, com um pouco de sangue)
   - Amarelada clara
   → Orientar: "Isso é normal no processo de cicatrização. Mantenha a higiene local."

   SECREÇÃO ANORMAL (preocupa - alertar médico):
   - Purulenta (pus: amarelo-esverdeado, espesso, com cheiro forte)
   - Com odor fétido
   - Acompanhada de febre ou vermelhidão intensa
   → Marcar urgency: "high", needsDoctorAlert: true

RESPOND ONLY WITH RAW JSON. DO NOT USE MARKDOWN FORMATTING.
DO NOT INCLUDE ANY TEXT BEFORE OR AFTER THE JSON.

EXAMPLES OF PARSING (MUITO IMPORTANTE - SIGA ESTES EXEMPLOS):

FEBRE:
- "Tive febre, 37.5" → "fever": true, "feverTemperature": 37.5
- "Sem febre" → "fever": false

MEDICAÇÃO EXTRA:
- "Não tomei nada além do prescrito" → "usedExtraMedication": false
- "Tomei um Tramadol de manhã" → "usedExtraMedication": true, "extraMedicationDetails": "Tramadol de manhã"
- "Tomei um laxante ontem à noite" → "usedExtraMedication": true, "extraMedicationDetails": "Laxante à noite"

CUIDADOS LOCAIS:
- "Estou fazendo tudo" / "sim" → "localCareAdherence": true
- "Não estou fazendo" → "localCareAdherence": false

SATISFAÇÃO (D+14 APENAS):
- "Dou nota 9" → "satisfactionRating": 9
- "Nota 8, muito bom" → "satisfactionRating": 8
- "Recomendo sim" → "wouldRecommend": true
- "Com certeza indicaria" → "wouldRecommend": true
- "Não indicaria não" → "wouldRecommend": false
- "Acho que não recomendaria" → "wouldRecommend": false
- "Poderia ter mais horários" → "improvementSuggestions": "Poderia ter mais horários"
- "Nenhuma sugestão, foi ótimo" → "improvementSuggestions": "Nenhuma sugestão"
- "Gostei muito do atendimento" → "positiveFeedback": "Gostei muito do atendimento"

SINTOMAS ADICIONAIS (TODOS OS DIAS - PERGUNTA FINAL):
- "Não, só isso" → "additionalSymptoms": null
- "Nada mais" → "additionalSymptoms": null
- "Era só isso mesmo" → "additionalSymptoms": null
- "Tive uma coceira" → "additionalSymptoms": "Coceira"
- "Senti uma fisgada" → "additionalSymptoms": "Fisgada"
- "Tive dor de cabeça" → "additionalSymptoms": "Dor de cabeça"

DOR - CAMPOS E DESAMBIGUAÇÃO:
⚠️ Dois campos DISTINTOS — coletar AMBOS separadamente:
- "pain" = DOR EM REPOUSO → "Minha dor agora é 2" → "pain": 2
- "painDuringBowelMovement" = DOR DURANTE EVACUAÇÃO → "Doeu 5 ao evacuar" → "painDuringBowelMovement": 5
- Descrição verbal → sugerir faixa numérica e pedir confirmação (NÃO registrar sem número)
- Se mencionou dor + evacuação juntos → é dor de evacuação. PERGUNTE a dor em repouso separadamente.
- Na dúvida: "Essa dor é em repouso ou durante a evacuação?"

JSON STRUCTURE:
{
  "response": "sua resposta natural para o paciente",
  "extractedInfo": {
    "pain": 2,  // DOR EM REPOUSO - número de 0 a 10 (pergunta: "como está sua dor agora, em repouso?")
    "painDuringBowelMovement": 5,  // DOR DURANTE EVACUAÇÃO - número de 0 a 10 (pergunta: "qual foi a dor ao evacuar?")
    "bowelMovementSinceLastContact": true,  // true/false
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
    "painScale": false  // true se precisa enviar escala de dor
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
- Use sendImages.painScale: true ANTES de perguntar sobre dor (em repouso ou durante evacuação)`;

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
    console.log('🧠 Calling Gemini API...');

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-05-20',
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
      systemInstruction: systemPrompt,
    });

    // Converter histórico para formato Gemini (role 'assistant' → 'model', content → parts)
    const geminiHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: geminiHistory,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    // Enviar a última mensagem do usuário
    const geminiResponse = await chat.sendMessage(userMessage);
    const responseText = geminiResponse.response.text();

    console.log('🧠 Gemini API response received!');
    console.log('🧠 Raw response text (first 500 chars):', responseText.substring(0, 500));

    // Limpar markdown formatting se presente
    let cleanText = responseText.trim();

    // Remove markdown code blocks if explicitly wrapped
    if (cleanText.includes('```')) {
      cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '');
    }

    // Encontrar o primeiro '{' e o último '}' para isolar o objeto JSON
    const startIndex = cleanText.indexOf('{');
    const endIndex = cleanText.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      console.error('Invalid AI response structure (brackets mismatch):', cleanText);
      throw new Error('No JSON found in Gemini response');
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

      // Se dor em repouso ainda não foi coletada, assumir que é dor em repouso (primeira pergunta)
      if (currentData.pain === undefined || currentData.pain === null) {
        return {
          aiResponse: `Anotei, dor ${painNumber}/10. ${painNumber >= 7 ? 'Sinto muito que esteja doendo tanto. ' : ''}Agora me conta: você precisou tomar alguma medicação além das que o médico receitou?`,
          updatedData: { ...currentData, pain: painNumber },
          isComplete: false,
          needsDoctorAlert: needsAlert,
          urgencyLevel: urgency
        };
      }
      // Se dor em repouso já coletada e paciente evacuou mas falta dor de evacuação
      else if (currentData.bowelMovementSinceLastContact === true &&
               (currentData.painDuringBowelMovement === undefined || currentData.painDuringBowelMovement === null)) {
        return {
          aiResponse: `Anotei, dor durante a evacuação ${painNumber}/10. ${painNumber >= 7 ? 'Sinto muito que esteja doendo tanto. ' : ''}Agora me conta sobre o sangramento: como está?`,
          updatedData: { ...currentData, painDuringBowelMovement: painNumber },
          isComplete: false,
          needsDoctorAlert: needsAlert,
          urgencyLevel: urgency
        };
      }
      // Fallback genérico
      else {
        return {
          aiResponse: `Anotei o número ${painNumber}. Agora me conta: como estão os outros sintomas?`,
          updatedData: currentData,
          isComplete: false,
          needsDoctorAlert: needsAlert,
          urgencyLevel: urgency
        };
      }
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
    missing.push('🚨 Nível de dor ATUAL (0-10 na escala visual analógica)');
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
    // Se não evacuou, perguntar quando foi a última vez
    if (!data.lastBowelMovement) {
      missing.push('Quando foi a última evacuação');
    }
  } else if (data.bowelMovementSinceLastContact === true) {
    // Se evacuou, perguntar a dor durante a evacuação
    if (data.painDuringBowelMovement === undefined || data.painDuringBowelMovement === null) {
      missing.push('Dor durante a evacuação (0-10 na escala visual analógica)');
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

  // 7. SECREÇÃO PURULENTA (apenas D+3 ou superior)
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

  // 8. MEDICAÇÕES PRESCRITAS
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

Aqui é a assistente de inteligência artificial de acompanhamento pós-operatório do(a) ${nomeMedico}.

⚠️ *Importante:* Sou uma IA — não sou médica e não prescrevo medicamentos. Meu papel é coletar informações sobre como você está e repassar tudo certinho para o(a) ${nomeMedico}. 😊

${introMessage}

Vou te fazer algumas perguntas. Pode responder livremente!`;
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
