
import { PrismaClient } from '@prisma/client';
import { sendFollowUpQuestionnaire } from '../lib/whatsapp';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function resetAndResend() {
    console.log('🚀 Iniciando reset e reenvio...');

    try {
        // 1. Encontrar o único paciente (ou o primeiro)
        const patient = await prisma.patient.findFirst({
            include: {
                surgeries: {
                    include: {
                        followUps: true
                    }
                }
            }
        });

        if (!patient) {
            console.error('❌ Nenhum paciente encontrado no banco.');
            return;
        }

        console.log(`👤 Paciente encontrado: ${patient.name} (${patient.phone})`);

        // 2. Limpar dados de conversa e respostas
        console.log('🧹 Limpando dados antigos...');

        // Deleta conversas (chat history)
        const deletedConversations = await prisma.conversation.deleteMany({
            where: { patientId: patient.id }
        });
        console.log(`   - ${deletedConversations.count} mensagens de conversa deletadas.`);

        // Para cada cirurgia e follow-up, limpar respostas e resetar status
        for (const surgery of patient.surgeries) {
            for (const followUp of surgery.followUps) {
                // Deleta respostas do questionário
                const deletedResponses = await prisma.followUpResponse.deleteMany({
                    where: { followUpId: followUp.id }
                });

                if (deletedResponses.count > 0) {
                    console.log(`   - ${deletedResponses.count} respostas do questionário (FollowUp ID: ${followUp.id}) deletadas.`);
                }

                // Reseta status do FollowUp
                await prisma.followUp.update({
                    where: { id: followUp.id },
                    data: {
                        status: 'pending',
                        sentAt: null,
                        respondedAt: null
                    }
                });
                console.log(`   - FollowUp (Dia ${followUp.dayNumber}) resetado para 'pending'.`);
            }
        }

        // 3. Reenviar o FollowUp de hoje
        // Assumindo que queremos reenviar o follow-up que deveria ser enviado hoje (ou o mais recente)
        // Vamos pegar o follow-up pendente com dayNumber correto. 
        // Como simplificação, pegamos o primeiro pendente ou o correspondente ao dia de hoje se soubermos a data da cirurgia.
        // Mas o usuário pediu "envie novamente pro paciente o follow-up". Provavelmente é o de hoje.

        // Vamos pegar a cirurgia mais recente
        const surgery = patient.surgeries[0]; // Simplificação: pega a primeira cirurgia
        if (!surgery) {
            console.log('❌ Nenhuma cirurgia encontrada.');
            return;
        }

        // Calcular dia de hoje com base na data da cirurgia
        const today = new Date();
        const surgeryDate = new Date(surgery.date);
        const diffTime = Math.abs(today.getTime() - surgeryDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Nota: diffDays pode ser aproximado dependendo do fuso.

        // Vamos reenviar o dia 1 ou o dia atual? O usuário disse "reenvie o follow-up".
        // Vamos achar o follow-up correspondente ao "hoje" ou o próximo pendente.
        // Se o user quer testar, geralmente é o Dia 1. Mas vamos ver qual follow-up existe.

        const targetFollowUp = surgery.followUps.find(f => f.status === 'pending'); // Pega o primeiro pendente

        if (targetFollowUp) {
            console.log(`📤 Reenviando FollowUp do Dia ${targetFollowUp.dayNumber}...`);

            await sendFollowUpQuestionnaire(targetFollowUp, patient, surgery);

            // Atualiza status para sent
            await prisma.followUp.update({
                where: { id: targetFollowUp.id },
                data: {
                    status: 'sent',
                    sentAt: new Date()
                }
            });

            console.log('✅ Mensagem enviada com sucesso!');
        } else {
            console.log('⚠️ Nenhum FollowUp pendente encontrado para enviar.');
        }

    } catch (error: any) {
        console.error('❌ Erro Fatal:', error);
        if (error.response) {
            console.error('Dados da resposta de erro:', JSON.stringify(error.response.data, null, 2));
        }
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

resetAndResend();

