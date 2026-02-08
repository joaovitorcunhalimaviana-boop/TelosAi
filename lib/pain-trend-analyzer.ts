/**
 * Analisador de Tendências de Dor Pós-Operatória
 *
 * Analisa a progressão da dor ao longo dos dias pós-operatórios, considerando:
 * - Bloqueio do nervo pudendo (dura ~48 horas)
 * - Padrão esperado de melhora após D+3
 * - Comparação com dados históricos do paciente
 */

import { prisma } from './prisma';

export interface PainRecord {
  dayPostOp: number;
  painAtRest: number; // 0-10
  painDuringBowelMovement?: number; // 0-10
  timestamp: Date;
}

export interface PainTrendAnalysis {
  pattern: 'improving' | 'stable' | 'worsening' | 'fluctuating';
  isWithinExpectedRange: boolean;
  concernLevel: 'none' | 'mild' | 'moderate' | 'severe';
  message: string;
  shouldAlertDoctor: boolean;
  insights: string[];
}

/**
 * Faixas esperadas de dor por dia pós-operatório
 * Baseado em estudos de hemorroidectomia com bloqueio pudendo
 */
const EXPECTED_PAIN_RANGES: Record<number, { min: number; max: number; note: string }> = {
  1: {
    min: 0,
    max: 4,
    note: 'D+1: Bloqueio pudendo ainda ativo. Dor mínima esperada.'
  },
  2: {
    min: 2,
    max: 7,
    note: 'D+2: Bloqueio terminando. Aumento de dor é NORMAL e esperado.'
  },
  3: {
    min: 2,
    max: 6,
    note: 'D+3: Pico de dor inflamatória. Deve começar a melhorar após este dia.'
  },
  4: {
    min: 1,
    max: 5,
    note: 'D+4: Dor deve estar em tendência de melhora.'
  },
  5: {
    min: 1,
    max: 5,
    note: 'D+5: Continuação da melhora progressiva.'
  },
  7: {
    min: 0,
    max: 4,
    note: 'D+7: Dor significativamente reduzida.'
  },
  10: {
    min: 0,
    max: 3,
    note: 'D+10: Dor leve ou ausente.'
  },
  14: {
    min: 0,
    max: 2,
    note: 'D+14: Dor mínima ou ausente.'
  }
};

/**
 * Analisa tendência de dor baseado em histórico
 */
