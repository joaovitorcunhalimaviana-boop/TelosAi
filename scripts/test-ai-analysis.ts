/**
 * Script de Teste - Análise de IA para Follow-ups
 * Testa análise Claude AI para cada tipo de cirurgia
 *
 * Como executar:
 * npx tsx scripts/test-ai-analysis.ts
 */

import { analyzeFollowUpResponse, type FollowUpAnalysisParams } from '../lib/follow-up-analyzer';
import { SURGERY_TYPES } from '../lib/surgery-templates';

// ============================================
// CASOS DE TESTE
// ============================================

/**
 * TESTE 1: Hemorroidectomia D+2 - NORMAL
 */
const hemorroidectomiaNormal: FollowUpAnalysisParams = {
  surgeryType: SURGERY_TYPES.HEMORROIDECTOMIA,
  dayNumber: 2,
  patientName: 'João Silva',
  patientAge: 45,
  hasComorbidities: false,
  answers: {
    dor: '7',
    sangramento: 'Leve',
    evacuacao: 'Com dificuldade',
    febre: false,
    temperatura: '',
    medicacoes: 'Sim, todas',
    prolapso: false,
    retencao_urinaria: true, // Conseguiu urinar
    incontinencia_fecal: 'Não',
    dor_evacuacao: '8',
    observacoes: 'Primeira evacuação hoje, foi dolorosa mas consegui',
  },
};

/**
 * TESTE 2: Hemorroidectomia D+1 - URGENTE (Retenção Urinária)
 */
const hemorroidectomiaUrgente: FollowUpAnalysisParams = {
  surgeryType: SURGERY_TYPES.HEMORROIDECTOMIA,
  dayNumber: 1,
  patientName: 'Maria Santos',
  patientAge: 52,
  hasComorbidities: true,
  answers: {
    dor: '9',
    sangramento: 'Moderado',
    evacuacao: 'Não',
    febre: false,
    temperatura: '',
    medicacoes: 'Sim, todas',
    prolapso: false,
    retencao_urinaria: false, // NÃO conseguiu urinar
    horas_sem_urinar: '8', // RED FLAG
    incontinencia_fecal: 'Não',
    observacoes: 'Muita dor e não consigo urinar',
  },
};

/**
 * TESTE 3: Fistulotomia D+5 - ATENÇÃO (Drenagem aumentada)
 */
const fistulaAtencao: FollowUpAnalysisParams = {
  surgeryType: SURGERY_TYPES.FISTULOTOMIA,
  dayNumber: 5,
  patientName: 'Carlos Oliveira',
  patientAge: 38,
  hasComorbidities: false,
  answers: {
    dor: '5',
    sangramento: 'Não',
    evacuacao: 'Sim',
    febre: false,
    temperatura: '',
    medicacoes: 'Sim, todas',
    drenagem_secrecao: 'Moderada',
    odor_fetido: false,
    incontinencia_fecal: 'Não',
    tipo_secrecao: 'Amarelada',
    observacoes: 'Drenagem aumentou nos últimos dias',
  },
};

/**
 * TESTE 4: Fistulotomia D+3 - EMERGÊNCIA (Infecção)
 */
const fistulaEmergencia: FollowUpAnalysisParams = {
  surgeryType: SURGERY_TYPES.FISTULOTOMIA,
  dayNumber: 3,
  patientName: 'Ana Costa',
  patientAge: 41,
  hasComorbidities: false,
  answers: {
    dor: '8',
    sangramento: 'Leve',
    evacuacao: 'Com dificuldade',
    febre: true,
    temperatura: '38.7', // RED FLAG
    medicacoes: 'Sim, todas',
    drenagem_secrecao: 'Intensa', // RED FLAG
    odor_fetido: true, // RED FLAG
    incontinencia_fecal: 'Não',
    tipo_secrecao: 'Purulenta (pus)', // RED FLAG
    observacoes: 'Muita dor, febre, e saindo bastante secreção com cheiro ruim',
  },
};

