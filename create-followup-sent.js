/**
 * Cria um follow-up com status "sent" para teste
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

async function createFollowUp() {
  console.log('\n📝 CRIANDO FOLLOW-UP DE TESTE\n');
  console.log('='.repeat(60));

  try {
    // Buscar o paciente mais recente
    const patient = await prisma.patient.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!patient) {
      console.log('❌ Nenhum paciente encontrado');
      return;
    }

    console.log(`✅ Paciente: ${patient.name}`);
    console.log(`   Telefone: ${patient.phone}`);
    console.log(`   ID: ${patient.id}\n`);

    // Buscar a cirurgia do paciente
    const surgery = await prisma.surgery.findFirst({
      where: { patientId: patient.id },
      orderBy: { date: 'desc' }
    });

    if (!surgery) {
      console.log('❌ Nenhuma cirurgia encontrada para esse paciente');
      return;
    }

    console.log(`✅ Cirurgia: ${surgery.type}`);
    console.log(`   Data: ${surgery.date}`);
    console.log(`   ID: ${surgery.id}\n`);

    // Criar follow-up com status "sent"
    const followUp = await prisma.followUp.create({
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

    console.log('✅ Follow-up criado com sucesso!');
    console.log(`   ID: ${followUp.id}`);
    console.log(`   Status: ${followUp.status}`);
    console.log(`   Dia: ${followUp.dayNumber}`);
    console.log(`   Data agendada: ${followUp.scheduledDate}`);
    console.log(`   Enviado em: ${followUp.sentAt}\n`);

    console.log('🎉 PRONTO! Agora você pode testar enviando "sim" pelo WhatsApp!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(60));
}

createFollowUp();
