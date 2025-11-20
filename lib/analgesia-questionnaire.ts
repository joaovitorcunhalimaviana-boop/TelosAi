/**
 * Questionário de Analgesia Pós-Operatória
 *
 * Avaliação básica sobre:
 * - Adesão às medicações prescritas
 * - Controle da dor com as medicações
 * - Efeitos colaterais comuns dos analgésicos
 */

export interface AnalgesiaData {
  // Adesão
  takingMedicationsAsPrescibed: boolean;
  medicationIssues?: string;

  // Controle da dor
  painControlledWithMeds: boolean;
  painControlDetails?: string;

  // Efeitos colaterais
  hasSideEffects: boolean;
  nausea?: boolean;
  constipation?: boolean;
  drowsiness?: boolean;
  otherSideEffects?: string;
}

/**
 * Retorna perguntas sobre analgesia
 */
export function getAnalgesiaQuestions(): {
  questions: Array<{
    id: string;
    text: string;
    type: 'yes-no' | 'text' | 'multiple-choice';
    required: boolean;
  }>;
  contextForAI: string;
} {
  return {
    questions: [
      {
        id: 'takingMedicationsAsPrescibed',
        text: 'Você está tomando as medicações conforme o médico prescreveu?',
        type: 'yes-no',
        required: true
      },
      {
        id: 'painControlledWithMeds',
        text: 'Sua dor está controlada com as medicações?',
        type: 'yes-no',
        required: true
      },
      {
        id: 'hasSideEffects',
        text: 'Você está tendo algum efeito colateral das medicações?',
        type: 'yes-no',
        required: true
      }
    ],
    contextForAI: `
INSTRUÇÕES PARA PERGUNTAS DE ANALGESIA:

1. ADESÃO ÀS MEDICAÇÕES:
   - Perguntar: "Você está tomando as medicações conforme o médico prescreveu?"
   - Se NÃO: investigar o motivo (esqueceu, teve efeito colateral, não comprou)
   - Reforçar importância da adesão para controle da dor

2. CONTROLE DA DOR:
   - Perguntar: "Sua dor está controlada com as medicações?"
   - Se NÃO: perguntar se a dor melhora temporariamente após tomar o remédio
   - Isso ajuda a entender se o problema é dose insuficiente ou dor refratária

3. EFEITOS COLATERAIS:
   - Perguntar: "Você está tendo algum efeito colateral das medicações?"
   - Se SIM: investigar quais:
     * Náusea ou vômito?
     * Constipação (prisão de ventre)?
     * Sonolência ou tonturas?
     * Outros sintomas?
   - NÃO sugerir efeitos colaterais, deixar paciente falar livremente

⚠️ RED FLAGS:
- Não está tomando medicações regularmente
- Dor não controlada mesmo com medicações
- Efeitos colaterais severos (vômitos persistentes, confusão mental)

ABORDAGEM:
- Seja empática e não julgue se paciente não está tomando corretamente
- Explique importância da analgesia preventiva vs. "só tomar quando doer"
- Se efeitos colaterais importantes: sugerir contato com médico
`
  };
}

/**
 * Analisa dados de analgesia e identifica problemas
 */
export function analyzeAnalgesiaData(data: AnalgesiaData): {
  issues: string[];
  shouldAlertDoctor: boolean;
  urgencyLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let shouldAlertDoctor = false;
  let urgencyLevel: 'low' | 'medium' | 'high' = 'low';

  // Verificar adesão às medicações
  if (!data.takingMedicationsAsPrescibed) {
    issues.push('Não está tomando medicações conforme prescrito');
    recommendations.push('Importante tomar as medicações nos horários corretos para controle adequado da dor');
    urgencyLevel = 'medium';
  }

  // Verificar controle da dor
  if (!data.painControlledWithMeds) {
    issues.push('Dor não controlada com as medicações atuais');
    recommendations.push('Médico deve avaliar necessidade de ajuste na prescrição');
    shouldAlertDoctor = true;
    urgencyLevel = 'high';
  }

  // Verificar efeitos colaterais
  if (data.hasSideEffects) {
    if (data.nausea) {
      issues.push('Náusea relacionada às medicações');
      recommendations.push('Tomar medicações com alimento pode ajudar');
    }

    if (data.constipation) {
      issues.push('Constipação relacionada aos analgésicos');
      recommendations.push('Importante tomar laxantes e hidratar bastante');
    }

    if (data.drowsiness) {
      issues.push('Sonolência excessiva');
      recommendations.push('Evitar dirigir ou operar máquinas. Se muito intensa, avisar o médico');
    }

    // Se múltiplos efeitos colaterais severos
    const severeEffects = [data.nausea, data.constipation, data.drowsiness].filter(Boolean).length;
    if (severeEffects >= 2) {
      shouldAlertDoctor = true;
      urgencyLevel = 'medium';
    }
  }

  return {
    issues,
    shouldAlertDoctor,
    urgencyLevel,
    recommendations
  };
}

/**
 * Gera mensagem contextual sobre analgesia para o paciente
 */
export function getAnalgesiaFeedbackMessage(analysis: {
  issues: string[];
  recommendations: string[];
}): string {
  if (analysis.issues.length === 0) {
    return 'Ótimo! Você está fazendo tudo certinho com as medicações. Continue assim! 💊';
  }

  let message = 'Entendi. Aqui estão algumas orientações importantes:\n\n';

  analysis.recommendations.forEach((rec, index) => {
    message += `${index + 1}. ${rec}\n`;
  });

  message += '\nVou passar essas informações para o Dr. João Vitor avaliar.';

  return message;
}

/**
 * Valida se dados de analgesia estão completos
 */
export function isAnalgesiaDataComplete(data: Partial<AnalgesiaData>): boolean {
  // Campos obrigatórios
  if (data.takingMedicationsAsPrescibed === undefined) return false;
  if (data.painControlledWithMeds === undefined) return false;
  if (data.hasSideEffects === undefined) return false;

  // Se tem efeitos colaterais, deve detalhar pelo menos um
  if (data.hasSideEffects === true) {
    const hasDetails = data.nausea || data.constipation || data.drowsiness || data.otherSideEffects;
    if (!hasDetails) return false;
  }

  return true;
}

/**
 * Educação ao paciente sobre analgesia preventiva
 */
export const ANALGESIA_EDUCATION = {
  preventivePain: `
💡 DICA IMPORTANTE: Analgesia preventiva

É melhor tomar os analgésicos nos horários certos, mesmo que não esteja sentindo dor no momento.

Por quê?
- Prevenir a dor é mais fácil que tratar dor já instalada
- Medicação em níveis constantes no sangue = melhor controle
- Evita picos de dor intensa

Não espere a dor ficar forte para tomar o remédio!
  `,

  opioidSideEffects: `
💡 Efeitos comuns dos analgésicos opioides:

- Constipação: MUITO comum. Por isso o laxante foi prescrito junto
- Náusea: Pode melhorar tomando com alimento
- Sonolência: Especialmente nos primeiros dias

Esses efeitos são esperados e gerenciáveis. Se ficarem muito intensos, fale com o médico.
  `,

  medicationSchedule: `
💡 Como organizar seus horários:

1. Use alarmes no celular para lembrar
2. Deixe as medicações em local visível
3. Anote quando tomar para não duplicar dose
4. Nunca tome dose dobrada se esquecer uma

Se tiver dúvida sobre horários, sempre pergunte!
  `
};
