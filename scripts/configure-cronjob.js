/**
 * Script para configurar cron jobs no Cron-job.org via API
 *
 * Primeiro, obtenha sua API key:
 * 1. Acesse: https://console.cron-job.org/settings
 * 2. Vá em "API" > "Create API Key"
 * 3. Copie a chave
 *
 * Uso:
 * node scripts/configure-cronjob.js
 */

const CRONJOB_API_KEY = process.env.CRONJOB_API_KEY || 'cuIEAaMgSewRdGf7s2BhOLTX0/4taYpgh/HCZKkMTx4=';
const RAILWAY_APP_URL = 'https://proactive-rejoicing-production.up.railway.app';
const CRON_SECRET = process.env.CRON_SECRET || 'eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA='; // Gerado pelo script anterior

// Definição dos cron jobs
const CRON_JOBS = [
  {
    title: 'WhatsApp Follow-ups Diários',
    url: `${RAILWAY_APP_URL}/api/cron/send-followups`,
    enabled: true,
    saveResponses: true,
    schedule: {
      timezone: 'America/Sao_Paulo',
      hours: [10], // 10h da manhã
      mdays: [-1], // Todos os dias do mês
      minutes: [0],
      months: [-1], // Todos os meses
      wdays: [-1], // Todos os dias da semana
    },
    requestTimeout: 30,
    requestMethod: 1, // GET
    auth: {
      enable: false,
    },
    notification: {
      onFailure: true,
      onSuccess: false,
      onDisable: true,
    },
    extendedData: {
      headers: [
        {
          key: 'Authorization',
          value: `Bearer ${CRON_SECRET}`,
        },
      ],
    },
  },
  {
    title: 'Renovação Token WhatsApp (50 dias)',
    url: `${RAILWAY_APP_URL}/api/cron/renew-whatsapp-token`,
    enabled: true,
    saveResponses: true,
    schedule: {
      timezone: 'America/Sao_Paulo',
      // Executar a cada 50 dias (configuração aproximada)
      // Como não há suporte nativo para "a cada 50 dias",
      // vamos configurar manualmente após criar
      hours: [0], // Meia-noite
      mdays: [1], // Primeiro dia do mês (ajustar manualmente depois)
      minutes: [0],
      months: [-1],
      wdays: [-1],
    },
    requestTimeout: 30,
    requestMethod: 0, // POST
    auth: {
      enable: false,
    },
    notification: {
      onFailure: true,
      onSuccess: true, // Notificar sucesso para este
      onDisable: true,
    },
    extendedData: {
      headers: [
        {
          key: 'Authorization',
          value: `Bearer ${CRON_SECRET}`,
        },
      ],
    },
  },
];

async function createCronJobs() {
  console.log('⏰ Configurando cron jobs no Cron-job.org...\n');

  if (!CRON_SECRET) {
    console.error('❌ CRON_SECRET não encontrado!');
    console.log('Execute primeiro: node scripts/configure-railway.js');
    process.exit(1);
  }

  const endpoint = 'https://api.cron-job.org/jobs';

  try {
    for (const job of CRON_JOBS) {
      console.log(`📝 Criando: ${job.title}...`);

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${CRONJOB_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error(`❌ Erro ao criar ${job.title}:`);
        console.error(`Status: ${response.status}`);
        console.error(`Response:`, responseText);
        continue;
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error(`❌ Erro ao parsear resposta:`, responseText);
        continue;
      }
      console.log(`✅ ${job.title} criado! ID: ${result.jobId}`);

      if (job.title.includes('50 dias')) {
        console.log(`⚠️  ATENÇÃO: Configure manualmente para executar a cada 50 dias`);
        console.log(`   Job ID: ${result.jobId}`);
        console.log(`   URL: https://console.cron-job.org/jobs/${result.jobId}/edit`);
      }
    }

    console.log('\n🎉 Cron jobs configurados com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Acesse: https://console.cron-job.org/dashboard');
    console.log('2. Verifique os jobs criados');
    console.log('3. Ajuste o job de renovação para executar a cada 50 dias');
    console.log('4. Teste executando manualmente (botão ▶️ Run now)\n');

  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  if (CRONJOB_API_KEY === 'COLE_SUA_API_KEY_AQUI') {
    console.error('❌ Por favor, obtenha sua API key do Cron-job.org');
    console.log('\nPasso a passo:');
    console.log('1. Acesse: https://console.cron-job.org/settings');
    console.log('2. Vá na aba "API"');
    console.log('3. Clique em "Create API Key"');
    console.log('4. Copie a chave e configure no script ou variável de ambiente');
    console.log('\nOpção 1: Edite o arquivo e cole a API key');
    console.log('Opção 2: Execute: set CRONJOB_API_KEY=sua_key && node scripts/configure-cronjob.js\n');
    process.exit(1);
  }

  createCronJobs();
}

module.exports = { createCronJobs };
