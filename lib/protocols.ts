import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface ApplicableProtocol {
    title: string;
    content: string;
    category: string;
    priority: number;
}

/**
 * Busca protocolos ativos aplicáveis para um paciente específico
 * Baseado em:
 * 1. Médico responsável (userId)
 * 2. Tipo de cirurgia
 * 3. Dia de pós-operatório (dayRange)
 * 4. Status ativo
 */
export async function findApplicableProtocols(
    userId: string,
    surgeryType: string,
    dayNumber: number,
    researchId?: string | null
): Promise<ApplicableProtocol[]> {
    try {
        logger.debug('🔍 Buscando protocolos aplicáveis', {
            userId,
            surgeryType,
            dayNumber,
            researchId
        });

        // Mapear tipos de cirurgia se necessário (ex: normalizar nomes)
        const normalizedSurgeryType = surgeryType.toLowerCase();

        // MODO PESQUISA RÍGIDO:
        // Se o paciente está em pesquisa, SÓ vê protocolos daquela pesquisa.
        // Se não está, SÓ vê protocolos genéricos (researchId: null).
        const researchFilter = researchId ? { researchId: researchId } : { researchId: null };

        const protocols = await prisma.protocol.findMany({
            where: {
                userId: userId,
                isActive: true,
                surgeryType: normalizedSurgeryType,
                dayRangeStart: { lte: dayNumber },
                OR: [
                    { dayRangeEnd: null }, // Protocolo contínuo a partir do dia X
                    { dayRangeEnd: { gte: dayNumber } } // Protocolo dentro do intervalo
                ],
                ...researchFilter
            },
            orderBy: {
                priority: 'desc' // Prioridade maior primeiro
            },
            select: {
                title: true,
                content: true,
                category: true,
                priority: true
            }
        });

        logger.debug(`✅ Encontrados ${protocols.length} protocolos para D+${dayNumber}`);

        return protocols;

    } catch (error) {
        logger.error('❌ Erro ao buscar protocolos:', error);
        return [];
    }
}

/**
 * Formata os protocolos em texto para injeção no prompt da IA
 */
export function formatProtocolsForPrompt(protocols: ApplicableProtocol[]): string {
    if (protocols.length === 0) {
        return "NENHUM PROTOCOLO ESPECÍFICO ENCONTRADO. Não dê orientações médicas.";
    }

    let promptText = "=== PROTOCOLOS MÉDICOS APROVADOS (FONTE ÚNICA DE VERDADE) ===\n";
    promptText += "Você SÓ pode dar orientações que estejam EXPLICITAMENTE escritas abaixo.\n\n";

    protocols.forEach((p, index) => {
        promptText += `--- PROTOCOLO ${index + 1}: ${p.title.toUpperCase()} (${p.category}) ---\n`;
        promptText += `${p.content}\n\n`;
    });

    return promptText;
}
