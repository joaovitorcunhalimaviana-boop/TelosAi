/**
 * Pseudonimização para Pesquisas Científicas
 *
 * LGPD Art. 13, § 3º: "A comunicação ou o uso compartilhado de dados pessoais
 * de pessoa natural para fins de estudos em saúde pública [...] ou para
 * realização de estudos por órgão de pesquisa, garantida, sempre que possível,
 * a PSEUDONIMIZAÇÃO dos dados pessoais."
 *
 * Esta implementação usa hash SHA-256 determinístico para criar IDs pseudônimos:
 * - ✅ Mesmo paciente = mesmo ID em todas as exportações
 * - ✅ Re-identificação possível (com acesso ao banco de dados)
 * - ✅ Impossível reverter apenas com o ID pseudônimo
 * - ✅ Conforme LGPD para pesquisa científica
 */

import crypto from 'crypto'

/**
 * Salt secreto para pseudonimização de pesquisas
 * IMPORTANTE: Defina no .env e NUNCA compartilhe!
 *
 * Para gerar um salt seguro:
 * Node.js: crypto.randomBytes(32).toString('hex')
 * Bash: openssl rand -hex 32
 */
const RESEARCH_SALT = process.env.RESEARCH_PSEUDONYM_SALT || 'default-salt-change-me'

if (RESEARCH_SALT === 'default-salt-change-me' && process.env.NODE_ENV === 'production') {
  console.error('⚠️ RESEARCH_PSEUDONYM_SALT não configurado! Use um salt seguro em produção.')
}

/**
 * Gera um ID pseudônimo determinístico para um paciente em uma pesquisa
 *
 * O hash é calculado usando:
 * - ID do paciente (único por paciente)
 * - ID da pesquisa (isola pseudônimos por pesquisa)
 * - Salt secreto (previne ataques de rainbow table)
 *
 * @param patientId - UUID do paciente no banco de dados
 * @param researchId - UUID da pesquisa
 * @returns ID pseudônimo no formato "PSE-XXXXXXXXXXXX"
 *
 * @example
 * generatePseudonymousId("uuid-abc-123", "research-xyz-789")
 * // → "PSE-A3F2D9E8C1B5"
 *
 * // Sempre retorna o mesmo ID para o mesmo paciente + pesquisa:
 * generatePseudonymousId("uuid-abc-123", "research-xyz-789")
 * // → "PSE-A3F2D9E8C1B5" (idêntico!)
 */
export function generatePseudonymousId(
  patientId: string,
  researchId: string
): string {
  // Combina patientId + researchId + salt secreto
  const input = `${patientId}-${researchId}-${RESEARCH_SALT}`

  // Calcula hash SHA-256 (irreversível)
  const hash = crypto
    .createHash('sha256')
    .update(input)
    .digest('hex')

  // Usa apenas os primeiros 12 caracteres (suficiente para evitar colisões)
  // Com 12 hex chars = 48 bits = 281 trilhões de combinações
  const shortHash = hash.substring(0, 12).toUpperCase()

  return `PSE-${shortHash}`
}

/**
 * Interface para mapeamento entre ID pseudônimo e dados reais do paciente
 * Usado apenas no dashboard (NUNCA exportado)
 */
export interface PseudonymMapping {
  pseudonymousId: string
  patientId: string
  patientName: string
  patientPhone: string
  researchGroup: string | null
}

/**
 * Gera tabela de mapeamento completa para uma pesquisa
 *
 * IMPORTANTE: Esta função retorna dados sensíveis!
 * - ✅ Use APENAS no dashboard do pesquisador
 * - ❌ NUNCA exporte ou compartilhe esta tabela
 * - ✅ Registre acessos em logs de auditoria
 *
 * @param patients - Lista de pacientes da pesquisa
 * @param researchId - UUID da pesquisa
 * @returns Array de mapeamentos pseudônimo → dados reais
 *
 * @example
 * const mappings = generatePseudonymMappings(patients, researchId)
 * // [
 * //   {
 * //     pseudonymousId: "PSE-A3F2D9E8C1B5",
 * //     patientId: "uuid-abc-123",
 * //     patientName: "João Silva",
 * //     patientPhone: "83999999999",
 * //     researchGroup: "A"
 * //   },
 * //   ...
 * // ]
 */
export function generatePseudonymMappings(
  patients: Array<{
    id: string
    name: string
    phone: string
    researchGroup: string | null
  }>,
  researchId: string
): PseudonymMapping[] {
  return patients.map(patient => ({
    pseudonymousId: generatePseudonymousId(patient.id, researchId),
    patientId: patient.id,
    patientName: patient.name,
    patientPhone: patient.phone,
    researchGroup: patient.researchGroup,
  }))
}

