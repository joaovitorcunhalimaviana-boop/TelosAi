/**
 * Verifica TODOS os dados relacionados ao follow-up atual
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

async function checkFollowUpData() {
  console.log('\n🔍 VERIFICANDO DADOS COMPLETOS DO FOLLOW-UP\n');
  console.log('='.repeat(80));

  try {
    // Buscar paciente
    const patient = await prisma.patient.findUnique({
      where: { id: 'cmi9tk9lf0001jr04xyo941wh' }
    });

    if (!patient) {
      console.log('❌ Paciente não encontrado');
      return;
    }

    console.log(`\n✅ PACIENTE:`);
    console.log(`   ID: ${patient.id}`);
    console.log(`   Nome: ${patient.name}`);
    console.log(`   Telefone: ${patient.phone}`);
    console.log(`   User ID: ${patient.userId}`);
    console.log(`   Ativo: ${patient.isActive}`);

    // Buscar TODOS os follow-ups
    const allFollowUps = await prisma.followUp.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      include: {
        surgery: true,
        responses: true
      }
    });

    console.log(`\n📋 TOTAL DE FOLLOW-UPS: ${allFollowUps.length}\n`);

    allFollowUps.forEach((fu, index) => {
      console.log(`${index + 1}. Follow-up ID: ${fu.id}`);
      console.log(`   Status: ${fu.status}`);
      console.log(`   Dia: ${fu.dayNumber}`);
      console.log(`   Data agendada: ${fu.scheduledDate}`);
      console.log(`   Enviado em: ${fu.sentAt || 'N/A'}`);
      console.log(`   Cirurgia: ${fu.surgery?.type || 'N/A'}`);
      console.log(`   Respostas: ${fu.responses.length}`);

      if (fu.responses.length > 0) {
        fu.responses.forEach((resp, rIndex) => {
          console.log(`      Resposta ${rIndex + 1}:`);
          console.log(`         ID: ${resp.id}`);
          console.log(`         Criada em: ${resp.createdAt}`);
        });
      }
      console.log('');
    });

    // Verificar qual seria o pendingFollowUp na lógica atual
    const pendingFollowUp = allFollowUps.find(fu =>
      fu.status === 'sent' || fu.status === 'pending' || fu.status === 'in_progress'
    );

    if (pendingFollowUp) {
      console.log(`\n🎯 FOLLOW-UP ATIVO (que o webhook pegaria):`);
      console.log(`   ID: ${pendingFollowUp.id}`);
      console.log(`   Status: ${pendingFollowUp.status}`);
      console.log(`   Dia: ${pendingFollowUp.dayNumber}`);

      if (pendingFollowUp.status === 'sent') {
        console.log(`\n✅ Status é "sent" - Deveria aceitar "sim" e iniciar questionário`);
      } else if (pendingFollowUp.status === 'in_progress') {
        console.log(`\n⚠️  Status é "in_progress" - Deveria processar respostas do questionário`);
      } else {
        console.log(`\n❌ Status é "${pendingFollowUp.status}" - NÃO deveria iniciar questionário`);
      }
    } else {
      console.log(`\n❌ Nenhum follow-up pendente/sent/in_progress encontrado!`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(80));
}

checkFollowUpData();
