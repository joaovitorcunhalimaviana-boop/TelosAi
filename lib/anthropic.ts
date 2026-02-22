import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Cliente Gemini configurado
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export interface PatientData {
  name: string;
  age?: number;
  sex?: string;
  comorbidities?: string[];
  medications?: string[];
}

export interface QuestionnaireData {
  painLevel?: number | null;
  painAtRest?: number | null;
  painDuringBowelMovement?: number | null;
  urinaryRetention?: boolean | null;
  urinaryRetentionHours?: number | null;
  bowelMovement?: boolean | null;
  bowelMovementTime?: string | null;
  bleeding?: string | null; // none, light, moderate, severe
  fever?: boolean | null;
  temperature?: number | null;
  discharge?: boolean | string | null; // boolean (new) or string (legacy: none, serous, purulent, abundant)
  dischargeType?: string | null; // clear, yellowish, purulent, bloody
  additionalSymptoms?: string[] | null;
  concerns?: string | null;
  usedExtraMedication?: boolean | null;
  extraMedicationDetails?: string | null;
  localCareAdherence?: boolean | null;
}

export interface AnalysisInput {
  surgeryType: string;
  dayNumber: number;
  patientData: PatientData;
  questionnaireData: QuestionnaireData;
  detectedRedFlags: string[];
}

export interface AnalysisOutput {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  additionalRedFlags: string[];
  empatheticResponse: string;
  seekCareAdvice: string | null;
  reasoning?: string;
}

/**
 * Analisa a resposta do paciente ao questionário de follow-up usando Claude AI
 */
export async function analyzeFollowUpResponse(
  input: AnalysisInput
): Promise<AnalysisOutput> {
  const { surgeryType, dayNumber, patientData, questionnaireData, detectedRedFlags } = input;

  // Tradução de tipos de cirurgia para português
  const surgeryTypeTranslation: Record<string, string> = {
    hemorroidectomia: 'Hemorroidectomia',
    fistula: 'Fístula Anal',
    fissura: 'Fissura Anal',
    pilonidal: 'Cisto Pilonidal',
  };

  const surgeryTypeName = surgeryTypeTranslation[surgeryType] || surgeryType;

  // Construir descrição das comorbidades
  const comorbiditiesText = patientData.comorbidities?.length
    ? `Comorbidades: ${patientData.comorbidities.join(', ')}`
    : 'Sem comorbidades registradas';

  const medicationsText = patientData.medications?.length
    ? `Medicações em uso: ${patientData.medications.join(', ')}`
    : 'Sem medicações registradas';

  // Construir descrição dos dados do questionário
  const questionnaireDescription = buildQuestionnaireDescription(questionnaireData);

  // Construir prompt para Claude
  const prompt = `Você é um assistente médico especializado em pós-operatório de cirurgia colorretal.

Analise a resposta do paciente ao questionário de acompanhamento D+${dayNumber}.

**Tipo de cirurgia:** ${surgeryTypeName}

**Dados do paciente:**
- Nome: ${patientData.name}
${patientData.age ? `- Idade: ${patientData.age} anos` : ''}
${patientData.sex ? `- Sexo: ${patientData.sex}` : ''}
- ${comorbiditiesText}
- ${medicationsText}

**Resposta ao questionário:**
${questionnaireDescription}

**Red flags já detectados pelo sistema determinístico:**
${detectedRedFlags.length > 0 ? detectedRedFlags.map(rf => `- ${rf}`).join('\n') : 'Nenhum red flag detectado'}

**Suas tarefas:**
1. Avalie o nível de risco geral (low, medium, high, critical) considerando:
   - O tipo de cirurgia e o dia pós-operatório
   - Os sintomas reportados
   - As comorbidades do paciente
   - Os red flags já detectados

2. Identifique TODOS os sinais de alerta (Red Flags), como:
   - Febre > 37.8°C
   - Dor intensa (> 7) ou crescente
   - Dor alta + uso de medicação extra (especialmente opioides) = sinal mais preocupante
   - Sangramento moderado-intenso
   - Secreção purulenta
   - Retenção urinária
   - Vômitos ou outros sintomas graves
   - Não adesão aos cuidados locais orientados

3. Gere uma resposta empática e acolhedora para o paciente, que:
   - Reconheça seus sintomas
   - Ofereça orientação apropriada
   - Seja clara e tranquilizadora quando possível
   - Use linguagem acessível (não use termos médicos complexos)
   - Seja breve (máximo 3-4 parágrafos)

4. Sugira quando procurar atendimento presencial, se necessário

**IMPORTANTE:**
- Seja conservador na avaliação de risco (prefira superestimar a subestimar)
- Para sintomas graves (febre alta, dor intensa, sangramento ativo), sempre classifique como high ou critical
- Mantenha tom empático e acolhedor na resposta
- Não minimize sintomas preocupantes

Retorne APENAS um objeto JSON válido no seguinte formato (sem markdown, sem explicações adicionais):
{
  "riskLevel": "low|medium|high|critical",
  "additionalRedFlags": ["red flag 1", "red flag 2"],
  "empatheticResponse": "texto da resposta empática",
  "seekCareAdvice": "texto sobre quando buscar atendimento ou null",
  "reasoning": "breve explicação do raciocínio (opcional)"
}`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    // Extrair resposta
    const responseText = result.response.text();

    // Parse JSON
    const analysis: AnalysisOutput = JSON.parse(responseText);

    // Validar campos obrigatórios
    if (!analysis.riskLevel || !analysis.empatheticResponse) {
      throw new Error('Resposta da IA incompleta');
    }

    // Validar riskLevel
    const validRiskLevels = ['low', 'medium', 'high', 'critical'];
    if (!validRiskLevels.includes(analysis.riskLevel)) {
      throw new Error(`Nível de risco inválido: ${analysis.riskLevel}`);
    }

    return analysis;
  } catch (error) {
    console.error('Erro ao analisar resposta com Claude AI:', error);

    // Fallback: retornar análise conservadora
    return {
      riskLevel: detectedRedFlags.length > 0 ? 'high' : 'medium',
      additionalRedFlags: [],
      empatheticResponse:
        'Obrigado por responder ao questionário. Recebi suas informações e vou analisá-las com cuidado. ' +
        'Em caso de qualquer sintoma que te preocupe, não hesite em entrar em contato.',
      seekCareAdvice: detectedRedFlags.length > 0
        ? 'Devido aos sintomas reportados, recomendo que você entre em contato com o consultório para avaliação.'
        : null,
    };
  }
}

