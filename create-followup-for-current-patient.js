/**
 * Cria follow-up com status "sent" para o paciente atual
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
    // Buscar o paciente João Vítor Viana
    const patient = await prisma.patient.findUnique({
      where: { id: 'cmi9tk9lf0001jr04xyo941wh' }
    });

    if (!patient) {
      console.log('❌ Paciente não encontrado');
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

    // Verificar se já existe follow-up com status "sent"
    const existingFollowUp = await prisma.followUp.findFirst({
      where: {
        patientId: patient.id,
        status: 'sent'
      }
    });

    if (existingFollowUp) {
      console.log('✅ Já existe follow-up com status "sent"');
      console.log(`   ID: ${existingFollowUp.id}`);
      console.log(`   Status: ${existingFollowUp.status}`);
      console.log(`   Dia: ${existingFollowUp.dayNumber}`);
      console.log(`   Data agendada: ${existingFollowUp.scheduledDate}`);
      console.log(`   Enviado em: ${existingFollowUp.sentAt}\n`);
      console.log('🎉 PRONTO! Você pode testar enviando "sim" pelo WhatsApp!');
      return;
    }

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
