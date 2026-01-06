import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendFollowUpQuestionnaire } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Buscar o paciente mais recente
        const latestPatient = await prisma.patient.findFirst({
            orderBy: { createdAt: 'desc' },
            include: {
                surgeries: {
                    include: {
                        followUps: {
                            where: { status: 'pending' },
                            orderBy: { dayNumber: 'asc' },
                            take: 1
                        }
                    }
                }
            }
        });

        if (!latestPatient) {
            return NextResponse.json({ error: 'Nenhum paciente encontrado' }, { status: 404 });
        }

        const surgery = latestPatient.surgeries[0];
        if (!surgery) {
            return NextResponse.json({ error: 'Paciente sem cirurgia' }, { status: 404 });
        }

        const followUp = surgery.followUps[0];
        if (!followUp) {
            return NextResponse.json({
                error: 'Paciente não tem follow-ups pendentes',
                patient: latestPatient.name
            }, { status: 404 });
        }

        // 2. Disparar mensagem
        console.log(`🚀 Disparando teste manual para ${latestPatient.name} (${latestPatient.phone})...`);

        await sendFollowUpQuestionnaire(followUp, latestPatient, surgery);

        return NextResponse.json({
            success: true,
            message: `Mensagem enviada para ${latestPatient.name}`,
            phone: latestPatient.phone,
            day: followUp.dayNumber,
            followUpId: followUp.id
        });

    } catch (error) {
        console.error('Erro no teste manual:', error);
        return NextResponse.json({
            error: 'Erro interno',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
