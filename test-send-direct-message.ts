import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WHATSAPP_PHONE_NUMBER_ID = "866244236573219";
const WHATSAPP_ACCESS_TOKEN = "EAATN9ORQfVcBPxMLivSMuo5mZBR2H3g1MKNNQ3lAOK6fvNYZBaGB1oZAXfzvn37JICEcl16tRFggRsIP9tMXMZBZBt4GOu5wntLz1YhOB2LPF0w6ZBxjDViGXmLv2WFlTZANpDMwmglh0LYnflzVr3Tkd0FtLfCFhKmYCAo7nu5MivEXLTj7ZBkVpYrgIqwZB";

async function sendDirectMessage() {
  console.log('\n📱 ENVIANDO MENSAGEM DIRETA PARA TESTAR WEBHOOK\n');
  console.log('='.repeat(80));

  try {
    // 1. Buscar paciente
    const patient = await prisma.patient.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!patient) {
      console.log('❌ Nenhum paciente encontrado!');
      return;
    }

    console.log('✅ Paciente encontrado:', patient.name);
    console.log('   Telefone:', patient.phone);

    // 2. Enviar mensagem de texto simples
    const url = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: patient.phone,
      type: 'text',
      text: {
        body: `Olá ${patient.name.split(' ')[0]}! 👋\n\nPara iniciar o questionário pós-operatório, por favor responda com a palavra *"sim"*.\n\nEsta é uma mensagem de teste do sistema.`
      }
    };

    console.log('\n📤 Enviando mensagem...');
    console.log('   URL:', url);
    console.log('   Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.messages) {
      console.log('\n✅ Mensagem enviada com sucesso!');
      console.log('   ID da mensagem:', result.messages[0].id);
      console.log('   Status:', result.messages[0].message_status || 'sent');
      console.log('');
      console.log('🎯 AGORA RESPONDA "SIM" NO WHATSAPP');
      console.log('   O webhook deve receber a resposta e processar!');
    } else {
      console.log('\n❌ Erro ao enviar mensagem:');
      console.log(JSON.stringify(result, null, 2));
    }

    // 3. Atualizar follow-up para status "sent"
    const followUp = await prisma.followUp.findFirst({
      where: {
        patientId: patient.id,
        status: 'pending'
      }
    });

    if (followUp) {
      await prisma.followUp.update({
        where: { id: followUp.id },
        data: {
          status: 'sent',
          sentAt: new Date()
        }
      });
      console.log('\n✅ Follow-up marcado como "sent"');
    }

  } catch (error) {
    console.error('\n❌ ERRO:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(80));
}

sendDirectMessage();
