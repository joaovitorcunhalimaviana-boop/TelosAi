import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deletePatient() {
  try {
    const patientId = 'cmi6ftv8b0001vdtgi4gbm5et';

    console.log('🗑️  DELETANDO PACIENTE COMPLETAMENTE...\n');

    // 1. Deletar conversas
    const deletedConvs = await prisma.conversation.deleteMany({
      where: { patientId }
    });
    console.log('✅ Conversas deletadas:', deletedConvs.count);

    // 2. Buscar cirurgias do paciente
    const surgeries = await prisma.surgery.findMany({
      where: { patientId },
      include: { followUps: true }
    });

    let responsesDeleted = 0;
    let followUpsDeleted = 0;

    // 3. Deletar follow-ups e suas respostas
    for (const surgery of surgeries) {
      for (const followUp of surgery.followUps) {
        const deleted = await prisma.followUpResponse.deleteMany({
          where: { followUpId: followUp.id }
        });
        responsesDeleted += deleted.count;

        await prisma.followUp.delete({
          where: { id: followUp.id }
        });
        followUpsDeleted++;
      }
    }

    console.log('✅ Respostas deletadas:', responsesDeleted);
    console.log('✅ Follow-ups deletados:', followUpsDeleted);

    // 4. Deletar cirurgias
    const deletedSurgeries = await prisma.surgery.deleteMany({
      where: { patientId }
    });
    console.log('✅ Cirurgias deletadas:', deletedSurgeries.count);

    // 5. DELETAR O PACIENTE
    await prisma.patient.delete({
      where: { id: patientId }
    });
    console.log('✅ Paciente DELETADO');

    console.log('\n🎉 ===================================');
    console.log('🎉 PACIENTE COMPLETAMENTE REMOVIDO!');
    console.log('🎉 Agora pode cadastrar um novo');
    console.log('🎉 ===================================\n');
  } catch (error) {
    console.error('❌ ERRO:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deletePatient();
