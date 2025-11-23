import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetEverything() {
  console.log('\n🗑️  LIMPEZA TOTAL DO BANCO DE DADOS\n');
  console.log('='.repeat(80));

  try {
    // 1. Deletar todas as respostas
    const deletedResponses = await prisma.followUpResponse.deleteMany({});
    console.log(`✅ Deletadas ${deletedResponses.count} respostas de follow-up`);

    // 2. Deletar todos os follow-ups
    const deletedFollowUps = await prisma.followUp.deleteMany({});
    console.log(`✅ Deletados ${deletedFollowUps.count} follow-ups`);

    // 3. Deletar todas as cirurgias
    const deletedSurgeries = await prisma.surgery.deleteMany({});
    console.log(`✅ Deletadas ${deletedSurgeries.count} cirurgias`);

    // 4. Deletar todos os pacientes
    const deletedPatients = await prisma.patient.deleteMany({});
    console.log(`✅ Deletados ${deletedPatients.count} pacientes`);

    // 5. Deletar todos os usuários (exceto admin se existir)
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          not: 'admin@example.com' // Preservar admin se existir
        }
      }
    });
    console.log(`✅ Deletados ${deletedUsers.count} usuários`);

    console.log('\n🎉 BANCO DE DADOS COMPLETAMENTE LIMPO!\n');
    console.log('Agora você pode cadastrar um novo paciente do zero.\n');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ ERRO ao limpar banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetEverything();
