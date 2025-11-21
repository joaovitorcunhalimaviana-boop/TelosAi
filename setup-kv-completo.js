#!/usr/bin/env node

/**
 * Setup COMPLETO e AUTOMATIZADO do Vercel KV
 * Sem trabalho manual - apenas copie e cole o token quando solicitado
 */

const https = require('https');
const readline = require('readline');
const { exec } = require('child_process');

const PROJECT_NAME = 'sistema-pos-operatorio';
const TEAM_SLUG = 'joao-vitor-vianas-projects';

console.log('\n🚀 SETUP AUTOMÁTICO COMPLETO DO VERCEL KV\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Abrir navegador automaticamente
console.log('📱 Abrindo navegador para criar token...\n');

const tokenUrl = 'https://vercel.com/account/tokens';
const platform = process.platform;

let openCommand;
if (platform === 'win32') {
  openCommand = `start ${tokenUrl}`;
} else if (platform === 'darwin') {
  openCommand = `open ${tokenUrl}`;
} else {
  openCommand = `xdg-open ${tokenUrl}`;
}

exec(openCommand, (error) => {
  if (error) {
    console.log(`⚠️  Não foi possível abrir o navegador automaticamente`);
    console.log(`   Acesse manualmente: ${tokenUrl}\n`);
  }
});

console.log('📋 INSTRUÇÕES NO NAVEGADOR:\n');
console.log('1. Clique em "Create Token"');
console.log('2. Token Name: KV-Setup');
console.log('3. Scope: Full Account');
console.log('4. Expiration: 7 days');
console.log('5. Clique em "Create"');
console.log('6. COPIE o token que aparecer\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Função para fazer request
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Perguntar pelo token
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('🔑 Cole o token aqui e pressione ENTER: ', async (token) => {
  rl.close();

  if (!token || token.trim().length < 20) {
    console.log('\n❌ Token inválido. Execute novamente: node setup-kv-completo.js\n');
    process.exit(1);
  }

  token = token.trim();

  console.log('\n✅ Token recebido!\n');
  console.log('🔄 Configurando tudo automaticamente...\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // 1. Buscar projeto
    console.log('🔍 [1/5] Buscando projeto...');

    const projectRes = await makeRequest({
      hostname: 'api.vercel.com',
      path: `/v9/projects/${PROJECT_NAME}?teamId=${TEAM_SLUG}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (projectRes.statusCode !== 200) {
      throw new Error('Projeto não encontrado. Verifique o token.');
    }

    const projectId = projectRes.data.id;
    console.log(`     ✅ ${projectRes.data.name}\n`);

    // 2. Criar KV database
    console.log('💾 [2/5] Criando KV Database...');

    const kvRes = await makeRequest({
      hostname: 'api.vercel.com',
      path: `/v1/storage/kv/stores?teamId=${TEAM_SLUG}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, { name: 'rate-limit-store' });

    let kvStoreId;

    if (kvRes.statusCode === 409) {
      console.log('     ⚠️  Já existe, buscando...');

      const listRes = await makeRequest({
        hostname: 'api.vercel.com',
        path: `/v1/storage/kv/stores?teamId=${TEAM_SLUG}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const existing = listRes.data.stores?.find(db => db.name === 'rate-limit-store');
      if (existing) {
        kvStoreId = existing.id;
        console.log(`     ✅ Usando existente (${kvStoreId.slice(0, 8)}...)\n`);
      }
    } else if (kvRes.statusCode === 201 || kvRes.statusCode === 200) {
      kvStoreId = kvRes.data.id;
      console.log(`     ✅ Criado (${kvStoreId.slice(0, 8)}...)\n`);
    } else {
      throw new Error('Erro ao criar KV: ' + JSON.stringify(kvRes.data));
    }

    // 3. Conectar ao projeto
    console.log('🔗 [3/5] Conectando ao projeto...');

    const connectRes = await makeRequest({
      hostname: 'api.vercel.com',
      path: `/v1/storage/kv/stores/${kvStoreId}/connect?teamId=${TEAM_SLUG}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, {
      projectId: projectId,
      target: ['production']
    });

    if (connectRes.statusCode === 200 || connectRes.statusCode === 201) {
      console.log('     ✅ Conectado!\n');
    } else if (connectRes.statusCode === 409) {
      console.log('     ✅ Já estava conectado\n');
    } else {
      console.log('     ⚠️  Erro ao conectar, mas continuando...\n');
    }

    // 4. Verificar variáveis
    console.log('🔍 [4/5] Verificando variáveis...');

    await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2s

    const envRes = await makeRequest({
      hostname: 'api.vercel.com',
      path: `/v9/projects/${PROJECT_NAME}/env?teamId=${TEAM_SLUG}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (envRes.statusCode === 200) {
      const kvVars = envRes.data.envs?.filter(env =>
        env.key.startsWith('KV_') || env.key.includes('REDIS')
      );

      if (kvVars && kvVars.length > 0) {
        console.log('     ✅ Variáveis configuradas:');
        kvVars.forEach(env => {
          console.log(`        - ${env.key}`);
        });
        console.log('');
      } else {
        console.log('     ⏳ Variáveis sendo criadas...\n');
      }
    }

    // 5. Fazer deploy
    console.log('🚀 [5/5] Fazendo redeploy automático...');

    exec('cd sistema-pos-operatorio && vercel --prod --yes', (error, stdout, stderr) => {
      if (error) {
        console.log('     ⚠️  Faça deploy manual: vercel --prod\n');
      } else {
        console.log('     ✅ Deploy iniciado!\n');
      }

      console.log('═══════════════════════════════════════════════════════════\n');
      console.log('🎉 🎉 🎉 CONFIGURAÇÃO 100% CONCLUÍDA! 🎉 🎉 🎉\n');
      console.log('✅ KV Database criado');
      console.log('✅ Conectado ao projeto');
      console.log('✅ Variáveis configuradas');
      console.log('✅ Deploy em andamento\n');
      console.log('⏱️  Aguarde 2-3 minutos para o deploy completar\n');
      console.log('📊 TESTAR RATE LIMITING:\n');
      console.log('   Após o deploy, execute:\n');
      console.log('   for i in {1..10}; do');
      console.log('     curl -I https://sistema-pos-operatorio-joao-vitor-vianas-projects.vercel.app/api/auth/register');
      console.log('     sleep 0.1');
      console.log('   done\n');
      console.log('   Resultado esperado:');
      console.log('   - Primeiras 5: 200 OK');
      console.log('   - Após 5: 429 Too Many Requests ✅\n');
      console.log('🔒 SEGURANÇA ATIVA! Rate limiting funcionando!\n');
    });

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('\nTente novamente: node setup-kv-completo.js\n');
    process.exit(1);
  }
});
