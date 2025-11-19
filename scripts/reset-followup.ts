import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetFollowUp() {
  console.log('🔄 Resetando follow-up para teste...');

  const followUp = await prisma.followUp.updateMany({
    where: {
      status: {
        in: ['sent', 'responded']
      }
    },
    data: {
      status: 'pending',
      sentAt: null,
      respondedAt: null
    }
  });

  console.log(`✅ ${followUp.count} follow-up(s) resetado(s)`);

  // Mostrar follow-ups pendentes
  const pending = await prisma.followUp.findMany({
    where: { status: 'pending' },
    include: {
      patient: {
        select: {
          name: true,
          phone: true
        }
      }
    }
  });

  console.log('\n📋 Follow-ups pendentes:');
  pending.forEach(f => {
    console.log(`  - ${f.patient.name} (${f.patient.phone}) - D+${f.dayNumber} - ${f.scheduledDate}`);
  });

  await prisma.$disconnect();
}

resetFollowUp();
