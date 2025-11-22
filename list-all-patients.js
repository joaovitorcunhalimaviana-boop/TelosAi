/**
 * Lista TODOS os pacientes do banco de PRODUÇÃO
 */

const { PrismaClient } = require('@prisma/client');

// URL do banco de produção
const DATABASE_URL = "postgresql://neondb_owner:npg_F9Kb4mPoVtcB@ep-royal-voice-ae6ov58i-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function listAllPatients() {
  console.log('\n📋 LISTANDO TODOS OS PACIENTES DO BANCO DE PRODUÇÃO\n');
  console.log('='.repeat(60));

  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (patients.length === 0) {
      console.log('⚠️  Nenhum paciente encontrado no banco!');
      return;
    }

    console.log(`Total de pacientes: ${patients.length}\n`);

    patients.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Telefone: "${p.phone}"`);
      console.log(`   Email: ${p.email || 'N/A'}`);
      console.log(`   Ativo: ${p.isActive ? 'Sim' : 'Não'}`);
      console.log(`   Criado em: ${p.createdAt}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('='.repeat(60));
}

listAllPatients();
