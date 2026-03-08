import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cadastrarPacienteTeste() {
  console.log('📝 Cadastrando paciente de teste...');

  // Criar usuário médico se não existir
  let user = await prisma.user.findFirst();

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'joao@teste.com',
        nomeCompleto: 'Dr. João Vítor',
        senha: '$2a$12$hashedpassword',
        role: 'medico',
        plan: 'professional',
        maxPatients: 100,
        basePrice: 950,
        additionalPatientPrice: 350,
        isLifetimePrice: false,
        firstLogin: false,
        aceitoTermos: true,
      }
    });
    console.log('✅ Usuário médico criado');
  }

  // Deletar paciente antigo se existir
  await prisma.patient.deleteMany({
    where: { phone: { contains: '99866' } }
  });

  // Criar paciente
  const patient = await prisma.patient.create({
    data: {
      userId: user.id,
      name: 'João Vítor da Cunha Lima Viana',
      // IMPORTANTE: Teste com diferentes formatos de telefone
      phone: '83998663089', // SEM código de país, SEM formatação
      email: 'paciente@teste.com',
      age: 30,
      sex: 'male',
      cpf: '12345678900',
    }
  });

  console.log('✅ Paciente criado:', patient.name);
  console.log('📱 Telefone:', patient.phone);

  // Criar cirurgia
  const surgery = await prisma.surgery.create({
    data: {
      patientId: patient.id,
      userId: user.id,
      type: 'hemorroidectomia',
      date: new Date('2025-11-18'), // Ontem
      hospital: 'Hospital Teste',
    }
  });

  console.log('✅ Cirurgia criada:', surgery.type);

  // Criar follow-ups
  const followUpDays = [1, 2, 3, 4, 5, 6, 7, 10, 14];

  for (const day of followUpDays) {
    const scheduledDate = new Date('2025-11-18');
    scheduledDate.setDate(scheduledDate.getDate() + day);
    scheduledDate.setHours(10, 0, 0, 0); // 10h da manhã

    await prisma.followUp.create({
      data: {
        surgeryId: surgery.id,
        patientId: patient.id,
        userId: user.id,
        dayNumber: day,
        scheduledDate,
        status: 'pending',
      }
    });
  }

  console.log(`✅ ${followUpDays.length} follow-ups criados`);

  // Mostrar resumo
  console.log('\n📊 RESUMO:');
  console.log(`Paciente: ${patient.name}`);
  console.log(`Telefone: ${patient.phone}`);
  console.log(`Telefone normalizado: ${patient.phone.replace(/\D/g, '')}`);
  console.log(`Cirurgia: ${surgery.type} (${surgery.date})`);
  console.log(`Follow-ups pendentes: ${followUpDays.length}`);

  await prisma.$disconnect();
}

cadastrarPacienteTeste();
