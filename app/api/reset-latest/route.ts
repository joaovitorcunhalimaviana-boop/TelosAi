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
            return NextResponse.json({ error: 'Paciente sem follow-ups' }, { status: 404 });
        }

        console.log(`🔄 Resetando questionário para ${latestPatient.name}...`);

        // 2. Apagar respostas anteriores (LIMPEZA TOTAL)
        await prisma.followUpResponse.deleteMany({
            where: { followUpId: followUp.id }
        });

        // 3. Resetar status do FollowUp
        await prisma.followUp.update({
            where: { id: followUp.id },
            data: {
                status: 'pending',
                updatedAt: new Date() // Forçar refresh
            }
        });

        // 4. Disparar mensagem inicial novamente
        await sendFollowUpQuestionnaire(followUp, latestPatient, surgery);

        return NextResponse.json({
            success: true,
            message: `Questionário resetado e reenviado para ${latestPatient.name} (${latestPatient.phone})`,
            deletedResponses: true,
            newStatus: 'pending'
        });

    } catch (error) {
        console.error('Erro no reset manual:', error);
        return NextResponse.json({
            error: 'Erro interno ao resetar',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