export function analyzePainTrend(
  painHistory: PainRecord[],
  currentDay: number
): PainTrendAnalysis {
  // Ordenar por dia
  const sortedHistory = [...painHistory].sort((a, b) => a.dayPostOp - b.dayPostOp);

  const insights: string[] = [];
  let concernLevel: 'none' | 'mild' | 'moderate' | 'severe' = 'none';
  let shouldAlertDoctor = false;

  // Registro atual
  const currentRecord = sortedHistory.find(r => r.dayPostOp === currentDay);
  if (!currentRecord) {
    return {
      pattern: 'stable',
      isWithinExpectedRange: true,
      concernLevel: 'none',
      message: 'Sem dados suficientes para análise.',
      shouldAlertDoctor: false,
      insights: []
    };
  }

  const currentPain = currentRecord.painAtRest;

  // 1. Verificar se está dentro da faixa esperada
  const expectedRange = EXPECTED_PAIN_RANGES[currentDay] || EXPECTED_PAIN_RANGES[14];
  const isWithinExpectedRange =
    currentPain >= expectedRange.min && currentPain <= expectedRange.max;

  if (!isWithinExpectedRange) {
    if (currentPain > expectedRange.max) {
      insights.push(
        `Dor ${currentPain}/10 está acima do esperado para D+${currentDay} (esperado: ${expectedRange.min}-${expectedRange.max})`
      );
      concernLevel = currentPain >= 8 ? 'severe' : 'moderate';
      shouldAlertDoctor = currentPain >= 8;
    } else {
      insights.push(
        `Excelente! Dor ${currentPain}/10 está abaixo do esperado para D+${currentDay}`
      );
    }
  } else {
    insights.push(expectedRange.note);
  }

  // 2. Analisar padrão de evolução (precisa de pelo menos 2 registros)
  let pattern: 'improving' | 'stable' | 'worsening' | 'fluctuating' = 'stable';

  if (sortedHistory.length >= 2) {
    const previousRecord = sortedHistory[sortedHistory.length - 2];
    const painChange = currentPain - previousRecord.painAtRest;

    // Caso especial D+2: aumento é esperado
    if (currentDay === 2 && previousRecord.dayPostOp === 1) {
      if (painChange > 0) {
        insights.push(
          '✅ Aumento de dor em D+2 comparado a D+1 é NORMAL (bloqueio pudendo terminando)'
        );
        pattern = 'stable'; // Consideramos "estável" pois é esperado
      } else {
        insights.push('Dor não aumentou em D+2. Bloqueio pode estar durando mais tempo.');
        pattern = 'improving';
      }
    }
    // Após D+3: deve melhorar ou estabilizar
    else if (currentDay >= 3) {
      if (painChange > 2) {
        insights.push('⚠️ Dor aumentou significativamente em relação ao último registro');
        pattern = 'worsening';
        concernLevel = concernLevel === 'severe' ? 'severe' : 'moderate';
        shouldAlertDoctor = true;
      } else if (painChange > 0) {
        insights.push('Dor aumentou levemente. Monitorar nos próximos dias.');
        pattern = 'fluctuating';
        concernLevel = concernLevel === 'none' ? 'mild' : concernLevel;
      } else if (painChange < -1) {
        insights.push('✅ Dor está melhorando conforme esperado');
        pattern = 'improving';
      } else {
        insights.push('Dor estável em relação ao último registro');
        pattern = 'stable';
      }
    }
    // D+1 (sem comparação)
    else {
      pattern = 'stable';
    }
  }

  // 3. Análise de dor durante evacuação (se disponível)
  if (currentRecord.painDuringBowelMovement !== undefined) {
    const bmPain = currentRecord.painDuringBowelMovement;

    if (bmPain >= 8) {
      insights.push('⚠️ Dor intensa durante evacuação pode causar constipação por medo');
      concernLevel = 'severe';
      shouldAlertDoctor = true;
    } else if (bmPain >= 6) {
      insights.push('Dor moderada durante evacuação. Analgesia antes de evacuar pode ajudar.');
      concernLevel = concernLevel === 'none' ? 'mild' : concernLevel;
    } else if (bmPain <= 3) {
      insights.push('✅ Dor leve durante evacuação - bom controle');
    }

    // Comparar dor em repouso vs evacuação
    const bmPainDiff = bmPain - currentPain;
    if (bmPainDiff >= 4) {
      insights.push(
        'Grande diferença entre dor em repouso e durante evacuação. Considerar analgesia preventiva antes de evacuar.'
      );
    }
  }

  // 4. Verificar padrões problemáticos em múltiplos dias
  if (sortedHistory.length >= 3) {
    const lastThreeDays = sortedHistory.slice(-3);
    const highPainDays = lastThreeDays.filter(r => r.painAtRest >= 7).length;

    if (highPainDays >= 2 && currentDay >= 4) {
      insights.push('⚠️ Dor persistentemente alta após D+3. Avaliar adequação da analgesia.');
      concernLevel = 'severe';
      shouldAlertDoctor = true;
    }
  }

  // 5. Mensagem final
  let message = '';

  if (shouldAlertDoctor) {
    message =
      'Sua dor está acima do esperado. Vou informar seu médico para avaliar se precisa ajustar suas medicações.';
  } else if (concernLevel === 'moderate') {
    message =
      'Sua dor está dentro do esperado, mas vou passar para o médico ficar atento à evolução.';
  } else if (pattern === 'improving') {
    message = 'Ótimo! Sua recuperação está indo muito bem. A dor está melhorando conforme esperado.';
  } else {
    message = 'Sua dor está dentro do esperado para este momento da recuperação.';
  }

  return {
    pattern,
    isWithinExpectedRange,
    concernLevel,
    message,
    shouldAlertDoctor,
    insights
  };
}

/**
 * Obtém histórico de dor de um paciente
 */
export async function getPainHistory(surgeryId: string): Promise<PainRecord[]> {
  const followUps = await prisma.followUp.findMany({
    where: { surgeryId },
    include: {
      responses: true
    },
    orderBy: { dayNumber: 'asc' }
  });

  const painRecords: PainRecord[] = [];

  for (const followUp of followUps) {
    if (followUp.responses.length > 0) {
      const response = followUp.responses[0];
      const data = JSON.parse(response.questionnaireData);

      if (data.pain !== undefined) {
        painRecords.push({
          dayPostOp: followUp.dayNumber,
          painAtRest: data.pain,
          painDuringBowelMovement: data.painDuringBowelMovement,
          timestamp: response.createdAt
        });
      }
    }
  }

  return painRecords;
}

