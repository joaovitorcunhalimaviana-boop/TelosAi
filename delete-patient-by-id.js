/**
 * Deleta o paciente específico por ID
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

async function deletePatient() {
  const patientId = 'cmi8g6xbt0001ic046sxx6d63';

  console.log('\n🗑️  DELETANDO PACIENTE E TODOS OS DADOS RELACIONADOS\n');
  console.log('='.repeat(60));
  console.log(`ID do paciente: ${patientId}\n`);

  try {
    // 1. Deletar FollowUpResponses
    const deletedResponses = await prisma.followUpResponse.deleteMany({
      where: { followUp: { patientId } }
    });
    console.log(`✅ ${deletedResponses.count} respostas de follow-up deletadas`);

    // 2. Deletar FollowUps
    const deletedFollowUps = await prisma.followUp.deleteMany({
      where: { patientId }
    });
    console.log(`✅ ${deletedFollowUps.count} follow-ups deletados`);

    // 3. Buscar cirurgias primeiro
    const surgeries = await prisma.surgery.findMany({
      where: { patientId },
      select: { id: true }
    });

    console.log(`Cirurgias encontradas: ${surgeries.length}`);

    // 4. Deletar complicações (se existir tabela)
    let deletedComplications = 0;
    for (const surgery of surgeries) {
      try {
        const result = await prisma.$executeRaw`DELETE FROM "Complication" WHERE "surgeryId" = ${surgery.id}`;
        deletedComplications += result;
      } catch (e) {
        // Tabela pode não existir
      }
    }
    console.log(`✅ ${deletedComplications} complicações deletadas`);

    // 5. Deletar Surgeries
    const deletedSurgeries = await prisma.surgery.deleteMany({
      where: { patientId }
    });
    console.log(`✅ ${deletedSurgeries.count} cirurgias deletadas`);

    // 5. Deletar o Patient
    await prisma.patient.delete({
      where: { id: patientId }
    });
    console.log(`✅ Paciente deletado\n`);

    console.log('✅ TODOS OS DADOS FORAM REMOVIDOS COM SUCESSO!');
    console.log('\n📝 Agora recadastre o paciente pelo painel web.');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(60));
}

deletePatient();
