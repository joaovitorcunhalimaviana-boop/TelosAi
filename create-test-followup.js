/**
 * Cria um follow-up de teste com status "sent"
 */

require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestFollowUp() {
  console.log('\n🔧 CRIANDO FOLLOW-UP DE TESTE\n');
  console.log('='.repeat(60));

  try {
    // Buscar paciente
    const patient = await prisma.patient.findUnique({
      where: {
        id: 'cmi8g6xbt0001ic046sxx6d63' // O ID do João Vítor
      }
    });

    if (!patient) {
      console.log('❌ Paciente não encontrado');
      return;
    }

    console.log(`✅ Paciente: ${patient.name}\n`);

    // Buscar cirurgia
    const surgery = await prisma.surgery.findFirst({
      where: {
        patientId: patient.id
      },
      orderBy: {
        date: 'desc'
      }
    });

    if (!surgery) {
      console.log('❌ Nenhuma cirurgia encontrada');
      return;
    }

    console.log(`✅ Cirurgia: ${surgery.type}`);
    console.log(`   Data: ${surgery.date}\n`);

    // Verificar se já existe follow-up pendente
    const existing = await prisma.followUp.findMany({
      where: {
        patientId: patient.id,
        status: {
          in: ['sent', 'pending']
        }
      }
    });

    if (existing.length > 0) {
      console.log(`⚠️  Já existem ${existing.length} follow-ups pendentes/sent`);
      console.log('   Atualizando o primeiro para status "sent"...\n');

      const updated = await prisma.followUp.update({
        where: { id: existing[0].id },
        data: {
          status: 'sent',
          sentAt: new Date()
        }
      });

      console.log('✅ Follow-up atualizado!');
      console.log(`   ID: ${updated.id}`);
      console.log(`   Status: ${updated.status}`);
      console.log(`   Dia: ${updated.dayNumber}`);

    } else {
      console.log('📝 Criando novo follow-up...\n');

      const followUp = await prisma.followUp.create({
        data: {
          patientId: patient.id,
          surgeryId: surgery.id,
          userId: patient.userId,
          dayNumber: 7,
          scheduledDate: new Date(),
          status: 'sent',
          sentAt: new Date()
        }
      });

      console.log('✅ Follow-up criado!');
      console.log(`   ID: ${followUp.id}`);
      console.log(`   Status: ${followUp.status}`);
      console.log(`   Dia: ${followUp.dayNumber}`);
    }

    console.log('\n✅ Pronto! Agora teste enviando "sim" pelo WhatsApp!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(60));
}

createTestFollowUp();
