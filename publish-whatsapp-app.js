/**
 * Verifica status do app WhatsApp e tenta publicá-lo
 */

const WHATSAPP_APP_ID = "1352351593037143";
const WHATSAPP_APP_SECRET = "f8788e99231afa0bbb84685c4bea4924";
const WHATSAPP_BUSINESS_ACCOUNT_ID = "4331043357171950";
const WHATSAPP_ACCESS_TOKEN = "EAATN9ORQfVcBPxMLivSMuo5mZBR2H3g1MKNNQ3lAOK6fvNYZBaGB1oZAXfzvn37JICEcl16tRFggRsIP9tMXMZBZBt4GOu5wntLz1YhOB2LPF0w6ZBxjDViGXmLv2WFlTZANpDMwmglh0LYnflzVr3Tkd0FtLfCFhKmYCAo7nu5MivEXLTj7ZBkVpYrgIqwZB";

async function publishApp() {
  console.log('\n📱 VERIFICANDO E PUBLICANDO APP WHATSAPP\n');
  console.log('='.repeat(80));

  try {
    // 1. Verificar status atual do app
    console.log('\n1️⃣ VERIFICANDO STATUS DO APP:');
    const appUrl = `https://graph.facebook.com/v21.0/${WHATSAPP_APP_ID}?fields=name,link,category,subcategory,app_domains,restrictions&access_token=${WHATSAPP_ACCESS_TOKEN}`;
    const appResponse = await fetch(appUrl);
    const appData = await appResponse.json();

    if (appData.error) {
      console.log('❌ Erro ao buscar app:', appData.error.message);
    } else {
      console.log('✅ App encontrado:');
      console.log('   Nome:', appData.name);
      console.log('   ID:', appData.id);
      console.log('   Link:', appData.link || 'N/A');
      console.log('   Categoria:', appData.category || 'N/A');
    }

    // 2. Verificar apps inscritos no WABA
    console.log('\n2️⃣ VERIFICANDO INSCRIÇÃO DO APP NO WABA:');
    const subscribedUrl = `https://graph.facebook.com/v21.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/subscribed_apps?access_token=${WHATSAPP_ACCESS_TOKEN}`;
    const subscribedResponse = await fetch(subscribedUrl);
    const subscribedData = await subscribedResponse.json();

    let appSubscribed = false;
    if (subscribedData.data && subscribedData.data.length > 0) {
      console.log('✅ Apps inscritos:');
      subscribedData.data.forEach((app) => {
        console.log(`   App ID: ${JSON.stringify(app)}`);
        if (app.id === WHATSAPP_APP_ID || JSON.stringify(app).includes(WHATSAPP_APP_ID)) {
          appSubscribed = true;
        }
      });
    } else {
      console.log('⚠️  Nenhum app inscrito!');
    }

    // 3. Se não estiver inscrito, inscrever
    if (!appSubscribed) {
      console.log('\n3️⃣ INSCREVENDO APP NO WABA:');
      const subscribeUrl = `https://graph.facebook.com/v21.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/subscribed_apps`;
      const subscribeResponse = await fetch(subscribeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: WHATSAPP_ACCESS_TOKEN
        })
      });

      const subscribeResult = await subscribeResponse.json();
      if (subscribeResult.success) {
        console.log('✅ App inscrito com sucesso!');
      } else {
        console.log('❌ Erro ao inscrever app:', JSON.stringify(subscribeResult));
      }
    } else {
      console.log('\n✅ App já está inscrito no WABA');
    }

    // 4. Verificar webhooks do app
    console.log('\n4️⃣ VERIFICANDO WEBHOOKS:');
    const appAccessToken = `${WHATSAPP_APP_ID}|${WHATSAPP_APP_SECRET}`;
    const webhookUrl = `https://graph.facebook.com/v21.0/${WHATSAPP_APP_ID}/subscriptions?access_token=${appAccessToken}`;
    const webhookResponse = await fetch(webhookUrl);
    const webhookData = await webhookResponse.json();

    if (webhookData.data && webhookData.data.length > 0) {
      console.log('✅ Webhooks configurados:');
      webhookData.data.forEach((sub) => {
        console.log(`   Produto: ${sub.object}`);
        console.log(`   URL: ${sub.callback_url}`);
        console.log(`   Ativo: ${sub.active ? '✅' : '❌'}`);
        console.log('');
      });
    }

    // 5. Verificar permissões
    console.log('\n5️⃣ VERIFICANDO PERMISSÕES DO APP:');
    const permissionsUrl = `https://graph.facebook.com/v21.0/${WHATSAPP_APP_ID}/permissions?access_token=${WHATSAPP_ACCESS_TOKEN}`;
    const permissionsResponse = await fetch(permissionsUrl);
    const permissionsData = await permissionsResponse.json();

    if (permissionsData.data) {
      console.log('✅ Permissões:');
      permissionsData.data.forEach((perm) => {
        console.log(`   ${perm.permission}: ${perm.status}`);
      });
    }

    // 6. Testar envio de mensagem
    console.log('\n6️⃣ TESTANDO ENVIO DE MENSAGEM DE TESTE:');
    const testPhoneNumber = "5583998663089"; // Número do paciente
    const sendUrl = `https://graph.facebook.com/v21.0/866244236573219/messages`;

    const sendResponse = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: testPhoneNumber,
        type: 'text',
        text: {
          body: '🧪 TESTE DE SISTEMA - Se você receber esta mensagem, o webhook está funcionando! Por favor, responda com "teste" para confirmar.'
        }
      })
    });

    const sendResult = await sendResponse.json();
    if (sendResult.messages) {
      console.log('✅ Mensagem de teste enviada com sucesso!');
      console.log('   ID da mensagem:', sendResult.messages[0].id);
      console.log('   Status:', sendResult.messages[0].message_status);
      console.log('\n🎯 AGORA RESPONDA A MENSAGEM NO WHATSAPP COM "teste"');
      console.log('   Vou monitorar os logs por 30 segundos...');

      // Aguardar 5 segundos antes de verificar logs
      console.log('\n⏳ Aguardando resposta...');

    } else {
      console.log('❌ Erro ao enviar mensagem:', JSON.stringify(sendResult));
    }

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
  }

  console.log('\n' + '='.repeat(80));
}

publishApp();
