/**
 * Script para configurar variáveis de ambiente no Railway via API
 *
 * Uso:
 * node scripts/configure-railway.js
 */

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN || 'b61568ea-ff46-4cd7-9111-b7dd42fcda1d';
const PROJECT_ID = '83b9a90d-f379-4838-a4fe-3c5295a84d98';
const SERVICE_ID = '9a6a64f3-0ab6-4038-9d04-43a730f28676';
const ENVIRONMENT_ID = '58579838-5a4a-402c-ae75-2190fa60177e';

// Variáveis para configurar
const VARIABLES = {
  WHATSAPP_APP_ID: '1352351593037143',
  WHATSAPP_APP_SECRET: 'f8788e99231afa0bbb84685c4bea4924',
  WHATSAPP_ACCESS_TOKEN: 'EAATN9ORQfVcBPxMLivSMuo5mZBR2H3g1MKNNQ3lAOK6fvNYZBaGB1oZAXfzvn37JICEcl16tRFggRsIP9tMXMZBZBt4GOu5wntLz1YhOB2LPF0w6ZBxjDViGXmLv2WFlTZANpDMwmglh0LYnflzVr3Tkd0FtLfCFhKmYCAo7nu5MivEXLTj7ZBkVpYrgIqwZB',
  WHATSAPP_PHONE_NUMBER_ID: '866244236573219',
  WHATSAPP_BUSINESS_ACCOUNT_ID: '4331043357171950',
  WHATSAPP_VERIFY_TOKEN: 'meu-token-super-secreto-2024',
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: 'meu-token-super-secreto-2024',
  DOCTOR_PHONE_NUMBER: '5583991664904',
  CRON_SECRET: '', // Será gerado se vazio
};

async function setRailwayVariables() {
  console.log('🚂 Configurando variáveis no Railway...\n');

  // Gerar CRON_SECRET se não existir
  if (!VARIABLES.CRON_SECRET) {
    VARIABLES.CRON_SECRET = generateSecureToken();
    console.log('🔐 CRON_SECRET gerado:', VARIABLES.CRON_SECRET);
    console.log('⚠️  IMPORTANTE: Salve este token! Você vai precisar dele no Cron-job.org\n');
  }

  const endpoint = 'https://backboard.railway.com/graphql/v2';

  // Mutation para criar/atualizar variáveis
  const mutation = `
    mutation UpsertVariables($input: VariableUpsertInput!) {
      variableUpsert(input: $input)
    }
  `;

  try {
    for (const [key, value] of Object.entries(VARIABLES)) {
      console.log(`📝 Configurando ${key}...`);

      const variables = {
        input: {
          projectId: PROJECT_ID,
          environmentId: ENVIRONMENT_ID,
          serviceId: SERVICE_ID,
          name: key,
          value: value,
        },
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RAILWAY_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Erro ao configurar ${key}:`, error);
        continue;
      }

      const result = await response.json();

      if (result.errors) {
        console.error(`❌ Erro GraphQL para ${key}:`, result.errors);
        continue;
      }

      console.log(`✅ ${key} configurado com sucesso`);
    }

    console.log('\n🎉 Todas as variáveis foram configuradas!');
    console.log('\n📋 Próximos passos:');
    console.log('1. O Railway vai fazer redeploy automático');
    console.log('2. Use o CRON_SECRET acima para configurar o Cron-job.org');
    console.log('3. Execute: node scripts/configure-cronjob.js\n');

  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

function generateSecureToken() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('base64');
}

// Executar se chamado diretamente
if (require.main === module) {
  if (RAILWAY_TOKEN === 'COLE_SEU_TOKEN_AQUI') {
    console.error('❌ Por favor, configure RAILWAY_TOKEN no arquivo ou como variável de ambiente');
    console.log('\nOpção 1: Edite o arquivo e cole seu token');
    console.log('Opção 2: Execute: set RAILWAY_TOKEN=seu_token && node scripts/configure-railway.js');
    process.exit(1);
  }

  setRailwayVariables();
}

module.exports = { setRailwayVariables, VARIABLES };
