import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Deleta completamente um paciente e todos os seus dados
 * GET /api/test/delete-patient?phone=5583998663089
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ error: 'Informe ?phone=NUMERO' }, { status: 400 });
    }

    const phoneDigits = phone.replace(/\D/g, '');
    const last9 = phoneDigits.slice(-9);

    const all = await prisma.patient.findMany({
      include: {
        surgeries: { include: { followUps: true } },
        conversations: true,
      }
    });

    const patient = all.find(p => {
      const d = (p.phone || '').replace(/\D/g, '');
      return d.slice(-9) === last9;
    });

    if (!patient) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }

    // Deletar respostas de follow-up
    for (const surgery of patient.surgeries) {
      for (const followUp of surgery.followUps) {
        await prisma.followUpResponse.deleteMany({ where: { followUpId: followUp.id } });
      }
      await prisma.followUp.deleteMany({ where: { surgeryId: surgery.id } });
    }

    // Deletar conversas
    await prisma.conversation.deleteMany({ where: { patientId: patient.id } });

    // Deletar cirurgias (cascade cuida do resto)
    await prisma.surgery.deleteMany({ where: { patientId: patient.id } });

    // Deletar paciente
    await prisma.patient.delete({ where: { id: patient.id } });

    return NextResponse.json({
      success: true,
      message: `✅ Paciente ${patient.name} deletado completamente`,
      details: {
        nome: patient.name,
        telefone: patient.phone,
        proximoPasso: 'Cadastre o paciente novamente no dashboard com data da cirurgia = ontem'
      }
    });

  } catch (error) {
    console.error('❌ Error deleting patient:', error);
    return NextResponse.json(
      { error: 'Erro interno', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
