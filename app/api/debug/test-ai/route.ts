/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * DEBUG: Testa a IA conversacional diretamente
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { conductConversation } from '@/lib/conversational-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message || 'dor média';

    console.log('🧪 DEBUG TEST AI - Starting...');
    console.log('🧪 Message:', message);

    // Buscar primeiro paciente para teste
    const patient = await prisma.patient.findFirst();

    if (!patient) {
      return NextResponse.json({ error: 'No patients in database' }, { status: 404 });
    }

    console.log('🧪 Patient found:', patient.name);

    // Buscar cirurgia
    const surgery = await prisma.surgery.findFirst({
      where: { patientId: patient.id },
      orderBy: { date: 'desc' }
    });

    if (!surgery) {
      return NextResponse.json({ error: 'Surgery not found' }, { status: 404 });
    }

    console.log('🧪 Surgery found:', surgery.type);

    // Testar a IA conversacional
    console.log('🧪 Calling conductConversation...');

    const result = await conductConversation(
      message,
      patient,
      surgery,
      [], // Empty conversation history
      {}  // Empty current data
    );

    console.log('🧪 Result:', JSON.stringify(result, null, 2));

    return NextResponse.json({
      success: true,
      patient: patient.name,
      surgery: surgery.type,
      message,
      result
    });

  } catch (error: any) {
    console.error('🧪 ERROR:', error);
    console.error('🧪 Error message:', error?.message);
    console.error('🧪 Error stack:', error?.stack);

    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error',
      stack: error?.stack
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Listar pacientes
    const patients = await prisma.patient.findMany({
      take: 10,
      select: { id: true, name: true, phone: true }
    });

    // Listar conversas
    const conversations = await prisma.conversation.findMany({
      take: 10,
      select: { id: true, phoneNumber: true, state: true, patientId: true }
    });

    return NextResponse.json({
      info: 'Use POST with { "message": "your message" } to test AI',
      patients,
      conversations
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error?.message,
      stack: error?.stack
    }, { status: 500 });
  }
}
