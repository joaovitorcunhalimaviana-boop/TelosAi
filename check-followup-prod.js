/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Verifica status dos follow-ups conectando no banco de PRODUÇÃO
 */

const { PrismaClient } = require('@prisma/client');

// URL do banco de produção
const DATABASE_URL = "postgresql://neondb_owner:npg_F9Kb4mPoVtcB@ep-royal-voice-ae6ov58i-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function checkFollowUp() {
  console.log('\n🔍 VERIFICANDO FOLLOW-UPS NO BANCO DE PRODUÇÃO\n');
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
    console.log(`   ID: ${patient.id}`);
    console.log(`   Telefone: ${patient.phone}\n`);

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
      return;
    }

    followUps.forEach((fu, index) => {
      console.log(`${index + 1}. Follow-up:`);
      console.log(`   ID: ${fu.id}`);
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
      console.log(`   ID: ${pendingFollowUp.id}`);

      if (pendingFollowUp.status !== 'sent') {
        console.log(`\n⚠️  ATENÇÃO: Status é "${pendingFollowUp.status}", mas precisa ser "sent"`);
        console.log('   Atualizando para "sent" agora...\n');

        await prisma.followUp.update({
          where: { id: pendingFollowUp.id },
          data: {
            status: 'sent',
            sentAt: new Date()
          }
        });

        console.log('✅ Status atualizado para "sent"!');
      } else {
        console.log('\n✅ Status já está "sent" - pronto para receber "sim"!');
      }
    } else {
      console.log('❌ Nenhum follow-up PENDING ou SENT encontrado!');
      console.log('\n📝 Vou criar um novo follow-up de teste...\n');

      const surgery = await prisma.surgery.findFirst({
        where: { patientId: patient.id },
        orderBy: { date: 'desc' }
      });

      if (surgery) {
        const newFollowUp = await prisma.followUp.create({
          data: {
            patientId: patient.id,
            surgeryId: surgery.id,
            userId: patient.userId,
            dayNumber: 7,
            scheduledDate: new Date(),
            status: 'sent',
            sentAt: new Date()
          }
        });

        console.log('✅ Follow-up criado!');
        console.log(`   ID: ${newFollowUp.id}`);
        console.log(`   Status: ${newFollowUp.status}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(60));
}

checkFollowUp();
