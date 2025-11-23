import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WHATSAPP_PHONE_NUMBER_ID = "866244236573219";
const WHATSAPP_ACCESS_TOKEN = "EAATN9ORQfVcBPxMLivSMuo5mZBR2H3g1MKNNQ3lAOK6fvNYZBaGB1oZAXfzvn37JICEcl16tRFggRsIP9tMXMZBZBt4GOu5wntLz1YhOB2LPF0w6ZBxjDViGXmLv2WFlTZANpDMwmglh0LYnflzVr3Tkd0FtLfCFhKmYCAo7nu5MivEXLTj7ZBkVpYrgIqwZB";

async function fixCorrectDay() {
  console.log('\n🔧 CORRIGINDO PARA O DIA CORRETO (D1)\n');
  console.log('='.repeat(80));

  try {
    const patient = await prisma.patient.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!patient) {
      console.log('❌ Nenhum paciente encontrado!');
      return;
    }

    console.log('✅ Paciente:', patient.name);

    // 1. Resetar Dia 2 para pending
    await prisma.followUp.updateMany({
      where: {
        patientId: patient.id,
        dayNumber: 2
      },
      data: {
        status: 'pending',
        sentAt: null,
        respondedAt: null
      }
    });
    console.log('✅ Dia 2 resetado para pending');

    // 2. Resetar todos os outros dias para pending também
    await prisma.followUp.updateMany({
      where: {
        patientId: patient.id,
        dayNumber: {
          not: 1
        }
      },
      data: {
        status: 'pending',
        sentAt: null,
        respondedAt: null
      }
    });
    console.log('✅ Todos os outros dias resetados');

    // 3. Marcar Dia 1 como sent
    const day1 = await prisma.followUp.findFirst({
      where: {
        patientId: patient.id,
        dayNumber: 1
      }
    });

    if (!day1) {
      console.log('❌ Dia 1 não encontrado!');
      return;
    }

    await prisma.followUp.update({
      where: { id: day1.id },
      data: {
        status: 'sent',
        sentAt: new Date()
      }
    });
    console.log('✅ Dia 1 marcado como sent');

    // 4. Enviar mensagem do Dia 1
    const url = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: patient.phone,
      type: 'text',
      text: {
        body: `Olá ${patient.name.split(' ')[0]}! 👋\n\nEspero que sua cirurgia tenha corrido bem!\n\nPara iniciar o questionário pós-operatório do DIA 1, por favor responda com a palavra *"sim"*.\n\nVou fazer algumas perguntas sobre como você está se sentindo.`
      }
    };

    console.log('\n📤 Enviando mensagem do Dia 1...');

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
      console.log('\n✅ Mensagem do Dia 1 enviada com sucesso!');
      console.log('   ID da mensagem:', result.messages[0].id);
      console.log('');
      console.log('🎯 AGORA RESPONDA "SIM" NO WHATSAPP');
      console.log('   O questionário do Dia 1 deve iniciar!');
    } else {
      console.log('\n❌ Erro ao enviar mensagem:');
      console.log(JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error('\n❌ ERRO:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(80));
}

fixCorrectDay();
