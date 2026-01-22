const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function investigate() {
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
  console.log('Telefone:', patient.phone);
  console.log('Criado em:', patient.createdAt);
  console.log('');

  // Buscar cirurgia
  const surgery = await prisma.surgery.findFirst({
    where: { patientId: patient.id }
  });

  if (surgery) {
    console.log('=== CIRURGIA ===');
    console.log('ID:', surgery.id);
    console.log('Tipo:', surgery.type);
    console.log('Data:', surgery.date);
    console.log('Status:', surgery.status);

    // Calcular dias desde a cirurgia
    const surgeryDate = new Date(surgery.date);
    const today = new Date();
    const diffTime = today.getTime() - surgeryDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    console.log('Dias desde cirurgia:', diffDays);
    console.log('');
  }

  // Buscar follow-ups
  const followUps = await prisma.followUp.findMany({
    where: { patientId: patient.id },
    include: {
      responses: {
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { dayNumber: 'asc' }
  });

  console.log('=== FOLLOW-UPS ===');
  for (const fu of followUps) {
    console.log('---');
    console.log('Day Number:', fu.dayNumber);
    console.log('Status:', fu.status);
    console.log('Scheduled Date:', fu.scheduledDate);
    console.log('Sent At:', fu.sentAt);
    console.log('Responses:', fu.responses.length);
    if (fu.responses.length > 0) {
      console.log('  Última resposta:', fu.responses[0].createdAt);
      console.log('  Risk Level:', fu.responses[0].riskLevel);
    }
  }

  // Buscar conversa
  const conversation = await prisma.conversation.findFirst({
    where: { patientId: patient.id }
  });

  if (conversation) {
    console.log('');
    console.log('=== CONVERSA ===');
    console.log('ID:', conversation.id);
    console.log('Estado:', conversation.state);
    console.log('Follow-up ID:', conversation.currentFollowUpId);
    console.log('Day Number:', conversation.currentDayNumber);
    console.log('Updated At:', conversation.updatedAt);

    const history = conversation.messageHistory || [];
    console.log('Total mensagens:', history.length);

    // Mostrar últimas 15 mensagens
    console.log('');
    console.log('=== ÚLTIMAS 15 MENSAGENS ===');
    const last15 = history.slice(-15);
    for (const msg of last15) {
      const role = msg.role === 'user' ? 'PACIENTE' : 'IA';
      const content = msg.content.substring(0, 150) + (msg.content.length > 150 ? '...' : '');
      console.log('[' + role + ']:', content);
      console.log('');
    }
  }

  await prisma.$disconnect();
}

investigate().catch(console.error);
