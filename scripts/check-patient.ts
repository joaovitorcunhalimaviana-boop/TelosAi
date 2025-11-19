import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPatient() {
  const patient = await prisma.patient.findUnique({
    where: { id: 'cmi5rhs6c0001nr0quc6l3asq' },
    include: {
      surgeries: {
        include: {
          followUps: true
        }
      }
    }
  });

  console.log('=== PATIENT DATA ===');
  console.log(JSON.stringify(patient, null, 2));

  await prisma.$disconnect();
}

checkPatient();
