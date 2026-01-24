const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const patient = await prisma.patient.findFirst({
    where: { name: { contains: 'Francisca', mode: 'insensitive' } },
    include: {
      surgeries: {
        include: {
          followUps: {
            where: { dayNumber: 3 }
          }
        }
      }
    }
  });

  const fu = patient.surgeries[0].followUps[0];
  
  console.log('D+3 Follow-up:');
  console.log('  ID:', fu.id);
  console.log('  Status:', fu.status);
  console.log('  scheduledDate:', fu.scheduledDate ? fu.scheduledDate.toISOString() : 'NULL');
  console.log('  sentAt:', fu.sentAt ? fu.sentAt.toISOString() : 'NULL');
  
  // Comparar com hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  console.log('\nHoje (UTC 00:00):', today.toISOString());
  console.log('Amanhã (UTC 00:00):', tomorrow.toISOString());
  
  if (fu.scheduledDate) {
    const isToday = fu.scheduledDate >= today && fu.scheduledDate < tomorrow;
    console.log('\nscheduledDate está no range de hoje?', isToday);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
