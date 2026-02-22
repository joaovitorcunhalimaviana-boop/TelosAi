/**
 * Follow-up Analyzer - Sistema de Análise com Claude AI
 * Analisa respostas de follow-up e gera insights clínicos
 *
 * Funcionalidades:
 * - Análise de respostas via Claude AI
 * - Detecção automática de red flags
 * - Geração de respostas empáticas
 * - Alertas ao médico quando necessário
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { getAnalysisPrompt, type AnalysisPromptParams } from './ai-prompts';
import { SurgeryType, detectRedFlags } from './surgery-templates';

// ============================================
// TYPES
// ============================================

export interface AnalysisResult {
  status: 'NORMAL' | 'ATENÇÃO' | 'URGENTE' | 'EMERGÊNCIA';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  redFlags: string[];
  analise: string;
  raciocinioClinico?: string;
  recomendacoes: string[];
  respostaEmpática: string;
  alertarMedico: boolean;
  urgencia: 'baixa' | 'média' | 'alta' | 'crítica';
}

export interface FollowUpAnalysisParams {
  surgeryType: SurgeryType;
  dayNumber: number;
  answers: Record<string, any>;
  patientName: string;
  patientAge?: number;
  hasComorbidities?: boolean;
  useCache?: boolean;
}

// ============================================
// CONFIGURAÇÃO GEMINI
// ============================================

const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

/**
 * Verifica se a API está configurada
 */
export function isAIConfigured(): boolean {
  return !!GEMINI_API_KEY;
}

// ============================================
// ANÁLISE PRINCIPAL
// ============================================

/**
 * Analisa respostas de follow-up usando Claude AI
 */
export async function analyzeFollowUpResponse(
  params: FollowUpAnalysisParams
): Promise<AnalysisResult> {
  try {
    const { surgeryType, dayNumber, answers, patientName, patientAge, hasComorbidities, useCache = true } = params;

    // Verificar configuração
    if (!isAIConfigured()) {
      console.warn('AI não configurada, usando análise simplificada');
      return getSimplifiedAnalysis(params);
    }

    // Detectar red flags localmente primeiro
    const localRedFlags = detectRedFlags(surgeryType, dayNumber, answers);

    // Gerar prompt
    const prompt = getAnalysisPrompt({
      surgeryType,
      dayNumber,
      answers,
      patientName,
      patientAge,
      hasComorbidities,
    });

    // Chamar Gemini AI
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
        maxOutputTokens: 2048,
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    // Extrair resposta
    const responseText = result.response.text();

    // Parse JSON da resposta
    let analysis: AnalysisResult;
    try {
      // Remover markdown se presente
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      analysis = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta AI:', parseError);
      console.error('Resposta recebida:', responseText);

      // Fallback para análise simplificada
      return getSimplifiedAnalysis(params);
    }

    // Validar e enriquecer resultado
    analysis = validateAndEnrichAnalysis(analysis, localRedFlags);

    // Log para auditoria
    console.log('Análise AI completada:', {
      surgeryType,
      day: dayNumber,
      status: analysis.status,
      riskLevel: analysis.riskLevel,
      redFlagsCount: analysis.redFlags.length,
    });

    return analysis;

  } catch (error) {
    console.error('Erro na análise de follow-up:', error);

    // Fallback para análise simplificada em caso de erro
    return getSimplifiedAnalysis(params);
  }
}

/**
 * Análise simplificada sem IA (fallback)
 */
