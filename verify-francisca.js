const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const patient = await prisma.patient.findFirst({
    where: { name: { contains: 'Francisca', mode: 'insensitive' } },
    include: {
      surgeries: {
        include: {
          followUps: {
            where: { dayNumber: 2 },
            include: {
              responses: true
            }
          }
        }
      }
    }
  });

  const fu = patient.surgeries[0].followUps[0];
  console.log('D+2 - Respostas restantes:', fu.responses.length);
  
  if (fu.responses.length > 0) {
    const r = fu.responses[0];
    console.log('Criada em:', r.createdAt);
    console.log('painAtRest:', r.painAtRest);
    console.log('painDuringBowel:', r.painDuringBowel);
    
    const data = JSON.parse(r.questionnaireData);
    console.log('pain (JSON):', data.pain);
    console.log('painDuringBowel (JSON):', data.painDuringBowel);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
