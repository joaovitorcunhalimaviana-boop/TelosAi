/**
 * Testa a busca SQL raw localmente
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSQLSearch() {
  console.log('\n🧪 TESTANDO BUSCA SQL RAW\n');
  console.log('='.repeat(60));

  const testPhone = '5583998663089'; // O que o WhatsApp envia
  const normalized = testPhone.replace(/\D/g, '');
  const last11 = normalized.slice(-11); // 83998663089
  const last9 = normalized.slice(-9);   // 998663089
  const last8 = normalized.slice(-8);   // 98663089

  console.log(`\nTelefone de teste: ${testPhone}`);
  console.log(`Últimos 11: ${last11}`);
  console.log(`Últimos 9:  ${last9}`);
  console.log(`Últimos 8:  ${last8}\n`);

  try {
    // Testar SQL raw
    console.log('🔍 Executando SQL raw...\n');

    const result = await prisma.$queryRaw`
      SELECT id, name, phone, "userId"
      FROM "Patient"
      WHERE "isActive" = true
      AND (
        REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE ${`%${last11}%`}
        OR REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE ${`%${last9}%`}
        OR REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE ${`%${last8}%`}
      )
      LIMIT 1
    `;

    if (result && result.length > 0) {
      console.log('✅ SUCESSO! Paciente encontrado via SQL:');
      console.log(JSON.stringify(result[0], null, 2));
    } else {
      console.log('❌ FALHA: Nenhum paciente encontrado');

      // Mostrar amostra
      const sample = await prisma.$queryRaw`
        SELECT id, name, phone, REGEXP_REPLACE(phone, '[^0-9]', '', 'g') as phone_normalized
        FROM "Patient"
        WHERE "isActive" = true
        LIMIT 5
      `;

      console.log('\n📋 Amostra de pacientes no banco:');
      console.log(JSON.stringify(sample, null, 2));
    }

  } catch (error) {
    console.error('\n❌ Erro na busca SQL:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testSQLSearch();
