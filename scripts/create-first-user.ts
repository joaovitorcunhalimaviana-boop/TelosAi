/**
 * Script para criar o primeiro usuario do sistema
 *
 * Execute com:
 * npx ts-node scripts/create-first-user.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('\n=== Criar Primeiro Usuario - VigIA ===\n');

  // Verificar se ja existe algum usuario
  const existingUsers = await prisma.user.count();

  if (existingUsers > 0) {
    console.log(`\nJa existem ${existingUsers} usuario(s) no sistema.`);
    const confirm = await question('Deseja criar outro usuario mesmo assim? (s/n): ');

    if (confirm.toLowerCase() !== 's') {
      console.log('\nOperacao cancelada.');
      rl.close();
      process.exit(0);
    }
  }

  // Coletar informacoes do usuario
  console.log('\nPreencha as informacoes do novo usuario:\n');

  const nomeCompleto = await question('Nome completo: ');
  const email = await question('Email: ');
  const senha = await question('Senha: ');
  const crm = await question('CRM (opcional): ');
  const estado = await question('Estado do CRM (ex: SP, RJ) (opcional): ');
  const whatsapp = await question('WhatsApp com DDD (ex: 11999999999) (opcional): ');

  // Validar email
  if (!email.includes('@')) {
    console.error('\nEmail invalido!');
    rl.close();
    process.exit(1);
  }

  // Validar senha
  if (senha.length < 6) {
    console.error('\nSenha deve ter pelo menos 6 caracteres!');
    rl.close();
    process.exit(1);
  }

  // Verificar se email ja existe
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.error(`\nJa existe um usuario com o email ${email}!`);
    rl.close();
    process.exit(1);
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(senha, 12);

  // Criar usuario
  const user = await prisma.user.create({
    data: {
      email,
      senha: hashedPassword,
      nomeCompleto,
      crm: crm || null,
      estado: estado || null,
      whatsapp: whatsapp || null,
      role: 'medico',
      plan: 'professional',
      basePrice: 950,
      additionalPatientPrice: 350,
      maxPatients: 3,
      isLifetimePrice: false,
      firstLogin: true,
      aceitoTermos: true,
      aceitoNovidades: false,
      acceptedTermsOfService: true,
      termsOfServiceAcceptedAt: new Date(),
      termsOfServiceVersion: '1.0',
    },
  });

  console.log('\n✅ Usuario criado com sucesso!\n');
  console.log('Detalhes:');
  console.log(`- ID: ${user.id}`);
  console.log(`- Nome: ${user.nomeCompleto}`);
  console.log(`- Email: ${user.email}`);
  console.log(`- CRM: ${user.crm || 'Nao informado'}`);
  console.log(`- Estado: ${user.estado || 'Nao informado'}`);
  console.log(`- WhatsApp: ${user.whatsapp || 'Nao informado'}`);
  console.log(`- Plano: ${user.plan}`);
  console.log(`- Limite de pacientes: ${user.maxPatients}`);
  console.log('\nVoce ja pode fazer login em: http://localhost:3000/auth/login\n');

  rl.close();
}

main()
  .catch((error) => {
    console.error('\n❌ Erro ao criar usuario:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
