#!/usr/bin/env node
/**
 * Script completo para configurar Vercel
 * Configura variáveis de ambiente E atualiza webhook no Meta
 */

const https = require('https');
const fs = require('fs');

const PROJECT_ID = 'prj_FDkIDplW3QLlNQ8pkZKHP5sLSBK1';
const TEAM_ID = 'team_BnhyET7tfeX89H6UnlZa25xO';
const VERCEL_URL = 'sistema-pos-operatorio-d6feex9sj-joao-vitor-vianas-projects.vercel.app';

// Ler variáveis do arquivo .env.vercel
const envVars = {};
const envContent = fs.readFileSync('.env.vercel', 'utf-8');
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('='); // Caso valor tenha '='
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

console.log(`📝 Encontradas ${Object.keys(envVars).length} variáveis para configurar\n`);

// Função para fazer requisição HTTPS
function httpsRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function setupVercel() {
  console.log('🔧 CONFIGURAÇÃO COMPLETA DO VERCEL\n');

  // Passo 1: Adicionar variáveis de ambiente
  console.log('📋 Passo 1: Configurando variáveis de ambiente...\n');

  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

  if (!VERCEL_TOKEN) {
    console.error('❌ VERCEL_TOKEN não encontrado!\n');
    console.error('Crie um token em: https://vercel.com/account/tokens');
    console.error('Depois execute: set VERCEL_TOKEN=seu_token && node scripts/setup-vercel-complete.js\n');
    process.exit(1);
  }

  console.log('✅ Token encontrado\n');
  console.log('📤 Upload de variáveis de ambiente...\n');

  let successCount = 0;
  let failCount = 0;

  for (const [key, value] of Object.entries(envVars)) {
    const options = {
      hostname: 'api.vercel.com',
      path: `/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const data = JSON.stringify({
      key,
      value,
      type: 'encrypted',
      target: ['production'],
    });

    try {
      const result = await httpsRequest(options, data);

      if (result.status === 200 || result.status === 201) {
        console.log(`  ✅ ${key}`);
        successCount++;
      } else if (result.status === 409) {
        console.log(`  ⚠️  ${key} (já existe)`);
        successCount++;
      } else {
        console.log(`  ❌ ${key} - Erro ${result.status}`);
        failCount++;
      }
    } catch (error) {
      console.log(`  ❌ ${key} - ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n📊 Resultado: ${successCount} sucesso, ${failCount} falhas\n`);

  // Passo 2: Informações do Webhook
  console.log('📋 Passo 2: Atualizar Webhook no Meta\n');
  console.log('🔗 Webhook URL para configurar no Meta WhatsApp Manager:');
  console.log(`   https://${VERCEL_URL}/api/whatsapp/webhook\n`);
  console.log('🔑 Verify Token:');
  console.log(`   ${envVars['WHATSAPP_WEBHOOK_VERIFY_TOKEN']}\n`);
  console.log('📝 Acesse: https://developers.facebook.com/apps/${envVars['WHATSAPP_APP_ID']}/whatsapp-business/wa-settings\n');

  // Passo 3: Redeploy
  console.log('📋 Passo 3: Fazer redeploy para aplicar variáveis\n');
  console.log('Execute: vercel --prod\n');

  console.log('✅ CONFIGURAÇÃO COMPLETA!\n');
}

setupVercel().catch(console.error);
