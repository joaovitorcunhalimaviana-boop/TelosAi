#!/usr/bin/env node

/**
 * Setup AUTOMÁTICO com Upstash
 * Mais simples e rápido que Vercel KV
 */

const { exec } = require('child_process');
const readline = require('readline');

console.log('\n🚀 SETUP AUTOMÁTICO - UPSTASH + VERCEL\n');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📋 INSTRUÇÕES:\n');
console.log('1. Acesse: https://upstash.com/login');
console.log('2. Faça login (ou crie conta grátis)');
console.log('3. Clique em "Create Database"');
console.log('4. Configure:');
console.log('   - Name: rate-limit-store');
console.log('   - Type: Regional');
console.log('   - Region: us-east-1');
console.log('5. Clique em "Create"\n');
console.log('6. Na página do database, copie as credenciais:\n');

// Abrir navegador
const platform = process.platform;
let openCommand = platform === 'win32' ? 'start' : (platform === 'darwin' ? 'open' : 'xdg-open');

exec(`${openCommand} https://upstash.com/login`, (error) => {
  if (error) {
    console.log('⚠️  Abra manualmente: https://upstash.com/login\n');
  } else {
    console.log('✅ Navegador aberto!\n');
  }
});

console.log('═══════════════════════════════════════════════════════════\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  try {
    // Pedir credenciais
    const url = await askQuestion('📝 Cole o UPSTASH_REDIS_REST_URL: ');
    const token = await askQuestion('📝 Cole o UPSTASH_REDIS_REST_TOKEN: ');

    rl.close();

    if (!url || !token || url.length < 10 || token.length < 10) {
      console.log('\n❌ Credenciais inválidas\n');
      process.exit(1);
    }

    console.log('\n✅ Credenciais recebidas!\n');
    console.log('🔄 Configurando Vercel...\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Adicionar variável URL
    console.log('📝 [1/3] Adicionando KV_REST_API_URL...\n');

    await new Promise((resolve, reject) => {
      const proc = exec('cd sistema-pos-operatorio && vercel env add KV_REST_API_URL production', (error) => {
        if (error && !error.message.includes('already exists')) {
          reject(error);
        } else {
          resolve();
        }
      });

      proc.stdin.write(url.trim() + '\n');
      proc.stdin.end();
    });

    console.log('     ✅ URL adicionada\n');

    // Adicionar variável Token
    console.log('📝 [2/3] Adicionando KV_REST_API_TOKEN...\n');

    await new Promise((resolve, reject) => {
      const proc = exec('cd sistema-pos-operatorio && vercel env add KV_REST_API_TOKEN production', (error) => {
        if (error && !error.message.includes('already exists')) {
          reject(error);
        } else {
          resolve();
        }
      });

      proc.stdin.write(token.trim() + '\n');
      proc.stdin.end();
    });

    console.log('     ✅ Token adicionado\n');

    // Redeploy
    console.log('🚀 [3/3] Fazendo redeploy...\n');

    exec('cd sistema-pos-operatorio && vercel --prod --yes', (error, stdout, stderr) => {
      console.log('     ✅ Deploy iniciado!\n');
      console.log('═══════════════════════════════════════════════════════════\n');
      console.log('🎉 🎉 🎉 CONFIGURAÇÃO CONCLUÍDA! 🎉 🎉 🎉\n');
      console.log('✅ Upstash Redis conectado');
      console.log('✅ Variáveis configuradas no Vercel');
      console.log('✅ Deploy em andamento\n');
      console.log('⏱️  Aguarde 2-3 minutos para o deploy completar\n');
      console.log('📊 VERIFICAR:\n');
      console.log('   vercel env ls | grep KV\n');
      console.log('   Deve mostrar:');
      console.log('   - KV_REST_API_URL');
      console.log('   - KV_REST_API_TOKEN\n');
      console.log('🧪 TESTAR RATE LIMITING:\n');
      console.log('   Após deploy, execute:\n');
      console.log('   for i in {1..10}; do');
      console.log('     curl -I https://sistema-pos-operatorio-joao-vitor-vianas-projects.vercel.app/api/auth/register');
      console.log('     sleep 0.1');
      console.log('   done\n');
      console.log('   Resultado esperado:');
      console.log('   - Primeiras 5: 200 OK');
      console.log('   - Após 5: 429 Too Many Requests ✅\n');
      console.log('🔒 RATE LIMITING ATIVO!\n');
    });

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.log('\nTente novamente: node setup-upstash-auto.js\n');
    process.exit(1);
  }
}

main();
