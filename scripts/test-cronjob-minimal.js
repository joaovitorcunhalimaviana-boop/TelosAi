/**
 * Teste mínimo da API do Cron-job.org
 */

const CRONJOB_API_KEY = 'cuIEAaMgSewRdGf7s2BhOLTX0/4taYpgh/HCZKkMTx4=';
const CRON_SECRET = 'eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA=';

async function createMinimalJob() {
  const endpoint = 'https://api.cron-job.org/jobs';

  // Job mínimo conforme documentação
  const job = {
    job: {
      enabled: true,
      title: 'WhatsApp Follow-ups Test',
      url: 'https://proactive-rejoicing-production.up.railway.app/api/cron/send-followups',
      schedule: {
        timezone: 'America/Sao_Paulo',
        hours: [-1],  // Todas as horas
        mdays: [-1],  // Todos os dias do mês
        minutes: [0], // No minuto 0
        months: [-1], // Todos os meses
        wdays: [-1],  // Todos os dias da semana
      },
    },
  };

  console.log('Enviando:', JSON.stringify(job, null, 2));

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CRONJOB_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(job),
  });

  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', text);

  if (response.ok) {
    const result = JSON.parse(text);
    console.log('✅ Job criado! ID:', result.jobId);
  }
}

createMinimalJob().catch(console.error);
