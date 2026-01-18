/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * DEBUG: Teste COMPLETO do fluxo - simula exatamente o que o webhook faz
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMessage } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  try {
    const body = await request.json();
    const phone = body.phone || '5583998663089';
    const message = body.message || 'dor média';

    log(`🧪 FULL TEST - Phone: ${phone}, Message: ${message}`);

    // 1. Buscar paciente
    log('📋 Step 1: Buscando paciente...');
    const normalizedPhone = phone.replace(/\D/g, '');
    const last8 = normalizedPhone.slice(-8);
    const last9 = normalizedPhone.slice(-9);
    log(`   Normalized: ${normalizedPhone}, Last8: ${last8}, Last9: ${last9}`);

    // Buscar todos os pacientes e comparar os últimos dígitos
    const patients = await prisma.patient.findMany({
      where: { isActive: true },
      select: { id: true, name: true, phone: true }
    });

    log(`   Total pacientes no banco: ${patients.length}`);

    let patient = null;
    for (const p of patients) {
      const patientPhoneDigits = p.phone.replace(/\D/g, '');
      const patientLast8 = patientPhoneDigits.slice(-8);
      const patientLast9 = patientPhoneDigits.slice(-9);
      log(`   Comparando: ${p.phone} -> last8=${patientLast8}, last9=${patientLast9}`);

      if (patientLast8 === last8 || patientLast9 === last9) {
        log(`   ✅ MATCH!`);
        patient = await prisma.patient.findUnique({ where: { id: p.id } });
        break;
      }
    }

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found', logs }, { status: 404 });
    }

    log(`✅ Paciente encontrado: ${patient.name} (${patient.id})`);

    // 2. Buscar follow-up
    log('📋 Step 2: Buscando follow-up...');
    const followUp = await prisma.followUp.findFirst({
      where: {
        patientId: patient.id,
        status: { in: ['sent', 'pending'] }
      },
      include: { surgery: true },
      orderBy: { scheduledDate: 'desc' }
    });

    if (!followUp) {
      return NextResponse.json({ error: 'No pending follow-up', logs }, { status: 404 });
    }

    log(`✅ Follow-up encontrado: ${followUp.id}, Surgery: ${followUp.surgery.type}`);

    // 3. Importar conversation-manager
    log('📋 Step 3: Importando conversation-manager...');
    const { getOrCreateConversation, processQuestionnaireAnswer, startQuestionnaireCollection } = await import('@/lib/conversation-manager');

    // 4. Obter/criar conversa
    log('📋 Step 4: Obtendo/criando conversa...');
    const conversation = await getOrCreateConversation(phone, patient.id);
    log(`✅ Conversa: ${conversation.id}, State: ${conversation.state}, PatientId: ${conversation.patientId}`);

    // 5. Verificar se é "sim" para iniciar
    const textLower = message.toLowerCase().trim();

    if ((textLower === 'sim' || textLower === 's') &&
        (conversation.state === 'awaiting_consent' || conversation.state === 'idle')) {
      log('📋 Step 5: Detectado "SIM" - Iniciando questionário...');

      try {
        await startQuestionnaireCollection(phone, patient, followUp.surgery);
        log('✅ Questionário iniciado com sucesso!');

        return NextResponse.json({
          success: true,
          action: 'started_questionnaire',
          logs
        });
      } catch (startError: any) {
        log(`❌ Erro ao iniciar questionário: ${startError.message}`);
        log(`   Stack: ${startError.stack}`);
        return NextResponse.json({
          error: 'Failed to start questionnaire',
          errorMessage: startError.message,
          errorStack: startError.stack,
          logs
        }, { status: 500 });
      }
    }

    // 6. Processar resposta com IA
    log('📋 Step 6: Processando resposta com IA...');

    try {
      const result = await processQuestionnaireAnswer(phone, message);
      log(`✅ Resultado da IA: completed=${result.completed}, needsDoctorAlert=${result.needsDoctorAlert}`);

      return NextResponse.json({
        success: true,
        action: 'processed_answer',
        result,
        logs
      });
    } catch (processError: any) {
      log(`❌ Erro ao processar com IA: ${processError.message}`);
      log(`   Stack: ${processError.stack}`);
      return NextResponse.json({
        error: 'Failed to process answer',
        errorMessage: processError.message,
        errorStack: processError.stack,
        logs
      }, { status: 500 });
    }

  } catch (error: any) {
    log(`❌ Erro geral: ${error.message}`);
    log(`   Stack: ${error.stack}`);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      logs
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    info: 'POST com { "phone": "5583998663089", "message": "sim" ou "dor média" }'
  });
}
