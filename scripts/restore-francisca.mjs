import { PrismaClient } from '@prisma/client';

const recoveryPrisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_F9Kb4mPoVtcB@ep-billowing-river-ae4zrrxy.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require' } }
});
const prodPrisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_F9Kb4mPoVtcB@ep-royal-voice-ae6ov58i-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require' } }
});

async function restore() {
  // 1. Buscar dados completos da recovery branch
  const patient = await recoveryPrisma.patient.findFirst({
    where: { name: { contains: 'Francisca' } },
    include: {
      surgeries: {
        include: {
          followUps: {
            include: { responses: true }
          }
        }
      },
      conversations: true
    }
  });

  if (!patient) { console.log('Paciente não encontrada na recovery'); return; }
  console.log('Encontrada:', patient.name, '| Cirurgias:', patient.surgeries.length);

  // 2. Upsert paciente na produção
  await prodPrisma.patient.upsert({
    where: { id: patient.id },
    update: {},
    create: {
      id: patient.id,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      name: patient.name,
      phone: patient.phone,
      email: patient.email,
      cpf: patient.cpf,
      dateOfBirth: patient.dateOfBirth,
      age: patient.age,
      sex: patient.sex,
      isActive: patient.isActive,
      userId: patient.userId,
      isResearchParticipant: patient.isResearchParticipant,
      researchGroup: patient.researchGroup,
      researchNotes: patient.researchNotes,
      researchId: patient.researchId,
      consentTermDate: patient.consentTermDate,
      consentTermFileUrl: patient.consentTermFileUrl,
      consentTermSigned: patient.consentTermSigned,
      whatsappConsent: patient.whatsappConsent,
      isTest: patient.isTest,
    }
  });
  console.log('Paciente upserted na produção');

  // 3. Recriar cirurgias
  for (const surgery of patient.surgeries) {
    await prodPrisma.surgery.upsert({
      where: { id: surgery.id },
      update: {},
      create: {
        id: surgery.id,
        createdAt: surgery.createdAt,
        updatedAt: surgery.updatedAt,
        patientId: surgery.patientId,
        type: surgery.type,
        date: surgery.date,
        hospital: surgery.hospital,
        durationMinutes: surgery.durationMinutes,
        dataCompleteness: surgery.dataCompleteness,
        status: surgery.status,
        userId: surgery.userId,
        firstBowelMovementDate: surgery.firstBowelMovementDate,
        firstBowelMovementDay: surgery.firstBowelMovementDay,
        firstBowelMovementTime: surgery.firstBowelMovementTime,
        hadFirstBowelMovement: surgery.hadFirstBowelMovement,
        doctorNotes: surgery.doctorNotes,
      }
    });
    console.log('Cirurgia upserted, follow-ups:', surgery.followUps.length);

    // 4. Recriar follow-ups e respostas
    for (const fu of surgery.followUps) {
      await prodPrisma.followUp.upsert({
        where: { id: fu.id },
        update: {},
        create: {
          id: fu.id,
          createdAt: fu.createdAt,
          updatedAt: fu.updatedAt,
          surgeryId: fu.surgeryId,
          patientId: fu.patientId,
          dayNumber: fu.dayNumber,
          scheduledDate: fu.scheduledDate,
          status: fu.status,
          sentAt: fu.sentAt,
          respondedAt: fu.respondedAt,
          userId: fu.userId,
        }
      });


      for (const resp of fu.responses) {
        await prodPrisma.followUpResponse.upsert({
          where: { id: resp.id },
          update: {},
          create: {
            id: resp.id,
            createdAt: resp.createdAt,
            followUpId: resp.followUpId,
            userId: resp.userId,
            questionnaireData: resp.rawData || resp.questionnaireData || '{}',
            aiAnalysis: resp.aiAnalysis || null,
            aiResponse: resp.aiResponse || null,
            riskLevel: resp.riskLevel || 'low',
            redFlags: resp.redFlags || null,
            doctorAlerted: resp.doctorAlerted || false,
            alertSentAt: resp.alertSentAt || null,
            painAtRest: resp.painAtRest || null,
            painDuringBowel: resp.painDuringBowel || null,
            bleeding: resp.bleeding || null,
            fever: resp.fever || null,
          }
        });
      }
      if (fu.responses.length > 0) {
        console.log('  D+' + fu.dayNumber + ': ' + fu.responses.length + ' resposta(s) restaurada(s)');
      }
    }
  }

  // 5. Conversas: pular, não são dados clínicos críticos
  console.log('Conversas ignoradas (não são dados clínicos).');

  console.log('\n✅ RESTAURAÇÃO COMPLETA! Francisca está de volta na produção.');
  await recoveryPrisma.$disconnect();
  await prodPrisma.$disconnect();
}

restore().catch(e => { console.error('ERRO:', e.message, e); process.exit(1); });
