/**
 * Verifica a configuração do webhook no Meta WhatsApp Business
 */

const WHATSAPP_BUSINESS_ACCOUNT_ID = "4331043357171950";
const WHATSAPP_ACCESS_TOKEN = "EAATN9ORQfVcBPxMLivSMuo5mZBR2H3g1MKNNQ3lAOK6fvNYZBaGB1oZAXfzvn37JICEcl16tRFggRsIP9tMXMZBZBt4GOu5wntLz1YhOB2LPF0w6ZBxjDViGXmLv2WFlTZANpDMwmglh0LYnflzVr3Tkd0FtLfCFhKmYCAo7nu5MivEXLTj7ZBkVpYrgIqwZB";
const WHATSAPP_APP_ID = "1352351593037143";
const WHATSAPP_APP_SECRET = "f8788e99231afa0bbb84685c4bea4924";

async function verifyWebhook() {
  console.log('\n🔍 VERIFICANDO CONFIGURAÇÃO DO WEBHOOK NO META\n');
  console.log('='.repeat(80));

  try {
    // 1. Verificar informações da conta WhatsApp Business
    console.log('\n📱 1. INFORMAÇÕES DA CONTA WHATSAPP BUSINESS:');
    const accountUrl = `https://graph.facebook.com/v21.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}?access_token=${WHATSAPP_ACCESS_TOKEN}`;
    const accountResponse = await fetch(accountUrl);
    const accountData = await accountResponse.json();

    if (accountData.error) {
      console.log('❌ Erro ao buscar conta:', accountData.error.message);
    } else {
      console.log('✅ Conta encontrada:');
      console.log('   ID:', accountData.id);
      console.log('   Nome:', accountData.name || 'N/A');
      console.log('   Status:', accountData.account_review_status || 'N/A');
    }

    // 2. Verificar Phone Numbers
    console.log('\n📞 2. NÚMEROS DE TELEFONE CONFIGURADOS:');
    const phonesUrl = `https://graph.facebook.com/v21.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/phone_numbers?access_token=${WHATSAPP_ACCESS_TOKEN}`;
    const phonesResponse = await fetch(phonesUrl);
    const phonesData = await phonesResponse.json();

    if (phonesData.error) {
      console.log('❌ Erro ao buscar telefones:', phonesData.error.message);
    } else if (phonesData.data && phonesData.data.length > 0) {
      phonesData.data.forEach((phone, index) => {
        console.log(`   ${index + 1}. ${phone.display_phone_number}`);
        console.log(`      ID: ${phone.id}`);
        console.log(`      Status: ${phone.verified_name || 'N/A'}`);
        console.log(`      Quality: ${phone.quality_rating || 'N/A'}`);
      });
    } else {
      console.log('   ⚠️  Nenhum número encontrado');
    }

    // 3. Verificar configurações do webhook via App (com App Secret)
    console.log('\n🔗 3. VERIFICANDO CONFIGURAÇÃO DO APP:');
    const appAccessToken = `${WHATSAPP_APP_ID}|${WHATSAPP_APP_SECRET}`;
    const appUrl = `https://graph.facebook.com/v21.0/${WHATSAPP_APP_ID}/subscriptions?access_token=${appAccessToken}`;
    const appResponse = await fetch(appUrl);
    const appData = await appResponse.json();

    if (appData.error) {
      console.log('❌ Erro ao buscar configuração do app:', appData.error.message);
      console.log('   Código:', appData.error.code);
      console.log('   Tipo:', appData.error.type);
    } else if (appData.data && appData.data.length > 0) {
      console.log('✅ Webhooks configurados:');
      appData.data.forEach((subscription, index) => {
        console.log(`\n   ${index + 1}. Produto: ${subscription.object}`);
        console.log(`      Callback URL: ${subscription.callback_url || 'N/A'}`);
        console.log(`      Campos: ${(subscription.fields || []).map(f => f.name).join(', ')}`);
        console.log(`      Ativo: ${subscription.active ? '✅ SIM' : '❌ NÃO'}`);
      });
    } else {
      console.log('   ⚠️  Nenhum webhook configurado no app');
    }

    // 4. Tentar verificar subscribed_apps do WABA
    console.log('\n📋 4. APPS INSCRITOS NA CONTA WHATSAPP:');
    const subscribedUrl = `https://graph.facebook.com/v21.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/subscribed_apps?access_token=${WHATSAPP_ACCESS_TOKEN}`;
    const subscribedResponse = await fetch(subscribedUrl);
    const subscribedData = await subscribedResponse.json();

    if (subscribedData.error) {
      console.log('❌ Erro:', subscribedData.error.message);
    } else if (subscribedData.data && subscribedData.data.length > 0) {
      subscribedData.data.forEach((app, index) => {
        console.log(`   ${index + 1}. App ID: ${app.id || app}`);
        console.log(`      Inscrições: ${app.subscribed_fields ? app.subscribed_fields.join(', ') : 'N/A'}`);
      });
    } else {
      console.log('   ⚠️  Nenhum app inscrito');
    }

    // 5. Informações de debug
    console.log('\n🔧 5. INFORMAÇÕES DE DEBUG:');
    console.log('   URL esperada do webhook:');
    console.log('   https://sistema-pos-operatorio.vercel.app/api/whatsapp/webhook');
    console.log('');
    console.log('   Token de verificação configurado:');
    console.log('   meu-token-super-secreto-2024');

  } catch (error) {
    console.error('\n❌ ERRO GERAL:', error.message);
  }

  console.log('\n' + '='.repeat(80));
}

verifyWebhook();
