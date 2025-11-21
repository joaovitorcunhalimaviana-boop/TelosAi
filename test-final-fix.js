/**
 * Teste final da correção do fallback
 */

async function testFinalFix() {
  console.log('\n🧪 TESTE FINAL DA CORREÇÃO\n');
  console.log('='.repeat(60));

  const domain = 'https://sistema-pos-operatorio-3vjzfwff5-joao-vitor-vianas-projects.vercel.app';
  const testPhone = '5583998663089';

  const webhookPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      changes: [{
        field: 'messages',
        value: {
          messages: [{
            from: testPhone,
            id: 'test-final-' + Date.now(),
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: 'text',
            text: {
              body: 'sim'
            }
          }],
          contacts: [{
            profile: {
              name: 'João Vítor Test'
            },
            wa_id: testPhone
          }],
          metadata: {
            phone_number_id: 'test',
            display_phone_number: '558398663089'
          }
        }
      }]
    }]
  };

  try {
    const url = `${domain}/api/whatsapp/webhook`;
    console.log(`\n📍 Testando: ${url}`);
    console.log(`📞 Telefone: ${testPhone}`);
    console.log(`💬 Mensagem: "sim"\n`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });

    console.log(`📥 Status: ${response.status}`);
    const responseText = await response.text();
    console.log(`📥 Response: ${responseText}\n`);

    if (response.status === 200) {
      console.log('✅ Webhook processou com sucesso!');
      console.log('');
      console.log('🔍 Agora verifique:');
      console.log('1. Se você recebeu mensagem no WhatsApp');
      console.log('2. Se foi a primeira pergunta do questionário');
      console.log('3. Ou se foi a mensagem de erro "não encontrei cadastro"');
    } else {
      console.log('❌ Erro no processamento');
    }

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testFinalFix();
