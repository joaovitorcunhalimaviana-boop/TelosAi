import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sendFollowUpNow() {
  console.log('\n⏰ ANTECIPANDO ENVIO DE FOLLOW-UP\n');
  console.log('='.repeat(80));

  try {
    // 1. Buscar o follow-up pendente mais recente
    const pendingFollowUp = await prisma.followUp.findFirst({
      where: {
        status: {
          in: ['pending', 'sent']
        }
      },
      include: {
        patient: true,
        surgery: true
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    if (!pendingFollowUp) {
      console.log('❌ Nenhum follow-up pendente encontrado!');
      return;
    }

    console.log('✅ Follow-up encontrado:');
    console.log('   ID:', pendingFollowUp.id);
    console.log('   Paciente:', pendingFollowUp.patient.name);
    console.log('   Dia:', pendingFollowUp.dayNumber);
    console.log('   Status atual:', pendingFollowUp.status);
    console.log('   Data agendada:', pendingFollowUp.scheduledDate);

    // 2. Atualizar para enviar agora
    const now = new Date();
    const updated = await prisma.followUp.update({
      where: {
        id: pendingFollowUp.id
      },
      data: {
        scheduledDate: now,
        status: 'pending' // Garantir que está como pending para o cron job pegar
      }
    });

    console.log('\n✅ Follow-up atualizado!');
    console.log('   Nova data agendada:', updated.scheduledDate);
    console.log('   Novo status:', updated.status);
    console.log('');
    console.log('🎯 IMPORTANTE:');
    console.log('   O follow-up será enviado pelo cron job em até 1 minuto.');
    console.log('   Se quiser forçar envio imediato, acesse:');
    console.log('   https://sistema-pos-operatorio.vercel.app/api/cron/send-followups');
    console.log('');

  } catch (error) {
    console.error('\n❌ ERRO:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('='.repeat(80));
}

sendFollowUpNow();
