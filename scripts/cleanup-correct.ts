import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  try {
    // Buscar pelo ID exato que encontramos
    const patient = await prisma.patient.findUnique({
      where: { id: 'cmi6ftv8b0001vdtgi4gbm5et' },
      include: {
        surgeries: {
          include: {
            followUps: true
          }
        },
        conversations: true
      }
    });

    if (!patient) {
      console.log('❌ Paciente não encontrado');
      process.exit(1);
    }

    console.log('👤 PACIENTE ENCONTRADO:', patient.name);
    console.log('📞 Telefone:', patient.phone);
    console.log('');

    // Deletar conversas
    const deletedConvs = await prisma.conversation.deleteMany({
      where: { patientId: patient.id }
    });
    console.log('✅ Conversas deletadas:', deletedConvs.count);

    let responsesDeleted = 0;
    let followUpsReset = 0;

    for (const surgery of patient.surgeries) {
      console.log(`\n🔄 Processando cirurgia: ${surgery.type}`);

      for (const followUp of surgery.followUps) {
        const deleted = await prisma.followUpResponse.deleteMany({
          where: { followUpId: followUp.id }
        });
        responsesDeleted += deleted.count;

        await prisma.followUp.update({
          where: { id: followUp.id },
          data: {
            status: 'pending',
            sentAt: null,
            respondedAt: null
          }
        });
        followUpsReset++;
      }
    }

    console.log('\n✅ Respostas de follow-up deletadas:', responsesDeleted);
    console.log('✅ Follow-ups resetados para pending:', followUpsReset);
    console.log('');
    console.log('🎉 ===================================');
    console.log('🎉 LIMPEZA COMPLETA!');
    console.log('🎉 Banco pronto para novos testes');
    console.log('🎉 ===================================');
  } catch (error) {
    console.error('❌ ERRO:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
