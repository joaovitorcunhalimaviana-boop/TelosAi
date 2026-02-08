/**
 * Script para verificar histórico de conversas da Francisca Ceia
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando respostas da Francisca Ceia...\n');

  // Buscar todas as respostas do follow-up D+3
  const responses = await prisma.followUpResponse.findMany({
    where: {
      followUp: {
        patient: {
          name: { contains: 'Francisca', mode: 'insensitive' }
        },
        dayNumber: 3
      }
    },
    include: {
      followUp: true
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Encontradas ${responses.length} resposta(s) para D+3:\n`);

  for (const response of responses) {
    console.log('='.repeat(60));
    console.log(`ID: ${response.id}`);
    console.log(`Criado em: ${response.createdAt?.toLocaleString('pt-BR')}`);
    console.log(`painAtRest: ${response.painAtRest}`);
    console.log(`painDuringBowel: ${response.painDuringBowel}`);
    console.log(`riskLevel: ${response.riskLevel}`);

    if (response.questionnaireData) {
      try {
        const data = JSON.parse(response.questionnaireData as string);
        console.log('\n📝 Conversa:');
        if (data.conversation) {
          for (const msg of data.conversation) {
            const role = msg.role === 'user' ? '👤 Paciente' : '🤖 IA';
            const content = msg.content.substring(0, 200);
            console.log(`  ${role}: ${content}${msg.content.length > 200 ? '...' : ''}`);
          }
        }
        console.log('\n📊 Dados extraídos:', JSON.stringify(data.extractedData, null, 2));
        console.log(`completed: ${data.completed}`);
        console.log(`conversationPhase: ${data.conversationPhase}`);
      } catch (e) {
        console.log('Erro ao parsear questionnaireData');
      }
    }
  }

  // Verificar se há logs de auditoria
  console.log('\n\n🔍 Buscando logs de auditoria...');
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      OR: [
        { action: { contains: 'Francisca' } },
        { resource: { contains: 'Francisca' } }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  if (auditLogs.length > 0) {
    console.log(`\nEncontrados ${auditLogs.length} logs:`);
    for (const log of auditLogs) {
      const metadata = log.metadata ? JSON.stringify(log.metadata).substring(0, 100) : '';
      console.log(`  ${log.createdAt?.toLocaleString('pt-BR')} - ${log.action}: ${metadata}`);
    }
  } else {
    console.log('Nenhum log de auditoria encontrado');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
