/**
 * TESTES PARA SISTEMA DE RED FLAGS
 *
 * Execute este arquivo para validar o sistema de detecção de red flags
 */

import { detectRedFlags, getRiskLevel, formatRedFlags } from './red-flags';

// Cores para output do console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function testCase(name: string, fn: () => void) {
  console.log(`\n${colors.blue}[TEST]${colors.reset} ${name}`);
  try {
    fn();
    console.log(`${colors.green}✓ PASSED${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}✗ FAILED${colors.reset}`);
    console.error(error);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// ============================================
// TESTES - HEMORROIDECTOMIA
// ============================================

testCase('Hemorroidectomia - Caso normal (baixo risco)', () => {
  const flags = detectRedFlags({
    surgeryType: 'hemorroidectomia',
    dayNumber: 2,
    painLevel: 4,
    urinaryRetention: false,
    bowelMovement: true,
    bleeding: 'light',
    fever: false,
    discharge: 'none',
  });

  const riskLevel = getRiskLevel(flags);

  assert(flags.length === 0, 'Não deveria detectar red flags');
  assert(riskLevel === 'low', 'Nível de risco deveria ser low');

  console.log('  Flags:', flags.length);
  console.log('  Risk:', riskLevel);
});

testCase('Hemorroidectomia - Retenção urinária crítica (>12h)', () => {
  const flags = detectRedFlags({
    surgeryType: 'hemorroidectomia',
    dayNumber: 1,
    painLevel: 6,
    urinaryRetention: true,
    urinaryRetentionHours: 15,
    bowelMovement: false,
    bleeding: 'light',
    fever: false,
  });

  const riskLevel = getRiskLevel(flags);

  assert(flags.length > 0, 'Deveria detectar red flags');
  assert(
    flags.some(f => f.id === 'urinary_retention_prolonged'),
    'Deveria detectar retenção urinária prolongada'
  );
  assert(riskLevel === 'critical', 'Nível de risco deveria ser critical');

  console.log('  Flags:', formatRedFlags(flags));
  console.log('  Risk:', riskLevel);
});

testCase('Hemorroidectomia - Dor muito intensa', () => {
  const flags = detectRedFlags({
    surgeryType: 'hemorroidectomia',
    dayNumber: 2,
    painLevel: 9,
    urinaryRetention: false,
    bowelMovement: true,
    bleeding: 'light',
    fever: false,
  });

  const riskLevel = getRiskLevel(flags);

  assert(flags.length > 0, 'Deveria detectar red flags');
  assert(
    flags.some(f => f.severity === 'critical'),
    'Deveria ter pelo menos um flag critical'
  );
  assert(riskLevel === 'critical', 'Nível de risco deveria ser critical');

  console.log('  Flags:', formatRedFlags(flags));
  console.log('  Risk:', riskLevel);
});

testCase('Hemorroidectomia - Ausência de evacuação D+3', () => {
  const flags = detectRedFlags({
    surgeryType: 'hemorroidectomia',
    dayNumber: 3,
    painLevel: 5,
    urinaryRetention: false,
    bowelMovement: false,
    bleeding: 'light',
    fever: false,
  });

  const riskLevel = getRiskLevel(flags);

  assert(flags.length > 0, 'Deveria detectar red flag');
  assert(
    flags.some(f => f.id === 'no_bowel_movement_d3'),
    'Deveria detectar ausência de evacuação'
  );
  assert(riskLevel === 'medium', 'Nível de risco deveria ser medium');

  console.log('  Flags:', formatRedFlags(flags));
  console.log('  Risk:', riskLevel);
});

// ============================================
// TESTES - FÍSTULA
// ============================================

testCase('Fístula - Secreção purulenta', () => {
  const flags = detectRedFlags({
    surgeryType: 'fistula',
    dayNumber: 5,
    painLevel: 6,
    urinaryRetention: false,
    bowelMovement: true,
    bleeding: 'none',
    fever: false,
    discharge: 'purulent',
  });

  const riskLevel = getRiskLevel(flags);

  assert(flags.length > 0, 'Deveria detectar red flag');
  assert(
    flags.some(f => f.id === 'purulent_discharge'),
    'Deveria detectar secreção purulenta'
  );
  assert(riskLevel === 'high', 'Nível de risco deveria ser high');

  console.log('  Flags:', formatRedFlags(flags));
  console.log('  Risk:', riskLevel);
});

testCase('Fístula - Sinais de celulite', () => {
  const flags = detectRedFlags({
    surgeryType: 'fistula',
    dayNumber: 3,
    painLevel: 7,
    urinaryRetention: false,
    bowelMovement: true,
    bleeding: 'none',
    fever: false,
    discharge: 'serous',
    additionalSymptoms: ['Vermelhidão local', 'Inchaço', 'Calor local'],
  });

  const riskLevel = getRiskLevel(flags);

  assert(flags.length > 0, 'Deveria detectar red flags');
  assert(
    flags.some(f => f.id === 'cellulitis_signs'),
    'Deveria detectar sinais de celulite'
  );
  assert(riskLevel === 'high', 'Nível de risco deveria ser high');

  console.log('  Flags:', formatRedFlags(flags));
  console.log('  Risk:', riskLevel);
});

// ============================================
// TESTES - FISSURA
// ============================================

testCase('Fissura - Dor extrema persistente', () => {
  const flags = detectRedFlags({
    surgeryType: 'fissura',
    dayNumber: 2,
    painLevel: 10,
    urinaryRetention: false,
    bowelMovement: true,
    bleeding: 'light',
    fever: false,
  });

  const riskLevel = getRiskLevel(flags);

  assert(flags.length > 0, 'Deveria detectar red flags');
  assert(
    flags.some(f => f.severity === 'critical'),
    'Deveria ter flag critical'
  );
  assert(riskLevel === 'critical', 'Nível de risco deveria ser critical');

  console.log('  Flags:', formatRedFlags(flags));
  console.log('  Risk:', riskLevel);
});

testCase('Fissura - Sangramento moderado', () => {
  const flags = detectRedFlags({
    surgeryType: 'fissura',
    dayNumber: 2,
    painLevel: 5,
    urinaryRetention: false,
    bowelMovement: true,
    bleeding: 'moderate',
    fever: false,
  });

  const riskLevel = getRiskLevel(flags);

  assert(flags.length > 0, 'Deveria detectar red flag');
  assert(
    flags.some(f => f.id === 'bleeding_fissure'),
    'Deveria detectar sangramento'
  );
  assert(riskLevel === 'high', 'Nível de risco deveria ser high');

  console.log('  Flags:', formatRedFlags(flags));
  console.log('  Risk:', riskLevel);
});

// ============================================
// TESTES - PILONIDAL
// ============================================

testCase('Pilonidal - Secreção purulenta + celulite', () => {
  const flags = detectRedFlags({
    surgeryType: 'pilonidal',
    dayNumber: 7,
    painLevel: 8,
    urinaryRetention: false,
    bowelMovement: true,
    bleeding: 'none',
    fever: false,
    discharge: 'purulent',
    additionalSymptoms: ['Vermelhidão ao redor', 'Inchaço'],
  });

  const riskLevel = getRiskLevel(flags);

  assert(flags.length >= 2, 'Deveria detectar múltiplos red flags');
  assert(
    flags.some(f => f.id === 'purulent_discharge_pilonidal'),
    'Deveria detectar secreção purulenta'
  );
  assert(
    flags.some(f => f.id === 'cellulitis_signs_pilonidal'),
    'Deveria detectar celulite'
  );
  assert(riskLevel === 'critical', 'Nível de risco deveria ser critical (2+ high flags)');

  console.log('  Flags:', formatRedFlags(flags));
  console.log('  Risk:', riskLevel);
});

// ============================================
// TESTES - RED FLAGS UNIVERSAIS
// ============================================

testCase('Universal - Febre alta (39°C)', () => {
  const flags = detectRedFlags({
    surgeryType: 'hemorroidectomia',
    dayNumber: 3,
    painLevel: 5,
    urinaryRetention: false,
    bowelMovement: true,
    bleeding: 'light',
    fever: true,
    temperature: 39.0,
  });

  const riskLevel = getRiskLevel(flags);

  assert(flags.length > 0, 'Deveria detectar red flag');
  assert(
    flags.some(f => f.id === 'fever_high'),
    'Deveria detectar febre alta'
  );
  assert(
    flags.some(f => f.severity === 'critical'),
    'Febre ≥39°C deveria ser critical'
  );
  assert(riskLevel === 'critical', 'Nível de risco deveria ser critical');

  console.log('  Flags:', formatRedFlags(flags));
  console.log('  Risk:', riskLevel);
});

testCase('Universal - Febre moderada (38.5°C)', () => {
  const flags = detectRedFlags({
    surgeryType: 'fistula',
    dayNumber: 2,
    painLevel: 4,
    urinaryRetention: false,
    bowelMovement: true,
    bleeding: 'none',
    fever: true,
    temperature: 38.5,
  });

  const riskLevel = getRiskLevel(flags);

  assert(flags.length > 0, 'Deveria detectar red flag');
  assert(
    flags.some(f => f.id === 'fever_high'),
    'Deveria detectar febre'
  );
  assert(
    flags.some(f => f.severity === 'high'),
    'Febre 38-39°C deveria ser high'
  );
  assert(riskLevel === 'high', 'Nível de risco deveria ser high');

  console.log('  Flags:', formatRedFlags(flags));
  console.log('  Risk:', riskLevel);
});

testCase('Universal - Sangramento ativo intenso', () => {
  const flags = detectRedFlags({
    surgeryType: 'hemorroidectomia',
    dayNumber: 4,
    painLevel: 6,
    urinaryRetention: false,
    bowelMovement: true,
    bleeding: 'severe',
    fever: false,
  });

  const riskLevel = getRiskLevel(flags);

  assert(flags.length > 0, 'Deveria detectar red flag');
  assert(
    flags.some(f => f.id === 'bleeding_severe'),
    'Deveria detectar sangramento severo'
  );
  assert(
    flags.some(f => f.severity === 'critical'),
    'Sangramento severo deveria ser critical'
  );
  assert(riskLevel === 'critical', 'Nível de risco deveria ser critical');

  console.log('  Flags:', formatRedFlags(flags));
  console.log('  Risk:', riskLevel);
});

testCase('Universal - Sangramento moderado prolongado (após D+3)', () => {
  const flags = detectRedFlags({
    surgeryType: 'fissura',
    dayNumber: 5,
    painLevel: 4,
    urinaryRetention: false,
    bowelMovement: true,
    bleeding: 'moderate',
    fever: false,
  });

  const riskLevel = getRiskLevel(flags);

  assert(flags.length > 0, 'Deveria detectar red flags');
  assert(
    flags.some(f => f.id === 'bleeding_moderate_prolonged' || f.id === 'bleeding_fissure'),
    'Deveria detectar sangramento prolongado ou bleeding_fissure'
  );
  assert(riskLevel === 'high', 'Nível de risco deveria ser high');

  console.log('  Flags:', formatRedFlags(flags));
  console.log('  Risk:', riskLevel);
});

// ============================================
// TESTES - CASOS COMPLEXOS
// ============================================

testCase('Caso Complexo - Múltiplos red flags críticos', () => {
  const flags = detectRedFlags({
    surgeryType: 'hemorroidectomia',
    dayNumber: 1,
    painLevel: 10,
    urinaryRetention: true,
    urinaryRetentionHours: 18,
    bowelMovement: false,
    bleeding: 'severe',
    fever: true,
    temperature: 39.5,
  });

  const riskLevel = getRiskLevel(flags);

  assert(flags.length >= 3, 'Deveria detectar múltiplos red flags');
  assert(
    flags.filter(f => f.severity === 'critical').length >= 2,
    'Deveria ter múltiplos flags critical'
  );
  assert(riskLevel === 'critical', 'Nível de risco deveria ser critical');

  console.log('  Flags:', formatRedFlags(flags));
  console.log('  Risk:', riskLevel);
  console.log(`  Total flags: ${flags.length}`);
  console.log(`  Critical flags: ${flags.filter(f => f.severity === 'critical').length}`);
});

// ============================================
// EXECUTAR TESTES
// ============================================

console.log('\n' + '='.repeat(60));
console.log('EXECUTANDO TESTES DO SISTEMA DE RED FLAGS');
console.log('='.repeat(60));

console.log('\n' + colors.yellow + 'HEMORROIDECTOMIA' + colors.reset);
// Testes já definidos acima serão executados

console.log('\n' + colors.yellow + 'FÍSTULA' + colors.reset);
// Testes já definidos acima serão executados

console.log('\n' + colors.yellow + 'FISSURA' + colors.reset);
// Testes já definidos acima serão executados

console.log('\n' + colors.yellow + 'PILONIDAL' + colors.reset);
// Testes já definidos acima serão executados

console.log('\n' + colors.yellow + 'RED FLAGS UNIVERSAIS' + colors.reset);
// Testes já definidos acima serão executados

console.log('\n' + colors.yellow + 'CASOS COMPLEXOS' + colors.reset);
// Testes já definidos acima serão executados

console.log('\n' + '='.repeat(60));
console.log('TESTES CONCLUÍDOS');
console.log('='.repeat(60) + '\n');

// Para executar: ts-node lib/red-flags.test.ts
