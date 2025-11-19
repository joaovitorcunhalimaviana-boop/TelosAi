/**
 * Script para desabilitar Deployment Protection no Vercel via API
 *
 * Uso:
 * 1. Crie um token em: https://vercel.com/account/tokens
 * 2. Execute: VERCEL_TOKEN=seu_token node scripts/disable-vercel-protection.js
 */

const https = require('https');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = 'prj_FDkIDplW3QLlNQ8pkZKHP5sLSBK1';
const TEAM_ID = 'team_BnhyET7tfeX89H6UnlZa25xO';

if (!VERCEL_TOKEN) {
  console.error('❌ VERCEL_TOKEN não encontrado!');
  console.error('\n📝 Siga estes passos:');
  console.error('1. Crie um token em: https://vercel.com/account/tokens');
  console.error('2. Execute: set VERCEL_TOKEN=seu_token && node scripts/disable-vercel-protection.js');
  process.exit(1);
}

const options = {
  hostname: 'api.vercel.com',
  path: `/v9/projects/${PROJECT_ID}?teamId=${TEAM_ID}`,
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${VERCEL_TOKEN}`,
    'Content-Type': 'application/json',
  },
};

const data = JSON.stringify({
  protectionBypass: {
    createdAt: Math.floor(Date.now() / 1000),
    scope: 'shareable-links'
  },
  ssoProtection: {
    deploymentType: 'none'
  }
});

console.log('🔧 Desabilitando Deployment Protection no Vercel...\n');

const req = https.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Deployment Protection DESABILITADA!\n');
      console.log('🎯 Agora você pode atualizar o webhook no Meta:\n');
      console.log('Webhook URL: https://sistema-pos-operatorio-d6feex9sj-joao-vitor-vianas-projects.vercel.app/api/whatsapp/webhook\n');
    } else if (res.statusCode === 403) {
      console.error('❌ Erro 403 - Token sem permissão');
      console.error('\n📝 Certifique-se de que o token tem permissão de escrita no projeto');
      console.error('1. Delete o token antigo em: https://vercel.com/account/tokens');
      console.error('2. Crie um NOVO token com escopo "Full Account"');
    } else {
      console.error(`❌ Erro ${res.statusCode}:`);
      try {
        const response = JSON.parse(body);
        console.error(response);
      } catch (e) {
        console.error(body);
      }
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na requisição:', error.message);
});

req.write(data);
req.end();
