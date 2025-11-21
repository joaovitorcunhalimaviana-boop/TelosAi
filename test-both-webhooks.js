/**
 * Testa AMBOS os endpoints de webhook para ver qual está ativo
 */

const crypto = require('crypto');

const testPhone = '5583998663089'; // O que o WhatsApp envia

// Função para criar signature válida
function createSignature(body, appSecret) {
  const hmac = crypto.createHmac('sha256', appSecret);
  hmac.update(body);
  return 'sha256=' + hmac.digest('hex');
}

async function testBothWebhooks() {
  console.log('\n🧪 TESTANDO AMBOS OS ENDPOINTS DE WEBHOOK\n');
  console.log('='.repeat(60));

  const domain = 'https://sistema-pos-operatorio-nn17wlvdg-joao-vitor-vianas-projects.vercel.app';

  const endpoints = [
    '/api/whatsapp/webhook',
    '/api/webhooks/whatsapp',
  ];

  // Payload do webhook
  const webhookPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      changes: [{
        value: {
          messages: [{
            from: testPhone,
            id: 'test-message-id-' + Date.now(),
            timestamp: Math.floor(Date.now() / 1000),
            type: 'text',
            text: {
              body: 'teste de busca'
            }
          }],
          metadata: {
            phone_number_id: '12345'
          }
        },
        field: 'messages'
      }]
    }]
  };

  const bodyString = JSON.stringify(webhookPayload);

  // Criar signature válida (se você tiver o APP_SECRET)
  // const appSecret = 'SEU_APP_SECRET_AQUI';
  // const signature = createSignature(bodyString, appSecret);

  for (const endpoint of endpoints) {
    console.log(`\n📍 Testando: ${endpoint}`);
    console.log('-'.repeat(60));

    try {
      const url = `${domain}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        // Se tiver signature: 'x-hub-signature-256': signature,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: bodyString
      });

      const data = await response.text();

      console.log(`   Status: ${response.status}`);
      console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
      console.log(`   Body (primeiros 500 chars):`);
      console.log(`   ${data.substring(0, 500)}`);

      // Se status for 403, é porque a signature é requerida
      if (response.status === 403) {
        console.log(`   ⚠️  SIGNATURE INVÁLIDA (esperado se APP_SECRET não estiver configurado)`);
      }

      // Se status for 200, procesou com sucesso
      if (response.status === 200) {
        const json = JSON.parse(data);
        if (json.success) {
          console.log(`   ✅ WEBHOOK PROCESSOU COM SUCESSO!`);
        }
      }

    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 CONCLUSÃO:');
  console.log('Se ambos retornaram 403 (Forbidden), a signature validation está ativa.');
  console.log('Se um retornou 200, esse é o endpoint que está funcionando.');
  console.log('\n🔧 PRÓXIMOS PASSOS:');
  console.log('1. Verifique qual endpoint o Meta WhatsApp está usando');
  console.log('2. Se necessário, desabilite temporariamente signature validation para debug');
  console.log('');
}

testBothWebhooks();
