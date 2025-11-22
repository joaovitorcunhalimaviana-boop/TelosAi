/**
 * Remove TODOS os dados do paciente João Vítor do banco de PRODUÇÃO
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

async function cleanPatientData() {
  console.log('\n🗑️  LIMPANDO DADOS DO PACIENTE\n');
  console.log('='.repeat(60));

  try {
    // Buscar paciente com telefone que contém 998663089
    const patient = await prisma.patient.findFirst({
      where: {
        phone: {
          contains: '998663089'
        }
      }
    });

    if (!patient) {
      console.log('✅ Nenhum paciente encontrado com esse telefone');
      console.log('   Banco já está limpo!');
      return;
    }

    console.log(`🔍 Paciente encontrado:`);
    console.log(`   Nome: ${patient.name}`);
    console.log(`   Telefone: ${patient.phone}`);
    console.log(`   ID: ${patient.id}\n`);

    console.log('🗑️  Deletando dados relacionados...\n');

    // 1. Deletar FollowUpResponses
    const deletedResponses = await prisma.followUpResponse.deleteMany({
      where: { followUp: { patientId: patient.id } }
    });
    console.log(`   ✅ ${deletedResponses.count} respostas de follow-up deletadas`);

    // 2. Deletar FollowUps
    const deletedFollowUps = await prisma.followUp.deleteMany({
      where: { patientId: patient.id }
    });
    console.log(`   ✅ ${deletedFollowUps.count} follow-ups deletados`);

    // 3. Deletar Complications
    const deletedComplications = await prisma.complication.deleteMany({
      where: { surgery: { patientId: patient.id } }
    });
    console.log(`   ✅ ${deletedComplications.count} complicações deletadas`);

    // 4. Deletar Surgeries
    const deletedSurgeries = await prisma.surgery.deleteMany({
      where: { patientId: patient.id }
    });
    console.log(`   ✅ ${deletedSurgeries.count} cirurgias deletadas`);

    // 5. Deletar o Patient
    await prisma.patient.delete({
      where: { id: patient.id }
    });
    console.log(`   ✅ Paciente deletado\n`);

    console.log('✅ TODOS OS DADOS FORAM REMOVIDOS COM SUCESSO!');
    console.log('\n📝 Agora você pode recadastrar o paciente pelo painel web.');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(60));
}

cleanPatientData();
