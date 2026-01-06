/**
 * Sistema de Red Flags Determinístico
 * Detecta sinais de alerta baseado em regras específicas por tipo de cirurgia
 */

export interface RedFlagInput {
  surgeryType: 'hemorroidectomia' | 'fistula' | 'fissura' | 'pilonidal';
  dayNumber: number;
  painLevel?: number | null;
  urinaryRetention?: boolean | null;
  urinaryRetentionHours?: number | null;
  bowelMovement?: boolean | null;
  bleeding?: 'none' | 'light' | 'moderate' | 'severe' | null;
  fever?: boolean | null;
  temperature?: number | null;
  discharge?: 'none' | 'serous' | 'purulent' | 'abundant' | null;
  additionalSymptoms?: string[] | null;
}

export interface RedFlag {
  id: string;
  severity: 'critical' | 'high' | 'medium';
  message: string;
  recommendation: string;
}

/**
 * Detecta red flags baseado em regras determinísticas
 */
export function detectRedFlags(input: RedFlagInput): RedFlag[] {
  const flags: RedFlag[] = [];

  // Red flags universais (aplicam-se a todos os tipos de cirurgia)
  flags.push(...detectUniversalRedFlags(input));

  // Red flags específicos por tipo de cirurgia
  switch (input.surgeryType) {
    case 'hemorroidectomia':
      flags.push(...detectHemorroidectomyRedFlags(input));
      break;
    case 'fistula':
      flags.push(...detectFistulaRedFlags(input));
      break;
    case 'fissura':
      flags.push(...detectFissureRedFlags(input));
      break;
    case 'pilonidal':
      flags.push(...detectPilonidalRedFlags(input));
      break;
  }

  // Ordenar por severidade (critical > high > medium)
  return flags.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Red flags universais (todos os tipos de cirurgia)
 */
function detectUniversalRedFlags(input: RedFlagInput): RedFlag[] {
  const flags: RedFlag[] = [];

  // Febre alta (>38°C)
  if (input.fever && input.temperature && input.temperature >= 38) {
    flags.push({
      id: 'fever_high',
      severity: input.temperature >= 39 ? 'critical' : 'high',
      message: `Febre de ${input.temperature}°C`,
      recommendation: 'Procure atendimento médico imediatamente. Febre pode indicar infecção.',
    });
  }

  // Febre sem temperatura especificada
  if (input.fever && !input.temperature) {
    flags.push({
      id: 'fever_unspecified',
      severity: 'high',
      message: 'Febre presente',
      recommendation: 'Meça a temperatura e procure atendimento se estiver acima de 38°C.',
    });
  }

  // Sangramento intenso/ativo
  if (input.bleeding === 'severe') {
    flags.push({
      id: 'bleeding_severe',
      severity: 'critical',
      message: 'Sangramento ativo intenso',
      recommendation: 'Procure atendimento de emergência IMEDIATAMENTE.',
    });
  }

  // Sangramento moderado prolongado
  if (input.bleeding === 'moderate' && input.dayNumber > 3) {
    flags.push({
      id: 'bleeding_moderate_prolonged',
      severity: 'high',
      message: 'Sangramento moderado persistente após D+3',
      recommendation: 'Agende avaliação com seu médico o quanto antes.',
    });
  }

  // Dor extrema (>9/10)
  if (input.painLevel != null && input.painLevel >= 9) {
    flags.push({
      id: 'pain_extreme',
      severity: 'critical',
      message: `Dor extrema (${input.painLevel}/10)`,
      recommendation: 'Dor muito intensa. Procure atendimento médico imediatamente.',
    });
  }

  return flags;
}

/**
 * Red flags específicos para HEMORROIDECTOMIA
 */
function detectHemorroidectomyRedFlags(input: RedFlagInput): RedFlag[] {
  const flags: RedFlag[] = [];

  // Retenção urinária >12h
  if (
    input.urinaryRetention &&
    input.urinaryRetentionHours &&
    input.urinaryRetentionHours > 12
  ) {
    flags.push({
      id: 'urinary_retention_prolonged',
      severity: 'critical',
      message: `Retenção urinária há ${input.urinaryRetentionHours}h`,
      recommendation: 'Procure atendimento de emergência. Pode ser necessário cateterismo.',
    });
  }

  // Retenção urinária 6-12h
  if (
    input.urinaryRetention &&
    input.urinaryRetentionHours &&
    input.urinaryRetentionHours >= 6 &&
    input.urinaryRetentionHours <= 12
  ) {
    flags.push({
      id: 'urinary_retention_moderate',
      severity: 'high',
      message: `Retenção urinária há ${input.urinaryRetentionHours}h`,
      recommendation: 'Se não conseguir urinar nas próximas horas, procure atendimento.',
    });
  }

  // Dor muito intensa (>8/10)
  if (input.painLevel != null && input.painLevel > 8) {
    flags.push({
      id: 'pain_very_intense_hemorrhoid',
      severity: 'high',
      message: `Dor muito intensa (${input.painLevel}/10)`,
      recommendation: 'Dor acima do esperado. Entre em contato com seu médico.',
    });
  }

  // Ausência de evacuação após D+3
  if (input.dayNumber >= 3 && input.bowelMovement === false) {
    flags.push({
      id: 'no_bowel_movement_d3',
      severity: 'medium',
      message: 'Sem evacuação até D+3',
      recommendation: 'Importante evacuar. Aumente hidratação e use laxantes conforme orientado.',
    });
  }

  return flags;
}

/**
 * Red flags específicos para FÍSTULA
 */
function detectFistulaRedFlags(input: RedFlagInput): RedFlag[] {
  const flags: RedFlag[] = [];

  // Secreção purulenta abundante
  if (input.discharge === 'purulent' || input.discharge === 'abundant') {
    flags.push({
      id: 'purulent_discharge',
      severity: 'high',
      message: 'Secreção purulenta abundante',
      recommendation: 'Pode indicar infecção. Procure avaliação médica urgente.',
    });
  }

  // Dor muito intensa (>8/10)
  if (input.painLevel != null && input.painLevel > 8) {
    flags.push({
      id: 'pain_very_intense_fistula',
      severity: 'high',
      message: `Dor muito intensa (${input.painLevel}/10)`,
      recommendation: 'Dor intensa pode indicar abscesso. Entre em contato com seu médico.',
    });
  }

  // Sinais de celulite (procurar em sintomas adicionais)
  if (input.additionalSymptoms?.some(s =>
    s.toLowerCase().includes('vermelhidão') ||
    s.toLowerCase().includes('inchaço') ||
    s.toLowerCase().includes('calor local')
  )) {
    flags.push({
      id: 'cellulitis_signs',
      severity: 'high',
      message: 'Sinais de celulite (vermelhidão/inchaço)',
      recommendation: 'Procure avaliação médica o quanto antes.',
    });
  }

  return flags;
}

/**
 * Red flags específicos para FISSURA
 */
function detectFissureRedFlags(input: RedFlagInput): RedFlag[] {
  const flags: RedFlag[] = [];

  // Dor persistente muito intensa (>9/10)
  if (input.painLevel != null && input.painLevel > 9) {
    flags.push({
      id: 'pain_extreme_fissure',
      severity: 'high',
      message: `Dor extrema persistente (${input.painLevel}/10)`,
      recommendation: 'Dor acima do esperado. Entre em contato com seu médico.',
    });
  }

  // Sangramento ativo após cirurgia de fissura
  if (input.bleeding === 'severe' || input.bleeding === 'moderate') {
    flags.push({
      id: 'bleeding_fissure',
      severity: 'high',
      message: 'Sangramento ativo após cirurgia de fissura',
      recommendation: 'Sangramento não é comum. Entre em contato com seu médico.',
    });
  }

  // Ausência de evacuação prolongada
  if (input.dayNumber >= 4 && input.bowelMovement === false) {
    flags.push({
      id: 'no_bowel_movement_fissure',
      severity: 'medium',
      message: 'Sem evacuação até D+4',
      recommendation: 'Importante evacuar para evitar complicações. Use laxantes conforme orientado.',
    });
  }

  return flags;
}

/**
 * Red flags específicos para DOENÇA PILONIDAL
 */
function detectPilonidalRedFlags(input: RedFlagInput): RedFlag[] {
  const flags: RedFlag[] = [];

  // Secreção purulenta
  if (input.discharge === 'purulent' || input.discharge === 'abundant') {
    flags.push({
      id: 'purulent_discharge_pilonidal',
      severity: 'high',
      message: 'Secreção purulenta na ferida',
      recommendation: 'Pode indicar infecção. Procure avaliação médica.',
    });
  }

  // Sinais de celulite
  if (input.additionalSymptoms?.some(s =>
    s.toLowerCase().includes('vermelhidão') ||
    s.toLowerCase().includes('inchaço') ||
    s.toLowerCase().includes('calor local')
  )) {
    flags.push({
      id: 'cellulitis_signs_pilonidal',
      severity: 'high',
      message: 'Sinais de celulite ao redor da ferida',
      recommendation: 'Procure avaliação médica urgente.',
    });
  }

  // Dor muito intensa
  if (input.painLevel != null && input.painLevel > 8) {
    flags.push({
      id: 'pain_very_intense_pilonidal',
      severity: 'high',
      message: `Dor muito intensa (${input.painLevel}/10)`,
      recommendation: 'Dor intensa pode indicar complicação. Entre em contato com seu médico.',
    });
  }

  return flags;
}

/**
 * Determina nível de risco baseado nos red flags detectados
 */
export function getRiskLevel(redFlags: RedFlag[]): 'low' | 'medium' | 'high' | 'critical' {
  if (redFlags.length === 0) {
    return 'low';
  }

  // Se houver qualquer flag critical
  if (redFlags.some(f => f.severity === 'critical')) {
    return 'critical';
  }

  // Se houver 2+ flags high
  if (redFlags.filter(f => f.severity === 'high').length >= 2) {
    return 'critical';
  }

  // Se houver 1 flag high
  if (redFlags.some(f => f.severity === 'high')) {
    return 'high';
  }

  // Se houver flags medium
  if (redFlags.some(f => f.severity === 'medium')) {
    return 'medium';
  }

  return 'low';
}

/**
 * Formata red flags para exibição
 */
export function formatRedFlags(redFlags: RedFlag[]): string {
  if (redFlags.length === 0) {
    return 'Nenhum sinal de alerta detectado';
  }

  return redFlags
    .map(flag => `[${flag.severity.toUpperCase()}] ${flag.message}`)
    .join('\n');
}
