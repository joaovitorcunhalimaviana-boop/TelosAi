/**
 * Script para configurar cron jobs no cron-job.org
 *
 * Uso:
 * 1. Defina as variáveis de ambiente:
 *    - CRONJOB_ORG_API_KEY: Sua API key do cron-job.org
 *    - CRON_SECRET: O secret usado para autenticar os cron jobs
 *    - VERCEL_URL: URL base do seu app (ex: https://sistema-pos-operatorio.vercel.app)
 *
 * 2. Execute: node scripts/setup-cronjob-org.js
 */

const CRONJOB_ORG_API_URL = 'https://api.cron-job.org';

// Configuração dos cron jobs - ATUALIZADO com novos lembretes
const cronJobs = [
  {
    title: 'Follow-ups 10h BRT',
    url: '/api/cron/unified',
    schedule: {
      // 13:00 UTC = 10:00 BRT
      hours: [13],
      mdays: [-1],
      minutes: [0],
      months: [-1],
      wdays: [-1],
    },
  },
  {
    title: 'Lembrete 14h BRT',
    url: '/api/cron/unified',
    schedule: {
      // 17:00 UTC = 14:00 BRT
      hours: [17],
      mdays: [-1],
      minutes: [0],
      months: [-1],
      wdays: [-1],
    },
  },
  {
    title: 'Lembrete 18h BRT',
    url: '/api/cron/unified',
    schedule: {
      // 21:00 UTC = 18:00 BRT
      hours: [21],
      mdays: [-1],
      minutes: [0],
      months: [-1],
      wdays: [-1],
    },
  },
  {
    title: 'Notificar Medico 19h BRT',
    url: '/api/cron/unified',
    schedule: {
      // 22:00 UTC = 19:00 BRT
      hours: [22],
      mdays: [-1],
      minutes: [0],
      months: [-1],
      wdays: [-1],
    },
  },
  {
    title: 'Manutencao 0h BRT',
    url: '/api/cron/daily-tasks',
    schedule: {
      // 03:00 UTC = 00:00 BRT
      hours: [3],
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

async function deleteCronJob(apiKey, jobId) {
  try {
    const response = await fetch(`${CRONJOB_ORG_API_URL}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete job: ${response.status}`);
    }

    console.log(`🗑️  Deleted job ID: ${jobId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete job ${jobId}:`, error.message);
    return false;
  }
}

async function main() {
  const apiKey = process.env.CRONJOB_ORG_API_KEY;
  const cronSecret = process.env.CRON_SECRET;
  const baseUrl = process.env.VERCEL_URL || 'https://sistema-pos-operatorio.vercel.app';

  if (!apiKey) {
    console.error('❌ CRONJOB_ORG_API_KEY não definida');
    console.log('\nPara obter sua API key:');
    console.log('1. Acesse https://console.cron-job.org/settings');
    console.log('2. Vá em API');
    console.log('3. Copie sua API key');
    console.log('\nDefina: set CRONJOB_ORG_API_KEY=sua_api_key');
    process.exit(1);
  }

  if (!cronSecret) {
    console.error('❌ CRON_SECRET não definida');
    console.log('Defina: set CRON_SECRET=seu_cron_secret');
    process.exit(1);
  }

  console.log('🔧 Configurando cron jobs no cron-job.org...\n');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`CRON_SECRET: ${cronSecret.substring(0, 8)}...`);
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

  // Perguntar se deve deletar jobs antigos
  const deleteOld = process.argv.includes('--clean');
  if (deleteOld && existingJobs.length > 0) {
    console.log('🗑️  Deletando jobs antigos...\n');
    for (const job of existingJobs) {
      await deleteCronJob(apiKey, job.jobId);
    }
    console.log('');
  }

  // Criar novos jobs
  console.log('🚀 Criando novos cron jobs...\n');

  for (const jobConfig of cronJobs) {
    // Verificar se já existe (pelo título)
    const existing = existingJobs.find(j => j.title === jobConfig.title);
    if (existing && !deleteOld) {
      console.log(`⏭️  Pulando ${jobConfig.title} (já existe - ID: ${existing.jobId})`);
      continue;
    }

    try {
      await createCronJob(apiKey, baseUrl, cronSecret, jobConfig);
    } catch (e) {
      // Continuar mesmo se um falhar
    }
  }

  console.log('\n✅ Configuração concluída!');
  console.log('\nAgenda dos cron jobs (horário de Brasília):');
  console.log('- Follow-ups: 10:00');
  console.log('- Lembrete 1: 14:00');
  console.log('- Lembrete 2: 18:00');
  console.log('- Notificar médico: 19:00');
  console.log('- Manutenção: 00:00');
}

main().catch(console.error);
