const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Buscando follow-ups com múltiplas respostas...\n');

  // Buscar todos os follow-ups
  const followUps = await prisma.followUp.findMany({
    include: {
      responses: {
        orderBy: { createdAt: 'desc' }
      },
      patient: { select: { name: true } }
    }
  });

  let totalDeleted = 0;

  for (const fu of followUps) {
    if (fu.responses.length > 1) {
      console.log(fu.patient.name + ' - D+' + fu.dayNumber + ': ' + fu.responses.length + ' respostas');

      // Manter apenas a última (mais recente)
      const toDelete = fu.responses.slice(1); // Remove todos exceto o primeiro (que é o mais recente)

      for (const resp of toDelete) {
        console.log('  Deletando resposta de ' + resp.createdAt.toISOString());
        await prisma.followUpResponse.delete({ where: { id: resp.id } });
        totalDeleted++;
      }
    }
  }

  console.log('\n✅ Total de respostas duplicadas removidas: ' + totalDeleted);
}

main().catch(console.error).finally(() => prisma.$disconnect());
