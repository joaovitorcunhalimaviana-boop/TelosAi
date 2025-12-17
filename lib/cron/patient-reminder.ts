import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { sendEmpatheticResponse } from '@/lib/whatsapp';

/**
 * Verifica follow-ups parados e envia lembrete suave para o paciente
 */
export async function checkAndRemindPatient() {
    try {
        logger.debug('🕵️ Iniciando verificação de lembretes para pacientes...');

        // Limite de 4 horas atrás
        const fourHoursAgo = new Date();
        fourHoursAgo.setHours(fourHoursAgo.getHours() - 4);

        // Buscar conversas paradas
        const stalledFollowUps = await prisma.followUp.findMany({
            where: {
                status: { in: ['sent', 'in_progress'] },
                updatedAt: {
                    lt: fourHoursAgo
                },
                // Evitar spam: adicionar flag de 'reminded' no futuro se necessário
                // Por enquanto, baseia-se no updatedAt. Se atualizarmos o updatedAt ao enviar lembrete, funciona.
            },
            include: {
                patient: true
            }
        });

        for (const followUp of stalledFollowUps) {
            // Verificar se já enviamos lembrete hoje (opcional, simplificado aqui)

            const firstName = followUp.patient.name.split(' ')[0];
            const message = `Olá ${firstName}, tudo bem? 😊\n\n` +
                `Percebi que não terminamos seu check-in de hoje.\n` +
                `É muito importante para sua recuperação que você responda as perguntas.\n\n` +
                `Podemos continuar? Basta responder aqui!`;

            await sendEmpatheticResponse(followUp.patient.phone, message);

            // Atualizar updatedAt para não enviar de novo na próxima hora
            await prisma.followUp.update({
                where: { id: followUp.id },
                data: { updatedAt: new Date() } // "Empurra" o próximo lembrete para +4h
            });

            logger.info(`✅ Lembrete enviado para ${followUp.patient.name}`);
        }

    } catch (error) {
        logger.error('❌ Erro ao enviar lembretes:', error);
    }
}
