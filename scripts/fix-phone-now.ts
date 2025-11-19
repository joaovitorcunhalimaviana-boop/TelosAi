import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPhone() {
  console.log('🔧 Corrigindo telefone no banco para incluir código do país...');

  // Atualizar telefone para incluir código do país
  const result = await prisma.patient.updateMany({
    where: {
      phone: { contains: '99866' }
    },
    data: {
      phone: '558398663089' // COM código de país
    }
  });

  console.log(`✅ ${result.count} paciente(s) atualizado(s)`);

  // Verificar
  const patient = await prisma.patient.findFirst({
    where: { phone: { contains: '99866' } }
  });

  console.log('\n📱 Telefone atualizado:', patient?.phone);

  await prisma.$disconnect();
}

fixPhone();
