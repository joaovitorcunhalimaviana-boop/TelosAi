/**
 * Script para testar diferentes métodos de busca de telefone
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSearch() {
  console.log('\n🧪 TESTANDO DIFERENTES MÉTODOS DE BUSCA\n');
  console.log('='.repeat(60));

  const testPhone = '5583998663089'; // O que o WhatsApp envia
  const normalized = testPhone.replace(/\D/g, '');
  const last11 = normalized.slice(-11); // 83998663089
  const last9 = normalized.slice(-9);   // 998663089
  const last8 = normalized.slice(-8);   // 98663089

  console.log(`\nTelefone de teste: ${testPhone}`);
  console.log(`Normalizado: ${normalized}`);
  console.log(`Últimos 11: ${last11}`);
  console.log(`Últimos 9: ${last9}`);
  console.log(`Últimos 8: ${last8}\n`);

  try {
    // Método 1: contains
    console.log('1️⃣  Testando: contains (últimos 11)');
    let patient = await prisma.patient.findFirst({
      where: {
        phone: {
          contains: last11
        }
      }
    });
    console.log(`   Resultado: ${patient ? '✅ ENCONTROU ' + patient.name : '❌ NÃO encontrou'}\n`);

    // Método 2: contains (últimos 9)
    console.log('2️⃣  Testando: contains (últimos 9)');
    patient = await prisma.patient.findFirst({
      where: {
        phone: {
          contains: last9
        }
      }
    });
    console.log(`   Resultado: ${patient ? '✅ ENCONTROU ' + patient.name : '❌ NÃO encontrou'}\n`);

    // Método 3: contains (últimos 8)
    console.log('3️⃣  Testando: contains (últimos 8)');
    patient = await prisma.patient.findFirst({
      where: {
        phone: {
          contains: last8
        }
      }
    });
    console.log(`   Resultado: ${patient ? '✅ ENCONTROU ' + patient.name : '❌ NÃO encontrou'}\n`);

    // Método 4: endsWith
    console.log('4️⃣  Testando: endsWith (últimos 9)');
    patient = await prisma.patient.findFirst({
      where: {
        phone: {
          endsWith: last9
        }
      }
    });
    console.log(`   Resultado: ${patient ? '✅ ENCONTROU ' + patient.name : '❌ NÃO encontrou'}\n`);

    // Método 5: Buscar todos e filtrar manualmente
    console.log('5️⃣  Testando: Buscar todos e filtrar manualmente');
    const allPatients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        phone: true
      }
    });

    const found = allPatients.find(p => {
      const pNormalized = p.phone.replace(/\D/g, '');
      return pNormalized.includes(last11) ||
             pNormalized.includes(last9) ||
             pNormalized.includes(last8);
    });

    console.log(`   Resultado: ${found ? '✅ ENCONTROU ' + found.name : '❌ NÃO encontrou'}`);
    if (found) {
      console.log(`   Telefone no banco: "${found.phone}"`);
      console.log(`   Normalizado: "${found.phone.replace(/\D/g, '')}"`);
    }
    console.log('');

    // Método 6: Regex (PostgreSQL)
    console.log('6️⃣  Testando: Regex pattern matching');
    try {
      const result = await prisma.$queryRaw`
        SELECT id, name, phone
        FROM "Patient"
        WHERE REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE ${'%' + last9 + '%'}
        LIMIT 1
      `;
      console.log(`   Resultado: ${result.length > 0 ? '✅ ENCONTROU ' + result[0].name : '❌ NÃO encontrou'}\n`);
    } catch (e) {
      console.log(`   Erro (esperado se não for PostgreSQL): ${e.message}\n`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSearch();
