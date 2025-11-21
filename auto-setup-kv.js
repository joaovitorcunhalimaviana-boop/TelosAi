#!/usr/bin/env node

/**
 * Script automatizado para configurar Vercel KV
 * Busca o token automaticamente da sessão Vercel CLI
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

const PROJECT_NAME = 'sistema-pos-operatorio';
const TEAM_SLUG = 'joao-vitor-vianas-projects';

console.log('\n🤖 AUTO-CONFIGURAÇÃO DO VERCEL KV\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Função para encontrar o token do Vercel CLI
function findVercelToken() {
  const possiblePaths = [
    path.join(os.homedir(), '.vercel', 'auth.json'),
    path.join(os.homedir(), '.config', 'vercel', 'auth.json'),
    path.join(process.env.APPDATA || '', 'com.vercel.cli', 'auth.json'),
    path.join(process.env.LOCALAPPDATA || '', 'com.vercel.cli', 'auth.json'),
  ];

  for (const authPath of possiblePaths) {
    try {
      if (fs.existsSync(authPath)) {
        const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
        if (authData.token) {
          console.log(`✅ Token encontrado em: ${authPath}\n`);
          return authData.token;
        }
      }
    } catch (e) {
      // Continuar tentando outros caminhos
    }
  }

  return null;
}

// Função helper para fazer requests HTTPS
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function main() {
  try {
    // Buscar token
    console.log('🔍 Buscando token do Vercel CLI...\n');

    let token = findVercelToken();

    if (!token) {
      console.log('❌ Token não encontrado automaticamente\n');
      console.log('📋 SOLUÇÃO MANUAL:\n');
      console.log('1. Acesse: https://vercel.com/account/tokens');
      console.log('2. Clique em "Create Token"');
      console.log('3. Configure:');
      console.log('   - Token Name: KV Setup Token');
      console.log('   - Scope: Full Account');
      console.log('   - Expiration: 7 days');
      console.log('4. Execute:\n');
      console.log('   node create-vercel-kv-api.js <TOKEN_COPIADO>\n');
      process.exit(1);
    }

    console.log('🚀 Iniciando configuração automática...\n');

    // Passo 1: Obter ID do projeto
    console.log('🔍 1/4 - Buscando projeto...\n');

    const projectOptions = {
      hostname: 'api.vercel.com',
      path: `/v9/projects/${PROJECT_NAME}?teamId=${TEAM_SLUG}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const projectResponse = await makeRequest(projectOptions);

    if (projectResponse.statusCode !== 200) {
      console.log('❌ Erro ao buscar projeto');
      console.log('Detalhes:', JSON.stringify(projectResponse.data, null, 2));
      process.exit(1);
    }

    const projectId = projectResponse.data.id;
    console.log(`✅ Projeto: ${projectResponse.data.name} (${projectId})\n`);

    // Passo 2: Criar KV Database
    console.log('💾 2/4 - Criando KV Database...\n');

    const kvOptions = {
      hostname: 'api.vercel.com',
      path: `/v1/storage/kv/stores?teamId=${TEAM_SLUG}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const kvData = {
      name: 'rate-limit-store'
    };

    const kvResponse = await makeRequest(kvOptions, kvData);
    let kvStoreId;

    if (kvResponse.statusCode === 409) {
      console.log('⚠️  Database já existe, buscando...\n');

      const listOptions = {
        hostname: 'api.vercel.com',
        path: `/v1/storage/kv/stores?teamId=${TEAM_SLUG}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const listResponse = await makeRequest(listOptions);
      const existingDb = listResponse.data.stores?.find(db => db.name === 'rate-limit-store');

      if (existingDb) {
        kvStoreId = existingDb.id;
        console.log(`✅ Usando database: ${existingDb.name} (${kvStoreId})\n`);
      }
    } else if (kvResponse.statusCode === 201 || kvResponse.statusCode === 200) {
      kvStoreId = kvResponse.data.id;
      console.log(`✅ Database criado: ${kvResponse.data.name} (${kvStoreId})\n`);
    } else {
      console.log('❌ Erro ao criar database');
      console.log('Detalhes:', JSON.stringify(kvResponse.data, null, 2));
      process.exit(1);
    }

    // Passo 3: Conectar ao projeto
    console.log('🔗 3/4 - Conectando ao projeto...\n');

    const connectOptions = {
      hostname: 'api.vercel.com',
      path: `/v1/storage/kv/stores/${kvStoreId}/connect?teamId=${TEAM_SLUG}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const connectData = {
      projectId: projectId,
      target: ['production']
    };

    const connectResponse = await makeRequest(connectOptions, connectData);

    if (connectResponse.statusCode === 200 || connectResponse.statusCode === 201) {
      console.log('✅ Conectado com sucesso!\n');
    } else if (connectResponse.statusCode === 409) {
      console.log('✅ Já estava conectado\n');
    } else {
      console.log('⚠️ Erro ao conectar:', connectResponse.data);
      console.log('   (Pode precisar conectar manualmente)\n');
    }

    // Passo 4: Verificar variáveis
    console.log('🔍 4/4 - Verificando variáveis...\n');

    const envOptions = {
      hostname: 'api.vercel.com',
      path: `/v9/projects/${PROJECT_NAME}/env?teamId=${TEAM_SLUG}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const envResponse = await makeRequest(envOptions);

    if (envResponse.statusCode === 200) {
      const kvVars = envResponse.data.envs?.filter(env =>
        env.key.startsWith('KV_') || env.key.includes('REDIS')
      );

      if (kvVars && kvVars.length > 0) {
        console.log('✅ Variáveis KV configuradas:');
        kvVars.forEach(env => {
          console.log(`   - ${env.key}`);
        });
        console.log('');
      } else {
        console.log('⏳ Aguardando variáveis... (podem levar alguns segundos)\n');
      }
    }

    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('🎉 🎉 🎉 CONFIGURAÇÃO CONCLUÍDA! 🎉 🎉 🎉\n');
    console.log('📋 PRÓXIMOS PASSOS:\n');
    console.log('1. Redeploy para ativar:');
    console.log('   cd sistema-pos-operatorio && vercel --prod\n');
    console.log('2. Verificar:');
    console.log('   node setup-vercel-kv.js\n');
    console.log('✅ Rate limiting ATIVO após redeploy!\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    process.exit(1);
  }
}

main();
