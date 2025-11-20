import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  try {
    const patient = await prisma.patient.findFirst({
      where: { phone: { contains: '83991664904' } },
      include: { surgeries: { include: { followUps: true } }, conversations: true }
    });

    if (!patient) {
      console.log('❌ Paciente não encontrado');
      process.exit(1);
    }

    console.log('👤 Paciente encontrado:', patient.name);

    const deletedConvs = await prisma.conversation.deleteMany({
      where: { patientId: patient.id }
    });
    console.log('✅ Conversas deletadas:', deletedConvs.count);

    let responsesDeleted = 0;
    let followUpsReset = 0;

    for (const surgery of patient.surgeries) {
      for (const followUp of surgery.followUps) {
        const deleted = await prisma.followUpResponse.deleteMany({
          where: { followUpId: followUp.id }
        });
        responsesDeleted += deleted.count;

        await prisma.followUp.update({
          where: { id: followUp.id },
          data: { status: 'pending', sentAt: null, respondedAt: null }
        });
        followUpsReset++;
      }
    }

    console.log('✅ Respostas deletadas:', responsesDeleted);
    console.log('✅ Follow-ups resetados:', followUpsReset);
    console.log('');
    console.log('🎉 LIMPEZA COMPLETA! Banco de dados limpo e pronto para novos testes.');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
