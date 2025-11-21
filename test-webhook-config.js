/**
 * Script para testar configuração do webhook WhatsApp
 * Verifica qual endpoint está configurado no Meta
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://proactive-rejoicing-production.up.railway.app';

console.log('\n🔍 TESTANDO CONFIGURAÇÃO DE WEBHOOKS\n');
console.log('━'.repeat(60));
console.log('\n📍 Base URL:', BASE_URL);
console.log('\n🎯 Endpoints disponíveis:\n');
console.log('1️⃣  /api/webhooks/whatsapp  (NOVO - Corrigido)');
console.log('2️⃣  /api/whatsapp/webhook   (ANTIGO)');
console.log('\n━'.repeat(60));

async function testEndpoint(path, label) {
  const url = `${BASE_URL}${path}`;

  console.log(`\n🧪 Testando: ${label}`);
  console.log(`   URL: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'WhatsApp-Webhook-Test/1.0'
      }
    });

    const text = await response.text();

    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);

    if (response.status === 403) {
      console.log('   ✅ Endpoint está ativo (requer verificação)');
      return true;
    } else if (response.status === 200) {
      console.log('   ✅ Endpoint está ativo');
      return true;
    } else {
      console.log('   ❌ Endpoint com problema');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return false;
  }
}

async function testPatientLookup() {
  console.log('\n\n━'.repeat(60));
  console.log('📞 TESTANDO BUSCA DE PACIENTE\n');

  const testPhone = '5583998663089'; // Número de teste do WhatsApp

  console.log(`Telefone de teste: ${testPhone}`);
  console.log('\nFormatos que serão testados:');
  console.log(`  - Últimos 11: ${testPhone.slice(-11)}`);
  console.log(`  - Últimos 9:  ${testPhone.slice(-9)}`);
  console.log(`  - Últimos 8:  ${testPhone.slice(-8)}`);

  console.log('\n💡 IMPORTANTE:');
  console.log('   Verifique se o telefone do paciente no banco está em um desses formatos!');
}

async function main() {
  await testEndpoint('/api/webhooks/whatsapp', '1️⃣  WEBHOOK NOVO (Corrigido)');
  await testEndpoint('/api/whatsapp/webhook', '2️⃣  WEBHOOK ANTIGO');

  await testPatientLookup();

  console.log('\n━'.repeat(60));
  console.log('\n📋 PRÓXIMOS PASSOS:\n');
  console.log('1. Verifique qual URL está configurada no Meta WhatsApp Dashboard');
  console.log('2. A URL deve ser: https://proactive-rejoicing-production.up.railway.app/api/webhooks/whatsapp');
  console.log('3. Verifique o formato do telefone do paciente cadastrado no banco');
  console.log('4. Após fazer deploy, teste enviando "sim" no WhatsApp');
  console.log('\n━'.repeat(60));
  console.log('\n✅ Para atualizar o webhook no Meta:');
  console.log('   https://developers.facebook.com/apps/');
  console.log('   → Seu App → WhatsApp → Configuração → Webhook');
  console.log('');
}

main().catch(console.error);
