/**
 * EXEMPLO DE USO DA INTEGRAÇÃO COM CLAUDE AI
 *
 * Este arquivo demonstra como usar a análise de respostas de follow-up
 */

import { analyzeFollowUpResponse } from './anthropic';
import type { AnalysisInput, QuestionnaireData, PatientData } from './anthropic';

// ============================================
// EXEMPLO 1: Caso de baixo risco
// ============================================
async function exampleLowRisk() {
  const patientData: PatientData = {
    name: 'João Silva',
    age: 45,
    sex: 'Masculino',
    comorbidities: [],
    medications: [],
  };

  const questionnaireData: QuestionnaireData = {
    painLevel: 3,
    urinaryRetention: false,
    bowelMovement: true,
    bleeding: 'light',
    fever: false,
    additionalSymptoms: [],
    concerns: '',
  };

  const input: AnalysisInput = {
    surgeryType: 'hemorroidectomia',
    dayNumber: 2,
    patientData,
    questionnaireData,
    detectedRedFlags: [], // Nenhum red flag detectado pelo sistema determinístico
  };

  const result = await analyzeFollowUpResponse(input);

  console.log('Análise - Caso de Baixo Risco:');
  console.log('Nível de risco:', result.riskLevel); // Esperado: 'low'
  console.log('Resposta empática:', result.empatheticResponse);
  console.log('Red flags adicionais:', result.additionalRedFlags);
  console.log('Orientação:', result.seekCareAdvice);
}

// ============================================
// EXEMPLO 2: Caso de alto risco (retenção urinária)
// ============================================
async function exampleHighRisk() {
  const patientData: PatientData = {
    name: 'Maria Santos',
    age: 62,
    sex: 'Feminino',
    comorbidities: ['Hipertensão Arterial', 'Diabetes Mellitus tipo 2'],
    medications: ['Losartana 50mg', 'Metformina 850mg'],
  };

  const questionnaireData: QuestionnaireData = {
    painLevel: 8,
    urinaryRetention: true,
    urinaryRetentionHours: 14,
    bowelMovement: false,
    bleeding: 'light',
    fever: false,
    additionalSymptoms: ['Distensão abdominal'],
    concerns: 'Estou muito preocupada com a retenção urinária',
  };

  const input: AnalysisInput = {
    surgeryType: 'hemorroidectomia',
    dayNumber: 1,
    patientData,
    questionnaireData,
    detectedRedFlags: [
      'Retenção urinária há 14h',
      'Dor muito intensa (8/10)',
    ],
  };

  const result = await analyzeFollowUpResponse(input);

  console.log('Análise - Caso de Alto Risco:');
  console.log('Nível de risco:', result.riskLevel); // Esperado: 'critical' ou 'high'
  console.log('Resposta empática:', result.empatheticResponse);
  console.log('Red flags adicionais:', result.additionalRedFlags);
  console.log('Orientação:', result.seekCareAdvice);
}

// ============================================
// EXEMPLO 3: Caso crítico (febre alta + secreção purulenta)
// ============================================
async function exampleCritical() {
  const patientData: PatientData = {
    name: 'Carlos Oliveira',
    age: 38,
    sex: 'Masculino',
    comorbidities: ['HIV em TARV'],
    medications: ['Biktarvy'],
  };

  const questionnaireData: QuestionnaireData = {
    painLevel: 9,
    urinaryRetention: false,
    bowelMovement: true,
    bleeding: 'none',
    fever: true,
    temperature: 39.2,
    additionalSymptoms: ['Vermelhidão local', 'Inchaço', 'Calor local'],
    concerns: 'A região está muito inchada e quente',
  };

  const input: AnalysisInput = {
    surgeryType: 'fistula',
    dayNumber: 5,
    patientData,
    questionnaireData,
    detectedRedFlags: [
      'Febre de 39.2°C',
      'Secreção purulenta abundante',
      'Dor extrema (9/10)',
      'Sinais de celulite (vermelhidão/inchaço)',
    ],
  };

  const result = await analyzeFollowUpResponse(input);

  console.log('Análise - Caso Crítico:');
  console.log('Nível de risco:', result.riskLevel); // Esperado: 'critical'
  console.log('Resposta empática:', result.empatheticResponse);
  console.log('Red flags adicionais:', result.additionalRedFlags);
  console.log('Orientação:', result.seekCareAdvice);
}

// ============================================
// EXEMPLO 4: Usando a API route diretamente
// ============================================
async function exampleAPIRoute() {
  // Simular chamada à API
  const requestBody = {
    followUpId: 'follow-up-id-123',
    questionnaireData: {
      painLevel: 5,
      urinaryRetention: false,
      bowelMovement: true,
      bleeding: 'light',
      fever: false,
      additionalSymptoms: [],
      concerns: '',
    },
  };

  const response = await fetch('/api/analyze-response', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const result = await response.json();

  if (result.success) {
    console.log('Resposta da API:');
    console.log('Response ID:', result.data.responseId);
    console.log('Nível de risco:', result.data.riskLevel);
    console.log('Resposta empática:', result.data.empatheticResponse);
    console.log('Orientação:', result.data.seekCareAdvice);
    console.log('Red flags:', result.data.redFlags);
    console.log('Médico alertado?', result.data.doctorAlerted);
  } else {
    console.error('Erro:', result.error);
  }
}

// ============================================
// EXECUTAR EXEMPLOS
// ============================================
// Descomente para testar:
// exampleLowRisk();
// exampleHighRisk();
// exampleCritical();
// exampleAPIRoute();
