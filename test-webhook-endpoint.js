/**
 * Testa se o endpoint do webhook está acessível publicamente
 */

const WEBHOOK_URL = 'https://sistema-pos-operatorio.vercel.app/api/whatsapp/webhook';
const VERIFY_TOKEN = 'meu-token-super-secreto-2024';

async function testWebhookEndpoint() {
  console.log('\n🧪 TESTANDO ACESSIBILIDADE DO WEBHOOK\n');
  console.log('='.repeat(80));

  try {
    // 1. Teste GET (verificação do webhook)
    console.log('\n📡 1. TESTE GET (Verificação do Meta):');
    const getUrl = `${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=test123`;
    console.log('   URL:', getUrl);

    const getResponse = await fetch(getUrl);
    const getText = await getResponse.text();

    console.log('   Status:', getResponse.status);
    console.log('   Response:', getText);

    if (getResponse.status === 200 && getText === 'test123') {
      console.log('   ✅ GET funcionando corretamente!');
    } else {
      console.log('   ❌ Problema no GET');
    }

    // 2. Teste POST (envio de mensagem simulada)
    console.log('\n📨 2. TESTE POST (Mensagem simulada do Meta):');

    const testMessage = {
      object: 'whatsapp_business_account',
      entry: [{
        id: 'WABA_ID',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '5583916649 04',
              phone_number_id: '866244236573219'
            },
            contacts: [{
              profile: {
                name: 'João Teste'
              },
              wa_id: '5583998663089'
            }],
            messages: [{
              from: '5583998663089',
              id: 'wamid.test123',
              timestamp: Date.now().toString(),
              text: {
                body: 'sim'
              },
              type: 'text'
            }]
          },
          field: 'messages'
        }]
      }]
    };

    console.log('   Enviando mensagem teste...');
    const postResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    });

    const postText = await postResponse.text();
    console.log('   Status:', postResponse.status);
    console.log('   Response:', postText);

    if (postResponse.status === 200) {
      console.log('   ✅ POST aceito!');
    } else if (postResponse.status === 401) {
      console.log('   ⚠️  Assinatura inválida (esperado para teste manual)');
    } else {
      console.log('   ❌ Problema no POST');
    }

    // 3. Verificar se o endpoint retorna JSON válido
    console.log('\n🔍 3. VERIFICAÇÃO DE ERRO:');
    const errorResponse = await fetch(WEBHOOK_URL);
    console.log('   Status sem parâmetros:', errorResponse.status);
    const errorText = await errorResponse.text();
    console.log('   Response:', errorText.substring(0, 200));

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
  }

  console.log('\n' + '='.repeat(80));
}

testWebhookEndpoint();
