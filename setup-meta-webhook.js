#!/usr/bin/env node

/**
 * Script para configurar webhook no Meta/Facebook via API
 * Uso: node setup-meta-webhook.js
 */

const https = require('https');

// Configurações
const APP_ID = '1352351593037143';
const APP_SECRET = 'f8788e99231afa0bbb84685c4bea4924';
const USER_ACCESS_TOKEN = 'EAATN9ORQfVcBPxMLivSMuo5mZBR2H3g1MKNNQ3lAOK6fvNYZBaGB1oZAXfzvn37JICEcl16tRFggRsIP9tMXMZBZBt4GOu5wntLz1YhOB2LPF0w6ZBxjDViGXmLv2WFlTZANpDMwmglh0LYnflzVr3Tkd0FtLfCFhKmYCAo7nu5MivEXLTj7ZBkVpYrgIqwZB';
const APP_ACCESS_TOKEN = `${APP_ID}|${APP_SECRET}`;
const WEBHOOK_URL = 'https://sistema-pos-operatorio-5i1swk9c0-joao-vitor-vianas-projects.vercel.app/api/whatsapp/webhook';
const VERIFY_TOKEN = 'meu-token-super-secreto-2024';

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
    if (data) req.write(data);
    req.end();
  });
}

// Função para obter webhook atual
async function getCurrentWebhook() {
  const options = {
    hostname: 'graph.facebook.com',
    path: `/v21.0/${APP_ID}/subscriptions?access_token=${APP_ACCESS_TOKEN}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return await httpsRequest(options);
}

// Função para configurar webhook
async function setupWebhook() {
  const params = new URLSearchParams({
    object: 'whatsapp_business_account',
    callback_url: WEBHOOK_URL,
    verify_token: VERIFY_TOKEN,
    fields: 'messages,message_template_status_update',
    access_token: APP_ACCESS_TOKEN
  });

  const options = {
    hostname: 'graph.facebook.com',
    path: `/v21.0/${APP_ID}/subscriptions`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  return await httpsRequest(options, params.toString());
}

// Função para deletar webhook existente
async function deleteWebhook() {
  const params = new URLSearchParams({
    object: 'whatsapp_business_account',
    access_token: APP_ACCESS_TOKEN
  });

  const options = {
    hostname: 'graph.facebook.com',
    path: `/v21.0/${APP_ID}/subscriptions?${params.toString()}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return await httpsRequest(options);
}

// Função principal
async function main() {
  console.log('🚀 Iniciando configuração do webhook do Meta/Facebook...\n');

  console.log('📋 Configurações:');
  console.log(`   App ID: ${APP_ID}`);
  console.log(`   Webhook URL: ${WEBHOOK_URL}`);
  console.log(`   Verify Token: ${VERIFY_TOKEN}`);
  console.log('');

  // Verificar webhook atual
  console.log('🔍 Verificando webhook atual...');
  const current = await getCurrentWebhook();

  if (current.statusCode === 200 && current.body.data && current.body.data.length > 0) {
    console.log('⚠️  Webhook já existe:');
    console.log(`   Callback URL: ${current.body.data[0].callback_url}`);
    console.log('');
    console.log('🗑️  Removendo webhook antigo...');

    const deleteResult = await deleteWebhook();

    if (deleteResult.statusCode === 200) {
      console.log('✅ Webhook antigo removido com sucesso!\n');
    } else {
      console.log('⚠️  Erro ao remover webhook antigo');
      console.log(`   Status: ${deleteResult.statusCode}`);
      console.log(`   Resposta: ${JSON.stringify(deleteResult.body)}\n`);
    }
  } else {
    console.log('✅ Nenhum webhook configurado anteriormente\n');
  }

  // Configurar novo webhook
  console.log('📝 Configurando novo webhook...');
  const result = await setupWebhook();

  if (result.statusCode === 200 && result.body.success) {
    console.log('✅ Webhook configurado com sucesso!\n');

    // Verificar configuração
    console.log('🔍 Verificando configuração...');
    const verification = await getCurrentWebhook();

    if (verification.statusCode === 200 && verification.body.data && verification.body.data.length > 0) {
      const webhook = verification.body.data[0];
      console.log('✅ Webhook ativo:');
      console.log(`   Callback URL: ${webhook.callback_url}`);
      console.log(`   Fields: ${webhook.fields.join(', ')}`);
      console.log(`   Status: ${webhook.status}`);
      console.log('');
      console.log('✅ Configuração concluída com sucesso!');
    } else {
      console.log('⚠️  Não foi possível verificar o webhook');
    }
  } else {
    console.log('❌ Erro ao configurar webhook');
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Resposta: ${JSON.stringify(result.body, null, 2)}`);

    if (result.body.error) {
      console.log('\n💡 Dicas:');
      console.log('   1. Verifique se o Access Token está válido');
      console.log('   2. Verifique se a URL do webhook está acessível');
      console.log('   3. Configure manualmente em: https://developers.facebook.com/apps/1352351593037143/whatsapp-business/wa-settings');
    }
  }

  console.log('\n📋 Para configurar manualmente:');
  console.log('   1. Acesse: https://developers.facebook.com/apps/1352351593037143/whatsapp-business/wa-settings');
  console.log(`   2. Callback URL: ${WEBHOOK_URL}`);
  console.log(`   3. Verify token: ${VERIFY_TOKEN}`);
  console.log('   4. Subscribe to: messages, message_template_status_update\n');
}

// Executar
main().catch(error => {
  console.error('\n❌ Erro fatal:', error.message);
  process.exit(1);
});
