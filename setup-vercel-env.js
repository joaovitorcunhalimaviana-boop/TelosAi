#!/usr/bin/env node

/**
 * Script para configurar variáveis de ambiente no Vercel via API
 * Uso: node setup-vercel-env.js
 */

const https = require('https');
const { execSync } = require('child_process');

// Variáveis de ambiente a serem configuradas
const envVars = {
  ANTHROPIC_API_KEY: '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',
  AUTH_SECRET: '7lBvFRYgEcVpCiELM1zcfh1JmZG4/WhbLRfgAlSmznM=',
  AUTH_URL: 'https://sistema-pos-operatorio-kjiivyow4-joao-vitor-vianas-projects.vercel.app',
  CRON_SECRET: 'eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA=',
  DATABASE_URL: 'postgresql://neondb_owner:npg_F9Kb4mPoVtcB@ep-royal-voice-ae6ov58i-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require',
  DOCTOR_PHONE_NUMBER: '5583991664904',
  NEXTAUTH_SECRET: '7lBvFRYgEcVpCiELM1zcfh1JmZG4/WhbLRfgAlSmznM=',
  NEXTAUTH_URL: 'https://sistema-pos-operatorio-kjiivyow4-joao-vitor-vianas-projects.vercel.app',
  WHATSAPP_ACCESS_TOKEN: 'EAATN9ORQfVcBPxMLivSMuo5mZBR2H3g1MKNNQ3lAOK6fvNYZBaGB1oZAXfzvn37JICEcl16tRFggRsIP9tMXMZBZBt4GOu5wntLz1YhOB2LPF0w6ZBxjDViGXmLv2WFlTZANpDMwmglh0LYnflzVr3Tkd0FtLfCFhKmYCAo7nu5MivEXLTj7ZBkVpYrgIqwZB',
  WHATSAPP_APP_ID: '1352351593037143',
  WHATSAPP_APP_SECRET: 'f8788e99231afa0bbb84685c4bea4924',
  WHATSAPP_BUSINESS_ACCOUNT_ID: '4331043357171950',
  WHATSAPP_PHONE_NUMBER_ID: '866244236573219',
  WHATSAPP_VERIFY_TOKEN: 'meu-token-super-secreto-2024',
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: 'meu-token-super-secreto-2024',
  RESEARCH_PSEUDONYM_SALT: 'f1668d9cfdf515ffb56fc3fde839244123b64ca042a58f8bef8a332d1cc208ef',
  RESEND_API_KEY: 're_placeholder_key'
};

// Função para obter o token do Vercel
function getVercelToken() {
  try {
    const fs = require('fs');
    let configPath;

    // Tentar múltiplos caminhos possíveis
    const possiblePaths = [
      `${process.env.APPDATA}\\com.vercel.cli\\Data\\auth.json`,
      `${process.env.USERPROFILE}\\.vercel\\auth.json`,
      `${process.env.HOME}/.vercel/auth.json`
    ];

    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        configPath = path;
        break;
      }
    }

    if (!configPath) {
      throw new Error('Arquivo de autenticação não encontrado');
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config.token;
  } catch (error) {
    console.error('❌ Erro ao obter token do Vercel:', error.message);
    console.log('💡 Execute: vercel login');
    process.exit(1);
  }
}

// Função para fazer requisição HTTPS
function httpsRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: body ? JSON.parse(body) : {}
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Função para obter informações do projeto
async function getProjectInfo(token) {
  const options = {
    hostname: 'api.vercel.com',
    path: '/v9/projects/sistema-pos-operatorio',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const response = await httpsRequest(options);

  if (response.statusCode !== 200) {
    throw new Error(`Erro ao obter projeto: ${JSON.stringify(response.body)}`);
  }

  return response.body;
}

// Função para adicionar variável de ambiente
async function addEnvVar(token, projectId, key, value) {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v10/projects/${projectId}/env`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const data = {
    key: key,
    value: value,
    type: 'encrypted',
    target: ['production']
  };

  const response = await httpsRequest(options, data);

  return response;
}

// Função principal
async function main() {
  console.log('🚀 Iniciando configuração de variáveis de ambiente no Vercel...\n');

  // Obter token
  const token = getVercelToken();
  console.log('✅ Token do Vercel obtido com sucesso\n');

  // Obter informações do projeto
  console.log('📦 Obtendo informações do projeto...');
  const project = await getProjectInfo(token);
  console.log(`✅ Projeto encontrado: ${project.name} (ID: ${project.id})\n`);

  // Adicionar variáveis
  const total = Object.keys(envVars).length;
  let count = 0;
  let success = 0;
  let skipped = 0;
  let errors = 0;

  console.log(`📝 Adicionando ${total} variáveis de ambiente...\n`);

  for (const [key, value] of Object.entries(envVars)) {
    count++;
    process.stdout.write(`[${count}/${total}] ${key}... `);

    try {
      const response = await addEnvVar(token, project.id, key, value);

      if (response.statusCode === 200 || response.statusCode === 201) {
        console.log('✅');
        success++;
      } else if (response.statusCode === 409) {
        console.log('⚠️  (já existe)');
        skipped++;
      } else {
        console.log(`❌ (${response.statusCode})`);
        if (response.body.error) {
          console.log(`   Erro: ${response.body.error.message}`);
        }
        errors++;
      }
    } catch (error) {
      console.log(`❌ (${error.message})`);
      errors++;
    }

    // Pequeno delay para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Resumo
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO:');
  console.log(`   ✅ Adicionadas: ${success}`);
  console.log(`   ⚠️  Já existiam: ${skipped}`);
  console.log(`   ❌ Erros: ${errors}`);
  console.log(`   📝 Total: ${total}`);
  console.log('='.repeat(60) + '\n');

  if (success > 0 || skipped === total) {
    console.log('✅ Configuração concluída com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Verificar variáveis: vercel env ls production');
    console.log('   2. Fazer redeploy: vercel --prod\n');
  } else {
    console.log('⚠️  Configuração concluída com erros');
    console.log('   Verifique os erros acima e tente novamente\n');
  }
}

// Executar
main().catch(error => {
  console.error('\n❌ Erro fatal:', error.message);
  process.exit(1);
});
