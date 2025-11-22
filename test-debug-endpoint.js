/**
 * Testa o endpoint de debug
 */

async function testDebug() {
  console.log('\n🔬 TESTANDO ENDPOINT DE DEBUG\n');
  console.log('='.repeat(60));

  const url = 'https://sistema-pos-operatorio-cvu1vo0tw-joao-vitor-vianas-projects.vercel.app/api/webhook-test';
  const testPhone = '5583998663089';

  try {
    console.log(`\n📍 URL: ${url}`);
    console.log(`📞 Telefone: ${testPhone}\n`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: testPhone })
    });

    console.log(`📥 Status: ${response.status}\n`);

    const result = await response.json();
    console.log('📊 RESULTADO:\n');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n' + '='.repeat(60));

    if (result.jsResult) {
      console.log('\n✅ SUCESSO! O fallback JavaScript ENCONTROU o paciente!');
      console.log(`   Nome: ${result.jsResult.name}`);
      console.log(`   Telefone: ${result.jsResult.phone}`);
      console.log(`   ID: ${result.jsResult.id}`);
    } else {
      console.log('\n❌ FALHA! Nenhum método encontrou o paciente.');
      console.log(`   Total de pacientes no banco: ${result.totalPatients}`);
    }

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
}

testDebug();
