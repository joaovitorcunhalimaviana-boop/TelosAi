#!/usr/bin/env node

/**
 * Script para configurar Vercel KV automaticamente
 *
 * Uso: node setup-vercel-kv.js
 */

console.log('\n🔧 CONFIGURAÇÃO DO VERCEL KV PARA RATE LIMITING\n');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📋 OPÇÕES DE CONFIGURAÇÃO:\n');

console.log('1️⃣  OPÇÃO 1: Via Dashboard da Vercel (RECOMENDADO)');
console.log('   - Mais fácil e rápido');
console.log('   - Interface visual');
console.log('   - Zero configuração manual\n');

console.log('   Passo a passo:');
console.log('   a) Acesse: https://vercel.com/joao-vitor-vianas-projects/sistema-pos-operatorio');
console.log('   b) Clique em "Storage" no menu lateral');
console.log('   c) Clique em "Create Database"');
console.log('   d) Selecione "KV (Redis)"');
console.log('   e) Configure:');
console.log('      - Database Name: rate-limit-store');
console.log('      - Region: iad1 (Washington DC - mais próximo do Brasil)');
console.log('      - Plan: Free');
console.log('   f) Clique em "Create"');
console.log('   g) Clique em "Connect to Project"');
console.log('   h) Selecione: sistema-pos-operatorio');
console.log('   i) Marque "Production"');
console.log('   j) Clique em "Connect"\n');

console.log('   ✅ Pronto! As variáveis serão adicionadas automaticamente.\n');

console.log('───────────────────────────────────────────────────────────\n');

console.log('2️⃣  OPÇÃO 2: Via Upstash (Mais Controle)');
console.log('   - Tier free mais generoso (10k req/dia vs 1k/dia)');
console.log('   - Dashboard com métricas avançadas');
console.log('   - Mais flexibilidade\n');

console.log('   Passo a passo:');
console.log('   a) Acesse: https://upstash.com');
console.log('   b) Crie uma conta gratuita');
console.log('   c) Clique em "Create Database"');
console.log('   d) Configure:');
console.log('      - Name: rate-limit-store');
console.log('      - Type: Regional');
console.log('      - Region: us-east-1 (mais próximo do Brasil no tier free)');
console.log('   e) Clique em "Create"');
console.log('   f) Na página do database, copie:');
console.log('      - UPSTASH_REDIS_REST_URL');
console.log('      - UPSTASH_REDIS_REST_TOKEN\n');

console.log('   g) No terminal, execute:\n');
console.log('      # Copie a URL e cole quando solicitado:');
console.log('      vercel env add KV_REST_API_URL production\n');
console.log('      # Copie o Token e cole quando solicitado:');
console.log('      vercel env add KV_REST_API_TOKEN production\n');

console.log('   h) Faça redeploy:');
console.log('      vercel --prod\n');

console.log('───────────────────────────────────────────────────────────\n');

console.log('3️⃣  VERIFICAR SE JÁ ESTÁ CONFIGURADO\n');

console.log('   Execute no terminal:');
console.log('   vercel env ls | grep KV\n');

console.log('   Se aparecer KV_REST_API_URL e KV_REST_API_TOKEN:');
console.log('   ✅ Já está configurado!\n');

console.log('   Se NÃO aparecer:');
console.log('   ⚠️  Precisa configurar (escolha Opção 1 ou 2 acima)\n');

console.log('═══════════════════════════════════════════════════════════\n');

console.log('📊 TESTAR RATE LIMITING APÓS CONFIGURAR\n');

console.log('Após fazer deploy, teste com este comando:\n');

console.log('for i in {1..10}; do');
console.log('  curl -I https://sistema-pos-operatorio-joao-vitor-vianas-projects.vercel.app/api/auth/register');
console.log('  sleep 0.1');
console.log('done\n');

console.log('Resultado esperado:');
console.log('  - Primeiras 5 requisições: 200 OK ou 400 Bad Request');
console.log('  - Após 5 requisições: 429 Too Many Requests ✅\n');

console.log('═══════════════════════════════════════════════════════════\n');

console.log('💡 DICA: Use a Opção 1 (Dashboard) - é mais rápida!\n');

console.log('📚 Documentação completa: SETUP_VERCEL_KV.md\n');

// Verificar se Vercel CLI está instalado
const { execSync } = require('child_process');

try {
  console.log('🔍 Verificando Vercel CLI...\n');
  const vercelVersion = execSync('vercel --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Vercel CLI instalado: ${vercelVersion}\n`);

  // Verificar se está logado
  try {
    execSync('vercel whoami', { encoding: 'utf8' });
    console.log('✅ Vercel CLI autenticado\n');

    // Verificar variáveis KV
    console.log('🔍 Verificando variáveis KV existentes...\n');
    const envList = execSync('vercel env ls', { encoding: 'utf8' });

    if (envList.includes('KV_REST_API_URL') && envList.includes('KV_REST_API_TOKEN')) {
      console.log('✅ ✅ ✅ VERCEL KV JÁ CONFIGURADO! ✅ ✅ ✅\n');
      console.log('Rate limiting está ATIVO em produção!\n');
      console.log('Variáveis encontradas:');
      console.log('  - KV_REST_API_URL');
      console.log('  - KV_REST_API_TOKEN\n');
    } else {
      console.log('⚠️  VERCEL KV NÃO CONFIGURADO\n');
      console.log('Rate limiting está INATIVO (fail-open mode)\n');
      console.log('Siga a Opção 1 ou 2 acima para configurar.\n');
    }

  } catch (e) {
    console.log('⚠️  Vercel CLI não autenticado\n');
    console.log('Execute: vercel login\n');
  }

} catch (e) {
  console.log('⚠️  Vercel CLI não encontrado\n');
  console.log('Instale com: npm install -g vercel\n');
}

console.log('═══════════════════════════════════════════════════════════\n');
