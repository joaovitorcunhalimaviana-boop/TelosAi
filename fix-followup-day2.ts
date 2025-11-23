import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixFollowUpDay2() {
  console.log('\n🔧 CORRIGINDO FOLLOW-UP DO DIA 2\n');
  console.log('='.repeat(80));

  try {
    // Buscar follow-up do dia 2
    const followUpDay2 = await prisma.followUp.findFirst({
      where: {
        dayNumber: 2,
        status: 'sent'
      }
    });

    if (!followUpDay2) {
      console.log('❌ Follow-up do Dia 2 não encontrado!');
      return;
    }

    console.log('✅ Follow-up do Dia 2 encontrado:');
    console.log('   ID:', followUpDay2.id);
    console.log('   Status atual:', followUpDay2.status);

    // Atualizar para in_progress
    const updated = await prisma.followUp.update({
      where: {
        id: followUpDay2.id
      },
      data: {
        status: 'in_progress'
      }
    });

    console.log('\n✅ Follow-up atualizado!');
    console.log('   Novo status:', updated.status);
    console.log('');
    console.log('🎯 AGORA RESPONDA "SIM" NOVAMENTE NO WHATSAPP');
    console.log('   O sistema deve iniciar o questionário!');

  } catch (error) {
    console.error('\n❌ ERRO:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(80));
}

fixFollowUpDay2();
