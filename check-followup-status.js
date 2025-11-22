/**
 * Verifica o status do follow-up do paciente
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFollowUp() {
  console.log('\n🔍 VERIFICANDO STATUS DO FOLLOW-UP\n');
  console.log('='.repeat(60));

  try {
    const patient = await prisma.patient.findFirst({
      where: {
        phone: {
          contains: '998663089'
        }
      }
    });

    if (!patient) {
      console.log('❌ Paciente não encontrado');
      return;
    }

    console.log(`✅ Paciente: ${patient.name}`);
    console.log(`   ID: ${patient.id}\n`);

    const followUps = await prisma.followUp.findMany({
      where: {
        patientId: patient.id
      },
      include: {
        surgery: true
      },
      orderBy: {
        scheduledDate: 'desc'
      }
    });

    console.log(`📋 Total de follow-ups: ${followUps.length}\n`);

    if (followUps.length === 0) {
      console.log('⚠️  Nenhum follow-up encontrado!');
      console.log('   Você precisa criar um follow-up com status "sent"');
      return;
    }

    followUps.forEach((fu, index) => {
      console.log(`${index + 1}. Follow-up:`);
      console.log(`   Status: ${fu.status}`);
      console.log(`   Dia: ${fu.dayNumber}`);
      console.log(`   Data agendada: ${fu.scheduledDate}`);
      console.log(`   Cirurgia: ${fu.surgery?.type || 'N/A'}`);
      console.log('');
    });

    const pendingFollowUp = followUps.find(fu =>
      fu.status === 'sent' || fu.status === 'pending'
    );

    if (pendingFollowUp) {
      console.log(`✅ Follow-up ${pendingFollowUp.status.toUpperCase()} encontrado!`);
      if (pendingFollowUp.status !== 'sent') {
        console.log(`\n⚠️  ATENÇÃO: Status é "${pendingFollowUp.status}", precisa ser "sent"`);
        console.log('   Vou atualizar para "sent" agora...\n');

        await prisma.followUp.update({
          where: { id: pendingFollowUp.id },
          data: { status: 'sent' }
        });

        console.log('✅ Status atualizado para "sent"!');
      }
    } else {
      console.log('❌ Nenhum follow-up PENDING ou SENT encontrado!');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(60));
}

checkFollowUp();
