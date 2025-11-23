import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFollowUpStatus() {
  console.log('\n🔍 VERIFICANDO STATUS DO FOLLOW-UP\n');
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
    console.log('   Telefone:', patient.phone);

    const followUps = await prisma.followUp.findMany({
      where: {
        patientId: patient.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\n📋 FOLLOW-UPS ENCONTRADOS:', followUps.length);
    followUps.forEach((fu, index) => {
      console.log(`\n   ${index + 1}. Follow-up ID: ${fu.id}`);
      console.log(`      Status: ${fu.status}`);
      console.log(`      Dia: ${fu.dayNumber}`);
      console.log(`      Criado em: ${fu.createdAt}`);
      console.log(`      Enviado em: ${fu.sentAt || 'Não enviado'}`);
      console.log(`      Respondido em: ${fu.respondedAt || 'Não respondido'}`);
    });

    // Verificar qual seria retornado pela busca
    const pendingFollowUp = await prisma.followUp.findFirst({
      where: {
        patientId: patient.id,
        status: {
          in: ['sent', 'pending', 'in_progress']
        }
      },
      orderBy: {
        scheduledDate: 'desc'
      }
    });

    console.log('\n🎯 FOLLOW-UP QUE SERIA RETORNADO PELA BUSCA:');
    if (pendingFollowUp) {
      console.log(`   ID: ${pendingFollowUp.id}`);
      console.log(`   Status: ${pendingFollowUp.status}`);
      console.log(`   Dia: ${pendingFollowUp.dayNumber}`);
    } else {
      console.log('   ❌ Nenhum follow-up pendente encontrado!');
    }

  } catch (error) {
    console.error('\n❌ ERRO:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(80));
}

checkFollowUpStatus();