/**
 * Constrói descrição legível dos dados do questionário
 */
function buildQuestionnaireDescription(data: QuestionnaireData): string {
  const parts: string[] = [];

  // Dor (Lógica combinada)
  if (data.painAtRest != null || data.painDuringBowelMovement != null) {
    if (data.painAtRest != null) parts.push(`- Dor em repouso: ${data.painAtRest}/10`);
    if (data.painDuringBowelMovement != null) parts.push(`- Dor ao evacuar: ${data.painDuringBowelMovement}/10`);
  } else if (data.painLevel != null) {
    const painIntensity =
      data.painLevel >= 8 ? 'muito intensa' :
        data.painLevel >= 6 ? 'intensa' :
          data.painLevel >= 4 ? 'moderada' :
            data.painLevel >= 2 ? 'leve' : 'mínima';
    parts.push(`- Dor (geral): ${data.painLevel}/10 (${painIntensity})`);
  }

  // Retenção urinária
  if (data.urinaryRetention != null) {
    if (data.urinaryRetention) {
      const hours = data.urinaryRetentionHours || 'não especificado';
      parts.push(`- Retenção urinária: SIM (${hours}h)`);
    } else {
      parts.push('- Retenção urinária: NÃO');
    }
  }

  // Evacuação
  if (data.bowelMovement != null) {
    const timeInfo = data.bowelMovementTime ? ` (Horário: ${data.bowelMovementTime})` : '';
    parts.push(`- Evacuação: ${data.bowelMovement ? 'SIM' : 'NÃO'}${timeInfo}`);
  }

  // Sangramento
  if (data.bleeding) {
    const bleedingTranslation: Record<string, string> = {
      none: 'nenhum',
      light: 'leve',
      moderate: 'moderado',
      severe: 'intenso/ativo',
    };
    parts.push(`- Sangramento: ${bleedingTranslation[data.bleeding] || data.bleeding}`);
  }

  // Febre
  if (data.fever != null) {
    if (data.fever && data.temperature) {
      parts.push(`- Febre: SIM (${data.temperature}°C)`);
    } else if (data.fever) {
      parts.push('- Febre: SIM');
    } else {
      parts.push('- Febre: NÃO');
    }
  }

  // Secreção
  if (data.discharge != null) {
    if (typeof data.discharge === 'boolean') {
      // Novo formato: discharge (boolean) + dischargeType (string)
      if (data.discharge) {
        const dischargeTypeTranslation: Record<string, string> = {
          clear: 'clara',
          yellowish: 'amarelada',
          purulent: 'purulenta',
          bloody: 'sanguinolenta',
        };
        const typeLabel = data.dischargeType
          ? (dischargeTypeTranslation[data.dischargeType] || data.dischargeType)
          : 'tipo não especificado';
        parts.push(`- Secreção: SIM (${typeLabel})`);
      } else {
        parts.push('- Secreção: NÃO');
      }
    } else if (typeof data.discharge === 'string' && data.discharge !== 'none') {
      // Formato legado: discharge como string enum
      const dischargeTranslation: Record<string, string> = {
        none: 'nenhuma',
        serous: 'serosa (clara)',
        purulent: 'purulenta',
        abundant: 'abundante',
      };
      parts.push(`- Secreção: ${dischargeTranslation[data.discharge] || data.discharge}`);
    }
  }

  // Medicação extra
  if (data.usedExtraMedication != null) {
    if (data.usedExtraMedication) {
      const details = data.extraMedicationDetails
        ? ` (${data.extraMedicationDetails})`
        : '';
      parts.push(`- Usou medicação extra (além das prescritas): SIM${details}`);
    } else {
      parts.push('- Usou medicação extra: NÃO');
    }
  }

  // Cuidados locais
  if (data.localCareAdherence != null) {
    parts.push(`- Adesão aos cuidados locais: ${data.localCareAdherence ? 'SIM' : 'NÃO'}`);
  }

  // Sintomas adicionais
  if (data.additionalSymptoms?.length) {
    parts.push(`- Sintomas adicionais: ${data.additionalSymptoms.join(', ')}`);
  }

  // Preocupações
  if (data.concerns) {
    parts.push(`- Preocupações do paciente: "${data.concerns}"`);
  }

  return parts.length > 0 ? parts.join('\n') : 'Nenhum dado fornecido';
}

export { genAI };
