/**
 * Script para configurar cron jobs no cron-job.org
 *
 * Uso:
 * 1. Defina as variáveis de ambiente:
 *    - CRONJOB_ORG_API_KEY: Sua API key do cron-job.org
 *    - CRON_SECRET: O secret usado para autenticar os cron jobs
 *    - VERCEL_URL: URL base do seu app (ex: https://seu-app.vercel.app)
 *
 * 2. Execute: node scripts/setup-cronjob-org.js
 */

const CRONJOB_ORG_API_URL = 'https://api.cron-job.org';

// Configuração dos cron jobs
const cronJobs = [
  {
    title: 'Patient Reminder (4h sem resposta)',
    url: '/api/cron/send-patient-reminder',
    schedule: {
      // 17:00 UTC = 14:00 BRT (4h após follow-up das 10:00)
      hours: [17],
      mdays: [-1], // Todos os dias
      minutes: [0],
      months: [-1], // Todos os meses
      wdays: [-1], // Todos os dias da semana
    },
  },
  {
    title: 'Notify Doctor Unanswered (6h sem resposta)',
    url: '/api/cron/notify-doctor-unanswered',
    schedule: {
      // 19:00 UTC = 16:00 BRT (6h após follow-up das 10:00)
      hours: [19],
      mdays: [-1],
      minutes: [0],
      months: [-1],
      wdays: [-1],
    },
  },
];

async function createCronJob(apiKey, baseUrl, cronSecret, jobConfig) {
  const fullUrl = `${baseUrl}${jobConfig.url}`;

  const payload = {
    job: {
      url: fullUrl,
      title: jobConfig.title,
      enabled: true,
      saveResponses: true,
      schedule: jobConfig.schedule,
      requestMethod: 0, // GET
      extendedData: {
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
        },
      },
    },
  };

  try {
    const response = await fetch(`${CRONJOB_ORG_API_URL}/jobs`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create job: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log(`✅ Created: ${jobConfig.title}`);
    console.log(`   Job ID: ${result.jobId}`);
    console.log(`   URL: ${fullUrl}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to create ${jobConfig.title}:`, error.message);
    throw error;
  }
}

async function listCronJobs(apiKey) {
  try {
    const response = await fetch(`${CRONJOB_ORG_API_URL}/jobs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list jobs: ${response.status}`);
    }

    const result = await response.json();
    return result.jobs || [];
  } catch (error) {
    console.error('❌ Failed to list jobs:', error.message);
    return [];
  }
}

async function main() {
  const apiKey = process.env.CRONJOB_ORG_API_KEY;
  const cronSecret = process.env.CRON_SECRET;
  const baseUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL;

  if (!apiKey) {
    console.error('❌ CRONJOB_ORG_API_KEY não definida');
    console.log('\nPara obter sua API key:');
    console.log('1. Acesse https://cron-job.org');
    console.log('2. Faça login');
    console.log('3. Vá em Settings > API');
    console.log('4. Copie sua API key');
    console.log('\nDefina: set CRONJOB_ORG_API_KEY=sua_api_key');
    process.exit(1);
  }

  if (!cronSecret) {
    console.error('❌ CRON_SECRET não definida');
    console.log('Defina: set CRON_SECRET=seu_cron_secret');
    process.exit(1);
  }

  if (!baseUrl) {
    console.error('❌ VERCEL_URL não definida');
    console.log('Defina: set VERCEL_URL=https://seu-app.vercel.app');
    process.exit(1);
  }

  console.log('🔧 Configurando cron jobs no cron-job.org...\n');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`CRON_SECRET: ${cronSecret.substring(0, 4)}...`);
  console.log('');

  // Listar jobs existentes
  console.log('📋 Jobs existentes:');
  const existingJobs = await listCronJobs(apiKey);
  if (existingJobs.length === 0) {
    console.log('   Nenhum job encontrado\n');
  } else {
    existingJobs.forEach(job => {
      console.log(`   - ${job.title} (ID: ${job.jobId}) - ${job.enabled ? '✅ Ativo' : '❌ Inativo'}`);
    });
    console.log('');
  }

  // Criar novos jobs
  console.log('🚀 Criando novos cron jobs...\n');

  for (const jobConfig of cronJobs) {
    // Verificar se já existe
    const existing = existingJobs.find(j => j.title === jobConfig.title);
    if (existing) {
      console.log(`⏭️  Pulando ${jobConfig.title} (já existe - ID: ${existing.jobId})`);
      continue;
    }

    await createCronJob(apiKey, baseUrl, cronSecret, jobConfig);
  }

  console.log('\n✅ Configuração concluída!');
  console.log('\nAgenda dos cron jobs:');
  console.log('- Patient Reminder: 14:00 BRT (17:00 UTC)');
  console.log('- Notify Doctor: 16:00 BRT (19:00 UTC)');
}

main().catch(console.error);
