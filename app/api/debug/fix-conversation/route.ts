import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Corrige conversas que estão sem patientId vinculado
 * GET /api/debug/fix-conversation?phone=83998663089
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone required. Use ?phone=83998663089' },
        { status: 400 }
      );
    }

    const phoneDigits = phone.replace(/\D/g, '');
    const last9 = phoneDigits.slice(-9);

    console.log('🔍 Fixing conversation for phone:', phoneDigits, 'last9:', last9);

    // Buscar conversa
    const conversations = await prisma.conversation.findMany();
    const conversation = conversations.find(c => {
      const cDigits = (c.phoneNumber || '').replace(/\D/g, '');
      return cDigits.slice(-9) === last9 || cDigits.includes(phoneDigits);
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    console.log('📞 Found conversation:', conversation.id, 'patientId:', conversation.patientId);

    // Buscar paciente pelo telefone
    const patients = await prisma.patient.findMany();
    const patient = patients.find(p => {
      const pDigits = (p.phone || '').replace(/\D/g, '');
      return pDigits.slice(-9) === last9;
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found for this phone' }, { status: 404 });
    }

    console.log('👤 Found patient:', patient.name, patient.id);

    // Verificar se já está vinculado
    if (conversation.patientId === patient.id) {
      return NextResponse.json({
        success: true,
        message: 'Conversation already linked to patient',
        conversation: {
          id: conversation.id,
          patientId: conversation.patientId
        },
        patient: {
          id: patient.id,
          name: patient.name
        }
      });
    }

    // Corrigir vinculação
    const updated = await prisma.conversation.update({
      where: { id: conversation.id },
      data: { patientId: patient.id }
    });

    console.log('✅ Fixed conversation:', updated.id, 'now linked to:', updated.patientId);

    return NextResponse.json({
      success: true,
      message: 'Conversation fixed successfully',
      before: {
        patientId: conversation.patientId
      },
      after: {
        patientId: updated.patientId
      },
      patient: {
        id: patient.id,
        name: patient.name
      }
    });

  } catch (error) {
    console.error('❌ Error fixing conversation:', error);
    return NextResponse.json(
      { error: 'Internal error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
