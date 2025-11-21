/**
 * Script para testar o endpoint de backup
 *
 * Execute: node test-backup.js
 */

const PRODUCTION_URL = 'https://sistema-pos-operatorio-6hlfqc2a1-joao-vitor-vianas-projects.vercel.app';

async function testBackup() {
  console.log('\n🧪 TESTANDO BACKUP DO BANCO DE DADOS\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const endpoint = `${PRODUCTION_URL}/api/cron/daily-tasks`;

  console.log(`📡 Endpoint: ${endpoint}\n`);
  console.log('⏳ Executando backup...\n');

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}\n`);

    const data = await response.json();

    if (response.ok) {
      console.log('✅ BACKUP BEM-SUCEDIDO!\n');
      console.log('📋 Detalhes:');
      console.log(`   Branch criado: ${data.branch}`);
      console.log(`   Branch ID: ${data.branchId}`);
      console.log(`   Timestamp: ${data.timestamp}\n`);

      console.log('🔍 Verifique no Neon Console:');
      console.log('   https://console.neon.tech/app/projects/raspy-base-15161385\n');
      console.log('   Vá em "Branches" e procure por:', data.branch);

    } else {
      console.log('❌ ERRO NO BACKUP\n');
      console.log('📋 Resposta:', JSON.stringify(data, null, 2));

      if (data.error === 'Backup configuration missing') {
        console.log('\n⚠️  POSSÍVEL CAUSA:');
        console.log('   As variáveis NEON_API_KEY ou NEON_PROJECT_ID não estão configuradas.');
        console.log('   Verifique as variáveis de ambiente no Vercel.');
      }
    }

  } catch (error) {
    console.log('❌ ERRO NA REQUISIÇÃO\n');
    console.log('Detalhes:', error.message);

    if (error.message.includes('fetch')) {
      console.log('\n⚠️  POSSÍVEL CAUSA:');
      console.log('   O servidor pode estar offline ou a URL está incorreta.');
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');
}

// Executar teste
testBackup().catch(console.error);
