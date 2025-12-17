import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { sendDoctorAlert } from '@/lib/whatsapp';

/**
 * Verifica follow-ups que estão pendentes há muito tempo (6 horas)
 * e alerta o médico responsável.
 */
export async function checkAndAlertDoctor() {
    try {
        logger.debug('🕵️ Iniciando verificação de alertas para o médico...');

        // Limite de 6 horas atrás
        const sixHoursAgo = new Date();
        sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

        // Buscar follow-ups que:
        // 1. Foram enviados (sent) ou estão em progresso (in_progress)
        // 2. Foram criados/atualizados ANTES de 6 horas atrás (estão atrasados)
        // 3. Ainda NÃO alertaram o médico (doctorAlerted = false)
        const stalledFollowUps = await prisma.followUpResponse.findMany({
            where: {
                doctorAlerted: false,
                createdAt: {
                    lt: sixHoursAgo
                },
                // Apenas respostas que ainda não foram "concluídas" ou analisadas
                followUp: {
                    status: {
                        in: ['sent', 'in_progress']
                    }
                }
            },
            include: {
                followUp: {
                    include: {
                        patient: true,
                        surgery: true
                    }
                }
            }
        });

        if (stalledFollowUps.length === 0) {
            logger.debug('✅ Nenhum paciente atrasado encontrado.');
            return;
        }

        logger.info(`🚨 Encontrados ${stalledFollowUps.length} pacientes sem resposta completa há > 6h.`);

        for (const response of stalledFollowUps) {
            const patient = response.followUp.patient;
            const hoursDelayed = Math.floor((new Date().getTime() - response.createdAt.getTime()) / (1000 * 60 * 60));

            const message = `⚠️ *ALERTA DE FALTA DE RESPOSTA*\n\n` +
                `O paciente *${patient.name}* (D+${response.followUp.dayNumber}) iniciou o questionário há ${hoursDelayed} horas mas não concluiu.\n\n` +
                `Status: ${response.followUp.status}\n` +
                `Última interação: ${response.updatedAt.toLocaleTimeString('pt-BR')}`;

            // Enviar alerta para o médico
            await sendDoctorAlert(message);

            // Marcar como alertado para não spactar
            await prisma.followUpResponse.update({
                where: { id: response.id },
                data: { doctorAlerted: true }
            });

            logger.info(`✅ Médico alertado sobre ${patient.name}`);
        }

    } catch (error) {
        logger.error('❌ Erro ao verificar alertas médicos:', error);
    }
}
