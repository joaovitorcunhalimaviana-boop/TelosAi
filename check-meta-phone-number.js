/**
 * Verifica qual número está configurado para receber mensagens
 */

const WHATSAPP_PHONE_NUMBER_ID = "866244236573219";
const WHATSAPP_ACCESS_TOKEN = "EAATN9ORQfVcBPxMLivSMuo5mZBR2H3g1MKNNQ3lAOK6fvNYZBaGB1oZAXfzvn37JICEcl16tRFggRsIP9tMXMZBZBt4GOu5wntLz1YhOB2LPF0w6ZBxjDViGXmLv2WFlTZANpDMwmglh0LYnflzVr3Tkd0FtLfCFhKmYCAo7nu5MivEXLTj7ZBkVpYrgIqwZB";

async function checkPhoneNumber() {
  console.log('\n📱 VERIFICANDO CONFIGURAÇÃO DO NÚMERO DE TELEFONE\n');
  console.log('='.repeat(80));

  try {
    // Buscar informações do Phone Number
    const url = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}?access_token=${WHATSAPP_ACCESS_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.log('❌ Erro:', data.error.message);
      return;
    }

    console.log('\n✅ NÚMERO DE TELEFONE CONFIGURADO:');
    console.log('   ID:', data.id);
    console.log('   Número:', data.display_phone_number);
    console.log('   Nome verificado:', data.verified_name);
    console.log('   Quality:', data.quality_rating);
    console.log('   Status:', data.code_verification_status);

    console.log('\n🎯 PONTO CRÍTICO:');
    console.log('   O usuário está enviando mensagens para:', data.display_phone_number);
    console.log('   Este número DEVE ser o mesmo que aparece no WhatsApp do usuário!');

    // Verificar mensagens recentes (se disponível)
    console.log('\n📨 TENTANDO BUSCAR MENSAGENS RECENTES:');
    const messagesUrl = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages?access_token=${WHATSAPP_ACCESS_TOKEN}`;
    const messagesResponse = await fetch(messagesUrl);
    const messagesData = await messagesResponse.json();

    if (messagesData.error) {
      console.log('   ⚠️  Não foi possível buscar mensagens:', messagesData.error.message);
    } else if (messagesData.data && messagesData.data.length > 0) {
      console.log(`   Encontradas ${messagesData.data.length} mensagens`);
      messagesData.data.slice(0, 5).forEach((msg, i) => {
        console.log(`   ${i + 1}. ${JSON.stringify(msg).substring(0, 100)}`);
      });
    } else {
      console.log('   Nenhuma mensagem encontrada via API');
    }

    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('   1. Confirme que o usuário está enviando mensagens para:', data.display_phone_number);
    console.log('   2. Peça ao usuário para enviar uma mensagem AGORA');
    console.log('   3. Verifique os logs do Vercel imediatamente após');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
  }

  console.log('\n' + '='.repeat(80));
}

checkPhoneNumber();
