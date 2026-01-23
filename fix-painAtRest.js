const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Buscar todas as respostas onde painAtRest é null mas pain existe no JSON
  const responses = await prisma.followUpResponse.findMany({
    where: { painAtRest: null }
  });

  let fixed = 0;
  for (const r of responses) {
    try {
      const data = JSON.parse(r.questionnaireData);
      if (data.pain !== undefined && data.pain !== null) {
        await prisma.followUpResponse.update({
          where: { id: r.id },
          data: { painAtRest: data.pain }
        });
        console.log('Corrigido: painAtRest = ' + data.pain + ' (ID: ' + r.id + ')');
        fixed++;
      }
    } catch (e) {
      // ignore
    }
  }

  console.log('\nTotal corrigidos: ' + fixed);
}

main().catch(console.error).finally(() => prisma.$disconnect());