/**
 * TESTE 5: Fissurectomia D+7 - NORMAL
 */
const fissuraNormal: FollowUpAnalysisParams = {
  surgeryType: SURGERY_TYPES.FISSURECTOMIA,
  dayNumber: 7,
  patientName: 'Pedro Almeida',
  patientAge: 35,
  hasComorbidities: false,
  answers: {
    dor: '3',
    sangramento: 'Não',
    evacuacao: 'Sim',
    febre: false,
    temperatura: '',
    medicacoes: 'Sim, todas',
    dor_evacuacao: '4',
    sangramento_evacuacao: false,
    espasmo_anal: 'Leve',
    constipacao: 'Não',
    duracao_dor: 'Menos de 1 hora',
    observacoes: 'Melhorando bem, dor diminuindo a cada dia',
  },
};

/**
 * TESTE 6: Fissurectomia D+4 - URGENTE (Constipação severa)
 */
const fissuraUrgente: FollowUpAnalysisParams = {
  surgeryType: SURGERY_TYPES.FISSURECTOMIA,
  dayNumber: 4,
  patientName: 'Lucia Ferreira',
  patientAge: 48,
  hasComorbidities: false,
  answers: {
    dor: '8',
    sangramento: 'Não',
    evacuacao: 'Não', // RED FLAG
    febre: false,
    temperatura: '',
    medicacoes: 'Parcialmente',
    dor_evacuacao: '10',
    sangramento_evacuacao: false,
    espasmo_anal: 'Severo', // RED FLAG
    constipacao: 'Severa - não evacuou há 3+ dias', // RED FLAG
    observacoes: 'Não consigo evacuar há 4 dias, muita dor',
  },
};

/**
 * TESTE 7: Cisto Pilonidal D+3 - NORMAL
 */
const pilonidalNormal: FollowUpAnalysisParams = {
  surgeryType: SURGERY_TYPES.CISTO_PILONIDAL,
  dayNumber: 3,
  patientName: 'Roberto Lima',
  patientAge: 28,
  hasComorbidities: false,
  answers: {
    dor: '5',
    sangramento: 'Não',
    evacuacao: 'Sim',
    febre: false,
    temperatura: '',
    medicacoes: 'Sim, todas',
    drenagem_secrecao: 'Leve',
    edema: 'Leve',
    hiperemia: 'Leve',
    odor_fetido: false,
    deiscencia_sutura: 'Não, pontos intactos',
    calor_local: false,
    posicao_conforto: 'Com leve desconforto',
    observacoes: 'Cicatrizando bem',
  },
};

/**
 * TESTE 8: Cisto Pilonidal D+5 - URGENTE (Deiscência + Infecção)
 */
const pilonidalUrgente: FollowUpAnalysisParams = {
  surgeryType: SURGERY_TYPES.CISTO_PILONIDAL,
  dayNumber: 5,
  patientName: 'Fernanda Souza',
  patientAge: 32,
  hasComorbidities: false,
  answers: {
    dor: '7',
    sangramento: 'Moderado',
    evacuacao: 'Sim',
    febre: true,
    temperatura: '38.2', // RED FLAG
    medicacoes: 'Sim, todas',
    drenagem_secrecao: 'Intensa', // RED FLAG
    edema: 'Severo', // RED FLAG
    hiperemia: 'Severa', // RED FLAG
    odor_fetido: true, // RED FLAG
    deiscencia_sutura: 'Sim, parcialmente', // RED FLAG
    calor_local: true, // RED FLAG
    posicao_conforto: 'Não consigo sentar',
    observacoes: 'Os pontos abriram, saindo secreção, vermelho e quente',
  },
};

// ============================================
// EXECUTOR DE TESTES
// ============================================

