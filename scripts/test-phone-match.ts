import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPhoneMatch() {
  // Telefone cadastrado no banco
  const cadastrado = "(83) 99866-3089";
  console.log('📱 Telefone cadastrado:', cadastrado);

  // Telefone que vem do WhatsApp (formato internacional)
  const whatsapp = "558398663089"; // ou "5583998663089"
  console.log('📱 Telefone WhatsApp:', whatsapp);

  // Normalização
  const normalized = whatsapp.replace(/\D/g, '');
  console.log('🔢 Normalizado:', normalized);

  const last9 = normalized.slice(-9);
  console.log('🔢 Últimos 9:', last9);

  // Buscar no banco
  const patient = await prisma.patient.findFirst({
    where: {
      phone: {
        contains: last9,
      },
    },
  });

  console.log('\n=== RESULTADO ===');
  if (patient) {
    console.log('✅ Paciente encontrado!');
    console.log('Nome:', patient.name);
    console.log('Telefone:', patient.phone);
  } else {
    console.log('❌ Paciente NÃO encontrado');

    // Tentar outras variações
    console.log('\n=== TESTANDO VARIAÇÕES ===');

    const all = await prisma.patient.findMany({
      select: { id: true, name: true, phone: true }
    });

    console.log('Pacientes no banco:');
    all.forEach(p => console.log(`  - ${p.name}: ${p.phone}`));
  }

  await prisma.$disconnect();
}

testPhoneMatch();
