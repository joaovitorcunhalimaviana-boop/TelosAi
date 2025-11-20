/**
 * Script para configurar variáveis de ambiente do Neon no Vercel
 *
 * Execute: node setup-neon-env.js
 */

const NEON_API_KEY = 'napi_b4x1jzeecj0cytqh56d15y85s6ayvbpi3a4g1l0oj9mcwpcy8e8uo50la1dqcset';
const NEON_PROJECT_ID = 'raspy-base-15161385';

console.log('\n📋 VARIÁVEIS DE AMBIENTE DO NEON\n');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('Adicione estas variáveis no painel do Vercel:\n');
console.log('https://vercel.com/dashboard → Seu Projeto → Settings → Environment Variables\n');

console.log('1️⃣  NEON_API_KEY');
console.log('   Valor:', NEON_API_KEY);
console.log('   Environment: [✓] Production, [ ] Preview, [ ] Development\n');

console.log('2️⃣  NEON_PROJECT_ID');
console.log('   Valor:', NEON_PROJECT_ID);
console.log('   Environment: [✓] Production, [ ] Preview, [ ] Development\n');

console.log('═══════════════════════════════════════════════════════════\n');

console.log('📌 COMANDO ALTERNATIVO (via Vercel CLI):\n');
console.log('Para adicionar via linha de comando, execute:\n');

console.log(`echo "${NEON_API_KEY}" | vercel env add NEON_API_KEY production`);
console.log(`echo "${NEON_PROJECT_ID}" | vercel env add NEON_PROJECT_ID production\n`);

console.log('═══════════════════════════════════════════════════════════\n');
console.log('✅ Após adicionar as variáveis, faça redeploy:\n');
console.log('   vercel --prod\n');
