const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixFrancisca() {
  // Buscar paciente Francisca Célia
  const patient = await prisma.patient.findFirst({
    where: {
      name: { contains: 'Francisca', mode: 'insensitive' }
    }
  });

  if (!patient) {
    console.log('Paciente não encontrada');
    return;
  }

  console.log('=== PACIENTE ===');
  console.log('ID:', patient.id);
  console.log('Nome:', patient.name);

  // Buscar follow-up D+3
  const d3FollowUp = await prisma.followUp.findFirst({
    where: {
      patientId: patient.id,
      dayNumber: 3
    },
    include: {
      responses: true
    }
  });

  if (!d3FollowUp) {
    console.log('Follow-up D+3 não encontrado');
    return;
  }

  console.log('\n=== D+3 ANTES DA CORREÇÃO ===');
  console.log('ID:', d3FollowUp.id);
  console.log('Status:', d3FollowUp.status);
  console.log('Responses:', d3FollowUp.responses.length);

  if (d3FollowUp.responses.length > 0) {
    console.log('\n=== DELETANDO RESPOSTAS ERRADAS DO D+3 ===');
    for (const response of d3FollowUp.responses) {
      console.log('Deletando resposta ID:', response.id, 'criada em:', response.createdAt);
      await prisma.followUpResponse.delete({
        where: { id: response.id }
      });
    }
  }

  // Resetar D+3 para pending
  console.log('\n=== RESETANDO D+3 PARA PENDING ===');
  await prisma.followUp.update({
    where: { id: d3FollowUp.id },
    data: {
      status: 'pending',
      sentAt: null,
      respondedAt: null
    }
  });

  // Verificar resultado
  const d3Fixed = await prisma.followUp.findUnique({
    where: { id: d3FollowUp.id },
    include: { responses: true }
  });

  console.log('\n=== D+3 APÓS CORREÇÃO ===');
  console.log('ID:', d3Fixed.id);
  console.log('Status:', d3Fixed.status);
  console.log('Sent At:', d3Fixed.sentAt);
  console.log('Responses:', d3Fixed.responses.length);

  // Verificar conversa e limpar contexto
  const conversation = await prisma.conversation.findFirst({
    where: { patientId: patient.id }
  });

  if (conversation) {
    console.log('\n=== RESETANDO CONVERSA PARA IDLE ===');
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        state: 'idle',
        context: {}
      }
    });
    console.log('Conversa resetada para idle');
  }

  console.log('\n✅ CORREÇÃO CONCLUÍDA!');
  console.log('D+3 está pendente e será enviado amanhã (2026-01-23) às 10h');

  await prisma.$disconnect();
}

fixFrancisca().catch(console.error);
