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
 * ID do médico dono do sistema (Dr. João) - usa protocolo hardcoded
 * Outros médicos devem cadastrar seus próprios protocolos
 * Se não configurado, nenhum médico usa fallback hardcoded
 */
const SYSTEM_OWNER_USER_ID = process.env.SYSTEM_OWNER_USER_ID || null;

/**
 * Mensagem para quando não há protocolo cadastrado
 * A IA deve APENAS coletar dados, SEM dar orientações
 */
const NO_PROTOCOL_MESSAGE = `
═══════════════════════════════════════════════════════════════
⚠️ MODO COLETA APENAS - SEM PROTOCOLO CADASTRADO
═══════════════════════════════════════════════════════════════

Este médico NÃO cadastrou protocolo para este tipo de cirurgia.

REGRAS ESTRITAS:
1. COLETE os dados normalmente (dor, evacuação, sangramento, febre, medicação extra, etc.)
2. NÃO DÊ ORIENTAÇÕES sobre:
   - Banho de assento (não diga se deve ou não fazer)
   - Pomadas ou medicações específicas
   - Laxantes ou dieta
   - Compressas geladas ou mornas
   - Nenhuma orientação médica específica

3. Se o paciente PERGUNTAR sobre orientações:
   - Diga: "Sou uma assistente de inteligência artificial e minha função é coletar informações sobre como você está se sentindo. Para orientações específicas sobre medicações, banhos ou cuidados, por favor entre em contato diretamente com seu médico ou com o consultório."

4. ALERTAS DE URGÊNCIA continuam funcionando:
   - Se sangramento intenso → alertar para procurar emergência
   - Se febre alta → alertar para procurar atendimento
   - Se dor ≥8/10 → alertar médico

5. Seja empática e acolhedora, mas NÃO invente orientações.

═══════════════════════════════════════════════════════════════
`;

/**
 * Mensagem para pesquisa SEM protocolo - ainda mais restritiva
 */
