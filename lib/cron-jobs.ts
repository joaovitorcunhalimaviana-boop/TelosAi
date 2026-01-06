import { prisma } from '@/lib/prisma';
import { sendFollowUpQuestionnaire, isWhatsAppConfigured, sendEmpatheticResponse, sendDoctorAlert } from '@/lib/whatsapp';
import { toBrasiliaTime, fromBrasiliaTime } from '@/lib/date-utils';
import { logger } from '@/lib/logger';

/**
 * Envia follow-ups agendados para hoje (10:00 BRT)
 */
export async function sendScheduledFollowUps() {
    try {
        // Verificar se WhatsApp está configurado
        if (!isWhatsAppConfigured()) {
            logger.error('WhatsApp not configured');
            return { success: false, error: 'WhatsApp not configured' };
        }

        logger.debug('Starting follow-up sender...');

        // Data de hoje no horário de Brasília (início e fim do dia)
        const nowInBrazil = toBrasiliaTime(new Date());
        nowInBrazil.setHours(0, 0, 0, 0);

        // Converter para UTC para comparar com o banco
        const today = fromBrasiliaTime(nowInBrazil);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Buscar follow-ups pendentes para hoje
        const pendingFollowUps = await prisma.followUp.findMany({
            where: {
                status: 'pending',
                scheduledDate: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            include: {
                patient: true,
                surgery: true,
            },
            orderBy: {
                scheduledDate: 'asc',
            },
        });

        logger.debug(`Found ${pendingFollowUps.length} pending follow-ups for today`);

        const results = {
            total: pendingFollowUps.length,
            sent: 0,
            failed: 0,
            errors: [] as Array<{ patientId: string; error: string }>,
        };

        // Processar cada follow-up
        for (const followUp of pendingFollowUps) {
            try {
                logger.debug(`Sending follow-up D+${followUp.dayNumber} to patient ${followUp.patient.name}`);

                // Validar se paciente tem telefone válido
                if (!followUp.patient.phone) {
                    throw new Error('Patient has no phone number');
                }

                // Enviar questionário via WhatsApp
                await sendFollowUpQuestionnaire(
                    followUp,
                    followUp.patient,
                    followUp.surgery
                );

                // Atualizar status para 'sent'
                await prisma.followUp.update({
                    where: { id: followUp.id },
                    data: {
                        status: 'sent',
                        sentAt: new Date(),
                    },
                });

                results.sent++;
                logger.debug(`Follow-up sent successfully to ${followUp.patient.name}`);

                // Delay para evitar rate limiting (500ms entre mensagens)
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                logger.error(`Error sending follow-up to patient ${followUp.patient.name}:`, error);

                results.failed++;
                results.errors.push({
                    patientId: followUp.patientId,
                    error: String(error),
                });

                await incrementFailureAttempt(followUp.id);
            }
        }

        // Verificar follow-ups atrasados
        await checkOverdueFollowUps();

        // Verificar follow-ups parados (Nudge)
        await checkStalledFollowUps();

        return { success: true, results };

    } catch (error) {
        logger.error('Error in sendScheduledFollowUps:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Realiza backup do banco de dados no Neon
 */
export async function performDatabaseBackup() {
    try {
        const neonApiKey = process.env.NEON_API_KEY;
        const neonProjectId = process.env.NEON_PROJECT_ID;

        if (!neonApiKey || !neonProjectId) {
            throw new Error('NEON_API_KEY ou NEON_PROJECT_ID não configurados');
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const branchName = `backup-${timestamp}`;

        logger.debug(`📸 Criando branch de backup: ${branchName}`);

        const createBranchResponse = await fetch(
            `https://console.neon.tech/api/v2/projects/${neonProjectId}/branches`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${neonApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    branch: {
                        name: branchName,
                    },
                }),
            }
        );

        if (!createBranchResponse.ok) {
            if (createBranchResponse.status === 409) {
                return { success: true, message: 'Backup already exists today' };
            }
            const errorText = await createBranchResponse.text();
            throw new Error(`Failed to create backup branch: ${errorText}`);
        }

        const branchData = await createBranchResponse.json();

        // Limpar backups antigos (7 dias)
        await cleanupOldBackups(neonApiKey, neonProjectId);

        return {
            success: true,
            message: 'Backup created successfully',
            branchId: branchData.branch?.id
        };

    } catch (error) {
        logger.error('Error performing database backup:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Limpa backups antigos (privado)
 */
async function cleanupOldBackups(apiKey: string, projectId: string) {
    try {
        const listBranchesResponse = await fetch(
            `https://console.neon.tech/api/v2/projects/${projectId}/branches`,
            {
                headers: { 'Authorization': `Bearer ${apiKey}` },
            }
        );

        if (listBranchesResponse.ok) {
            const branchesData = await listBranchesResponse.json();
            const backupBranches = branchesData.branches.filter((b: any) =>
                b.name.startsWith('backup-')
            );

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const branchesToDelete = backupBranches.filter((b: any) => {
                const branchDate = new Date(b.created_at);
                return branchDate < sevenDaysAgo;
            });

            for (const branch of branchesToDelete) {
                await fetch(
                    `https://console.neon.tech/api/v2/projects/${projectId}/branches/${branch.id}`,
                    {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${apiKey}` },
                    }
                );
            }
        }
    } catch (error) {
        logger.error('Error cleaning up backups:', error);
    }
}

async function incrementFailureAttempt(followUpId: string) {
    try {
        const followUp = await prisma.followUp.findUnique({
            where: { id: followUpId },
        });

        if (!followUp) return;

        // TODO: Implementar metadata field no schema posteriormente se necessário
        // Por enquanto, apenas loga a falha repetida

    } catch (error) {
        logger.error('Error incrementing failure attempt:', error);
    }
}

async function checkOverdueFollowUps() {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(23, 59, 59, 999);

        const overdueFollowUps = await prisma.followUp.findMany({
            where: {
                status: { in: ['pending', 'sent'] },
                scheduledDate: { lt: yesterday },
            },
        });

        for (const followUp of overdueFollowUps) {
            await prisma.followUp.update({
                where: { id: followUp.id },
                data: { status: 'overdue' },
            });
        }

        if (overdueFollowUps.length > 0) {
            logger.debug(`Marked ${overdueFollowUps.length} follow-ups as overdue`);
        }

    } catch (error) {
        logger.error('Error checking overdue follow-ups:', error);
    }
}

/**
 * Verifica follow-ups parados (sem resposta há muito tempo)
 * - > 3 horas: Envia lembrete (Nudge)
 * - > 12 horas: Avisa o médico
 */
export async function checkStalledFollowUps() {
    try {
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

        // Buscar follow-ups em progresso sem atividade recente
        const stalledFollowUps = await prisma.followUp.findMany({
            where: {
                status: 'in_progress',
                updatedAt: {
                    lt: threeHoursAgo
                }
            },
            include: {
                patient: true,
                surgery: true,
                responses: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        logger.info(`🔍 Found ${stalledFollowUps.length} stalled follow-ups`);

        for (const followUp of stalledFollowUps) {
            try {
                const lastResponse = followUp.responses[0];
                if (!lastResponse) continue;

                // Parse da conversa para verificar última mensagem
                const questionnaireData = JSON.parse(lastResponse.questionnaireData || '{}');
                const conversation = questionnaireData.conversation || [];

                if (conversation.length === 0) continue;

                const lastMessage = conversation[conversation.length - 1];

                // Se a última mensagem já foi do assistente (nós), verificar se foi um nudge
                if (lastMessage.role === 'assistant') {
                    // Se já mandamos nudge, não mandar de novo (evitar spam)
                    if (lastMessage.content.includes('esqueceu') || lastMessage.content.includes('ainda está aí')) {
                        // Se já passou 12 horas e médico não foi avisado -> AVISAR MÉDICO
                        if (followUp.updatedAt < twelveHoursAgo && !lastResponse.doctorAlerted) {
                            await sendDoctorAlert(
                                `⚠️ *PACIENTE SEM RESPOSTA*\n\nO paciente ${followUp.patient.name} parou de responder o questionário há mais de 12 horas.\nÚltima interação: ${followUp.updatedAt.toLocaleString('pt-BR')}`
                            );

                            // Marcar que médico foi avisado
                            await prisma.followUpResponse.update({
                                where: { id: lastResponse.id },
                                data: { doctorAlerted: true }
                            });

                            logger.info(`🚨 Doctor alerted for stalled patient ${followUp.patient.name}`);
                        }
                        continue;
                    }
                }

                // Enviar Nudge (Lembrete)
                const firstName = followUp.patient.name.split(' ')[0];
                const nudgeMessage = `Olá ${firstName}, ainda está aí? 👀\n\nNotei que não terminamos o seu acompanhamento de hoje. É muito importante para o Dr. João saber como você está.\n\nPodemos continuar?`;

                await sendEmpatheticResponse(followUp.patient.phone, nudgeMessage);

                // Atualizar histórico da conversa no banco (sem mudar updatedAt do FollowUp para não resetar o timer de 12h? 
                // NÃO, se mandamos nudge, "tocamos" no paciente. Mas se atualizarmos updatedAt, o timer de 12h reseta.
                // Mas queremos alertar médico se continuar parado.
                // Vamos atualizar updatedAt para refletir que o BOT falou. E o próximo check vai ver se o paciente respondeu.
                // Se o paciente não responder, updatedAt fica estagnado nesse horário do nudge.
                // Daqui a 12 horas a partir DO NUDGE, avisamos o médico. Aceitável.

                conversation.push({ role: 'assistant', content: nudgeMessage });

                await prisma.followUpResponse.update({
                    where: { id: lastResponse.id },
                    data: {
                        questionnaireData: JSON.stringify({
                            ...questionnaireData,
                            conversation
                        })
                    }
                });

                // Forçar update do FollowUp para registrar atividade do bot
                await prisma.followUp.update({
                    where: { id: followUp.id },
                    data: { updatedAt: new Date() }
                });

                logger.info(`👋 Nudge sent to ${followUp.patient.name}`);

            } catch (innerError) {
                logger.error(`Error processing stalled follow-up ${followUp.id}:`, innerError);
            }
        }

    } catch (error) {
        logger.error('Error checking stalled follow-ups:', error);
    }
}

/**
 * Renova token do WhatsApp Automaticamente
 */
export async function renewWhatsAppToken() {
    try {
        const APP_ID = process.env.WHATSAPP_APP_ID;
        const APP_SECRET = process.env.WHATSAPP_APP_SECRET;
        const CURRENT_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

        if (!APP_ID || !APP_SECRET || !CURRENT_TOKEN) {
            throw new Error('Missing WhatsApp credentials');
        }

        // Renovar token
        const renewalUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${CURRENT_TOKEN}`;

        const response = await fetch(renewalUrl, { method: 'GET' });

        if (!response.ok) {
            const error = await response.json();
            await notifyAdminError(error);
            throw new Error(`Token renewal failed: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        const expiresInDays = Math.floor(data.expires_in / 86400);

        // Salvar no banco
        await prisma.systemConfig.upsert({
            where: { key: 'WHATSAPP_ACCESS_TOKEN' },
            update: { value: data.access_token },
            create: { key: 'WHATSAPP_ACCESS_TOKEN', value: data.access_token }
        });

        logger.info(`✅ Token renewed successfully - Expires in ${expiresInDays} days`);

        return {
            success: true,
            expiresInDays,
            message: 'Token renewed and saved'
        };

    } catch (error) {
        logger.error('Error renewing WhatsApp token:', error);
        return { success: false, error: String(error) };
    }
}

async function notifyAdminError(error: any) {
    try {
        const DOCTOR_PHONE = process.env.DOCTOR_PHONE_NUMBER;
        const CURRENT_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
        const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (!DOCTOR_PHONE || !CURRENT_TOKEN || !PHONE_NUMBER_ID) return;

        const message = `🚨 ERRO NA RENOVAÇÃO DO TOKEN WHATSAPP\n\nErro: ${JSON.stringify(error)}`;

        await fetch(
            `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CURRENT_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: DOCTOR_PHONE,
                    type: 'text',
                    text: { body: message },
                }),
            }
        );
    } catch (notifError) {
        logger.error('Failed to send error notification:', notifError);
    }
}
