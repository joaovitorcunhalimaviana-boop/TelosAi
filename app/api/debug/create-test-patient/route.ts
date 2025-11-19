import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verificar se já existe
    const existing = await prisma.patient.findFirst({
      where: { phone: { contains: '99866' } }
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Patient already exists',
        patient: {
          name: existing.name,
          phone: existing.phone,
        }
      });
    }

    // Criar ou buscar usuário médico
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
    }

    // Criar paciente
    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        name: 'João Vítor da Cunha Lima Viana',
        phone: '83998663089', // SEM código de país
        email: 'paciente@teste.com',
        age: 30,
        sex: 'male',
        cpf: '12345678900',
      }
    });

    // Criar cirurgia
    const surgery = await prisma.surgery.create({
      data: {
        patientId: patient.id,
        userId: user.id,
        type: 'hemorroidectomia',
        date: new Date('2025-11-18'),
        hospital: 'Hospital Teste',
      }
    });

    // Criar follow-ups
    const followUpDays = [1, 2, 3, 5, 7, 10, 14];
    const followUps = [];

    for (const day of followUpDays) {
      const scheduledDate = new Date('2025-11-18');
      scheduledDate.setDate(scheduledDate.getDate() + day);
      scheduledDate.setHours(10, 0, 0, 0);

      const followUp = await prisma.followUp.create({
        data: {
          surgeryId: surgery.id,
          patientId: patient.id,
          userId: user.id,
          dayNumber: day,
          scheduledDate,
          status: 'pending',
        }
      });
      followUps.push(followUp);
    }

    return NextResponse.json({
      success: true,
      message: 'Test patient created successfully',
      patient: {
        name: patient.name,
        phone: patient.phone,
      },
      surgery: {
        type: surgery.type,
        date: surgery.date,
      },
      followUps: followUps.length,
    });

  } catch (error) {
    console.error('Error creating test patient:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
