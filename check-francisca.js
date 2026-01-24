const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Buscar paciente Francisca
  const patient = await prisma.patient.findFirst({
    where: { name: { contains: 'Francisca', mode: 'insensitive' } },
    include: {
      surgeries: {
        include: {
          followUps: {
            include: {
              responses: {
                orderBy: { createdAt: 'desc' }
              }
            },
            orderBy: { dayNumber: 'desc' }
          }
        }
      }
    }
  });

  if (!patient) {
    console.log('Paciente não encontrada');
    return;
  }

  console.log('=== PACIENTE:', patient.name, '===\n');

  for (const surgery of patient.surgeries) {
    console.log('Cirurgia:', surgery.type, '- Data:', surgery.date);
    
    for (const followUp of surgery.followUps) {
      console.log('\n--- FollowUp D+' + followUp.dayNumber + ' ---');
      console.log('Status:', followUp.status);
      console.log('Respostas:', followUp.responses.length);
      
      for (const response of followUp.responses) {
        console.log('\n  Resposta criada em:', response.createdAt);
        console.log('  painAtRest (campo direto):', response.painAtRest);
        console.log('  painDuringBowel (campo direto):', response.painDuringBowel);
        
        try {
          const data = JSON.parse(response.questionnaireData);
          console.log('  pain (JSON):', data.pain);
          console.log('  painDuringBowelMovement (JSON):', data.painDuringBowelMovement);
          console.log('  Dados completos:', JSON.stringify(data, null, 2).substring(0, 500));
        } catch (e) {
          console.log('  Erro ao parsear JSON');
        }
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