async function runTest(testName: string, params: FollowUpAnalysisParams) {
  console.log('\n' + '='.repeat(80));
  console.log(`TESTE: ${testName}`);
  console.log('='.repeat(80));
  console.log(`Paciente: ${params.patientName}`);
  console.log(`Cirurgia: ${params.surgeryType}`);
  console.log(`Dia: D+${params.dayNumber}`);
  console.log('\nRespostas:');
  console.log(JSON.stringify(params.answers, null, 2));

  try {
    console.log('\n🤖 Analisando com Claude AI...\n');
    const startTime = Date.now();

    const analysis = await analyzeFollowUpResponse(params);

    const duration = Date.now() - startTime;

    console.log('✅ Análise completa!\n');
    console.log(`⏱️  Tempo: ${duration}ms\n`);
    console.log('📊 RESULTADO:');
    console.log('─'.repeat(80));
    console.log(`Status: ${analysis.status}`);
    console.log(`Nível de Risco: ${analysis.riskLevel}`);
    console.log(`Alertar Médico: ${analysis.alertarMedico ? 'SIM' : 'NÃO'}`);
    console.log(`Urgência: ${analysis.urgencia}`);

    if (analysis.redFlags.length > 0) {
      console.log(`\n🚩 Red Flags (${analysis.redFlags.length}):`);
      analysis.redFlags.forEach((flag, i) => {
        console.log(`   ${i + 1}. ${flag}`);
      });
    }

    console.log('\n📋 Análise:');
    console.log(analysis.analise);

    if (analysis.recomendacoes.length > 0) {
      console.log('\n💡 Recomendações:');
      analysis.recomendacoes.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }

    console.log('\n💬 Resposta ao Paciente:');
    console.log('─'.repeat(80));
    console.log(analysis.respostaEmpática);
    console.log('─'.repeat(80));

    return { success: true, analysis };
  } catch (error) {
    console.error('\n❌ Erro no teste:', error);
    return { success: false, error };
  }
}

async function runAllTests() {
  console.log('\n🧪 INICIANDO TESTES DE ANÁLISE DE IA\n');
  console.log('Testando 4 cirurgias com cenários NORMAL, ATENÇÃO, URGENTE e EMERGÊNCIA\n');

  const tests = [
    { name: 'Hemorroidectomia D+2 - NORMAL', params: hemorroidectomiaNormal },
    { name: 'Hemorroidectomia D+1 - URGENTE (Retenção)', params: hemorroidectomiaUrgente },
    { name: 'Fistulotomia D+5 - ATENÇÃO', params: fistulaAtencao },
    { name: 'Fistulotomia D+3 - EMERGÊNCIA (Infecção)', params: fistulaEmergencia },
    { name: 'Fissurectomia D+7 - NORMAL', params: fissuraNormal },
    { name: 'Fissurectomia D+4 - URGENTE (Constipação)', params: fissuraUrgente },
    { name: 'Cisto Pilonidal D+3 - NORMAL', params: pilonidalNormal },
    { name: 'Cisto Pilonidal D+5 - URGENTE (Deiscência)', params: pilonidalUrgente },
  ];

  const results = [];

  for (const test of tests) {
    const result = await runTest(test.name, test.params);
    results.push({ ...test, result });

    // Pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Resumo final
  console.log('\n\n' + '='.repeat(80));
  console.log('📈 RESUMO DOS TESTES');
  console.log('='.repeat(80));

  const successful = results.filter(r => r.result.success).length;
  const failed = results.filter(r => !r.result.success).length;

  console.log(`\n✅ Sucesso: ${successful}/${tests.length}`);
  console.log(`❌ Falhas: ${failed}/${tests.length}`);

  console.log('\n📊 Distribuição por Status:');
  const statusCount: Record<string, number> = {};
  results.forEach(r => {
    if (r.result.success) {
      const status = r.result.analysis?.status || 'UNKNOWN';
      statusCount[status] = (statusCount[status] || 0) + 1;
    }
  });

  Object.entries(statusCount).forEach(([status, count]) => {
    console.log(`   ${status}: ${count}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('✨ TESTES CONCLUÍDOS\n');
}

// Executar testes
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests, runTest };
