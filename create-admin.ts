import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('\n👤 CRIANDO USUÁRIO ADMINISTRADOR\n');
  console.log('='.repeat(80));

  try {
    const email = 'joaovitorcunhalimaviana@gmail.com';
    const password = 'Logos1.1';
    const name = 'João Vitor';

    // Verificar se já existe
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      console.log('⚠️  Usuário já existe!');
      console.log('   Email:', existing.email);
      console.log('   Nome:', existing.nomeCompleto);
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        senha: hashedPassword,
        nomeCompleto: name,
      }
    });

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('');
    console.log('📋 CREDENCIAIS:');
    console.log('   Email:', email);
    console.log('   Senha:', password);
    console.log('   ID:', user.id);
    console.log('');
    console.log('🌐 Acesse: https://sistema-pos-operatorio.vercel.app');
    console.log('');

  } catch (error) {
    console.error('\n❌ ERRO ao criar admin:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('='.repeat(80));
}

createAdmin();
