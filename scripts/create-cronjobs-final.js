/**
 * Script final para criar cron jobs no Cron-job.org
 */

const CRONJOB_API_KEY = 'cuIEAaMgSewRdGf7s2BhOLTX0/4taYpgh/HCZKkMTx4=';
const CRON_SECRET = 'eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA=';
const RAILWAY_URL = 'https://proactive-rejoicing-production.up.railway.app';

async function createCronJob(config) {
  const endpoint = 'https://api.cron-job.org/jobs';

  console.log(`\n📝 Criando: ${config.title}...`);

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CRONJOB_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  const text = await response.text();

  if (!response.ok) {
    console.error(`❌ Erro (${response.status}):`, text);
    return null;
  }

  const result = JSON.parse(text);
  console.log(`✅ Job criado! ID: ${result.jobId}`);
  console.log(`   URL: https://console.cron-job.org/jobs/${result.jobId}/edit`);

  return result.jobId;
}

async function main() {
  console.log('⏰ Configurando cron jobs no Cron-job.org...');
  console.log(`🔐 CRON_SECRET: ${CRON_SECRET}\n`);

  // Job 1: Follow-ups Diários (10h da manhã)
  const job1Id = await createCronJob({
    job: {
      enabled: true,
      title: 'WhatsApp Follow-ups Diários - 10h BRT',
      url: `${RAILWAY_URL}/api/cron/send-followups`,
      schedule: {
        timezone: 'America/Sao_Paulo',
        hours: [10],   // 10h da manhã
        mdays: [-1],   // Todos os dias
        minutes: [0],  // No minuto 0
        months: [-1],  // Todos os meses
        wdays: [-1],   // Todos os dias da semana
      },
      requestMethod: 1, // GET
      extendedData: {
        headers: [{
          name: 'Authorization',
          value: `Bearer ${CRON_SECRET}`,
        }],
      },
    },
  });

  // Job 2: Renovação Token (Diário às 00h - ajustar depois para 50 dias)
  const job2Id = await createCronJob({
    job: {
      enabled: false, // Desabilitado inicialmente - você vai configurar manualmente
      title: 'Renovação Token WhatsApp - CONFIGURAR PARA 50 DIAS',
      url: `${RAILWAY_URL}/api/cron/renew-whatsapp-token`,
      schedule: {
        timezone: 'America/Sao_Paulo',
        hours: [0],    // Meia-noite
        mdays: [1],    // Dia 1 de cada mês (você vai ajustar)
        minutes: [0],
        months: [-1],
        wdays: [-1],
      },
      requestMethod: 0, // POST
      extendedData: {
        headers: [{
          name: 'Authorization',
          value: `Bearer ${CRON_SECRET}`,
        }],
      },
    },
  });

  console.log('\n🎉 Cron jobs criados com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Acesse: https://console.cron-job.org/dashboard');
  console.log('2. Teste o job de Follow-ups (clique em ▶️ Run now)');
  console.log(`3. Configure o job ${job2Id} para executar a cada 50 dias:`);
  console.log('   - Edite o job');
  console.log('   - Ative o job (Enable)');
  console.log('   - Configure schedule personalizado');
  console.log('   - Próxima execução: 08/01/2025 (50 dias após hoje)');
  console.log('\n✅ CRON_SECRET configurado nos headers dos jobs');
  console.log('✅ Railway já tem todas as variáveis configuradas\n');
}

main().catch(console.error);