function getSimplifiedAnalysis(params: FollowUpAnalysisParams): AnalysisResult {
  const { surgeryType, dayNumber, answers, patientName } = params;

  // Detectar red flags localmente
  const redFlags = detectRedFlags(surgeryType, dayNumber, answers);

  // Determinar nível de risco baseado em red flags
  let riskLevel: AnalysisResult['riskLevel'] = 'low';
  let status: AnalysisResult['status'] = 'NORMAL';
  let urgencia: AnalysisResult['urgencia'] = 'baixa';
  let alertarMedico = false;

  // Análise de dor
  const painLevel = answers.dor !== undefined ? parseInt(answers.dor) : 0;

  // Análise de febre
  const hasFebre = answers.febre === true || answers.febre === 'Sim';
  const temperatura = answers.temperatura ? parseFloat(answers.temperatura) : 0;

  // Análise de sangramento
  const sangramento = answers.sangramento || 'Não';

  if (redFlags.length >= 3 || hasFebre && temperatura >= 38.5 || sangramento === 'Intenso') {
    riskLevel = 'critical';
    status = 'EMERGÊNCIA';
    urgencia = 'crítica';
    alertarMedico = true;
  } else if (redFlags.length >= 2 || hasFebre || sangramento === 'Moderado' || painLevel >= 9) {
    riskLevel = 'high';
    status = 'URGENTE';
    urgencia = 'alta';
    alertarMedico = true;
  } else if (redFlags.length >= 1 || painLevel >= 7) {
    riskLevel = 'medium';
    status = 'ATENÇÃO';
    urgencia = 'média';
    alertarMedico = false;
  }

  // Gerar mensagens
  const analise = `Análise automática (IA não disponível): ${redFlags.length} red flag(s) detectado(s). ` +
    `Dor: ${painLevel}/10, Sangramento: ${sangramento}, Febre: ${hasFebre ? 'Sim' : 'Não'}.`;

  const recomendacoes = generateSimpleRecommendations(status, redFlags, answers);

  const respostaEmpática = generateSimpleEmpatheticResponse(
    patientName.split(' ')[0],
    status,
    dayNumber
  );

  return {
    status,
    riskLevel,
    redFlags: redFlags.map(flag => `Red flag detectado: ${flag}`),
    analise,
    recomendacoes,
    respostaEmpática,
    alertarMedico,
    urgencia,
  };
}

/**
 * Valida e enriquece resultado da análise AI
 */
function validateAndEnrichAnalysis(
  analysis: AnalysisResult,
  localRedFlags: string[]
): AnalysisResult {
  // Garantir que todos os campos obrigatórios existem
  const validated: AnalysisResult = {
    status: analysis.status || 'ATENÇÃO',
    riskLevel: analysis.riskLevel || 'medium',
    redFlags: analysis.redFlags || [],
    analise: analysis.analise || 'Análise não disponível',
    raciocinioClinico: analysis.raciocinioClinico,
    recomendacoes: analysis.recomendacoes || [],
    respostaEmpática: analysis.respostaEmpática || 'Obrigado por responder. Em breve retornaremos.',
    alertarMedico: analysis.alertarMedico ?? false,
    urgencia: analysis.urgencia || 'baixa',
  };

  // Adicionar red flags locais que podem ter sido perdidos
  localRedFlags.forEach(flag => {
    if (!validated.redFlags.some(rf => rf.includes(flag))) {
      validated.redFlags.push(`Detectado localmente: ${flag}`);
    }
  });

  // Ajustar alertarMedico baseado em status
  if (validated.status === 'URGENTE' || validated.status === 'EMERGÊNCIA') {
    validated.alertarMedico = true;
  }

  return validated;
}

/**
 * Gera recomendações simples
 */
function generateSimpleRecommendations(
  status: AnalysisResult['status'],
  redFlags: string[],
  answers: Record<string, any>
): string[] {
  const recommendations: string[] = [];

  if (status === 'EMERGÊNCIA') {
    recommendations.push('⚠️ ATENÇÃO: Procure atendimento médico IMEDIATAMENTE');
    recommendations.push('Vá ao pronto-socorro ou entre em contato com seu médico AGORA');
    return recommendations;
  }

  if (status === 'URGENTE') {
    recommendations.push('Entre em contato com seu médico o mais breve possível');
    recommendations.push('Não aguarde a consulta de retorno agendada');
  }

  if (answers.dor >= 8) {
    recommendations.push('Tomar medicação para dor conforme prescrito');
    recommendations.push('Se dor não melhorar, entrar em contato com médico');
  }

  if (answers.febre === true) {
    recommendations.push('Medir temperatura a cada 4 horas');
    recommendations.push('Se febre > 38°C persistir, contactar médico');
  }

  if (answers.sangramento === 'Moderado' || answers.sangramento === 'Intenso') {
    recommendations.push('Observar quantidade de sangramento');
    recommendations.push('Se aumentar ou não parar, procurar atendimento');
  }

  if (answers.medicacoes !== 'Sim, todas') {
    recommendations.push('Importante tomar todas as medicações prescritas');
    recommendations.push('Seguir horários e dosagens recomendadas');
  }

  if (recommendations.length === 0) {
    recommendations.push('Continuar cuidados habituais');
    recommendations.push('Manter higiene local adequada');
    recommendations.push('Tomar medicações conforme orientado');
    recommendations.push('Retorno conforme agendado');
  }

  return recommendations;
}