const NO_RESEARCH_PROTOCOL_MESSAGE = `
═══════════════════════════════════════════════════════════════
🔬 MODO PESQUISA - COLETA APENAS (SEM PROTOCOLO CADASTRADO)
═══════════════════════════════════════════════════════════════

Este paciente está em uma PESQUISA CIENTÍFICA, mas não há protocolo cadastrado.

REGRAS ABSOLUTAS (pesquisa exige rigor total):
1. COLETE os dados normalmente (dor, evacuação, sangramento, febre, etc.)
2. NÃO DÊ NENHUMA ORIENTAÇÃO - absolutamente nenhuma
3. Se o paciente perguntar QUALQUER coisa sobre cuidados:
   - Diga: "Você está participando de uma pesquisa científica e eu sou uma assistente de IA responsável apenas pela coleta de dados. Qualquer orientação sobre seu tratamento deve vir diretamente do seu médico pesquisador. Por favor, entre em contato com o consultório para tirar suas dúvidas."

4. ALERTAS DE URGÊNCIA são a única exceção:
   - Sangramento intenso → alertar emergência
   - Febre alta (>38.5°C) → alertar emergência
   - Retenção urinária → alertar emergência

5. Lembre-se: em pesquisa, qualquer orientação fora do protocolo pode invalidar o estudo.

═══════════════════════════════════════════════════════════════
`;

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
 * LÓGICA ATUALIZADA:
 *
 * 1. PESQUISA (researchId existe):
 *    - Busca protocolo da pesquisa no banco
 *    - Se TEM → usa ESTRITAMENTE (não inventa nada)
 *    - Se NÃO TEM → MODO COLETA (não dá orientações, só coleta dados)
 *
 * 2. PACIENTE NORMAL (sem pesquisa):
 *    - Busca protocolo do médico no banco
 *    - Se TEM → usa normalmente
 *    - Se NÃO TEM:
 *      a) Se é o médico dono do sistema (Dr. João) → usa protocolo hardcoded
 *      b) Se é outro médico → MODO COLETA (não dá orientações)
 *
 * REGRA DE OURO: Perguntas SEMPRE são feitas (independe de protocolo).
 * Orientações SÓ são dadas se estiverem no protocolo.
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
    // ═══════════════════════════════════════════════════════════════
    // CASO 1: PACIENTE EM PESQUISA
    // ═══════════════════════════════════════════════════════════════
    if (researchId) {
      logger.info(`🔬 [PESQUISA] Buscando protocolo para pesquisa=${researchId}, surgery=${surgeryType}, D+${dayNumber}`);

      // Buscar protocolo específico da pesquisa
      const researchProtocols = await findApplicableProtocols(
        userId,
        surgeryType,
        dayNumber,
        researchId
      );

      if (researchProtocols.length > 0) {
        // TEM protocolo de pesquisa → usar ESTRITAMENTE
        logger.info(`🔬 [PESQUISA] Usando ${researchProtocols.length} protocolos da pesquisa`);

        let protocolText = formatProtocolsForPrompt(researchProtocols);
        protocolText += `\n
═══════════════════════════════════════════════════════════════
🔬 ATENÇÃO: PACIENTE EM PESQUISA CIENTÍFICA
═══════════════════════════════════════════════════════════════
- Use APENAS as orientações acima - não invente nem adicione nada
- Se algo não está no protocolo, NÃO oriente sobre isso
- Se o paciente perguntar algo fora do protocolo, peça para contatar o médico
- Rigor total é essencial para validade da pesquisa
═══════════════════════════════════════════════════════════════`;
        return protocolText;
      } else {
        // Pesquisa SEM protocolo → MODO COLETA (não orienta NADA)
        logger.warn(`🔬 [PESQUISA] ⚠️ Pesquisa ${researchId} SEM protocolo cadastrado! Modo coleta apenas.`);
        return NO_RESEARCH_PROTOCOL_MESSAGE;
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // CASO 2: PACIENTE NORMAL (não está em pesquisa)
    // ═══════════════════════════════════════════════════════════════

    // Verificar se médico tem protocolos cadastrados no banco
    const hasCustomProtocols = await doctorHasCustomProtocols(userId, surgeryType, null);

    if (hasCustomProtocols) {
      // Médico TEM protocolos cadastrados → usar os dele
      const dbProtocols = await findApplicableProtocols(
        userId,
        surgeryType,
        dayNumber,
        null // Sem pesquisa
      );

      if (dbProtocols.length > 0) {
        logger.info(`📋 [CUSTOM] Usando ${dbProtocols.length} protocolos do médico userId=${userId}`);
        return formatProtocolsForPrompt(dbProtocols);
      } else {
        // Tem protocolos mas não para este dia → orientar de forma genérica
        logger.info(`📋 [CUSTOM] Médico tem protocolos, mas não para D+${dayNumber}`);
        return `=== PROTOCOLOS DO MÉDICO ===
Este médico tem protocolos personalizados cadastrados para ${surgeryType}.
No entanto, não há orientações específicas cadastradas para o dia D+${dayNumber}.

Oriente o paciente a entrar em contato com o consultório para dúvidas específicas.
Continue coletando os dados normalmente (dor, evacuação, sangramento, etc.).`;
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // CASO 3: MÉDICO NÃO TEM PROTOCOLOS CADASTRADOS
    // ═══════════════════════════════════════════════════════════════

    // Verificar se é o médico dono do sistema (Dr. João)
    if (SYSTEM_OWNER_USER_ID && userId === SYSTEM_OWNER_USER_ID) {
      // É o Dr. João → usar protocolo hardcoded (fallback)
      logger.info(`📋 [OWNER] Médico é o dono do sistema. Usando protocolo hardcoded.`);
      return getDefaultProtocol(surgeryType);
    }

    // Outro médico sem protocolos → MODO COLETA (não dá orientações)
    logger.warn(`📋 [SEM PROTOCOLO] Médico userId=${userId} não tem protocolos de ${surgeryType}. Modo coleta apenas.`);
    return NO_PROTOCOL_MESSAGE;

  } catch (error) {
    logger.error('❌ Erro ao buscar protocolos para IA:', error);

    // Em caso de erro:
    // - Se é pesquisa → modo coleta (seguro, não vaza protocolo)
    // - Se é normal e é o dono → usa hardcoded
    // - Se é normal e outro médico → modo coleta
    if (researchId) {
      return NO_RESEARCH_PROTOCOL_MESSAGE;
    }
    if (SYSTEM_OWNER_USER_ID && userId === SYSTEM_OWNER_USER_ID) {
      return getDefaultProtocol(surgeryType);
    }
    return NO_PROTOCOL_MESSAGE;
  }
}
