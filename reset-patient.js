const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Listar pacientes
  const patients = await prisma.patient.findMany({ take: 5 });
  console.log('Pacientes encontrados:');
  patients.forEach(p => console.log('-', p.name, '|', p.phone));

  // Listar conversas
  const convs = await prisma.conversation.findMany({ take: 5 });
  console.log('\nConversas encontradas:');
  convs.forEach(c => console.log('-', c.phoneNumber, '| state:', c.state));

  // Buscar paciente João
  const patient = patients.find(p => p.name.includes('João') || p.phone.includes('9866'));

  if (patient) {
    console.log('\n>>> Resetando paciente:', patient.name);

    // Resetar conversa pelo telefone
    const phoneDigits = patient.phone.replace(/\D/g, '').slice(-8);

    const convUpdate = await prisma.conversation.updateMany({
      where: {
        OR: [
          { patientId: patient.id },
          { phoneNumber: { contains: phoneDigits } }
        ]
      },
      data: {
        state: 'idle',
        context: {},
        messageHistory: []
      }
    });
    console.log('Conversas resetadas:', convUpdate.count);

    // Resetar follow-ups
    const fuUpdate = await prisma.followUp.updateMany({
      where: { patientId: patient.id },
      data: { status: 'pending', respondedAt: null }
    });
    console.log('Follow-ups resetados:', fuUpdate.count);

    // Deletar respostas
    const respDelete = await prisma.followUpResponse.deleteMany({
      where: { followUp: { patientId: patient.id } }
    });
    console.log('Respostas deletadas:', respDelete.count);
  } else {
    console.log('\nPaciente não encontrado!');
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
