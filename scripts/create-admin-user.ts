import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('Criando usuário administrador...\n');

  // Dados do admin (MODIFIQUE AQUI)
  const adminData = {
    email: 'joaovitor@vigia.ai', // SUBSTITUA pelo seu email
    senha: 'Admin@123', // SUBSTITUA por uma senha forte
    nomeCompleto: 'Dr. João Vitor Viana',
    crm: 'CRM-SP 123456', // SUBSTITUA pelo seu CRM
    whatsapp: '5511999999999', // SUBSTITUA pelo seu WhatsApp
    role: 'admin',
    plan: 'founding',
    basePrice: 0, // Founding members pagam 0
    additionalPatientPrice: 0,
    maxPatients: 999, // Ilimitado para admin
    currentPatients: 0,
  };

  try {
    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email },
    });

    if (existingUser) {
      console.log('❌ Usuário com este email já existe!');
      console.log('Email:', existingUser.email);
      console.log('Nome:', existingUser.nomeCompleto);
      console.log('Role:', existingUser.role);
      process.exit(1);
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(adminData.senha, 10);

    // Criar usuário admin
    const admin = await prisma.user.create({
      data: {
        ...adminData,
        senha: hashedPassword,
      },
    });

    console.log('✅ Usuário administrador criado com sucesso!\n');
    console.log('Detalhes:');
    console.log('------------------');
    console.log('ID:', admin.id);
    console.log('Nome:', admin.nomeCompleto);
    console.log('Email:', admin.email);
    console.log('CRM:', admin.crm);
    console.log('WhatsApp:', admin.whatsapp);
    console.log('Role:', admin.role);
    console.log('Plano:', admin.plan);
    console.log('Max Pacientes:', admin.maxPatients);
    console.log('------------------\n');

    console.log('⚠️  IMPORTANTE: Guarde suas credenciais de acesso:');
    console.log(`Email: ${adminData.email}`);
    console.log(`Senha: ${adminData.senha}`);
    console.log('\n⚠️  RECOMENDAÇÃO: Altere a senha após o primeiro login!\n');

    // Se houver pacientes sem userId, atribuir ao admin
    const patientsWithoutUser = await prisma.patient.count({
      where: { userId: null } as any,
    });

    if (patientsWithoutUser > 0) {
      console.log(`\n📋 Encontrados ${patientsWithoutUser} pacientes sem userId.`);
      console.log('Execute o script de migração de dados existentes.\n');
    }

  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
