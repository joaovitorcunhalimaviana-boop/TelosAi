#!/usr/bin/env node

/**
 * Script para criar Vercel KV Database via API
 *
 * Uso: node create-vercel-kv-api.js <VERCEL_TOKEN>
 *
 * Para obter seu token:
 * 1. Acesse: https://vercel.com/account/tokens
 * 2. Clique em "Create Token"
 * 3. Nome: "KV Setup Token"
 * 4. Scope: Full Account
 * 5. Expiration: No Expiration (ou 7 days)
 * 6. Copie o token gerado
 */

const https = require('https');

const VERCEL_TOKEN = process.argv[2];
const PROJECT_NAME = 'sistema-pos-operatorio';
const TEAM_SLUG = 'joao-vitor-vianas-projects';

if (!VERCEL_TOKEN) {
  console.log('\n❌ ERRO: Token da Vercel não fornecido\n');
  console.log('📋 COMO OBTER O TOKEN:\n');
  console.log('1. Acesse: https://vercel.com/account/tokens');
  console.log('2. Clique em "Create Token"');
  console.log('3. Configure:');
  console.log('   - Token Name: KV Setup Token');
  console.log('   - Scope: Full Account');
  console.log('   - Expiration: 7 days (ou No Expiration)');
  console.log('4. Copie o token gerado\n');
  console.log('📝 USO:\n');
  console.log('   node create-vercel-kv-api.js <SEU_TOKEN>\n');
  console.log('Exemplo:');
  console.log('   node create-vercel-kv-api.js abc123xyz456...\n');
  process.exit(1);
}

console.log('\n🚀 CRIANDO VERCEL KV DATABASE VIA API\n');
console.log('═══════════════════════════════════════════════════════════\n');

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
    // Passo 1: Obter ID do projeto
    console.log('🔍 1/4 - Buscando informações do projeto...\n');

    const projectOptions = {
      hostname: 'api.vercel.com',
      path: `/v9/projects/${PROJECT_NAME}?teamId=${TEAM_SLUG}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const projectResponse = await makeRequest(projectOptions);

    if (projectResponse.statusCode !== 200) {
      console.log('❌ Erro ao buscar projeto:', projectResponse.data);
      console.log('\n⚠️  Verifique se:');
      console.log('   - O token está correto');
      console.log('   - O token tem permissão para acessar o projeto');
      console.log('   - O nome do projeto está correto\n');
      process.exit(1);
    }

    const projectId = projectResponse.data.id;
    console.log(`✅ Projeto encontrado: ${projectResponse.data.name}`);
    console.log(`   ID: ${projectId}\n`);

    // Passo 2: Criar KV Database
    console.log('💾 2/4 - Criando KV Database...\n');

    const kvOptions = {
      hostname: 'api.vercel.com',
      path: `/v1/storage/kv/stores?teamId=${TEAM_SLUG}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const kvData = {
      name: 'rate-limit-store'
    };

    const kvResponse = await makeRequest(kvOptions, kvData);

    if (kvResponse.statusCode === 409) {
      console.log('⚠️  Database KV já existe com este nome');
      console.log('   Buscando database existente...\n');

      // Listar databases existentes
      const listOptions = {
        hostname: 'api.vercel.com',
        path: `/v1/storage/kv/stores?teamId=${TEAM_SLUG}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      };

      const listResponse = await makeRequest(listOptions);
      const existingDb = listResponse.data.stores?.find(db => db.name === 'rate-limit-store');

      if (existingDb) {
        console.log(`✅ Usando database existente: ${existingDb.name}`);
        console.log(`   ID: ${existingDb.id}\n`);
        kvStoreId = existingDb.id;
      } else {
        console.log('❌ Não foi possível encontrar o database\n');
        process.exit(1);
      }
    } else if (kvResponse.statusCode === 201 || kvResponse.statusCode === 200) {
      console.log(`✅ KV Database criado: ${kvResponse.data.name}`);
      console.log(`   ID: ${kvResponse.data.id}`);
      console.log(`   Region: ${kvResponse.data.region || 'iad1'}\n`);
      var kvStoreId = kvResponse.data.id;
    } else {
      console.log('❌ Erro ao criar KV Database:', kvResponse.data);
      process.exit(1);
    }

    // Passo 3: Conectar KV ao Projeto
    console.log('🔗 3/4 - Conectando KV ao projeto...\n');

    const connectOptions = {
      hostname: 'api.vercel.com',
      path: `/v1/storage/kv/stores/${kvStoreId}/connect?teamId=${TEAM_SLUG}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const connectData = {
      projectId: projectId,
      target: ['production'] // Conectar apenas em production
    };

    const connectResponse = await makeRequest(connectOptions, connectData);

    if (connectResponse.statusCode === 200 || connectResponse.statusCode === 201) {
      console.log('✅ KV Database conectado ao projeto!');
      console.log('   Ambientes: Production\n');

      // Mostrar variáveis de ambiente que foram criadas
      if (connectResponse.data?.envVariables) {
        console.log('📝 Variáveis de ambiente criadas:');
        connectResponse.data.envVariables.forEach(env => {
          console.log(`   - ${env.key}`);
        });
        console.log('');
      }
    } else if (connectResponse.statusCode === 409) {
      console.log('⚠️  Database já está conectado ao projeto\n');
    } else {
      console.log('❌ Erro ao conectar KV ao projeto:', connectResponse.data);
      console.log('   Você pode conectar manualmente no dashboard\n');
    }

    // Passo 4: Verificar variáveis de ambiente
    console.log('🔍 4/4 - Verificando variáveis de ambiente...\n');

    const envOptions = {
      hostname: 'api.vercel.com',
      path: `/v9/projects/${PROJECT_NAME}/env?teamId=${TEAM_SLUG}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const envResponse = await makeRequest(envOptions);

    if (envResponse.statusCode === 200) {
      const kvVars = envResponse.data.envs?.filter(env =>
        env.key.startsWith('KV_') || env.key.includes('REDIS')
      );

      if (kvVars && kvVars.length > 0) {
        console.log('✅ Variáveis KV encontradas:');
        kvVars.forEach(env => {
          console.log(`   - ${env.key} (${env.target.join(', ')})`);
        });
        console.log('');
      } else {
        console.log('⚠️  Nenhuma variável KV encontrada ainda');
        console.log('   As variáveis podem levar alguns segundos para aparecer\n');
      }
    }

    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('✅ ✅ ✅ CONFIGURAÇÃO CONCLUÍDA COM SUCESSO! ✅ ✅ ✅\n');
    console.log('📋 PRÓXIMOS PASSOS:\n');
    console.log('1. Faça um novo deploy para ativar as variáveis:');
    console.log('   vercel --prod\n');
    console.log('2. Teste o rate limiting:');
    console.log('   node setup-vercel-kv.js\n');
    console.log('3. Verifique os logs no dashboard:');
    console.log(`   https://vercel.com/${TEAM_SLUG}/${PROJECT_NAME}\n`);
    console.log('🎉 Rate limiting agora estará ATIVO em produção!\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('\nDetalhes:', error);
    process.exit(1);
  }
}

main();
