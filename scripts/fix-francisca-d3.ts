/**
 * Script para corrigir os dados da Francisca Ceia
 * Remove a resposta criada no D+4 que foi salva incorretamente no D+3
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Corrigindo dados da Francisca Ceia...\n');

  // ID da resposta errada (criada no D+4)
  const wrongResponseId = 'cmksvdtv40001l804clw2sk8z';

  // Verificar a resposta antes de deletar
  const wrongResponse = await prisma.followUpResponse.findUnique({
    where: { id: wrongResponseId },
    include: { followUp: true }
  });

  if (!wrongResponse) {
    console.log('❌ Resposta não encontrada. Pode já ter sido deletada.');
    return;
  }

  console.log('📋 Resposta a ser removida:');
  console.log(`   ID: ${wrongResponse.id}`);
  console.log(`   Criada em: ${wrongResponse.createdAt?.toLocaleString('pt-BR')}`);
  console.log(`   Follow-up D+${wrongResponse.followUp.dayNumber}`);
  console.log(`   painAtRest: ${wrongResponse.painAtRest}`);
  console.log(`   painDuringBowel: ${wrongResponse.painDuringBowel}`);

  // Deletar a resposta errada
  await prisma.followUpResponse.delete({
    where: { id: wrongResponseId }
  });
  console.log('\n✅ Resposta errada deletada!');

  // Verificar a resposta correta que permanece
  const correctResponse = await prisma.followUpResponse.findFirst({
    where: {
      followUp: {
        patient: {
          name: { contains: 'Francisca', mode: 'insensitive' }
        },
        dayNumber: 3
      }
    },
    include: { followUp: true },
    orderBy: { createdAt: 'asc' }
  });

  if (correctResponse) {
    console.log('\n📊 Resposta correta que permanece:');
    console.log(`   ID: ${correctResponse.id}`);
    console.log(`   Criada em: ${correctResponse.createdAt?.toLocaleString('pt-BR')}`);
    console.log(`   painAtRest: ${correctResponse.painAtRest}`);
    console.log(`   painDuringBowel: ${correctResponse.painDuringBowel}`);
  }

  // Atualizar o respondedAt do follow-up para a data correta (D+3)
  const followUp = await prisma.followUp.findFirst({
    where: {
      patient: {
        name: { contains: 'Francisca', mode: 'insensitive' }
      },
      dayNumber: 3
    }
  });

  if (followUp && correctResponse) {
    await prisma.followUp.update({
      where: { id: followUp.id },
      data: {
        respondedAt: correctResponse.createdAt
      }
    });
    console.log('\n✅ Data de resposta do follow-up corrigida para:', correctResponse.createdAt?.toLocaleString('pt-BR'));
  }

  // Remover respostas duplicadas (manter apenas a primeira)
  const allResponses = await prisma.followUpResponse.findMany({
    where: {
      followUp: {
        patient: {
          name: { contains: 'Francisca', mode: 'insensitive' }
        },
        dayNumber: 3
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  if (allResponses.length > 1) {
    console.log(`\n⚠️ Encontradas ${allResponses.length} respostas duplicadas. Removendo duplicatas...`);

    // Manter apenas a primeira
    const responsesToDelete = allResponses.slice(1);
    for (const resp of responsesToDelete) {
      await prisma.followUpResponse.delete({
        where: { id: resp.id }
      });
      console.log(`   Deletada: ${resp.id}`);
    }
    console.log('✅ Duplicatas removidas!');
  }

  console.log('\n🎉 Correção concluída!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
