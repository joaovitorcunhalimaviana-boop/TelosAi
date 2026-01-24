const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const patient = await prisma.patient.findFirst({
    where: { name: { contains: 'Francisca', mode: 'insensitive' } },
    include: {
      surgeries: {
        include: {
          followUps: {
            orderBy: { dayNumber: 'asc' }
          }
        }
      }
    }
  });

  if (!patient) {
    console.log('Paciente não encontrada');
    return;
  }

  console.log('=== FRANCISCA CÉLIA ===\n');
  
  const surgery = patient.surgeries[0];
  const surgeryDate = new Date(surgery.date);
  const today = new Date();
  const daysPostOp = Math.floor((today - surgeryDate) / (1000 * 60 * 60 * 24));
  
  console.log('Data da cirurgia:', surgeryDate.toISOString().split('T')[0]);
  console.log('Hoje:', today.toISOString().split('T')[0]);
  console.log('Dias pos-op:', daysPostOp);
  console.log('\n--- Follow-ups ---\n');

  for (const fu of surgery.followUps) {
    const isToday = fu.dayNumber === daysPostOp;
    const marker = isToday ? ' <-- HOJE' : '';
    console.log('D+' + fu.dayNumber + ': status=' + fu.status + ', sentAt=' + (fu.sentAt ? fu.sentAt.toISOString() : 'null') + marker);
  }

  // Verificar conversa
  const conversation = await prisma.conversation.findFirst({
    where: { patientId: patient.id }
  });

  if (conversation) {
    console.log('\n--- Conversa ---');
    console.log('Estado:', conversation.state);
    console.log('Ultima msg sistema:', conversation.lastSystemMessageAt ? conversation.lastSystemMessageAt.toISOString() : 'null');
    console.log('Ultima msg usuario:', conversation.lastUserMessageAt ? conversation.lastUserMessageAt.toISOString() : 'null');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