/**
 * Re-identifica um paciente a partir do ID pseudônimo
 *
 * AVISO: Esta é uma operação sensível!
 * - ✅ Documente o motivo da re-identificação
 * - ✅ Registre em logs de auditoria
 * - ✅ Use apenas quando estritamente necessário
 *
 * @param pseudonymousId - ID pseudônimo (ex: "PSE-A3F2D9E8C1B5")
 * @param patients - Lista de pacientes da pesquisa
 * @param researchId - UUID da pesquisa
 * @returns Dados do paciente ou null se não encontrado
 *
 * @example
 * const patient = reidentifyPatient(
 *   "PSE-A3F2D9E8C1B5",
 *   allPatients,
 *   researchId
 * )
 *
 * if (patient) {
 *   console.log(`Re-identificado: ${patient.name}`)
 * }
 */
export function reidentifyPatient(
  pseudonymousId: string,
  patients: Array<{
    id: string
    name: string
    phone: string
  }>,
  researchId: string
): { id: string; name: string; phone: string } | null {
  // Para cada paciente, calcula o hash e compara
  for (const patient of patients) {
    const calculatedId = generatePseudonymousId(patient.id, researchId)

    if (calculatedId === pseudonymousId) {
      // ✅ Match encontrado!
      console.log(`[AUDIT] Re-identificação: ${pseudonymousId} → ${patient.name}`)
      return patient
    }
  }

  // Não encontrado
  console.warn(`[AUDIT] Re-identificação falhou: ${pseudonymousId} não encontrado`)
  return null
}

/**
 * Valida se um ID pseudônimo tem formato correto
 *
 * @param pseudonymousId - ID para validar
 * @returns true se formato válido
 *
 * @example
 * isValidPseudonymousId("PSE-A3F2D9E8C1B5") // → true
 * isValidPseudonymousId("PSE-123") // → false (muito curto)
 * isValidPseudonymousId("ABC-A3F2D9E8C1B5") // → false (prefixo errado)
 */
export function isValidPseudonymousId(pseudonymousId: string): boolean {
  // Formato: PSE- + 12 caracteres hexadecimais maiúsculos
  const pattern = /^PSE-[0-9A-F]{12}$/
  return pattern.test(pseudonymousId)
}

/**
 * Gera um salt seguro para uso em RESEARCH_PSEUDONYM_SALT
 *
 * Execute esta função UMA VEZ e coloque o resultado no .env:
 * RESEARCH_PSEUDONYM_SALT=valor_retornado_aqui
 *
 * @returns Salt hexadecimal de 64 caracteres (256 bits)
 *
 * @example
 * // No Node.js REPL ou script temporário:
 * console.log(generateSecureSalt())
 * // → "a3f2d9e8c1b5..."
 *
 * // Copie e cole no .env:
 * // RESEARCH_PSEUDONYM_SALT=a3f2d9e8c1b5...
 */
export function generateSecureSalt(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * EXEMPLO DE USO COMPLETO
 *
 * 1. CONFIGURAÇÃO INICIAL (uma vez):
 * ```typescript
 * // Gere um salt seguro
 * const salt = generateSecureSalt()
 * console.log(salt)
 *
 * // Adicione ao .env:
 * RESEARCH_PSEUDONYM_SALT=a3f2d9e8c1b5f7c4b2a1d8e6...
 * ```
 *
 * 2. NA EXPORTAÇÃO:
 * ```typescript
 * const exportData = patients.map(patient => ({
 *   pseudonymousId: generatePseudonymousId(patient.id, researchId),
 *   age: patient.age,
 *   sex: patient.sex,
 *   // ... outros dados clínicos
 * }))
 * // Exporta para Excel/CSV - seguro para publicação!
 * ```
 *
 * 3. NO DASHBOARD (tabela de mapeamento):
 * ```typescript
 * const mappings = generatePseudonymMappings(patients, researchId)
 * // Mostra: PSE-XXX → Nome Real + Telefone
 * // APENAS para você (pesquisador)
 * ```
 *
 * 4. RE-IDENTIFICAÇÃO (quando necessário):
 * ```typescript
 * const patient = reidentifyPatient(
 *   "PSE-A3F2D9E8C1B5",
 *   allPatients,
 *   researchId
 * )
 *
 * if (patient) {
 *   console.log(`Preciso confirmar NPS com: ${patient.name}`)
 *   console.log(`Telefone: ${patient.phone}`)
 * }
 * ```
 */
