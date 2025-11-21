/**
 * Testa a API ao vivo para verificar qual versão está rodando
 */

const testPhone = '5583998663089'; // O que o WhatsApp envia

async function testAPI() {
  console.log('\n🧪 TESTANDO API AO VIVO\n');
  console.log('='.repeat(60));

  // Domínio customizado (se você tiver)
  const domains = [
    'https://sistema-pos-operatorio-7o3nna9ra-joao-vitor-vianas-projects.vercel.app',
    'https://sistema-pos-operatorio-7qk4z5hvd-joao-vitor-vianas-projects.vercel.app',
  ];

  for (const domain of domains) {
    console.log(`\n📍 Testando: ${domain}`);

    try {
      // Simular webhook do WhatsApp
      const webhookPayload = {
        object: 'whatsapp_business_account',
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: testPhone,
                id: 'test-message-id',
                timestamp: Date.now(),
                type: 'text',
                text: {
                  body: 'teste'
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

      const response = await fetch(`${domain}/api/whatsapp/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      });

      const data = await response.text();
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${data.substring(0, 200)}`);

    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 IMPORTANTE:');
  console.log('Verifique se o webhook do Meta está apontando para o domínio correto!');
  console.log('\n✅ Para atualizar no Meta WhatsApp Dashboard:');
  console.log('   1. Acesse: https://developers.facebook.com/apps/');
  console.log('   2. Selecione seu app');
  console.log('   3. WhatsApp → Configuração');
  console.log('   4. Atualize a URL do webhook');
  console.log('');
}

testAPI();
