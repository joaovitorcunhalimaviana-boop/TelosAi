import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAll() {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        surgeries: {
          include: {
            followUps: true
          }
        },
        conversations: true
      }
    });

    console.log('\n📋 TODOS OS PACIENTES NO BANCO:');
    console.log('================================\n');

    if (patients.length === 0) {
      console.log('❌ Nenhum paciente encontrado no banco de dados.');
    } else {
      patients.forEach((patient, index) => {
        console.log(`${index + 1}. Nome: ${patient.name}`);
        console.log(`   ID: ${patient.id}`);
        console.log(`   Telefone: ${patient.phone}`);
        console.log(`   Cirurgias: ${patient.surgeries.length}`);
        console.log(`   Conversas: ${patient.conversations.length}`);
        console.log('');
      });
    }

    console.log(`\nTOTAL: ${patients.length} paciente(s)\n`);
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAll();
