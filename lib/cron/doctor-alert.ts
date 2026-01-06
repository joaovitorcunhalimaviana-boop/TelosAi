import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { sendWhatsAppToDoctor } from '@/lib/whatsapp';

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
                        surgery: {
                            include: {
                                user: true // Incluir dados do médico para pegar telefone
                            }
                        }
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
            const doctor = response.followUp.surgery.user;
            const hoursDelayed = Math.floor((new Date().getTime() - response.createdAt.getTime()) / (1000 * 60 * 60));

            const message = `⚠️ *ALERTA DE FALTA DE RESPOSTA*\n\n` +
                `O paciente *${patient.name}* (D+${response.followUp.dayNumber}) iniciou o questionário há ${hoursDelayed} horas mas não concluiu.\n\n` +
                `Status: ${response.followUp.status}\n` +
                `Última interação: ${response.createdAt.toLocaleTimeString('pt-BR')}`;

            // Prioridade: Telefone do médico (whatsapp > whatsappNumber) > Env Var
            const doctorPhoneCandidate = doctor.whatsapp || doctor.whatsappNumber || process.env.DOCTOR_PHONE_NUMBER;
            const doctorPhone = doctorPhoneCandidate ? String(doctorPhoneCandidate).trim() : null;

            if (doctorPhone) {
                logger.info(`📱 Enviando alerta para médico via ${doctorPhone} sobre paciente ${patient.name}`);
                const sent = await sendWhatsAppToDoctor(doctorPhone, message);

                if (sent) {
                    logger.info(`✅ Médico alertado com sucesso sobre ${patient.name}`);
                } else {
                    logger.error(`❌ Falha ao enviar WhatsApp de alerta para ${doctorPhone}`);
                }
            } else {
                logger.error(`❌ CRÍTICO: Não foi possível alertar médico sobre ${patient.name}. Nenhum telefone encontrado (DB ou ENV).`);
            }

            // Marcar como alertado para não spactar
            await prisma.followUpResponse.update({
                where: { id: response.id },
                data: { doctorAlerted: true }
            });
        }

    } catch (error) {
        logger.error('❌ Erro ao verificar alertas médicos:', error);
    }
}
