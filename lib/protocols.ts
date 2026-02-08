import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { getProtocolForSurgery as getDefaultProtocol } from './protocols/hemorroidectomia-protocol';

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

/**
 * Verifica RAPIDAMENTE se um médico tem protocolos cadastrados para um tipo de cirurgia
 * Usa count() que é mais rápido que findMany()
 */
async function doctorHasCustomProtocols(
  userId: string,
  surgeryType: string,
  researchId?: string | null
): Promise<boolean> {
  const normalizedSurgeryType = surgeryType.toLowerCase();
  const researchFilter = researchId ? { researchId: researchId } : { researchId: null };

  const count = await prisma.protocol.count({
    where: {
      userId: userId,
      isActive: true,
      surgeryType: normalizedSurgeryType,
      ...researchFilter
    }
  });

  return count > 0;
}

/**
 * Busca protocolos para injetar na IA
 *
 * LÓGICA DE ISOLAMENTO ESTRITO:
 * 1. Verifica SE o médico tem QUALQUER protocolo cadastrado para esse tipo de cirurgia
 * 2. Se TEM → usa APENAS os protocolos dele (NUNCA fallback!)
 * 3. Se NÃO TEM NENHUM → aí sim usa o fallback hardcoded
 *
 * IMPORTANTE: Se Dra. Patrícia cadastrou protocolo de hemorroida,
 * NUNCA misturar com o protocolo base do Dr. João!
 *
 * @param userId - ID do médico responsável pelo paciente
 * @param surgeryType - Tipo de cirurgia (hemorroidectomia, fissura, etc)
 * @param dayNumber - Dia pós-operatório (D+N)
 * @param researchId - ID da pesquisa (opcional, para protocolos específicos de pesquisa)
 */
export async function getProtocolsForAI(
  userId: string,
  surgeryType: string,
  dayNumber: number,
  researchId?: string | null
): Promise<string> {
  try {
    // 1. VERIFICAÇÃO RÁPIDA: médico tem protocolos personalizados?
    const hasCustomProtocols = await doctorHasCustomProtocols(userId, surgeryType, researchId);

    if (hasCustomProtocols) {
      // 2A. MÉDICO TEM PROTOCOLOS PRÓPRIOS → usar APENAS os dele, NUNCA fallback!
      const dbProtocols = await findApplicableProtocols(
        userId,
        surgeryType,
        dayNumber,
        researchId
      );

      if (dbProtocols.length > 0) {
        logger.info(`📋 [CUSTOM] Usando ${dbProtocols.length} protocolos do médico userId=${userId} para ${surgeryType} D+${dayNumber}`);
        return formatProtocolsForPrompt(dbProtocols);
      } else {
        // Médico TEM protocolos, mas não para este dia específico
        // NÃO usar fallback! Retornar mensagem apropriada
        logger.info(`📋 [CUSTOM] Médico userId=${userId} tem protocolos de ${surgeryType}, mas nenhum para D+${dayNumber}`);
        return `=== PROTOCOLOS DO MÉDICO ===
Este médico tem protocolos personalizados cadastrados para ${surgeryType}.
No entanto, não há orientações específicas cadastradas para o dia D+${dayNumber}.

Para orientações gerais, siga as boas práticas de pós-operatório.
Em caso de dúvida, oriente o paciente a entrar em contato com o consultório.`;
      }
    } else {
      // 2B. MÉDICO NÃO TEM PROTOCOLOS → usar fallback hardcoded (protocolo base)
      logger.info(`📋 [FALLBACK] Médico userId=${userId} não tem protocolos de ${surgeryType}. Usando protocolo base.`);
      return getDefaultProtocol(surgeryType);
    }

  } catch (error) {
    logger.error('❌ Erro ao buscar protocolos para IA:', error);
    // Em caso de erro de banco, usar fallback para não travar
    return getDefaultProtocol(surgeryType);
  }
}
