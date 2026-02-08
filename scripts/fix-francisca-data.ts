/**
 * Script para verificar e corrigir dados da paciente Francisca Ceia
 * O D+3 foi sobrescrito com dados do D+4
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando paciente Francisca Ceia...\n');

  // Buscar paciente
  const patient = await prisma.patient.findFirst({
    where: {
      name: { contains: 'Francisca', mode: 'insensitive' }
    },
    include: {
      surgeries: {
        include: {
          followUps: {
            include: {
              responses: true
            },
            orderBy: { dayNumber: 'asc' }
          }
        }
      }
    }
  });

  if (!patient) {
    console.log('❌ Paciente não encontrada');
    return;
  }

  console.log('✅ Paciente encontrada:', patient.name);
  console.log('   ID:', patient.id);
  console.log('   Telefone:', patient.phone);
  console.log('\n📋 Follow-ups:\n');

  for (const surgery of patient.surgeries) {
    console.log(`Cirurgia: ${surgery.type} (${surgery.date.toLocaleDateString('pt-BR')})`);
    console.log('-------------------------------------------');

    for (const followUp of surgery.followUps) {
      console.log(`\n  D+${followUp.dayNumber}:`);
      console.log(`    Status: ${followUp.status}`);
      console.log(`    Data programada: ${followUp.scheduledDate.toLocaleDateString('pt-BR')}`);
      console.log(`    Respondido em: ${followUp.respondedAt?.toLocaleString('pt-BR') || 'N/A'}`);

      if (followUp.responses.length > 0) {
        const response = followUp.responses[0];
        console.log(`    Resposta ID: ${response.id}`);
        console.log(`    painAtRest: ${response.painAtRest}`);
        console.log(`    painDuringBowel: ${response.painDuringBowel}`);
        console.log(`    Criado em: ${response.createdAt?.toLocaleString('pt-BR') || 'N/A'}`);
        console.log(`    Atualizado em: ${(response as any).updatedAt?.toLocaleString('pt-BR') || 'N/A'}`);

        // Mostrar dados do questionário
        if (response.questionnaireData) {
          try {
            const data = JSON.parse(response.questionnaireData as string);
            console.log(`    extractedData:`, JSON.stringify(data.extractedData, null, 2));
          } catch (e) {
            console.log(`    questionnaireData: (erro ao parsear)`);
          }
        }
      } else {
        console.log(`    Sem respostas registradas`);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
