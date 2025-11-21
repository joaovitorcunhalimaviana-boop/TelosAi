/**
 * Test com logging detalhado para debug
 */

async function testWebhookDebug() {
  console.log('\n🧪 TESTE DE DEBUG DO WEBHOOK\n');
  console.log('='.repeat(60));

  const domain = 'https://sistema-pos-operatorio-nn17wlvdg-joao-vitor-vianas-projects.vercel.app';
  const testPhone = '5583998663089';

  const webhookPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      changes: [{
        field: 'messages',
        value: {
          messages: [{
            from: testPhone,
            id: 'test-msg-' + Date.now(),
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: 'text',
            text: {
              body: 'sim'
            }
          }],
          contacts: [{
            profile: {
              name: 'Test User'
            },
            wa_id: testPhone
          }],
          metadata: {
            phone_number_id: 'YOUR_PHONE_NUMBER_ID',
            display_phone_number: '558398663089'
          }
        }
      }]
    }]
  };

  console.log('\n📤 Payload being sent:');
  console.log(JSON.stringify(webhookPayload, null, 2));

  try {
    const url = `${domain}/api/whatsapp/webhook`;
    console.log(`\n📍 Endpoint: ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });

    console.log(`\n📥 Response:`);
    console.log(`   Status: ${response.status}`);

    const responseText = await response.text();
    console.log(`   Body: ${responseText}`);

    // Tentar parsear JSON
    try {
      const json = JSON.parse(responseText);
      console.log(`   Parsed JSON:`, json);
    } catch (e) {
      console.log(`   (Not valid JSON)`);
    }

    console.log('\n' + '='.repeat(60));

    // Aguardar um pouco e tentar verificar logs
    console.log('\n⏳ Aguardando 3 segundos para processar...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testWebhookDebug();