/**
 * Compara dor atual com dia anterior
 */
export function comparePainWithPreviousDay(
  currentPain: number,
  currentDay: number,
  painHistory: PainRecord[]
): {
  comparison: 'better' | 'same' | 'worse' | 'no_data';
  message: string;
  isNormal: boolean;
} {
  const previousDay = painHistory.find(r => r.dayPostOp === currentDay - 1);

  if (!previousDay) {
    return {
      comparison: 'no_data',
      message: 'Não tenho registro da dor de ontem para comparar.',
      isNormal: true
    };
  }

  const previousPain = previousDay.painAtRest;
  const difference = currentPain - previousPain;

  // Caso especial: D+2 vs D+1
  if (currentDay === 2) {
    if (difference > 0) {
      return {
        comparison: 'worse',
        message: `Sua dor hoje (${currentPain}) está maior que ontem (${previousPain}). Isso é NORMAL porque o bloqueio anestésico está terminando. Esperamos melhora a partir de amanhã.`,
        isNormal: true
      };
    } else if (difference === 0) {
      return {
        comparison: 'same',
        message: `Sua dor continua ${currentPain}/10, igual a ontem. O bloqueio ainda pode estar fazendo efeito.`,
        isNormal: true
      };
    } else {
      return {
        comparison: 'better',
        message: `Sua dor melhorou de ${previousPain} para ${currentPain}. Excelente! O bloqueio ainda está ajudando.`,
        isNormal: true
      };
    }
  }

  // Outros dias (D+3+)
  if (difference > 2) {
    return {
      comparison: 'worse',
      message: `Sua dor aumentou bastante (de ${previousPain} para ${currentPain}). Isso não é comum. Vou avisar o médico.`,
      isNormal: false
    };
  } else if (difference > 0) {
    return {
      comparison: 'worse',
      message: `Sua dor aumentou um pouco (de ${previousPain} para ${currentPain}). Vamos monitorar.`,
      isNormal: currentDay <= 4 // Pequenas flutuações até D+4 são aceitáveis
    };
  } else if (difference === 0) {
    return {
      comparison: 'same',
      message: `Sua dor continua ${currentPain}/10, igual a ontem.`,
      isNormal: true
    };
  } else if (difference >= -1) {
    return {
      comparison: 'better',
      message: `Sua dor melhorou um pouco (de ${previousPain} para ${currentPain}).`,
      isNormal: true
    };
  } else {
    return {
      comparison: 'better',
      message: `Ótimo! Sua dor melhorou bastante (de ${previousPain} para ${currentPain}).`,
      isNormal: true
    };
  }
}

/**
 * Detecta red flags relacionados à dor
 */
export function detectPainRedFlags(
  currentPain: number,
  currentDay: number,
  painDuringBM?: number
): {
  redFlags: string[];
  criticalLevel: 'none' | 'warning' | 'urgent' | 'critical';
} {
  const redFlags: string[] = [];
  let criticalLevel: 'none' | 'warning' | 'urgent' | 'critical' = 'none';

  // 1. Dor extrema (≥8)
  if (currentPain >= 8) {
    redFlags.push(`Dor severa em repouso (${currentPain}/10)`);
    criticalLevel = 'critical';
  }

  // 2. Dor alta persistente após D+4
  if (currentPain >= 7 && currentDay >= 4) {
    redFlags.push(`Dor alta persistente em D+${currentDay} (${currentPain}/10)`);
    criticalLevel = criticalLevel === 'critical' ? 'critical' : 'urgent';
  }

  // 3. Dor durante evacuação extrema
  if (painDuringBM !== undefined && painDuringBM >= 8) {
    redFlags.push(`Dor severa durante evacuação (${painDuringBM}/10) - risco de constipação por medo`);
    criticalLevel = criticalLevel === 'critical' ? 'critical' : 'urgent';
  }

  // 4. Dor não melhorando após D+5
  if (currentPain >= 6 && currentDay >= 5) {
    redFlags.push(`Dor não melhorando adequadamente em D+${currentDay}`);
    criticalLevel = criticalLevel === 'none' ? 'warning' : criticalLevel;
  }

  return { redFlags, criticalLevel };
}