/**
 * Gera resposta empática simples
 */
function generateSimpleEmpatheticResponse(
  firstName: string,
  status: AnalysisResult['status'],
  dayNumber: number
): string {
  if (status === 'EMERGÊNCIA') {
    return `${firstName}, sua situação requer atenção médica IMEDIATA. ` +
      `Por favor, procure o pronto-socorro ou entre em contato com seu médico AGORA. ` +
      `Não espere. Sua saúde é prioridade.`;
  }

  if (status === 'URGENTE') {
    return `${firstName}, obrigado por responder. Identifiquei alguns sinais que precisam de atenção médica. ` +
      `Por favor, entre em contato com seu médico o mais breve possível, sem aguardar a consulta de retorno. ` +
      `Ele poderá avaliar melhor sua situação e orientar os próximos passos.`;
  }

  if (status === 'ATENÇÃO') {
    return `${firstName}, obrigado por responder ao questionário do dia ${dayNumber}. ` +
      `Alguns pontos merecem atenção, mas não há urgência. Continue tomando suas medicações corretamente. ` +
      `Se houver piora dos sintomas, entre em contato com seu médico. Continue se cuidando!`;
  }

  return `${firstName}, obrigado por responder! Sua recuperação está dentro do esperado para o dia ${dayNumber}. ` +
    `Continue com os cuidados e medicações conforme orientado. ` +
    `Qualquer dúvida ou mudança significativa, estou aqui para ajudar. Melhoras!`;
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Converte nível de risco para cor
 */
export function getRiskLevelColor(riskLevel: AnalysisResult['riskLevel']): string {
  const colors: Record<AnalysisResult['riskLevel'], string> = {
    low: '#22c55e', // green-500
    medium: '#f59e0b', // amber-500
    high: '#ef4444', // red-500
    critical: '#dc2626', // red-600
  };

  return colors[riskLevel];
}

/**
 * Converte status para emoji
 */
export function getStatusEmoji(status: AnalysisResult['status']): string {
  const emojis: Record<AnalysisResult['status'], string> = {
    'NORMAL': '✅',
    'ATENÇÃO': '⚠️',
    'URGENTE': '🚨',
    'EMERGÊNCIA': '🆘',
  };

  return emojis[status];
}

/**
 * Formata análise para WhatsApp
 */
export function formatAnalysisForWhatsApp(analysis: AnalysisResult): string {
  const emoji = getStatusEmoji(analysis.status);

  let message = `${emoji} *${analysis.status}*\n\n`;
  message += `${analysis.respostaEmpática}\n\n`;

  if (analysis.recomendacoes.length > 0) {
    message += `*Recomendações:*\n`;
    analysis.recomendacoes.forEach((rec, i) => {
      message += `${i + 1}. ${rec}\n`;
    });
  }

  return message;
}

/**
 * Formata análise para dashboard médico
 */
export function formatAnalysisForDashboard(analysis: AnalysisResult): string {
  let html = `<div class="analysis-result risk-${analysis.riskLevel}">`;
  html += `<h3>${getStatusEmoji(analysis.status)} ${analysis.status}</h3>`;
  html += `<p><strong>Análise:</strong> ${analysis.analise}</p>`;

  if (analysis.redFlags.length > 0) {
    html += `<div class="red-flags">`;
    html += `<h4>🚩 Red Flags Detectados:</h4><ul>`;
    analysis.redFlags.forEach(flag => {
      html += `<li>${flag}</li>`;
    });
    html += `</ul></div>`;
  }

  if (analysis.recomendacoes.length > 0) {
    html += `<div class="recommendations">`;
    html += `<h4>💡 Recomendações:</h4><ul>`;
    analysis.recomendacoes.forEach(rec => {
      html += `<li>${rec}</li>`;
    });
    html += `</ul></div>`;
  }

  html += `</div>`;
  return html;
}
