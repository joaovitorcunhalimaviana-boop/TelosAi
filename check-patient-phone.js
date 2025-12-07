/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Script para verificar telefone do paciente no banco
 * Execute: node check-patient-phone.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPatient() {
  console.log('\n🔍 VERIFICANDO PACIENTES NO BANCO DE DADOS\n');
  console.log('='.repeat(60));

  try {
    // Buscar TODOS os pacientes
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (patients.length === 0) {
      console.log('\n❌ NENHUM paciente encontrado no banco!');
      console.log('\nVocê precisa cadastrar um paciente primeiro.');
      return;
    }

    console.log(`\n✅ Encontrados ${patients.length} paciente(s):\n`);

    patients.forEach((patient, index) => {
      console.log(`${index + 1}. ${patient.name}`);
      console.log(`   ID: ${patient.id}`);
      console.log(`   Telefone ORIGINAL: "${patient.phone}"`);
      console.log(`   Telefone NORMALIZADO: "${patient.phone.replace(/\D/g, '')}"`);
      console.log(`   Últimos 11 dígitos: ${patient.phone.replace(/\D/g, '').slice(-11)}`);
      console.log(`   Últimos 9 dígitos:  ${patient.phone.replace(/\D/g, '').slice(-9)}`);
      console.log(`   Últimos 8 dígitos:  ${patient.phone.replace(/\D/g, '').slice(-8)}`);
      console.log(`   Ativo: ${patient.isActive ? '✅' : '❌'}`);
      console.log(`   Criado em: ${patient.createdAt.toLocaleString('pt-BR')}`);
      console.log('');
    });

    console.log('='.repeat(60));
    console.log('\n💡 IMPORTANTE:');
    console.log('O WhatsApp envia no formato: 5583998663089');
    console.log('(código do país + DDD + número)');
    console.log('\nO sistema vai buscar pelos:');
    console.log('- Últimos 11 dígitos (DDD + número)');
    console.log('- Últimos 9 dígitos (número sem DDD)');
    console.log('- Últimos 8 dígitos');
    console.log('\n='.repeat(60));

    // Testar com número de exemplo
    console.log('\n🧪 TESTE: Se o WhatsApp enviar "5583998663089":\n');
    const testPhone = '5583998663089';
    const normalized = testPhone.replace(/\D/g, '');

    console.log(`Número normalizado: ${normalized}`);
    console.log(`Últimos 11: ${normalized.slice(-11)}`);
    console.log(`Últimos 9:  ${normalized.slice(-9)}`);
    console.log(`Últimos 8:  ${normalized.slice(-8)}`);

    // Tentar encontrar com cada estratégia
    console.log('\n🔍 Testando estratégias de busca:\n');

    const strategies = [
      { name: 'Últimos 11 dígitos', term: normalized.slice(-11) },
      { name: 'Últimos 9 dígitos', term: normalized.slice(-9) },
      { name: 'Últimos 8 dígitos', term: normalized.slice(-8) }
    ];

    for (const strategy of strategies) {
      const found = await prisma.patient.findFirst({
        where: {
          phone: {
            contains: strategy.term
          }
        }
      });

      if (found) {
        console.log(`✅ ${strategy.name} (${strategy.term}): ENCONTROU ${found.name}`);
      } else {
        console.log(`❌ ${strategy.name} (${strategy.term}): NÃO encontrou`);
      }
    }

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPatient();
