import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Reseta paciente para D+1 (como se a cirurgia fosse ontem)
 * Útil para testar o fluxo conversacional do zero
 *
 * GET /api/debug/reset-to-day1
 * GET /api/debug/reset-to-day1?phone=5583991664904  (opcional, se não passado usa o único paciente ativo)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    // Buscar paciente
    let patient;

    if (phone) {
      const phoneDigits = phone.replace(/\D/g, '');
      const last9 = phoneDigits.slice(-9);
      const all = await prisma.patient.findMany({
        include: { surgeries: { include: { followUps: true } } }
      });
      patient = all.find(p => {
        const d = (p.phone || '').replace(/\D/g, '');
        return d.slice(-9) === last9;
      });
    } else {
      // Pegar o único paciente com cirurgia ativa
      const all = await prisma.patient.findMany({
        include: {
          surgeries: {
            where: { status: { in: ['active', 'completed'] } },
            include: { followUps: true },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });
      // Filtrar quem tem cirurgia
      const withSurgery = all.filter(p => p.surgeries.length > 0);
      if (withSurgery.length === 1) {
        patient = withSurgery[0];
      } else if (withSurgery.length > 1) {
        return NextResponse.json({
          error: 'Mais de um paciente encontrado. Passe ?phone=NUMERO para especificar.',
          patients: withSurgery.map(p => ({ name: p.name, phone: p.phone }))
        }, { status: 400 });
      }
    }

    if (!patient) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }

    const surgery = patient.surgeries[0];
    if (!surgery) {
      return NextResponse.json({ error: 'Cirurgia não encontrada' }, { status: 404 });
    }

    // Calcular ontem no horário de Brasília
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    // Manter hora 08:00 para simular cirurgia de manhã
    yesterday.setHours(8, 0, 0, 0);

    // 1. Atualizar data da cirurgia para ontem
    await prisma.surgery.update({
      where: { id: surgery.id },
      data: {
        date: yesterday,
        // Limpar dados de evacuação para testar do zero
        hadFirstBowelMovement: false,
        firstBowelMovementDate: null,
        firstBowelMovementDay: null,
        firstBowelMovementTime: null,
      }
    });

    // 2. Resetar todos os follow-ups: status, datas e scheduledDate recalculado
    for (const followUp of surgery.followUps) {
      // Recalcular scheduledDate com base na nova data da cirurgia
      const newScheduledDate = new Date(yesterday);
      newScheduledDate.setDate(newScheduledDate.getDate() + followUp.dayNumber);
      newScheduledDate.setHours(10, 0, 0, 0); // 10h horário local

      await prisma.followUp.update({
        where: { id: followUp.id },
        data: {
          status: 'pending',
          sentAt: null,
          respondedAt: null,
          scheduledDate: newScheduledDate,
        }
      });

      // Deletar respostas
      await prisma.followUpResponse.deleteMany({
        where: { followUpId: followUp.id }
      });
    }

    // 3. Deletar conversas (limpar memória)
    await prisma.conversation.deleteMany({
      where: { patientId: patient.id }
    });

    return NextResponse.json({
      success: true,
      message: `✅ ${patient.name} resetado para D+1`,
      details: {
        patient: patient.name,
        phone: patient.phone,
        novaSurgeryDate: yesterday.toISOString(),
        followUpsResetados: surgery.followUps.length,
        conversasApagadas: true,
        evacuacaoReset: true,
        proximoPasso: 'Chame /api/debug/trigger-followup ou aguarde o cron para receber o acompanhamento D+1 no WhatsApp'
      }
    });

  } catch (error) {
    console.error('❌ Error resetting to day1:', error);
    return NextResponse.json(
      { error: 'Erro interno', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
