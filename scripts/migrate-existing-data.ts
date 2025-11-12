import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateExistingData() {
  console.log('Iniciando migração de dados existentes...\n');

  try {
    // 1. Buscar usuário admin
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (!admin) {
      console.log('❌ Nenhum usuário admin encontrado!');
      console.log('Execute primeiro: npx ts-node scripts/create-admin-user.ts');
      process.exit(1);
    }

    console.log(`✅ Admin encontrado: ${admin.nomeCompleto} (${admin.email})\n`);

    // 2. Atualizar pacientes sem userId
    console.log('📋 Atualizando pacientes...');
    const patientsUpdated = await prisma.patient.updateMany({
      where: { userId: null } as any,
      data: { userId: admin.id },
    });
    console.log(`   ✓ ${patientsUpdated.count} pacientes atualizados\n`);

    // 3. Atualizar cirurgias sem userId
    console.log('🏥 Atualizando cirurgias...');
    const surgeriesUpdated = await prisma.surgery.updateMany({
      where: { userId: null } as any,
      data: { userId: admin.id },
    });
    console.log(`   ✓ ${surgeriesUpdated.count} cirurgias atualizadas\n`);

    // 4. Atualizar follow-ups sem userId
    console.log('📅 Atualizando follow-ups...');
    const followUpsUpdated = await prisma.followUp.updateMany({
      where: { userId: null } as any,
      data: { userId: admin.id },
    });
    console.log(`   ✓ ${followUpsUpdated.count} follow-ups atualizados\n`);

    // 5. Atualizar SurgeryDetails sem userId (se existir)
    try {
      console.log('📝 Atualizando detalhes de cirurgias...');
      const detailsUpdated = await prisma.surgeryDetails.updateMany({
        where: { userId: null } as any,
        data: { userId: admin.id },
      });
      console.log(`   ✓ ${detailsUpdated.count} detalhes atualizados\n`);
    } catch (error) {
      console.log('   ⚠️  Nenhum detalhe de cirurgia para atualizar\n');
    }

    // 6. Atualizar FollowUpResponses sem userId (se existir)
    try {
      console.log('💬 Atualizando respostas de follow-ups...');
      const responsesUpdated = await prisma.followUpResponse.updateMany({
        where: { userId: null } as any,
        data: { userId: admin.id },
      });
      console.log(`   ✓ ${responsesUpdated.count} respostas atualizadas\n`);
    } catch (error) {
      console.log('   ⚠️  Nenhuma resposta de follow-up para atualizar\n');
    }

    // 7. Atualizar contador de pacientes do admin
    console.log('🔢 Atualizando contador de pacientes...');
    const totalPatients = await prisma.patient.count({
      where: { userId: admin.id },
    });

    await prisma.user.update({
      where: { id: admin.id },
      data: { currentPatients: totalPatients },
    });
    console.log(`   ✓ Contador atualizado: ${totalPatients} pacientes\n`);

    // 8. Resumo final
    console.log('═══════════════════════════════════════');
    console.log('✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('═══════════════════════════════════════');
    console.log(`Usuário: ${admin.nomeCompleto}`);
    console.log(`Pacientes: ${totalPatients}`);
    console.log(`Cirurgias: ${surgeriesUpdated.count}`);
    console.log(`Follow-ups: ${followUpsUpdated.count}`);
    console.log('═══════════════════════════════════════\n');

    // 9. Verificação final
    console.log('🔍 Verificando dados órfãos...');
    const orphanPatients = await prisma.patient.count({
      where: { userId: null } as any,
    });
    const orphanSurgeries = await prisma.surgery.count({
      where: { userId: null } as any,
    });
    const orphanFollowUps = await prisma.followUp.count({
      where: { userId: null } as any,
    });

    if (orphanPatients === 0 && orphanSurgeries === 0 && orphanFollowUps === 0) {
      console.log('   ✅ Nenhum dado órfão encontrado!\n');
    } else {
      console.log('   ⚠️  ATENÇÃO: Ainda existem dados órfãos:');
      if (orphanPatients > 0) console.log(`      - ${orphanPatients} pacientes`);
      if (orphanSurgeries > 0) console.log(`      - ${orphanSurgeries} cirurgias`);
      if (orphanFollowUps > 0) console.log(`      - ${orphanFollowUps} follow-ups`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateExistingData();
