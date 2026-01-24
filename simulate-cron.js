const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function toBrasiliaTime(date) {
  return new Date(date.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
}

function fromBrasiliaTime(brasiliaDate) {
  const year = brasiliaDate.getFullYear();
  const month = brasiliaDate.getMonth();
  const day = brasiliaDate.getDate();
  const hours = brasiliaDate.getHours();
  const minutes = brasiliaDate.getMinutes();
  const seconds = brasiliaDate.getSeconds();
  
  // Criar data em UTC, ajustando para timezone de Brasília (-3h)
  return new Date(Date.UTC(year, month, day, hours + 3, minutes, seconds));
}

async function main() {
  // Simular exatamente o que o cron faz
  const nowBrasilia = toBrasiliaTime(new Date());
  console.log('Agora Brasília:', nowBrasilia.toISOString());
  
  nowBrasilia.setHours(0, 0, 0, 0);
  console.log('Meia-noite Brasília:', nowBrasilia.toISOString());
  
  const todayStart = fromBrasiliaTime(nowBrasilia);
  console.log('todayStart (UTC):', todayStart.toISOString());
  
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  console.log('todayEnd (UTC):', todayEnd.toISOString());
  
  // Buscar follow-ups pendentes
  const pendingFollowUps = await prisma.followUp.findMany({
    where: {
      status: 'pending',
      scheduledDate: { gte: todayStart, lt: todayEnd },
    },
    include: { patient: true, surgery: true },
  });
  
  console.log('\nFollow-ups encontrados:', pendingFollowUps.length);
  
  for (const fu of pendingFollowUps) {
    console.log('  -', fu.patient.name, 'D+' + fu.dayNumber, '- scheduledDate:', fu.scheduledDate.toISOString());
  }
  
  // Verificar especificamente o D+3 da Francisca
  const franciscaFu = await prisma.followUp.findFirst({
    where: {
      patient: { name: { contains: 'Francisca' } },
      dayNumber: 3
    },
    include: { patient: true }
  });
  
  console.log('\n=== Francisca D+3 ===');
  console.log('scheduledDate:', franciscaFu.scheduledDate.toISOString());
  console.log('status:', franciscaFu.status);
  console.log('scheduledDate >= todayStart?', franciscaFu.scheduledDate >= todayStart);
  console.log('scheduledDate < todayEnd?', franciscaFu.scheduledDate < todayEnd);
}

main().catch(console.error).finally(() => prisma.$disconnect());
